---
title: "Star Citizen Ship Lookup"
link: "/tools/star-citizen-ship-lookup/"
description: "Search and compare Star Citizen ships, vehicles, and components."
tags:
  - star-citizen
  - ships
  - vehicles
  - space
category: "Star Citizen"
---
<div class="tui">
  <h1>Star Citizen Ship Lookup</h1>
  <p class="sub">Search ships and vehicles from the Star Citizen universe.</p>
  <div class="row">
    <div style="flex:1"><label>Search</label><input type="text" id="q" placeholder="e.g. Carrack, Arrow, Drake"></div>
  </div>
  <div class="row"><button class="btn btn-primary" onclick="search()">Search</button></div>
  <div id="result" class="result" style="margin-top:1rem"></div>
</div>
<script>
async function search(){
  const q=document.getElementById('q').value.trim();
  const result=document.getElementById('result');
  if(!q){result.textContent='Enter a search term';result.style.color='var(--danger)';return;}
  result.textContent='Searching...';result.style.color='var(--text)';
  try{
    const res=await fetch('https://api.star-citizen.wiki/api/vehicles?filter[name]='+encodeURIComponent(q));
    if(!res.ok)throw new Error('API error');
    const data=await res.json();
    const ships=data.data||[];
    if(!ships.length){result.textContent='No ships found';result.style.color='var(--text-dim)';return;}
    let html='<div style="display:flex;flex-direction:column;gap:.75rem">';
    ships.forEach(function(s){
      html+='<div style="padding:.75rem;background:var(--bg-elev);border:1px solid var(--border);border-radius:8px">';
      html+='<div style="font-weight:600;color:var(--text);font-size:1rem">'+(s.name||'Unknown')+'</div>';
      html+='<div style="color:var(--text-dim);font-size:.85rem;margin-top:.25rem">';
      if(s.manufacturer)html+='<div>Manufacturer: '+(s.manufacturer.name||s.manufacturer)+'</div>';
      if(s.classification)html+='<div>Role: '+(s.classification||'')+'</div>';
      if(s.crew)html+='<div>Crew: '+(s.crew||'')+'</div>';
      if(s.cargo_capacity)html+='<div>Cargo: '+(s.cargo_capacity||0)+' SCU</div>';
      if(s.mass)html+='<div>Mass: '+(s.mass||0).toLocaleString()+' kg</div>';
      if(s.size)html+='<div>Size: '+(s.size||'')+'</div>';
      html+='</div></div>';
    });
    html+='</div>';
    result.innerHTML=html;result.style.color='var(--text)';
  }catch(e){result.textContent='Error: '+(e.message||'Failed to fetch ship data');result.style.color='var(--danger)';}
}
</script>
