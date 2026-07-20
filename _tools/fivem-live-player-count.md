---
title: "FiveM Live Player Count"
link: "/tools/fivem-live-player-count/"
description: "Track a FiveM server's live player count over time with a live-updating chart."
tags:
  - fivem
  - gta
  - players
  - chart
  - monitor
category: "FiveM"
games_only: true
featured: false
icon: "📈"
---
<div class="tui">
  <h1>FiveM Live Player Count</h1>
  <p class="sub">Monitor a server's player count in real time (updates every 10s).</p>
  <div class="row">
    <div style="flex:1"><label>Server Endpoint / CFX Code</label><input type="text" id="endpoint" placeholder="e.g. 1.2.3.4:30120 or ab12cd"></div>
  </div>
  <div class="row">
    <button class="btn btn-primary" onclick="startMonitor()">Start</button>
    <button class="btn" onclick="stopMonitor()">Stop</button>
  </div>
  <div id="status" style="margin-top:.75rem;color:var(--text-dim)"></div>
  <div id="current" style="margin-top:.5rem;font-size:1.4rem;font-weight:600"></div>
  <canvas id="chart" width="600" height="200" style="width:100%;max-width:600px;margin-top:1rem;border:1px solid var(--border);border-radius:8px;background:var(--bg-elev2)"></canvas>
  <div id="result" class="result" style="margin-top:1rem"></div>
</div>
<script>
var timer=null, data=[], maxSeen=1;
function resolveEndpoint(input){
  input=input.trim();
  if(!input)return null;
  var m=input.match(/cfx\.re\/join\/([a-z0-9]+)/i);
  if(m)return {host:m[1]+'.users.cfx.re',path:''};
  if(/^[a-z0-9]{6}$/i.test(input))return {host:input+'.users.cfx.re',path:''};
  if(/^https?:\/\//i.test(input)){var u=new URL(input);return {host:u.host,path:u.pathname.replace(/\/$/,'')};}
  var host=input.replace(/^https?:\/\//i,'').replace(/\/.*$/,'');
  return {host:host,path:''};
}
function esc(s){s=String(s==null?'':s);return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
async function jget(base,file){
  var r=await fetch(base+'/'+file,{mode:'cors',cache:'no-store'});
  if(!r.ok)throw new Error('HTTP '+r.status);
  return r.json();
}
function draw(){
  var c=document.getElementById('chart'),ctx=c.getContext('2d');
  ctx.clearRect(0,0,c.width,c.height);
  ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue('--border')||'#333';
  ctx.strokeRect(0,0,c.width,c.height);
  if(data.length<1)return;
  var max=Math.max(maxSeen,1);
  ctx.strokeStyle='#22c55e';ctx.lineWidth=2;ctx.beginPath();
  data.forEach(function(v,i){
    var x=(i/(Math.max(data.length-1,1)))*(c.width-10)+5;
    var y=c.height-5-(v/max)*(c.height-20);
    if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  });
  ctx.stroke();
  ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--text-dim')||'#999';
  ctx.font='11px sans-serif';
  ctx.fillText('max '+max,6,12);
}
async function poll(){
  var input=document.getElementById('endpoint').value.trim();
  var ep=resolveEndpoint(input);
  if(!ep)return;
  var base='https://'+(ep.host||ep)+(ep.path||'');
  try{
    var info=await jget(base,'info.json').catch(function(){return null;});
    var players=await jget(base,'players.json').catch(function(){return [];});
    var count=(info&&typeof info.clients==='number')?info.clients:(Array.isArray(players)?players.length:0);
    if(typeof count!=='number')count=0;
    data.push(count);
    if(data.length>60)data.shift();
    maxSeen=Math.max.apply(null,data.concat([1]));
    document.getElementById('current').textContent=count+' players online';
    document.getElementById('status').textContent='Last update: '+new Date().toLocaleTimeString();
    draw();
  }catch(e){
    document.getElementById('status').textContent='Error reaching server: '+e.message;
  }
}
function startMonitor(){
  if(timer)clearInterval(timer);
  data=[];maxSeen=1;
  poll();timer=setInterval(poll,10000);
}
function stopMonitor(){if(timer){clearInterval(timer);timer=null;document.getElementById('status').textContent='Stopped.';}}
draw();
</script>
