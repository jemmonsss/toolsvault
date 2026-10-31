---
title: "Two-Part Mold Maker"
link: "/tools/forge-mold/"
description: "Design matching two-part spherical or puck cavities with guide pins and pour/vent channels."
tags:
  - "3D Printing"
  - "STL generator"
  - "3D mold generator"
category: "3D Printing"
icon: "&#128424;"
---
<link rel="stylesheet" href="{{ '/assets/css/printing.css' | relative_url }}">
<div class="print-tool forge-workbench" data-forge="mold">
 <p>Produce reusable master patterns or simple casting mold blocks with no paywall. <strong>100% free STL exports, no subscription, and files stay in your browser.</strong></p>
 <div class="print-cols forge-layout">
 <section class="print-panel"><h2>Customize</h2><div class="print-fields forge-fields"><label>Cavity style<select id="forge-shape"><option value="ball">Two-part sphere</option><option value="disc">Flat-bottom round puck</option><option value="dome">Rounded shallow dome</option></select></label><label>Block width (mm)<input id="forge-width" type="number" value="65" min="35" max="140" step="1"></label><label>Block depth (mm)<input id="forge-depth" type="number" value="65" min="35" max="140" step="1"></label><label>Cavity radius (mm)<input id="forge-radius" type="number" value="13" min="6" max="48" step="1"></label><label>Block thickness (mm)<input id="forge-block" type="number" value="17" min="9" max="30" step="1"></label><label>Preview one half<select id="forge-part"><option value="a">A · alignment pins</option><option value="b">B · matching holes</option></select></label></div></section>
 <section class="print-panel"><h2>Interactive 3D preview</h2><div class="print-viewport forge-viewport"><canvas id="forge-render" aria-label="Rotate the generated 3D preview"></canvas><div class="print-viewport-label">Drag to rotate · Scroll to zoom</div></div><p class="print-small" id="forge-preview-note">Preview is rendered locally; exports contain full-resolution geometry.</p></section>
 </div>
 <p class="print-msg" id="forge-status" role="status" aria-live="polite">Building your design…</p>
 <pre id="forge-details" class="forge-instructions" aria-live="polite"></pre>
 <div class="print-action-row"><button type="button" class="btn btn-primary" id="forge-export" disabled>Download current STL</button><button type="button" class="btn btn-secondary" id="forge-kit" disabled>Download complete STL kit (ZIP)</button><a class="btn btn-secondary" href="/printing/">All 3D tools</a></div>
 <p class="print-note">The cavity halves are intended for suitable non-heated casting or silicone mold making; not certified for food safety, molten metal, hot resin, pressure molding, or injection molding. Mold halves require careful alignment and release planning. These are independent ToolsVault tools. STL dimensions are millimeters; test fit, slice, and inspect layers before printing. No cloud processing or paid exports.</p>
</div>
<script src="{{ '/assets/js/print-forge-core.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-forge-extra.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/zip-writer.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-forge-ui.js' | relative_url }}" defer></script>
