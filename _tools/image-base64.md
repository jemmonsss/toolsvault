---
title: "Image to Base64"
link: "/tools/image-base64/"
description: "Convert images to data URLs and back."
tags:
  - image
  - base64
  - converter
  - design
category: "Color & Design"
---
<div class="tui">
  <h1>Image to Base64</h1>
  <p class="sub">Convert an image file to a base64 data URL, or preview one.</p>
  <div class="tabs">
    <button class="tab active" data-tab="to">Image → Base64</button>
    <button class="tab" data-tab="from">Base64 → Image</button>
  </div>
  <div class="panel active" id="panel-to">
    <input type="file" id="file" accept="image/*" onchange="toB64()">
    <div class="row"><button class="btn btn-secondary" onclick="copy('b64-out')">Copy</button></div>
    <textarea id="b64-out" readonly style="margin-top:.5rem"></textarea>
  </div>
  <div class="panel" id="panel-from">
    <textarea id="b64-in" placeholder="data:image/png;base64,..." style="min-height:120px"></textarea>
    <div class="row"><button class="btn btn-primary" onclick="fromB64()">Preview</button></div>
    <div id="img-prev" style="margin-top:1rem"></div>
  </div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function toB64(){var f=byId('file').files[0];if(!f)return;var r=new FileReader();r.onload=function(){byId('b64-out').value=r.result;};r.readAsDataURL(f);}
function fromB64(){var v=byId('b64-in').value.trim();if(!v)return;byId('img-prev').innerHTML='<img src="'+v+'" style="max-width:100%;border:1px solid #2d2d2d;border-radius:8px" onerror="this.style.display=\'none\'">';}
</script>
