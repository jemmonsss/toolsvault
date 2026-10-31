---
title: "Fit & Tolerance Test Kit"
link: "/tools/forge-tolerance/"
description: "A printable stepped fit gauge with six matching pins and progressive hole clearances."
category: "3D Printing"
tags:
  - "3D Printing"
  - "Free STL maker"
  - "tolerance"
icon: "&#128424;"
---
<link rel="stylesheet" href="{{ '/assets/css/printing.css' | relative_url }}">
<div class="print-tool forge-workbench" data-new-maker="tolerance">
 <p>A printable stepped fit gauge with six matching pins and progressive hole clearances. <strong>Free local STL export, no login, no subscription, no uploads to our servers.</strong></p>
 <div class="print-cols forge-layout">
 <section class="print-panel"><h2>Test coupon dimensions</h2><div class="print-fields forge-fields"><label>Test pin diameter (mm)<input data-param="peg" type="number" value="5" min="2.5" max="12" step=".5"></label><label>Smallest total clearance (mm)<input data-param="start" type="number" value=".1" min="0" max=".9" step=".05"></label><label>Clearance increment (mm)<input data-param="increment" type="number" value=".1" min=".05" max=".3" step=".05"></label><label>Base thickness (mm)<input data-param="base" type="number" value="2.4" min="1.6" max="5" step=".2"></label><label>Geometry resolution (mm)<input data-param="detail" type="number" value=".4" min=".4" max=".9" step=".05"></label></div></section>
 <section class="print-panel"><h2>Generated geometry preview</h2><div class="print-viewport forge-viewport"><canvas id="forge-render" aria-label="Drag to rotate the actual STL triangles"></canvas><div class="print-viewport-label">Drag to rotate · Scroll to zoom</div></div><p class="print-small">Preview shows a triangle sample. The download contains every generated triangle.</p></section>
 </div>
 <p id="forge-status" class="print-msg" role="status" aria-live="polite">Building model…</p>
 <pre id="forge-details" class="forge-instructions"></pre>
 <div class="print-action-row"><button id="forge-export" type="button" class="btn btn-primary" disabled>Download real STL</button><a href="/printing/" class="btn btn-secondary">All 3D tools</a></div>
 <p class="print-note"><strong>Before you print:</strong> Print all six pairs from the same filament and orientation, and physically compare the holes and pins. This is a print calibration gauge rather than a slicer tolerance guarantee. Always check model dimensions, sliced layers and physical fit; watertight geometry does not prove mechanical performance.</p>
</div>
<script src="{{ '/assets/js/print-forge-core.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-pegboard.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-new-generators.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-flexi-convert.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/zip-writer.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-new-ui.js' | relative_url }}" defer></script>
