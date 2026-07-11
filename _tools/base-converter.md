---
title: "Number Base Converter"
link: "/tools/base-converter/"
description: "Convert numbers between binary, octal, decimal and hex."
tags:
  - base
  - binary
  - hex
  - converter
category: "Converters"
---
<div class="tui">
  <h1>Number Base Converter</h1>
  <p class="sub">Convert integers between base 2, 8, 10 and 16.</p>
  <label>Input value</label>
  <input type="text" id="val" placeholder="255" oninput="run()">
  <label>Input base</label>
  <select id="from" onchange="run()">
    <option value="2">Binary (2)</option>
    <option value="8">Octal (8)</option>
    <option value="10" selected>Decimal (10)</option>
    <option value="16">Hexadecimal (16)</option>
  </select>
  <div class="row" style="margin-top:1rem">
    <div style="flex:1"><label>Binary</label><div id="b2" class="result"></div></div>
    <div style="flex:1"><label>Octal</label><div id="b8" class="result"></div></div>
    <div style="flex:1"><label>Decimal</label><div id="b10" class="result"></div></div>
    <div style="flex:1"><label>Hex</label><div id="b16" class="result"></div></div>
  </div>
  <div id="msg" class="msg"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function run(){var s=byId('val').value.trim();var f=byId('from').value;if(!s){['b2','b8','b10','b16'].forEach(function(id){byId(id).textContent='';});byId('msg').className='msg';return;}
  try{var v=(f==='10')?BigInt(s):BigInt(parseInt(s,parseInt(f)));byId('b2').textContent=v.toString(2);byId('b8').textContent=v.toString(8);byId('b10').textContent=v.toString(10);byId('b16').textContent=v.toString(16).toUpperCase();showMsg('msg','','');}catch(e){err('msg','Invalid number for base '+f);}}
</script>
