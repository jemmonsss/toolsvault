---
title: "Hash Generator"
link: "/tools/hash-generator/"
description: "Generate SHA-1/256/384/512 hashes."
tags:
  - hash
  - sha
  - generator
  - security
category: "Generators"
---
<div class="tui">
  <h1>Hash Generator</h1>
  <p class="sub">Create cryptographic hashes with the Web Crypto API.</p>
  <textarea id="h-in" placeholder="Enter text to hash..."></textarea>
  <div class="row"><button class="btn btn-primary" onclick="run()">Hash</button><button class="btn btn-secondary" onclick="copy('h-out')">Copy</button></div>
  <div id="h-out" class="result"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function hash(algo,text){return crypto.subtle.digest(algo,new TextEncoder().encode(text)).then(function(b){return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,'0');}).join('');});}
function run(){var t=byId('h-in').value;Promise.all(['SHA-1','SHA-256','SHA-384','SHA-512'].map(function(a){return hash(a,t);})).then(function(r){byId('h-out').textContent='SHA-1:\n'+r[0]+'\n\nSHA-256:\n'+r[1]+'\n\nSHA-384:\n'+r[2]+'\n\nSHA-512:\n'+r[3];});}
</script>
