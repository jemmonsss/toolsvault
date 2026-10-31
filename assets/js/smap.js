/* ToolsVault Minecraft Java seed explorer. Correct 64-bit Java seeds, coordinate
 * transforms, slime chunks and structure placement attempts (not viability checks).
 * The terrain color layer is deliberately labeled as illustrative, NOT real biomes.
 * Exact biome/structure viability needs a bundled cubiomes/WASM worldgen engine.
 */
(function () {
'use strict';
var $=function(id){return document.getElementById('smap-'+id)};
var canvas=$('canvas'),ctx=canvas.getContext('2d'),overlay=$('overlay-canvas'),ov=overlay.getContext('2d'),wrap=$('canvas-wrap');
var mm=$('minimap-canvas'),mmctx=mm.getContext('2d'),mview=$('minimap-viewport');
var MASK=(1n<<48n)-1n,MULT=25214903917n,ADD=11n;
var state={seed:123456789n,version:'1.21.5',dimension:'overworld',scale:4,x:0,z:0,pin:null,drag:null,structures:[],width:0,height:0,displayW:0,displayH:0,showStructures:true,showGrid:false,showSlime:false};
var types={
  village:['#f97373',34,8,10387312,'overworld'],
  desert_pyramid:['#f2c66d',32,8,14357617,'overworld'],
  jungle_temple:['#3ecf8e',32,8,14357619,'overworld'],
  swamp_hut:['#98af6b',32,8,14357620,'overworld'],
  igloo:['#dbeafe',32,8,14357618,'overworld'],
  pillager_outpost:['#e39a65',32,8,165745296,'overworld'],
  ancient_city:['#2dd4bf',24,8,20083232,'overworld'],
  trail_ruins:['#eab308',34,8,83469867,'overworld'],
  trial_chambers:['#a78bfa',34,12,94251327,'overworld'],
  ocean_monument:['#60a5fa',32,5,10387313,'overworld','tri'],
  woodland_mansion:['#d8b4fe',80,20,10387319,'overworld','tri'],
  shipwreck:['#c084fc',24,4,165745295,'overworld'],
  ruined_portal:['#ef4444',40,15,34222645,'overworld'],
  nether_complex:['#f97316',27,4,30084232,'nether'],
  end_city:['#fbbf24',20,11,10387313,'end']
};
function seedFromInput(text){text=String(text).trim();if(!text)throw Error('Enter a seed.');if(/^[+-]?\d+$/.test(text)){var n=BigInt(text);if(n<-(1n<<63n)||n>(1n<<63n)-1n)throw Error('Java numeric seeds must fit a signed 64-bit integer.');return n}var hash=0;for(var c of text){ // Java String.hashCode hashes UTF-16 code units.
  for(var k=0;k<c.length;k++)hash=(Math.imul(31,hash)+c.charCodeAt(k))|0;
}return BigInt(hash)}
function rand(seed){var s=(seed^MULT)&MASK;return function(bound){function next(bits){s=(s*MULT+ADD)&MASK;return Number(s>>BigInt(48-bits))}if(!bound)return next(31);if((bound&(bound-1))===0)return Math.floor(bound*next(31)/2147483648);var b,v;do{b=next(31);v=b%bound}while(b-v+(bound-1)>2147483647);return v}}
function isSlime(cx,cz){ // Mirrors Java overflow/casts and java.util.Random#nextInt(10).
  var xi=cx|0,zi=cz|0;
  var a=BigInt(Math.imul(Math.imul(xi,xi),4987142));
  var b=BigInt(Math.imul(xi,5947611));
  var c=BigInt(Math.imul(zi,zi))*4392871n;
  var d=BigInt(Math.imul(zi,389711));
  return rand((state.seed+a+b+c+d)^987234911n)(10)===0;
}
function floorDiv(a,b){return Math.floor(a/b)}
function toScreen(x,z){return{x:(x-state.x)/state.scale+state.width/2,y:(z-state.z)/state.scale+state.height/2}}
function toWorld(px,py){return{x:Math.floor(state.x+(px-state.width/2)*state.scale),z:Math.floor(state.z+(py-state.height/2)*state.scale)}}
function colorHash(x,y,seed){var h=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+seed)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296}
function noise(x,z,seed){var ix=Math.floor(x),iz=Math.floor(z),a=x-ix,b=z-iz,u=a*a*(3-2*a),v=b*b*(3-2*b);var c00=colorHash(ix,iz,seed),c10=colorHash(ix+1,iz,seed),c01=colorHash(ix,iz+1,seed),c11=colorHash(ix+1,iz+1,seed);return(c00+(c10-c00)*u)*(1-v)+(c01+(c11-c01)*u)*v}
function displayColor(wx,wz,low){var a=noise(wx/740,wz/740,low),b=noise(wx/230+70,wz/230,low),c=noise(wx/1500+120,wz/1500-15,low);if(state.dimension==='nether')return a<.28?[77,35,40]:b>.63?[39,107,100]:a>.65?[62,64,73]:[126,62,45];if(state.dimension==='end')return c>.51?[209,207,157]:[28,34,45];if(a<.32)return b<.5?[48,97,153]:[65,118,167];if(a<.37)return[209,191,122];if(c>.73)return[198,213,220];if(b>.62)return[64,107,72];if(a>.76)return[184,157,102];return[109,149,90]}
function drawBackdrop(){var width=Math.ceil(state.width/3),height=Math.ceil(state.height/3);var work=document.createElement('canvas');work.width=width;work.height=height;var wx=work.getContext('2d');var data=wx.createImageData(width,height),seed=Number(BigInt.asUintN(32,state.seed));for(var y=0;y<height;y++)for(var x=0;x<width;x++){var w=toWorld((x+.5)*3,(y+.5)*3),col=displayColor(w.x,w.z,seed),index=(y*width+x)*4;data.data[index]=col[0];data.data[index+1]=col[1];data.data[index+2]=col[2];data.data[index+3]=255}wx.putImageData(data,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(work,0,0,state.width,state.height)}
function structureCandidates(){if(!state.showStructures)return[];var left=state.x-state.width*state.scale/2,top=state.z-state.height*state.scale/2,right=state.x+state.width*state.scale/2,bottom=state.z+state.height*state.scale/2,found=[];
  Object.keys(types).forEach(function(type){var t=types[type];if(t[4]!==state.dimension)return;
    var version=parseFloat(state.version);if(type==='trial_chambers'&&version<1.21)return;if(type==='ancient_city'&&version<1.19)return;if(type==='trail_ruins'&&version<1.20)return;
    var spacing=t[1],sep=t[2],spread=t[5],small=Math.max(1,spacing-sep);if(type==='village'&&version<1.18){spacing=32;small=24}
    var rx0=floorDiv(Math.floor(left/16),spacing)-1,rx1=floorDiv(Math.floor(right/16),spacing)+1,rz0=floorDiv(Math.floor(top/16),spacing)-1,rz1=floorDiv(Math.floor(bottom/16),spacing)+1;
    for(var rz=rz0;rz<=rz1;rz++)for(var rx=rx0;rx<=rx1;rx++){
      var rng=rand(state.seed+BigInt(rx)*341873128712n+BigInt(rz)*132897987541n+BigInt(t[3]));var dx=spread?(rng(small)+rng(small))/2|0:rng(small),dz=spread?(rng(small)+rng(small))/2|0:rng(small);
      var bx=(rx*spacing+dx)*16+8,bz=(rz*spacing+dz)*16+8;if(bx>=left-16&&bx<=right+16&&bz>=top-16&&bz<=bottom+16)found.push({x:bx,z:bz,type:type,color:t[0]});
    }
  });return found;
}
function overlayRender(){ov.clearRect(0,0,state.width,state.height);var left=state.x-state.width*state.scale/2,top=state.z-state.height*state.scale/2,right=left+state.width*state.scale,bottom=top+state.height*state.scale;
if(state.showGrid&&state.scale<=16){ov.strokeStyle='rgba(255,255,255,.23)';ov.lineWidth=1;ov.beginPath();var step=state.scale<=8?16:64;for(var x=Math.ceil(left/step)*step;x<=right;x+=step){var sx=Math.round(toScreen(x,0).x)+.5;ov.moveTo(sx,0);ov.lineTo(sx,state.height)}for(var z=Math.ceil(top/step)*step;z<=bottom;z+=step){var sy=Math.round(toScreen(0,z).y)+.5;ov.moveTo(0,sy);ov.lineTo(state.width,sy)}ov.stroke()}
if(state.showSlime&&state.dimension==='overworld'&&state.scale<=8){var x0=floorDiv(left,16),x1=floorDiv(right,16),z0=floorDiv(top,16),z1=floorDiv(bottom,16);ov.fillStyle='rgba(26,251,124,.43)';for(var cz=z0;cz<=z1;cz++)for(var cx=x0;cx<=x1;cx++)if(isSlime(cx,cz)){var p=toScreen(cx*16,cz*16);ov.fillRect(p.x,p.y,Math.max(1,16/state.scale),Math.max(1,16/state.scale))}}
if(state.showStructures){state.structures.forEach(function(s){var p=toScreen(s.x,s.z);ov.beginPath();ov.fillStyle=s.color;ov.strokeStyle='#0f172a';ov.lineWidth=2;ov.arc(p.x,p.y,Math.max(4,7-state.scale/10),0,Math.PI*2);ov.fill();ov.stroke()})}
if(state.pin){var pin=toScreen(state.pin.x,state.pin.z);ov.strokeStyle='#fffa8d';ov.lineWidth=2;ov.beginPath();ov.moveTo(pin.x-12,pin.y);ov.lineTo(pin.x+12,pin.y);ov.moveTo(pin.x,pin.y-12);ov.lineTo(pin.x,pin.y+12);ov.stroke()}}
function legend(){var items=$('legend-items'),structures=$('struct-legend');items.replaceChildren();structures.replaceChildren();var palette={overworld:[['Water','#306199'],['Lowlands','#6d955a'],['Wooded','#406b48'],['Dry','#b89d66']],nether:[['Basalt-like','#3e4049'],['Wastes-like','#7e3e2d'],['Forest-like','#276b64']],end:[['End-like','#d1cf9d'],['Void','#1c222d']]};palette[state.dimension].forEach(function(it){var n=document.createElement('span');n.className='smap-legend-item';var chip=document.createElement('span');chip.className='smap-swatch';chip.style.background=it[1];n.appendChild(chip);n.append(document.createTextNode(it[0]));items.appendChild(n)});
var seen=new Set();state.structures.forEach(function(s){if(seen.has(s.type))return;seen.add(s.type);var n=document.createElement('span');n.className='smap-legend-item';var chip=document.createElement('span');chip.className='smap-swatch';chip.style.background=s.color;n.appendChild(chip);n.append(document.createTextNode(s.type.replace(/_/g,' ')));structures.appendChild(n)});if(!seen.size)structures.textContent='No candidates in view.'}
function minimap(){var w=160,h=160;mm.width=w;mm.height=h;var seed=Number(BigInt.asUintN(32,state.seed)),data=mmctx.createImageData(w,h),worldW=state.width*state.scale*3,worldH=state.height*state.scale*3;for(var y=0;y<h;y++)for(var x=0;x<w;x++){var wx=state.x+(x/w-.5)*worldW,wz=state.z+(y/h-.5)*worldH,col=displayColor(wx,wz,seed),i=(y*w+x)*4;data.data[i]=col[0];data.data[i+1]=col[1];data.data[i+2]=col[2];data.data[i+3]=255}mmctx.putImageData(data,0,0);mview.style.width='33.33%';mview.style.height='33.33%';mview.style.transform='translate(100%,100%)'}
function status(s,error){var n=$('status');n.hidden=false;n.className='smap-status '+(error?'err':'ok');n.textContent=s}
var frame=0;function requestRender(){if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(function(){frame=0;render()})}
function render(){var r=wrap.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);state.width=Math.max(1,Math.round(r.width));state.height=Math.max(1,Math.round(r.height));for(var layer of [canvas,overlay]){layer.width=Math.round(state.width*dpr);layer.height=Math.round(state.height*dpr);layer.style.width=state.width+'px';layer.style.height=state.height+'px'}ctx.setTransform(dpr,0,0,dpr,0,0);ov.setTransform(dpr,0,0,dpr,0,0);drawBackdrop();state.structures=structureCandidates();overlayRender();legend();minimap();$('coords').textContent='X: '+Math.round(state.x)+'  Z: '+Math.round(state.z)+' · '+state.scale+' blocks/px';}
function configure(){try{state.seed=seedFromInput($('seed').value)}catch(e){status(e.message,true);return false}state.version=$('version').value;state.dimension=$('dimension').value;state.scale=Number($('scale').value);state.pin=null;requestRender();status('Java seed '+String(state.seed)+'. Slime chunks exact; structure markers are unverified attempts, backdrop illustrative.');return true}
function nearest(x,z){var best=null,dist=Infinity;state.structures.forEach(function(s){var d=Math.hypot(s.x-x,s.z-z);if(d<dist){best=s;dist=d}});return best&&dist<=Math.max(40,state.scale*13)?{structure:best,distance:Math.round(dist)}:null}
function info(p,click){var w=toWorld(p.x,p.y),text='X '+w.x+' · Z '+w.z+' · chunk '+Math.floor(w.x/16)+','+Math.floor(w.z/16);if(state.dimension==='overworld')text+=' · '+(isSlime(Math.floor(w.x/16),Math.floor(w.z/16))?'slime chunk':'not slime');var near=nearest(w.x,w.z);if(near)text+=' · '+near.structure.type.replace(/_/g,' ')+' candidate ('+near.distance+' blocks)';if(click){state.pin={x:w.x,z:w.z};text='Pinned '+text;overlayRender()}$('info').textContent=text;$('coords').textContent='X: '+w.x+' Z: '+w.z;}
function local(e){var r=wrap.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
wrap.addEventListener('pointerdown',function(e){if(e.button!==0||e.target.closest('button'))return;var p=local(e);state.drag={id:e.pointerId,x:p.x,y:p.y,cx:state.x,cz:state.z,moved:false};wrap.setPointerCapture(e.pointerId)});
wrap.addEventListener('pointermove',function(e){var p=local(e);if(!state.drag){info(p,false);return}var d=state.drag;if(d.id!==e.pointerId)return;var dx=p.x-d.x,dz=p.y-d.y;if(Math.abs(dx)+Math.abs(dz)>4)d.moved=true;if(d.moved){state.x=d.cx-dx*state.scale;state.z=d.cz-dz*state.scale;requestRender()} });
wrap.addEventListener('pointerup',function(e){var d=state.drag;if(!d||d.id!==e.pointerId)return;state.drag=null;try{wrap.releasePointerCapture(e.pointerId)}catch(_e){}if(!d.moved)info(local(e),true)});
wrap.addEventListener('pointercancel',function(){state.drag=null});
function setScale(next,point){next=Math.max(1,Math.min(32,next));if(next===state.scale)return;var p=point||{x:state.width/2,y:state.height/2},wx=state.x+(p.x-state.width/2)*state.scale,wz=state.z+(p.y-state.height/2)*state.scale;state.scale=next;state.x=wx-(p.x-state.width/2)*next;state.z=wz-(p.y-state.height/2)*next;$('scale').value=String(next);requestRender()}
wrap.addEventListener('wheel',function(e){if(e.target.closest('button'))return;e.preventDefault();var scales=[1,2,4,8,16,32],idx=scales.indexOf(state.scale);setScale(scales[Math.max(0,Math.min(scales.length-1,idx+(e.deltaY>0?1:-1)))],local(e))},{passive:false});
$('zoom-in').onclick=function(){setScale(state.scale/2)};$('zoom-out').onclick=function(){setScale(state.scale*2)};
$('reset').onclick=function(){state.x=0;state.z=0;setScale(4);requestRender()};
$('generate').onclick=configure;
$('random').onclick=function(){var b=new Uint32Array(2);crypto.getRandomValues(b);var n=BigInt.asIntN(64,(BigInt(b[0])<<32n)|BigInt(b[1]));$('seed').value=String(n);configure()};
$('download').onclick=function(){var tmp=document.createElement('canvas');tmp.width=canvas.width;tmp.height=canvas.height;var tc=tmp.getContext('2d');tc.drawImage(canvas,0,0);tc.drawImage(overlay,0,0);var a=document.createElement('a');a.download='toolsvault-seed-'+String(state.seed)+'-'+state.dimension+'.png';a.href=tmp.toDataURL('image/png');a.click()};
$('jump').onclick=function(){var x=Number($('jump-x').value),z=Number($('jump-z').value);if(!Number.isFinite(x)||!Number.isFinite(z)||Math.abs(x)>3e7||Math.abs(z)>3e7){status('Coordinates must be finite and within ±30,000,000.',true);return}state.x=Math.trunc(x);state.z=Math.trunc(z);requestRender()};
$('share').onclick=function(){var hash='#seed='+encodeURIComponent($('seed').value)+'&x='+Math.round(state.x)+'&z='+Math.round(state.z)+'&scale='+state.scale+'&dimension='+state.dimension+'&version='+state.version;history.replaceState(null,'',location.pathname+hash);var link=location.href;if(navigator.clipboard){navigator.clipboard.writeText(link).then(function(){status('Shareable map link copied!')}).catch(function(){status('Link in address bar ready to copy')})}else status('Link in address bar ready to copy')};
$('scale').onchange=function(){setScale(Number(this.value))};$('dimension').onchange=configure;$('version').onchange=configure;
[['structures','showStructures'],['grid','showGrid'],['slime','showSlime']].forEach(function(p){$(p[0]).onchange=function(){state[p[1]]=this.checked;requestRender()}});
$('seed').onkeydown=function(e){if(e.key==='Enter')configure()};['jump-x','jump-z'].forEach(function(k){$(k).onkeydown=function(e){if(e.key==='Enter')$('jump').click()}});
window.addEventListener('resize',requestRender);
try{var params=new URLSearchParams(location.hash.replace(/^#/,''));if(params.has('seed'))$('seed').value=params.get('seed');if(params.has('version')&&Array.from($('version').options).some(function(o){return o.value===params.get('version')}))$('version').value=params.get('version');if(['overworld','nether','end'].includes(params.get('dimension')))$('dimension').value=params.get('dimension');if([1,2,4,8,16,32].includes(Number(params.get('scale'))))$('scale').value=params.get('scale');if(params.has('x')&&Number.isFinite(Number(params.get('x'))))state.x=Number(params.get('x'));if(params.has('z')&&Number.isFinite(Number(params.get('z'))))state.z=Number(params.get('z'));}catch(e){}
configure();
})();
