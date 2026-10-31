---
title: "Multi-Color Filament Art Maker"
link: "/tools/forge-color-art/"
description: "Convert an uploaded image into 2–5 tonal layers with a real printable STL and filament swap schedule."
tags:
  - "3D Printing"
  - "STL generator"
  - "Multi color artwork"
category: "3D Printing"
icon: "&#128424;"
---
<link rel="stylesheet" href="{{ '/assets/css/printing.css' | relative_url }}">
<div class="print-tool forge-workbench" data-forge="color-art">
 <p>Create layered artwork using sequential filament changes without multi-material hardware. <strong>100% free STL exports, no subscription, and files stay in your browser.</strong></p>
 <label class="print-upload">Upload image (JPG, PNG, or WebP) — required <input id="forge-file" type="file" accept="image/png,image/jpeg,image/webp"></label>
 <canvas id="forge-source" class="forge-source" aria-label="Source artwork preview"></canvas>
 <div class="print-cols forge-layout">
 <section class="print-panel"><h2>Customize</h2><div class="print-fields forge-fields"><label>Art width (mm)<input id="forge-width" type="number" value="110" min="40" max="200" step="1"></label><label>Number of filament colors<input id="forge-levels" type="number" value="4" min="2" max="5" step="1"></label><label>Base layer (mm)<input id="forge-base" type="number" value="0.8" min="0.6" max="2.4" step="0.2"></label><label>Each color band (mm)<input id="forge-layer" type="number" value="0.6" min="0.4" max="1.6" step="0.2"></label><label>Color 1 name<input id="forge-c1" type="text" value="Black" maxlength="24"></label><label>Color 2 name<input id="forge-c2" type="text" value="Dark gray" maxlength="24"></label><label>Color 3 name<input id="forge-c3" type="text" value="Light gray" maxlength="24"></label><label>Color 4 name<input id="forge-c4" type="text" value="White" maxlength="24"></label><label>Color 5 name<input id="forge-c5" type="text" value="Accent" maxlength="24"></label></div></section>
 <section class="print-panel"><h2>Interactive 3D preview</h2><div class="print-viewport forge-viewport"><canvas id="forge-render" aria-label="Rotate the generated 3D preview"></canvas><div class="print-viewport-label">Drag to rotate · Scroll to zoom</div></div><p class="print-small" id="forge-preview-note">Preview is rendered locally; exports contain full-resolution geometry.</p></section>
 </div>
 <p class="print-msg" id="forge-status" role="status" aria-live="polite">Building your design…</p>
 <pre id="forge-details" class="forge-instructions" aria-live="polite"></pre>
 <div class="print-action-row"><button type="button" class="btn btn-primary" id="forge-export" disabled>Download current STL</button><button type="button" class="btn btn-secondary" id="forge-kit" disabled>Download complete STL kit (ZIP)</button><a class="btn btn-secondary" href="/printing/">All 3D tools</a></div>
 <p class="print-note">This builds tonal height-based art with manual Z-height filament changes, not hue-accurate full-color prints or a slicer replacement. Height transitions must be compatible with your slicer layer height. These are independent ToolsVault tools. STL dimensions are millimeters; test fit, slice, and inspect layers before printing. No cloud processing or paid exports.</p>
</div>
<script src="{{ '/assets/js/print-forge-core.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-forge-extra.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/zip-writer.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-forge-ui.js' | relative_url }}" defer></script>
