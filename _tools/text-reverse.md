---
title: "Text Reverser"
link: "/tools/text-reverse/"
description: "Reverse text, words or lines."
tags:
  - reverse
  - text
category: "Text & Strings"
---
<div class="tui">
  <h1>Text Reverser</h1>
  <p class="sub">Reverse characters, words or lines, or scramble letters.</p>
  <textarea id="in" placeholder="hello world" style="min-height:140px"></textarea>
  <div class="row">
    <button class="btn btn-secondary" onclick="act('chars')">Reverse chars</button>
    <button class="btn btn-secondary" onclick="act('words')">Reverse words</button>
    <button class="btn btn-secondary" onclick="act('lines')">Reverse lines</button>
    <button class="btn btn-secondary" onclick="act('scramble')">Scramble</button>
    <button class="btn btn-primary" onclick="copy('out')">Copy</button>
  </div>
  <div id="out" class="result"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function act(k){var t=byId('in').value;var r;if(k==='chars')r=t.split('').reverse().join('');else if(k==='words')r=t.split(/\s+/).reverse().join(' ');else if(k==='lines')r=t.split('\n').reverse().join('\n');else if(k==='scramble'){var a=t.split('');for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var x=a[i];a[i]=a[j];a[j]=x;}r=a.join('');}byId('out').textContent=r;}
</script>
