// ==UserScript==
// @name         谷歌翻译忽略代码块
// @version      0.0.1
// @description  谷歌翻译忽略代码块
// @author       Carlos920
// @icon         https://ssl.gstatic.com/translate/favicon.ico
// @match        https://kotlinlang.org/*
// @match        https://formatjs.io/*
// @match        https://nodejs.org/*
// @match        https://github.com/*
// @match        https://www.wolframalpha.com/*
// @match        https://www.typescriptlang.org/*
// @grant        GM_registerMenuCommand
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';
  
      function notranslate() {
          const preEles = [
              ...document.querySelectorAll('pre'),
              ...document.querySelectorAll('code'),
              ...document.querySelectorAll('.code-output'), // kotlinlang
              ...document.querySelectorAll('.CodeMirror-sizer'), // kotlinlang
              ...document.querySelectorAll('.code-block'), // kotlinlang
              ...document.querySelectorAll('.prism-code'), // https://formatjs.io
              ...document.querySelectorAll('a.type'), // https://nodejs.org
              ...document.querySelectorAll('.example-wrap'), // https://www.wolframalpha.com/
              ...document.querySelectorAll('#handbook-content h2, .handbook-toc, #sidebar'), // https://www.typescriptlang.org/
          ];
          preEles.forEach((item) => {
              item.classList.add('notranslate');
              item.setAttribute('translate', 'no');
          });
      }
  
      notranslate();
      GM_registerMenuCommand ("忽略代码块",notranslate);
  })();