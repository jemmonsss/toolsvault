(function(){'use strict';
var root=document.getElementById('fil-calc');if(!root)return;
var ids=['x','y','z','infill','wall','top','waste','diameter','material','density','price','spool','flow'];
var e=function(n){return document.getElementById('fil-'+n)},n=function(id){return Number(e(id).value)};
var last='';function fmt(x,d){return Number.isFinite(x)?x.toLocaleString(undefined,{maximumFractionDigits:d===undefined?2:d}):'—'};
function calculate(){var x=n('x'),y=n('y'),z=n('z'),i=n('infill')/100,w=n('wall'),t=n('top'),extra=n('waste')/100,diam=n('diameter'),density=n('density'),price=n('price'),spool=n('spool'),flow=n('flow');
if(![x,y,z,i,w,t,extra,diam,density,price,spool,flow].every(Number.isFinite)||x<=0||y<=0||z<=0||w<0||t<0||i<0||i>1||extra<0||diam<=0||density<=0||price<0||spool<=0||flow<=0){root.querySelectorAll('.print-stats dd').forEach(function(v){v.textContent='Check inputs'});return;}
// A box-shell proxy: outer box minus its inner void, then infill inside that void.
var innerX=Math.max(0,x-2*w),innerY=Math.max(0,y-2*w),innerZ=Math.max(0,z-2*t);var box=x*y*z,core=innerX*innerY*innerZ;
var plastic=Math.min(box,box-core+core*i)*(1+extra),grams=plastic/1000*density,length=plastic/(Math.PI*Math.pow(diam/2,2))/1000,cost=grams/spool*price,time=plastic/flow;
var results={volume:fmt(plastic/1000)+' cm³',grams:fmt(grams)+' g',meters:fmt(length)+' m',cost:fmt(cost)+' (spool currency)',time:fmt(time/60)+' min',left:fmt(Math.max(0,spool-grams))+' g'};
Object.keys(results).forEach(function(k){e(k).textContent=results[k]});last='3D print estimate\n'+Object.entries(results).map(function(p){return p[0]+': '+p[1]}).join('\n');
}
ids.forEach(function(id){e(id).addEventListener('input',calculate);e(id).addEventListener('change',calculate)});
e('material').addEventListener('change',function(){if(this.value!=='custom')e('density').value=this.value;calculate()});
e('density').addEventListener('input',function(){e('material').value='custom'});
e('copy').addEventListener('click',function(){if(navigator.clipboard&&last)navigator.clipboard.writeText(last).then(function(){e('copy').textContent='Copied!';setTimeout(function(){e('copy').textContent='Copy estimate'},1200)}).catch(function(){e('copy').textContent='Select and copy the results'})});
calculate();
})();
