---
title: "Space Invaders"
link: "/tools/space-invaders/"
description: "Defend Earth! Blast the descending alien fleet in this arcade legend."
tags:
  - games
  - retro
  - arcade
  - space-invaders
category: "Games"
games_only: true
featured: false
icon: "👾"
---
<link rel="stylesheet" href="/assets/css/retro-games.css">
<div class="tui">
  <h1>Space Invaders</h1>
  <p class="sub">Move with ← → (or mouse), press Space to fire. Wipe out the fleet.</p>
  <div class="game-shell">
    <div class="game-hud">
      <span class="game-stat">Score<b id="si-score">0</b></span>
      <span class="game-stat">Wave<b id="si-wave">1</b></span>
      <span class="game-stat">Best<b id="si-best">0</b></span>
    </div>
    <div class="game-overlay">
      <canvas id="si-canvas" class="game-canvas" width="440" height="360"></canvas>
      <div class="overlay-msg" id="si-overlay">
        <strong id="si-msg">Ready?</strong>
        <button class="btn btn-primary" onclick="siStart()">Play</button>
      </div>
    </div>
    <div class="game-controls">
      <button class="btn" onclick="siStart()">Restart</button>
    </div>
  </div>
</div>
<script>
(function(){
  var canvas=document.getElementById('si-canvas'),ctx=canvas.getContext('2d');
  var scoreEl=document.getElementById('si-score'),waveEl=document.getElementById('si-wave'),bestEl=document.getElementById('si-best');
  var overlay=document.getElementById('si-overlay'),msgEl=document.getElementById('si-msg');
  var W=canvas.width,H=canvas.height,running=false,raf=null;
  var player,bullets,invaders,invDir,invSpeed,score,best=0,wave,lastShot=0;
  try{best=parseInt(localStorage.getItem('tv_si_best')||'0',10)||0;}catch(e){}
  bestEl.textContent=best;
  function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()||'#e0e0e0';}
  function build(){
    player={x:W/2-15,w:30,h:12,y:H-20};
    bullets=[];score=0;wave=1;invDir=1;invSpeed=0.5;
    scoreEl.textContent=0;waveEl.textContent=1;
    spawnWave();
  }
  function spawnWave(){
    invaders=[];var cols=8,rows=4,bw=34,bh=22,gap=10,ox=20,oy=30;
    for(var r=0;r<rows;r++)for(var c=0;c<cols;c++)invaders.push({x:ox+c*(bw+gap),y:oy+r*(bh+gap),w:bw,h:bh,alive:true});
    invSpeed+=0.15;
  }
  function aliveInv(){return invaders.filter(function(i){return i.alive;});}
  function loop(){
    if(!running)return;
    var ai=aliveInv();
    if(ai.length===0){wave++;waveEl.textContent=wave;spawnWave();}
    var minX=Math.min.apply(null,ai.map(function(i){return i.x;})),maxX=Math.max.apply(null,ai.map(function(i){return i.x+i.w;}));
    if(minX<=0||maxX>=W)invDir*=-1;
    ai.forEach(function(i){i.x+=invDir*invSpeed;i.y+=0;});
    if(ai.some(function(i){return i.y+i.h>=player.y;}))return end(false);
    bullets.forEach(function(b){b.y-=6;});
    bullets=bullets.filter(function(b){return b.y>-10;});
    bullets.forEach(function(b){
      ai.forEach(function(i){if(i.alive&&b.x>i.x&&b.x<i.x+i.w&&b.y>i.y&&b.y<i.y+i.h){i.alive=false;b.dead=true;score+=10;scoreEl.textContent=score;}});
    });
    bullets=bullets.filter(function(b){return !b.dead;});
    draw();
    raf=requestAnimationFrame(loop);
  }
  function draw(){
    ctx.fillStyle=css('--bg-elev2');ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#34d399';invaders.forEach(function(i){if(i.alive)ctx.fillRect(i.x,i.y,i.w,i.h);});
    ctx.fillStyle='#60a5fa';ctx.fillRect(player.x,player.y,player.w,player.h);
    ctx.fillStyle='#f59e0b';bullets.forEach(function(b){ctx.fillRect(b.x-2,b.y,4,10);});
  }
  function end(win){running=false;cancelAnimationFrame(raf);if(score>best){best=score;bestEl.textContent=best;try{localStorage.setItem('tv_si_best',best);}catch(e){}}msgEl.textContent=win?('You won! Score '+score):('Game Over — Score '+score);overlay.hidden=false;}
  window.siStart=function(){build();overlay.hidden=true;running=true;if(raf)cancelAnimationFrame(raf);loop();};
  function fire(){var now=Date.now();if(now-lastShot<250)return;lastShot=now;bullets.push({x:player.x+player.w/2,y:player.y});}
  document.addEventListener('keydown',function(e){
    if(!running)return;
    if(e.key==='ArrowLeft')player.x=Math.max(0,player.x-18);
    else if(e.key==='ArrowRight')player.x=Math.min(W-player.w,player.x+18);
    else if(e.key===' '){fire();e.preventDefault();}
  });
  canvas.addEventListener('mousemove',function(e){var r=canvas.getBoundingClientRect();player.x=Math.max(0,Math.min(W-player.w,(e.clientX-r.left)*(W/r.width)-player.w/2));});
  canvas.addEventListener('click',function(){if(running)fire();});
  canvas.addEventListener('touchmove',function(e){var r=canvas.getBoundingClientRect();player.x=Math.max(0,Math.min(W-player.w,(e.touches[0].clientX-r.left)*(W/r.width)-player.w/2));e.preventDefault();},{passive:false});
  canvas.addEventListener('touchstart',function(){if(running)fire();},{passive:true});
  build();draw();
})();
</script>
