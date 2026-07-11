---
title: "Slugify"
link: "/tools/slugify/"
description: "Convert text into URL-friendly slugs."
tags:
  - slug
  - url
  - text
category: "Text & Strings"
---
<div class="tui">
  <h1>Slugify</h1>
  <p class="sub">Turn titles into URL slugs.</p>
  <textarea id="in" placeholder="My First Blog Post!" style="min-height:120px"></textarea>
  <div class="row">
    <label><input type="checkbox" id="lower" checked> lowercase</label>
    <label><input type="checkbox" id="sep_d" checked> dash separator</label>
    <button class="btn btn-primary" onclick="run()">Slugify</button>
    <button class="btn btn-secondary" onclick="copy('out')">Copy</button>
  </div>
  <div id="out" class="result"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
function run(){var s=byId('in').value.trim().normalize('NFD').replace(/[̀-ͯ]/g,'');if(byId('lower').checked)s=s.toLowerCase();s=s.replace(/[^a-z0-9]+/gi,byId('sep_d').checked?'-':'_').replace(/^-+|-+$/g,'');byId('out').textContent=s;}
</script>
