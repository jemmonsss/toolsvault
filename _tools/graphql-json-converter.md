---
title: "GraphQL ↔ JSON Converter"
link: "/tools/graphql-json-converter/"
description: "Convert GraphQL queries to JSON and back."
tags:
  - graphql
  - json
  - converter
category: "Converters"
---
<div class="tui">
  <h1>GraphQL ↔ JSON Converter</h1>
  <p class="sub">Convert a GraphQL query into a JSON shape and back.</p>
  <div class="tabs">
    <button class="tab active" data-tab="gj">GraphQL → JSON</button>
    <button class="tab" data-tab="jg">JSON → GraphQL</button>
  </div>
  <div class="panel active" id="panel-gj">
    <textarea id="gj-in" placeholder="query { user { id name posts { title } } }"></textarea>
    <div class="row"><button class="btn btn-primary" onclick="gj()">Convert</button><button class="btn btn-secondary" onclick="copy('gj-out')">Copy</button></div>
    <div id="gj-out" class="result"></div>
    <div id="gj-msg" class="msg"></div>
  </div>
  <div class="panel" id="panel-jg">
    <textarea id="jg-in" placeholder='{&#34;user&#34;:{&#34;id&#34;:true,&#34;name&#34;:true}}'></textarea>
    <div class="row"><label>Root</label><input type="text" id="jg-root" value="query" style="max-width:140px"></div>
    <div class="row"><button class="btn btn-primary" onclick="jg()">Convert</button><button class="btn btn-secondary" onclick="copy('jg-out')">Copy</button></div>
    <div id="jg-out" class="result"></div>
    <div id="jg-msg" class="msg"></div>
  </div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function stripArgs(s){var out='',inS=false,inP=0,i=0;while(i<s.length){var c=s[i];if(c==='#'&&!inS){while(i<s.length&&s[i]!=='\n')i++;continue;}if(c==='"'||c==="'"){inS=!inS;out+=c;i++;continue;}if(c==='('&&!inS){inP++;i++;continue;}if(c===')'&&!inS){inP--;i++;continue;}if(inP===0)out+=c;i++;}return out;}
function closeIdx(s,open){var d=0;for(var i=open;i<s.length;i++){if(s[i]==='{')d++;else if(s[i]==='}'){d--;if(d===0)return i;}}return s.length;}
function parseFields(inner){var obj={},key='',i=0,depth=0;while(i<inner.length){var c=inner[i];if(c==='{'){depth++;if(depth===1){var j=closeIdx(inner,i);obj[key.trim()]=parseFields(inner.slice(i+1,j));key='';i=j+1;continue;}}else if(c==='}'){if(depth>0)depth--;i++;continue;}else if(c===' '||c==='\n'||c==='\t'||c===','){if(key.trim()){if(!(key.trim() in obj))obj[key.trim()]=null;}key='';i++;continue;}else{key+=c;i++;}}if(key.trim())obj[key.trim()]=null;return obj;}
function gj(){try{var s=stripArgs(byId('gj-in').value);var first=s.indexOf('{');if(first<0)throw new Error('No selection set found');var last=closeIdx(s,first);byId('gj-out').textContent=JSON.stringify(parseFields(s.slice(first+1,last)),null,2);ok('gj-msg','Converted to JSON');}catch(e){err('gj-msg',e.message);}}
function objToGql(o,d){return Object.keys(o).map(function(k){var v=o[k];if(v&&typeof v==='object'&&!Array.isArray(v))return k+'{\n'+'  '.repeat(d+1)+objToGql(v,d+1)+'\n'+'  '.repeat(d)+'}';return k;}).join('\n'+'  '.repeat(d));}
function jg(){try{var o=JSON.parse(byId('jg-in').value);byId('jg-out').textContent=byId('jg-root').value.trim()+' {\n  '+objToGql(o,1)+'\n}';ok('jg-msg','Converted to GraphQL');}catch(e){err('jg-msg',e.message);}}
</script>
