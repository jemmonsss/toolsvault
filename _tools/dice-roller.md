---
title: "Dice Roller"
link: "/tools/dice-roller/"
description: "Roll dice with custom sides and quantities."
tags:
  - dice
  - chance
  - casual
category: "Games"
---
<div class="tui">
  <h1>Dice Roller</h1>
  <p class="sub">Roll virtual dice for tabletop games or random decisions.</p>
  <div class="row">
    <div style="flex:1"><label>Dice</label><select id="count"><option>1</option><option>2</option><option selected>3</option><option>4</option><option>5</option><option>6</option></select></div>
    <div style="flex:1"><label>Sides</label><select id="sides"><option>4</option><option>6</option><option>8</option><option selected>10</option><option>12</option><option>20</option></select></div>
  </div>
  <div class="row"><button class="btn btn-primary" onclick="roll()">Roll Dice</button><button class="btn btn-secondary" onclick="copy('out')">Copy</button></div>
  <div id="out" class="result"></div>
</div>
<script>
function roll(){const c=parseInt(document.getElementById('count').value),s=parseInt(document.getElementById('sides').value),a=[];for(let i=0;i<c;i++)a.push(Math.floor(Math.random()*s)+1);const el=document.getElementById('out');el.textContent=a.join(', ')+'\nTotal: '+a.reduce((x,y)=>x+y,0);}
function copy(id){const el=document.getElementById(id);el.select();document.execCommand('copy');}
</script>
