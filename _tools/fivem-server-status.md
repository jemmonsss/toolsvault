---
title: "FiveM Server Status"
link: "/tools/fivem-server-status/"
description: "Check FiveM server status, player count, map, and connected players."
tags:
  - fivem
  - gta
  - server
  - status
  - gtarp
category: "FiveM"
featured: true
icon: "🎮"
---
<div class="tui">
  <h1>FiveM Server Status</h1>
  <p class="sub">Enter a FiveM server CFX code to view its status and details.</p>
  <div class="row">
    <div style="flex:1"><label>CFX Server Code</label><input type="text" id="cfx" placeholder="e.g. brldad"></div>
  </div>
  <div class="row"><button class="btn btn-primary" onclick="check()">Check Status</button></div>
  <div id="result" class="result" style="margin-top:1rem"></div>
</div>
<script>
async function check(){
  const cfx=document.getElementById('cfx').value.trim();
  const result=document.getElementById('result');
  if(!cfx){result.textContent='Enter a CFX server code';result.style.color='var(--danger)';return;}
  result.textContent='Loading...';result.style.color='var(--text)';
  try{
    const res=await fetch('https://servers-frontend.fivem.net/api/servers/single/'+encodeURIComponent(cfx)+'?recoserver=true');
    if(!res.ok)throw new Error('API error');
    const data=await res.json();
    const sv=data.data||{};
    let html='<div style="display:flex;flex-direction:column;gap:.75rem">';
    html+='<div class="kv"><span>Name</span><span>'+(sv.hostname||'Unknown')+'</span></div>';
    html+='<div class="kv"><span>Status</span><span style="color:#22c55e">Online</span></div>';
    html+='<div class="kv"><span>Players</span><span>'+(sv.clients||0)+' / '+(sv.sv_maxclients||0)+'</span></div>';
    html+='<div class="kv"><span>Map</span><span>'+(sv.map||'Unknown')+'</span></div>';
    html+='<div class="kv"><span>Version</span><span>'+(sv.game_build||'Unknown')+'</span></div>';
    html+='<div class="kv"><span>Resources</span><span>'+(sv.resources||[]).length+'</span></div>';
    html+='<div class="kv"><span>Owner</span><span>'+(sv.ownerName||sv.server||'Unknown')+'</span></div>';
    html+='</div>';
    if(sv.Players&&sv.Players.length>0){
      html+='<h3 style="margin-top:1.5rem;margin-bottom:.5rem;font-size:1rem">Online Players</h3>';
      html+='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse">';
      html+='<tr style="background:var(--bg-elev2)"><th style="text-align:left;padding:.5rem;border-bottom:1px solid var(--border)">ID</th><th style="text-align:left;padding:.5rem;border-bottom:1px solid var(--border)">Name</th><th style="text-align:right;padding:.5rem;border-bottom:1px solid var(--border)">Ping</th></tr>';
      sv.Players.forEach(function(p){
        html+='<tr><td style="padding:.5rem;border-bottom:1px solid var(--border)">'+(p.id||'-')+'</td>';
        html+='<td style="padding:.5rem;border-bottom:1px solid var(--border)">'+(p.name||'')+'</td>';
        html+='<td style="padding:.5rem;border-bottom:1px solid var(--border);text-align:right">'+(p.ping||'-')+'</td></tr>';
      });
      html+='</table></div>';
    }
    result.innerHTML=html;result.style.color='var(--text)';
  }catch(e){
    result.innerHTML='<strong style="color:var(--danger)">Unable to reach FiveM API</strong><br><span style="color:var(--text-dim)">The server may be offline or the API is temporarily unavailable. Please try again later.</span>';result.style.color='var(--danger)';
  }
}
</script>
