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
    const res=await fetch('https://api.mc-api.io/v3/server/'+encodeURIComponent(server));
    if(!res.ok)throw new Error('Server not found or offline');
    const data=await res.json();
    let html='<div style="display:flex;flex-direction:column;gap:.75rem">';
    html+='<div class="kv"><span>Address</span><span>'+server+'</span></div>';
    html+='<div class="kv"><span>Status</span><span style="color:#22c55e">Online</span></div>';
    if(data.online!==undefined)html+='<div class="kv"><span>Online</span><span>'+(data.online?'Yes':'No')+'</span></div>';
    if(data.players)html+='<div class="kv"><span>Players</span><span>'+(data.players.online||0)+' / '+(data.players.max||0)+'</span></div>';
    if(data.version)html+='<div class="kv"><span>Version</span><span>'+(data.version.name||data.version||'Unknown')+'</span></div>';
    if(data.motd)html+='<div class="kv"><span>MOTD</span><span style="white-space:pre-wrap">'+(data.motd.clean||data.motd||'')+'</span></div>';
    if(data.favicon)html+='<div class="kv"><span>Favicon</span><span><img src="'+data.favicon+'" style="width:64px;height:64px;image-rendering:pixelated;border:1px solid var(--border);border-radius:4px"></span></div>';
    html+='</div>';
    result.innerHTML=html;result.style.color='var(--text)';
  }catch(e){result.textContent='Error: '+(e.message||'Failed to check server');result.style.color='var(--danger)';}
}
</script>
