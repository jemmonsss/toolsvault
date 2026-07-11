---
title: "Units Converter"
link: "/tools/units-converter/"
description: "Convert between common units of measurement."
tags:
  - units
  - converter
  - measurement
category: "Converters"
---
<div class="tui">
  <h1>Units Converter</h1>
  <p class="sub">Convert length, mass, temperature, time, data and more.</p>
  <div class="row">
    <div style="flex:1"><label>Category</label><select id="cat" onchange="fillUnits()"></select></div>
    <div style="flex:1"><label>From</label><select id="from" onchange="run()"></select></div>
    <div style="flex:1"><label>To</label><select id="to" onchange="run()"></select></div>
  </div>
  <label>Value</label>
  <input type="number" id="val" placeholder="1" value="1" oninput="run()">
  <div id="res" class="big" style="margin-top:1rem"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
var U={
  Length:{m:1,km:1000,cm:0.01,mm:0.001,mile:1609.344,yard:0.9144,foot:0.3048,inch:0.0254},
  Mass:{kg:1,g:0.001,mg:0.000001,lb:0.45359237,oz:0.0283495231,ton:1000},
  Time:{s:1,min:60,h:3600,day:86400,week:604800},
  Data:{B:1,KB:1000,MB:1000000,GB:1000000000,TB:1000000000000,KiB:1024,MiB:1048576,GiB:1073741824,TiB:1099511627776},
  Speed:{ms:1,kph:0.277778,mph:0.44704},
  Area:{m2:1,km2:1000000,cm2:0.0001,hectare:10000,acre:4046.8564224,ft2:0.09290304},
  Volume:{l:1,ml:0.001,m3:1000,gal:3.785411784,cup:0.2365882365,floz:0.0295735296}
};
function fillUnits(){var c=byId('cat').value;var us=Object.keys(U[c]);byId('from').innerHTML=us.map(function(u){return '<option>'+u+'</option>';}).join('');byId('to').innerHTML=us.map(function(u){return '<option>'+u+'</option>';}).join('');byId('to').selectedIndex=1;run();}
function run(){var c=byId('cat').value;var f=byId('from').value,t=byId('to').value;var v=parseFloat(byId('val').value);if(isNaN(v)){byId('res').textContent='';return;}
  if(c==='Temperature'){byId('res').textContent=temp(v,f,t);return;}
  var base=v*U[c][f];byId('res').textContent=(base/U[c][t]);}
function temp(v,f,t){if(f==='C'){v=v+273.15;}else if(f==='F'){v=(v-32)*5/9+273.15;}if(t==='C')return(v-273.15);if(t==='F')return((v-273.15)*9/5+32);return v;}
byId('cat').innerHTML=Object.keys(U).map(function(c){return '<option>'+c+'</option>';}).join('');
fillUnits();
</script>
