---
title: "FiveM Player Lookup"
link: "/tools/fivem-player-lookup/"
description: "Search for a specific player on any FiveM server by name, id, or identifier."
tags:
  - fivem
  - gta
  - player
  - search
  - gtarp
category: "FiveM"
games_only: true
featured: true
icon: "🔍"
---
<div class="tui">
  <h1>FiveM Player Lookup</h1>
  <p class="sub">Enter a server endpoint or CFX code, then search players by name or id.</p>
  <div class="row">
    <div style="flex:1"><label>Server Endpoint / CFX Code</label><input type="text" id="endpoint" placeholder="e.g. 1.2.3.4:30120 or ab12cd"></div>
    <div style="flex:1"><label>Player Name / ID</label><input type="text" id="q" placeholder="e.g. JohnDoe or 13"></div>
  </div>
  <div class="row"><button class="btn btn-primary" onclick="search()">Search</button></div>
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
function shortIdent(ids){
  if(!ids||!ids.length)return '-';
  var d=ids.find(function(i){return i.indexOf('discord:')===0;});
  if(d)return 'discord:'+d.split(':')[1];
  return ids[0].split(':')[0]+':…';
}
async function search(){
  var input=document.getElementById('endpoint').value.trim();
  var q=document.getElementById('q').value.trim();
  var result=document.getElementById('result');
  if(!input||!q){result.innerHTML='<span style="color:var(--danger)">Enter both a server endpoint and a player name/id</span>';return;}
  result.textContent='Loading...';result.style.color='var(--text)';
  try{
    var ep=resolveEndpoint(input);
    if(!ep)throw new Error('Invalid input');
    var base='https://'+(ep.host||ep)+(ep.path||'');
    var players=await jget(base,'players.json');
    if(!Array.isArray(players))throw new Error('Unexpected response');
    var ql=q.toLowerCase();
    var isId=/^\d+$/.test(q);
    var matches=players.filter(function(p){
      if(isId)return String(p.id)===q;
      return (p.name||'').toLowerCase().includes(ql);
    });
    var html='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse">';
    html+='<tr style="background:var(--bg-elev2)"><th style="text-align:left;padding:.5rem;border-bottom:1px solid var(--border)">ID</th><th style="text-align:left;padding:.5rem;border-bottom:1px solid var(--border)">Name</th><th style="text-align:right;padding:.5rem;border-bottom:1px solid var(--border)">Ping</th><th style="text-align:left;padding:.5rem;border-bottom:1px solid var(--border)">Identifier</th></tr>';
    if(matches.length){
      matches.forEach(function(p){
        html+='<tr><td style="padding:.5rem;border-bottom:1px solid var(--border)">'+(p.id!=null?esc(p.id):'-')+'</td>';
        html+='<td style="padding:.5rem;border-bottom:1px solid var(--border);color:#22c55e">'+(p.name?esc(p.name)+' ✓':'-')+'</td>';
        html+='<td style="padding:.5rem;border-bottom:1px solid var(--border);text-align:right">'+(p.ping!=null?esc(p.ping):'-')+'</td>';
        html+='<td style="padding:.5rem;border-bottom:1px solid var(--border);color:var(--text-dim)">'+esc(shortIdent(p.identifiers))+'</td></tr>';
      });
    }else{
      html+='<tr><td style="padding:.5rem;border-bottom:1px solid var(--border);color:var(--text-dim)" colspan="4">No matching players found</td></tr>';
    }
    html+='</table></div>';
    html+='<p style="margin-top:.75rem">Scanning <span style="color:var(--text)">'+players.length+'</span> players.</p>';
    result.innerHTML=html;result.style.color='var(--text)';
  }catch(e){
    result.innerHTML='<strong style="color:var(--danger)">Unable to reach server</strong><br><span style="color:var(--text-dim)">The server may be offline, block external requests, or the endpoint is incorrect. Use the server\'s IP:PORT (e.g. 1.2.3.4:30120) when possible.</span>';result.style.color='var(--danger)';
  }
}
</script>
