---
title: "Markdown ↔ HTML Converter"
link: "/tools/markdown-html-converter/"
description: "Convert Markdown to HTML and HTML to Markdown."
tags:
  - markdown
  - html
  - converter
category: "Converters"
---
<div class="tui">
  <h1>Markdown ↔ HTML Converter</h1>
  <p class="sub">Convert Markdown to HTML and a basic HTML to Markdown.</p>
  <div class="tabs">
    <button class="tab active" data-tab="mh">Markdown → HTML</button>
    <button class="tab" data-tab="hm">HTML → Markdown</button>
  </div>
  <div class="panel active" id="panel-mh">
    <textarea id="mh-in" placeholder="# Heading&#10;Some **bold** text."></textarea>
    <div class="row"><button class="btn btn-primary" onclick="mh()">Convert</button><button class="btn btn-secondary" onclick="copy('mh-out')">Copy</button></div>
    <div id="mh-out" class="result"></div>
    <div id="mh-msg" class="msg"></div>
  </div>
  <div class="panel" id="panel-hm">
    <textarea id="hm-in" placeholder="<h1>Title</h1><p>Hello <b>world</b></p>"></textarea>
    <div class="row"><button class="btn btn-primary" onclick="hm()">Convert</button><button class="btn btn-secondary" onclick="copy('hm-out')">Copy</button></div>
    <div id="hm-out" class="result"></div>
    <div id="hm-msg" class="msg"></div>
  </div>
</div>
<script src="{{ '/assets/js/marked.min.js' | relative_url }}?v={{ site.time | date: '%Y%m%d%H%M%S' }}" defer></script>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function mh(){try{byId('mh-out').textContent=marked.parse(byId('mh-in').value);ok('mh-msg','Converted to HTML');}catch(e){err('mh-msg',e.message);}}
function hm(){try{var tmp=document.createElement('div');tmp.innerHTML=byId('hm-in').value;byId('hm-out').textContent=html2md(tmp);ok('hm-msg','Converted to Markdown');}catch(e){err('hm-msg',e.message);}}
function html2md(el){var md='';el.childNodes.forEach(function(n){if(n.nodeType===3){md+=n.textContent;return;}var t=n.tagName.toLowerCase();var inner=html2md(n);switch(t){case 'h1':md+='# '+inner+'\n\n';break;case 'h2':md+='## '+inner+'\n\n';break;case 'h3':md+='### '+inner+'\n\n';break;case 'p':md+=inner+'\n\n';break;case 'br':md+='\n';break;case 'strong':case 'b':md+='**'+inner+'**';break;case 'em':case 'i':md+='*'+inner+'*';break;case 'code':md+='`'+inner+'`';break;case 'a':md+='['+inner+']('+n.getAttribute('href')+')';break;case 'ul':md+=inner;break;case 'ol':md+=inner;break;case 'li':md+='- '+inner+'\n';break;case 'blockquote':md+='> '+inner+'\n';break;case 'hr':md+='---\n';break;default:md+=inner;}});return md;}
</script>
