---
title: "FiveM Resource List"
link: "/tools/fivem-resource-list/"
description: "Browse the loaded resources and scripts running on any FiveM server."
tags:
  - fivem
  - gta
  - resources
  - scripts
  - server
category: "FiveM"
games_only: true
featured: false
icon: "📦"
---
<div class="tui">
  <h1>FiveM Resource List</h1>
  <p class="sub">View every resource/script a server has started, with filtering.</p>
  <div class="row">
    <div style="flex:1"><label>Server Endpoint / CFX Code</label><input type="text" id="endpoint" placeholder="e.g. 1.2.3.4:30120 or ab12cd"></div>
    <div style="flex:1"><label>Filter Resources</label><input type="text" id="filter" placeholder="e.g. esx"></div>
  </div>
  <div class="row"><button class="btn btn-primary" onclick="load()">Load Resources</button></div>
  <div id="result" class="result" style="margin-top:1rem"></div>
</div>
<script>
function resolveEndpoint(input){
  input=input.trim();
  if(!input)return null;
  var m=input.match(/cfx\.re\/join\/([a-z0-9]+)/i);
  if(m)return {host:m[1]+'.users.cfx.re',path:''};
  if(/^[a-z0-9]{6}$/i.test(input))return {host:input+'.users.cfx.re',path:''};
  if(/^https?:\/\//i.test(input)){
    var u=new URL(input);
    return {host:u.host,path:u.pathname.replace(/\/$/,'')};
  }
  var host=input.replace(/^https?:\/\//i,'').replace(/\/.*$/,'');
  return {host:host,path:''};
}
function esc(s){s=String(s==null?'':s);return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
async function jget(base,file){
  var r=await fetch(base+'/'+file,{mode:'cors',cache:'no-store'});
  if(!r.ok)throw new Error('HTTP '+r.status);
  return r.json();
}
async function load(){
  var input=document.getElementById('endpoint').value.trim();
  var filter=document.getElementById('filter').value.trim().toLowerCase();
  var result=document.getElementById('result');
  if(!input){result.innerHTML='<span style="color:var(--danger)">Enter a server endpoint or CFX code</span>';return;}
  result.textContent='Loading...';result.style.color='var(--text)';
  try{
    var ep=resolveEndpoint(input);
    if(!ep)throw new Error('Invalid input');
    var base='https://'+(ep.host||ep)+(ep.path||'');
    var info=await jget(base,'info.json');
    var resources=info.resources||[];
    var shown=filter?resources.filter(function(r){return r.toLowerCase().includes(filter);}):resources;
    var html='<div class="kv"><span>Total Resources</span><span>'+resources.length+(filter?' ('+shown.length+' matching)':'')+'</span></div>';
    if(shown.length){
      html+='<div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-top:1rem">';
      shown.forEach(function(r){html+='<span class="tag">'+esc(r)+'</span>';});
      html+='</div>';
    }else{
      html+='<p style="margin-top:1rem;color:var(--text-dim)">No resources match your filter.</p>';
    }
    result.innerHTML=html;result.style.color='var(--text)';
  }catch(e){
    result.innerHTML='<strong style="color:var(--danger)">Unable to reach server</strong><br><span style="color:var(--text-dim)">The server may be offline or block external requests. Use the server\'s IP:PORT when possible.</span>';result.style.color='var(--danger)';
  }
}
</script>
