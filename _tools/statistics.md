---
title: "Statistics Calculator"
link: "/tools/statistics/"
description: "Compute descriptive statistics for a dataset."
tags:
  - statistics
  - math
  - data
category: "Math & Data"
featured: true
---
<div class="tui">
  <h1>Statistics Calculator</h1>
  <p class="sub">Mean, median, mode, variance, standard deviation and more.</p>
  <textarea id="in" placeholder="1, 2, 3, 4, 5, 5" style="min-height:120px"></textarea>
  <div class="row"><button class="btn btn-primary" onclick="run()">Compute</button><button class="btn btn-secondary" onclick="copy('out')">Copy</button></div>
  <div id="out" class="result"></div>
  <div id="msg" class="msg"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function run(){var vals=byId('in').value.split(/[\s,]+/).map(function(x){return parseFloat(x);}).filter(function(x){return !isNaN(x);});if(vals.length===0){err('msg','Enter at least one number');return;}var n=vals.length,s=vals.reduce(function(a,b){return a+b;},0),mean=s/n;var sorted=vals.slice().sort(function(a,b){return a-b;});var med=n%2?sorted[(n-1)/2]:(sorted[n/2-1]+sorted[n/2])/2;var sq=vals.reduce(function(a,b){return a+(b-mean)*(b-mean);},0);var variance=sq/n,ss=sq/(n-1);var modes=function(){var f={},m=0,res=[];vals.forEach(function(v){f[v]=(f[v]||0)+1;if(f[v]>m)m=f[v];});Object.keys(f).forEach(function(k){if(f[k]===m)res.push(k);});return m>1?res.join(', '):'none';};
  var r='Count: '+n+'\nSum: '+s+'\nMin: '+sorted[0]+'\nMax: '+sorted[n-1]+'\nRange: '+(sorted[n-1]-sorted[0])+'\nMean: '+mean+'\nMedian: '+med+'\nMode: '+modes()+'\nVariance (pop): '+variance.toFixed(4)+'\nStd dev (pop): '+Math.sqrt(variance).toFixed(4)+'\nVariance (sample): '+ss.toFixed(4)+'\nStd dev (sample): '+Math.sqrt(ss).toFixed(4);
  byId('out').textContent=r;showMsg('msg','','');
}
</script>
