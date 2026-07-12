---
title: "Star Citizen Commodity Prices"
link: "/tools/star-citizen-commodity-prices/"
description: "View current Star Citizen commodity prices across trade terminals."
tags:
  - star-citizen
  - commodities
  - trading
  - uec
category: "Star Citizen"
---
<div class="tui">
  <h1>Star Citizen Commodity Prices</h1>
  <p class="sub">Browse commodity prices from the Star Citizen universe.</p>
  <div class="row">
    <div style="flex:1"><label>Search Commodity</label><input type="text" id="q" placeholder="e.g. Titanium, Hydrogen"></div>
  </div>
  <div class="row"><button class="btn btn-primary" onclick="search()">Search</button></div>
  <div id="result" class="result" style="margin-top:1rem"></div>
</div>
<script>
async function search(){
  const q=document.getElementById('q').value.trim().toLowerCase();
  const result=document.getElementById('result');
  result.textContent='Loading...';result.style.color='var(--text)';
  try{
    const res=await fetch('https://api.star-citizen.wiki/api/commodities');
    if(!res.ok)throw new Error('API error');
    const data=await res.json();
    let items=data.data||[];
    if(q)items=items.filter(function(c){return (c.name||'').toLowerCase().includes(q);});
    if(!items.length){result.textContent='No commodities found';result.style.color='var(--text-dim)';return;}
    let html='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse">';
    html+='<tr style="background:var(--bg-elev2)"><th style="text-align:left;padding:.5rem;border-bottom:1px solid var(--border)">Name</th><th style="text-align:left;padding:.5rem;border-bottom:1px solid var(--border)">Category</th><th style="text-align:right;padding:.5rem;border-bottom:1px solid var(--border)">Base Price</th><th style="text-align:right;padding:.5rem;border-bottom:1px solid var(--border)">SCU</th></tr>';
    items.forEach(function(c){
      html+='<tr><td style="padding:.5rem;border-bottom:1px solid var(--border)">'+(c.name||'')+'</td>';
      html+='<td style="padding:.5rem;border-bottom:1px solid var(--border);color:var(--text-dim)">'+(c.category||'')+'</td>';
      html+='<td style="padding:.5rem;border-bottom:1px solid var(--border);text-align:right">'+(c.price||0).toLocaleString()+'</td>';
      html+='<td style="padding:.5rem;border-bottom:1px solid var(--border);text-align:right">'+(c.scu||0)+'</td></tr>';
    });
    html+='</table></div>';
    result.innerHTML=html;result.style.color='var(--text)';
  }catch(e){
    result.textContent='Primary API failed. Trying fallback...';result.style.color='var(--text-dim)';
    try{
      const res2=await fetch('https://api.star-citizen.wiki/api/commodities?filter[name]='+encodeURIComponent(q||''));
      if(!res2.ok)throw new Error('Fallback API error');
      const data2=await res2.json();
      let items=data2.data||[];
      if(q)items=items.filter(function(c){return (c.name||'').toLowerCase().includes(q);});
      if(!items.length){result.textContent='No commodities found';result.style.color='var(--text-dim)';return;}
      let html='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse">';
      html+='<tr style="background:var(--bg-elev2)"><th style="text-align:left;padding:.5rem;border-bottom:1px solid var(--border)">Name</th><th style="text-align:left;padding:.5rem;border-bottom:1px solid var(--border)">Category</th><th style="text-align:right;padding:.5rem;border-bottom:1px solid var(--border)">Base Price</th><th style="text-align:right;padding:.5rem;border-bottom:1px solid var(--border)">SCU</th></tr>';
      items.forEach(function(c){
        html+='<tr><td style="padding:.5rem;border-bottom:1px solid var(--border)">'+(c.name||'')+'</td>';
        html+='<td style="padding:.5rem;border-bottom:1px solid var(--border);color:var(--text-dim)">'+(c.category||'')+'</td>';
        html+='<td style="padding:.5rem;border-bottom:1px solid var(--border);text-align:right">'+(c.price||0).toLocaleString()+'</td>';
        html+='<td style="padding:.5rem;border-bottom:1px solid var(--border);text-align:right">'+(c.scu||0)+'</td></tr>';
      });
      html+='</table></div>';
      result.innerHTML=html;result.style.color='var(--text)';
    }catch(fe){
      result.innerHTML='<strong style="color:var(--danger)">All APIs unavailable</strong><br><span style="color:var(--text-dim)">Could not reach star-citizen.wiki. Please try again later.</span>';result.style.color='var(--danger)';
    }
  }
}
</script>
