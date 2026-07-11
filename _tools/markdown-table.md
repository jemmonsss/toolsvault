---
title: "Markdown Table Generator"
link: "/tools/markdown-table/"
description: "Generate Markdown tables from rows."
tags:
  - markdown
  - table
  - generator
  - text
category: "Text & Strings"
---
<div class="tui">
  <h1>Markdown Table Generator</h1>
  <p class="sub">First line = headers, rest = rows (comma-separated).</p>
  <textarea id="in" placeholder="Name,Role&#10;Ada,Engineer&#10;Linus,Maintainer"></textarea>
  <div class="row"><button class="btn btn-primary" onclick="run()">Generate</button><button class="btn btn-secondary" onclick="copy('out')">Copy</button></div>
  <div id="out" class="result"></div>
  <div id="msg" class="msg"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function esc(c){return c.replace(/\|/g,'\\|').replace(/\n/g,' ');}
function run(){var rows=byId('in').value.split('\n').map(function(r){return r.trim();}).filter(Boolean).map(function(r){return r.split(',').map(function(c){return c.trim();});});if(!rows.length){err('msg','Add at least one row');return;}var head=rows[0];var md='| '+head.map(esc).join(' | ')+' |\n';md+='| '+head.map(function(){return '---';}).join(' | ')+' |\n';rows.slice(1).forEach(function(r){md+='| '+r.map(esc).join(' | ')+' |\n';});byId('out').textContent=md;showMsg('msg','','');}
</script>
