---
title: "Threaded Bolt & Nut Factory"
link: "/tools/forge-fasteners/"
description: "Create custom helical threaded bolts and matching nuts with tunable print clearances."
tags:
  - "bolt"
  - "nut"
  - "thread"
  - "mechanical"
category: "3D Printing"
icon: "&#128424;"
---
<link rel="stylesheet" href="{{ '/assets/css/printing.css' | relative_url }}">
<div class="print-tool forge-workbench" data-forge="fasteners">
 <p>Generate real helical threaded geometry—not just smooth cylinders. Download the bolt, switch to matching nut, and download that STL too. <strong>Free, private, no account, no credits.</strong></p>
 <div class="print-cols forge-layout">
 <section class="print-panel"><h2>Customize your design</h2><div class="print-fields forge-fields"><label>Nominal thread diameter (mm)<input id="forge-dia" type="number" value="8" min="3" max="30" step=".5"></label><label>Thread pitch (mm)<input id="forge-pitch" type="number" value="1.25" min="0.5" max="5" step=".05"></label><label>Bolt shaft length (mm)<input id="forge-length" type="number" value="25" min="6" max="120" step="1"></label><label>Bolt head height (mm)<input id="forge-head" type="number" value="5" min="2" max="15" step="1"></label><label>Nut thickness (mm)<input id="forge-nut-height" type="number" value="7" min="3" max="22" step="1"></label><label>Radial thread clearance (mm)<input id="forge-clearance" type="number" value="0.3" min="0.05" max="0.8" step=".05"></label><label>Preview / export part<select id="forge-part"><option value="bolt">Bolt</option><option value="nut">Matching nut</option></select></label></div></section>
 <section class="print-panel"><h2>3D preview</h2><div class="print-viewport forge-viewport"><canvas id="forge-render" aria-label="Drag-to-rotate 3D model preview"></canvas><div class="print-viewport-label">Drag to rotate · Scroll to zoom</div></div><p class="print-small" id="forge-preview-note">Preview is rendered in your browser. STL export contains the full geometry.</p></section>
 </div>
 <p class="print-msg" role="status" aria-live="polite" id="forge-status">Preparing your design…</p>
 <div class="print-action-row"><button type="button" class="btn btn-primary" disabled id="forge-export">Download printable STL</button><a class="btn btn-secondary" href="/printing/">All 3D tools</a></div>
 <p class="print-note">Threads are approximate printable profiles, not certified ISO fasteners. Clearances depend on your printer and material. Never use printed fasteners for safety-critical loads. Files stay on this device. STL has no built-in unit metadata; generated dimensions are in millimeters. Always inspect the exported model and its sliced layers before printing.</p>
</div>
<script src="{{ '/assets/js/print-forge-core.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-forge-ui.js' | relative_url }}" defer></script>
