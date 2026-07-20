---
title: "Hangman"
link: "/tools/hangman/"
description: "Guess the word one letter at a time before the stick figure is complete."
tags:
  - games
  - retro
  - word
  - hangman
category: "Games"
games_only: true
featured: false
icon: "🪢"
---
<link rel="stylesheet" href="/assets/css/retro-games.css">
<div class="tui">
  <h1>Hangman</h1>
  <p class="sub">Guess the hidden word. Pick a letter — six wrong guesses and it's game over.</p>
  <div class="game-shell">
    <div class="game-hud">
      <span class="game-stat">Wrong<b id="hm-wrong">0/6</b></span>
      <span class="game-stat">Wins<b id="hm-w">0</b></span>
      <span class="game-stat">Streak<b id="hm-streak">0</b></span>
    </div>
    <div id="hm-word" style="font-size:2rem;letter-spacing:.4rem;font-weight:700;min-height:2.4rem"></div>
    <canvas id="hm-canvas" class="game-canvas" width="200" height="200" style="max-width:200px"></canvas>
    <div id="hm-letters" class="game-controls" style="max-width:420px"></div>
    <p class="game-hint" id="hm-status">Choose a letter to begin.</p>
    <div class="game-controls">
      <button class="btn btn-primary" onclick="hmNew()">New Word</button>
    </div>
  </div>
</div>
<script>
(function(){
  var wordEl=document.getElementById('hm-word'),wrongEl=document.getElementById('hm-wrong'),statusEl=document.getElementById('hm-status');
  var canvas=document.getElementById('hm-canvas'),ctx=canvas.getContext('2d'),lettersEl=document.getElementById('hm-letters');
  var wEl=document.getElementById('hm-w'),streakEl=document.getElementById('hm-streak');
  var words=['gta','roleplay','server','vehicle','helicopter','mission','sandbox','police','weapon','garage','keycard','drift','races','faction'];
  var word,guessed,wrong,over,rec=JSON.parse(localStorage.getItem('tv_hm')||'{"w":0,"streak":0}');
  wEl.textContent=rec.w;streakEl.textContent=rec.streak;
  function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()||'#e0e0e0';}
  function drawGallows(){
    ctx.strokeStyle=css('--text');ctx.lineWidth=2;ctx.clearRect(0,0,200,200);
    ctx.beginPath();ctx.moveTo(20,190);ctx.lineTo(180,190);ctx.moveTo(50,190);ctx.lineTo(50,30);ctx.lineTo(120,30);ctx.lineTo(120,50);ctx.stroke();
    var parts=[[function(){ctx.beginPath();ctx.arc(120,65,15,0,Math.PI*2);ctx.stroke();}],
      [function(){ctx.beginPath();ctx.moveTo(120,80);ctx.lineTo(120,130);ctx.stroke();}],
      [function(){ctx.beginPath();ctx.moveTo(120,90);ctx.lineTo(95,115);ctx.moveTo(120,90);ctx.lineTo(145,115);ctx.stroke();}],
      [function(){ctx.beginPath();ctx.moveTo(120,130);ctx.lineTo(100,165);ctx.moveTo(120,130);ctx.lineTo(140,165);ctx.stroke();}],
      [function(){ctx.fillStyle=css('--danger');ctx.beginPath();ctx.arc(120,65,3,0,Math.PI*2);ctx.fill();}],
      [function(){ctx.fillStyle=css('--danger');ctx.font='20px sans-serif';ctx.fillText('X',112,150);}]];
    for(var i=0;i<wrong;i++)parts[i][0]();
  }
  function paint(){
    wordEl.textContent=word.split('').map(function(ch){return guessed.indexOf(ch)>=0?ch:'_';}).join(' ');
    wrongEl.textContent=wrong+'/6';
    drawGallows();
  }
  function buildLetters(){
    lettersEl.innerHTML='';
    for(var i=0;i<26;i++){var ch=String.fromCharCode(65+i);
      (function(ch){var b=document.createElement('button');b.className='btn';b.style.padding='.35rem .55rem';b.textContent=ch;b.dataset.l=ch;
        b.addEventListener('click',function(){guess(ch.toLowerCase());});lettersEl.appendChild(b);})(ch);}
  }
  function guess(ch){
    if(over||guessed.indexOf(ch)>=0)return;
    guessed.push(ch);
    var b=lettersEl.querySelector('[data-l="'+ch.toUpperCase()+'"]');if(b){b.disabled=true;b.style.opacity=.4;}
    if(word.indexOf(ch)<0){wrong++;if(wrong>=6){over=true;rec.streak=0;statusEl.textContent='Game over! The word was "'+word+'".';}}
    else if(word.split('').every(function(c){return guessed.indexOf(c)>=0;})){over=true;rec.w++;rec.streak++;statusEl.textContent='You got it! 🎉 ('+word+')';}
    else statusEl.textContent='Good guess!';
    save();paint();
  }
  function save(){try{localStorage.setItem('tv_hm',JSON.stringify(rec));}catch(e){}wEl.textContent=rec.w;streakEl.textContent=rec.streak;}
  window.hmNew=function(){word=words[Math.floor(Math.random()*words.length)];guessed=[];wrong=0;over=false;statusEl.textContent='Choose a letter to begin.';buildLetters();paint();};
  hmNew();
})();
</script>
