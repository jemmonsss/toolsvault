---
title: "Free To Play Games Browser"
link: "/tools/free-to-play-games/"
description: "Browse and discover free-to-play games across platforms."
tags:
  - games
  - free-to-play
  - browser
  - discovery
category: "Games"
---
<div class="tui">
  <h1>Free To Play Games</h1>
  <p class="sub">Discover free-to-play games from the FreeToGame database.</p>
  <div class="row">
    <div style="flex:1"><label>Search</label><input type="text" id="q" placeholder="Search games..."></div>
    <div style="flex:1"><label>Platform</label><select id="platform"><option value="all">All</option><option value="windows">Windows</option><option value="browser">Browser</option></select></div>
    <div style="flex:1"><label>Category</label><select id="category"><option value="all">All</option><option value="mmorpg">MMORPG</option><option value="shooter">Shooter</option><option value="strategy">Strategy</option><option value="moba">MOBA</option><option value="racing">Racing</option><option value="sports">Sports</option><option value="social">Social</option><option value="sandbox">Sandbox</option></select></div>
  </div>
  <div class="row"><button class="btn btn-primary" onclick="search()">Search</button></div>
  <div id="result" class="result" style="margin-top:1rem"></div>
</div>
<script>
async function search(){
  const q=document.getElementById('q').value.trim().toLowerCase();
  const platform=document.getElementById('platform').value;
  const category=document.getElementById('category').value;
  const result=document.getElementById('result');
  result.textContent='Loading...';result.style.color='var(--text)';
  let url='https://www.freetogame.com/api/games';
  const params=[];
  if(platform!=='all')params.push('platform='+platform);
  if(category!=='all')params.push('category='+category);
  if(params.length)url+='?'+params.join('&');
  try{
    const res=await fetch(url);
    if(!res.ok)throw new Error('API error');
    let games=await res.json();
    if(q)games=games.filter(function(g){return (g.title||'').toLowerCase().includes(q)||(g.genre||'').toLowerCase().includes(q)||(g.developer||'').toLowerCase().includes(q);});
    if(!games.length){result.textContent='No games found';result.style.color='var(--text-dim)';return;}
    let html='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem">';
    games.forEach(function(g){
      html+='<div style="padding:1rem;background:var(--bg-elev);border:1px solid var(--border);border-radius:8px">';
      if(g.thumbnail)html+='<img src="'+g.thumbnail+'" style="width:100%;height:150px;object-fit:cover;border-radius:6px;margin-bottom:.75rem">';
      html+='<div style="font-weight:600;color:var(--text);font-size:1rem">'+(g.title||'')+'</div>';
      html+='<div style="color:var(--text-dim);font-size:.85rem;margin-top:.25rem">'+(g.genre||'')+'</div>';
      html+='<div style="color:var(--text-dim);font-size:.85rem">'+(g.developer||'')+' · '+(g.publisher||'')+'</div>';
      if(g.release_date)html+='<div style="color:var(--text-dim);font-size:.8rem;margin-top:.25rem">'+(g.release_date||'')+'</div>';
      if(g.platform)html+='<div style="margin-top:.5rem">'+(g.platform||'').split(',').map(function(p){return '<span class="tag">'+p.trim()+'</span>';}).join(' ')+'</div>';
      html+='</div>';
    });
    html+='</div>';
    result.innerHTML=html;result.style.color='var(--text)';
  }catch(e){
    result.textContent='Primary API failed. Trying fallback...';result.style.color='var(--text-dim)';
    try{
      const res2=await fetch('https://www.freetogame.com/api/games?platform='+platform);
      if(!res2.ok)throw new Error('Fallback API error');
      let games=await res2.json();
      if(category!=='all')games=games.filter(function(g){return (g.genre||'').toLowerCase().includes(category);});
      if(q)games=games.filter(function(g){return (g.title||'').toLowerCase().includes(q)||(g.genre||'').toLowerCase().includes(q);});
      if(!games.length){result.textContent='No games found';result.style.color='var(--text-dim)';return;}
      let html='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem">';
      games.forEach(function(g){
        html+='<div style="padding:1rem;background:var(--bg-elev);border:1px solid var(--border);border-radius:8px">';
        if(g.thumbnail)html+='<img src="'+g.thumbnail+'" style="width:100%;height:150px;object-fit:cover;border-radius:6px;margin-bottom:.75rem">';
        html+='<div style="font-weight:600;color:var(--text);font-size:1rem">'+(g.title||'')+'</div>';
        html+='<div style="color:var(--text-dim);font-size:.85rem;margin-top:.25rem">'+(g.genre||'')+'</div>';
        html+='<div style="color:var(--text-dim);font-size:.85rem">'+(g.developer||'')+' · '+(g.publisher||'')+'</div>';
        if(g.release_date)html+='<div style="color:var(--text-dim);font-size:.8rem;margin-top:.25rem">'+(g.release_date||'')+'</div>';
        html+='</div>';
      });
      html+='</div>';
      result.innerHTML=html;result.style.color='var(--text)';
    }catch(fe){
      result.innerHTML='<strong style="color:var(--danger)">All APIs unavailable</strong><br><span style="color:var(--text-dim)">Could not reach freetogame.com. Please try again later.</span>';result.style.color='var(--danger)';
    }
  }
}
</script>
