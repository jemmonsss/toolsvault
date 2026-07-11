---
title: "chmod Calculator"
link: "/tools/chmod-calculator/"
description: "Compute Unix file permissions from numeric or symbolic mode."
tags:
  - chmod
  - permissions
  - unix
  - converter
category: "Converters"
---
<div class="tui">
  <h1>chmod Calculator</h1>
  <p class="sub">Convert between numeric and symbolic Unix permissions.</p>
  <label>Numeric mode (e.g. 755)</label>
  <input type="text" id="num" placeholder="755" oninput="fromNum()">
  <div class="grid2" style="margin-top:1rem">
    <div><h3>Owner</h3><label><input type="checkbox" class="bx" data-c="0" data-p="4" onchange="fromBox()"> read</label><br><label><input type="checkbox" class="bx" data-c="0" data-p="2" onchange="fromBox()"> write</label><br><label><input type="checkbox" class="bx" data-c="0" data-p="1" onchange="fromBox()"> execute</label></div>
    <div><h3>Group</h3><label><input type="checkbox" class="bx" data-c="1" data-p="4" onchange="fromBox()"> read</label><br><label><input type="checkbox" class="bx" data-c="1" data-p="2" onchange="fromBox()"> write</label><br><label><input type="checkbox" class="bx" data-c="1" data-p="1" onchange="fromBox()"> execute</label></div>
    <div><h3>Others</h3><label><input type="checkbox" class="bx" data-c="2" data-p="4" onchange="fromBox()"> read</label><br><label><input type="checkbox" class="bx" data-c="2" data-p="2" onchange="fromBox()"> write</label><br><label><input type="checkbox" class="bx" data-c="2" data-p="1" onchange="fromBox()"> execute</label></div>
  </div>
  <div id="sym" class="result" style="margin-top:1rem"></div>
  <table id="tbl" style="margin-top:1rem"></table>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function digit(c){var d=0;document.querySelectorAll('.bx[data-c="'+c+'"]').forEach(function(b){if(b.checked)d+=+b.dataset.p;});return d;}
function fromBox(){var n=''+digit(0)+digit(1)+digit(2);byId('num').value=n;render(n);}
function fromNum(){var n=byId('num').value.trim();if(/^[0-7]{1,3}$/.test(n)){while(n.length<3)n='0'+n;render(n);for(var c=0;c<3;c++){var d=+n[c];document.querySelectorAll('.bx[data-c="'+c+'"]').forEach(function(b){b.checked=(d&+b.dataset.p)!==0;});}}}
function render(n){while(n.length<3)n='0'+n;var sym=n.split('').map(function(d){d=+d;return (d&4?'r':'-')+(d&2?'w':'-')+(d&1?'x':'-');}).join('');byId('sym').textContent='chmod '+n+'  ('+sym+')';
  var rows=[['','read','write','execute']];var names=['Owner','Group','Others'];for(var c=0;c<3;c++){var d=+n[c];rows.push([names[c],(d&4)?'yes':'no',(d&2)?'yes':'no',(d&1)?'yes':'no']);}
  byId('tbl').innerHTML=rows.map(function(r){return '<tr>'+r.map(function(x){return '<td>'+x+'</td>';}).join('')+'</tr>';}).join('');
}
</script>
