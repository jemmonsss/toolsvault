---
title: "HTML Entities Converter"
link: "/tools/html-entities-converter/"
description: "Encode and decode HTML entities."
tags:
  - html
  - entities
  - encoder
  - converter
category: "Converters"
---
<div class="tui">
  <h1>HTML Entities Converter</h1>
  <p class="sub">Encode text to HTML entities and decode them back.</p>
  <div class="tabs">
    <button class="tab active" data-tab="en">Encode</button>
    <button class="tab" data-tab="de">Decode</button>
  </div>
  <div class="panel active" id="panel-en">
    <textarea id="en-in" placeholder="<div>Hello & \"world\"</div>"></textarea>
    <div class="row"><button class="btn btn-primary" onclick="en()">Encode</button><button class="btn btn-secondary" onclick="copy('en-out')">Copy</button></div>
    <div id="en-out" class="result"></div>
  </div>
  <div class="panel" id="panel-de">
    <textarea id="de-in" placeholder="&lt;div&gt;Hello &amp; &quot;world&quot;&lt;/div&gt;"></textarea>
    <div class="row"><button class="btn btn-primary" onclick="de()">Decode</button><button class="btn btn-secondary" onclick="copy('de-out')">Copy</button></div>
    <div id="de-out" class="result"></div>
  </div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function en(){var s=byId('en-in').value.replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});byId('en-out').textContent=s;}
function de(){var t=document.createElement('textarea');t.innerHTML=byId('de-in').value;byId('de-out').textContent=t.value;}
</script>
