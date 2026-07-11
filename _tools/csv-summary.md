---
title: "CSV Summary"
link: "/tools/csv-summary/"
description: "Summarize and profile a CSV file."
tags:
  - csv
  - summary
  - data
  - math
category: "Math & Data"
---
<div class="tui">
  <h1>CSV Summary</h1>
  <p class="sub">Profile columns: types, min/max, sums and distinct counts.</p>
  <textarea id="in" placeholder="name,age,active&#10;Ada,36,true&#10;Linus,54,true&#10;Grace,41,false" style="min-height:140px"></textarea>
  <div class="row"><button class="btn btn-primary" onclick="run()">Summarize</button></div>
  <div id="out" class="result"></div>
  <div id="msg" class="msg"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function parseCsv(t){var rows=[],row=[],f='',q=false,i=0;while(i<t.length){var c=t[i];if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i+=2;continue;}q=false;i++;continue;}f+=c;i++;continue;}if(c==='"'){q=true;i++;continue;}if(c===','){row.push(f);f='';i++;continue;}if(c==='\n'){row.push(f);rows.push(row);row=[];f='';i++;continue;}if(c==='\r'){i++;continue;}f+=c;i++;}if(f.length||row.length){row.push(f);rows.push(row);}return rows;}
function isNum(s){return s!==''&&!isNaN(Number(s));}
function run(){var rows=parseCsv(byId('in').value).filter(function(r){return r.length>1||(r.length===1&&r[0].trim());});if(rows.length<2){err('msg','Need a header row and at least one data row');return;}var head=rows[0],data=rows.slice(1);var lines=[];head.forEach(function(h,ci){var col=data.map(function(r){return r[ci]!==undefined?r[ci].trim():'';});var nums=col.filter(isNum).map(Number);var numeric=nums.length===col.length&&col.length>0;var distinct={};col.forEach(function(v){distinct[v]=(distinct[v]||0)+1;});var summary=h+' ('+(numeric?'numeric':'text')+')';if(numeric){summary+='\n  min: '+Math.min.apply(null,nums)+'\n  max: '+Math.max.apply(null,nums)+'\n  sum: '+nums.reduce(function(a,b){return a+b;},0)+'\n  avg: '+(nums.reduce(function(a,b){return a+b;},0)/nums.length).toFixed(2);}summary+='\n  distinct: '+Object.keys(distinct).length;lines.push(summary);});byId('out').textContent='Rows: '+data.length+'\nColumns: '+head.length+'\n\n'+lines.join('\n\n');showMsg('msg','','');}
</script>
