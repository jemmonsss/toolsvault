---
title: "Whitespace Cleaner"
link: "/tools/whitespace-cleaner/"
description: "Trim and normalize whitespace in text."
tags:
  - whitespace
  - text
  - cleaner
category: "Text & Strings"
---
<div class="tui">
  <h1>Whitespace Cleaner</h1>
  <p class="sub">Tidy up spacing and line breaks.</p>
  <textarea id="in" placeholder="paste   text   here" style="min-height:160px"></textarea>
  <div class="row">
    <label><input type="checkbox" id="trail" checked> Trim trailing spaces</label>
    <label><input type="checkbox" id="collapse"> Collapse multiple spaces</label>
    <label><input type="checkbox" id="blank" checked> Remove blank lines</label>
    <label><input type="checkbox" id="crlf"> Normalize line endings</label>
  </div>
  <div class="row"><button class="btn btn-primary" onclick="run()">Clean</button><button class="btn btn-secondary" onclick="copy('out')">Copy</button></div>
  <div id="out" class="result"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function run(){
  var t = byId('in').value;
  if (byId('crlf').checked) t = t.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (byId('trail').checked) t = t.split('\n').map(function(l){ return l.replace(/\s+$/, ''); }).join('\n');
  if (byId('collapse').checked) t = t.replace(/[ \t]{2,}/g, ' ');
  if (byId('blank').checked) t = t.split('\n').filter(function(l){ return l.trim() !== ''; }).join('\n');
  byId('out').textContent = t;
}
</script>
