---
title: ".env Example Generator"
link: "/tools/env-generator/"
description: "Generate a .env.example template."
tags:
  - env
  - generator
  - config
category: "Generators"
---
<div class="tui">
  <h1>.env Example Generator</h1>
  <p class="sub">Create a .env.example with common variables (values left blank).</p>
  <div id="opts" class="row" style="flex-direction:column;gap:.4rem"></div>
  <div class="row"><button class="btn btn-primary" onclick="gen()">Generate</button><button class="btn btn-secondary" onclick="copy('out')">Copy</button></div>
  <div id="out" class="result"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
var K=['PORT','NODE_ENV','HOST','DATABASE_URL','REDIS_URL','API_KEY','SECRET','JWT_SECRET','DEBUG','LOG_LEVEL','CORS_ORIGIN','SMTP_HOST'];
function gen(){var sel=Array.from(document.querySelectorAll('#opts input:checked')).map(function(b){return b.value;});byId('out').textContent='# .env.example\n'+sel.map(function(k){return k+'=';}).join('\n')+'\n';}
byId('opts').innerHTML=K.map(function(k){return '<label><input type="checkbox" value="'+k+'" checked> '+k+'</label>';}).join('');
</script>
