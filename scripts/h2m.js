!function(e,t){if("object"==typeof exports&&"object"==typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var n=t();for(var r in n)("object"==typeof exports?exports:e)[r]=n[r]}}(self,(function(){return(()=>{var e={227:(e,t,n)=>{"use strict";n.r(t),n.d(t,{gfm:()=>p,highlightedCodeBlock:()=>i,strikethrough:()=>o,tables:()=>s,taskListItems:()=>d});var r=/highlight-(?:text|source)-([a-z0-9]+)/;function i(e){e.addRule("highlightedCodeBlock",{filter:function(e){var t=e.firstChild;return"DIV"===e.nodeName&&r.test(e.className)&&t&&"PRE"===t.nodeName},replacement:function(e,t,n){var i=((t.className||"").match(r)||[null,""])[1];return"\n\n"+n.fence+i+"\n"+t.firstChild.textContent+"\n"+n.fence+"\n\n"}})}function o(e){e.addRule("strikethrough",{filter:["del","s","strike"],replacement:function(e){return"~"+e+"~"}})}var a=Array.prototype.indexOf,l=Array.prototype.every,u={};function c(e){var t,n,r=e.parentNode;return"THEAD"===r.nodeName||r.firstChild===e&&("TABLE"===r.nodeName||(n=(t=r).previousSibling,"TBODY"===t.nodeName&&(!n||"THEAD"===n.nodeName&&/^\s*$/i.test(n.textContent))))&&l.call(e.childNodes,(function(e){return"TH"===e.nodeName}))}function f(e,t){var n=" ";return 0===a.call(t.parentNode.childNodes,t)&&(n="| "),n+e+" |"}function s(e){for(var t in e.keep((function(e){return"TABLE"===e.nodeName&&!c(e.rows[0])})),u)e.addRule(t,u[t])}function d(e){e.addRule("taskListItems",{filter:function(e){return"checkbox"===e.type&&"LI"===e.parentNode.nodeName},replacement:function(e,t){return(t.checked?"[x]":"[ ]")+" "}})}function p(e){e.use([i,o,s,d])}u.tableCell={filter:["th","td"],replacement:function(e,t){return f(e,t)}},u.tableRow={filter:"tr",replacement:function(e,t){var n="",r={left:":--",right:"--:",center:":-:"};if(c(t))for(var i=0;i<t.childNodes.length;i++){var o="---",a=(t.childNodes[i].getAttribute("align")||"").toLowerCase();a&&(o=r[a]||o),n+=f(o,t.childNodes[i])}return"\n"+e+(n?"\n"+n:"")}},u.table={filter:function(e){return"TABLE"===e.nodeName&&c(e.rows[0])},replacement:function(e){return"\n\n"+(e=e.replace("\n\n","\n"))+"\n\n"}},u.tableSection={filter:["thead","tbody","tfoot"],replacement:function(e){return e}}},925:(e,t,n)=>{"use strict";function r(e,t){return Array(t+1).join(e)}n.d(t,{Z:()=>P});var i=["ADDRESS","ARTICLE","ASIDE","AUDIO","BLOCKQUOTE","BODY","CANVAS","CENTER","DD","DIR","DIV","DL","DT","FIELDSET","FIGCAPTION","FIGURE","FOOTER","FORM","FRAMESET","H1","H2","H3","H4","H5","H6","HEADER","HGROUP","HR","HTML","ISINDEX","LI","MAIN","MENU","NAV","NOFRAMES","NOSCRIPT","OL","OUTPUT","P","PRE","SECTION","TABLE","TBODY","TD","TFOOT","TH","THEAD","TR","UL"];function o(e){return c(e,i)}var a=["AREA","BASE","BR","COL","COMMAND","EMBED","HR","IMG","INPUT","KEYGEN","LINK","META","PARAM","SOURCE","TRACK","WBR"];function l(e){return c(e,a)}var u=["A","TABLE","THEAD","TBODY","TFOOT","TH","TD","IFRAME","SCRIPT","AUDIO","VIDEO"];function c(e,t){return t.indexOf(e.nodeName)>=0}function f(e,t){return e.getElementsByTagName&&t.some((function(t){return e.getElementsByTagName(t).length}))}var s={};function d(e){return e?e.replace(/(\n+\s*)+/g,"\n"):""}function p(e){for(var t in this.options=e,this._keep=[],this._remove=[],this.blankRule={replacement:e.blankReplacement},this.keepReplacement=e.keepReplacement,this.defaultRule={replacement:e.defaultReplacement},this.array=[],e.rules)this.array.push(e.rules[t])}function h(e,t,n){for(var r=0;r<e.length;r++){var i=e[r];if(m(i,t,n))return i}}function m(e,t,n){var r=e.filter;if("string"==typeof r){if(r===t.nodeName.toLowerCase())return!0}else if(Array.isArray(r)){if(r.indexOf(t.nodeName.toLowerCase())>-1)return!0}else{if("function"!=typeof r)throw new TypeError("`filter` needs to be a string, array, or function");if(r.call(e,t,n))return!0}}function g(e){var t=e.nextSibling||e.parentNode;return e.parentNode.removeChild(e),t}function v(e,t,n){return e&&e.parentNode===t||n(t)?t.nextSibling||t.parentNode:t.firstChild||t.nextSibling||t.parentNode}s.paragraph={filter:"p",replacement:function(e){return"\n\n"+e+"\n\n"}},s.lineBreak={filter:"br",replacement:function(e,t,n){return n.br+"\n"}},s.heading={filter:["h1","h2","h3","h4","h5","h6"],replacement:function(e,t,n){var i=Number(t.nodeName.charAt(1));return"setext"===n.headingStyle&&i<3?"\n\n"+e+"\n"+r(1===i?"=":"-",e.length)+"\n\n":"\n\n"+r("#",i)+" "+e+"\n\n"}},s.blockquote={filter:"blockquote",replacement:function(e){return"\n\n"+(e=(e=e.replace(/^\n+|\n+$/g,"")).replace(/^/gm,"> "))+"\n\n"}},s.list={filter:["ul","ol"],replacement:function(e,t){var n=t.parentNode;return"LI"===n.nodeName&&n.lastElementChild===t?"\n"+e:"\n\n"+e+"\n\n"}},s.listItem={filter:"li",replacement:function(e,t,n){e=e.replace(/^\n+/,"").replace(/\n+$/,"\n").replace(/\n/gm,"\n    ");var r=n.bulletListMarker+"   ",i=t.parentNode;if("OL"===i.nodeName){var o=i.getAttribute("start"),a=Array.prototype.indexOf.call(i.children,t);r=(o?Number(o)+a:a+1)+".  "}return r+e+(t.nextSibling&&!/\n$/.test(e)?"\n":"")}},s.indentedCodeBlock={filter:function(e,t){return"indented"===t.codeBlockStyle&&"PRE"===e.nodeName&&e.firstChild&&"CODE"===e.firstChild.nodeName},replacement:function(e,t,n){return"\n\n    "+t.firstChild.textContent.replace(/\n/g,"\n    ")+"\n\n"}},s.fencedCodeBlock={filter:function(e,t){return"fenced"===t.codeBlockStyle&&"PRE"===e.nodeName&&e.firstChild&&"CODE"===e.firstChild.nodeName},replacement:function(e,t,n){for(var i,o=((t.firstChild.getAttribute("class")||"").match(/language-(\S+)/)||[null,""])[1],a=t.firstChild.textContent,l=n.fence.charAt(0),u=3,c=new RegExp("^"+l+"{3,}","gm");i=c.exec(a);)i[0].length>=u&&(u=i[0].length+1);var f=r(l,u);return"\n\n"+f+o+"\n"+a.replace(/\n$/,"")+"\n"+f+"\n\n"}},s.horizontalRule={filter:"hr",replacement:function(e,t,n){return"\n\n"+n.hr+"\n\n"}},s.inlineLink={filter:function(e,t){return"inlined"===t.linkStyle&&"A"===e.nodeName&&e.getAttribute("href")},replacement:function(e,t){var n=t.getAttribute("href"),r=d(t.getAttribute("title"));return r&&(r=' "'+r+'"'),"["+e+"]("+n+r+")"}},s.referenceLink={filter:function(e,t){return"referenced"===t.linkStyle&&"A"===e.nodeName&&e.getAttribute("href")},replacement:function(e,t,n){var r,i,o=t.getAttribute("href"),a=d(t.getAttribute("title"));switch(a&&(a=' "'+a+'"'),n.linkReferenceStyle){case"collapsed":r="["+e+"][]",i="["+e+"]: "+o+a;break;case"shortcut":r="["+e+"]",i="["+e+"]: "+o+a;break;default:var l=this.references.length+1;r="["+e+"]["+l+"]",i="["+l+"]: "+o+a}return this.references.push(i),r},references:[],append:function(e){var t="";return this.references.length&&(t="\n\n"+this.references.join("\n")+"\n\n",this.references=[]),t}},s.emphasis={filter:["em","i"],replacement:function(e,t,n){return e.trim()?n.emDelimiter+e+n.emDelimiter:""}},s.strong={filter:["strong","b"],replacement:function(e,t,n){return e.trim()?n.strongDelimiter+e+n.strongDelimiter:""}},s.code={filter:function(e){var t=e.previousSibling||e.nextSibling,n="PRE"===e.parentNode.nodeName&&!t;return"CODE"===e.nodeName&&!n},replacement:function(e){if(!e.trim())return"";var t="`",n="",r="",i=e.match(/`+/gm);if(i)for(/^`/.test(e)&&(n=" "),/`$/.test(e)&&(r=" ");-1!==i.indexOf(t);)t+="`";return t+n+e+r+t}},s.image={filter:"img",replacement:function(e,t){var n=d(t.getAttribute("alt")),r=t.getAttribute("src")||"",i=d(t.getAttribute("title"));return r?"!["+n+"]("+r+(i?' "'+i+'"':"")+")":""}},p.prototype={add:function(e,t){this.array.unshift(t)},keep:function(e){this._keep.unshift({filter:e,replacement:this.keepReplacement})},remove:function(e){this._remove.unshift({filter:e,replacement:function(){return""}})},forNode:function(e){return e.isBlank?this.blankRule:(t=h(this.array,e,this.options))||(t=h(this._keep,e,this.options))||(t=h(this._remove,e,this.options))?t:this.defaultRule;var t},forEach:function(e){for(var t=0;t<this.array.length;t++)e(this.array[t],t)}};var y,N,R,T="undefined"!=typeof window?window:{},b=function(){var e=T.DOMParser,t=!1;try{(new e).parseFromString("","text/html")&&(t=!0)}catch(e){}return t}()?T.DOMParser:(y=function(){},N=n(491),y.prototype.parseFromString=function(e){return N.createDocument(e)},y);function A(e){var t;return function(e){var t=e.element,n=e.isBlock,r=e.isVoid,i=e.isPre||function(e){return"PRE"===e.nodeName};if(t.firstChild&&!i(t)){for(var o=null,a=!1,l=null,u=v(l,t,i);u!==t;){if(3===u.nodeType||4===u.nodeType){var c=u.data.replace(/[ \r\n\t]+/g," ");if(o&&!/ $/.test(o.data)||a||" "!==c[0]||(c=c.substr(1)),!c){u=g(u);continue}u.data=c,o=u}else{if(1!==u.nodeType){u=g(u);continue}n(u)||"BR"===u.nodeName?(o&&(o.data=o.data.replace(/ $/,"")),o=null,a=!1):r(u)&&(o=null,a=!0)}var f=v(l,u,i);l=u,u=f}o&&(o.data=o.data.replace(/ $/,""),o.data||g(o))}}({element:t="string"==typeof e?(R=R||new b).parseFromString('<x-turndown id="turndown-root">'+e+"</x-turndown>","text/html").getElementById("turndown-root"):e.cloneNode(!0),isBlock:o,isVoid:l}),t}function E(e){return e.isBlock=o(e),e.isCode="code"===e.nodeName.toLowerCase()||e.parentNode.isCode,e.isBlank=function(e){return!l(e)&&!function(e){return c(e,u)}(e)&&/^\s*$/i.test(e.textContent)&&!function(e){return f(e,a)}(e)&&!function(e){return f(e,u)}(e)}(e),e.flankingWhitespace=function(e){var t="",n="";if(!e.isBlock){var r=/^\s/.test(e.textContent),i=/\s$/.test(e.textContent),o=e.isBlank&&r&&i;r&&!k("left",e)&&(t=" "),o||!i||k("right",e)||(n=" ")}return{leading:t,trailing:n}}(e),e}function k(e,t){var n,r,i;return"left"===e?(n=t.previousSibling,r=/ $/):(n=t.nextSibling,r=/^ /),n&&(3===n.nodeType?i=r.test(n.nodeValue):1!==n.nodeType||o(n)||(i=r.test(n.textContent))),i}var C=Array.prototype.reduce,O=/^\n*/,S=/\n*$/,x=[[/\\/g,"\\\\"],[/\*/g,"\\*"],[/^-/g,"\\-"],[/^\+ /g,"\\+ "],[/^(=+)/g,"\\$1"],[/^(#{1,6}) /g,"\\$1 "],[/`/g,"\\`"],[/^~~~/g,"\\~~~"],[/\[/g,"\\["],[/\]/g,"\\]"],[/^>/g,"\\>"],[/_/g,"\\_"],[/^(\d+)\. /g,"$1\\. "]];function D(e){if(!(this instanceof D))return new D(e);var t={rules:s,headingStyle:"setext",hr:"* * *",bulletListMarker:"*",codeBlockStyle:"indented",fence:"```",emDelimiter:"_",strongDelimiter:"**",linkStyle:"inlined",linkReferenceStyle:"full",br:"  ",blankReplacement:function(e,t){return t.isBlock?"\n\n":""},keepReplacement:function(e,t){return t.isBlock?"\n\n"+t.outerHTML+"\n\n":t.outerHTML},defaultReplacement:function(e,t){return t.isBlock?"\n\n"+e+"\n\n":e}};this.options=function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}return e}({},t,e),this.rules=new p(this.options)}function B(e){var t=this;return C.call(e.childNodes,(function(e,n){var r="";return 3===(n=new E(n)).nodeType?r=n.isCode?n.nodeValue:t.escape(n.nodeValue):1===n.nodeType&&(r=L.call(t,n)),I(e,r)}),"")}function w(e){var t=this;return this.rules.forEach((function(n){"function"==typeof n.append&&(e=I(e,n.append(t.options)))})),e.replace(/^[\t\r\n]+/,"").replace(/[\t\r\n\s]+$/,"")}function L(e){var t=this.rules.forNode(e),n=B.call(this,e),r=e.flankingWhitespace;return(r.leading||r.trailing)&&(n=n.trim()),r.leading+t.replacement(n,e,this.options)+r.trailing}function I(e,t){var n,r,i,o=(n=t,(i=(r=[e.match(S)[0],n.match(O)[0]].sort())[r.length-1]).length<2?i:"\n\n");return(e=e.replace(S,""))+o+t.replace(O,"")}D.prototype={turndown:function(e){if(!function(e){return null!=e&&("string"==typeof e||e.nodeType&&(1===e.nodeType||9===e.nodeType||11===e.nodeType))}(e))throw new TypeError(e+" is not a string, or an element/document/fragment node.");if(""===e)return"";var t=B.call(this,new A(e));return w.call(this,t)},use:function(e){if(Array.isArray(e))for(var t=0;t<e.length;t++)this.use(e[t]);else{if("function"!=typeof e)throw new TypeError("plugin must be a Function or an Array of Functions");e(this)}return this},addRule:function(e,t){return this.rules.add(e,t),this},keep:function(e){return this.rules.keep(e),this},remove:function(e){return this.rules.remove(e),this},escape:function(e){return x.reduce((function(e,t){return e.replace(t[0],t[1])}),e)}};const P=D},138:(e,t,n)=>{e.exports=function(e){const t=n(925).Z,r=n(227),i=new t;return i.use(r.gfm),i.addRule("codeBlock",{filter:["pre"],replacement:function(e){return"```text\n"+e+"```"}}),i.addRule("emph",{filter:["strong"],replacement:function(e,t){return"PRE"==t.parentNode.nodeName?""+e:"**"+e+"**"}}),i.addRule("h2",{filter:["h2"],replacement:function(e,t){return"# "+t.textContent+"\n\n"}}),i.addRule("h3",{filter:["h3"],replacement:function(e){return"## 1. Description - "+e}}),i.addRule("hr",{filter:["hr"],replacement:function(e){return""}}),i.addRule("li",{filter:["li"],replacement:function(e){return"- "+e+"\n\n"}}),i.turndown(e)}},491:()=>{}},t={};function n(r){var i=t[r];if(void 0!==i)return i.exports;var o=t[r]={exports:{}};return e[r](o,o.exports,n),o.exports}return n.d=(e,t)=>{for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n(138)})()}));