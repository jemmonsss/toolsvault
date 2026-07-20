---
title: "Minesweeper"
link: "/tools/minesweeper/"
description: "The logic puzzle classic. Reveal safe tiles, flag the mines, clear the board."
tags:
  - games
  - retro
  - puzzle
  - minesweeper
category: "Games"
games_only: true
featured: true
icon: "💣"
---
<link rel="stylesheet" href="/assets/css/retro-games.css">
<div class="tui">
  <h1>Minesweeper</h1>
  <p class="sub">Left-click to reveal, right-click to flag. Clear all non-mine tiles to win.</p>
  <div class="game-shell">
    <div class="game-hud">
      <span class="game-stat">Mines<b id="ms-mines">0</b></span>
      <span class="game-stat">Flags<b id="ms-flags">0</b></span>
      <span class="game-stat">Time<b id="ms-time">0</b></span>
      <span class="game-stat">Best<b id="ms-best">--</b></span>
    </div>
    <div class="game-controls">
      <select id="ms-diff" class="btn" style="padding:.45rem .8rem">
        <option value="easy">Easy 9x9</option>
        <option value="medium" selected>Medium 16x16</option>
        <option value="hard">Hard 16x30</option>
      </select>
      <button class="btn btn-primary" onclick="msNew()">New Game</button>
    </div>
    <div id="ms-board" class="retro-grid"></div>
    <p class="game-hint" id="ms-status">Pick a difficulty and start digging.</p>
  </div>
</div>
<script>
(function(){
  var boardEl=document.getElementById('ms-board');
  var minesEl=document.getElementById('ms-mines'),flagsEl=document.getElementById('ms-flags'),timeEl=document.getElementById('ms-time'),bestEl=document.getElementById('ms-best');
  var statusEl=document.getElementById('ms-status'),diffEl=document.getElementById('ms-diff');
  var grid,cols,rows,mines,revealed,flags,over,timer,t,first;
  try{var b=JSON.parse(localStorage.getItem('tv_ms_best')||'{}');if(b[diffEl.value])bestEl.textContent=b[diffEl.value];}catch(e){}
  function cfg(){
    var d=diffEl.value;
    if(d==='easy')return{c:9,r:9,m:10};
    if(d==='hard')return{c:30,r:16,m:99};
    return{c:16,r:16,m:40};
  }
  window.msNew=function(){
    var c=cfg();cols=c.c;rows=c.r;mines=c.m;
    grid=[];revealed=0;flags=0;over=false;first=true;t=0;
    for(var y=0;y<rows;y++){grid[y]=[];for(var x=0;x<cols;x++)grid[y][x]={m:false,o:false,f:false,n:0};}
    minesEl.textContent=mines;flagsEl.textContent=0;timeEl.textContent=0;
    if(timer)clearInterval(timer);
    timer=setInterval(function(){t++;timeEl.textContent=t;},1000);
    statusEl.textContent='Good luck!';
    render();
  };
  function plant(sx,sy){
    var placed=0;
    while(placed<mines){
      var x=Math.floor(Math.random()*cols),y=Math.floor(Math.random()*rows);
      if(Math.abs(x-sx)<=1&&Math.abs(y-sy)<=1)continue;
      if(grid[y][x].m)continue;
      grid[y][x].m=true;placed++;
    }
    for(var y=0;y<rows;y++)for(var x=0;x<cols;x++){
      if(grid[y][x].m)continue;
      var n=0;
      for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++){var ny=y+dy,nx=x+dx;if(ny>=0&&ny<rows&&nx>=0&&nx<cols&&grid[ny][nx].m)n++;}
      grid[y][x].n=n;
    }
  }
  function render(){
    boardEl.style.gridTemplateColumns='repeat('+cols+',1fr)';
    var cell=Math.max(18,Math.min(34,Math.floor(520/cols)));
    boardEl.innerHTML='';
    for(var y=0;y<rows;y++)for(var x=0;x<cols;x++){
      var d=document.createElement('div');
      d.className='retro-cell';d.style.width=cell+'px';d.style.height=cell+'px';d.style.fontSize=(cell*0.5)+'px';
      d.dataset.x=x;d.dataset.y=y;
      boardEl.appendChild(d);
    }
  }
  function paint(){
    for(var y=0;y<rows;y++)for(var x=0;x<cols;x++){
      var c=grid[y][x],el=boardEl.children[y*cols+x];
      el.className='retro-cell';
      if(c.f&&!c.o){el.classList.add('flag');el.textContent='🚩';}
      else if(!c.o){el.textContent='';}
      else if(c.m){el.classList.add('mine');el.textContent='💣';}
      else{el.classList.add('revealed');el.textContent=c.n?(c.n):'';if(c.n===1)el.style.color='#60a5fa';if(c.n===2)el.style.color='#34d399';if(c.n===3)el.style.color='#f59e0b';if(c.n>3)el.style.color='#f87171';}
    }
  }
  function reveal(x,y){
    if(over||grid[y][x].o||grid[y][x].f)return;
    if(first){plant(x,y);first=false;}
    var stack=[[x,y]];
    while(stack.length){
      var p=stack.pop(),cx=p[0],cy=p[1],c=grid[cy][cx];
      if(c.o||c.f)continue;
      c.o=true;revealed++;
      if(c.m){return lose();}
      if(c.n===0){for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++){var ny=cy+dy,nx=cx+dx;if(ny>=0&&ny<rows&&nx>=0&&nx<cols&&!grid[ny][nx].o)stack.push([nx,ny]);}}
    }
    afterMove();
  }
  function afterMove(){
    paint();
    if(revealed===rows*cols-mines){
      over=true;clearInterval(timer);
      var key=diffEl.value,b=JSON.parse(localStorage.getItem('tv_ms_best')||'{}');
      if(!b[key]||t<b[key]){b[key]=t;try{localStorage.setItem('tv_ms_best',JSON.stringify(b));}catch(e){}}
      bestEl.textContent=b[diffEl.value]||t;
      statusEl.textContent='You cleared it in '+t+'s! 🎉';
    }
  }
  function lose(){
    over=true;clearInterval(timer);
    for(var y=0;y<rows;y++)for(var x=0;x<cols;x++)if(grid[y][x].m)grid[y][x].o=true;
    paint();statusEl.textContent='Boom! Game over.';
  }
  function toggleFlag(x,y){
    if(over||grid[y][x].o)return;
    grid[y][x].f=!grid[y][x].f;
    flags+=grid[y][x].f?1:-1;
    flagsEl.textContent=flags;paint();
  }
  boardEl.addEventListener('click',function(e){var t=e.target;if(!t.dataset)return;reveal(+t.dataset.x,+t.dataset.y);});
  boardEl.addEventListener('contextmenu',function(e){e.preventDefault();var t=e.target;if(!t.dataset)return;toggleFlag(+t.dataset.x,+t.dataset.y);});
  diffEl.addEventListener('change',function(){msNew();});
  msNew();
})();
</script>
