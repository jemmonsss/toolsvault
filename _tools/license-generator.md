---
title: "License File Generator"
link: "/tools/license-generator/"
description: "Generate open-source LICENSE files."
tags:
  - license
  - generator
  - legal
category: "Generators"
---
<div class="tui">
  <h1>License File Generator</h1>
  <p class="sub">Generate a LICENSE file for your project.</p>
  <div class="row">
    <div style="flex:1"><label>License</label><select id="lic"><option value="MIT">MIT</option><option value="BSD">BSD-3-Clause</option><option value="Apache">Apache-2.0</option><option value="GPL">GPL-3.0</option></select></div>
    <div style="flex:1"><label>Author / Holder</label><input type="text" id="author" placeholder="Your Name"></div>
    <div style="flex:1"><label>Year</label><input type="text" id="year" value="2026"></div>
  </div>
  <div class="row"><button class="btn btn-primary" onclick="gen()">Generate</button><button class="btn btn-secondary" onclick="copy('out')">Copy</button></div>
  <div id="out" class="result"></div>
</div>
<script src="{{ '/assets/js/tools.js' | relative_url }}"></script>
<script>
var T={
MIT:"MIT License\n\nCopyright (c) {Y} {A}\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the \"Software\"), to deal in the Software without restriction... \nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND.",
BSD:"BSD 3-Clause License\n\nCopyright (c) {Y} {A}\n\nRedistribution and use in source and binary forms, with or without modification, are permitted provided that the conditions are met.\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES ARE DISCLAIMED.",
Apache:"Apache License 2.0\n\nCopyright {Y} {A}\n\nLicensed under the Apache License, Version 2.0. You may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0.\nUnless required by applicable law, software distributed under the License is distributed on an \"AS IS\" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.",
GPL:"GNU GENERAL PUBLIC LICENSE\nVersion 3, {Y}\n\nCopyright (C) {Y} {A}\n\nThis program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation.\nThis program is distributed WITHOUT ANY WARRANTY, without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE."
};
function gen(){var a=byId('author').value||'Your Name';var y=byId('year').value||new Date().getFullYear();byId('out').textContent=T[byId('lic').value].replace(/\{A\}/g,a).replace(/\{Y\}/g,y);}
</script>
