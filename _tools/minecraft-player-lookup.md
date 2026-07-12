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
    const profileRes=await fetch('https://minecraftapi.net/v3/profile/'+encodeURIComponent(username));
    if(!profileRes.ok)throw new Error('Player not found');
    const data=await profileRes.json();
    const uuid=data.full_uuid||data.uuid||'N/A';
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
      history.forEach(function(h){html+='<div class="kv"><span>'+(h.name||'Original')+'</span><span>'+(h.changed_at?new Date(h.changed_at).toLocaleDateString():'Current')+'</span></div>';});
    }
    html+='</div></div>';
    result.innerHTML=html;result.style.color='var(--text)';
  }catch(e){
    result.textContent='Primary API failed. Trying fallback...';result.style.color='var(--text-dim)';
    try{
      const res=await fetch('https://api.mojang.com/users/profiles/minecraft/'+encodeURIComponent(username));
      if(!res.ok)throw new Error('Fallback failed');
      const data=await res.json();
      const uuid=data.id||'N/A';
      const formattedUuid=uuid.length===32?uuid.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/,'$1-$2-$3-$4-$5'):uuid;
      const avatarUrl='https://api.mcheads.org/head/'+encodeURIComponent(username)+'/128';
      let html='<div style="display:flex;gap:1.5rem;align-items:flex-start;flex-wrap:wrap">';
      html+='<div style="text-align:center"><img src="'+avatarUrl+'" style="width:128px;height:128px;image-rendering:pixelated;border:2px solid var(--border);border-radius:8px" onerror="this.style.display=\'none\'"><p style="color:var(--text-dim);font-size:.8rem;margin-top:.5rem">Avatar</p></div>';
      html+='<div style="flex:1;min-width:200px">';
      html+='<div class="kv"><span>Username</span><span>'+username+'</span></div>';
      html+='<div class="kv"><span>UUID</span><span style="font-size:.8rem;word-break:break-all">'+formattedUuid+'</span></div>';
      html+='<p style="color:var(--text-dim);font-size:.85rem;margin-top:.75rem">Limited data available from fallback API. Name history and skin download require the primary API.</p>';
      html+='</div></div>';
      result.innerHTML=html;result.style.color='var(--text)';
    }catch(fe){
      result.innerHTML='<strong style="color:var(--danger)">All APIs unavailable</strong><br><span style="color:var(--text-dim)">Could not reach minecraftapi.net or api.mojang.com. Please try again later.</span>';result.style.color='var(--danger)';
    }
  }
}
</script>
