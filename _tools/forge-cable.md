---
title: "Modular Cable Protector Maker"
link: "/tools/forge-cable/"
description: "Snap-on vented cable sleeves with repeatable friction-fit ends, adjustable clearances and low-filament print geometry."
category: "3D Printing"
tags:
  - "3D Printing"
  - "Free STL maker"
  - "cable"
icon: "&#128424;"
---
<link rel="stylesheet" href="{{ '/assets/css/printing.css' | relative_url }}">
<div class="print-tool forge-workbench" data-new-maker="cable">
 <p>Snap-on vented cable sleeves with repeatable friction-fit ends, adjustable clearances and low-filament print geometry. <strong>Free local STL export, no login, no subscription, no uploads to our servers.</strong></p>
 <div class="print-cols forge-layout">
 <section class="print-panel"><h2>Cable size &amp; link design</h2><div class="print-fields forge-fields"><label>Cable outside diameter (mm)<input data-param="dia" type="number" value="7" min="2" max="18" step=".5"></label><label>Sleeve wall thickness (mm)<input data-param="wall" type="number" value="2" min="0.9" max="2.4" step=".1"></label><label>Each modular link length (mm)<input data-param="length" type="number" value="17" min="9" max="32" step="1"></label><label>Cable snap-in slit width (mm)<input data-param="slot" type="number" value="3" min="1.8" max="6" step=".2"></label><label>Sliding joint clearance (mm)<input data-param="fit" type="number" value=".3" min=".2" max=".9" step=".05"></label><label>Geometry resolution (mm)<input data-param="detail" type="number" value=".45" min=".35" max="1" step=".05"></label><label class="forge-check"><input data-param="vent" type="checkbox" checked> Material-saving side openings</label></div></section>
 <section class="print-panel"><h2>Generated geometry preview</h2><div class="print-viewport forge-viewport"><canvas id="forge-render" aria-label="Drag to rotate the actual STL triangles"></canvas><div class="print-viewport-label">Drag to rotate · Scroll to zoom</div></div><p class="print-small">Preview shows a triangle sample. The download contains every generated triangle.</p></section>
 </div>
 <p id="forge-status" class="print-msg" role="status" aria-live="polite">Building model…</p>
 <pre id="forge-details" class="forge-instructions"></pre>
 <div class="print-action-row"><button id="forge-export" type="button" class="btn btn-primary" disabled>Download real STL</button><a href="/printing/" class="btn btn-secondary">All 3D tools</a></div>
 <p class="print-note"><strong>Before you print:</strong> Make one sleeve segment, copy it in your slicer, and slide segments together. Short links and side windows use less filament than a full solid tube. This is a friction-fit protector, not a certified strain-relief device. Always check model dimensions, sliced layers and physical fit; watertight geometry does not prove mechanical performance.</p>
</div>
<script src="{{ '/assets/js/print-forge-core.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-pegboard.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-new-generators.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-flexi-convert.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/zip-writer.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-new-ui.js' | relative_url }}" defer></script>
