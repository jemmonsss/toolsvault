---
title: "CSS Gradient Generator"
link: "/tools/gradient-generator/"
description: "Create CSS linear gradients."
tags:
  - gradient
  - css
  - generator
  - design
category: "Generators"
---
<div class="tui">
  <h1>CSS Gradient Generator</h1>
  <p class="sub">Build a linear-gradient and copy the CSS.</p>
  <div class="row">
    <div style="flex:1"><label>Color 1</label><input type="color" id="c1" value="#8b5cf6"></div>
    <div style="flex:1"><label>Color 2</label><input type="color" id="c2" value="#1e1e1e"></div>
    <div style="flex:1"><label>Angle</label><input type="number" id="ang" value="135" min="0" max="360"></div>
  </div>
  <div id="g-prev" style="height:120px;border-radius:8px;border:1px solid #2d2d2d;margin-top:1rem"></div>
  <div class="row"><button class="btn btn-primary" onclick="gen()">Generate</button><button class="btn btn-secondary" onclick="copy('g-out')">Copy</button></div>
  <div id="g-out" class="result"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function gen(){var c1=byId('c1').value,c2=byId('c2').value,a=byId('ang').value;var g='linear-gradient('+a+'deg, '+c1+', '+c2+')';byId('g-prev').style.background=g;byId('g-out').textContent='background: '+g+';';}
gen();
</script>
