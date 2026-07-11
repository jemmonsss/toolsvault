---
title: "Lines Toolkit"
link: "/tools/line-tools/"
description: "Sort, dedupe, reverse and shuffle lines."
tags:
  - lines
  - sort
  - dedupe
  - text
category: "Text & Strings"
---
<div class="tui">
  <h1>Lines Toolkit</h1>
  <p class="sub">Sort, remove duplicates, reverse and shuffle lines.</p>
  <textarea id="in" placeholder="one&#10;two&#10;one&#10;three" style="min-height:200px"></textarea>
  <div class="row">
    <button class="btn btn-secondary" onclick="act('sort')">Sort A→Z</button>
    <button class="btn btn-secondary" onclick="act('sortr')">Sort Z→A</button>
    <button class="btn btn-secondary" onclick="act('dedupe')">Remove duplicates</button>
    <button class="btn btn-secondary" onclick="act('reverse')">Reverse</button>
    <button class="btn btn-secondary" onclick="act('shuffle')">Shuffle</button>
    <button class="btn btn-primary" onclick="copy('out')">Copy result</button>
  </div>
  <div id="out" class="result"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function act(k){var lines=byId('in').value.split('\n');if(k==='sort')lines.sort();else if(k==='sortr')lines.sort().reverse();else if(k==='dedupe'){var s={},o=[];lines.forEach(function(l){if(!(l in s)){s[l]=1;o.push(l);}});lines=o;}else if(k==='reverse')lines.reverse();else if(k==='shuffle'){for(var i=lines.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=lines[i];lines[i]=lines[j];lines[j]=t;}}byId('out').textContent=lines.join('\n');}
</script>
