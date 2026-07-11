---
title: "Color Palette Generator"
link: "/tools/palette-generator/"
description: "Generate harmonious color palettes."
tags:
  - palette
  - color
  - generator
  - design
category: "Color & Design"
---
<div class="tui">
  <h1>Color Palette Generator</h1>
  <p class="sub">Create color palettes you can click to copy.</p>
  <div class="row">
    <div style="flex:1"><label>Base color (optional)</label><input type="color" id="base" value="#8b5cf6"></div>
    <div style="flex:1"><label>Scheme</label><select id="scheme"><option value="random">Random</option><option value="analogous">Analogous</option><option value="complementary">Complementary</option><option value="triadic">Triadic</option></select></div>
    <button class="btn btn-primary" onclick="gen()">Generate</button>
  </div>
  <div id="swatches" style="display:flex;gap:.5rem;margin-top:1rem;flex-wrap:wrap"></div>
  <div class="row"><button class="btn btn-secondary" onclick="copyPalette()">Copy all hex</button></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function hslToHex(h,s,l){s/=100;l/=100;var k=function(n){return (n+h/30)%12;};var a=s*Math.min(l,1-l);var f=function(n){return l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));};var to=function(x){return Math.round(255*x).toString(16).padStart(2,'0');};return '#'+to(f(0))+to(f(8))+to(f(4));}
function gen(){var base=byId('base').value;var h=base?hexHue(base):Math.floor(Math.random()*360);var scheme=byId('scheme').value;var hues=[];if(scheme==='random'){for(var i=0;i<5;i++)hues.push(Math.floor(Math.random()*360));}else if(scheme==='analogous'){for(var i=0;i<5;i++)hues.push((h-40+i*20+360)%360);}else if(scheme==='complementary'){hues=[h,(h+180)%360,(h+30)%360,(h+210)%360,h];}else if(scheme==='triadic'){hues=[h,(h+120)%360,(h+240)%360,(h+60)%360,(h+180)%360];}
  var colors=hues.map(function(hh){return hslToHex(hh,65,Math.floor(Math.random()*30)+40);});
  var box=byId('swatches');box.innerHTML=colors.map(function(c){return '<div style="flex:1;min-width:90px"><div class="swatch" style="background:'+c+';cursor:pointer" onclick="copyText(\''+c+'\')"></div><div style="text-align:center;font-size:.8rem;margin-top:.25rem">'+c+'</div></div>';}).join('');
  box._colors=colors;
}
function hexHue(hex){hex=hex.replace('#','');var r=parseInt(hex.slice(0,2),16)/255,g=parseInt(hex.slice(2,4),16)/255,b=parseInt(hex.slice(4,6),16)/255;var max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,h;if(d===0)h=0;else if(max===r)h=((g-b)/d)%6;else if(max===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360;return Math.round(h);}
function copyPalette(){if(byId('swatches')._colors)copyText(byId('swatches')._colors.join('\n'));}
gen();
</script>
