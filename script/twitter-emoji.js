// ==UserScript==
// @name         Twitter Emoji For Chrome
// @namespace    https://github.com/Carlos920
// @version      0.1
// @description  在Windows上使用Twitter Emoji显示Chrome Emoji字符
// @author       Carlos920
// @match        *://*.v2ex.com/*
// @match        *://*.emojipedia.org/*
// @match        *://*.emojiall.com/*
// @match        *://*/ipfs/bafybeiazdy6cpftzahp6iv3s5sw6r4g5232z3sxktt6deahli4zz7lvoa4/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// @grant        none
// @source       https://raw.githubusercontent.com/Carlos920/images/master/script/twitter-emoji.js
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
        "https://twemoji.maxcdn.com/v/latest/twemoji.min.js"
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
