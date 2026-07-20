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
    <div class="game-controls">
      <select id="ttt-diff" class="btn" style="padding:.45rem .8rem">
        <option value="easy">Easy (random)</option>
        <option value="medium" selected>Medium (smart)</option>
        <option value="hard">Hard (unbeatable)</option>
      </select>
      <button class="btn btn-primary" onclick="tttNew()">New Game</button>
    </div>
    <div id="ttt-board" class="retro-grid" style="grid-template-columns:repeat(3,1fr);width:min(300px,80vw)"></div>
    <p class="game-hint" id="ttt-status">Your move!</p>
  </div>
</div>
<script>
(function(){
  var boardEl=document.getElementById('ttt-board'),statusEl=document.getElementById('ttt-status');
  var wEl=document.getElementById('ttt-w'),lEl=document.getElementById('ttt-l'),dEl=document.getElementById('ttt-d'),diffEl=document.getElementById('ttt-diff');
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
    for(var i=0;i<L.length;i++){var a=L[i][0],b2=L[i][1],c=L[i][2];if(b[a]&&b[a]===b[b2]&&b[a]===b[c])return b[a];}
    return null;
  }
  function emptyCells(b){var e=[];for(var i=0;i<9;i++)if(!b[i])e.push(i);return e;}
  function scoreBoard(b){
    var r=win(b);
    if(r==='O')return 10;
    if(r==='X')return -10;
    if(emptyCells(b).length===0)return 0;
    return null;
  }
  // Minimax for Hard
  function minimax(b,player){
    var s=scoreBoard(b);
    if(s!==null)return s;
    var cells=emptyCells(b);
    if(player==='O'){
      var best=-Infinity;
      for(var i=0;i<cells.length;i++){b[cells[i]]='O';var v=minimax(b,'X');b[cells[i]]='';best=Math.max(best,v);}
      return best;
    }else{
      var best2=Infinity;
      for(var j=0;j<cells.length;j++){b[cells[j]]='X';var v2=minimax(b,'O');b[cells[j]]='';best2=Math.min(best2,v2);}
      return best2;
    }
  }
  function bestMove(){
    var cells=emptyCells(board),best=-Infinity,move=cells[0];
    for(var i=0;i<cells.length;i++){board[cells[i]]='O';var v=minimax(board,'X');board[cells[i]]='';if(v>best){best=v;move=cells[i];}}
    return move;
  }
  function winMove(){ // immediate win or block
    for(var i=0;i<9;i++){if(!board[i]){board[i]='O';if(win(board)==='O'){board[i]='';return i;}board[i]='';}}
    for(var j=0;j<9;j++){if(!board[j]){board[j]='X';if(win(board)==='X'){board[j]='';return j;}board[j]='';}}
    return -1;
  }
  function aiMove(){
    var diff=diffEl.value;
    if(diff==='easy'){
      var cells=emptyCells(board);board[cells[Math.floor(Math.random()*cells.length)]]='O';return;
    }
    if(diff==='medium'){
      var w=winMove();if(w>=0){board[w]='O';return;}
      // 60% chance of a smart center/corner pick, else random
      var pick=Math.random()<0.6?bestMove():emptyCells(board)[Math.floor(Math.random()*emptyCells(board).length)];
      board[pick]='O';return;
    }
    board[bestMove()]='O';
  }
  function after(){
    var r=win(board);
    if(r){over=true;if(r==='X'){rec.w++;statusEl.textContent='You win! 🎉';}else{rec.l++;statusEl.textContent='Computer wins.';}save();paint();return;}
    if(emptyCells(board).length===0){over=true;rec.d++;statusEl.textContent="It's a draw.";save();paint();return;}
    turn='O';statusEl.textContent='Computer thinking...';paint();
    setTimeout(function(){if(over)return;aiMove();var r2=win(board);if(r2){over=true;if(r2==='O'){rec.l++;statusEl.textContent='Computer wins.';}save();paint();return;}if(emptyCells(board).length===0){over=true;rec.d++;statusEl.textContent="It's a draw.";save();paint();return;}turn='X';statusEl.textContent='Your move!';paint();},320);
  }
  function save(){try{localStorage.setItem('tv_ttt',JSON.stringify(rec));}catch(e){}wEl.textContent=rec.w;lEl.textContent=rec.l;dEl.textContent=rec.d;}
  window.tttNew=function(){board=Array(9).fill('');over=false;turn='X';statusEl.textContent='Your move!';paint();};
  boardEl.addEventListener('click',function(e){var i=e.target.dataset.i;if(i==null||over||turn!=='X'||board[i])return;board[+i]='X';after();});
  diffEl.addEventListener('change',function(){tttNew();});
  tttNew();
})();
</script>
