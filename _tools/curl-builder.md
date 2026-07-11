---
title: "cURL Command Builder"
link: "/tools/curl-builder/"
description: "Build cURL commands from request fields."
tags:
  - curl
  - http
  - generator
  - web
category: "Web & Dev"
---
<div class="tui">
  <h1>cURL Command Builder</h1>
  <p class="sub">Assemble a cURL command from a request.</p>
  <div class="row"><div style="flex:1"><label>Method</label><select id="method"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option><option>PATCH</option></select></div><div style="flex:3"><label>URL</label><input type="text" id="url" placeholder="https://api.example.com/users"></div></div>
  <label>Headers (one per line: Name: value)</label><textarea id="headers" placeholder="Authorization: Bearer TOKEN&#10;Content-Type: application/json"></textarea>
  <label>Body (JSON / raw)</label><textarea id="body" placeholder='{"name":"Ada"}'></textarea>
  <label>Auth</label><select id="auth"><option value="">None</option><option value="bearer">Bearer token</option><option value="basic">Basic (user:pass)</option></select>
  <label>Token / user:pass</label><input type="text" id="cred" placeholder="TOKEN or user:pass">
  <div class="row"><button class="btn btn-primary" onclick="run()">Build</button><button class="btn btn-secondary" onclick="copy('out')">Copy</button></div>
  <div id="out" class="result"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function q(s){return "'"+s.replace(/'/g,"'\\''")+"'";}
function run(){var m=byId('method').value,u=byId('url').value.trim();if(!u){byId('out').textContent='';return;}var c='curl -X '+m+' '+q(u);
  byId('headers').value.split('\n').map(function(x){return x.trim();}).filter(Boolean).forEach(function(h){c+=' \\\n  -H '+q(h);});
  if(byId('auth').value==='bearer'&&byId('cred').value)c+=' \\\n  -H '+q('Authorization: Bearer '+byId('cred').value);
  if(byId('auth').value==='basic'&&byId('cred').value)c+=' \\\n  -u '+q(byId('cred').value);
  var b=byId('body').value.trim();if(b&&m!=='GET')c+=' \\\n  -d '+q(b);
  byId('out').textContent=c;
}
</script>
