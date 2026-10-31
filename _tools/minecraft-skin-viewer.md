---
title: "Minecraft Skin Viewer"
link: "/tools/minecraft-skin-viewer/"
description: "View and download Minecraft player skins in 2D and 3D renders."
tags:
  - minecraft
  - skin
  - viewer
  - render
category: "Minecraft"
games_only: true
---
<div class="tui">
  <h1>Minecraft Skin Viewer</h1>
  <p class="sub">View any Minecraft player's skin in different render styles.</p>
  <div class="row">
    <div style="flex:1"><label>Username</label><input type="text" id="username" placeholder="e.g. Notch"></div>
    <div style="flex:1"><label>Render Type</label><select id="type"><option value="2d/head">2D Head</option><option value="2d/front">2D Front</option><option value="3d/head">3D Head</option><option value="3d/bust">3D Bust</option><option value="3d/full">3D Full Body</option></select></div>
    <div style="flex:1"><label>Size</label><select id="size"><option value="128">128px</option><option value="256">256px</option><option value="512">512px</option></select></div>
  </div>
  <div class="row"><button class="btn btn-primary" onclick="render()">Render Skin</button></div>
  <div id="result" class="result" style="margin-top:1rem;text-align:center"></div>
</div>
<script>
function render(){
  const username=document.getElementById('username').value.trim();
  const type=document.getElementById('type').value;
  const size=document.getElementById('size').value;
  const result=document.getElementById('result');
  if(!username){result.textContent='Enter a username';result.style.color='var(--danger)';return;}
  const primaryUrl='https://render.crafty.gg/'+type+'/'+encodeURIComponent(username)+'?size='+size;
  const fallbackUrl='https://api.mcheads.org/head/'+encodeURIComponent(username)+'/'+size;
  result.innerHTML='<img src="'+primaryUrl+'" style="max-width:100%;height:auto;image-rendering:pixelated;border:2px solid var(--border);border-radius:8px" onerror="this.onerror=null;this.src=\''+fallbackUrl+'\';this.alt=\'2D head fallback\'"><p style="margin-top:.75rem"><a href="'+primaryUrl+'" target="_blank" rel="noopener" class="btn btn-secondary">Open Original</a> <button class="btn btn-secondary" onclick="navigator.clipboard.writeText(\''+primaryUrl+'\').then(()=>alert(\'URL copied!\'))">Copy URL</button></p>';
  result.style.color='var(--text)';
}
</script>
