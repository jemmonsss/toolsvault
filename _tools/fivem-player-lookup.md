---
title: "FiveM Player Lookup"
link: "/tools/fivem-player-lookup/"
description: "Search for a specific player on any FiveM server."
tags:
  - fivem
  - gta
  - player
  - search
  - gtarp
category: "FiveM"
featured: true
icon: "🔍"
---
<div class="tui">
  <h1>FiveM Player Lookup</h1>
  <p class="sub">Enter a CFX server code and player name to check if they are online.</p>
  <div class="row">
    <div style="flex:1"><label>CFX Server Code</label><input type="text" id="cfx" placeholder="e.g. brldad"></div>
    <div style="flex:1"><label>Player Name</label><input type="text" id="q" placeholder="e.g. JohnDoe"></div>
  </div>
  <div class="row"><button class="btn btn-primary" onclick="search()">Search</button></div>
  <div id="result" class="result" style="margin-top:1rem"></div>
</div>
<script>
async function search(){
  const cfx=document.getElementById('cfx').value.trim();
  const q=document.getElementById('q').value.trim().toLowerCase();
  const result=document.getElementById('result');
  if(!cfx||!q){result.textContent='Enter both a CFX server code and player name';result.style.color='var(--danger)';return;}
  result.textContent='Loading...';result.style.color='var(--text)';
  try{
    const res=await fetch('https://servers-frontend.fivem.net/api/servers/single/'+encodeURIComponent(cfx)+'?recoserver=true');
    if(!res.ok)throw new Error('API error');
    const data=await res.json();
    const sv=data.data||{};
    const players=sv.Players||[];
    const matches=players.filter(function(p){return (p.name||'').toLowerCase().includes(q);});
    let html='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse">';
    html+='<tr style="background:var(--bg-elev2)"><th style="text-align:left;padding:.5rem;border-bottom:1px solid var(--border)">Player</th><th style="text-align:right;padding:.5rem;border-bottom:1px solid var(--border)">ID</th><th style="text-align:right;padding:.5rem;border-bottom:1px solid var(--border)">Ping</th></tr>';
    if(matches.length){
      matches.forEach(function(p){
        html+='<tr><td style="padding:.5rem;border-bottom:1px solid var(--border);color:#22c55e">'+(p.name||'')+' ✓</td>';
        html+='<td style="padding:.5rem;border-bottom:1px solid var(--border);text-align:right">'+(p.id||'-')+'</td>';
        html+='<td style="padding:.5rem;border-bottom:1px solid var(--border);text-align:right">'+(p.ping||'-')+'</td></tr>';
      });
    }else{
      html+='<tr><td style="padding:.5rem;border-bottom:1px solid var(--border);color:var(--text-dim)" colspan="3">No matching players found</td></tr>';
    }
    html+='</table></div>';
    html+='<p style="margin-top:.75rem">Scanning <span style="color:var(--text)">'+(players.length)+'</span> players on <span style="color:var(--text)">'+(sv.hostname||cfx)+'</span></p>';
    result.innerHTML=html;result.style.color='var(--text)';
  }catch(e){
    result.innerHTML='<strong style="color:var(--danger)">Unable to reach FiveM API</strong><br><span style="color:var(--text-dim)">The server may be offline or the API is temporarily unavailable. Please try again later.</span>';result.style.color='var(--danger)';
  }
}
</script>
