/* Geometry and STL contract smoke tests. Run: node scripts/test_print_forge.js */
const assert=require('node:assert/strict');
const F=require('../assets/js/print-forge-core.js');
function test(name,mesh,heavy=false){
 assert(mesh instanceof Float32Array && mesh.length>0 && mesh.length%9===0, name+' mesh');
 const max=Math.max(...[...Array(3)].map((_,j)=>{let hi=-Infinity;for(let i=j;i<mesh.length;i+=3)hi=Math.max(hi,mesh[i]);return hi}));
 let min=[Infinity,Infinity,Infinity],maxs=[-Infinity,-Infinity,-Infinity],nan=0,edges=new Map(),signedVolume=0;
 for(let i=0;i<mesh.length;i+=9){const verts=[];for(let p=0;p<3;p++){let a=[];for(let k=0;k<3;k++){const v=mesh[i+3*p+k];if(!Number.isFinite(v))nan++;min[k]=Math.min(min[k],v);maxs[k]=Math.max(maxs[k],v);a.push(v)}verts.push(a)}
 const [a,b,c]=verts;const x1=b[0]-a[0],y1=b[1]-a[1],z1=b[2]-a[2],x2=c[0]-a[0],y2=c[1]-a[1],z2=c[2]-a[2];const norm=[y1*z2-z1*y2,z1*x2-x1*z2,x1*y2-y1*x2];const area=Math.hypot(...norm);assert(area>1e-7,name+' zero triangle @'+i/9);signedVolume+=(a[0]*norm[0]+a[1]*norm[1]+a[2]*norm[2])/6;
 if(!heavy){const keys=verts.map(v=>v.map(x=>Math.round(x*1000)).join(','));for(let k=0;k<3;k++){let key=[keys[k],keys[(k+1)%3]].sort().join('|');let entry=edges.get(key)||{count:0,dir:0};entry.count++;entry.dir+=keys[k]<keys[(k+1)%3]?1:-1;edges.set(key,entry);}}
 }
 assert.equal(nan,0,name+' NaN');
 const buf=F.stl(mesh,name);assert.equal(buf.byteLength,84+50*mesh.length/9,name+' STL bytes');
 assert.equal(new DataView(buf).getUint32(80,true),mesh.length/9,name+' STL triangles');
 if(!heavy){const wrong=[...edges.values()].filter(v=>v.count!==2||v.dir!==0);assert.equal(wrong.length,0,name+' open/inconsistent edges (of '+edges.size+')');}
 console.log(name+' | triangles '+mesh.length/9+' | bounds '+maxs.map((v,i)=>(v-min[i]).toFixed(1)).join('×')+' | signed volume '+signedVolume.toFixed(1)+' | manifold '+!heavy);
 assert(signedVolume>0,name+' outward normals (negative volume)');
}
test('organizer',F.organizer({width:60,depth:45,height:12,wall:2,base:2.4,cols:3,rows:2}));
test('lithophane flat',F.lithophane({width:55,height:40,min:.8,max:3,nx:10,ny:9,values:new Uint8Array(90).map((_,i)=>(i*11)%256)}));
test('lithophane curved',F.lithophane({width:55,height:40,min:.8,max:3,nx:10,ny:9,values:new Uint8Array(90).map((_,i)=>(i*11)%256),arc:90}));
const n=32*25,values=new Uint8Array(n).map((_,i)=>{let x=i%32,y=Math.floor(i/32);return (x>5&&x<27&&y>4&&y<20)?0:255});
test('logo sign',F.logo({width:60,nx:32,ny:25,values,threshold:150,mode:'sign'}));
test('logo cutter',F.logo({width:60,nx:32,ny:25,values,threshold:150,mode:'cutter'}));
test('bolt',F.screw({dia:8,pitch:1.25,length:20,head:5}));
test('nut',F.nut({dia:8,pitch:1.25,nutHeight:7,clearance:.3}));
const mask=new Uint8Array(100*30);for(let y=10;y<20;y++)for(let x=25;x<85;x++)mask[y*100+x]=1;
test('name tag',F.nameplate({width:80,height:24,hole:true,text:'TEST',mask}));
console.log('All print-forge contract tests passed.');
