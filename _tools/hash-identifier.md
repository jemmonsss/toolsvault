---
title: "Hash Identifier"
link: "/tools/hash-identifier/"
description: "Identify the algorithm of a hash string."
tags:
  - hash
  - identifier
  - security
category: "Security"
---
<div class="tui">
  <h1>Hash Identifier</h1>
  <p class="sub">Guess a hash's algorithm from its format.</p>
  <input type="text" id="in" placeholder="5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8" oninput="run()" style="font-family:'Courier New',monospace">
  <div id="out" class="result"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function run(){var s=byId('in').value.trim();if(!s){byId('out').textContent='';return;}
  var hex=/^[0-9a-fA-F]+$/.test(s);
  var cands=[];
  if(/^\$2[aby]\$/.test(s))cands.push('bcrypt');
  if(/^\$1\$/.test(s))cands.push('MD5 crypt');
  if(/^\$argon2i\$/.test(s)||/^\$argon2id\$/.test(s))cands.push('Argon2');
  if(hex){
    var len=s.length;
    if(len===32)cands.push('MD5 (32 hex)');
    if(len===40)cands.push('SHA-1 (40 hex)');
    if(len===64)cands.push('SHA-256 (64 hex)');
    if(len===96)cands.push('SHA-384 (96 hex)');
    if(len===128)cands.push('SHA-512 (128 hex)');
    if(len===56)cands.push('SHA-224 (56 hex)');
  }
  byId('out').textContent=cands.length?('Likely: '+cands.join(', ')):'Unknown format';
}
</script>
