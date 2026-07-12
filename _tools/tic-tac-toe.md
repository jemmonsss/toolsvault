---
title: "Tic Tac Toe"
link: "/tools/tic-tac-toe/"
description: "Play Tic Tac Toe against the computer or a friend."
tags:
  - tic-tac-toe
  - board
  - strategy
category: "Games"
---
<div class="tui">
  <h1>Tic Tac Toe</h1>
  <p class="sub">Classic strategy game. You are X, the computer is O.</p>
  <div class="row" style="justify-content:center;margin-bottom:1rem">
    <div id="status" class="big">Your turn</div>
  </div>
  <div class="row" style="justify-content:center">
    <div id="board" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;width:240px;margin:0 auto">
      <button class="cell" data-i="0"></button>
      <button class="cell" data-i="1"></button>
      <button class="cell" data-i="2"></button>
      <button class="cell" data-i="3"></button>
      <button class="cell" data-i="4"></button>
      <button class="cell" data-i="5"></button>
      <button class="cell" data-i="6"></button>
      <button class="cell" data-i="7"></button>
      <button class="cell" data-i="8"></button>
    </div>
  </div>
  <div class="row" style="justify-content:center;margin-top:1rem">
    <button class="btn btn-secondary" onclick="resetGame()">Reset</button>
  </div>
</div>
<style>
.cell{width:72px;height:72px;background:var(--bg-elev);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:1.75rem;font-weight:700;cursor:pointer;transition:all .2s ease;display:flex;align-items:center;justify-content:center}
.cell:hover{border-color:var(--accent);background:var(--bg-elev2)}
.cell.x{color:var(--accent)}
.cell.o{color:var(--danger)}
</style>
<script>
const WIN=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
let board=Array(9).fill(''),turn='X',over=false;
const cells=document.querySelectorAll('.cell');
const status=document.getElementById('status');
function check(b,p){return WIN.some(c=>c.every(i=>b[i]===p));}
function full(b){return b.every(c=>c);}
function draw(){cells.forEach((c,i)=>{c.textContent=board[i];c.className='cell'+(board[i]?' '+board[i].toLowerCase():'');});}
function aiMove(){let m=null;const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];for(let p of['O','X']){for(let l of lines){let empty=l.filter(i=>board[i]==='');if(empty.length===3&&lines.some(ll=>ll.filter(i=>board[i]===p).length===2)){m=empty[0];break;}if(empty.length===1&&l.filter(i=>board[i]===p).length===2){m=empty[0];break;}}if(m!==null)break;}if(m===null){let empty=board.map((c,i)=>c===''?i:-1).filter(i=>i!==-1);m=empty[Math.floor(Math.random()*empty.length)]||4;}board[m]='O';draw();if(check(board,'O')){status.textContent='Computer wins!';over=true;}else if(full(board)){status.textContent='Draw!';over=true;}else{status.textContent='Your turn';}}
cells.forEach(c=>{c.addEventListener('click',()=>{if(over||turn!=='X'||board[c.dataset.i])return;board[c.dataset.i]='X';draw();if(check(board,'X')){status.textContent='You win!';over=true;return;}else if(full(board)){status.textContent='Draw!';over=true;return;}turn='O';setTimeout(aiMove,300);});});
function resetGame(){board=Array(9).fill('');turn='X';over=false;status.textContent='Your turn';draw();}
draw();
</script>
