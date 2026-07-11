---
title: "Dummy JSON Generator"
link: "/tools/dummy-json-generator/"
description: "Generate random JSON fixtures for testing."
tags:
  - json
  - dummy
  - generator
  - fixtures
category: "Generators"
---
<div class="tui">
  <h1>Dummy JSON Generator</h1>
  <p class="sub">Create random JSON structures (no personal data) for testing.</p>
  <div class="row">
    <div style="flex:1"><label>Objects</label><input type="number" id="objs" value="2" min="1" max="50"></div>
    <div style="flex:1"><label>Max depth</label><input type="number" id="depth" value="2" min="1" max="4"></div>
    <div style="flex:1"><label>Fields / object</label><input type="number" id="fields" value="4" min="1" max="10"></div>
  </div>
  <div class="row"><button class="btn btn-primary" onclick="gen()">Generate</button><button class="btn btn-secondary" onclick="copy('out')">Copy</button></div>
  <div id="out" class="result"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
var WORDS=['alpha','beta','gamma','delta','value','item','count','status','name','flag','size','score','enabled','active','label','total','data','node','level','index'];
function ri(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function pick(a){return a[ri(0,a.length-1)];}
function prim(){var r=Math.random();if(r<0.3)return pick(WORDS)+'_'+ri(1,999);if(r<0.55)return ri(0,1000);if(r<0.75)return Math.random()<0.5;if(r<0.9)return [ri(1,9),ri(1,9),ri(1,9)];return null;}
function val(d){if(d<=1)return prim();if(Math.random()<0.5)return prim();var o={};var n=ri(1,Math.max(1,parseInt(byId('fields').value,10)));for(var i=0;i<n;i++)o[pick(WORDS)]=val(d-1);return o;}
function gen(){var out=[];var no=Math.min(50,Math.max(1,parseInt(byId('objs').value,10)||1));for(var i=0;i<no;i++)out.push(val(Math.max(1,parseInt(byId('depth').value,10))));byId('out').textContent=JSON.stringify(out.length===1?out[0]:out,null,2);}
</script>
