---
title: "Minecraft Player Lookup"
link: "/tools/minecraft-player-lookup/"
description: "Look up Minecraft player profiles, UUIDs, skins, and name history."
tags:
  - minecraft
  - player
  - uuid
  - skin
category: "Minecraft"
---
<div class="tui">
  <h1>Minecraft Player Lookup</h1>
  <p class="sub">Get player UUID, skin, avatar, and name history by username.</p>
  <div class="row">
    <div style="flex:1"><label>Username</label><input type="text" id="username" placeholder="e.g. Notch"></div>
  </div>
  <div class="row"><button class="btn btn-primary" onclick="lookup()">Lookup</button></div>
  <div id="result" class="result" style="margin-top:1rem"></div>
</div>
<script>
async function lookup(){
  const username=document.getElementById('username').value.trim();
  const result=document.getElementById('result');
  if(!username){result.textContent='Enter a username';result.style.color='var(--danger)';return;}
  result.textContent='Loading...';result.style.color='var(--text)';
  try{
    const profileRes=await fetch('https://api.mc-api.io/v3/profile/'+encodeURIComponent(username));
    if(!profileRes.ok)throw new Error('Player not found');
    const data=await profileRes.json();
    const uuid=data.uuid||'N/A';
    const skinUrl=data.skin?.url||'';
    const avatarUrl='https://api.mcheads.org/head/'+encodeURIComponent(username)+'/128';
    const history=data.name_history||[];
    let html='<div style="display:flex;gap:1.5rem;align-items:flex-start;flex-wrap:wrap">';
    html+='<div style="text-align:center"><img src="'+avatarUrl+'" style="width:128px;height:128px;image-rendering:pixelated;border:2px solid var(--border);border-radius:8px" onerror="this.src=\'https://crafatar.com/renders/head/'+uuid+'?size=128&overlay\'"><p style="color:var(--text-dim);font-size:.8rem;margin-top:.5rem">Avatar</p></div>';
    html+='<div style="flex:1;min-width:200px">';
    html+='<div class="kv"><span>Username</span><span>'+data.name+'</span></div>';
    html+='<div class="kv"><span>UUID</span><span style="font-size:.8rem;word-break:break-all">'+uuid+'</span></div>';
    if(skinUrl)html+='<div class="kv"><span>Skin</span><span><a href="'+skinUrl+'" target="_blank" rel="noopener">Download Skin</a></span></div>';
    if(history&&history.length){
      html+='<p style="color:var(--text);margin-top:.75rem;font-weight:600">Name History</p>';
      history.forEach(function(h){html+='<div class="kv"><span>'+(h.changedTo||'Original')+'</span><span>'+(new Date(h.changedAt).toLocaleDateString()||'')+'</span></div>';});
    }
    html+='</div></div>';
    result.innerHTML=html;result.style.color='var(--text)';
  }catch(e){result.textContent='Error: '+(e.message||'Failed to fetch player data');result.style.color='var(--danger)';}
}
</script>
