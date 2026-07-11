---
title: "Percentage Calculator"
link: "/tools/percentage-calculator/"
description: "Solve common percentage problems."
tags:
  - percentage
  - calculator
  - math
category: "Math & Data"
---
<div class="tui">
  <h1>Percentage Calculator</h1>
  <p class="sub">Common percentage calculations.</p>
  <div class="tabs">
    <button class="tab active" data-tab="of">X% of Y</button>
    <button class="tab" data-tab="is">X is what % of Y</button>
    <button class="tab" data-tab="chg">Change A → B</button>
  </div>
  <div class="panel active" id="panel-of">
    <div class="row"><div style="flex:1"><label>X %</label><input type="number" id="of-x" value="15"></div><div style="flex:1"><label>Y</label><input type="number" id="of-y" value="200"></div></div>
    <div class="row"><button class="btn btn-primary" onclick="of()">Calculate</button></div>
    <div id="of-out" class="big"></div>
  </div>
  <div class="panel" id="panel-is">
    <div class="row"><div style="flex:1"><label>X</label><input type="number" id="is-x" value="30"></div><div style="flex:1"><label>Y</label><input type="number" id="is-y" value="120"></div></div>
    <div class="row"><button class="btn btn-primary" onclick="is()">Calculate</button></div>
    <div id="is-out" class="big"></div>
  </div>
  <div class="panel" id="panel-chg">
    <div class="row"><div style="flex:1"><label>From A</label><input type="number" id="chg-a" value="80"></div><div style="flex:1"><label>To B</label><input type="number" id="chg-b" value="100"></div></div>
    <div class="row"><button class="btn btn-primary" onclick="chg()">Calculate</button></div>
    <div id="chg-out" class="big"></div>
  </div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function of(){var x=+byId('of-x').value,y=+byId('of-y').value;byId('of-out').textContent=(x/100*y);}
function is(){var x=+byId('is-x').value,y=+byId('is-y').value;byId('is-out').textContent=y?(x/y*100).toFixed(2)+'%':'(divide by zero)';}
function chg(){var a=+byId('chg-a').value,b=+byId('chg-b').value;byId('chg-out').textContent=a?(((b-a)/Math.abs(a))*100).toFixed(2)+'% '+(b>=a?'increase':'decrease'):'(divide by zero)';}
</script>
