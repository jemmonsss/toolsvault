---
title: "Contrast Checker"
link: "/tools/contrast-checker/"
description: "Check WCAG color contrast ratios."
tags:
  - contrast
  - wcag
  - color
  - accessibility
  - design
category: "Color & Design"
---
<div class="tui">
  <h1>Contrast Checker</h1>
  <p class="sub">Verify WCAG AA / AAA contrast between two colors.</p>
  <div class="row">
    <div style="flex:1"><label>Foreground</label><input type="color" id="fg" value="#e0e0e0" onchange="run()"></div>
    <div style="flex:1"><label>Background</label><input type="color" id="bg" value="#1e1e1e" onchange="run()"></div>
  </div>
  <div id="preview" style="padding:1.5rem;border-radius:8px;margin:1rem 0;text-align:center;font-size:1.2rem"></div>
  <div id="ratio" class="big"></div>
  <div id="out" class="result" style="margin-top:.5rem"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function lum(hex){hex=hex.replace('#','');if(hex.length===3)hex=hex.split('').map(function(c){return c+c;}).join('');var r=parseInt(hex.slice(0,2),16)/255,g=parseInt(hex.slice(2,4),16)/255,b=parseInt(hex.slice(4,6),16)/255;function f(x){return x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4);}return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b);}
function run(){var fg=byId('fg').value,bg=byId('bg').value;var L1=lum(fg),L2=lum(bg);var hi=Math.max(L1,L2),lo=Math.min(L1,L2);var r=(hi+0.05)/(lo+0.05);byId('preview').style.background=bg;byId('preview').style.color=fg;byId('preview').textContent='The quick brown fox';byId('ratio').textContent='Contrast ratio: '+r.toFixed(2)+':1';
  var a=[];a.push('Normal text (AA ≥ 4.5): '+(r>=4.5?'PASS':'FAIL'));a.push('Normal text (AAA ≥ 7): '+(r>=7?'PASS':'FAIL'));a.push('Large text (AA ≥ 3): '+(r>=3?'PASS':'FAIL'));a.push('Large text (AAA ≥ 4.5): '+(r>=4.5?'PASS':'FAIL'));byId('out').textContent=a.join('\n');
}
run();
</script>
