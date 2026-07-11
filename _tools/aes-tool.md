---
title: "AES Encrypt / Decrypt"
link: "/tools/aes-tool/"
description: "Encrypt and decrypt text with AES-GCM."
tags:
  - aes
  - encryption
  - security
category: "Security"
---
<div class="tui">
  <h1>AES Encrypt / Decrypt</h1>
  <p class="sub">AES-256-GCM with a passphrase-derived key (PBKDF2). Runs entirely in your browser.</p>
  <div class="tabs">
    <button class="tab active" data-tab="enc">Encrypt</button>
    <button class="tab" data-tab="dec">Decrypt</button>
  </div>
  <div class="panel active" id="panel-enc">
    <textarea id="enc-in" placeholder="Secret message..."></textarea>
    <label>Passphrase</label><input type="password" id="enc-pass">
    <div class="row"><button class="btn btn-primary" onclick="enc()">Encrypt</button><button class="btn btn-secondary" onclick="copy('enc-out')">Copy</button></div>
    <textarea id="enc-out" readonly placeholder="base64 ciphertext"></textarea>
    <div id="enc-msg" class="msg"></div>
  </div>
  <div class="panel" id="panel-dec">
    <textarea id="dec-in" placeholder="base64 ciphertext..."></textarea>
    <label>Passphrase</label><input type="password" id="dec-pass">
    <div class="row"><button class="btn btn-primary" onclick="dec()">Decrypt</button><button class="btn btn-secondary" onclick="copy('dec-out')">Copy</button></div>
    <textarea id="dec-out" readonly placeholder="decrypted text"></textarea>
    <div id="dec-msg" class="msg"></div>
  </div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function b64from(u){var bin='';var a=new Uint8Array(u);for(var i=0;i<a.length;i++)bin+=String.fromCharCode(a[i]);return btoa(bin);}
function b64to(s){s=s.replace(/\s/g,'');var bin=atob(s);var u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u;}
function key(pass,salt){return crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveKey']).then(function(b){return crypto.subtle.deriveKey({name:'PBKDF2',salt:salt,iterations:100000,hash:'SHA-256'},{name:'AES-GCM',length:256},true,['encrypt','decrypt']);});}
function enc(){var plain=byId('enc-in').value,pass=byId('enc-pass').value;if(!pass){err('enc-msg','Enter a passphrase');return;}var salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));key(pass,salt).then(function(k){return crypto.subtle.encrypt({name:'AES-GCM',iv:iv},k,new TextEncoder().encode(plain));}).then(function(ct){var out=new Uint8Array(16+12+ct.byteLength);out.set(salt,0);out.set(iv,16);out.set(new Uint8Array(ct),28);byId('enc-out').value=b64from(out);ok('enc-msg','Encrypted');}).catch(function(e){err('enc-msg',e.message);});}
function dec(){var data;try{data=b64to(byId('dec-in').value);}catch(e){err('dec-msg','Invalid base64');return;}var pass=byId('dec-pass').value;if(!pass){err('dec-msg','Enter a passphrase');return;}var salt=data.slice(0,16),iv=data.slice(16,28),ct=data.slice(28);key(pass,salt).then(function(k){return crypto.subtle.decrypt({name:'AES-GCM',iv:iv},k,ct);}).then(function(pt){byId('dec-out').value=new TextDecoder().decode(pt);ok('dec-msg','Decrypted');}).catch(function(e){err('dec-msg','Wrong passphrase or corrupted data');});}
</script>
