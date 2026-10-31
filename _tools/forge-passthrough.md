---
title: "Cable Gland & Panel Cutout Maker"
link: "/tools/forge-passthrough/"
description: "Create measured cable pass-through grommets and slit-style bushings with flange and fit control."
category: "3D Printing"
tags:
  - "3D Printing"
  - "Free STL maker"
  - "passthrough"
icon: "&#128424;"
---
<link rel="stylesheet" href="{{ '/assets/css/printing.css' | relative_url }}">
<div class="print-tool forge-workbench" data-new-maker="passthrough">
 <p>Create measured cable pass-through grommets and slit-style bushings with flange and fit control. <strong>Free local STL export, no login, no subscription, no uploads to our servers.</strong></p>
 <div class="print-cols forge-layout">
 <section class="print-panel"><h2>Panel passthrough</h2><div class="print-fields forge-fields"><label>Cable diameter (mm)<input data-param="cable" type="number" value="7" min="2" max="22" step=".5"></label><label>Panel thickness (mm)<input data-param="panel" type="number" value="3" min="1" max="8" step=".5"></label><label>Panel fit clearance (mm)<input data-param="clearance" type="number" value=".4" min=".15" max="1" step=".05"></label><label>Flange rim width (mm)<input data-param="flange" type="number" value="3" min="2" max="7" step=".5"></label><label>Geometry resolution (mm)<input data-param="detail" type="number" value=".4" min=".35" max=".85" step=".05"></label><label>Style<select data-param="type"><option value="split" selected>Side-entry slit</option><option value="grommet" >Full ring</option></select></label></div></section>
 <section class="print-panel"><h2>Generated geometry preview</h2><div class="print-viewport forge-viewport"><canvas id="forge-render" aria-label="Drag to rotate the actual STL triangles"></canvas><div class="print-viewport-label">Drag to rotate · Scroll to zoom</div></div><p class="print-small">Preview shows a triangle sample. The download contains every generated triangle.</p></section>
 </div>
 <p id="forge-status" class="print-msg" role="status" aria-live="polite">Building model…</p>
 <pre id="forge-details" class="forge-instructions"></pre>
 <div class="print-action-row"><button id="forge-export" type="button" class="btn btn-primary" disabled>Download real STL</button><button type="button" class="btn btn-secondary" id="forge-cutout">Download 1:1 cutout SVG</button><a href="/printing/" class="btn btn-secondary">All 3D tools</a></div>
 <p class="print-note"><strong>Before you print:</strong> Print a cable routing bushing designed for a measured panel. It is not an IP-rated waterproof gland and should not be used as an electrical safety component. Always check model dimensions, sliced layers and physical fit; watertight geometry does not prove mechanical performance.</p>
</div>
<script src="{{ '/assets/js/print-forge-core.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-pegboard.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-new-generators.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-flexi-convert.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/zip-writer.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-new-ui.js' | relative_url }}" defer></script>
