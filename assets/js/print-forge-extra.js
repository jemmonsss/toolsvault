/* ToolsVault advanced free print generators. All geometry is produced locally. */
(function(root){'use strict';var F=root.ToolsVaultForge;if(!F)return;
var PI=Math.PI,TWO=2*PI;
function num(v,min,max,name){v=Number(v);if(!Number.isFinite(v)||v<min||v>max)throw Error(name+' must be '+min+'–'+max);return v}
function Mesh(){this.v=[];this.limit=3600000}
Mesh.prototype.tri=function(a,b,c){if(this.v.length+9>this.limit)throw Error('Design too detailed; reduce dimensions or image resolution.');this.v.push(...a,...b,...c)};
Mesh.prototype.quad=function(a,b,c,d){this.tri(a,b,c);this.tri(a,c,d)};
Mesh.prototype.done=function(){return new Float32Array(this.v)};
function ring(r,z,angles){return angles.map(function(a){var rr=typeof r==='function'?r(a):r;return[rr*Math.cos(a),rr*Math.sin(a),z]})}
function annularPart(angles,outerProfiles,bore){var m=new Mesh(),n=angles.length,innerBottom=ring(bore,outerProfiles[0].z,angles),innerTop=ring(bore,outerProfiles[outerProfiles.length-1].z,angles),outerBottom=null,outerTop=null;
for(var k=0;k<outerProfiles.length;k++){var p=outerProfiles[k],curr=ring(p.r,p.z,angles);if(k===0)outerBottom=curr;else for(var i=0;i<n;i++){var j=(i+1)%n,a=outerTop[i],b=outerTop[j],c=curr[j],d=curr[i];if((a[0]!==d[0]||a[1]!==d[1]||a[2]!==d[2])||(b[0]!==c[0]||b[1]!==c[1]||b[2]!==c[2]))m.quad(a,b,c,d)}outerTop=curr}
for(i=0;i<n;i++){j=(i+1)%n;m.quad(innerBottom[i],innerBottom[j],outerBottom[j],outerBottom[i]);m.quad(outerTop[i],outerTop[j],innerTop[j],innerTop[i]);m.quad(innerTop[i],innerTop[j],innerBottom[j],innerBottom[i])}return m.done()}
function gear(p){var mode=p.mode||'gear',teeth=num(p.teeth,12,100,'Tooth count')|0,thick=num(p.thickness,3,24,'Thickness'),bore=num(p.bore,2,40,'Bore'),n=teeth*22,angles=[];for(var i=0;i<n;i++)angles.push(i*TWO/n);
if(mode==='pulley'){
 var pitch=num(p.pitch,2,8,'Belt pitch'),r=teeth*pitch/TWO,root=r-.42*pitch,tip=r+.10*pitch,flange=!!p.flange,flangeR=tip+1.7;
 if(bore/2>=root-1.8)throw Error('Bore too large for this pulley. Increase tooth count or reduce bore.');
 var profile=function(a){var t=Math.abs((a*teeth/TWO+0.5)%1-0.5)*2,blend=t<.35?1:t>.78?0:(.78-t)/.43;return root+(tip-root)*(.5-.5*Math.cos(blend*PI))};
 var op=flange?[{z:0,r:flangeR},{z:1.2,r:flangeR},{z:1.2,r:profile},{z:thick-1.2,r:profile},{z:thick-1.2,r:flangeR},{z:thick,r:flangeR}]:[{z:0,r:profile},{z:thick,r:profile}];
 if(flange&&thick<=3)throw Error('Pulley width must exceed the flange thickness.');return annularPart(angles,op,bore/2)
}
var module=num(p.module,.8,5,'Module'),rp=teeth*module/2,rootR=rp-1.25*module,tipR=rp+module,baseR=rp*Math.cos(20*PI/180);if(bore/2>=rootR-1.5)throw Error('Bore too large for this gear.');
function inv(radius){if(radius<=baseR)return 0;var t=Math.sqrt((radius/baseR)**2-1);return t-Math.atan(t)}var pitchInv=inv(rp),width=function(radius){return PI/(2*teeth)+pitchInv-inv(radius)},topWidth=width(tipR),botWidth=width(rootR);
if(topWidth<.002)throw Error('Tooth tip too narrow; increase tooth count.');
var profile=function(a){var t=Math.abs((a*teeth/TWO+.5)%1-.5)*TWO/teeth;if(t<=topWidth)return tipR;if(t>=botWidth)return rootR;var lo=rootR,hi=tipR;for(var j=0;j<15;j++){var mid=(lo+hi)/2;if(width(mid)>t)lo=mid;else hi=mid}return(lo+hi)/2};
return annularPart(angles,[{z:0,r:profile},{z:thick,r:profile}],bore/2)}
function lightbox(p){var w=num(p.width,55,230,'Width'),h=num(p.height,40,180,'Height'),deep=num(p.depth,12,35,'Case depth'),wall=num(p.wall,2.4,5,'Wall'),nx=p.nx|0,ny=p.ny|0;if(nx<16||ny<16||nx*ny>18000||!p.mask||p.mask.length!==nx*ny)throw Error('A valid text or image mask is required.');if(w<6*wall+30||h<6*wall+20)throw Error('Case is too small for these walls.');var part=p.part||'panel',xs=w/nx,ys=h/ny,map=new Uint16Array(nx*ny),dz=.4,idx=(x,y)=>y*nx+x,cl=.5;
for(var y=0;y<ny;y++)for(var x=0;x<nx;x++){
 var xx=(x+.5)*xs,yy=(y+.5)*ys,edge=Math.min(xx,w-xx,yy,h-yy);
 if(part==='housing'){
  var onWall=edge<wall,support=false;for(var a=0;a<2;a++)for(var b=0;b<2;b++){var cx=(a?w-wall-7:wall+7),cy=(b?h-wall-7:wall+7);if(Math.hypot(xx-cx,yy-cy)<4)support=true}
  var cable=Math.hypot(xx-w/2,yy-(wall+8))<3.4;map[idx(x,y)]=Math.round((onWall?deep:support?deep-2.8:cable?0:2.4)/dz);
 }else{
  if(edge<wall+cl)continue;
  map[idx(x,y)]=Math.round((1.6+(p.mask[idx(x,y)]?.8:0))/dz)
 }
}return F.gridSolid(map,nx,ny,xs,ys,dz)}
function mold(p){var w=num(p.width,35,140,'Block width'),d=num(p.depth,35,140,'Block depth'),r=num(p.radius,6,48,'Cavity radius'),block=num(p.block,9,30,'Block thickness'),shape=p.shape||'ball',part=p.part||'a';if(2*r+15>Math.min(w,d))throw Error('Leave at least 7.5 mm of material around the cavity.');if(block<(shape==='ball'?r+3:r*.45+3))throw Error('Increase block thickness: a sphere needs radius + 3 mm of backing.');var n=Math.min(136,Math.ceil(w*1.35)),ny=Math.min(136,Math.ceil(d*1.35)),dx=w/n,dy=d/ny,dz=.4,base=block,depth=shape==='ball'?r:Math.min(block-3,r*.68),map=new Uint16Array(n*ny);for(var y=0;y<ny;y++)for(var x=0;x<n;x++){var xx=(x+.5)*dx,yy=(y+.5)*dy,px=xx-w/2,py=yy-d/2,norm=Math.hypot(px,py)/r,cut=0;
 if(norm<1){if(shape==='ball')cut=depth*Math.sqrt(Math.max(0,1-norm*norm));else if(shape==='disc')cut=depth;else cut=depth*Math.max(0,1-norm*norm)}
 // A symmetric half-round pour channel exits opposite edges and can be cut open after casting.
 if(Math.abs(px)<1.8&&Math.abs(py)>r*.85)cut=Math.max(cut,2.4);
 var z=base-cut;
 for(var a=0;a<2;a++){var sx=a?w*.14:w*.86,sy=a?d*.14:d*.86,dist=Math.hypot(xx-sx,yy-sy);if(dist<(part==='a'?1.9:2.5))z=part==='a'?block+2.0:block-2.4}
 map[y*n+x]=Math.max(0,Math.round(z/dz));
}return F.gridSolid(map,n,ny,dx,dy,dz)}
function colorArt(p){var w=num(p.width,40,200,'Width'),base=num(p.base,.6,2.4,'Base thickness'),layer=num(p.layer,.4,1.6,'Color layer'),levels=num(p.levels,2,5,'Color levels')|0,nx=p.nx|0,ny=p.ny|0;if(nx<12||ny<12||nx*ny>18000||!p.values||p.values.length!==nx*ny)throw Error('Upload a suitable image.');var map=new Uint16Array(nx*ny),dz=.2,baseSteps=Math.round(base/dz),layerSteps=Math.round(layer/dz);if(!layerSteps)throw Error('Color layers must be at least 0.2mm.');for(var i=0;i<map.length;i++){var lum=p.values[i],bucket=Math.min(levels-1,Math.floor((255-lum)/256*levels));map[i]=baseSteps+bucket*layerSteps+layerSteps}return F.gridSolid(map,nx,ny,w/nx,(w*ny/nx)/ny,dz)}
function flexi(p){var mode=p.part||'link',size=num(p.size,12,30,'Body width'),span=num(p.spacing,14,36,'Joint spacing'),hole=num(p.hole,3,5,'Hinge hole'),thick=num(p.thickness,2.8,6,'Segment thickness');if(span<1.3*size)throw Error('Joint spacing must be at least 1.3 times body width.');
if(mode==='pin'){return lathePin(hole,2*thick+.65)}
var w=span+size*.8,depth=size*1.1,nx=Math.ceil(w*2.2),ny=Math.ceil(depth*2.2),map=new Uint16Array(nx*ny),sx=w/nx,sy=depth/ny,dz=.4,z=Math.round(thick/dz),r=size*.36;
for(var y=0;y<ny;y++)for(var x=0;x<nx;x++){var xx=(x+.5)*sx-w/2,yy=(y+.5)*sy-depth/2,left=-span/2,right=span/2;
var halfSegment=Math.max(Math.abs(xx)-span/2,0),inside=(halfSegment*halfSegment+yy*yy<=r*r)||(Math.abs(xx)<=span/2&&Math.abs(yy)<r*.79);
if(mode==='head'){inside=inside||((xx>0&&xx<right+size*.4)&&Math.abs(yy)<r*1.16)}
if(mode==='tail'){inside=inside&&!(xx>span*.22&&Math.abs(yy)>r*.5)}
var holes=(mode!=='head'&&Math.hypot(xx-left,yy)<hole/2+.12)||(mode!=='tail'&&Math.hypot(xx-right,yy)<hole/2+.12);
map[y*nx+x]=inside&&!holes?z:0;
}return F.gridSolid(map,nx,ny,sx,sy,dz)}
function lathePin(hole,length){var m=new Mesh(),n=72,r=hole/2-.32,headR=hole/2+1.0; if(r<1.1)throw Error('Hinge hole is too small.');var angles=[];for(var i=0;i<n;i++)angles.push(i*TWO/n);function ringsProfile(){return[{z:0,r:headR},{z:1.2,r:headR},{z:1.2,r:r},{z:length+1.2,r:r},{z:length+1.2,r:r-.23},{z:length+1.6,r:r-.23}]}var steps=ringsProfile(),previous=null,first=null;
for(var s=0;s<steps.length;s++){var ringPoints=ring(steps[s].r,steps[s].z,angles);if(!first)first=ringPoints;if(previous)for(i=0;i<n;i++){var j=(i+1)%n,a=previous[i],b=previous[j],c=ringPoints[j],d=ringPoints[i];if(a[0]!==d[0]||a[1]!==d[1]||a[2]!==d[2])m.quad(a,b,c,d)}previous=ringPoints}
for(i=0;i<n;i++){var j=(i+1)%n;m.tri([0,0,0],first[j],first[i]);m.tri([0,0,steps[steps.length-1].z],previous[i],previous[j])}return m.done()}
F.gear=gear;F.lightbox=lightbox;F.mold=mold;F.colorArt=colorArt;F.flexi=flexi;
})(typeof globalThis!=='undefined'?globalThis:this);
