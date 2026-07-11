---
title: "SQL ↔ JSON Converter"
link: "/tools/sql-json-converter/"
description: "Convert SQL INSERT statements to JSON and back."
tags:
  - sql
  - json
  - converter
category: "Converters"
---
<div class="tui">
  <h1>SQL ↔ JSON Converter</h1>
  <p class="sub">Convert SQL INSERT statements to JSON and JSON to INSERTs.</p>
  <div class="tabs">
    <button class="tab active" data-tab="sj">SQL → JSON</button>
    <button class="tab" data-tab="js">JSON → SQL</button>
  </div>
  <div class="panel active" id="panel-sj">
    <textarea id="sj-in" placeholder="INSERT INTO users (id, name) VALUES (1, 'Ada'), (2, 'Linus');"></textarea>
    <div class="row"><button class="btn btn-primary" onclick="sj()">Convert</button><button class="btn btn-secondary" onclick="copy('sj-out')">Copy</button></div>
    <div id="sj-out" class="result"></div>
    <div id="sj-msg" class="msg"></div>
  </div>
  <div class="panel" id="panel-js">
    <textarea id="js-in" placeholder="[&#10;  {&#34;id&#34;:1,&#34;name&#34;:&#34;Ada&#34;}&#10;]"></textarea>
    <div class="row"><label>Table</label><input type="text" id="js-table" value="table" style="max-width:160px"></div>
    <div class="row"><button class="btn btn-primary" onclick="js()">Convert</button><button class="btn btn-secondary" onclick="copy('js-out')">Copy</button></div>
    <div id="js-out" class="result"></div>
    <div id="js-msg" class="msg"></div>
  </div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function parseVal(v){v=v.trim();if(v===''||v.toUpperCase()==='NULL')return null;if(v[0]==="'")return v.slice(1,-1).replace(/''/g,"'");var n=Number(v);return isNaN(n)?v:n;}
function parseValues(str){var vals=[],depth=0,inS=false,cur='',tuple=[];for(var i=0;i<str.length;i++){var c=str[i];if(inS){if(c==="'"){if(str[i+1]==="'"){cur+="'";i++;continue;}inS=false;}cur+=c;continue;}if(c==="'"){inS=true;cur+=c;continue;}if(c==='('){depth++;if(depth===1){tuple=[];cur='';continue;}}else if(c===')'){depth--;if(depth===0){tuple.push(cur.trim());vals.push(tuple);cur='';continue;}}else if(c===','&&depth===1){tuple.push(cur.trim());cur='';continue;}if(!(c==='('||c===')'))cur+=c;}return vals;}
function sj(){try{var sql=byId('sj-in').value;var m=sql.match(/insert\s+into\s+([^\s(]+)\s*\(([^)]*)\)\s*values\s*(.*)/i);if(!m)throw new Error('Could not parse INSERT statement');var cols=m[2].split(',').map(function(c){return c.trim();});var tuples=parseValues(m[3]);var arr=tuples.map(function(t){var o={};cols.forEach(function(c,idx){o[c||('col'+(idx+1))]=parseVal(t[idx]||'');});return o;});byId('sj-out').textContent=JSON.stringify(arr,null,2);ok('sj-msg','Converted '+arr.length+' row(s)');}catch(e){err('sj-msg',e.message);}}
function escSql(v){if(v===null)return 'NULL';if(typeof v==='number')return String(v);return "'"+String(v).replace(/'/g,"''")+"'";}
function js(){try{var data=JSON.parse(byId('js-in').value);if(!Array.isArray(data))data=[data];var cols=[];data.forEach(function(o){Object.keys(o).forEach(function(k){if(cols.indexOf(k)<0)cols.push(k);});});var rows=data.map(function(o){return '('+cols.map(function(c){return escSql(o[c]===undefined?null:o[c]);}).join(', ')+')';}).join(',\n  ');byId('js-out').textContent='INSERT INTO '+byId('js-table').value+' ('+cols.join(', ')+')\nVALUES\n  '+rows+';';ok('js-msg','Converted to SQL');}catch(e){err('js-msg',e.message);}}
</script>
