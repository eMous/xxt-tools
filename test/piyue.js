// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      2024-01-22
// @description  try to take over the world!
// @author       You
// @match        https://mooc2-ans.chaoxing.com/mooc2-ans/work/review/question*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chaoxing.com
// @resource template file://C:\Users\tom\Desktop\xxt-tools\test\index_template.html
// @resource piyue_css file://C:\Users\tom\Desktop\xxt-tools\test\piyue.css
// @resource piyue_js file://C:\Users\tom\Desktop\xxt-tools\test\piyue.js
// @grant        GM_getResourceText
// ==/UserScript==

window.onload = function () {
  (function () {
    "use strict";
    window.t_comment_keys = "qwerasdfzxcvtyuighjkbnmopl";
    console.log(window.GM_info);
    let debug = !GM_info;
    if (debug) {
      // tested in xxt-tools
      // 异步加载拿到 index_template.html 的内容
      let xhr = new XMLHttpRequest();
      xhr.open("GET", "index_template.html", true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
          init(xhr.responseText);
        }
      };
      xhr.send();
    } else {
      // used in tampermonkey
      let cssstr = GM_getResourceText("piyue_css");
      _addCss(cssstr);
      let htmlstr = GM_getResourceText("template");
      init(htmlstr);
    }

    function _addCss(cssstr) {
      let style = document.createElement("style");
      // style.type = "text/css";
      if (style.styleSheet) {
        // This is required for IE8 and below.
        style.styleSheet.cssText = cssstr;
      } else {
        style.appendChild(document.createTextNode(cssstr));
      }
      document.head.appendChild(style);
    }
    function init(htmlstr) {
      injectDOM(htmlstr);
      listenerStuff();
      initGlobal();
      initLocalData();
    }
    function initGlobal() {
      window.t_fid = document.body.querySelector("#mfid").getAttribute("value");
      window.t_clazzid = document.body
        .querySelector("#clazzid")
        .getAttribute("value");
      window.t_courseid = document.body
        .querySelector("#courseid")
        .getAttribute("value");
      window.t_questionid = document.body
        .querySelector("#questionid")
        .getAttribute("value");
      window.t_clazzname = null;
      {
        let iframe = document.createElement("iframe");
        iframe.src = `https://mobilelearn.chaoxing.com/v2/apis/class/getClassList?fid=${window.t_fid}&courseId=${window.t_courseid}`; // 你想要加载的网页的 URL
        console.log(iframe.src);
        iframe.width = "500"; // iframe 的宽度
        iframe.height = "500"; // iframe 的高度
        console.log(iframe)
        debugger
        document.body.appendChild(iframe); // 将 iframe 添加到 body 元素


// todo 拿不到因为不同源


        // let xhr = new XMLHttpRequest();
        // // todo fid
        // xhr.open(
        //   "GET",
        //   `https://mobilelearn.chaoxing.com/v2/apis/class/getClassList?fid=${window.t_fid}&courseId=${window.t_courseid}`,
        //   true
        // );
        // xhr.onreadystatechange = function () {
        //   if (xhr.readyState == 4 && xhr.status == 200) {
        //     let k = new JSON(xhr.responseText);
        //     debugger;
        //   }
        // };
        // xhr.send();
      }
      window.t_storage_key =
        window.t_clazzid + "_" + window.t_courseid + "_" + window.t_questionid;
      window.t_storage_key =
        window.t_clazzid + "_" + window.t_courseid + "_" + window.t_questionid;
      // localStorage.removeItem(window.t_storage_key);
      // let arr = ["回答得不错", "格式有待修改"];
      // localStorage.setItem(window.t_storage_key, JSON.stringify(arr));
      window.t_data = JSON.parse(localStorage.getItem(window.t_storage_key));
    }
    function initLocalData() {
      if (window.t_data) {
        for (let i = 0; i < window.t_data.length; i++) {
          let row_div = document.body
            .querySelector("#row_template")
            .cloneNode(true);
          row_div.classList.remove("t_hidden");
          row_div.querySelector(".content_div").textContent = window.t_data[i];
          let rows_div = document.body.querySelector("#rows_div");
          rows_div.appendChild(row_div);
        }
        _addEventListenerInPingyuRow();
        rerenderComment();
      }
    }

    function injectDOM(htmlstr) {
      let parser = new DOMParser();
      let doc = parser.parseFromString(htmlstr, "text/html");
      let div_box = doc.getElementById("tbox");
      document.body.appendChild(div_box);
    }
    function listenerStuff() {
      let body = document.body;
      _addEventListenerInPingyuRow();
      let new_comment_btn = body.querySelector("#new_comment_btn");
      new_comment_btn.addEventListener("click", newComment);
      let btn_cf_modify = body.querySelector("#btn_cf_modify");
      btn_cf_modify.addEventListener("click", confirmModify);
      let btn_import = body.querySelector("#btn_import");
      btn_import.addEventListener("click", importData);
      let btn_export = body.querySelector("#btn_export");
      btn_export.addEventListener("click", exportData);
      // 确认修改快捷键
      document.addEventListener("keydown", (event) => {
        let el = modify_area_div;
        if (el.classList.contains("t_hidden")) return;
        if (event.shiftKey && event.key == "Enter") {
          confirmModify();
          event.preventDefault();
        }
      });

      // 选中内容快捷键、修改内容快捷键、删除内容快捷键
      _addContentKeyDownListener();
      // 新增评语快捷键
      document.addEventListener("keydown", (event) => {
        if (document.activeElement != document.body) return;
        if (event.ctrlKey || !event.altKey || event.shiftKey) return;
        if (event.key != "Enter") return;
        let btn = body.querySelector("#new_comment_btn");
        let rect = btn.getBoundingClientRect();
        let topElement = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        );
        if (btn != topElement) return;
        event.preventDefault();
        btn.click();
      });
      // 导入导出快捷键
      document.addEventListener("keydown", (event) => {
        if (document.activeElement != document.body) return;
        if (event.ctrlKey || event.altKey || event.shiftKey) return;
        if (event.key == "-") {
          let btn = body.querySelector("#btn_import");
          let rect = btn.getBoundingClientRect();
          let topElement = document.elementFromPoint(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2
          );
          if (btn != topElement) return;
          event.preventDefault();
          btn.click();
        } else if (event.key == "`") {
          let btn = body.querySelector("#btn_export");
          let rect = btn.getBoundingClientRect();
          let topElement = document.elementFromPoint(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2
          );
          if (btn != topElement) return;
          event.preventDefault();
          btn.click();
        }
      });
    }
    function saveToFile(data, filename) {
      let blob = new Blob([data], { type: "text/plain;charset=utf-8" });
      let url = URL.createObjectURL(blob);
      let link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }
    function exportData() {
      let data = JSON.parse(localStorage.getItem(window.t_storage_key));

      if (data == null || data.length == 0) {
        alert("没有数据可以导出");
        return;
      }
      let str = "";
      for (let i = 0; i < data.length; ++i) {
        str += `${i + 1}. ${data[i]}\n`;
      }
      let nowDate = new Date();
      let y = nowDate.getFullYear();
      let m = nowDate.getMonth() + 1;
      let d = nowDate.getDay();
      let date = `${y}_${m}_${d}`;
      let hwname = document.body.querySelector(".taskTitle").textContent;
      let xiti = 0;
      let allxitis = document.body.querySelectorAll(".topicNumber_list li");
      for (; xiti < allxitis.length; ++xiti) {
        if (allxitis[xiti].classList.contains("current")) {
          break;
        }
      }

      // todo
      saveToFile(
        str,
        `xx课作业[${hwname}]题目[${
          xiti + 1
        }]评语(${date} ${nowDate.toLocaleTimeString()}).txt`
      );
    }
    function importData() {
      // 创建一个文件输入元素
      let input = document.createElement("input");
      input.type = "file";

      // 当用户选择文件后，读取文件内容
      input.onchange = function (event) {
        let file = event.target.files[0];
        let reader = new FileReader();
        reader.onload = function (event) {
          function validateData(str) {
            str = str.trim();
            let ret = [];
            let regex = /^\d+\./;
            // 行首如果出现`${num}.`, 这个序号必须是顺序且连贯的
            let lines = str
              .split("\n")
              .filter((line, i) => regex.test(line))
              .map((line) => line.match(regex));
            if (lines.length == 0) return null;
            for (let i = 0; i < lines.length; ++i) {
              if (lines[i].indexOf(`${i + 1}.`) == -1) return null;
            }

            let p = 0;
            let num = 1;
            let el_len = 0;
            while (p != str.length) {
              let idx = str.indexOf(`${num}.`, p);
              p = idx + `${num++}.`.length;

              idx = str.indexOf(`${num}.`, p);
              if (idx == -1) {
                el_len = str.length - p;
                ret.push(str.substring(p, p + el_len));
              } else {
                el_len = idx - p;
                ret.push(str.substring(p, p + el_len));
              }
              p += el_len;
            }
            ret = ret.map((el) => el.trim()).filter((el) => el != "");
            if (ret.length == 0) return null;
            return ret;
          }
          let data = validateData(event.target.result);
          console.log(data);
          if (data == null) {
            alert("数据格式不正确，参考console输出重新上传");
            console.log(
              "标准格式如下：\n1.dsdsdsd\n2. sdsdsdsd\nsd sd\n sd\n3.sdsdsdsd"
            );
            return;
          }
          localStorage.removeItem(window.t_storage_key);
          localStorage.setItem(window.t_storage_key, JSON.stringify(data));
          document.body.querySelector("#rows_div").innerHTML = "";
          initLocalData();
        };
        console.log(event.target.result);
        reader.readAsText(file);
      };

      // 模拟用户点击，打开文件选择对话框
      input.click();
    }
    // 删除修改选中，todo shift删除 todo alt修改
    function _addContentKeyDownListener() {
      document.addEventListener("keydown", (event) => {
        let el = document.activeElement;
        if (el != document.body) return;

        let key = event.shiftKey ? event.key.toLocaleLowerCase() : event.key;
        let idx = window.t_comment_keys.indexOf(key);
        let row = document.body.querySelector("#rows_div").children[idx];
        if (row == null) return;

        // 选中
        if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
          let content_div = row.querySelector(".content_div");
          onContentClick({ target: content_div });
        } else if (!event.ctrlKey && !event.altKey && event.shiftKey) {
          let remove_btn = row.querySelector(".remove_btn button");
          remove_btn.click();
        } else if (!event.ctrlKey && event.altKey && !event.shiftKey) {
          let content_div = row.querySelector(".content_div");
          showModifyArea({ target: content_div });
        }
        // content_div.click()
      });
    }
    function rowRemove(event) {
      let row_div = event.target.closest(".row_div");
      row_div.remove();
      rerender();
    }
    function rerender() {
      rerenderComment();
      saveToLocal();
    }
    function showModifyArea(event) {
      window.t_content_div = event.target;
      let modify_area_div = document.getElementById("modify_area_div");
      modify_area_div.classList.remove("t_hidden");
      document.getElementById("ta_overlay").classList.remove("t_hidden");
      // 获取被双击的content_div的内容
      let content = event.target.textContent;

      // 将内容设置为textarea的值
      let textarea = modify_area_div.querySelector("textarea");
      textarea.focus();
      if (textarea) {
        textarea.value = content.trim();
      }

      let button = document.getElementById("btn_cf_modify");
      if (event.t_new_comment === true) {
        button.textContent = "确认创建(<Shift><Enter>)";
      } else {
        button.textContent = "确认修改(<Shift><Enter>)";
      }
    }
    // _addKeyDownListener(key1)
    function _addEventListenerInPingyuRow() {
      var timeout = null;
      var time = 120;
      var time_singleclick = null;
      let body = document.body;

      let content_divs = body.querySelectorAll(".content_div");
      for (let i = 0; i < content_divs.length; i++) {
        content_divs[i].addEventListener("click", (event) => {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            time_singleclick = Date.now();
            // console.log(`单击:${time_singleclick}`);
            onContentClick(event);
          }, time);
        });
        // content_divs[i].addEventListener("dblclick", showModifyArea);
        content_divs[i].addEventListener("dblclick", (event) => {
          let now = Date.now();
          clearTimeout(timeout);
          if (now - time_singleclick < time) {
            let event2 = new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
              view: window,
            });
            event.target.dispatchEvent(event2);
          }
          // console.log(`双击:${now}`);
          showModifyArea(event);
        });
      }
      let remove_btns = body.querySelectorAll(".remove_btn");
      for (let i = 0; i < remove_btns.length; i++) {
        remove_btns[i].addEventListener("click", rowRemove);
      }
    }
    function onContentClick(event) {
      let content_div = event.target;
      if (content_div.classList.contains("t_selected")) {
        content_div.classList.remove("t_selected");
      } else {
        content_div.classList.add("t_selected");
      }
      rerenderComment();
    }
    function rerenderComment() {
      let body = document.body;
      // find all rowdiv
      let row_divs = body.querySelectorAll("#rows_div .row_div");
      for (
        let i = 0;
        i < row_divs.length && i < window.t_comment_keys.length;
        i++
      ) {
        let row_div = row_divs[i];
        row_div.querySelector(
          ".shortcut_div"
        ).textContent = `(${window.t_comment_keys[i]})`;
      }
      // find all content_div that the rowdiv has t_selected class
      let selected_content_divs = body.querySelectorAll(
        ".content_div.t_selected"
      );
      let contents = [];
      for (let i = 0; i < selected_content_divs.length; i++) {
        contents.push(selected_content_divs[i].textContent);
      }
      // 序号占5个空格
      contents = contents.map((content, index) => {
        let num = index + 1;
        let numstr = (num.toString() + ".").padEnd(5, " ");

        let lines = content.split("\n");
        lines = lines.map((line) => "     " + line);
        return numstr + lines.join("\n").substring(5);
      });
      let tacontent = contents.join("\n");
      console.log(tacontent);
      // 将 \n 替换为 <p></p>，将空格替换为 &nbsp;
      tacontent = tacontent.replace(/\n/g, "</p><p>").replace(/ /g, "&nbsp;");
      tacontent = "<p>" + tacontent + "</p>";
      // 将 tacontent 加到body里
      let iframe = document.body.querySelector("#ueditor_0");
      if (iframe == null) {
        // console.log("iframe #ueditor_0 is null");
        return;
      }
      iframe.contentDocument.body.innerHTML = tacontent;
      // if need to focus: https://stackoverflow.com/questions/2388164/set-focus-on-div-contenteditable-element
    }

    function confirmModify() {
      // 获取textarea的值
      let textarea = document.querySelector("#modify_area_div textarea");
      if (textarea.value.trim() == "") {
        alert("请输入内容");
        return;
      }
      let content = textarea.value;
      // 将textarea的值设置为content_div的内容
      let content_div = window.t_content_div;
      delete window.t_content_div;
      content_div.textContent = content;
      // 隐藏modify_area_div
      let modify_area_div = document.querySelector("#modify_area_div");
      modify_area_div.classList.add("t_hidden");
      document.getElementById("ta_overlay").classList.add("t_hidden");
      rerender();
    }
    function saveToLocal() {
      let body = document.body;
      let row_divs = body.querySelectorAll("#rows_div .row_div");
      let contents = [];
      for (let i = 0; i < row_divs.length; i++) {
        let row_div = row_divs[i];
        let content = row_div.querySelector(".content_div").textContent;
        contents.push(content);
      }
      localStorage.setItem(window.t_storage_key, JSON.stringify(contents));
    }
    function newComment(event) {
      let body = document.body;
      let newrow = body.querySelector("#row_template").cloneNode(true);
      newrow.classList.remove("t_hidden");
      newrow.querySelector(".content_div").textContent = "";
      let rows_div = body.querySelector("#rows_div");
      rows_div.appendChild(newrow);
      _addEventListenerInPingyuRow();

      let event2 = new MouseEvent("dblclick", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      event2.t_new_comment = true;
      newrow.querySelector(".content_div").dispatchEvent(event2);
    }
  })();
};
