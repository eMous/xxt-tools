function trySaveClazzname() {
  if (document.URL.indexOf("getClassList") != -1) {
    let clazznames = GM_getValue("clazznames", {});
    let arr = JSON.parse(document.body.innerText).data;
    arr.forEach((e) => {
      clazznames[e.id] = e.name;
    });
    GM_setValue("clazznames", clazznames);
  }
}
function trySaveTeachername() {
  if (document.URL.indexOf("getHasPermissionTeacherAndClass") != -1) {
    let teachernames = GM_getValue("teachernames", {});
    let arr = JSON.parse(document.body.innerText).data["teacherList"];
    arr.forEach((e) => {
      teachernames[e.id] = e.username;
    });
    GM_setValue("teachernames", teachernames);
  }
}
function trySaveCoursename() {
  if (document.URL.indexOf("https://www.xueyinonline.com/detail/") != -1) {
    let url = document.URL;
    let courseid = url.substring(url.lastIndexOf("/") + 1);
    console.log(courseid);
    // debugger
    let coursename = document.body.querySelector(
      `div.mainCourse .crumbs a[href='/detail/${courseid}']`
    ).textContent;

    let coursenames = GM_getValue("coursenames", {});
    coursenames[courseid] = coursename;
    GM_setValue("coursenames", coursenames);
  }
}
function onload() {
  (function () {
    "use strict";
    console.log("dataget.js loaded, test me here.");
    trySaveClazzname();
    trySaveCoursename();
    trySaveTeachername();
  })();
}

if (document.readyState != "complete") {
  // for vs testing
  window.onload = onload;
} else {
  // for tampermonkey test, when using tampermonkey, the onload event has already been triggered by injecting iframe in other page
  onload();
}
