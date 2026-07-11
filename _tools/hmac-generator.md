---
title: "HMAC Generator"
link: "/tools/hmac-generator/"
description: "Generate HMAC signatures with the Web Crypto API."
tags:
  - hmac
  - generator
  - security
category: "Security"
---
<div class="tui">
  <h1>HMAC Generator</h1>
  <p class="sub">Create HMAC-SHA signatures locally.</p>
  <textarea id="msg" placeholder="Message to sign..."></textarea>
  <div class="row">
    <div style="flex:1"><label>Key</label><input type="text" id="key" placeholder="secret"></div>
    <div style="flex:1"><label>Algorithm</label><select id="algo"><option>SHA-256</option><option>SHA-384</option><option>SHA-512</option></select></div>
  </div>
  <div class="row"><button class="btn btn-primary" onclick="run()">Generate</button><button class="btn btn-secondary" onclick="copy('out')">Copy</button></div>
  <div id="out" class="result"></div>
  <div id="msg2" class="msg"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function run(){var m=byId('msg').value,k=byId('key').value,a=byId('algo').value;crypto.subtle.importKey('raw',new TextEncoder().encode(k),{name:'HMAC',hash:a},false,['sign']).then(function(key){return crypto.subtle.sign({name:'HMAC',hash:a},key,new TextEncoder().encode(m));}).then(function(sig){byId('out').textContent=Array.from(new Uint8Array(sig)).map(function(x){return x.toString(16).padStart(2,'0');}).join('');showMsg('msg2','','');}).catch(function(e){err('msg2',e.message);});}
</script>
