---
title: "Snake"
link: "/tools/snake/"
description: "The classic Snake arcade game. Eat, grow, and don't hit the walls or yourself."
tags:
  - games
  - retro
  - arcade
  - snake
category: "Games"
games_only: true
featured: true
icon: "🐍"
---
<link rel="stylesheet" href="/assets/css/retro-games.css">
<div class="tui">
  <h1>Snake</h1>
  <p class="sub">Use arrow keys or WASD. Eat the food, grow longer, avoid walls and yourself.</p>
  <div class="game-shell">
    <div class="game-hud">
      <span class="game-stat">Score<b id="snake-score">0</b></span>
      <span class="game-stat">Best<b id="snake-best">0</b></span>
    </div>
    <div class="game-overlay">
      <canvas id="snake-canvas" class="game-canvas" width="400" height="400"></canvas>
      <div class="overlay-msg" id="snake-overlay">
        <strong id="snake-msg">Ready?</strong>
        <button class="btn btn-primary" onclick="snakeStart()">Play</button>
      </div>
    </div>
    <div class="game-controls">
      <button class="btn" onclick="snakeStart()">Restart</button>
    </div>
    <p class="game-hint">Tip: on mobile, swipe on the board to steer.</p>
  </div>
</div>
<script>
(function(){
  var canvas=document.getElementById('snake-canvas');
  var ctx=canvas.getContext('2d');
  var scoreEl=document.getElementById('snake-score');
  var bestEl=document.getElementById('snake-best');
  var overlay=document.getElementById('snake-overlay');
  var msgEl=document.getElementById('snake-msg');
  var size=20, cols=canvas.width/size, rows=canvas.height/size;
  var snake, dir, nextDir, food, score, best=0, timer=null, alive=false;
  try{best=parseInt(localStorage.getItem('tv_snake_best')||'0',10)||0;}catch(e){}
  bestEl.textContent=best;
  function reset(){
    snake=[{x:8,y:10},{x:7,y:10},{x:6,y:10}];
    dir={x:1,y:0}; nextDir={x:1,y:0};
    score=0; scoreEl.textContent=0;
    placeFood();
  }
  function placeFood(){
    while(true){
      var f={x:Math.floor(Math.random()*cols),y:Math.floor(Math.random()*rows)};
      if(!snake.some(function(s){return s.x===f.x&&s.y===f.y;})){food=f;return;}
    }
  }
  function draw(){
    ctx.fillStyle=getCss('--bg-elev2'); ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#22c55e';
    snake.forEach(function(s,i){ctx.fillStyle=i===0?'#4ade80':'#22c55e';ctx.fillRect(s.x*size+1,s.y*size+1,size-2,size-2);});
    ctx.fillStyle='#f59e0b'; ctx.fillRect(food.x*size+2,food.y*size+2,size-4,size-4);
  }
  function getCss(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()||'#252525';}
  function step(){
    dir=nextDir;
    var head={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
    if(head.x<0||head.y<0||head.x>=cols||head.y>=rows||snake.some(function(s){return s.x===head.x&&s.y===head.y;})){return gameOver();}
    snake.unshift(head);
    if(head.x===food.x&&head.y===food.y){
      score+=10; scoreEl.textContent=score; placeFood();
    } else { snake.pop(); }
    draw();
  }
  function gameOver(){
    alive=false; clearInterval(timer);
    if(score>best){best=score;bestEl.textContent=best;try{localStorage.setItem('tv_snake_best',best);}catch(e){}}
    msgEl.textContent='Game Over — Score '+score;
    overlay.hidden=false;
  }
  window.snakeStart=function(){
    reset(); draw(); overlay.hidden=true; alive=true;
    if(timer)clearInterval(timer);
    timer=setInterval(step,90);
  };
  function setDir(x,y){
    if(!alive)return;
    if(x===0&&y===0)return;
    if(x===-dir.x&&y===-dir.y)return;
    nextDir={x:x,y:y};
  }
  document.addEventListener('keydown',function(e){
    var k=e.key.toLowerCase();
    if(k==='arrowup'||k==='w'){setDir(0,-1);e.preventDefault();}
    else if(k==='arrowdown'||k==='s'){setDir(0,1);e.preventDefault();}
    else if(k==='arrowleft'||k==='a'){setDir(-1,0);e.preventDefault();}
    else if(k==='arrowright'||k==='d'){setDir(1,0);e.preventDefault();}
  });
  var tx=0,ty=0;
  canvas.addEventListener('touchstart',function(e){var t=e.touches[0];tx=t.clientX;ty=t.clientY;},{passive:true});
  canvas.addEventListener('touchend',function(e){
    var t=e.changedTouches[0],dx=t.clientX-tx,dy=t.clientY-ty;
    if(Math.abs(dx)>Math.abs(dy))setDir(dx>0?1:-1,0);else setDir(0,dy>0?1:-1);
  },{passive:true});
  reset(); draw();
})();
</script>
