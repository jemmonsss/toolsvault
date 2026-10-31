---
title: "Personalized Name & Keychain Maker"
link: "/tools/forge-nameplate/"
description: "Generate custom embossed name tags and keychains with a real keyring hole."
tags:
  - "nameplate"
  - "keychain"
  - "text"
  - "STL"
category: "3D Printing"
icon: "&#128424;"
---
<link rel="stylesheet" href="{{ '/assets/css/printing.css' | relative_url }}">
<div class="print-tool forge-workbench" data-forge="nameplate">
 <p>Type a name or short message and export a printable raised-letter tag. Optionally add a real through-hole for a key ring. <strong>Free, private, no account, no credits.</strong></p>
 <div class="print-cols forge-layout">
 <section class="print-panel"><h2>Customize your design</h2><div class="print-fields forge-fields"><label>Custom name or message<input id="forge-text" type="text" maxlength="32" value="MAKER"></label><label>Tag width (mm)<input id="forge-width" type="number" value="85" min="45" max="180" step="1"></label><label>Tag height (mm)<input id="forge-height" type="number" value="26" min="18" max="70" step="1"></label><label class="forge-check"><input id="forge-hole" type="checkbox" checked> Add keyring hole (5 mm)</label></div></section>
 <section class="print-panel"><h2>3D preview</h2><div class="print-viewport forge-viewport"><canvas id="forge-render" aria-label="Drag-to-rotate 3D model preview"></canvas><div class="print-viewport-label">Drag to rotate · Scroll to zoom</div></div><p class="print-small" id="forge-preview-note">Preview is rendered in your browser. STL export contains the full geometry.</p></section>
 </div>
 <p class="print-msg" role="status" aria-live="polite" id="forge-status">Preparing your design…</p>
 <div class="print-action-row"><button type="button" class="btn btn-primary" disabled id="forge-export">Download printable STL</button><a class="btn btn-secondary" href="/printing/">All 3D tools</a></div>
 <p class="print-note">A raised single-color tag is generated. To make lettering another color, add a filament change at the raised-text layer in your slicer. Files stay on this device. STL has no built-in unit metadata; generated dimensions are in millimeters. Always inspect the exported model and its sliced layers before printing.</p>
</div>
<script src="{{ '/assets/js/print-forge-core.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-forge-ui.js' | relative_url }}" defer></script>
