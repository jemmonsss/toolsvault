---
title: "Find & Replace"
link: "/tools/find-replace/"
description: "Find and replace text with regex support."
tags:
  - find
  - replace
  - regex
  - text
category: "Text & Strings"
---
<div class="tui">
  <h1>Find & Replace</h1>
  <p class="sub">Replace text, with optional regex and case sensitivity.</p>
  <textarea id="in" placeholder="Paste text here..." style="min-height:160px"></textarea>
  <div class="row"><div style="flex:1"><label>Find</label><input type="text" id="find"></div><div style="flex:1"><label>Replace</label><input type="text" id="repl"></div></div>
  <div class="row">
    <label><input type="checkbox" id="re"> Regex</label>
    <label><input type="checkbox" id="cs"> Case sensitive</label>
    <button class="btn btn-primary" onclick="run()">Replace</button>
    <button class="btn btn-secondary" onclick="copy('out')">Copy</button>
  </div>
  <div id="out" class="result"></div>
  <div id="msg" class="msg"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function run(){var t=byId('in').value,f=byId('find').value,r=byId('repl').value;if(!f){byId('out').textContent=t;return;}try{if(byId('re').checked){var flags=byId('cs').checked?'g':'gi';byId('out').textContent=t.replace(new RegExp(f,flags),r);}else{var flags2=byId('cs').checked?'g':'gi';byId('out').textContent=t.replace(new RegExp(f.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),flags2),r);}showMsg('msg','','');}catch(e){err('msg',e.message);}}
</script>
