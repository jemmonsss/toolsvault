---
title: "Interlocking Drawer Divider Builder"
link: "/tools/forge-divider/"
description: "Design two matching slot-together walls for a measured drawer, with adjustable compartment counts and fit."
category: "3D Printing"
tags:
  - "3D Printing"
  - "Free STL maker"
  - "divider"
icon: "&#128424;"
---
<link rel="stylesheet" href="{{ '/assets/css/printing.css' | relative_url }}">
<div class="print-tool forge-workbench" data-new-maker="divider">
 <p>Design two matching slot-together walls for a measured drawer, with adjustable compartment counts and fit. <strong>Free local STL export, no login, no subscription, no uploads to our servers.</strong></p>
 <div class="print-cols forge-layout">
 <section class="print-panel"><h2>Modular divider set</h2><div class="print-fields forge-fields"><label>Tool mode<select data-param="mode"><option value="walls">Slotted interlocking walls</option><option value="bin">Open-top bin template</option></select></label><label>Drawer inside width (mm)<input data-param="width" type="number" value="150" min="50" max="250" step="1"></label><label>Drawer inside depth (mm)<input data-param="depth" type="number" value="120" min="50" max="250" step="1"></label><label>Divider wall height (mm)<input data-param="height" type="number" value="35" min="15" max="90" step="1"></label><label>Wall thickness (mm)<input data-param="thickness" type="number" value="2.4" min="1.5" max="4" step=".1"></label><label>Number of column compartments<input data-param="cols" type="number" value="3" min="1" max="7" step="1"></label><label>Number of row compartments<input data-param="rows" type="number" value="3" min="1" max="7" step="1"></label><label>Slot clearance (mm)<input data-param="fit" type="number" value=".3" min=".15" max="1" step=".05"></label><label>Geometry resolution (mm)<input data-param="detail" type="number" value=".55" min=".4" max="1.1" step=".05"></label><label>View current wall<select data-param="part"><option value="long" selected>Long wall</option><option value="cross" >Cross wall</option></select></label></div></section>
 <section class="print-panel"><h2>Generated geometry preview</h2><div class="print-viewport forge-viewport"><canvas id="forge-render" aria-label="Drag to rotate the actual STL triangles"></canvas><div class="print-viewport-label">Drag to rotate · Scroll to zoom</div></div><p class="print-small">Preview shows a triangle sample. The download contains every generated triangle.</p></section>
 </div>
 <p id="forge-status" class="print-msg" role="status" aria-live="polite">Building model…</p>
 <pre id="forge-details" class="forge-instructions"></pre>
 <div class="print-action-row"><button id="forge-export" type="button" class="btn btn-primary" disabled>Download real STL</button><button type="button" class="btn btn-secondary" id="forge-kit" disabled>Download both walls + instructions (ZIP)</button><a href="/printing/" class="btn btn-secondary">All 3D tools</a></div>
 <p class="print-note"><strong>Before you print:</strong> For divider mode: download both wall patterns, print the stated quantities, and slide the matching half-depth notches together. The wall pieces are exported flat for printing. Always check model dimensions, sliced layers and physical fit; watertight geometry does not prove mechanical performance.</p>
</div>
<script src="{{ '/assets/js/print-forge-core.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-pegboard.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-new-generators.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-flexi-convert.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/zip-writer.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-new-ui.js' | relative_url }}" defer></script>
