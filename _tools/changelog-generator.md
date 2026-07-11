---
title: "Changelog Generator"
link: "/tools/changelog-generator/"
description: "Generate a Keep a Changelog entry."
tags:
  - changelog
  - generator
  - markdown
category: "Generators"
---
<div class="tui">
  <h1>Changelog Generator</h1>
  <p class="sub">Generate a Keep a Changelog formatted entry.</p>
  <div class="row">
    <div style="flex:1"><label>Version</label><input type="text" id="ver" value="1.0.0"></div>
    <div style="flex:1"><label>Date</label><input type="text" id="date" value="2026-01-01"></div>
  </div>
  <label>Added (one per line)</label><textarea id="added" placeholder="New feature X"></textarea>
  <label>Changed (one per line)</label><textarea id="changed" placeholder="Improved Y"></textarea>
  <label>Fixed (one per line)</label><textarea id="fixed" placeholder="Bug Z"></textarea>
  <div class="row"><button class="btn btn-primary" onclick="gen()">Generate</button><button class="btn btn-secondary" onclick="copy('out')">Copy</button></div>
  <div id="out" class="result"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}" defer></script>
<script>
function lines(id){return byId(id).value.split('\n').map(function(x){return x.trim();}).filter(Boolean).map(function(x){return '- '+x;});}
function gen(){var md='## ['+byId('ver').value.trim()+'] - '+byId('date').value.trim();var a=lines('added'),c=lines('changed'),f=lines('fixed');if(a.length)md+='\n\n### Added\n'+a.join('\n');if(c.length)md+='\n\n### Changed\n'+c.join('\n');if(f.length)md+='\n\n### Fixed\n'+f.join('\n');byId('out').textContent=md+'\n';}
</script>
