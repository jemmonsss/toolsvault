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
  <p class="sub">Move with ← → (or mouse/finger), Space to fire. Stop the fleet from reaching the ground.</p>
  <div class="game-shell">
    <div class="game-hud">
      <span class="game-stat">Score<b id="si-score">0</b></span>
      <span class="game-stat">Wave<b id="si-wave">1</b></span>
      <span class="game-stat">Best<b id="si-best">0</b></span>
    </div>
    <div class="game-overlay">
      <canvas id="si-canvas" class="game-canvas" width="440" height="400"></canvas>
      <div class="overlay-msg" id="si-overlay">
        <strong id="si-msg">Ready?</strong>
        <button class="btn btn-primary" onclick="siStart()">Play</button>
      </div>
    </div>
    <div class="game-controls">
      <button class="btn" onclick="siStart()">Restart</button>
    </div>
    <p class="game-hint">Clear all aliens each wave — they speed up as their numbers fall.</p>
  </div>
</div>
<script>
(function(){
  var canvas=document.getElementById('si-canvas'),ctx=canvas.getContext('2d');
  var scoreEl=document.getElementById('si-score'),waveEl=document.getElementById('si-wave'),bestEl=document.getElementById('si-best');
  var overlay=document.getElementById('si-overlay'),msgEl=document.getElementById('si-msg');
  var W=canvas.width,H=canvas.height,running=false,raf=null;
  var player,shots,aliens,alienShots,invDir,invSpeed,dropDist,score,best=0,wave,lastShot=0,lastAlienShot=0;
  try{best=parseInt(localStorage.getItem('tv_si_best')||'0',10)||0;}catch(e){}
  bestEl.textContent=best;
  function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()||'#e0e0e0';}
  // 8x8 alien sprite bitmaps (two frames)
  var SPR=[
    [[0,0,1,0,0,0,1,0],[0,0,0,1,0,1,0,0],[0,0,1,1,1,1,1,0],[0,1,1,0,1,0,1,1],[1,1,1,1,1,1,1,1],[1,0,1,1,1,1,0,1],[1,0,1,0,0,0,1,0],[0,0,0,1,1,0,0,0]],
    [[0,0,1,0,0,0,1,0],[1,0,0,1,0,1,0,0],[1,0,1,1,1,1,1,0],[1,1,1,0,1,0,1,1],[1,1,1,1,1,1,1,1],[0,0,1,1,1,1,0,0],[0,0,1,0,0,0,1,0],[0,1,0,0,0,0,1,0]]
  ];
  function build(){
    player={x:W/2-15,w:30,h:12,y:H-22};
    shots=[];alienShots=[];score=0;wave=1;lastShot=0;lastAlienShot=0;
    scoreEl.textContent=0;waveEl.textContent=1;
    spawnWave();
  }
  function spawnWave(){
    aliens=[];var cols=11,rows=5,gap=8,bw=22,bh=16,ox=(W-cols*(bw+gap))/2,oy=40;
    for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){
      aliens.push({x:ox+c*(bw+gap),y:oy+r*(bh+gap),w:bw,h:bh,row:r,alive:true,frame:0});
    }
    invDir=1;invSpeed=0.4+wave*0.12;dropDist=14;
  }
  function aliveAliens(){return aliens.filter(function(a){return a.alive;});}
  function drawSprite(a,color){
    var px=Math.floor(a.w/8),py=Math.floor(a.h/8),bm=SPR[a.frame];
    ctx.fillStyle=color;
    for(var r=0;r<8;r++)for(var c=0;c<8;c++)if(bm[r][c])ctx.fillRect(a.x+c*px,a.y+r*py,px,py);
  }
  function loop(){
    if(!running)return;
    var al=aliveAliens();
    if(al.length===0){wave++;waveEl.textContent=wave;spawnWave();}
    var minX=Math.min.apply(null,al.map(function(a){return a.x;})),maxX=Math.max.apply(null,al.map(function(a){return a.x+a.w;}));
    var step=invSpeed+ (1-al.length/ (11*5))*1.2;
    var hitEdge=false;
    if(minX<=2){invDir=1;hitEdge=true;}
    if(maxX>=W-2){invDir=-1;hitEdge=true;}
    al.forEach(function(a){
      a.x+=invDir*step;
      if(hitEdge)a.y+=dropDist;
      a.frame=(a.frame+1)%2;
      if(a.y+a.h>=player.y)return end(false);
    });
    if(hitEdge&&al.some(function(a){return a.y+a.h>=player.y;}))return end(false);
    shots.forEach(function(s){s.y-=8;});
    shots=shots.filter(function(s){return s.y>-10;});
    alienShots.forEach(function(s){s.y+=5;});
    alienShots=alienShots.filter(function(s){return s.y<H+10;});
    shots.forEach(function(s){
      al.forEach(function(a){if(a.alive&&s.x>a.x&&s.x<a.x+a.w&&s.y>a.y&&s.y<a.y+a.h){a.alive=false;s.dead=true;score+=(5*(6-a.row));scoreEl.textContent=score;}});
    });
    shots=shots.filter(function(s){return !s.dead;});
    var now=Date.now();
    if(now-lastAlienShot>700 && al.length){
      lastAlienShot=now;
      var shooter=al[Math.floor(Math.random()*al.length)];
      alienShots.push({x:shooter.x+shooter.w/2,y:shooter.y+shooter.h});
    }
    alienShots.forEach(function(s){if(s.x>player.x&&s.x<player.x+player.w&&s.y>player.y&&s.y<player.y+player.h)return end(false);});
    draw();
    raf=requestAnimationFrame(loop);
  }
  function draw(){
    ctx.fillStyle=css('--bg-elev2');ctx.fillRect(0,0,W,H);
    var cols=['#f87171','#f59e0b','#facc15','#34d399','#22d3ee'];
    aliveAliens().forEach(function(a){drawSprite(a,cols[a.row%cols.length]);});
    ctx.fillStyle='#60a5fa';ctx.fillRect(player.x,player.y,player.w,player.h);
    ctx.fillStyle='#f59e0b';shots.forEach(function(s){ctx.fillRect(s.x-2,s.y,4,12);});
    ctx.fillStyle='#ef4444';alienShots.forEach(function(s){ctx.fillRect(s.x-2,s.y,4,12);});
  }
  function end(win){
    running=false;cancelAnimationFrame(raf);
    if(score>best){best=score;bestEl.textContent=best;try{localStorage.setItem('tv_si_best',best);}catch(e){}}
    msgEl.textContent=win?('You won! Score '+score):('Game Over — Score '+score);
    overlay.hidden=false;
  }
  window.siStart=function(){build();overlay.hidden=true;running=true;if(raf)cancelAnimationFrame(raf);loop();};
  function fire(){var now=Date.now();if(now-lastShot<280)return;lastShot=now;shots.push({x:player.x+player.w/2,y:player.y});}
  function moveTo(clientX,rect){player.x=Math.max(0,Math.min(W-player.w,(clientX-rect.left)*(W/rect.width)-player.w/2));}
  document.addEventListener('keydown',function(e){
    if(!running)return;
    if(e.key==='ArrowLeft')player.x=Math.max(0,player.x-20);
    else if(e.key==='ArrowRight')player.x=Math.min(W-player.w,player.x+20);
    else if(e.key===' '){fire();e.preventDefault();}
  });
  canvas.addEventListener('mousemove',function(e){if(!running)return;moveTo(e.clientX,canvas.getBoundingClientRect());});
  canvas.addEventListener('click',function(){if(running)fire();});
  canvas.addEventListener('touchmove',function(e){if(!running)return;moveTo(e.touches[0].clientX,canvas.getBoundingClientRect());e.preventDefault();},{passive:false});
  canvas.addEventListener('touchstart',function(){if(running)fire();},{passive:true});
  build();draw();
})();
</script>
