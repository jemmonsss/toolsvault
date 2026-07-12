---
title: "Rock Paper Scissors"
link: "/tools/rock-paper-scissors/"
description: "Play Rock Paper Scissors against the computer."
tags:
  - rock-paper-scissors
  - chance
  - casual
category: "Games"
---
<div class="tui">
  <h1>Rock Paper Scissors</h1>
  <p class="sub">Classic hand game. Choose your move!</p>
  <div class="row" style="justify-content:center;margin-bottom:1rem">
    <div class="big">Choose:</div>
  </div>
  <div class="row" style="justify-content:center;gap:1rem;margin-bottom:1.5rem">
    <button class="btn btn-primary" onclick="play('rock')">&#9994; Rock</button>
    <button class="btn btn-primary" onclick="play('paper')">&#9995; Paper</button>
    <button class="btn btn-primary" onclick="play('scissors')">&#9996; Scissors</button>
  </div>
  <div class="row" style="justify-content:center">
    <div id="result" class="result" style="text-align:center;min-height:3rem;font-size:1.1rem"></div>
  </div>
  <div class="row" style="justify-content:center;margin-top:1rem">
    <div style="display:flex;gap:2rem;color:var(--text-dim);font-size:.9rem">
      <span>You: <strong id="p-score" style="color:var(--text)">0</strong></span>
      <span>CPU: <strong id="c-score" style="color:var(--text)">0</strong></span>
    </div>
  </div>
</div>
<script>
let ps=0,cs=0;
const MOVES={rock:'scissors',paper:'rock',scissors:'paper'};
const NAMES={rock:'Rock',paper:'Paper',scissors:'Scissors'};
const EMOJI={rock:'&#9994;',paper:'&#9995;',scissors:'&#9996;'};
function play(p){const c=['rock','paper','scissors'][Math.floor(Math.random()*3)];const res=p===c?'draw':MOVES[p]===c?'win':'lose';if(res==='win')ps++;if(res==='lose')cs++;document.getElementById('p-score').textContent=ps;document.getElementById('c-score').textContent=cs;const out=document.getElementById('result');if(res==='draw'){out.innerHTML='Draw! Both chose '+NAMES[p]+' '+EMOJI[p];out.style.color='var(--text-dim)';}else if(res==='win'){out.innerHTML='You win! '+NAMES[p]+' beats '+NAMES[c]+' '+EMOJI[p]+' vs '+EMOJI[c];out.style.color='#22c55e';}else{out.innerHTML='CPU wins! '+NAMES[c]+' beats '+NAMES[p]+' '+EMOJI[c]+' vs '+EMOJI[p];out.style.color='var(--danger)';}}
</script>
