---
title: "Tic-Tac-Toe"
link: "/tools/tic-tac-toe/"
description: "The timeless 3x3 duel. Beat the computer in this quick strategy game."
tags:
  - games
  - retro
  - puzzle
  - tic-tac-toe
category: "Games"
games_only: true
featured: false
icon: "❎"
---
<link rel="stylesheet" href="/assets/css/retro-games.css">
<div class="tui">
  <h1>Tic-Tac-Toe</h1>
  <p class="sub">You're X, the computer is O. Get three in a row to win.</p>
  <div class="game-shell">
    <div class="game-hud">
      <span class="game-stat">Wins<b id="ttt-w">0</b></span>
      <span class="game-stat">Losses<b id="ttt-l">0</b></span>
      <span class="game-stat">Draws<b id="ttt-d">0</b></span>
    </div>
    <div id="ttt-board" class="retro-grid" style="grid-template-columns:repeat(3,1fr);width:min(300px,80vw)"></div>
    <p class="game-hint" id="ttt-status">Your move!</p>
    <div class="game-controls">
      <button class="btn btn-primary" onclick="tttNew()">New Game</button>
    </div>
  </div>
</div>
<script>
(function(){
  var boardEl=document.getElementById('ttt-board'),statusEl=document.getElementById('ttt-status');
  var wEl=document.getElementById('ttt-w'),lEl=document.getElementById('ttt-l'),dEl=document.getElementById('ttt-d');
  var board,over,turn;
  var rec=JSON.parse(localStorage.getItem('tv_ttt')||'{"w":0,"l":0,"d":0}');
  wEl.textContent=rec.w;lEl.textContent=rec.l;dEl.textContent=rec.d;
  function paint(){
    boardEl.innerHTML='';
    for(var i=0;i<9;i++){
      var d=document.createElement('div');d.className='retro-cell';d.style.height='90px';d.style.fontSize='2.4rem';
      d.textContent=board[i];if(board[i]==='X')d.style.color='#60a5fa';if(board[i]==='O')d.style.color='#f59e0b';
      d.dataset.i=i;boardEl.appendChild(d);
    }
  }
  function win(b){
    var L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(var i=0;i<L.length;i++){var[a,b2,c]=L[i];if(b[a]&&b[a]===b[b2]&&b[a]===b[c])return b[a];}
    return null;
  }
  function aiMove(){
    var best=-2,move=-1;
    for(var i=0;i<9;i++){if(!board[i]){board[i]='O';var s=score(true);if(s>best){best=s;move=i;}board[i]='';}}
    if(move<0){for(var j=0;j<9;j++)if(!board[j]){move=j;break;}}
    board[move]='O';
  }
  function score(maxi){
    var r=win(board);
    if(r==='O')return 1;if(r==='X')return -1;
    if(board.every(function(c){return c;}))return 0;
    var val=maxi?-2:2;
    for(var i=0;i<9;i++){if(!board[i]){board[i]=maxi?'O':'X';var s=score(!maxi);board[i]='';val=maxi?Math.max(val,s):Math.min(val,s);}}
    return val;
  }
  function after(){
    var r=win(board);
    if(r){over=true;if(r==='X'){rec.w++;statusEl.textContent='You win! 🎉';}else{rec.l++;statusEl.textContent='Computer wins.';}save();paint();return;}
    if(board.every(function(c){return c;})){over=true;rec.d++;statusEl.textContent="It's a draw.";save();paint();return;}
    turn='O';statusEl.textContent='Computer thinking...';paint();
    setTimeout(function(){if(over)return;aiMove();var r2=win(board);if(r2){over=true;if(r2==='O'){rec.l++;statusEl.textContent='Computer wins.';}save();paint();return;}turn='X';statusEl.textContent='Your move!';paint();},320);
  }
  function save(){try{localStorage.setItem('tv_ttt',JSON.stringify(rec));}catch(e){}wEl.textContent=rec.w;lEl.textContent=rec.l;dEl.textContent=rec.d;}
  window.tttNew=function(){board=Array(9).fill('');over=false;turn='X';statusEl.textContent='Your move!';paint();};
  boardEl.addEventListener('click',function(e){var i=e.target.dataset.i;if(i==null||over||turn!=='X'||board[i])return;board[+i]='X';after();});
  tttNew();
})();
</script>
