---
title: "JSON ↔ YAML Converter"
link: "/tools/json-yaml-converter/"
description: "Convert between JSON and YAML instantly."
tags:
  - json
  - yaml
  - converter
category: "Converters"
---
<div class="tui">
  <h1>JSON ↔ YAML Converter</h1>
  <p class="sub">Convert JSON to YAML and YAML to JSON.</p>
  <div class="tabs">
    <button class="tab active" data-tab="jy">JSON → YAML</button>
    <button class="tab" data-tab="yj">YAML → JSON</button>
  </div>
  <div class="panel active" id="panel-jy">
    <textarea id="jy-in" placeholder="Paste JSON here..."></textarea>
    <div class="row"><button class="btn btn-primary" onclick="jy()">Convert</button><button class="btn btn-secondary" onclick="copy('jy-out')">Copy</button></div>
    <div id="jy-out" class="result"></div>
    <div id="jy-msg" class="msg"></div>
  </div>
  <div class="panel" id="panel-yj">
    <textarea id="yj-in" placeholder="Paste YAML here..."></textarea>
    <div class="row"><button class="btn btn-primary" onclick="yj()">Convert</button><button class="btn btn-secondary" onclick="copy('yj-out')">Copy</button></div>
    <div id="yj-out" class="result"></div>
    <div id="yj-msg" class="msg"></div>
  </div>
</div>
<script src="{{ '/assets/js/js-yaml.min.js' | relative_url }}"></script>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function jy(){try{var o=JSON.parse(byId('jy-in').value);byId('jy-out').textContent=jsyaml.dump(o,{indent:2,lineWidth:120,noRefs:true});ok('jy-msg','Converted to YAML');}catch(e){err('jy-msg',e.message);}}
function yj(){try{var o=jsyaml.load(byId('yj-in').value);byId('yj-out').textContent=JSON.stringify(o,null,2);ok('yj-msg','Converted to JSON');}catch(e){err('yj-msg',e.message);}}
</script>
