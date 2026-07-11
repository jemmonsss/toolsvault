---
title: "Random Choice Picker"
link: "/tools/choice-picker/"
description: "Pick a random item from a list."
tags:
  - random
  - picker
  - decision
  - math
category: "Math & Data"
---
<div class="tui">
  <h1>Random Choice Picker</h1>
  <p class="sub">Add options and let fate decide.</p>
  <textarea id="opts" placeholder="Pizza&#10;Sushi&#10;Burgers&#10;Tacos" style="min-height:140px"></textarea>
  <div class="row"><button class="btn btn-primary" onclick="pick()">Pick one</button><label><input type="checkbox" id="multi"> pick 3</label></div>
  <div id="result" class="big" style="margin-top:1rem;text-align:center"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function pick(){var list=byId('opts').value.split('\n').map(function(x){return x.trim();}).filter(Boolean);if(!list.length){byId('result').textContent='';return;}if(byId('multi').checked){var k=Math.min(3,list.length),pool=list.slice(),chosen=[];for(var i=0;i<k;i++){var idx=Math.floor(Math.random()*pool.length);chosen.push(pool.splice(idx,1)[0]);}byId('result').textContent=chosen.join('  •  ');}else{byId('result').textContent=list[Math.floor(Math.random()*list.length)];}}
</script>
