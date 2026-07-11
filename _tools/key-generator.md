---
title: "RSA Key Pair Generator"
link: "/tools/key-generator/"
description: "Generate RSA key pairs in PEM and OpenSSH format."
tags:
  - rsa
  - ssh
  - key
  - generator
  - security
category: "Generators"
---
<div class="tui">
  <h1>RSA Key Pair Generator</h1>
  <p class="sub">Generate a 2048-bit RSA key pair. Keys are created locally in your browser.</p>
  <label>Key size</label>
  <select id="bits"><option value="2048" selected>2048</option><option value="4096">4096</option></select>
  <div class="row"><button class="btn btn-primary" onclick="gen()">Generate</button></div>
  <label>Private key (PKCS#8 PEM)</label><textarea id="key-priv" readonly style="min-height:140px"></textarea>
  <div class="row"><button class="btn btn-secondary" onclick="copy('key-priv')">Copy private</button><button class="btn btn-secondary" onclick="copy('key-pub')">Copy public</button></div>
  <label>Public key (SPKI PEM)</label><textarea id="key-pub" readonly style="min-height:100px"></textarea>
  <label>Public key (OpenSSH)</label><textarea id="key-ssh" readonly style="min-height:60px"></textarea>
  <div id="msg" class="msg"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function pem(der,label){var u=new Uint8Array(der),bin='';for(var i=0;i<u.length;i++)bin+=String.fromCharCode(u[i]);return '-----BEGIN '+label+'-----\n'+btoa(bin).match(/.{1,64}/g).join('\n')+'\n-----END '+label+'-----\n';}
function derRead(der,i){var tag=der[i++];var b=der[i++],L;if(b<0x80){L=b;}else{var n=b&0x7f;L=0;for(var k=0;k<n;k++){L=L*256+der[i++];}}var begin=i,end=i+L;i=end;if(tag===0x30){var arr=[];while(i<end){var r=derRead(der,i);arr.push(r.node);i=r.next;}return {node:{seq:arr},next:end};}if(tag===0x03){return {node:{bits:der.slice(begin+1,end)},next:end};}if(tag===0x02){var v=der.slice(begin,end);while(v.length>1&&v[0]===0)v=v.slice(1);return {node:{int:v},next:end};}return {node:{val:der.slice(begin,end)},next:end};}
function sshStr(b){var o=[(b.length>>24)&255,(b.length>>16)&255,(b.length>>8)&255,b.length&255];for(var i=0;i<b.length;i++)o.push(b[i]);return o;}
function mpint(b){var v=Array.from(b);if(v[0]&0x80)v=[0].concat(v);var o=[(v.length>>24)&255,(v.length>>16)&255,(v.length>>8)&255,v.length&255];for(var i=0;i<v.length;i++)o.push(v[i]);return o;}
function openssh(spki){var u=new Uint8Array(spki);var p=derRead(u,0);var bits=p.node.seq[2].bits;var inner=derRead(bits,0).node.seq;var n=inner[0].int,e=inner[1].int;var name=new TextEncoder().encode('ssh-rsa');var blob=[].concat(sshStr(name),mpint(e),mpint(n));var bin='';for(var i=0;i<blob.length;i++)bin+=String.fromCharCode(blob[i]);return 'ssh-rsa '+btoa(bin)+' toolsvault-key';}
function gen(){var size=parseInt(byId('bits').value,10);byId('msg').className='msg';byId('msg').textContent='Generating...';byId('msg').className='msg ok';
  crypto.subtle.generateKey({name:'RSA-OAEP',modulusLength:size,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['encrypt','decrypt']).then(function(kp){return Promise.all([crypto.subtle.exportKey('pkcs8',kp.privateKey),crypto.subtle.exportKey('spki',kp.publicKey)]).then(function(r){return {priv:r[0],pub:r[1]};});}).then(function(r){byId('key-priv').value=pem(r.priv,'PRIVATE KEY');byId('key-pub').value=pem(r.pub,'PUBLIC KEY');try{byId('key-ssh').value=openssh(r.pub);}catch(e){byId('key-ssh').value='(OpenSSH format unavailable)';}ok('msg','Keys generated');}).catch(function(e){err('msg',e.message);});
}
</script>
