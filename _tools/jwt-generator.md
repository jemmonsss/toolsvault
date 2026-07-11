---
title: "JWT Generator & Debugger"
link: "/tools/jwt-generator/"
description: "Create and decode HS256 JSON Web Tokens."
tags:
  - jwt
  - generator
  - security
  - debugger
category: "Generators"
---
<div class="tui">
  <h1>JWT Generator & Debugger</h1>
  <p class="sub">Sign HS256 JWTs and decode or verify any token. Everything stays in your browser.</p>
  <div class="tabs">
    <button class="tab active" data-tab="sign">Sign</button>
    <button class="tab" data-tab="debug">Decode / Verify</button>
  </div>
  <div class="panel active" id="panel-sign">
    <label>Payload (JSON)</label><textarea id="jwt-payload">{"sub":"123","name":"Ada","admin":true}</textarea>
    <label>Secret</label><input type="text" id="jwt-secret" value="secret">
    <div class="row"><button class="btn btn-primary" onclick="sign()">Sign</button><button class="btn btn-secondary" onclick="copy('jwt-out')">Copy</button></div>
    <textarea id="jwt-out" readonly placeholder="eyJ...token"></textarea>
    <div id="jwt-smsg" class="msg"></div>
  </div>
  <div class="panel" id="panel-debug">
    <label>Token</label><textarea id="jwt-token" placeholder="eyJhbGci...eyJ...signature"></textarea>
    <label>Secret (to verify)</label><input type="text" id="jwt-vsecret" value="secret">
    <div class="row"><button class="btn btn-primary" onclick="decode()">Decode & Verify</button></div>
    <div id="jwt-decoded" class="result"></div>
    <div id="jwt-vmsg" class="msg"></div>
  </div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function b64e(s){return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function b64d(s){s=s.replace(/-/g,'+').replace(/_/g,'/');return decodeURIComponent(escape(atob(s)));}
function b64bytes(s){s=s.replace(/-/g,'+').replace(/_/g,'/');var bin=atob(s);var u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u;}
function b64from(u){var bin='';var a=new Uint8Array(u);for(var i=0;i<a.length;i++)bin+=String.fromCharCode(a[i]);return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function key(secret){return crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
function sign(){try{var header={alg:'HS256',typ:'JWT'};var payload=JSON.parse(byId('jwt-payload').value);var h=b64e(JSON.stringify(header));var p=b64e(JSON.stringify(payload));var data=h+'.'+p;key(byId('jwt-secret').value).then(function(k){return crypto.subtle.sign({name:'HMAC',hash:'SHA-256'},k,new TextEncoder().encode(data));}).then(function(sig){byId('jwt-out').value=h+'.'+p+'.'+b64from(sig);ok('jwt-smsg','Token signed');});}catch(e){err('jwt-smsg',e.message);}}
function decode(){try{var t=byId('jwt-token').value.trim();var parts=t.split('.');if(parts.length!==3)throw new Error('Invalid JWT');byId('jwt-decoded').textContent='Header:\n'+b64d(parts[0])+'\n\nPayload:\n'+b64d(parts[1]);key(byId('jwt-vsecret').value).then(function(k){return crypto.subtle.verify({name:'HMAC',hash:'SHA-256'},k,b64bytes(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1]));}).then(function(v){showMsg('jwt-vmsg',v?'Signature valid ✓':'Signature invalid ✗',v?'ok':'err');});}catch(e){err('jwt-vmsg',e.message);}}
</script>
