window.onload = function () {
  setInterval(function () {
    let tb = document.getElementById("tb");
    if (!tb) {
      (function () {
        "use strict";
        console.log("piyue.js loaded, test me here.");
        window.t_comment_keys = "qwerasdfzxcvtyuighjkbnmopl";
        window.t_scores = [1, 0.95, 0.9, 0.85, 0.82, 0.78, 0.7, 0.65, 0.6, 0];
        window.t_scorekeys = "1234567890";
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
          // debugger;
          originalDOMModify();
          injectDOM(htmlstr);
          styleSetting();
          listenerStuff();
          initGlobal();
          initLocalData();
        }
        function styleSetting() {
          // set height of #tb to screenheight minus 70px
          let tb = document.getElementById("tb");
          let height = window.innerHeight - 70;
          tb.style.height = height + "px";
        }
        function originalDOMModify() {
          window.fastSore = fastSore;
          // modify fastScore lis
          let lis = document.body.querySelectorAll("li.fastScore");
          for (let i = 0; i < lis.length; ++i) {
            let el = document.createElement("b");
            lis[i].appendChild(el);
          }
          let litemplate = document.body.querySelector("li.fastScore");
          for (let i = 0; i < window.t_scores.length; ++i) {
            let lis = document.body.querySelectorAll("li.fastScore");
            if (i >= lis.length) {
              let newli = litemplate.cloneNode(true);
              litemplate.parentElement.appendChild(newli);
            }
            let li = document.body.querySelectorAll("li.fastScore")[i];
            li.setAttribute("data", i + 1);
            let a = li.querySelector("a");
            a.textContent = `${window.t_scores[i] * 100}%`;
            let el = li.querySelector("b");
            el.textContent = window.t_scorekeys[i];
          }
          // add percentage score
          let el = document.body.querySelector("div.numberDiv");
          let scoreinput = el.querySelector("input");
          el.style["float"] = "none";
          el.style["display"] = "inline-block";
          let newel = el.cloneNode(true);
          el.insertAdjacentElement("afterend", newel);
          newel.style["margin-left"] = "60px";

          newel.innerHTML = newel.innerHTML
            .trim()
            .replace("得分", "百分比得分")
            .replace(/分$/, "%");
          let percentageinput = newel.querySelector("input");
          percentageinput.setAttribute("id", "percentageInput");
          percentageinput.classList.remove("markScore");
          percentageinput.removeAttribute("name");
          percentageinput.placeholder = "0-100";
          if (scoreinput.value) {
            // Fix when reviewing marked questions
            let id = $(scoreinput).attr("data");
            let percentage =
              (Number(scoreinput.value) / Number($(`#fullScore${id}`).val())) *
              100;
            if (Number.isInteger(Number(percentage))) {
              percentageinput.value = percentage.toFixed(0);
            } else {
              percentageinput.value = percentage.toFixed(1);
            }
          }
          percentageinput.addEventListener("input", (event) => {
            let target = event.target;
            let id = $(target).attr("data");
            let fullScore = $("#fullScore" + id).val();
            console.log(fullScore);
            if (Number(target.value) > Number(100)) {
              target.value = "";
              $.toast({
                type: "notice",
                content: "百分比不能超过" + 100 + "%",
              });
            }
            if (isNaN(target.value)) {
              target.value = "";
            }
            target.value = target.value.replace(/[^\d.]/g, "");
            var patt = /^(\d+(\.\d{0,1})?)$/g;
            if (!patt.test(target.value) && target.value != "") {
              $.toast({
                type: "notice",
                content: "小数点后只能保留一位",
              });
              target.value = Number($(target).val()).toFixed(1);
            }
            if (target.value === "") {
              $(`#score${id}`).val("");
            } else {
              let score = fullScore * (target.value / 100);

              $(`#score${id}`).val(score.toFixed(1));
            }
          });

          $(".markScore").off("keyup");
          $(".markScore").keyup(function () {
            var id = $(this).attr("data");
            var fullScore = $("#fullScore" + id).val();

            if (Number(this.value) > Number(fullScore)) {
              this.value = "";
              $.toast({
                type: "notice",
                content: "不能超过该题满分" + fullScore + "分",
              });
            }

            if (isNaN(this.value)) {
              this.value = "";
            }

            this.value = this.value.replace(/[^\d.]/g, "");
            var patt = /^(\d+(\.\d{0,1})?)$/g;
            if (!patt.test(this.value) && this.value != "") {
              $.toast({
                type: "notice",
                content: "小数点后只能保留一位",
              });
              this.value = Number($(this).val()).toFixed(1);
            }
            if (this.value === "") {
              $(`#percentageInput`).val("");
            } else {
              let percentage = (this.value / fullScore) * 100;
              if (Number.isInteger(Number(percentage))) {
                $(`#percentageInput`).val(percentage.toFixed(0));
              } else {
                $(`#percentageInput`).val(percentage.toFixed(1));
              }
            }
          });
          // modify basic styles
          el = document.body.querySelector("div.quickScoring");
          el.style["margin-left"] = "0px";
          el.style["float"] = "none";
          el = document.body.querySelector("div.quickTit");
          el.style["float"] = "none";
          el = document.body.querySelector("ul.quickOption");
          el.style["margin-left"] = "0px";
          el.style["margin-top"] = "20px";
          el.style["float"] = "none";
          el.style["display"] = "flex";
          let els = document.body.querySelectorAll("ul.quickOption li");
          els.forEach((el) => {
            el.style["margin-right"] = "10px";
            el = el.querySelector("a");
            el.style["width"] = "max-content";
          });
          els = document.body.querySelectorAll("ul.quickOption li b");
          els.forEach((el) => {
            el.style["position"] = "relative";
            el.style["top"] = "-25px";

            let a = el.previousElementSibling;

            // debugger
            el.style["left"] = `-${
              a.getBoundingClientRect().width / 2 +
              el.getBoundingClientRect().width / 2
            }px`;
            // el.style["left"] = `0px`;
          });
          // el.classList.remove("fl")
        }
        function getCoursename(courseid) {
          window.t_coursenames = GM_getValue("coursenames", {});
          GM_removeValueChangeListener(window.t_coursenames_listenerid);
          window.t_coursenames_listenerid = GM_addValueChangeListener(
            "coursenames",
            function (key, oldv, newv, remote) {
              if (newv[courseid]) {
                window.t_coursenames[courseid] = newv[courseid];
              }
            }
          );
          if (window.t_coursenames[courseid]) {
            return window.t_coursenames[courseid];
          } else {
            return "未知课程";
          }
        }
        function getClazzname(clazzid) {
          window.t_clazznames = GM_getValue("clazznames", {});
          GM_removeValueChangeListener(window.t_clazznames_listenerid);
          window.t_clazznames_listenerid = GM_addValueChangeListener(
            "clazznames",
            function (key, oldv, newv, remote) {
              if (newv[clazzid]) {
                window.t_clazznames[clazzid] = newv[clazzid];
              }
            }
          );
          if (window.t_clazznames[clazzid]) {
            return window.t_clazznames[clazzid];
          } else {
            return "未知班级";
          }
        }
        function getTeachername(fid) {
          window.t_teachernames = GM_getValue("teachernames", {});
          GM_removeValueChangeListener(window.t_teachernames_listenerid);
          window.t_teachernames_listenerid = GM_addValueChangeListener(
            "teachernames",
            function (key, oldv, newv, remote) {
              if (newv[fid]) {
                window.t_teachernames[fid] = newv[fid];
              }
            }
          );
          if (window.t_teachernames[fid]) {
            return window.t_teachernames[fid];
          } else {
            return "未知教师";
          }
        }
        function _iframeCreateToGetData(url) {
          setTimeout(() => {
            // get clazz name
            let iframe = document.createElement("iframe");
            iframe.src = url;
            iframe.width = "1"; // iframe 的宽度
            iframe.height = "1"; // iframe 的高度
            document.body.appendChild(iframe);
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 10000);
          }, 500);
        }
        function fastSore(obj) {
          $(".fastScore").removeClass("curoption");
          $(obj).addClass("curoption");
          var recordId = $(obj).parents(".quickScoring").attr("data");
          28;
          var grade = $(obj).attr("data");
          var fullScore = $("#fullScore" + recordId).val() || 0;
          fullScore = parseFloat(fullScore);
          var score = 0;
          let idx =
            grade > window.t_scores.length
              ? window.t_scores.length - 1
              : grade - 1;
          score = fullScore * window.t_scores[idx];
          score = score.toFixed(1).replace(".0", "");
          $("input[name=score" + recordId + "]").val(score);
          $("input[name=score" + recordId + "]").keyup();
          setTimeout(function () {
            $("input[name=score" + recordId + "]").blur();
          }, 100);
        }
        function isTop(el) {
          let rect = el.getBoundingClientRect();
          let centerX = rect.left + rect.width / 2;
          let centerY = rect.top + rect.height / 2;
          let topElement = document.elementFromPoint(centerX, centerY);
          return topElement == el;
        }
        function _addQuickScoreListener() {
          document.addEventListener("keydown", (event) => {
            // 1234567890 pressed down
            let scoreInput = document.querySelector("#percentageInput");
            if (!isTop(scoreInput)) return;
            if (document.activeElement != document.body) return;
            if (event.ctrlKey || event.altKey || event.shiftKey) return;
            if (window.t_scorekeys.indexOf(event.key) == -1) return;
            let links = document.querySelectorAll("li.fastScore a");
            let i = window.t_scorekeys.indexOf(event.key);
            if (i >= links.length) i = links.length - 1;
            links[i].click();
          });
          document.addEventListener("keydown", (event) => {
            // Enter pressed manualy input score
            let scoreInput = document.querySelector("#percentageInput");
            if (!isTop(scoreInput)) return;
            if (document.activeElement != document.body) return;
            if (event.ctrlKey || event.altKey || event.shiftKey) return;
            if (event.key != "Enter") return;
            scoreInput.focus();
          });
          
          document.addEventListener("keydown", (event) => {
            // Esc every thing blur when no textarea shown           
            let scoreInput = document.querySelector("#percentageInput");
            if (!isTop(scoreInput)) return;
            if (event.ctrlKey || event.altKey || event.shiftKey) return;
            if (event.key != "Escape") return;
            document.activeElement.blur();
          });
 
          document.addEventListener("keydown", (event) => {
            // Esc to hide textarea         
            let modify_area_div = document.getElementById("modify_area_div");
            let ta = modify_area_div.querySelector("textarea#ta");
            if (!isTop(ta)) return;
            if (event.ctrlKey || event.altKey || event.shiftKey) return;
            if (event.key != "Escape") return;

            modify_area_div.classList.add("t_hidden");
            document.getElementById("ta_overlay").classList.add("t_hidden");
            let content = document.getElementById("btn_cf_modify").innerHTML;
            if(content.indexOf("确认创建") != -1){
              let rows_div = document.getElementById("rows_div");
              rows_div.removeChild(rows_div.lastChild);
            }
          });
 
          document.addEventListener("keydown", (event) => {
            // Space next person
            let el = document.body.querySelector(".bottomdiv a.jb_btn");
            if (!isTop(el)) return;
            if (event.ctrlKey || event.altKey || event.shiftKey) return;
            if (document.activeElement != document.body) return;
            if (event.key != " ") return;
            if ($(el).text() != "下一份" && $(el).text() != "保存") return;
            el.click();
          });
          document.addEventListener("keydown", (event) => {
            // todo 优化查找
            let els = document.body.querySelectorAll("a");
            let el;
            for (let i = 0; i < els.length; i++) {
              if (els[i].textContent === "上一份") {
                el = els[i];
                break;
              }
            }
            if (el === undefined) return;
            if (!isTop(el)) return;
            if (event.ctrlKey || event.altKey || event.shiftKey) return;
            if (document.activeElement != document.body) return;
            if (event.key != "Backspace") return;
            el.click();
          });
        }
        function initGlobal() {
          window.t_fid = document.body
            .querySelector("#mfid")
            .getAttribute("value");
          window.t_cpi = document.body
            .querySelector("#cpi")
            .getAttribute("value"); // for teacher name, for user id
          window.t_clazzid = document.body
            .querySelector("#clazzid")
            .getAttribute("value");
          window.t_courseid = document.body
            .querySelector("#courseid")
            .getAttribute("value");
          window.t_questionid = document.body
            .querySelector("#questionid")
            .getAttribute("value");
          window.t_recordid = document.body
            .querySelector("#recordid")
            .getAttribute("value");
          window.t_clazznames = getClazzname(window.t_clazzid);
          window.t_coursename = getCoursename(window.t_courseid);
          // !may be bug but quicker  默认班级名称和课程名称不会改变
          if (getClazzname(window.t_clazzid) == "未知班级") {
            _iframeCreateToGetData(
              `https://mobilelearn.chaoxing.com/v2/apis/class/getClassList?fid=${window.t_fid}&courseId=${window.t_courseid}`
            );
          }
          if (getCoursename(window.t_courseid) == "未知课程") {
            _iframeCreateToGetData(
              `https://www.xueyinonline.com/detail/${window.t_courseid}`
            );
          }
          if (getTeachername(window.t_cpi) == "未知教师") {
            _iframeCreateToGetData(
              `https://mobilelearn.chaoxing.com/v2/apis/class/getHasPermissionTeacherAndClass?courseId=${window.t_courseid}&fid=${window.t_fid}&DB_STRATEGY=COURSEID&STRATEGY_PARA=courseId`
            );
          }
          window.t_storage_key =
            window.t_clazzid +
            "_" +
            window.t_courseid +
            "_" +
            window.t_questionid;
          window.t_data = JSON.parse(
            localStorage.getItem(window.t_storage_key)
          );
        }
        function initLocalData() {
          if (window.t_data) {
            for (let i = 0; i < window.t_data.length; i++) {
              let row_div = document.body
                .querySelector("#row_template")
                .cloneNode(true);
              row_div.classList.remove("t_hidden");
              row_div.querySelector(".content_div").textContent =
                window.t_data[i];
              let rows_div = document.body.querySelector("#rows_div");
              rows_div.appendChild(row_div);
            }
            _addEventListenerInPingyuRow();
            //rerenderComment();
            renderCommentSideBar();
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
          // add event listener to listen page height change event
          window.addEventListener("resize", () => {
            styleSetting();
          });

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
              event.stopImmediatePropagation();
            }
          });
          // 快速打分快捷键
          _addQuickScoreListener();
          // 选中内容快捷键、修改内容快捷键、删除内容快捷键
          _addContentKeyDownListener();
          // 新增评语快捷键
          document.addEventListener("keydown", (event) => {
            if (document.activeElement != document.body) return;
            if (event.ctrlKey || !event.altKey || event.shiftKey) return;
            if (event.key != "Enter") return;
            let btn = body.querySelector("#new_comment_btn");
            if (!isTop(btn)) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            btn.click();
          });
          // 导入导出快捷键
          document.addEventListener("keydown", (event) => {
            if (document.activeElement != document.body) return;
            if (event.ctrlKey || event.altKey || event.shiftKey) return;
            if (event.key == "-") {
              let btn = body.querySelector("#btn_import");
              if (!isTop(btn)) return;
              event.preventDefault();
              btn.click();
            } else if (event.key == "`") {
              let btn = body.querySelector("#btn_export");
              if (!isTop(btn)) return;
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
          saveToFile(
            str,
            `课程：[${getCoursename(window.t_courseid)}] 班级：[${getClazzname(
              window.t_clazzid
            )}] 作业：[${hwname}] 题目：[${xiti + 1}] 教师：[${getTeachername(
              window.t_cpi
            )}] 日期：[${date} ${nowDate.toLocaleTimeString()}] - 评语.txt`
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
              window.t_data = data;
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

            let key = event.shiftKey
              ? event.key.toLocaleLowerCase()
              : event.key;
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
        function renderCommentSideBar(){
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
        }
        function rerenderComment() {
          renderCommentSideBar();
          let body = document.body;
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
          // console.log(tacontent);
          // 将 \n 替换为 <p></p>，将空格替换为 &nbsp;
          tacontent = tacontent
            .replace(/\n/g, "</p><p>")
            .replace(/ /g, "&nbsp;");
          
          tacontent = "<p>" + tacontent + "</p>";
          // 将 tacontent 加到body里
          let iframe = document.body.querySelector("#ueditor_0");
          if (iframe == null) {
            // console.log("iframe #ueditor_0 is null");
            return;
          }
          iframe.contentDocument.body.innerHTML = tacontent;
          let textarea = body.querySelector(`#answer${window.t_recordid}`);
          textarea.value = tacontent;
          // if need to focus: https://stackoverflow.com/questions/2388164/set-focus-on-div-contenteditable-element
        }

        function confirmModify() {
          // 获取textarea的值
          let textarea = document.querySelector("#modify_area_div textarea");
          if (textarea.value.trim() == "") {
            alert("请输入内容");
            return;
          }
          let content = textarea.value.trim();
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
    }
  }, 100);
};

// todo below
// 1. 图片rotate
// var links,link,i,clickEvent,scoreInput,undermouseEle;

// var keyUpFunc = function(event){
//     if (event.key === "r" && undermouseEle.tagName.toLowerCase() === 'img') {
//         console.log(undermouseEle);
//         if(undermouseEle.currentAngle === undefined) undermouseEle.currentAngle=0;
//         undermouseEle.currentAngle = (undermouseEle.currentAngle+90)%360;
//         undermouseEle.style.transform = 'rotate('+undermouseEle.currentAngle+'deg)';
//     }
// }
// var mouseMoveFunc = function(event){
//     undermouseEle = document.elementFromPoint(event.clientX, event.clientY);
// }

// 2. 自动移动到打分处

// 3. 自动预览文件

// 4. 评语自动得分
