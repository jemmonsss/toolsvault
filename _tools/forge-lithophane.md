---
title: "Photo Lithophane Maker"
link: "/tools/forge-lithophane/"
description: "Create flat or curved light-through lithophanes from your own photos. Free printable STL."
tags:
  - "lithophane"
  - "photo"
  - "image"
  - "STL"
category: "3D Printing"
icon: "&#128424;"
---
<link rel="stylesheet" href="{{ '/assets/css/printing.css' | relative_url }}">
<div class="print-tool forge-workbench" data-forge="lithophane">
 <p>Upload a photo and create a solid lithophane whose varying thickness transmits light to reveal the picture. Make a flat panel or curved lamp insert. <strong>Free, private, no account, no credits.</strong></p>
 <label class="print-upload">Upload your picture (JPG, PNG, WebP) <input id="forge-file" type="file" accept="image/png,image/jpeg,image/webp"></label>
 <canvas id="forge-source" class="forge-source" aria-label="Uploaded image preview"></canvas>
 <div class="print-cols forge-layout">
 <section class="print-panel"><h2>Customize your design</h2><div class="print-fields forge-fields"><label>Photo width (mm)<input id="forge-width" type="number" value="120" min="30" max="250" step="1"></label><label>Light-area thickness (mm)<input id="forge-min" type="number" value="0.8" min="0.6" max="5" step=".1"></label><label>Dark-area thickness (mm)<input id="forge-max" type="number" value="3" min="0.8" max="7" step=".1"></label><label>Curve angle (0 = flat)<select id="forge-arc"><option value="0">Flat panel</option><option value="45">45° curve</option><option value="90">90° curve</option><option value="135">135° curve</option><option value="180">180° half cylinder</option></select></label><label class="forge-check"><input id="forge-invert" type="checkbox"> Invert tones</label></div></section>
 <section class="print-panel"><h2>3D preview</h2><div class="print-viewport forge-viewport"><canvas id="forge-render" aria-label="Drag-to-rotate 3D model preview"></canvas><div class="print-viewport-label">Drag to rotate · Scroll to zoom</div></div><p class="print-small" id="forge-preview-note">Preview is rendered in your browser. STL export contains the full geometry.</p></section>
 </div>
 <p class="print-msg" role="status" aria-live="polite" id="forge-status">Preparing your design…</p>
 <div class="print-action-row"><button type="button" class="btn btn-primary" disabled id="forge-export">Download printable STL</button><a class="btn btn-secondary" href="/printing/">All 3D tools</a></div>
 <p class="print-note">For best contrast, use a clean high-contrast image and translucent white filament. Lithophanes are normally printed upright. Curved panels may need a stand or support. Files stay on this device. STL has no built-in unit metadata; generated dimensions are in millimeters. Always inspect the exported model and its sliced layers before printing.</p>
</div>
<script src="{{ '/assets/js/print-forge-core.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-forge-ui.js' | relative_url }}" defer></script>
