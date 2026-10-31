---
title: "Breakout"
link: "/tools/breakout/"
description: "Bounce the ball, smash every brick, and clear the screen in this arcade favorite."
tags:
  - games
  - retro
  - arcade
  - breakout
category: "Games"
games_only: true
featured: false
icon: "🧱"
---
<link rel="stylesheet" href="/assets/css/retro-games.css">
<div class="tui">
  <h1>Breakout</h1>
  <p class="sub">Move the paddle with your mouse, finger, or ← → arrows. Destroy every brick.</p>
  <div class="game-shell">
    <div class="game-hud">
      <span class="game-stat">Score<b id="bo-score">0</b></span>
      <span class="game-stat">Lives<b id="bo-lives">3</b></span>
      <span class="game-stat">Best<b id="bo-best">0</b></span>
    </div>
    <div class="game-overlay">
      <canvas id="bo-canvas" class="game-canvas" width="480" height="360"></canvas>
      <div class="overlay-msg" id="bo-overlay">
        <strong id="bo-msg">Ready?</strong>
        <button class="btn btn-primary" onclick="boStart()">Play</button>
      </div>
    </div>
    <div class="game-controls">
      <button class="btn" onclick="boStart()">Restart</button>
    </div>
    <p class="game-hint">Tip: you control the paddle at the bottom — keep the ball in play!</p>
  </div>
</div>
<script>
(function(){
  var canvas=document.getElementById('bo-canvas'),ctx=canvas.getContext('2d');
  var scoreEl=document.getElementById('bo-score'),livesEl=document.getElementById('bo-lives'),bestEl=document.getElementById('bo-best');
  var overlay=document.getElementById('bo-overlay'),msgEl=document.getElementById('bo-msg');
  var W=canvas.width,H=canvas.height,running=false,raf=null;
  var paddle,ball,bricks,score,lives,best=0;
  try{best=parseInt(localStorage.getItem('tv_bo_best')||'0',10)||0;}catch(e){}
  bestEl.textContent=best;
  function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()||'#e0e0e0';}
  function build(){
    paddle={w:90,h:14,x:W/2-45,y:H-26};
    ball={x:W/2,y:paddle.y-10,r:8,vx:4,vy:-4};
    bricks=[];var cols=11,rows=6,gap=4,pad=10,bw=(W-pad*2-gap*(cols-1))/cols,bh=18,colsArr=['#f87171','#f59e0b','#facc15','#34d399','#22d3ee','#a855f7'];
    for(var r=0;r<rows;r++)for(var c=0;c<cols;c++)bricks.push({x:pad+c*(bw+gap),y:36+r*(bh+gap),w:bw,h:bh,color:colsArr[r%colsArr.length],alive:true});
    score=0;lives=3;scoreEl.textContent=0;livesEl.textContent=3;
  }
  function loop(){
    if(!running)return;
    ball.x+=ball.vx;ball.y+=ball.vy;
    if(ball.x<ball.r){ball.x=ball.r;ball.vx*=-1;}
    if(ball.x>W-ball.r){ball.x=W-ball.r;ball.vx*=-1;}
    if(ball.y<ball.r){ball.y=ball.r;ball.vy*=-1;}
    if(ball.y+ball.r>=paddle.y&&ball.y+ball.r<=paddle.y+paddle.h+8&&ball.x>=paddle.x&&ball.x<=paddle.x+paddle.w&&ball.vy>0){
      ball.vy=-Math.abs(ball.vy);
      var hit=(ball.x-(paddle.x+paddle.w/2))/(paddle.w/2);
      ball.vx=hit*5;
      if(ball.vy>-2)ball.vy-=0.4;
      ball.y=paddle.y-ball.r-1;
    }
    if(ball.y-ball.r>paddle.y+paddle.h){
      lives--;livesEl.textContent=lives;
      if(lives<=0){return end(false);}
      ball.x=W/2;ball.y=paddle.y-10;ball.vx=4*(Math.random()<.5?-1:1);ball.vy=-4;
    }
    for(var i=0;i<bricks.length;i++){
      var b=bricks[i];
      if(b.alive&&ball.x+ball.r>b.x&&ball.x-ball.r<b.x+b.w&&ball.y+ball.r>b.y&&ball.y-ball.r<b.y+b.h){
        b.alive=false;
        var fromSide=(ball.x<b.x||ball.x>b.x+b.w);
        ball.vy=fromSide?ball.vy*-1:Math.abs(ball.vy)*-1;
        score+=10;scoreEl.textContent=score;
        break;
      }
    }
    if(bricks.every(function(b){return !b.alive;}))return end(true);
    draw();
    raf=requestAnimationFrame(loop);
  }
  function draw(){
    ctx.fillStyle=css('--bg-elev2');ctx.fillRect(0,0,W,H);
    bricks.forEach(function(b){if(b.alive){ctx.fillStyle=b.color;ctx.fillRect(b.x,b.y,b.w,b.h);}});
    ctx.fillStyle=css('--text');ctx.fillRect(paddle.x,paddle.y,paddle.w,paddle.h);
    ctx.fillStyle='#f59e0b';ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();
  }
  function end(win){
    running=false;cancelAnimationFrame(raf);
    if(score>best){best=score;bestEl.textContent=best;try{localStorage.setItem('tv_bo_best',best);}catch(e){}}
    msgEl.textContent=win?('You cleared it! Score '+score+' 🎉'):('Game Over — Score '+score);
    overlay.hidden=false;
  }
  window.boStart=function(){build();overlay.hidden=true;running=true;if(raf)cancelAnimationFrame(raf);loop();};
  function moveTo(clientX,rect){paddle.x=Math.max(0,Math.min(W-paddle.w,(clientX-rect.left)*(W/rect.width)-paddle.w/2));}
  canvas.addEventListener('mousemove',function(e){if(!running)return;moveTo(e.clientX,canvas.getBoundingClientRect());});
  canvas.addEventListener('touchmove',function(e){if(!running)return;moveTo(e.touches[0].clientX,canvas.getBoundingClientRect());e.preventDefault();},{passive:false});
  document.addEventListener('keydown',function(e){
    if(!running)return;
    if(e.key==='ArrowLeft')paddle.x=Math.max(0,paddle.x-26);
    else if(e.key==='ArrowRight')paddle.x=Math.min(W-paddle.w,paddle.x+26);
  });
  build();draw();
})();
</script>
