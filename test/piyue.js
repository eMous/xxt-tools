window.onload = function () {
  (function () {
    "use strict";

    // 异步加载拿到 index_template.html 的内容
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "index_template.html", true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
        afterAsyncLoad(xhr);
      }
    };
    xhr.send();
    function initLocalData() {
      window.t_clazzid = document.body
        .querySelector("#clazzid")
        .getAttribute("value");
      window.t_courseid = document.body
        .querySelector("#courseid")
        .getAttribute("value");
      window.t_storage_key = window.t_clazzid + "_" + window.t_courseid;
      // localStorage.removeItem(window.t_storage_key);
      // let arr = ["回答得不错", "格式有待修改"];
      // localStorage.setItem(window.t_storage_key, JSON.stringify(arr));
      window.t_data = JSON.parse(localStorage.getItem(window.t_storage_key));
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

    function injectDOM() {
      let rawString = xhr.responseText;
      // 解析rawString 成一个dom元素
      let parser = new DOMParser();
      let doc = parser.parseFromString(rawString, "text/html");
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
      document.addEventListener("keydown", (event) => {
        let el = modify_area_div;
        if (el.classList.contains("t_hidden")) return;
        if (event.ctrlKey && event.key == "Enter") {
          confirmModify();
        }
      });
      _addContentKeyDownListener();
    }
    function _addContentKeyDownListener() {
      document.addEventListener("keydown", (event) => {
        let el = document.activeElement;
        if (el != document.body) return;
        if (event.ctrlKey || event.altKey || event.shiftKey) return;
        let idx = window.t_comment_keys.indexOf(event.key);
        let row = document.body.querySelector("#rows_div").children[idx];
        if (row == null) return;
        let content_div = row.querySelector(".content_div");
        onContentClick({ target: content_div });
        // content_div.click()
      });
    }
    function afterAsyncLoad(xhr) {
      injectDOM();
      listenerStuff();
      initLocalData();
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
        button.textContent = "确认创建(<Ctrl><Enter>)";
      } else {
        button.textContent = "确认修改(<Ctrl><Enter>)";
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
      contents.forEach((element) => {});

      let tacontent = contents.join("\n");
      console.log(tacontent)
      // 将 \n 替换为 <p></p>，将空格替换为 &nbsp;
      tacontent = tacontent.replace(/\n/g, "</p><p>").replace(/ /g, "&nbsp;");
      tacontent = "<p>" + tacontent + "</p>";
      // 将 tacontent 加到body里
      let iframe = document.body.querySelector("#ueditor_0");
      if (iframe == null) {
        console.log("iframe #ueditor_0 is null");
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
      rerenderShortcut();
    }

    window.t_comment_keys = "qwerasdfzxcvtyuighjkbnmopl";
    function rerenderShortcut() {
      // TODO
      let comment_keys = window.t_comment_keys;
    }
  })();
};
