"""Fixture source for deterministic 3MF color separator QA."""
import trimesh, zipfile, pathlib
from xml.etree.ElementTree import Element, SubElement, tostring
base=pathlib.Path(__file__).parent/'fixtures';base.mkdir(exist_ok=True)
NS='http://schemas.microsoft.com/3dmanufacturing/core/2015/02'
def E(parent,tag,**attrs):return SubElement(parent,tag,dict((k,str(v)) for k,v in attrs.items()))
def write(name,painted=False,components=False,units='millimeter'):
 root=Element('model',{'xmlns':NS,'unit':units,'xml:lang':'en-US'})
 res=E(root,'resources'); mats=E(res,'basematerials',id=5)
 E(mats,'base',name='Red PLA',displaycolor='#FF3333FF'); E(mats,'base',name='Blue PLA',displaycolor='#3333FFFF')
 def obj(id,w,h,d,index,shift=0):
  m=trimesh.creation.box(extents=[w,h,d]); m.apply_translation([shift,0,0])
  ob=E(res,'object',id=id,type='model',pid='5',pindex=index);mesh=E(ob,'mesh');vtx=E(mesh,'vertices')
  for x,y,z in m.vertices:E(vtx,'vertex',x=round(x,6),y=round(y,6),z=round(z,6))
  tris=E(mesh,'triangles')
  for i,(a,b,c) in enumerate(m.faces):E(tris,'triangle',v1=a,v2=b,v3=c,**({'pid':5,'p1':1 if i%2 else 0} if painted else {}))
  return m
 if painted:
  obj(1,15,10,6,0)
 else:
  obj(1,12,9,6,0);obj(2,9,7,5,1,25)
 if components:
  group=E(res,'object',id=10,type='model');comps=E(group,'components')
  E(comps,'component',objectid=1,transform='1 0 0 0 1 0 0 0 1 0 0 0')
  E(comps,'component',objectid=2,transform='1 0 0 0 1 0 0 0 1 3 0 0')
 build=E(root,'build')
 if components:E(build,'item',objectid=10,transform='1 0 0 0 1 0 0 0 1 0 2 0')
 else:
  E(build,'item',objectid=1)
  if not painted:E(build,'item',objectid=2)
 data=tostring(root,encoding='utf-8',xml_declaration=True)
 with zipfile.ZipFile(base/name,'w',compression=zipfile.ZIP_DEFLATED) as z:
  z.writestr('[Content_Types].xml','<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>')
  z.writestr('3D/3dmodel.model',data)
  z.writestr('_rels/.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>')
 print(name)
write('color-two-solids.3mf')
write('color-components-cm.3mf',components=True,units='centimeter')
write('painted-surface-not-closed.3mf',painted=True)
