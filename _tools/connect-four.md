---
title: "Connect Four"
link: "/tools/connect-four/"
description: "Drop your discs and line up four in a row before the computer does."
tags:
  - games
  - retro
  - puzzle
  - connect-four
category: "Games"
games_only: true
featured: false
icon: "🔵"
---
<link rel="stylesheet" href="/assets/css/retro-games.css">
<div class="tui">
  <h1>Connect Four</h1>
  <p class="sub">You're red, the computer is yellow. Connect four discs vertically, horizontally, or diagonally.</p>
  <div class="game-shell">
    <div class="game-hud">
      <span class="game-stat">Wins<b id="cf-w">0</b></span>
      <span class="game-stat">Losses<b id="cf-l">0</b></span>
      <span class="game-stat">Draws<b id="cf-d">0</b></span>
    </div>
    <div id="cf-board" class="retro-grid" style="grid-template-columns:repeat(7,1fr);background:#1e3a8a"></div>
    <p class="game-hint" id="cf-status">Your move!</p>
    <div class="game-controls">
      <button class="btn btn-primary" onclick="cfNew()">New Game</button>
    </div>
  </div>
</div>
<script>
(function(){
  var boardEl=document.getElementById('cf-board'),statusEl=document.getElementById('cf-status');
  var wEl=document.getElementById('cf-w'),lEl=document.getElementById('cf-l'),dEl=document.getElementById('cf-d');
  function loadRecord(){
    try{return JSON.parse(localStorage.getItem('tv_cf')||'{"w":0,"l":0,"d":0}');}
    catch(e){return {w:0,l:0,d:0};}
  }
  var cols=7,rows=6,grid,turn,over,rec=loadRecord();
  wEl.textContent=rec.w;lEl.textContent=rec.l;dEl.textContent=rec.d;
  function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim();}
  function paint(){
    boardEl.innerHTML='';
    for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){
      var d=document.createElement('div');d.className='retro-cell';d.style.height='52px';d.style.borderRadius='50%';
      d.style.background=grid[r][c]===''?'#0f172a':(grid[r][c]==='R'?'#ef4444':'#f59e0b');
      d.dataset.c=c;boardEl.appendChild(d);
    }
  }
  function drop(c,p){
    for(var r=rows-1;r>=0;r--){if(grid[r][c]===''){grid[r][c]=p;return r;}}
    return -1;
  }
  function win(b,p){
    for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){
      if(c+3<cols&&b[r][c]===p&&b[r][c+1]===p&&b[r][c+2]===p&&b[r][c+3]===p)return true;
      if(r+3<rows&&b[r][c]===p&&b[r+1][c]===p&&b[r+2][c]===p&&b[r+3][c]===p)return true;
      if(r+3<rows&&c+3<cols&&b[r][c]===p&&b[r+1][c+1]===p&&b[r+2][c+2]===p&&b[r+3][c+3]===p)return true;
      if(r+3<rows&&c-3>=0&&b[r][c]===p&&b[r+1][c-1]===p&&b[r+2][c-2]===p&&b[r+3][c-3]===p)return true;
    }
    return false;
  }
  function full(){return grid.every(function(row){return row.every(function(c){return c!=='';});});}
  function isWinningDrop(c,p){
    for(var r=rows-1;r>=0;r--){
      if(grid[r][c]===''){
        grid[r][c]=p;
        var winning=win(grid,p);
        grid[r][c]='';
        return winning;
      }
    }
    return false;
  }
  function aiMove(){
    for(var c=0;c<cols;c++){if(isWinningDrop(c,'Y'))return c;}
    for(var c2=0;c2<cols;c2++){if(isWinningDrop(c2,'R'))return c2;}
    var mid=[3,2,4,1,5,0,6];
    for(var i=0;i<mid.length;i++){if(grid[0][mid[i]]==='')return mid[i];}
    return 0;
  }
  function after(){
    if(win(grid,'R')){over=true;rec.w++;statusEl.textContent='You win! 🎉';save();paint();return;}
    if(full()){over=true;rec.d++;statusEl.textContent="It's a draw.";save();paint();return;}
    turn='Y';statusEl.textContent='Computer thinking...';paint();
    setTimeout(function(){
      if(over)return;
      var c=aiMove();drop(c,'Y');
      if(win(grid,'Y')){over=true;rec.l++;statusEl.textContent='Computer wins.';save();paint();return;}
      if(full()){over=true;rec.d++;statusEl.textContent="It's a draw.";save();paint();return;}
      turn='R';statusEl.textContent='Your move!';paint();
    },350);
  }
  function save(){try{localStorage.setItem('tv_cf',JSON.stringify(rec));}catch(e){}wEl.textContent=rec.w;lEl.textContent=rec.l;dEl.textContent=rec.d;}
  window.cfNew=function(){grid=[];for(var r=0;r<rows;r++){grid[r]=Array(cols).fill('');}over=false;turn='R';statusEl.textContent='Your move!';paint();};
  boardEl.addEventListener('click',function(e){var c=e.target.dataset.c;if(c==null||over||turn!=='R'||grid[0][c]!=='')return;drop(+c,'R');after();});
  window.cfNew();
})();
</script>
