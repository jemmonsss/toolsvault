---
title: "Simon"
link: "/tools/simon/"
description: "Watch the flashing color sequence, then repeat it back. How long can you last?"
tags:
  - games
  - retro
  - memory
  - simon
category: "Games"
games_only: true
featured: false
icon: "🎯"
---
<link rel="stylesheet" href="/assets/css/retro-games.css">
<div class="tui">
  <h1>Simon</h1>
  <p class="sub">Memorize the light sequence and repeat it. Each round adds one step.</p>
  <div class="game-shell">
    <div class="game-hud">
      <span class="game-stat">Round<b id="sm-round">0</b></span>
      <span class="game-stat">Best<b id="sm-best">0</b></span>
    </div>
    <div id="sm-pad" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;width:min(280px,80vw)">
      <div class="retro-cell" data-c="0" style="height:120px;background:#ef4444;border-radius:12px;opacity:.55"></div>
      <div class="retro-cell" data-c="1" style="height:120px;background:#22c55e;border-radius:12px;opacity:.55"></div>
      <div class="retro-cell" data-c="2" style="height:120px;background:#f59e0b;border-radius:12px;opacity:.55"></div>
      <div class="retro-cell" data-c="3" style="height:120px;background:#3b82f6;border-radius:12px;opacity:.55"></div>
    </div>
    <p class="game-hint" id="sm-status">Press Start to watch the sequence.</p>
    <div class="game-controls">
      <button class="btn btn-primary" onclick="smStart()">Start</button>
    </div>
  </div>
</div>
<script>
(function(){
  var roundEl=document.getElementById('sm-round'),bestEl=document.getElementById('sm-best'),statusEl=document.getElementById('sm-status');
  var pad=document.getElementById('sm-pad'),cells=pad.children;
  var colors=['#ef4444','#22c55e','#f59e0b','#3b82f6'];
  var seq=[],input=[],best=0,accept=false,playing=false;
  try{best=parseInt(localStorage.getItem('tv_sm_best')||'0',10)||0;}catch(e){}
  bestEl.textContent=best;
  function flash(i){
    cells[i].style.opacity='1';cells[i].style.boxShadow='0 0 24px '+colors[i];
    try{var ac=new (window.AudioContext||window.webkitAudioContext)();var o=ac.createOscillator(),g=ac.createGain();o.connect(g);g.connect(ac.destination);o.frequency.value=[329,392,440,523][i];o.start();setTimeout(function(){o.stop();},300);}catch(e){}
    setTimeout(function(){cells[i].style.opacity='.55';cells[i].style.boxShadow='none';},320);
  }
  function playSeq(){
    accept=false;statusEl.textContent='Watch...';var k=0;
    var iv=setInterval(function(){if(k>=seq.length){clearInterval(iv);accept=true;statusEl.textContent='Your turn!';return;}flash(seq[k]);k++;},600);
  }
  function nextRound(){seq.push(Math.floor(Math.random()*4));input=[];roundEl.textContent=seq.length;playSeq();}
  window.smStart=function(){if(playing)return;playing=true;seq=[];input=[];nextRound();};
  function tap(i){
    if(!accept)return;flash(i);input.push(i);
    if(input[input.length-1]!==seq[input.length-1]){accept=false;playing=false;if(seq.length-1>best){best=seq.length-1;bestEl.textContent=best;try{localStorage.setItem('tv_sm_best',best);}catch(e){}}statusEl.textContent='Wrong! You reached round '+(seq.length-1)+'.';return;}
    if(input.length===seq.length){statusEl.textContent='Nice!';setTimeout(nextRound,600);}
  }
  for(var i=0;i<4;i++){(function(i){cells[i].addEventListener('click',function(){tap(i);});})(i);}
})();
</script>
