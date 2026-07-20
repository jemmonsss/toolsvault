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
  <p class="sub">← → move · ↑ rotate · ↓ soft drop · Space hard drop · C hold. Clear lines to score.</p>
  <div class="game-shell">
    <div class="game-hud">
      <span class="game-stat">Score<b id="tr-score">0</b></span>
      <span class="game-stat">Lines<b id="tr-lines">0</b></span>
      <span class="game-stat">Level<b id="tr-level">1</b></span>
      <span class="game-stat">Best<b id="tr-best">0</b></span>
    </div>
    <div class="game-overlay">
      <div style="display:flex;gap:1rem;align-items:flex-start">
        <div>
          <div style="font-size:.75rem;color:var(--text-dim);margin-bottom:.3rem">NEXT</div>
          <canvas id="tr-next" class="game-canvas" width="80" height="80" style="width:80px;height:80px"></canvas>
        </div>
        <canvas id="tr-canvas" class="game-canvas" width="240" height="480"></canvas>
        <div>
          <div style="font-size:.75rem;color:var(--text-dim);margin-bottom:.3rem">HOLD</div>
          <canvas id="tr-hold" class="game-canvas" width="80" height="80" style="width:80px;height:80px"></canvas>
        </div>
      </div>
      <div class="overlay-msg" id="tr-overlay">
        <strong id="tr-msg">Ready?</strong>
        <button class="btn btn-primary" onclick="trStart()">Play</button>
      </div>
    </div>
    <div class="game-controls">
      <button class="btn" onclick="trStart()">Restart</button>
    </div>
    <p class="game-hint">Tip: on mobile, swipe to move/rotate, tap to hard drop.</p>
  </div>
</div>
<script>
(function(){
  var canvas=document.getElementById('tr-canvas'),ctx=canvas.getContext('2d');
  var nextC=document.getElementById('tr-next'),nctx=nextC.getContext('2d');
  var holdC=document.getElementById('tr-hold'),hctx=holdC.getContext('2d');
  var scoreEl=document.getElementById('tr-score'),linesEl=document.getElementById('tr-lines'),levelEl=document.getElementById('tr-level'),bestEl=document.getElementById('tr-best');
  var overlay=document.getElementById('tr-overlay'),msgEl=document.getElementById('tr-msg');
  var cols=10,rows=20,cell=24,board,cur,curX,curY,next,hold,bag=[],canHold=true,score,lines,level,best=0,timer=null,over=false;
  // Tetromino definitions (SRS-style) with rotation states
  var SHAPES={
    I:{c:'#22d3ee',s:[[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],[[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],[[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],[[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]]]},
    O:{c:'#facc15',s:[[[1,1],[1,1]],[[1,1],[1,1]],[[1,1],[1,1]],[[1,1],[1,1]]]},
    T:{c:'#a855f7',s:[[[0,1,0],[1,1,1],[0,0,0]],[[0,1,0],[0,1,1],[0,1,0]],[[0,0,0],[1,1,1],[0,1,0]],[[0,1,0],[1,1,0],[0,1,0]]]},
    S:{c:'#34d399',s:[[[0,1,1],[1,1,0],[0,0,0]],[[0,1,0],[0,1,1],[0,0,1]],[[0,0,0],[0,1,1],[1,1,0]],[[1,0,0],[1,1,0],[0,1,0]]]},
    Z:{c:'#f87171',s:[[[1,1,0],[0,1,1],[0,0,0]],[[0,0,1],[0,1,1],[0,1,0]],[[0,0,0],[1,1,0],[0,1,1]],[[0,1,0],[1,1,0],[1,0,0]]]},
    J:{c:'#60a5fa',s:[[[1,0,0],[1,1,1],[0,0,0]],[[0,1,1],[0,1,0],[0,1,0]],[[0,0,0],[1,1,1],[0,0,1]],[[0,1,0],[0,1,0],[1,1,0]]]},
    L:{c:'#fb923c',s:[[[0,0,1],[1,1,1],[0,0,0]],[[0,1,0],[0,1,0],[0,1,1]],[[0,0,0],[1,1,1],[1,0,0]],[[1,1,0],[0,1,0],[0,1,0]]]}
  };
  var KEYS=Object.keys(SHAPES);
  try{best=parseInt(localStorage.getItem('tv_tr_best')||'0',10)||0;}catch(e){}
  bestEl.textContent=best;
  function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()||'#252525';}
  function reset(){board=[];for(var y=0;y<rows;y++){board[y]=[];for(var x=0;x<cols;x++)board[y][x]=0;}score=0;lines=0;level=1;over=false;bag=[];canHold=true;scoreEl.textContent=0;linesEl.textContent=0;levelEl.textContent=1;hold=null;}
  function nextPiece(){
    if(bag.length===0){bag=KEYS.slice();for(var i=bag.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=bag[i];bag[i]=bag[j];bag[j]=t;}}
    return bag.pop();
  }
  function spawn(){var k=next||nextPiece();next=nextPiece();var sh=SHAPES[k];cur={k:k,c:sh.c,m:sh.s[0],rot:0};curX=Math.floor((cols-sh.s[0][0].length)/2);curY=0;drawNext();if(collide(0,0))gameOver();}
  function collide(dx,dy,m){m=m||cur.m;for(var y=0;y<m.length;y++)for(var x=0;x<m[y].length;x++){if(!m[y][x])continue;var nx=curX+x+dx,ny=curY+y+dy;if(nx<0||nx>=cols||ny>=rows||(ny>=0&&board[ny][nx]))return true;}return false;}
  function merge(){cur.m.forEach(function(r,y){r.forEach(function(v,x){if(v){board[curY+y][curX+x]=cur.c;}});});}
  function clearLines(){
    var cleared=0;
    for(var y=rows-1;y>=0;y--){
      if(board[y].every(function(v){return v;})){
        board.splice(y,1);board.unshift(Array(cols).fill(0));cleared++;y++;
      }
    }
    if(cleared){lines+=cleared;level=Math.floor(lines/10)+1;score+=([0,100,300,500,800][cleared]*(level));linesEl.textContent=lines;levelEl.textContent=level;scoreEl.textContent=score;}
  }
  function step(){if(over)return;if(collide(0,1)){merge();clearLines();canHold=true;spawn();}else{curY++;}draw();}
  function rotate(){
    var sh=SHAPES[cur.k];var nr=(cur.rot+1)%4;var m=sh.s[nr];
    var kicks=[[0,0],[-1,0],[1,0],[-2,0],[2,0],[0,-1]];
    for(var i=0;i<kicks.length;i++){if(!collide(kicks[i][0],kicks[i][1],m)){cur.m=m;cur.rot=nr;curX+=kicks[i][0];curY+=kicks[i][1];return;}}
  }
  function hardDrop(){while(!collide(0,1))curY++;merge();clearLines();canHold=true;spawn();draw();}
  function ghostY(){var gy=curY;while(!collide(0,1,cur.m))gy++;return gy;}
  function draw(){
    ctx.fillStyle=css('--bg-elev2');ctx.fillRect(0,0,canvas.width,canvas.height);
    for(var y=0;y<rows;y++)for(var x=0;x<cols;x++)if(board[y][x])drawCell(ctx,x,y,board[y][x]);
    if(cur){
      var gy=ghostY();
      cur.m.forEach(function(r,y){r.forEach(function(v,x){if(v)drawCell(ctx,curX+x,gy+y,'rgba(255,255,255,.15)');});});
      cur.m.forEach(function(r,y){r.forEach(function(v,x){if(v)drawCell(ctx,curX+x,curY+y,cur.c);});});
    }
  }
  function drawCell(c,x,y,col){c.fillStyle=col;c.fillRect(x*cell+1,y*cell+1,cell-2,cell-2);}
  function drawMini(c,ctxFn,key){ctxFn.clearRect(0,0,80,80);if(!key)return;var sh=SHAPES[key];var m=sh.s[0];var cs=18,ox=(80-m[0].length*cs)/2,oy=(80-m.length*cs)/2;for(var y=0;y<m.length;y++)for(var x=0;x<m[y].length;x++)if(m[y][x]){ctxFn.fillStyle=sh.c;ctxFn.fillRect(ox+x*cs,oy+y*cs,cs-2,cs-2);}}
  function drawNext(){drawMini(nextC,nctx,next);}
  function drawHold(){drawMini(holdC,hctx,hold);}
  function holdPiece(){
    if(!canHold)return;
    if(hold){var tmp=hold;hold=cur.k;cur={k:tmp,c:SHAPES[tmp].c,m:SHAPES[tmp].s[0],rot:0};curX=Math.floor((cols-SHAPES[tmp].s[0][0].length)/2);curY=0;}
    else{hold=cur.k;spawn();}
    canHold=false;drawHold();
  }
  function gameOver(){over=true;clearInterval(timer);if(score>best){best=score;bestEl.textContent=best;try{localStorage.setItem('tv_tr_best',best);}catch(e){}}msgEl.textContent='Game Over — '+score;overlay.hidden=false;}
  function speed(){return Math.max(80,500-level*40);}
  window.trStart=function(){reset();spawn();draw();drawHold();overlay.hidden=true;if(timer)clearInterval(timer);timer=setInterval(step,speed());};
  document.addEventListener('keydown',function(e){
    if(over)return;var k=e.key.toLowerCase();
    if(k==='arrowleft'){if(!collide(-1,0))curX--;}
    else if(k==='arrowright'){if(!collide(1,0))curX++;}
    else if(k==='arrowup'){rotate();}
    else if(k==='arrowdown'){if(!collide(0,1)){curY++;score+=1;scoreEl.textContent=score;}}
    else if(k===' '){hardDrop();if(timer)clearInterval(timer);timer=setInterval(step,speed());}
    else if(k==='c'){holdPiece();}
    else return;e.preventDefault();draw();
  });
  var tx=0,ty=0;
  canvas.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
  canvas.addEventListener('touchend',function(e){
    var dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;
    if(Math.abs(dx)<20&&Math.abs(dy)<20){rotate();}
    else if(Math.abs(dx)>Math.abs(dy)){if(!collide(dx>0?1:-1,0))curX+=dx>0?1:-1;}
    else if(dy<0){if(!collide(0,1))curY++;}
    else hardDrop();
    if(timer)clearInterval(timer);timer=setInterval(step,speed());draw();
  },{passive:true});
  reset();draw();
})();
</script>
