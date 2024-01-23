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

    function afterAsyncLoad(xhr) {
      let rawString = xhr.responseText;
      // 解析rawString 成一个dom元素
      let parser = new DOMParser();
      let doc = parser.parseFromString(rawString, "text/html");
      let div_box = doc.getElementById("tbox");
      document.body.appendChild(div_box);
      let body = document.body;
      //   let div_textarea = doc.getElementById("modify_area_div");
      //   document.body.appendChild(div_textarea);
      //   let div_tb = doc.getElementById("tb");
      //   document.body.appendChild(div_tb);

      // when doubleclick each contentdiv, show modify area
      addEventListenerInPingyuRow();
      // let content_divs = body.querySelectorAll(".content_div");
      // for (let i = 0; i < content_divs.length; i++) {
      //   content_divs[i].addEventListener("dblclick", showModifyArea);
      // }
      // let remove_btns = body.querySelectorAll(".remove_btn");
      // for (let i = 0; i < remove_btns.length; i++) {
      //   remove_btns[i].addEventListener("click", rowRemove);
      // }
      let new_comment_btn = body.querySelector("#new_comment_btn");
      new_comment_btn.addEventListener("click", newComment);
      let btn_cf_modify = body.querySelector("#btn_cf_modify");
      btn_cf_modify.addEventListener("click", confirmModify);
    }
    function rowRemove(event) {
      let row_div = event.target.closest(".row_div");
      row_div.remove();
      rerenderShortcut();
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
    function addEventListenerInPingyuRow() {
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
            colorChange(event);
            rerenderComment();
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
    function colorChange(event) {
      let content_div = event.target;
      if (content_div.classList.contains("t_selected")) {
        content_div.classList.remove("t_selected");
      } else {
        content_div.classList.add("t_selected");
      }
    }
    function rerenderComment() {
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
      contents.forEach((element) => {});

      console.log(contents.join("\n"));
    }

    function confirmModify(event) {
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

      rerenderComment();
    }
    function newComment(event) {
      let body = document.body;
      let newrow = body.querySelector("#row_template").cloneNode(true);
      newrow.classList.remove("t_hidden");
      newrow.querySelector(".content_div").textContent = "";
      let rows_div = body.querySelector("#rows_div");
      rows_div.appendChild(newrow);
      addEventListenerInPingyuRow();

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
    rerenderShortcut();
  })();
};
