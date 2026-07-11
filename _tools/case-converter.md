---
title: "Case Converter"
link: "/tools/case-converter/"
description: "Convert text between naming cases."
tags:
  - case
  - text
  - converter
category: "Converters"
---
<div class="tui">
  <h1>Case Converter</h1>
  <p class="sub">Convert text to camelCase, snake_case, kebab-case and more.</p>
  <textarea id="in" placeholder="Hello World example"></textarea>
  <div class="row"><button class="btn btn-primary" onclick="run()">Convert</button><button class="btn btn-secondary" onclick="copy('out')">Copy all</button></div>
  <div id="out" class="result"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function tokens(s){return s.replace(/([a-z0-9])([A-Z])/g,'$1 $2').replace(/[^a-zA-Z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean);}
function run(){var t=tokens(byId('in').value);if(!t.length){byId('out').textContent='';return;}
  var camel=t.map(function(w,i){return i?w[0].toUpperCase()+w.slice(1).toLowerCase():w.toLowerCase();}).join('');
  var pascal=t.map(function(w){return w[0].toUpperCase()+w.slice(1).toLowerCase();}).join('');
  var snake=t.map(function(w){return w.toLowerCase();}).join('_');
  var kebab=t.map(function(w){return w.toLowerCase();}).join('-');
  var constant=t.map(function(w){return w.toUpperCase();}).join('_');
  var title=t.map(function(w){return w[0].toUpperCase()+w.slice(1).toLowerCase();}).join(' ');
  var out='camelCase: '+camel+'\nsnake_case: '+snake+'\nkebab-case: '+kebab+'\nPascalCase: '+pascal+'\nCONSTANT_CASE: '+constant+'\nTitle Case: '+title;
  byId('out').textContent=out;
}
</script>
