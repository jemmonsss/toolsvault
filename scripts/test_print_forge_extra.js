const fs=require('fs');const assert=require('node:assert/strict');const F=require('../assets/js/print-forge-core.js');globalThis.ToolsVaultForge=F;require('../assets/js/print-forge-extra.js');const out=process.env.TEST_STL_DIR||'/tmp/tools-qa';fs.mkdirSync(out,{recursive:true});
function save(name,data){assert(data instanceof Float32Array&&data.length>0&&data.length%9===0);assert(data.length<3600000);for(let i=0;i<data.length;i++)assert(Number.isFinite(data[i]));const buf=Buffer.from(F.stl(data,name));assert.equal(buf.length,84+data.length/9*50);fs.writeFileSync(out+'/'+name+'.stl',buf);console.log(name, data.length/9,'triangles',buf.length,'bytes')}
const mask=new Uint8Array(80*55).map((_,i)=>((i%80>20&&i%80<60&&Math.floor(i/80)>10&&Math.floor(i/80)<40)?1:0));
const colors=new Uint8Array(65*46).map((_,i)=>((i%65)*4 +Math.floor(i/65)*2)%256);
save('gear',F.gear({mode:'gear',teeth:24,module:2,thickness:8,bore:5}));save('pulley',F.gear({mode:'pulley',teeth:30,pitch:2,thickness:10,bore:5,flange:true}));save('pulley_plain',F.gear({mode:'pulley',teeth:30,pitch:2,thickness:10,bore:5,flange:false}));
save('lightbox_panel',F.lightbox({width:105,height:73,depth:20,wall:3,part:'panel',nx:80,ny:55,mask}));save('lightbox_housing',F.lightbox({width:105,height:73,depth:20,wall:3,part:'housing',nx:80,ny:55,mask}));
save('mold_a',F.mold({width:65,depth:65,block:16,radius:13,shape:'ball',part:'a'}));save('mold_b',F.mold({width:65,depth:65,block:16,radius:13,shape:'ball',part:'b'}));save('mold_disc',F.mold({width:60,depth:65,block:13,radius:12,shape:'disc',part:'a'}));
save('color_art',F.colorArt({width:95,base:.8,layer:.6,levels:4,nx:65,ny:46,values:colors}));
for(let part of ['link','head','tail','pin'])save('flexi_'+part,F.flexi({part,size:14,spacing:22,hole:3.6,thickness:3.2}));
