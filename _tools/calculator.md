---
title: "Scientific Calculator"
link: "/tools/calculator/"
description: "A scientific calculator in your browser."
tags:
  - calculator
  - math
category: "Math & Data"
---
<div class="tui">
  <h1>Scientific Calculator</h1>
  <p class="sub">Supports + - * / % ^, parentheses, and functions (sqrt, sin, cos, tan, log, ln, abs, exp).</p>
  <input type="text" id="disp" value="" placeholder="e.g. sqrt(16)+2^3" style="font-family:'Courier New',monospace;font-size:1.1rem;margin-bottom:.5rem">
  <div class="row"><button class="btn btn-secondary" onclick="calc()">=</button><button class="btn btn-secondary" onclick="byId('disp').value=''">C</button></div>
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:.4rem;margin-top:.5rem">
    <button class="btn btn-secondary" onclick="ins('(')">(</button><button class="btn btn-secondary" onclick="ins(')')">)</button><button class="btn btn-secondary" onclick="ins('^')">^</button><button class="btn btn-secondary" onclick="ins('%')">%</button><button class="btn btn-secondary" onclick="ins('/')">/</button>
    <button class="btn btn-secondary" onclick="ins('7')">7</button><button class="btn btn-secondary" onclick="ins('8')">8</button><button class="btn btn-secondary" onclick="ins('9')">9</button><button class="btn btn-secondary" onclick="ins('*')">*</button><button class="btn btn-secondary" onclick="ins('sqrt(')">√</button>
    <button class="btn btn-secondary" onclick="ins('4')">4</button><button class="btn btn-secondary" onclick="ins('5')">5</button><button class="btn btn-secondary" onclick="ins('6')">6</button><button class="btn btn-secondary" onclick="ins('-')">-</button><button class="btn btn-secondary" onclick="ins('sin(')">sin</button>
    <button class="btn btn-secondary" onclick="ins('1')">1</button><button class="btn btn-secondary" onclick="ins('2')">2</button><button class="btn btn-secondary" onclick="ins('3')">3</button><button class="btn btn-secondary" onclick="ins('+')">+</button><button class="btn btn-secondary" onclick="ins('cos(')">cos</button>
    <button class="btn btn-secondary" onclick="ins('0')">0</button><button class="btn btn-secondary" onclick="ins('.')">.</button><button class="btn btn-secondary" onclick="ins('pi')">π</button><button class="btn btn-secondary" onclick="ins('e')">e</button><button class="btn btn-secondary" onclick="ins('ln(')">ln</button>
  </div>
  <div id="out" class="result" style="margin-top:.5rem"></div>
  <div id="msg" class="msg"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function ins(s){byId('disp').value+=s;}
function tokenize(s){var t=[],i=0;while(i<s.length){var c=s[i];if(/[0-9.]/.test(c)){var n='';while(i<s.length&&/[0-9.]/.test(s[i]))n+=s[i++];t.push({t:'num',v:parseFloat(n)});continue;}if(/[a-z]/.test(c)){var w='';while(i<s.length&&/[a-z]/.test(s[i]))w+=s[i++];if(w==='pi'){t.push({t:'num',v:Math.PI});}else if(w==='e'){t.push({t:'num',v:Math.E});}else t.push({t:'fn',v:w});continue;}if('+-*/%^()'.indexOf(c)>=0){t.push({t:'op',v:c});i++;continue;}throw new Error('Bad character: '+c);}return t;}
function toPostfix(ts){var out=[],st=[];var prec={'+':1,'-':1,'*':2,'/':2,'%':2,'^':3,'u':4};var operand=true;ts.forEach(function(tk){if(tk.t==='num'){out.push(tk);operand=false;}else if(tk.t==='fn'){st.push(tk);}else if(tk.v==='('){st.push(tk);operand=true;}else if(tk.v===')'){while(st.length&&st[st.length-1].v!=='(')out.push(st.pop());st.pop();if(st.length&&st[st.length-1].t==='fn')out.push(st.pop());operand=false;}else{if(tk.v==='-'&&operand){out.push({t:'num',v:0});tk={t:'op',v:'u'};}else if(tk.v==='+'&&operand){operand=true;return;}while(st.length&&st[st.length-1].v!=='('){var top=st[st.length-1];var tp=prec[top.v]||0;if(tp>prec[tk.v]||(tp===prec[tk.v]&&tk.v!=='^'))out.push(st.pop());else break;}st.push(tk);operand=false;}});while(st.length)out.push(st.pop());return out;}
function evalPostfix(pf){var st=[];pf.forEach(function(t){if(t.t==='num')st.push(t.v);else if(t.v==='u')st.push(-st.pop());else if(t.t==='fn'){var a=st.pop();st.push(Math[t.v]?Math[t.v](a):NaN);}else{var b=st.pop(),a=st.pop();st.push(t.v==='+'?a+b:t.v==='-'?a-b:t.v==='*'?a*b:t.v==='/'?a/b:t.v==='%'?(a%b):Math.pow(a,b));}});return st[0];}
function calc(){try{var r=evalPostfix(toPostfix(tokenize(byId('disp').value)));if(!isFinite(r)||isNaN(r))throw new Error('Invalid expression');byId('out').textContent='= '+r;showMsg('msg','','');}catch(e){err('msg',e.message);}}
</script>
