---
title: "Minecraft Server Status"
link: "/tools/minecraft-server-status/"
description: "Check Minecraft server status, player count, version, and MOTD."
tags:
  - minecraft
  - server
  - status
  - ping
category: "Minecraft"
games_only: true
---
<div class="tui">
  <h1>Minecraft Server Status</h1>
  <p class="sub">Check if a Minecraft server is online and view its details.</p>
  <div class="row">
    <div style="flex:1"><label>Server Address</label><input type="text" id="server" placeholder="e.g. mc.hypixel.net"></div>
  </div>
  <div class="row"><button class="btn btn-primary" onclick="check()">Check Status</button></div>
  <div id="result" class="result" style="margin-top:1rem"></div>
</div>
<script>
async function check(){
  const server=document.getElementById('server').value.trim();
  const result=document.getElementById('result');
  if(!server){result.textContent='Enter a server address';result.style.color='var(--danger)';return;}
  result.textContent='Checking...';result.style.color='var(--text)';
  try{
    const res=await fetch('https://api.mcsrvstat.us/2/'+encodeURIComponent(server));
    if(!res.ok)throw new Error('Server not found or offline');
    const data=await res.json();
    let html='<div style="display:flex;flex-direction:column;gap:.75rem">';
    html+='<div class="kv"><span>Address</span><span>'+server+'</span></div>';
    html+='<div class="kv"><span>Status</span><span style="color:#22c55e">'+(data.online?'Online':'Offline')+'</span></div>';
    if(data.players)html+='<div class="kv"><span>Players</span><span>'+(data.players.online||0)+' / '+(data.players.max||0)+'</span></div>';
    if(data.version)html+='<div class="kv"><span>Version</span><span>'+(data.version||'Unknown')+'</span></div>';
    if(data.motd&&data.motd.clean)html+='<div class="kv"><span>MOTD</span><span style="white-space:pre-wrap">'+data.motd.clean.join('\n')+'</span></div>';
    if(data.icon)html+='<div class="kv"><span>Icon</span><span><img src="'+data.icon+'" style="width:64px;height:64px;image-rendering:pixelated;border:1px solid var(--border);border-radius:4px"></span></div>';
    html+='</div>';
    result.innerHTML=html;result.style.color='var(--text)';
  }catch(e){
    result.textContent='Primary API failed. Trying fallback...';result.style.color='var(--text-dim)';
    try{
      const res2=await fetch('https://api.minetools.eu/ping/'+encodeURIComponent(server));
      if(!res2.ok)throw new Error('Fallback failed');
      const data=await res2.json();
      let html='<div style="display:flex;flex-direction:column;gap:.75rem">';
      html+='<div class="kv"><span>Address</span><span>'+server+'</span></div>';
      html+='<div class="kv"><span>Status</span><span style="color:#22c55e">'+(data.online?'Online':'Offline')+'</span></div>';
      if(data.players)html+='<div class="kv"><span>Players</span><span>'+(data.players.online||0)+' / '+(data.players.max||0)+'</span></div>';
      if(data.version)html+='<div class="kv"><span>Version</span><span>'+(data.version.name||data.version||'Unknown')+'</span></div>';
      if(data.motd)html+='<div class="kv"><span>MOTD</span><span style="white-space:pre-wrap">'+(data.motd||'')+'</span></div>';
      html+='</div>';
      result.innerHTML=html;result.style.color='var(--text)';
    }catch(fe){
      result.innerHTML='<strong style="color:var(--danger)">All APIs unavailable</strong><br><span style="color:var(--text-dim)">Could not reach mcsrvstat.us or minetools.eu. The server may be offline, or the APIs are down. Try again later.</span>';result.style.color='var(--danger)';
    }
  }
}
</script>
