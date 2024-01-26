// ==UserScript==
// @name         xxt-tools-gm
// @namespace    http://tampermonkey.net/
// @version      2024-01-22
// @description  try to take over the world!
// @author       You
// @match        https://mooc2-ans.chaoxing.com/mooc2-ans/work/review/question*
// @match        https://mobilelearn.chaoxing.com/v2/apis/*
// @match        https://www.xueyinonline.com/detail/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chaoxing.com
// @resource template https://raw.githubusercontent.com/eMous/xxt-tools/main/tampermonkey/index_template.html
// @resource piyue_css https://raw.githubusercontent.com/eMous/xxt-tools/main/tampermonkey/piyue.css
// @resource piyue_js https://raw.githubusercontent.com/eMous/xxt-tools/main/tampermonkey/piyue.js
// @resource dataget_js https://raw.githubusercontent.com/eMous/xxt-tools/main/tampermonkey/dataget.js
// @resource template file://C:\Users\tom\Desktop\xxt-tools\tampermonkey\index_template.html
// @resource piyue_css file://C:\Users\tom\Desktop\xxt-tools\tampermonkey\piyue.css
// @resource piyue_js file://C:\Users\tom\Desktop\xxt-tools\tampermonkey\piyue.js
// @resource dataget_js file://C:\Users\tom\Desktop\xxt-tools\tampermonkey\dataget.js
// @grant        GM_getResourceText
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// ==/UserScript==
function addJs(jsstr) {
  let script = document.createElement("script");
  script.type = "text/javascript";
  script.text = jsstr;
  document.body.appendChild(script);
}
function exportGMFunctions() {
  unsafeWindow.GM_info = GM_info;
  GM_info.script.grant.forEach((v) => {
    if (v.indexOf("GM_") == 0) unsafeWindow[v] = eval(v);
  });
}
(function () {
  "use strict";
  exportGMFunctions();
  if (
    document.URL.indexOf(`https://mobilelearn.chaoxing.com/v2/apis/`) != -1 ||
    document.URL.indexOf(`https://www.xueyinonline.com/detail/`) != -1
  ) {
    let jsstr = GM_getResourceText("dataget_js");
    addJs(jsstr);
  } else if (
    document.URL.indexOf(
      `https://mooc2-ans.chaoxing.com/mooc2-ans/work/review/question`
    ) != -1
  ) {
    let jsstr = GM_getResourceText("piyue_js");
    addJs(jsstr);
  }
})();
