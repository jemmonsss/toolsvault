---
title: "Passphrase Generator"
link: "/tools/passphrase-generator/"
description: "Generate memorable passphrases from random words."
tags:
  - passphrase
  - password
  - generator
  - security
category: "Generators"
---
<div class="tui">
  <h1>Passphrase Generator</h1>
  <p class="sub">Generate strong, memorable passphrases.</p>
  <div class="row">
    <div style="flex:1"><label>Words</label><input type="number" id="wc" value="4" min="2" max="12"></div>
    <div style="flex:1"><label>Separator</label><select id="sep"><option value="-">-</option><option value=".">.</option><option value="_">_</option><option value=" ">space</option></select></div>
    <div style="flex:1"><label>Capitalize</label><select id="cap"><option value="no">no</option><option value="first" selected>first letter</option><option value="all">all</option></select></div>
    <div style="flex:1"><label>Add number</label><select id="num"><option value="no" selected>no</option><option value="yes">yes</option></select></div>
  </div>
  <div class="row"><button class="btn btn-primary" onclick="gen()">Generate</button><button class="btn btn-secondary" onclick="copy('out')">Copy</button></div>
  <div id="out" class="result"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
var WORDS=['apple','bread','cloud','diamond','eagle','forest','garden','harbor','island','jungle','kitten','lemon','mountain','needle','ocean','puzzle','quartz','river','silver','tiger','umbrella','valley','window','yellow','zebra','bridge','candle','dragon','engine','feather','galaxy','hammer','icicle','jigsaw','kettle','lantern','maple','nugget','orbit','pencil','quiver','raven','shadow','thunder','violet','willow','xenon','yarrow','zephyr','amber','birch','coral','daisy','ember','frost','glacier','hawk','indigo','jade','lotus','moss','north','onyx','pearl','rain','snow','stone','twilight','wave','wind'];
function gen(){var wc=Math.min(12,Math.max(2,parseInt(byId('wc').value,10)||4));var sep=byId('sep').value;var cap=byId('cap').value;var num=byId('num').value;var a=[];for(var i=0;i<wc;i++){var w=WORDS[Math.floor(Math.random()*WORDS.length)];if(cap==='first')w=w[0].toUpperCase()+w.slice(1);else if(cap==='all')w=w.toUpperCase();a.push(w);}if(num==='yes')a.push(Math.floor(Math.random()*900+100));byId('out').textContent=a.join(sep);}
gen();
</script>
