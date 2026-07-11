---
title: "MIME Type Lookup"
link: "/tools/mime-lookup/"
description: "Look up MIME types and file extensions."
tags:
  - mime
  - lookup
  - web
category: "Web & Dev"
---
<div class="tui">
  <h1>MIME Type Lookup</h1>
  <p class="sub">Find a MIME type from an extension, or an extension from a MIME type.</p>
  <input type="text" id="q" placeholder="json  or  image/png" oninput="run()">
  <div id="out" class="result" style="margin-top:1rem"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
var M={json:'application/json',html:'text/html',htm:'text/html',css:'text/css',js:'text/javascript',mjs:'text/javascript',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',svg:'image/svg+xml',webp:'image/webp',avif:'image/avif',pdf:'application/pdf',xml:'application/xml',txt:'text/plain',csv:'text/csv',zip:'application/zip',mp3:'audio/mpeg',mp4:'video/mp4',webm:'video/webm',ogg:'audio/ogg',wav:'audio/wav',woff:'font/woff',woff2:'font/woff2',ttf:'font/ttf',eot:'application/vnd.ms-fontobject',ico:'image/x-icon',md:'text/markdown',yaml:'application/yaml',yml:'application/yaml',jsonc:'application/json',form:'application/x-www-form-urlencoded',mul:'multipart/form-data'};
function run(){var q=byId('q').value.trim().toLowerCase();if(!q){byId('out').textContent='';return;}
  if(q.indexOf('/')>=0){var exts=Object.keys(M).filter(function(e){return M[e]===q;});byId('out').textContent=exts.length?('Extensions: .'+exts.join(', .')):'No matching extension';return;}
  q=q.replace(/^\./,'');byId('out').textContent=q in M?('MIME type: '+M[q]):'Unknown extension';
}
</script>
