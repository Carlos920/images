// ==UserScript==
// @name         Twitter Emoji For Chrome
// @namespace    https://github.com/Carlos920
// @version      0.1
// @description  在Windows上使用Twitter Emoji显示Chrome Emoji字符
// @author       Carlos920
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// @grant        GM_getResourceURL
// @source       https://raw.githubusercontent.com/Carlos920/images/master/script/twitter-emoji.js
// @require      https://twemoji.maxcdn.com/v/latest/twemoji.min.js
// ==/UserScript==

(e=>{const o=document.createElement("style");o.innerText=e,document.head.appendChild(o)})(`img.twitter-emoji {height: 1em;width: 1em;margin: 0 .05em 0 .1em !important;vertical-align: -0.1em;display:inline-block;}`);
		/*vertical-align: -0.1em;*/
(function() {
    'use strict';
    // 文档：https://github.com/twitter/twemoji
    twemoji.parse(document.body, {
                className: "twitter-emoji",
                folder: "svg",
                ext: ".svg",
            });
})();
