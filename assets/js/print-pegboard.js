/* ToolsVault Pegboard & Wall Mount Factory. Standalone, browser-only voxel CSG. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.ToolsVaultPegboard=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
function between(x,a,b,n){x=Number(x);if(!Number.isFinite(x)||x<a||x>b)throw Error(n+' must be between '+a+' and '+b);return x}
function insideBox(x,y,z,a,b,c,d,e,f){return x>=a&&x<=b&&y>=c&&y<=d&&z>=e&&z<=f}
function cylY(x,y,z,cx,cz,y0,y1,r){return y>=y0&&y<=y1&&(x-cx)**2+(z-cz)**2<=r*r}
function cylZ(x,y,z,cx,cy,z0,z1,r){return z>=z0&&z<=z1&&(x-cx)**2+(y-cy)**2<=r*r}
function meshSurface(min,max,step,predicate){var nx=Math.ceil((max[0]-min[0])/step),ny=Math.ceil((max[1]-min[1])/step),nz=Math.ceil((max[2]-min[2])/step);if(nx*ny*nz>2400000)throw Error('Design exceeds the browser size limit. Reduce dimensions or detail.');var size=nx*ny*nz,grid=new Uint8Array(size),index=(i,j,k)=>(k*ny+j)*nx+i,count=0;
for(var k=0;k<nz;k++)for(var j=0;j<ny;j++)for(var i=0;i<nx;i++){var x=min[0]+(i+.5)*step,y=min[1]+(j+.5)*step,z=min[2]+(k+.5)*step;if(predicate(x,y,z)){grid[index(i,j,k)]=1;count++}}
if(count===0)throw Error('Design is empty.');var coords=[],limit=3300000;function tri(a,b,c){if(coords.length+9>limit)throw Error('Too many triangles. Reduce design detail.');coords.push(...a,...b,...c)}function quad(a,b,c,d){tri(a,b,c);tri(a,c,d)}
function filled(i,j,k){return i>=0&&i<nx&&j>=0&&j<ny&&k>=0&&k<nz&&grid[index(i,j,k)]===1}
for(k=0;k<nz;k++)for(j=0;j<ny;j++)for(i=0;i<nx;i++)if(filled(i,j,k)){
 var x0=min[0]+i*step,x1=x0+step,y0=min[1]+j*step,y1=y0+step,z0=min[2]+k*step,z1=z0+step;
 if(!filled(i-1,j,k))quad([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]);
 if(!filled(i+1,j,k))quad([x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]);
 if(!filled(i,j-1,k))quad([x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]);
 if(!filled(i,j+1,k))quad([x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0]);
 if(!filled(i,j,k-1))quad([x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[x1,y0,z0]);
 if(!filled(i,j,k+1))quad([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]);
}
return new Float32Array(coords)}
function make(p){var type=p.type||'hook',pitch=between(p.pitch,12,50,'Hole spacing'),hole=between(p.hole,3,12,'Hole diameter'),clearance=between(p.clearance,.1,1.2,'Peg clearance'),board=between(p.board,2,9,'Pegboard thickness'),pegDia=hole-clearance;
if(pegDia<2.6)throw Error('Peg diameter would be too thin.');var step=between(p.detail,.35,1.2,'Geometry resolution');
if(type==='panel'){
 var cols=between(p.cols,2,8,'Panel columns')|0,rows=between(p.rows,2,8,'Panel rows')|0,thick=between(p.panelThickness,3,12,'Panel thickness'),w=cols*pitch,h=rows*pitch,r=hole/2;
 if(hole>=pitch*.65)throw Error('Holes are too large for this spacing.');
 return meshSurface([0,0,0],[w,h,thick],step,function(x,y){var dx=(x%pitch)-pitch/2,dy=(y%pitch)-pitch/2;return dx*dx+dy*dy>r*r});
}
var width=between(p.width,16,175,'Holder width'),depth=between(p.depth,12,100,'Holder reach'),count=type==='hook'?between(p.pegs,1,2,'Peg count')|0:2;
if(count===2&&width<pitch+10)throw Error('Holder width must be at least hole spacing + 10 mm for two pegs.');
var pegZ=24,plateZ=32,headY=3.6,pegLength=board+2.4,pegs=count===1?[0]:[-pitch/2,pitch/2],thickness=3.2,r=pegDia/2;var height=type==='tray'?36:type==='rack'?32:40;
if(type==='rack'){var holes=between(p.count,2,7,'Tool holes')|0,toolDia=between(p.toolDiameter,3,16,'Tool hole diameter');if(width < holes*(toolDia+3)+8)throw Error('Increase holder width or reduce number/diameter of tool holes.');}
if(type==='tray'&&width<24)throw Error('Tray width must be at least 24 mm.');
var predicate=function(x,y,z){var body=insideBox(x,y,z,-width/2,width/2,0,headY,5,plateZ);
for(var a=0;a<pegs.length;a++)if(cylY(x,y,z,pegs[a],pegZ,-pegLength,0,r))body=true;
if(type==='hook'){
 // A raised lip keeps hanging objects from sliding off the horizontal arm.
 body=body||insideBox(x,y,z,-4.3,4.3,headY,depth,13,19)||insideBox(x,y,z,-4.3,4.3,depth-4,depth,13,28);
 body=body||(Math.abs(x)<=4.3&&y>=headY&&y<=depth*.72&&z>=5&&z<=19&&z>=17-y*.20);
}else if(type==='rack'){
 body=body||insideBox(x,y,z,-width/2,width/2,headY,depth,11,15);
 // A tapered under-shelf web supports the horizontal plate.
 body=body||(y>=headY&&y<=depth-3&&Math.abs(x)<=width/2-3&&z>=5&&z<=11&&z>=10-(y-headY)*.23);
 var holes=p.count|0,toolDia=p.toolDiameter,span=width-10,spacing=span/holes;
 for(a=0;a<holes;a++){var hx=-span/2+(a+.5)*spacing;if(cylZ(x,y,z,hx,Math.max(10,depth*.65),10.5,15.5,toolDia/2))body=false}
}else if(type==='tray'){
 body=body||insideBox(x,y,z,-width/2,width/2,headY,depth,6,10);
 body=body||insideBox(x,y,z,-width/2,-width/2+3,headY,depth,6,26)||insideBox(x,y,z,width/2-3,width/2,headY,depth,6,26);
 body=body||insideBox(x,y,z,-width/2,width/2,depth-3,depth,6,26);
 // Bracing at the pegboard reduces the load on the pegs.
 body=body||(Math.abs(x)<=width/2-4&&y>=headY&&y<=Math.min(depth,22)&&z>=5&&z<=11&&z>=12-(y-headY)*.35);
}else throw Error('Unsupported holder type');return body;
};
return meshSurface([-width/2-1,-pegLength-.5,0],[width/2+1,depth+1,height],step,predicate)
}
return{make:make,meshSurface:meshSurface};
});
