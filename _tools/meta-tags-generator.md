---
title: "Meta Tags Generator"
link: "/tools/meta-tags-generator/"
description: "Generate Open Graph and Twitter meta tags."
tags:
  - meta
  - og
  - generator
  - seo
category: "Generators"
---
<div class="tui">
  <h1>Meta Tags Generator</h1>
  <p class="sub">Generate social share meta tags for your pages.</p>
  <label>Title</label><input type="text" id="t" placeholder="My Page">
  <label>Description</label><input type="text" id="d" placeholder="A great page">
  <label>URL</label><input type="text" id="u" placeholder="https://example.com/page">
  <label>Image URL</label><input type="text" id="i" placeholder="https://example.com/og.png">
  <label>Twitter @username</label><input type="text" id="tw" placeholder="@handle">
  <div class="row"><button class="btn btn-primary" onclick="gen()">Generate</button><button class="btn btn-secondary" onclick="copy('out')">Copy</button></div>
  <div id="out" class="result"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function gen(){var t=byId('t').value.trim(),d=byId('d').value.trim(),u=byId('u').value.trim(),i=byId('i').value.trim(),tw=byId('tw').value.trim();
  var m=['<title>'+t+'</title>','<meta name="description" content="'+d+'">','<link rel="canonical" href="'+u+'">','<meta property="og:type" content="website">','<meta property="og:title" content="'+t+'">','<meta property="og:description" content="'+d+'">','<meta property="og:url" content="'+u+'">'];
  if(i)m.push('<meta property="og:image" content="'+i+'">');
  m.push('<meta name="twitter:card" content="'+(i?'summary_large_image':'summary')+'">');
  if(tw)m.push('<meta name="twitter:site" content="'+tw+'">');
  if(t)m.push('<meta name="twitter:title" content="'+t+'">');
  if(d)m.push('<meta name="twitter:description" content="'+d+'">');
  if(i)m.push('<meta name="twitter:image" content="'+i+'">');
  byId('out').textContent=m.join('\n');
}
</script>
