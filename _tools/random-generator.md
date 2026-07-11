---
title: "Random Generator"
link: "/tools/random-generator/"
description: "Generate random integers and roll dice."
tags:
  - random
  - dice
  - generator
category: "Generators"
---
<div class="tui">
  <h1>Random Generator</h1>
  <p class="sub">Generate random integers or roll dice.</p>
  <div class="tabs">
    <button class="tab active" data-tab="num">Random Number</button>
    <button class="tab" data-tab="dice">Dice Roll</button>
  </div>
  <div class="panel active" id="panel-num">
    <div class="row">
      <div style="flex:1"><label>Min</label><input type="number" id="min" value="1"></div>
      <div style="flex:1"><label>Max</label><input type="number" id="max" value="100"></div>
      <div style="flex:1"><label>Count</label><input type="number" id="cnt" value="1" min="1" max="50"></div>
    </div>
    <div class="row"><button class="btn btn-primary" onclick="rnd()">Generate</button><button class="btn btn-secondary" onclick="copy('num-out')">Copy</button></div>
    <div id="num-out" class="result"></div>
  </div>
  <div class="panel" id="panel-dice">
    <div class="row">
      <div style="flex:1"><label>Sides</label><select id="sides"><option>4</option><option>6</option><option>8</option><option>10</option><option>12</option><option>20</option><option>100</option></select></div>
      <div style="flex:1"><label>Count</label><input type="number" id="dcnt" value="2" min="1" max="20"></div>
    </div>
    <div class="row"><button class="btn btn-primary" onclick="roll()">Roll</button><button class="btn btn-secondary" onclick="copy('dice-out')">Copy</button></div>
    <div id="dice-out" class="result"></div>
  </div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function rnd(){var min=parseInt(byId('min').value,10),max=parseInt(byId('max').value,10),cnt=Math.min(50,Math.max(1,parseInt(byId('cnt').value,10)||1));if(min>max){var t=min;min=max;max=t;}var a=[];for(var i=0;i<cnt;i++)a.push(Math.floor(Math.random()*(max-min+1))+min);byId('num-out').textContent=a.join('\n');}
function roll(){var s=parseInt(byId('sides').value,10),c=Math.min(20,Math.max(1,parseInt(byId('dcnt').value,10)||1));var a=[];for(var i=0;i<c;i++)a.push(Math.floor(Math.random()*s)+1);byId('dice-out').textContent=a.join(', ')+'\nTotal: '+a.reduce(function(x,y){return x+y;},0);}
</script>
