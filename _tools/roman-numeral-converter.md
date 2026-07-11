---
title: "Roman Numeral Converter"
link: "/tools/roman-numeral-converter/"
description: "Convert between Roman numerals and numbers."
tags:
  - roman
  - numeral
  - converter
category: "Converters"
---
<div class="tui">
  <h1>Roman Numeral Converter</h1>
  <p class="sub">Convert numbers (1–3999) to Roman numerals and back.</p>
  <div class="tabs">
    <button class="tab active" data-tab="nr">Number → Roman</button>
    <button class="tab" data-tab="rn">Roman → Number</button>
  </div>
  <div class="panel active" id="panel-nr">
    <input type="number" id="nr-in" placeholder="1999" min="1" max="3999">
    <div class="row"><button class="btn btn-primary" onclick="nr()">Convert</button><button class="btn btn-secondary" onclick="copy('nr-out')">Copy</button></div>
    <div id="nr-out" class="result"></div>
  </div>
  <div class="panel" id="panel-rn">
    <input type="text" id="rn-in" placeholder="MCMXCIX">
    <div class="row"><button class="btn btn-primary" onclick="rn()">Convert</button><button class="btn btn-secondary" onclick="copy('rn-out')">Copy</button></div>
    <div id="rn-out" class="result"></div>
    <div id="rn-msg" class="msg"></div>
  </div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
var M=[['M',1000],['CM',900],['D',500],['CD',400],['C',100],['XC',90],['L',50],['XL',40],['X',10],['IX',9],['V',5],['IV',4],['I',1]];
function nr(){var n=parseInt(byId('nr-in').value,10);if(!n||n<1||n>3999){byId('nr-out').textContent='';err('rn-msg','Enter a number between 1 and 3999');return;}showMsg('rn-msg','','');var s='';for(var i=0;i<M.length;i++){while(n>=M[i][1]){s+=M[i][0];n-=M[i][1];}}byId('nr-out').textContent=s;}
function rn(){var s=byId('rn-in').value.trim().toUpperCase();if(!s){byId('rn-out').textContent='';return;}var map={I:1,V:5,X:10,L:50,C:100,D:500,M:1000},tot=0,prev=0;for(var i=s.length-1;i>=0;i--){var v=map[s[i]];if(!v){err('rn-msg','Invalid Roman numeral');byId('rn-out').textContent='';return;}tot+=v<prev?-v:v;prev=v;}showMsg('rn-msg','','');byId('rn-out').textContent=String(tot);}
</script>
