---
title: "Logo to STL & Cookie Cutter"
link: "/tools/forge-logo/"
description: "Turn a logo or drawing into a printable sign, stamp or cookie cutter. No paid exports."
tags:
  - "cookie cutter"
  - "logo"
  - "magnet"
  - "stamp"
category: "3D Printing"
icon: "&#128424;"
---
<link rel="stylesheet" href="{{ '/assets/css/printing.css' | relative_url }}">
<div class="print-tool forge-workbench" data-forge="logo">
 <p>Turn black-and-white artwork into a 3D raised sign, embossing plate, or cutting outline. For a cookie cutter, use a solid, high-contrast silhouette. <strong>Free, private, no account, no credits.</strong></p>
 <label class="print-upload">Upload your picture (JPG, PNG, WebP) <input id="forge-file" type="file" accept="image/png,image/jpeg,image/webp"></label>
 <canvas id="forge-source" class="forge-source" aria-label="Uploaded image preview"></canvas>
 <div class="print-cols forge-layout">
 <section class="print-panel"><h2>Customize your design</h2><div class="print-fields forge-fields"><label>Model width (mm)<input id="forge-width" type="number" value="80" min="30" max="190" step="1"></label><label>Dark-pixel threshold<input id="forge-threshold" type="number" value="150" min="0" max="255" step="1"></label><label>Type of project<select id="forge-mode"><option value="sign">Raised logo sign</option><option value="stamp">Embossed stamp plate</option><option value="cutter">Cookie cutter silhouette</option></select></label><label class="forge-check"><input id="forge-invert" type="checkbox"> Invert foreground/background</label></div></section>
 <section class="print-panel"><h2>3D preview</h2><div class="print-viewport forge-viewport"><canvas id="forge-render" aria-label="Drag-to-rotate 3D model preview"></canvas><div class="print-viewport-label">Drag to rotate · Scroll to zoom</div></div><p class="print-small" id="forge-preview-note">Preview is rendered in your browser. STL export contains the full geometry.</p></section>
 </div>
 <p class="print-msg" role="status" aria-live="polite" id="forge-status">Preparing your design…</p>
 <div class="print-action-row"><button type="button" class="btn btn-primary" disabled id="forge-export">Download printable STL</button><a class="btn btn-secondary" href="/printing/">All 3D tools</a></div>
 <p class="print-note">Detailed photographs do not make good cookie cutters: use a simple connected silhouette. The cutter has a wider grip ring and a taller cutting wall; inspect small isolated shapes. Files stay on this device. STL has no built-in unit metadata; generated dimensions are in millimeters. Always inspect the exported model and its sliced layers before printing.</p>
</div>
<script src="{{ '/assets/js/print-forge-core.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-forge-ui.js' | relative_url }}" defer></script>
