---
title: "FiveM Server Status"
link: "/tools/fivem-server-status/"
description: "Check any FiveM server's status, player count, map, version and live players."
tags:
  - fivem
  - gta
  - server
  - status
  - gtarp
category: "FiveM"
games_only: true
featured: true
icon: "🎮"
---
<div class="tui">
  <h1>FiveM Server Status</h1>
  <p class="sub">Enter a server endpoint, <code>cfx.re/join</code> URL, or CFX code to view live status.</p>
  <div class="row">
    <div style="flex:1"><label>Server Endpoint / CFX Code</label><input type="text" id="endpoint" placeholder="e.g. 1.2.3.4:30120 or https://cfx.re/join/ab12cd"></div>
  </div>
  <div class="row"><button class="btn btn-primary" onclick="check()">Check Status</button></div>
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
async function check(){
  var input=document.getElementById('endpoint').value.trim();
  var result=document.getElementById('result');
  if(!input){result.innerHTML='<span style="color:var(--danger)">Enter a server endpoint or CFX code</span>';return;}
  result.textContent='Loading...';result.style.color='var(--text)';
  try{
    var ep=resolveEndpoint(input);
    if(!ep)throw new Error('Invalid input');
    var base='https://'+(ep.host||ep)+(ep.path||'');
    var info,players=[];
    try{info=await jget(base,'info.json');}catch(e){info=null;}
    try{players=await jget(base,'players.json');}catch(e){players=[];}
    if(!info && !players.length)throw new Error('No response from server');
    var name=(info&&info.vars&&(info.vars.sv_projectName||info.vars.DisplayName))||(info&&info.hostname)||(players.length?players[0].name:'Unknown');
    var clients=(info&&typeof info.clients==='number')?info.clients:players.length;
    var max=(info&&(info.sv_maxclients||info.sv_maxClients))||(info&&info.vars&&info.vars.sv_maxClients)||'-';
    var map=(info&&info.mapname)||(info&&info.vars&&info.vars.sv_projectDesc)||'-';
    var gametype=(info&&info.gametype)||(info&&info.vars&&info.vars.gametype)||'-';
    var version=(info&&info.server)||(info&&info.vars&&info.vars.sv_enforceGameBuild)||'-';
    var resources=(info&&info.resources)||[];
    var varKeys=info&&info.vars?Object.keys(info.vars):[];
    var html='<div style="display:flex;flex-direction:column;gap:.75rem">';
    html+='<div class="kv"><span>Name</span><span>'+esc(name)+'</span></div>';
    html+='<div class="kv"><span>Status</span><span style="color:#22c55e">Online</span></div>';
    html+='<div class="kv"><span>Players</span><span>'+esc(clients)+' / '+esc(max)+'</span></div>';
    html+='<div class="kv"><span>Game Type</span><span>'+esc(gametype)+'</span></div>';
    html+='<div class="kv"><span>Map</span><span>'+esc(map)+'</span></div>';
    html+='<div class="kv"><span>Version</span><span>'+esc(version)+'</span></div>';
    html+='<div class="kv"><span>Resources</span><span>'+resources.length+'</span></div>';
    html+='</div>';
    if(varKeys.length){
      html+='<h3 style="margin-top:1.5rem;margin-bottom:.5rem;font-size:1rem">Server Variables</h3><div style="display:flex;flex-wrap:wrap;gap:.4rem">';
      varKeys.slice(0,16).forEach(function(k){
        html+='<span class="tag">'+esc(k)+': '+esc((info.vars[k]||'').toString().slice(0,40))+'</span>';
      });
      html+='</div>';
    }
    if(players.length){
      html+='<h3 style="margin-top:1.5rem;margin-bottom:.5rem;font-size:1rem">Online Players ('+players.length+')</h3>';
      html+='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse">';
      html+='<tr style="background:var(--bg-elev2)"><th style="text-align:left;padding:.5rem;border-bottom:1px solid var(--border)">ID</th><th style="text-align:left;padding:.5rem;border-bottom:1px solid var(--border)">Name</th><th style="text-align:right;padding:.5rem;border-bottom:1px solid var(--border)">Ping</th></tr>';
      players.forEach(function(p){
        html+='<tr><td style="padding:.5rem;border-bottom:1px solid var(--border)">'+(p.id!=null?esc(p.id):'-')+'</td>';
        html+='<td style="padding:.5rem;border-bottom:1px solid var(--border)">'+esc(p.name||'')+'</td>';
        html+='<td style="padding:.5rem;border-bottom:1px solid var(--border);text-align:right">'+(p.ping!=null?esc(p.ping):'-')+'</td></tr>';
      });
      html+='</table></div>';
    }
    result.innerHTML=html;result.style.color='var(--text)';
  }catch(e){
    result.innerHTML='<strong style="color:var(--danger)">Unable to reach server</strong><br><span style="color:var(--text-dim)">The server may be offline, block external requests, or the endpoint is incorrect. Tip: use the server\'s IP:PORT (e.g. 1.2.3.4:30120) rather than just a CFX code, since FiveM\'s public directory API was retired.</span>';result.style.color='var(--danger)';
  }
}
</script>
