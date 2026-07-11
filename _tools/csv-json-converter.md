---
title: "CSV ↔ JSON Converter"
link: "/tools/csv-json-converter/"
description: "Convert between CSV and JSON."
tags:
  - csv
  - json
  - converter
category: "Converters"
---
<div class="tui">
  <h1>CSV ↔ JSON Converter</h1>
  <p class="sub">Convert CSV to JSON and JSON to CSV.</p>
  <div class="tabs">
    <button class="tab active" data-tab="cj">CSV → JSON</button>
    <button class="tab" data-tab="jc">JSON → CSV</button>
  </div>
  <div class="panel active" id="panel-cj">
    <textarea id="cj-in" placeholder="col1,col2&#10;val1,val2"></textarea>
    <div class="row"><button class="btn btn-primary" onclick="cj()">Convert</button><button class="btn btn-secondary" onclick="copy('cj-out')">Copy</button></div>
    <div id="cj-out" class="result"></div>
    <div id="cj-msg" class="msg"></div>
  </div>
  <div class="panel" id="panel-jc">
    <textarea id="jc-in" placeholder="[&#10;  {&#34;col1&#34;:&#34;val1&#34;}&#10;]"></textarea>
    <div class="row"><button class="btn btn-primary" onclick="jc()">Convert</button><button class="btn btn-secondary" onclick="copy('jc-out')">Copy</button></div>
    <div id="jc-out" class="result"></div>
    <div id="jc-msg" class="msg"></div>
  </div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function parseCsv(text){var rows=[],row=[],field='',inQ=false,i=0;while(i<text.length){var c=text[i];if(inQ){if(c==='"'){if(text[i+1]==='"'){field+='"';i+=2;continue;}inQ=false;i++;continue;}field+=c;i++;continue;}if(c==='"'){inQ=true;i++;continue;}if(c===','){row.push(field);field='';i++;continue;}if(c==='\n'){row.push(field);rows.push(row);row=[];field='';i++;continue;}if(c==='\r'){i++;continue;}field+=c;i++;}if(field.length||row.length){row.push(field);rows.push(row);}return rows;}
function csvToJson(text){var rows=parseCsv(text).filter(function(r){return r.length>1||(r.length===1&&r[0].trim());});if(!rows.length)return [];var head=rows[0];var arr=rows.slice(1).map(function(r){var o={};head.forEach(function(h,idx){var v=r[idx]!==undefined?r[idx].trim():'';if(v!==''&&!isNaN(v)&&v===(+v+''))v=+v;o[h.trim()||('col'+(idx+1))]=v;});return o;});return arr;}
function escCsv(v){v=String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}
function jsonToCsv(text){var data=JSON.parse(text);if(!Array.isArray(data))data=[data];if(!data.length)return '';var keys=[];data.forEach(function(o){Object.keys(o).forEach(function(k){if(keys.indexOf(k)<0)keys.push(k);});});return [keys.join(',')].concat(data.map(function(o){return keys.map(function(k){return escCsv(o[k]===undefined?'':o[k]);}).join(',');})).join('\n');}
function cj(){try{byId('cj-out').textContent=JSON.stringify(csvToJson(byId('cj-in').value),null,2);ok('cj-msg','Converted to JSON');}catch(e){err('cj-msg',e.message);}}
function jc(){try{byId('jc-out').textContent=jsonToCsv(byId('jc-in').value);ok('jc-msg','Converted to CSV');}catch(e){err('jc-msg',e.message);}}
</script>
