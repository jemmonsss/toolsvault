---
title: "QR Code Generator"
link: "/tools/qr-generator/"
description: "Generate QR codes from any text or URL."
tags:
  - qr
  - generator
category: "Generators"
---
<div class="tui">
  <h1>QR Code Generator</h1>
  <p class="sub">Generate a scannable QR code from text or a URL.</p>
  <textarea id="qr-text" placeholder="https://toolsvault.org" oninput="make()"></textarea>
  <div class="row">
    <div style="flex:1"><label>Error correction</label><select id="ec"><option value="L">L</option><option value="M" selected>M</option><option value="Q">Q</option><option value="H">H</option></select></div>
    <div style="flex:1"><label>Size</label><input type="number" id="px" value="6" min="2" max="20"></div>
  </div>
  <div class="row"><button class="btn btn-primary" onclick="make()">Generate</button><button class="btn btn-secondary" onclick="copySvg()">Copy SVG</button></div>
  <div id="qr" style="margin-top:1rem;background:#fff;display:inline-block;padding:8px;border-radius:8px"></div>
  <div id="msg" class="msg"></div>
</div>
<script src="{{ '/assets/js/qrcode.min.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function make(){try{var text=byId('qr-text').value||' ';var qr=qrcode(0,byId('ec').value);qr.addData(text);qr.make();var sz=parseInt(byId('px').value,10)||6;byId('qr').innerHTML=qr.createSvgTag({cellSize:sz,margin:4});showMsg('msg','','');}catch(e){err('msg','Input too long for this error-correction level');}}
function copySvg(){var svg=byId('qr').querySelector('svg');if(svg)copyText(svg.outerHTML);}
make();
</script>
