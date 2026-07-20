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
  <p class="sub">Move the paddle with your mouse or arrow keys. Destroy all the bricks.</p>
  <div class="game-shell">
    <div class="game-hud">
      <span class="game-stat">Score<b id="bo-score">0</b></span>
      <span class="game-stat">Lives<b id="bo-lives">3</b></span>
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
  </div>
</div>
<script>
(function(){
  var canvas=document.getElementById('bo-canvas'),ctx=canvas.getContext('2d');
  var scoreEl=document.getElementById('bo-score'),livesEl=document.getElementById('bo-lives');
  var overlay=document.getElementById('bo-overlay'),msgEl=document.getElementById('bo-msg');
  var W=canvas.width,H=canvas.height,running=false,raf=null;
  var paddle,ball,bricks,score,lives;
  function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()||'#e0e0e0';}
  function build(){
    paddle={w:80,h:12,x:W/2-40};
    ball={x:W/2,y:H-30,r:7,vx:3,vy:-3,speed:4};
    bricks=[];var cols=10,rows=5,bw=W/cols,bh=18,colsArr=['#f87171','#f59e0b','#facc15','#34d399','#60a5fa'];
    for(var r=0;r<rows;r++)for(var c=0;c<cols;c++)bricks.push({x:c*bw+2,y:40+r*(bh+4),w:bw-4,h:bh,color:colsArr[r],alive:true});
    score=0;lives=3;scoreEl.textContent=0;livesEl.textContent=3;
  }
  function loop(){
    if(!running)return;
    ball.x+=ball.vx;ball.y+=ball.vy;
    if(ball.x<ball.r||ball.x>W-ball.r)ball.vx*=-1;
    if(ball.y<ball.r)ball.vy*=-1;
    if(ball.y>H){lives--;livesEl.textContent=lives;if(lives<=0){return end(false);}ball.x=W/2;ball.y=H-30;ball.vx=3;ball.vy=-3;}
    if(ball.y+ball.r>paddle.y&&ball.x>paddle.x&&ball.x<paddle.x+paddle.w){ball.vy=-Math.abs(ball.vy);ball.vx+=(ball.x-(paddle.x+paddle.w/2))/30;}
    bricks.forEach(function(b){if(b.alive&&ball.x>b.x&&ball.x<b.x+b.w&&ball.y-ball.r<b.y+b.h&&ball.y+ball.r>b.y){b.alive=false;ball.vy*=-1;score+=10;scoreEl.textContent=score;}});
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
  function end(win){running=false;cancelAnimationFrame(raf);msgEl.textContent=win?('You win! Score '+score):('Game Over — Score '+score);overlay.hidden=false;}
  window.boStart=function(){build();overlay.hidden=true;running=true;if(raf)cancelAnimationFrame(raf);loop();};
  canvas.addEventListener('mousemove',function(e){var r=canvas.getBoundingClientRect();paddle.x=(e.clientX-r.top)*(W/r.width)-paddle.w/2;paddle.x=Math.max(0,Math.min(W-paddle.w,paddle.x));});
  canvas.addEventListener('touchmove',function(e){var r=canvas.getBoundingClientRect();paddle.x=(e.touches[0].clientX-r.left)*(W/r.width)-paddle.w/2;paddle.x=Math.max(0,Math.min(W-paddle.w,paddle.x));e.preventDefault();},{passive:false});
  document.addEventListener('keydown',function(e){if(!running)return;if(e.key==='ArrowLeft')paddle.x=Math.max(0,paddle.x-24);if(e.key==='ArrowRight')paddle.x=Math.min(W-paddle.w,paddle.x+24);});
  build();draw();
})();
</script>
