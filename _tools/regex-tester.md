---
title: "Regex Tester"
link: "/tools/regex-tester/"
description: "Test JavaScript regular expressions live."
tags:
  - regex
  - tester
  - web
category: "Web & Dev"
---
<div class="tui">
  <h1>Regex Tester</h1>
  <p class="sub">Test regular expressions against your text.</p>
  <div class="row"><div style="flex:2"><label>Pattern</label><input type="text" id="pat" placeholder="\b\w+@\w+\.\w+"></div><div style="flex:1"><label>Flags</label><input type="text" id="flags" value="g" placeholder="gi"></div></div>
  <label>Test string</label><textarea id="txt" placeholder="Contact ada@example.com or linus@kernel.org" style="min-height:140px"></textarea>
  <div class="row"><button class="btn btn-primary" onclick="run()">Test</button><button class="btn btn-secondary" onclick="copy('out')">Copy matches</button></div>
  <div id="hl" style="margin-top:1rem;white-space:pre-wrap;font-family:'Courier New',monospace;font-size:.9rem;line-height:1.6"></div>
  <div id="out" class="result"></div>
  <div id="msg" class="msg"></div>
</div>
<style>.tui mark{background:#8b5cf6;color:#fff;border-radius:3px;padding:0 2px}</style>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function esc(s){return s.replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function run(){var p=byId('pat').value,f=byId('flags').value,t=byId('txt').value;byId('out').textContent='';byId('msg').className='msg';if(!p){byId('hl').textContent=t;return;}var re;try{re=new RegExp(p,f);}catch(e){err('msg',e.message);byId('hl').textContent=t;return;}var g=re.global?re:new RegExp(re.source,re.flags+'g');var res='',last=0,m;while((m=g.exec(t))!==null){res+='@'+m.index+': '+JSON.stringify(m[0])+(m.length>1?(' groups='+JSON.stringify(m.slice(1))):'')+'\n';byId('hl').innerHTML=esc(t.slice(last,m.index))+'<mark>'+esc(m[0])+'</mark>';last=m.index+m[0].length;if(m[0]==='')g.lastIndex++;}byId('hl').innerHTML+=esc(t.slice(last));byId('out').textContent=res||'(no matches)';showMsg('msg',re.global?(''+((res.match(/@/g)||[]).length)+' match(es)'):'','');}
</script>
