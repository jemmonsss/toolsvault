---
title: "JWT Debugger"
link: "/tools/jwt-debugger/"
description: "Decode and verify JSON Web Tokens."
tags:
  - jwt
  - debugger
  - security
category: "Security"
---
<div class="tui">
  <h1>JWT Debugger</h1>
  <p class="sub">Decode a JWT and verify its HMAC signature. No data is sent anywhere.</p>
  <textarea id="tok" placeholder="eyJhbGci...eyJ...signature"></textarea>
  <label>Secret (HS256)</label><input type="text" id="secret" value="secret">
  <div class="row"><button class="btn btn-primary" onclick="run()">Decode & Verify</button></div>
  <div id="out" class="result"></div>
  <div id="vmsg" class="msg"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function b64d(s){s=s.replace(/-/g,'+').replace(/_/g,'/');return decodeURIComponent(escape(atob(s)));}
function b64bytes(s){s=s.replace(/-/g,'+').replace(/_/g,'/');var bin=atob(s);var u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u;}
function run(){var t=byId('tok').value.trim();var parts=t.split('.');if(parts.length!==3){err('vmsg','Invalid JWT');return;}try{var header=JSON.parse(b64d(parts[0]));var payload=JSON.parse(b64d(parts[1]));byId('out').textContent='Header:\n'+JSON.stringify(header,null,2)+'\n\nPayload:\n'+JSON.stringify(payload,null,2);}catch(e){err('vmsg','Could not decode: '+e.message);return;}
  if(header.alg&&header.alg.indexOf('HS')===0){crypto.subtle.importKey('raw',new TextEncoder().encode(byId('secret').value),{name:'HMAC',hash:'SHA-256'},false,['verify']).then(function(k){return crypto.subtle.verify({name:'HMAC',hash:'SHA-256'},k,b64bytes(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1]));}).then(function(v){showMsg('vmsg',v?'Signature valid ✓':'Signature invalid ✗',v?'ok':'err');});}else{showMsg('vmsg','Algorithm '+header.alg+' is not HMAC-verifiable here','');}
}
</script>
