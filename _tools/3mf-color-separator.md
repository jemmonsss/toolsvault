---
title: "3MF Color & Material Separator"
link: "/tools/3mf-color-separator/"
description: "Separate closed, multi-material 3MF solid bodies by color and download aligned individual STL files, completely free."
tags:
  - "3D Printing"
  - "3MF"
  - "Color separation"
category: "3D Printing"
icon: "&#127912;"
---
<link rel="stylesheet" href="{{ '/assets/css/printing.css' | relative_url }}">
<div class="print-tool forge-workbench" id="color-separator">
 <p>Extract independently printable color/material <strong>solid bodies</strong> from a standard 3MF file and keep every piece at its original position. Download individual STLs or one ZIP kit. No cloud uploads, paid credits or subscription.</p>
 <label class="print-upload">Select a 3MF file (max 40 MB)<input id="colors-file" type="file" accept=".3mf,model/3mf,application/vnd.ms-package.3dmanufacturing-3dmodel+xml"></label>
 <div class="print-cols forge-layout"><section class="print-panel"><h2>Detected print parts</h2><p class="print-small">Only closed, watertight color solids are downloadable. Separating colors painted on the <em>surface of a single mesh</em> generally creates holes, so we will flag these instead of exporting broken STLs.</p><div id="colors-parts" class="color-part-list"></div></section>
 <section class="print-panel"><h2>Part preview</h2><div class="print-viewport forge-viewport"><canvas id="colors-preview" aria-label="Preview of the selected material part"></canvas><div class="print-viewport-label">Drag to rotate · Scroll to zoom</div></div><p class="print-small" id="colors-preview-caption">Load a 3MF with individually modeled color bodies.</p></section></div>
 <p class="print-msg" id="colors-status" role="status" aria-live="polite">Choose a 3MF file to analyze its color regions.</p>
 <div class="print-action-row"><button type="button" class="btn btn-primary" id="colors-zip" disabled>Download all valid color parts (ZIP)</button><button type="button" class="btn btn-secondary" id="colors-report" disabled>Download compatibility report</button><a href="/printing/" class="btn btn-secondary">All 3D tools</a></div>
 <p class="print-note">Supports standard 3MF Core <strong>base materials</strong> and <strong>color groups</strong>, including build components and object transforms. Exports keep original millimeter-aligned positions, so parts overlay in your slicer. Unsupported: texture painting, arbitrary color gradients, many slicer-specific project/paint extensions, and color separation into independently solid parts when the original has only differently colored surface triangles. ZIP extraction uses your browser's built-in deflate support. This is a mesh separator, not an automatic full-color-to-multibody reconstruction engine.</p>
</div>
<script src="{{ '/assets/js/print-forge-core.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/zip-writer.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-color-separator.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/print-color-separator-ui.js' | relative_url }}" defer></script>
