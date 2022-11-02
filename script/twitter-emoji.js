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
// @resource      twemoji https://twemoji.maxcdn.com/v/latest/twemoji.min.js
// ==/UserScript==

(function() {
    'use strict';
    // 文档：https://github.com/twitter/twemoji

    var head = document.head || document.getElementsByTagName("head")[0];

    var style = document.createElement("style");
    style.innerHTML = `/* twemoji styles */
	img.twitter-emoji {
		height: 1em;
		width: 1em;
		margin: 0 .05em 0 .1em;
		/*vertical-align: -0.1em;*/
	}`;
    head.appendChild(style);

    var script = document.createElement("script");
    script.setAttribute(
        "src",
        GM_getResourceURL('twemoji')
    );
    script.setAttribute("crossorigin", "anonymous");

    script.onload = script.onreadystatechange = function () {
        if (
            !this.readyState ||
            this.readyState === "loaded" ||
            this.readyState === "complete"
        ) {
            //callback();
            script.onload = script.onreadystatechange = null;
            twemoji.parse(document.body, {
                className: "twitter-emoji",
                folder: "svg",
                ext: ".svg",
            });
        }
    };
    head.appendChild(script);
})();
