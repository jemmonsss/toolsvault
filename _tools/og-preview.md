---
title: "Open Graph Preview"
link: "/tools/og-preview/"
description: "Preview how a URL's link preview will look."
tags:
  - og
  - preview
  - social
  - web
category: "Web & Dev"
---
<div class="tui">
  <h1>Open Graph Preview</h1>
  <p class="sub">Fetch a URL and render its social share preview. Works only for CORS-enabled URLs.</p>
  <div class="row"><div style="flex:1"><input type="text" id="url" placeholder="https://example.com"></div><button class="btn btn-primary" onclick="run()">Preview</button></div>
  <div id="card" style="margin-top:1rem;max-width:520px;border:1px solid #2d2d2d;border-radius:8px;overflow:hidden"></div>
  <div id="raw" class="result" style="margin-top:1rem"></div>
  <div id="msg" class="msg"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function meta(doc,p){var el=doc.querySelector('meta[property="'+p+'"],meta[name="'+p+'"]');return el?el.getAttribute('content'):'';}
function run(){var u=byId('url').value.trim();if(!u){err('msg','Enter a URL');return;}byId('msg').className='msg ok';byId('msg').textContent='Fetching...';
  fetch(u).then(function(r){return r.text();}).then(function(html){var doc=new DOMParser().parseFromString(html,'text/html');var title=doc.title||meta(doc,'og:title');var desc=meta(doc,'og:description')||meta(doc,'description');var img=meta(doc,'og:image');var site=meta(doc,'og:site_name');
    byId('card').innerHTML=(img?'<img src="'+img+'" style="width:100%;display:block;max-height:260px;object-fit:cover" onerror="this.style.display=\'none\'">':'')+'<div style="padding:1rem"><div style="color:#9ca3af;font-size:.8rem">'+site+'</div><div style="font-weight:600;font-size:1.05rem;margin:.25rem 0">'+title+'</div><div style="color:#9ca3af;font-size:.9rem">'+desc+'</div></div>';
    byId('raw').textContent='title: '+title+'\ndescription: '+desc+'\nimage: '+img;showMsg('msg','','');}).catch(function(e){err('msg','Could not load URL (network error or CORS not allowed): '+e.message);});
}
</script>
