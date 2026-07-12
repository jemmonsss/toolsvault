---
title: "UUID Generator"
link: "/tools/uuid-generator/"
description: "Generate RFC 4122 version 4 UUIDs."
tags:
  - uuid
  - generator
category: "Generators"
featured: true
---
<div class="tui">
  <h1>UUID Generator</h1>
  <p class="sub">Generate random version 4 UUIDs.</p>
  <div class="row">
    <div style="flex:1"><label>Count</label><input type="number" id="n" value="5" min="1" max="100"></div>
    <div style="flex:1"><label>Uppercase</label><select id="case"><option value="lower">lowercase</option><option value="upper">UPPERCASE</option></select></div>
  </div>
  <div class="row"><button class="btn btn-primary" onclick="gen()">Generate</button><button class="btn btn-secondary" onclick="copy('out')">Copy</button></div>
  <div id="out" class="result"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function gen(){var n=Math.min(100,Math.max(1,parseInt(byId('n').value,10)||1));var a=[];for(var i=0;i<n;i++){var u=crypto.randomUUID();a.push(byId('case').value==='upper'?u.toUpperCase():u);}byId('out').textContent=a.join('\n');}
gen();
</script>
