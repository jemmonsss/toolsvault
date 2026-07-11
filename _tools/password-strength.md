---
title: "Password Strength Checker"
link: "/tools/password-strength/"
description: "Check the strength and entropy of a password."
tags:
  - password
  - strength
  - security
category: "Security"
---
<div class="tui">
  <h1>Password Strength Checker</h1>
  <p class="sub">Estimate password strength and entropy. Nothing leaves your browser.</p>
  <input type="text" id="pw" placeholder="Type a password..." oninput="run()" style="max-width:420px">
  <div class="strength-meter" style="height:10px;background:#2d2d2d;border-radius:5px;overflow:hidden;margin:1rem 0;max-width:420px"><div id="bar" style="height:100%;width:0%;transition:.2s"></div></div>
  <div id="label" class="big" style="font-size:1.1rem"></div>
  <div id="entropy" class="hint"></div>
  <div style="margin-top:1rem">
    <div class="kv"><span>12+ characters</span><span id="c1">✗</span></div>
    <div class="kv"><span>Lowercase & uppercase</span><span id="c2">✗</span></div>
    <div class="kv"><span>Numbers</span><span id="c3">✗</span></div>
    <div class="kv"><span>Symbols</span><span id="c4">✗</span></div>
  </div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function set(id,ok){byId(id).textContent=ok?'✓':'✗';byId(id).style.color=ok?'#22c55e':'#ef4444';}
function run(){var p=byId('pw').value;var len=p.length;var low=/[a-z]/.test(p),up=/[A-Z]/.test(p),num=/\d/.test(p),sym=/[^A-Za-z0-9]/.test(p);
  set('c1',len>=12);set('c2',low&&up);set('c3',num);set('c4',sym);
  var pool=0;if(low)pool+=26;if(up)pool+=26;if(num)pool+=10;if(sym)pool+=20;
  var ent=len*Math.log2(pool||1);
  var lvl,pct,col;if(len===0){lvl='';pct=0;col='#2d2d2d';}else if(ent<40){lvl='Weak';pct=25;col='#ef4444';}else if(ent<60){lvl='Fair';pct=50;col='#f59e0b';}else if(ent<80){lvl='Good';pct=75;col='#eab308';}else{lvl='Strong';pct=100;col='#22c55e';}
  byId('bar').style.width=pct+'%';byId('bar').style.background=col;byId('label').textContent=lvl;byId('label').style.color=col;byId('entropy').textContent=len?('~'+Math.round(ent)+' bits of entropy'):'';
}
</script>
