---
title: "JSON to Interface Generator"
link: "/tools/interface-generator/"
description: "Generate TS, Go and C# types from JSON."
tags:
  - json
  - interface
  - types
  - generator
  - web
category: "Web & Dev"
---
<div class="tui">
  <h1>JSON to Interface Generator</h1>
  <p class="sub">Generate TypeScript / Go / C# types from a JSON sample.</p>
  <textarea id="in" placeholder='{"id":1,"name":"Ada","tags":["x"],"address":{"city":"London"}}'></textarea>
  <div class="row"><div style="flex:1"><label>Root name</label><input type="text" id="root" value="Root"></div><div style="flex:1"><label>Language</label><select id="lang"><option value="ts">TypeScript</option><option value="go">Go</option><option value="cs">C#</option></select></div></div>
  <div class="row"><button class="btn btn-primary" onclick="run()">Generate</button><button class="btn btn-secondary" onclick="copy('out')">Copy</button></div>
  <div id="out" class="result"></div>
  <div id="msg" class="msg"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}
function sample(v){return (Array.isArray(v)&&v.length)?v[0]:v;}
function gen(obj,name){
  var lang=byId('lang').value;
  var out=[],seen={};
  function t(v,k){
    if(v===null)return lang==='go'?'interface{}':'any';
    if(typeof v==='number')return lang==='go'?(Number.isInteger(v)?'int':'float64'):'number';
    if(typeof v==='boolean')return lang==='go'?'bool':'bool';
    if(typeof v==='string')return 'string';
    if(Array.isArray(v))return t(sample(v),k)+'[]';
    if(typeof v==='object')return cap(k);
    return 'any';
  }
  function walk(o,n){
    if(o&&typeof o==='object'&&!Array.isArray(o)){
      if(seen[n])return;
      seen[n]=1;
      if(lang==='ts'){
        var lines=Object.keys(o).map(function(k){return '  '+k+': '+t(o[k],k)+';';});
        out.push('interface '+n+' {\n'+lines.join('\n')+'\n}');
      } else if(lang==='go'){
        var gl=Object.keys(o).map(function(k){return '  '+cap(k)+' '+t(o[k],k)+' `json:"'+k+'"`';});
        out.push('type '+n+' struct {\n'+gl.join('\n')+'\n}');
      } else {
        var cl=Object.keys(o).map(function(k){return '    public '+t(o[k],k)+' '+cap(k)+' { get; set; }';});
        out.push('public class '+n+' {\n'+cl.join('\n')+'\n}');
      }
      Object.keys(o).forEach(function(k){
        var v=o[k];
        if(v&&typeof v==='object')walk(sample(v),cap(k));
      });
    } else if(Array.isArray(o)&&o[0]&&typeof o[0]==='object'){
      walk(o[0],cap(n));
    }
  }
  walk(obj,name);
  return out.join('\n\n');
}
function run(){try{var o=JSON.parse(byId('in').value);if(Array.isArray(o))o=o[0]||{};byId('out').textContent=gen(o,cap(byId('root').value)||'Root');showMsg('msg','','');}catch(e){err('msg',e.message);}}
</script>
