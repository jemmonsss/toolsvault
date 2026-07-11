---
title: "Cron Parser"
link: "/tools/cron-parser/"
description: "Parse cron expressions and preview next runs."
tags:
  - cron
  - scheduler
  - web
category: "Web & Dev"
---
<div class="tui">
  <h1>Cron Parser</h1>
  <p class="sub">Explain a standard 5-field cron expression and show upcoming runs.</p>
  <input type="text" id="expr" value="0 0 * * *" placeholder="min hour day month weekday" style="font-family:'Courier New',monospace" oninput="run()">
  <div id="desc" class="hint" style="margin-top:.5rem"></div>
  <div id="out" class="result" style="margin-top:1rem"></div>
  <div id="msg" class="msg"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function field(str,min,max){var set=new Set(),star=(str.trim()==='*');if(star){for(var i=min;i<=max;i++)set.add(i);return {set:set,star:true};}str.split(',').forEach(function(part){var step=1,base=part,sp=part.indexOf('/');if(sp>=0){step=+part.slice(sp+1);base=part.slice(0,sp);}var ran=base,dash=ran.indexOf('-'),lo,hi;if(dash>=0){lo=+ran.slice(0,dash);hi=+ran.slice(dash+1);}else{lo=hi=+ran;}if(isNaN(lo))return;for(var v=lo;v<=hi;v+=step)if(v>=min&&v<=max)set.add(v);});return {set:set,star:false};}
function run(){var e=byId('expr').value.trim().split(/\s+/);if(e.length!==5){err('msg','Need 5 fields: min hour day month weekday');return;}showMsg('msg','','');var M=field(e[0],0,59),H=field(e[1],0,23),D=field(e[2],1,31),Mo=field(e[3],1,12),W=field(e[4],0,6);
  byId('desc').textContent='Runs at minute '+[].concat(Array.from(M.set)).sort(function(a,b){return a-b;}).join('/')+' past hour '+[].concat(Array.from(H.set)).sort(function(a,b){return a-b;}).join('/')+', on day-of-month '+(D.star?'*':Array.from(D.set).join('/'))+', month '+(Mo.star?'*':Array.from(Mo.set).join('/'))+', weekday '+(W.star?'*':Array.from(W.set).join('/'));
  var now=new Date();now.setSeconds(0,0);var found=[],cap=0;while(found.length<5&&cap<2000000){var min=now.getMinutes(),hr=now.getHours(),d=now.getDate(),mon=now.getMonth()+1,dow=now.getDay();var domOk=D.star||D.set.has(d),dowOk=W.star||W.set.has(dow),dayOk=(D.star&&W.star)?true:(domOk||dowOk);if(M.set.has(min)&&H.set.has(hr)&&Mo.set.has(mon)&&dayOk)found.push(new Date(now));now.setMinutes(now.getMinutes()+1);cap++;}if(!found.length){err('msg','No upcoming run found in 3+ years');return;}byId('out').textContent=found.map(function(d){return d.toString();}).join('\n');
}
run();
</script>
