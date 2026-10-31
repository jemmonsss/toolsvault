---
title: "Flexi Toy & Jointed Snake Builder"
link: "/tools/forge-flexi/"
description: "Generate configurable articulated toy parts as STLs: head, tail, middle links, and hinge pins."
tags:
  - "3D Printing"
  - "STL generator"
  - "Articulated toy builder"
category: "3D Printing"
icon: "&#128424;"
---
<link rel="stylesheet" href="{{ '/assets/css/printing.css' | relative_url }}">
<div class="print-tool forge-workbench" data-forge="flexi">
 <p>Print the individual components, then assemble an articulated snake or chain. <strong>100% free STL exports, no subscription, and files stay in your browser.</strong></p>
 <div class="print-cols forge-layout">
 <section class="print-panel"><h2>Customize</h2><div class="print-fields forge-fields"><label>Total snake segments<input id="forge-segments" type="number" value="8" min="3" max="40" step="1"></label><label>Body width (mm)<input id="forge-size" type="number" value="14" min="12" max="30" step="0.5"></label><label>Joint center spacing (mm)<input id="forge-spacing" type="number" value="22" min="14" max="36" step="0.5"></label><label>Hinge hole (mm)<input id="forge-hole" type="number" value="3.6" min="3" max="5" step="0.1"></label><label>Each segment thickness (mm)<input id="forge-thickness" type="number" value="3.2" min="2.8" max="6" step="0.2"></label><label>Preview / export part<select id="forge-part"><option value="link">Middle segment</option><option value="head">Head segment</option><option value="tail">Tail segment</option><option value="pin">Loose hinge pin</option></select></label></div></section>
 <section class="print-panel"><h2>Interactive 3D preview</h2><div class="print-viewport forge-viewport"><canvas id="forge-render" aria-label="Rotate the generated 3D preview"></canvas><div class="print-viewport-label">Drag to rotate · Scroll to zoom</div></div><p class="print-small" id="forge-preview-note">Preview is rendered locally; exports contain full-resolution geometry.</p></section>
 </div>
 <p class="print-msg" id="forge-status" role="status" aria-live="polite">Building your design…</p>
 <pre id="forge-details" class="forge-instructions" aria-live="polite"></pre>
 <div class="print-action-row"><button type="button" class="btn btn-primary" id="forge-export" disabled>Download current STL</button><button type="button" class="btn btn-secondary" id="forge-kit" disabled>Download complete STL kit (ZIP)</button><a class="btn btn-secondary" href="/printing/">All 3D tools</a></div>
 <p class="print-note">This is a modular assembly kit, not a print-in-place flexi animal. Pins are not captive by themselves: retain them with a suitable fastener, adhesive, or another mechanically tested method. Check clearances and child safety. These are independent ToolsVault tools. STL dimensions are millimeters; test fit, slice, and inspect layers before printing. No cloud processing or paid exports.</p>
</div>
<script src="{{ '/assets/js/print-forge-core.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-forge-extra.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/zip-writer.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-forge-ui.js' | relative_url }}" defer></script>
