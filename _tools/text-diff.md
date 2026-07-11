---
title: "Text Diff"
link: "/tools/text-diff/"
description: "Compare two blocks of text line by line."
tags:
  - diff
  - compare
  - text
category: "Text & Strings"
---
<div class="tui">
  <h1>Text Diff</h1>
  <p class="sub">Line-by-line comparison of two texts.</p>
  <div class="grid2">
    <div><label>Original</label><textarea id="a" placeholder="first&#10;second&#10;third"></textarea></div>
    <div><label>Changed</label><textarea id="b" placeholder="first&#10;third&#10;fourth"></textarea></div>
  </div>
  <div class="row"><button class="btn btn-primary" onclick="diff()">Compare</button></div>
  <div id="out" style="margin-top:1rem;font-family:'Courier New',monospace;font-size:.9rem;white-space:pre-wrap"></div>
</div>
<style>
.d-add{background:rgba(34,197,94,.12);color:#22c55e;display:block;padding:.1rem .4rem}
.d-del{background:rgba(239,68,68,.12);color:#ef4444;display:block;padding:.1rem .4rem}
.d-eq{display:block;padding:.1rem .4rem;color:#9ca3af}
</style>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function lcs(a,b){var m=a.length,n=b.length,dp=[];for(var i=0;i<=m;i++){dp[i]=new Array(n+1).fill(0);}for(var i=m-1;i>=0;i--)for(var j=n-1;j>=0;j--){dp[i][j]=a[i]===b[j]?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);}var i=0,j=0,res=[];while(i<m&&j<n){if(a[i]===b[j]){res.push(['eq',a[i]]);i++;j++;}else if(dp[i+1][j]>=dp[i][j+1]){res.push(['del',a[i]]);i++;}else{res.push(['add',b[j]]);j++;}}while(i<m)res.push(['del',a[i++]]);while(j<n)res.push(['add',b[j++]]);return res;}
function diff(){var a=byId('a').value.split('\n'),b=byId('b').value.split('\n');var r=lcs(a,b);byId('out').innerHTML=r.map(function(x){return '<span class="d-'+x[0]+'">'+(x[0]==='add'?'+ ':(x[0]==='del'?'- ':'  '))+escapeHtml(x[1])+'</span>';}).join('');}
function escapeHtml(s){return s.replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
</script>
