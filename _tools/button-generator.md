---
title: "Button Generator"
link: "/tools/button-generator/"
description: "Generate CSS buttons with live preview."
tags:
  - button
  - css
  - generator
  - design
category: "Generators"
---
<div class="tui">
  <h1>Button Generator</h1>
  <p class="sub">Design a CSS button and copy the code.</p>
  <div class="row">
    <div style="flex:1"><label>Label</label><input type="text" id="blabel" value="Click me"></div>
    <div style="flex:1"><label>Background</label><input type="color" id="bbg" value="#8b5cf6"></div>
    <div style="flex:1"><label>Text</label><input type="color" id="bfg" value="#ffffff"></div>
    <div style="flex:1"><label>Radius</label><input type="number" id="brad" value="8"></div>
    <div style="flex:1"><label>Padding</label><input type="number" id="bpad" value="12"></div>
  </div>
  <div id="b-prev" style="margin-top:1rem;padding:1.5rem;background:#1e1e1e;border:1px solid #2d2d2d;border-radius:8px"></div>
  <div class="row"><button class="btn btn-primary" onclick="gen()">Generate</button><button class="btn btn-secondary" onclick="copy('b-css')">Copy CSS</button></div>
  <label>HTML</label><div id="b-html" class="result"></div>
  <label>CSS</label><div id="b-css" class="result"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function gen(){var label=byId('blabel').value,bg=byId('bbg').value,fg=byId('bfg').value,rad=byId('brad').value,pad=byId('bpad').value;
  var css='.btn {\n  background: '+bg+';\n  color: '+fg+';\n  border: none;\n  border-radius: '+rad+'px;\n  padding: '+pad+'px '+(pad*2)+'px;\n  font-size: 1rem;\n  font-weight: 600;\n  cursor: pointer;\n}';
  byId('b-prev').innerHTML='<style>'+css+'</style><button class="btn">'+label+'</button>';
  byId('b-css').textContent=css;
  byId('b-html').textContent='<button class="btn">'+label+'</button>';
}
gen();
</script>
