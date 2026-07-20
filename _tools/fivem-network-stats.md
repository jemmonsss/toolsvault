---
title: "FiveM Network Stats"
link: "/tools/fivem-network-stats/"
description: "Live FiveM and RedM player counts across the entire network."
tags:
  - fivem
  - gta
  - network
  - players
  - stats
category: "FiveM"
games_only: true
featured: false
icon: "🌐"
---
<div class="tui">
  <h1>FiveM Network Stats</h1>
  <p class="sub">Live player counts across the whole FiveM / RedM network.</p>
  <div class="row">
    <button class="btn btn-primary" onclick="refresh()">Refresh Now</button>
  </div>
  <div id="result" class="result" style="margin-top:1rem"></div>
</div>
<script>
async function refresh(){
  var result=document.getElementById('result');
  result.textContent='Loading...';result.style.color='var(--text)';
  try{
    var r=await fetch('https://static.cfx.re/runtime/counts.json',{cache:'no-store'});
    if(!r.ok)throw new Error('HTTP '+r.status);
    var counts=await r.json();
    var fivem=Array.isArray(counts)&&counts.length>0?counts[0]:0;
    var redm=Array.isArray(counts)&&counts.length>2?counts[2]:0;
    var total=fivem+redm;
    var html='<div style="display:flex;flex-wrap:wrap;gap:1rem;margin-top:.5rem">';
    html+='<div style="flex:1;min-width:160px;background:var(--bg-elev2);border:1px solid var(--border);border-radius:10px;padding:1rem"><div style="font-size:.85rem;color:var(--text-dim)">FiveM Players</div><div style="font-size:1.8rem;font-weight:700">'+Number(fivem).toLocaleString()+'</div></div>';
    html+='<div style="flex:1;min-width:160px;background:var(--bg-elev2);border:1px solid var(--border);border-radius:10px;padding:1rem"><div style="font-size:.85rem;color:var(--text-dim)">RedM Players</div><div style="font-size:1.8rem;font-weight:700">'+Number(redm).toLocaleString()+'</div></div>';
    html+='<div style="flex:1;min-width:160px;background:var(--bg-elev2);border:1px solid var(--border);border-radius:10px;padding:1rem"><div style="font-size:.85rem;color:var(--text-dim)">Total</div><div style="font-size:1.8rem;font-weight:700">'+Number(total).toLocaleString()+'</div></div>';
    html+='</div>';
    html+='<p style="margin-top:.75rem;color:var(--text-dim);font-size:.85rem">Updated '+new Date().toLocaleTimeString()+' • source: static.cfx.re/runtime/counts.json</p>';
    result.innerHTML=html;result.style.color='var(--text)';
  }catch(e){
    result.innerHTML='<strong style="color:var(--danger)">Unable to load network stats</strong><br><span style="color:var(--text-dim)">'+e.message+'</span>';result.style.color='var(--danger)';
  }
}
refresh();
</script>
