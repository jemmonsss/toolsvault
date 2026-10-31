---
title: "LED Lightbox Maker"
link: "/tools/forge-lightbox/"
description: "Create custom illuminated sign face panels and matching LED housings as a free two-STL project."
tags:
  - "3D Printing"
  - "STL generator"
  - "LED lightbox generator"
category: "3D Printing"
icon: "&#128424;"
---
<link rel="stylesheet" href="{{ '/assets/css/printing.css' | relative_url }}">
<div class="print-tool forge-workbench" data-forge="lightbox">
 <p>Sign text or upload simple dark-on-white artwork. Download a complete printable lightbox kit. <strong>100% free STL exports, no subscription, and files stay in your browser.</strong></p>
 <label class="print-upload">Upload image (JPG, PNG, or WebP) — optional when using text <input id="forge-file" type="file" accept="image/png,image/jpeg,image/webp"></label>
 <canvas id="forge-source" class="forge-source" aria-label="Source artwork preview"></canvas>
 <div class="print-cols forge-layout">
 <section class="print-panel"><h2>Customize</h2><div class="print-fields forge-fields"><label>Face design<select id="forge-mode"><option value="text">Custom text</option><option value="image">Uploaded artwork</option></select></label><label>Sign lettering<input id="forge-text" type="text" value="MAKER" maxlength="24"></label><label>Outside width (mm)<input id="forge-width" type="number" value="125" min="55" max="230" step="1"></label><label>Outside height (mm)<input id="forge-height" type="number" value="82" min="40" max="180" step="1"></label><label>Case depth (mm)<input id="forge-depth" type="number" value="21" min="12" max="35" step="1"></label><label>Case wall (mm)<input id="forge-wall" type="number" value="3.2" min="2.4" max="5" step="0.2"></label><label>Preview one part<select id="forge-part"><option value="panel">Front diffuser / text panel</option><option value="housing">LED housing / back</option></select></label></div></section>
 <section class="print-panel"><h2>Interactive 3D preview</h2><div class="print-viewport forge-viewport"><canvas id="forge-render" aria-label="Rotate the generated 3D preview"></canvas><div class="print-viewport-label">Drag to rotate · Scroll to zoom</div></div><p class="print-small" id="forge-preview-note">Preview is rendered locally; exports contain full-resolution geometry.</p></section>
 </div>
 <p class="print-msg" id="forge-status" role="status" aria-live="polite">Building your design…</p>
 <pre id="forge-details" class="forge-instructions" aria-live="polite"></pre>
 <div class="print-action-row"><button type="button" class="btn btn-primary" id="forge-export" disabled>Download current STL</button><button type="button" class="btn btn-secondary" id="forge-kit" disabled>Download complete STL kit (ZIP)</button><a class="btn btn-secondary" href="/printing/">All 3D tools</a></div>
 <p class="print-note">The face and case are individual, printable STLs; they fit with a nominal clearance and are intended to be fixed with tape or adhesive, not snap-fit. Use low-voltage, low-heat LEDs only; never enclose mains wiring. These are independent ToolsVault tools. STL dimensions are millimeters; test fit, slice, and inspect layers before printing. No cloud processing or paid exports.</p>
</div>
<script src="{{ '/assets/js/print-forge-core.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-forge-extra.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/zip-writer.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-forge-ui.js' | relative_url }}" defer></script>
