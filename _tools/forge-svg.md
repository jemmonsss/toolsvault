---
title: "Precision SVG-to-STL Extruder"
link: "/tools/forge-svg/"
description: "Upload a vector SVG to generate printable raised lettering, line art, logos, inlays and filled shapes."
category: "3D Printing"
tags:
  - "3D Printing"
  - "Free STL maker"
  - "svg"
icon: "&#128424;"
---
<link rel="stylesheet" href="{{ '/assets/css/printing.css' | relative_url }}">
<div class="print-tool forge-workbench" data-new-maker="svg">
 <p>Upload a vector SVG to generate printable raised lettering, line art, logos, inlays and filled shapes. <strong>Free local STL export, no login, no subscription, no uploads to our servers.</strong></p>
 <div class="print-cols forge-layout">
 <section class="print-panel"><h2>Artwork extrusion settings</h2><div class="print-fields forge-fields"><label>Finished artwork width (mm)<input data-param="width" type="number" value="95" min="15" max="210" step="1"></label><label>Extrusion thickness (mm)<input data-param="height" type="number" value="3" min="1.2" max="20" step=".2"></label><label>SVG upload<input type="file" id="forge-upload" accept=".svg,image/svg+xml"></label></div></section>
 <section class="print-panel"><h2>Generated geometry preview</h2><div class="print-viewport forge-viewport"><canvas id="forge-render" aria-label="Drag to rotate the actual STL triangles"></canvas><div class="print-viewport-label">Drag to rotate · Scroll to zoom</div></div><p class="print-small">Preview shows a triangle sample. The download contains every generated triangle.</p></section>
 </div>
 <p id="forge-status" class="print-msg" role="status" aria-live="polite">Building model…</p>
 <pre id="forge-details" class="forge-instructions"></pre>
 <div class="print-action-row"><button id="forge-export" type="button" class="btn btn-primary" disabled>Download real STL</button><a href="/printing/" class="btn btn-secondary">All 3D tools</a></div>
 <p class="print-note"><strong>Before you print:</strong> Uses a local rasterized SVG mask for consistent filled silhouettes with inner cutouts. Precision depends on pixel sampling and model size. No accounts or uploads to servers. Always check model dimensions, sliced layers and physical fit; watertight geometry does not prove mechanical performance.</p>
</div>
<script src="{{ '/assets/js/print-forge-core.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-pegboard.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-new-generators.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-flexi-convert.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/zip-writer.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-new-ui.js' | relative_url }}" defer></script>
