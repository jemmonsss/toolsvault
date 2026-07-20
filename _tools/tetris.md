---
title: "Tetris"
link: "/tools/tetris/"
description: "Stack the falling tetrominoes, clear full lines, and survive in the ultimate puzzle game."
tags:
  - games
  - retro
  - arcade
  - tetris
category: "Games"
games_only: true
featured: true
icon: "🧩"
---
<link rel="stylesheet" href="/assets/css/retro-games.css">
<div class="tui">
  <h1>Tetris</h1>
  <p class="sub">Arrow keys: ← → move, ↑ rotate, ↓ soft drop. Clear lines to score.</p>
  <div class="game-shell">
    <div class="game-hud">
      <span class="game-stat">Score<b id="tr-score">0</b></span>
      <span class="game-stat">Lines<b id="tr-lines">0</b></span>
      <span class="game-stat">Best<b id="tr-best">0</b></span>
    </div>
    <div class="game-overlay">
      <canvas id="tr-canvas" class="game-canvas" width="240" height="480"></canvas>
      <div class="overlay-msg" id="tr-overlay">
        <strong id="tr-msg">Ready?</strong>
        <button class="btn btn-primary" onclick="trStart()">Play</button>
      </div>
    </div>
    <div class="game-controls">
      <button class="btn" onclick="trStart()">Restart</button>
    </div>
    <p class="game-hint">Tip: on mobile, swipe to move/rotate and tap to drop.</p>
  </div>
</div>
<script>
(function(){
  var canvas=document.getElementById('tr-canvas'),ctx=canvas.getContext('2d');
  var scoreEl=document.getElementById('tr-score'),linesEl=document.getElementById('tr-lines'),bestEl=document.getElementById('tr-best');
  var overlay=document.getElementById('tr-overlay'),msgEl=document.getElementById('tr-msg');
  var cols=12,rows=20,cell=20,board,cur,curX,curY,score,lines,best=0,timer=null,over=false;
  var shapes=[[[[1,1,1,1]]],[[[1,1],[1,1]]],[[[1,1,1],[0,1,0]]],[[[1,1,1],[1,0,0]]],[[[1,1,1],[0,0,1]]],[[[0,1,1],[1,1,0]]],[[[1,1,0],[0,1,1]]]];
  var colors=['#60a5fa','#f59e0b','#a855f7','#22c55e','#ef4444','#06b6d4','#ec4899'];
  try{best=parseInt(localStorage.getItem('tv_tr_best')||'0',10)||0;}catch(e){}
  bestEl.textContent=best;
  function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()||'#252525';}
  function reset(){board=[];for(var y=0;y<rows;y++){board[y]=[];for(var x=0;x<cols;x++)board[y][x]=0;}score=0;lines=0;scoreEl.textContent=0;linesEl.textContent=0;over=false;}
  function spawn(){var i=Math.floor(Math.random()*shapes.length);cur={m:shapes[i],c:i+1};curX=Math.floor(cols/2)-1;curY=0;if(collide(0,0))gameOver();}
  function collide(dx,dy,m){m=m||cur.m;for(var y=0;y<m.length;y++)for(var x=0;x<m[y].length;x++){if(!m[y][x])continue;var nx=curX+x+dx,ny=curY+y+dy;if(nx<0||nx>=cols||ny>=rows||(ny>=0&&board[ny][nx]))return true;}return false;}
  function merge(){cur.m.forEach(function(r,y){r.forEach(function(v,x){if(v){board[curY+y][curX+x]=cur.c;}});});}
  function clearLines(){for(var y=rows-1;y>=0;y--){if(board[y].every(function(v){return v;})){board.splice(y,1);board.unshift(Array(cols).fill(0));lines++;score+=100;y++;}}linesEl.textContent=lines;scoreEl.textContent=score;}
  function step(){if(over)return;if(collide(0,1)){merge();clearLines();spawn();}else{curY++;}draw();}
  function draw(){
    ctx.fillStyle=css('--bg-elev2');ctx.fillRect(0,0,canvas.width,canvas.height);
    for(var y=0;y<rows;y++)for(var x=0;x<cols;x++)if(board[y][x])drawCell(x,y,colors[board[y][x]-1]);
    if(cur)cur.m.forEach(function(r,y){r.forEach(function(v,x){if(v)drawCell(curX+x,curY+y,colors[cur.c-1]);});});
  }
  function drawCell(x,y,c){ctx.fillStyle=c;ctx.fillRect(x*cell+1,y*cell+1,cell-2,cell-2);}
  function gameOver(){over=true;clearInterval(timer);if(score>best){best=score;bestEl.textContent=best;try{localStorage.setItem('tv_tr_best',best);}catch(e){}}msgEl.textContent='Game Over — '+score;overlay.hidden=false;}
  function rotate(){var m=cur.m,rot=m[0].map(function(_,i){return m.map(function(r){return r[i];}).reverse();});if(!collide(0,0,rot))cur.m=rot;}
  window.trStart=function(){reset();spawn();draw();overlay.hidden=true;if(timer)clearInterval(timer);timer=setInterval(step,400);};
  document.addEventListener('keydown',function(e){
    if(over)return;var k=e.key.toLowerCase();
    if(k==='arrowleft'){if(!collide(-1,0))curX--;}
    else if(k==='arrowright'){if(!collide(1,0))curX++;}
    else if(k==='arrowup'){rotate();}
    else if(k==='arrowdown'){if(!collide(0,1))curY++;}
    else return;e.preventDefault();draw();
  });
  var tx=0,ty=0;
  canvas.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
  canvas.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.abs(dx)<20&&Math.abs(dy)<20){rotate();}else if(Math.abs(dx)>Math.abs(dy)){if(!collide(dx>0?1:-1,0))curX+=dx>0?1:-1;}else{curY++;}draw();},{passive:true});
  reset();draw();
})();
</script>
