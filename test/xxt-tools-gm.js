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
function addJs(jsstr) {
  let script = document.createElement("script");
  script.type = "text/javascript";
  script.text = jsstr;
  document.body.appendChild(script);
}
function exportGMFunctions() {
  GM_info.script.grant.foreach((v) => {
    if (v.indexOf("GM_") == 0) window[v] = v;
  });
}
(function () {
  "use strict";
  exportGMFunctions();

  console.log(window);

  //let jsstr = GM_getResourceText("piyue_js");
  //addJs(jsstr);
})();
