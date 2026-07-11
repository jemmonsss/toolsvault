---
title: "README Generator"
link: "/tools/readme-generator/"
description: "Generate a clean README template."
tags:
  - readme
  - generator
  - markdown
category: "Generators"
---
<div class="tui">
  <h1>README Generator</h1>
  <p class="sub">Scaffold a README.md for your project.</p>
  <div class="row">
    <div style="flex:1"><label>Project name</label><input type="text" id="name" placeholder="My Project"></div>
    <div style="flex:1"><label>Badge (optional)</label><input type="text" id="badge" placeholder="build passing"></div>
  </div>
  <label>Description</label><input type="text" id="desc" placeholder="A short description">
  <label>Install</label><input type="text" id="install" placeholder="npm install my-project">
  <label>Usage</label><textarea id="usage" placeholder="import myProject from 'my-project';"></textarea>
  <label>Features (one per line)</label><textarea id="features" placeholder="Fast&#10;Lightweight&#10;Zero dependencies"></textarea>
  <div class="row"><button class="btn btn-primary" onclick="gen()">Generate</button><button class="btn btn-secondary" onclick="copy('out')">Copy</button></div>
  <div id="out" class="result"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function gen(){var n=byId('name').value||'My Project';var b=byId('badge').value.trim();var d=byId('desc').value.trim();var inst=byId('install').value.trim();var u=byId('usage').value.trim();var feats=byId('features').value.split('\n').map(function(x){return x.trim();}).filter(Boolean);
  var md='# '+n+(b?'\n\n![#'+b+'](https://img.shields.io/badge/'+b.replace(/ /g,'%20')+'-8b5cf6)':'');
  if(d)md+='\n\n'+d;
  md+='\n\n## Features\n'+feats.map(function(f){return '- '+f;}).join('\n');
  if(inst)md+='\n\n## Install\n```\n'+inst+'\n```';
  if(u)md+='\n\n## Usage\n```js\n'+u+'\n```';
  md+='\n\n## License\nMIT';
  byId('out').textContent=md;
}
</script>
