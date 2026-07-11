---
title: "JSON ↔ XML Converter"
link: "/tools/json-xml-converter/"
description: "Convert between JSON and XML."
tags:
  - json
  - xml
  - converter
category: "Converters"
---
<div class="tui">
  <h1>JSON ↔ XML Converter</h1>
  <p class="sub">Convert JSON to XML and XML back to JSON.</p>
  <div class="tabs">
    <button class="tab active" data-tab="jx">JSON → XML</button>
    <button class="tab" data-tab="xj">XML → JSON</button>
  </div>
  <div class="panel active" id="panel-jx">
    <textarea id="jx-in" placeholder="Paste JSON here..."></textarea>
    <div class="row"><label>Root element</label><input type="text" id="jx-root" value="root" style="max-width:160px"></div>
    <div class="row"><button class="btn btn-primary" onclick="jx()">Convert</button><button class="btn btn-secondary" onclick="copy('jx-out')">Copy</button></div>
    <div id="jx-out" class="result"></div>
    <div id="jx-msg" class="msg"></div>
  </div>
  <div class="panel" id="panel-xj">
    <textarea id="xj-in" placeholder="Paste XML here..."></textarea>
    <div class="row"><button class="btn btn-primary" onclick="xj()">Convert</button><button class="btn btn-secondary" onclick="copy('xj-out')">Copy</button></div>
    <div id="xj-out" class="result"></div>
    <div id="xj-msg" class="msg"></div>
  </div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function escXml(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c];});}
function jsonToXml(v,name){if(v===null||v===undefined)return '';if(Array.isArray(v))return v.map(function(i){return jsonToXml(i,name);}).join('');if(typeof v==='object'){var inner=Object.keys(v).map(function(k){return jsonToXml(v[k],k);}).join('');return '<'+name+'>'+inner+'</'+name+'>';}return '<'+name+'>'+escXml(v)+'</'+name+'>';}
function xmlToJson(node){
  if(node.nodeType===3)return node.nodeValue;
  if(node.nodeType!==1)return null;
  var children=Array.prototype.slice.call(node.childNodes).filter(function(n){return n.nodeType===1||(n.nodeType===3&&n.nodeValue.trim());});
  if(!children.length)return node.textContent;
  if(children.every(function(n){return n.nodeType===3;}))return node.textContent.trim();
  var obj={};
  children.forEach(function(c){if(c.nodeType===3)return;var co=xmlToJson(c);var nm=c.nodeName;if(obj[nm]){if(!Array.isArray(obj[nm]))obj[nm]=[obj[nm]];obj[nm].push(co);}else obj[nm]=co;});
  return obj;
}
function jx(){try{var o=JSON.parse(byId('jx-in').value);var root=byId('jx-root').value.trim()||'root';byId('jx-out').textContent='<?xml version="1.0" encoding="UTF-8"?>\n'+jsonToXml(o,root);ok('jx-msg','Converted to XML');}catch(e){err('jx-msg',e.message);}}
function xj(){try{var doc=new DOMParser().parseFromString(byId('xj-in').value,'application/xml');var pe=doc.querySelector('parsererror');if(pe)throw new Error(pe.textContent);var r={};r[doc.documentElement.nodeName]=xmlToJson(doc.documentElement);byId('xj-out').textContent=JSON.stringify(r,null,2);ok('xj-msg','Converted to JSON');}catch(e){err('xj-msg',e.message);}}
</script>
