---
title: "robots.txt Generator"
link: "/tools/robots-generator/"
description: "Generate a robots.txt file."
tags:
  - robots
  - generator
  - seo
category: "Generators"
---
<div class="tui">
  <h1>robots.txt Generator</h1>
  <p class="sub">Create a robots.txt for your site.</p>
  <div class="row">
    <div style="flex:1"><label>User-agent</label><input type="text" id="ua" value="*"></div>
    <div style="flex:1"><label>Sitemap URL</label><input type="text" id="sm" placeholder="https://example.com/sitemap.xml"></div>
  </div>
  <label>Disallow (one path per line)</label><textarea id="dis" placeholder="/admin&#10;/private"></textarea>
  <label>Allow (one path per line)</label><textarea id="al" placeholder="/public"></textarea>
  <div class="row"><button class="btn btn-primary" onclick="gen()">Generate</button><button class="btn btn-secondary" onclick="copy('out')">Copy</button></div>
  <div id="out" class="result"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function gen(){var ua=byId('ua').value.trim()||'*';var lines=['User-agent: '+ua];byId('dis').value.split('\n').map(function(x){return x.trim();}).filter(Boolean).forEach(function(p){lines.push('Disallow: '+p);});byId('al').value.split('\n').map(function(x){return x.trim();}).filter(Boolean).forEach(function(p){lines.push('Allow: '+p);});var sm=byId('sm').value.trim();if(sm)lines.push('Sitemap: '+sm);byId('out').textContent=lines.join('\n')+'\n';}
</script>
