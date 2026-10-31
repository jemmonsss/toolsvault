---
title: "FiveM Server Search"
link: "/tools/fivem-server-search/"
description: "Look up a FiveM server by CFX code or endpoint and preview its details."
tags:
  - fivem
  - gta
  - server
  - search
  - lookup
category: "FiveM"
games_only: true
featured: false
icon: "🔎"
---
<div class="tui">
  <h1>FiveM Server Search</h1>
  <p class="sub">Paste a CFX code, <code>cfx.re/join</code> URL, or <code>IP:PORT</code> to look the server up.</p>
  <div class="row">
    <div style="flex:1"><label>Server Code / Endpoint</label><input type="text" id="endpoint" placeholder="e.g. ab12cd or 1.2.3.4:30120"></div>
  </div>
  <div class="row"><button class="btn btn-primary" onclick="lookup()">Look Up</button></div>
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
async function lookup(){
  var input=document.getElementById('endpoint').value.trim();
  var result=document.getElementById('result');
  if(!input){result.innerHTML='<span style="color:var(--danger)">Enter a server code or endpoint</span>';return;}
  result.textContent='Loading...';result.style.color='var(--text)';
  try{
    var ep=resolveEndpoint(input);
    if(!ep)throw new Error('Invalid input');
    var base='https://'+(ep.host||ep)+(ep.path||'');
    var info=await jget(base,'info.json');
    var name=(info.vars&&(info.vars.sv_projectName||info.vars.DisplayName))||info.hostname||'Unknown';
    var clients=(typeof info.clients==='number')?info.clients:'?';
    var max=(info.sv_maxclients||info.sv_maxClients||(info.vars&&info.vars.sv_maxClients)||'?');
    var desc=(info.vars&&info.vars.sv_projectDesc)||'-';
    var tags=(info.vars&&info.vars.tags)||'-';
    var owner=(info.ownerName)||(info.vars&&info.vars.sv_projectOwnermail)||'-';
    var connect=(info.connectEndPoints&&info.connectEndPoints[0])||base.replace('https://','');
    var html='<div style="display:flex;flex-direction:column;gap:.75rem">';
    html+='<div class="kv"><span>Project Name</span><span>'+esc(name)+'</span></div>';
    if(desc!=='-')html+='<div class="kv"><span>Description</span><span>'+esc(desc)+'</span></div>';
    html+='<div class="kv"><span>Players</span><span>'+esc(clients)+' / '+esc(max)+'</span></div>';
    html+='<div class="kv"><span>Game Type</span><span>'+esc(info.gametype||'-')+'</span></div>';
    html+='<div class="kv"><span>Map</span><span>'+esc(info.mapname||'-')+'</span></div>';
    html+='<div class="kv"><span>Resources</span><span>'+(info.resources||[]).length+'</span></div>';
    html+='<div class="kv"><span>Owner</span><span>'+esc(owner)+'</span></div>';
    html+='<div class="kv"><span>Connect</span><span>'+esc(connect)+'</span></div>';
    if(tags!=='-')html+='<div class="kv"><span>Tags</span><span>'+esc(tags)+'</span></div>';
    html+='</div>';
    html+='<p style="margin-top:1rem"><a class="btn btn-primary" href="'+esc('https://cfx.re/join/'+input.replace(/[^a-z0-9]/gi,''))+'" target="_blank" rel="noopener">Open on cfx.re ↗</a></p>';
    result.innerHTML=html;result.style.color='var(--text)';
  }catch(e){
    result.innerHTML='<strong style="color:var(--danger)">Server not found</strong><br><span style="color:var(--text-dim)">Could not reach that server. Verify the code/endpoint and that the server allows external requests.</span>';result.style.color='var(--danger)';
  }
}
</script>
