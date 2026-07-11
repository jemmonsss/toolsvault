---
title: "SVG Optimizer"
link: "/tools/svg-optimizer/"
description: "Minify SVG markup."
tags:
  - svg
  - optimizer
  - minify
  - design
category: "Color & Design"
---
<div class="tui">
  <h1>SVG Optimizer</h1>
  <p class="sub">Strip comments and whitespace from SVG markup.</p>
  <textarea id="in" placeholder="<svg>  <!-- comment -->  <rect x=&quot;0&quot; /> </svg>" style="min-height:160px"></textarea>
  <div class="row"><button class="btn btn-primary" onclick="run()">Minify</button><button class="btn btn-secondary" onclick="copy('out')">Copy</button></div>
  <div id="out" class="result"></div>
  <div id="msg" class="msg"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function run(){var s=byId('in').value;if(!s.trim()){byId('out').textContent='';return;}var o=s.replace(/<!--[\s\S]*?-->/g,'').replace(/>\s+</g,'><').replace(/\s{2,}/g,' ').replace(/\s+\/>/g,'/>').trim();byId('out').textContent=o;ok('msg','Minified');}
</script>
