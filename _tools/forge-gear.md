---
title: "Gear & Pulley Factory"
link: "/tools/forge-gear/"
description: "Make custom spur gears and generic toothed pulleys with center bores, real involute flank geometry and optional pulley flanges."
tags:
  - "3D Printing"
  - "STL generator"
  - "Gear generator"
category: "3D Printing"
icon: "&#128424;"
---
<link rel="stylesheet" href="{{ '/assets/css/printing.css' | relative_url }}">
<div class="print-tool forge-workbench" data-forge="gear">
 <p>Machine parts, replacement gears and printable drives. <strong>100% free STL exports, no subscription, and files stay in your browser.</strong></p>
 <div class="print-cols forge-layout">
 <section class="print-panel"><h2>Customize</h2><div class="print-fields forge-fields"><label>Part type<select id="forge-mode"><option value="gear">Involute spur gear</option><option value="pulley">Toothed pulley (generic)</option></select></label><label>Number of teeth<input id="forge-teeth" type="number" value="24" min="12" max="100" step="1"></label><label>Gear module (mm)<input id="forge-module" type="number" value="2" min="0.8" max="5" step="0.1"></label><label>Pulley tooth pitch (mm)<input id="forge-pitch" type="number" value="2" min="2" max="8" step="0.2"></label><label>Part thickness (mm)<input id="forge-thickness" type="number" value="8" min="3" max="24" step="0.2"></label><label>Shaft hole diameter (mm)<input id="forge-bore" type="number" value="5" min="2" max="40" step="0.2"></label><label class="forge-check"><input type="checkbox" id="forge-flange" checked> Add end flanges (pulley mode)</label></div></section>
 <section class="print-panel"><h2>Interactive 3D preview</h2><div class="print-viewport forge-viewport"><canvas id="forge-render" aria-label="Rotate the generated 3D preview"></canvas><div class="print-viewport-label">Drag to rotate · Scroll to zoom</div></div><p class="print-small" id="forge-preview-note">Preview is rendered locally; exports contain full-resolution geometry.</p></section>
 </div>
 <p class="print-msg" id="forge-status" role="status" aria-live="polite">Building your design…</p>
 <pre id="forge-details" class="forge-instructions" aria-live="polite"></pre>
 <div class="print-action-row"><button type="button" class="btn btn-primary" id="forge-export" disabled>Download current STL</button><a class="btn btn-secondary" href="/printing/">All 3D tools</a></div>
 <p class="print-note">Gear dimensions are nominal, with a 20° pressure angle on spur gears. Printed gears require backlash and clearance checks. Pulley teeth are a generic, non-certified profile; do not assume an exact GT2 belt fit. These are independent ToolsVault tools. STL dimensions are millimeters; test fit, slice, and inspect layers before printing. No cloud processing or paid exports.</p>
</div>
<script src="{{ '/assets/js/print-forge-core.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-forge-extra.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/zip-writer.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-forge-ui.js' | relative_url }}" defer></script>
