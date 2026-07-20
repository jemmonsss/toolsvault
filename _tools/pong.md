---
title: "Pong"
link: "/tools/pong/"
description: "The original arcade classic. Bounce the ball past the AI paddle to score."
tags:
  - games
  - retro
  - arcade
  - pong
category: "Games"
games_only: true
featured: true
icon: "🏓"
---
<link rel="stylesheet" href="/assets/css/retro-games.css">
<div class="tui">
  <h1>Pong</h1>
  <p class="sub">Move your paddle with the mouse or Up/Down arrows. First to 7 wins.</p>
  <div class="game-shell">
    <div class="game-hud">
      <span class="game-stat">You<b id="pong-you">0</b></span>
      <span class="game-stat">CPU<b id="pong-cpu">0</b></span>
    </div>
    <div class="game-overlay">
      <canvas id="pong-canvas" class="game-canvas" width="480" height="320"></canvas>
      <div class="overlay-msg" id="pong-overlay">
        <strong id="pong-msg">Ready?</strong>
        <button class="btn btn-primary" onclick="pongStart()">Play</button>
      </div>
    </div>
    <div class="game-controls">
      <button class="btn" onclick="pongStart()">Restart</button>
    </div>
    <p class="game-hint">Tip: on mobile, drag on the board to move your paddle.</p>
  </div>
</div>
<script>
(function(){
  var canvas=document.getElementById('pong-canvas'),ctx=canvas.getContext('2d');
  var youEl=document.getElementById('pong-you'),cpuEl=document.getElementById('pong-cpu');
  var overlay=document.getElementById('pong-overlay'),msgEl=document.getElementById('pong-msg');
  var W=canvas.width,H=canvas.height,pw=12,ph=64,running=false,raf=null;
  var player,ai,ball,you,cpu,touchY=null;
  function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()||'#e0e0e0';}
  function reset(){
    player={y:H/2-ph/2};ai={y:H/2-ph/2};you=0;cpu=0;youEl.textContent=0;cpuEl.textContent=0;
    ball={x:W/2,y:H/2,vx:4,vy:(Math.random()*2-1)*3};
  }
  function loop(){
    if(!running)return;
    ball.x+=ball.vx;ball.y+=ball.vy;
    if(ball.y<8||ball.y>H-8)ball.vy*=-1;
    var py=player.y;
    if(touchY!=null)py=touchY-ph/2;
    if(ball.x<24&&ball.y>py&&ball.y<py+ph){ball.vx=Math.abs(ball.vx);ball.vy+=(ball.y-(py+ph/2))/12;ball.vx*=1.04;}
    var target=ball.y-ph/2;
    ai.y+=(target-ai.y)*0.08;
    ai.y=Math.max(0,Math.min(H-ph,ai.y));
    if(ball.x>W-24&&ball.y>ai.y&&ball.y<ai.y+ph){ball.vx=-Math.abs(ball.vx);ball.vy+=(ball.y-(ai.y+ph/2))/12;}
    if(ball.x<0){cpu++;cpuEl.textContent=cpu;checkWin();serve(1);}
    if(ball.x>W){you++;youEl.textContent=you;checkWin();serve(-1);}
    draw(py);
    raf=requestAnimationFrame(loop);
  }
  function serve(d){ball={x:W/2,y:H/2,vx:4*d,vy:(Math.random()*2-1)*3};}
  function checkWin(){
    if(you>=7||cpu>=7){running=false;cancelAnimationFrame(raf);msgEl.textContent=(you>=7?'You win!':'CPU wins!')+'  Score '+you+'-'+cpu;overlay.hidden=false;}
  }
  function draw(py){
    ctx.fillStyle=css('--bg-elev2');ctx.fillRect(0,0,W,H);
    ctx.strokeStyle=css('--border2');ctx.setLineDash([6,8]);ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,H);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=css('--text');ctx.fillRect(12,py, pw, ph);ctx.fillRect(W-12-pw,ai.y,pw,ph);
    ctx.fillStyle='#f59e0b';ctx.beginPath();ctx.arc(ball.x,ball.y,7,0,Math.PI*2);ctx.fill();
  }
  window.pongStart=function(){reset();overlay.hidden=true;running=true;if(raf)cancelAnimationFrame(raf);loop();};
  canvas.addEventListener('mousemove',function(e){var r=canvas.getBoundingClientRect();player.y=(e.clientY-r.top)*(H/r.height)-ph/2;});
  canvas.addEventListener('touchmove',function(e){var r=canvas.getBoundingClientRect();touchY=(e.touches[0].clientY-r.top)*(H/r.height);},{passive:true});
  canvas.addEventListener('touchstart',function(e){var r=canvas.getBoundingClientRect();touchY=(e.touches[0].clientY-r.top)*(H/r.height);},{passive:true});
  document.addEventListener('keydown',function(e){
    if(e.key==='ArrowUp'){player.y=Math.max(0,player.y-22);e.preventDefault();}
    else if(e.key==='ArrowDown'){player.y=Math.min(H-ph,player.y+22);e.preventDefault();}
  });
  reset();draw(H/2-ph/2);
})();
</script>
