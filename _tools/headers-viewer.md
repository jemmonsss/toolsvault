---
title: "HTTP Headers Viewer"
link: "/tools/headers-viewer/"
description: "Fetch a URL and inspect its response headers."
tags:
  - http
  - headers
  - web
category: "Web & Dev"
---
<div class="tui">
  <h1>HTTP Headers Viewer</h1>
  <p class="sub">Fetch a URL and show response status and headers. Works only for CORS-enabled URLs.</p>
  <div class="row"><div style="flex:1"><input type="text" id="url" placeholder="https://example.com"></div><button class="btn btn-primary" onclick="run()">Fetch</button></div>
  <div id="out" class="result" style="margin-top:1rem"></div>
  <div id="msg" class="msg"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function run(){var u=byId('url').value.trim();if(!u){err('msg','Enter a URL');return;}byId('msg').className='msg ok';byId('msg').textContent='Fetching...';
  fetch(u).then(function(res){var h=[];res.headers.forEach(function(v,k){h.push(k+': '+v);});byId('out').textContent='Status: '+res.status+' '+res.statusText+'\n\n'+h.join('\n');showMsg('msg','','');}).catch(function(e){err('msg','Request failed (network error or CORS not allowed): '+e.message);});
}
</script>
