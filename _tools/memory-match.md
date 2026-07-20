---
title: "Memory Match"
link: "/tools/memory-match/"
description: "Flip cards, find the pairs, and clear the board from memory in this classic match game."
tags:
  - games
  - retro
  - puzzle
  - memory
category: "Games"
games_only: true
featured: false
icon: "🃏"
---
<link rel="stylesheet" href="/assets/css/retro-games.css">
<div class="tui">
  <h1>Memory Match</h1>
  <p class="sub">Flip two cards at a time. Match all the pairs with the fewest moves.</p>
  <div class="game-shell">
    <div class="game-hud">
      <span class="game-stat">Moves<b id="mm-moves">0</b></span>
      <span class="game-stat">Pairs<b id="mm-pairs">0</b></span>
      <span class="game-stat">Best<b id="mm-best">--</b></span>
    </div>
    <div class="game-controls">
      <select id="mm-diff" class="btn" style="padding:.45rem .8rem">
        <option value="4">Easy (4x2)</option>
        <option value="6" selected>Medium (4x3)</option>
        <option value="8">Hard (4x4)</option>
      </select>
      <button class="btn btn-primary" onclick="mmNew()">New Game</button>
    </div>
    <div id="mm-board" class="retro-grid"></div>
    <p class="game-hint" id="mm-status">Find all the matching pairs!</p>
  </div>
</div>
<script>
(function(){
  var boardEl=document.getElementById('mm-board'),movesEl=document.getElementById('mm-moves'),pairsEl=document.getElementById('mm-pairs'),bestEl=document.getElementById('mm-best'),statusEl=document.getElementById('mm-status'),diffEl=document.getElementById('mm-diff');
  var emojis=['🍎','🍌','🍇','🍉','🍓','🍒','🥝','🍑','🍍','🥥','🍋','🥭','🫐','🍊','🥑','🌽'];
  var cards,first,lock,moves,pairs;
  try{var b=JSON.parse(localStorage.getItem('tv_mm_best')||'{}');if(b[diffEl.value]!=null)bestEl.textContent=b[diffEl.value];}catch(e){}
  window.mmNew=function(){
    var n=+diffEl.value,total=n*2;
    var pool=emojis.slice(0,n);var deck=[];
    pool.forEach(function(e){deck.push(e,e);});
    for(var i=deck.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=deck[i];deck[i]=deck[j];deck[j]=t;}
    cards=deck.map(function(e){return{face:e,up:false,matched:false};});
    first=null;lock=false;moves=0;pairs=0;movesEl.textContent=0;pairsEl.textContent=0;statusEl.textContent='Find all the matching pairs!';
    var cols=n;boardEl.style.gridTemplateColumns='repeat('+cols+',1fr)';
    var cell=Math.max(48,Math.min(96,Math.floor(520/cols)));
    boardEl.innerHTML='';
    cards.forEach(function(c,i){
      var d=document.createElement('div');d.className='retro-cell';d.style.width=cell+'px';d.style.height=cell+'px';d.style.fontSize=(cell*0.5)+'px';
      d.dataset.i=i;d.textContent='❓';boardEl.appendChild(d);
    });
  };
  function paint(){cards.forEach(function(c,i){var el=boardEl.children[i];el.className='retro-cell'+(c.up||c.mat<0?' revealed':'');if(c.matched)el.classList.add('win');el.textContent=c.up||c.matched?c.face:'❓';});}
  boardEl.addEventListener('click',function(e){
    var i=e.target.dataset.i;if(i==null||lock)return;var c=cards[+i];
    if(c.up||c.matched)return;
    c.up=true;paint();
    if(!first){first=c;return;}
    moves++;movesEl.textContent=moves;lock=true;
    if(first.face===c.face){first.matched=c.matched=true;pairs++;pairsEl.textContent=pairs;first=null;lock=false;paint();
      if(pairs===cards.length/2){var key=diffEl.value,b=JSON.parse(localStorage.getItem('tv_mm_best')||'{}');if(b[key]==null||moves<b[key]){b[key]=moves;try{localStorage.setItem('tv_mm_best',JSON.stringify(b));}catch(e){}}bestEl.textContent=b[key];statusEl.textContent='Solved in '+moves+' moves! 🎉';}
    }else{
      setTimeout(function(){first.up=false;c.up=false;first=null;lock=false;paint();},700);
    }
  });
  diffEl.addEventListener('change',function(){var b=JSON.parse(localStorage.getItem('tv_mm_best')||'{}');bestEl.textContent=b[diffEl.value]!=null?b[diffEl.value]:'--';mmNew();});
  mmNew();
})();
</script>
