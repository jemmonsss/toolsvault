---
title: "3D Model Studio"
link: "/tools/3d-model-studio/"
description: "Free STL/OBJ viewer and model preparation: inspect, rotate, scale, check bed fit, repair degenerate faces, export STL."
tags:
  - 3d printing
  - STL
  - OBJ
  - model
  - viewer
category: "3D Printing"
icon: "&#129504;"
---
<link rel="stylesheet" href="{{ '/assets/css/printing.css' | relative_url }}">
<div class="print-tool" id="print-studio">
  <p>Preview and prepare STL/OBJ models <strong>for free</strong>. Files stay on your device. Drag to orbit; use the wheel to zoom.</p>
  <label class="print-upload" for="print-file">Open STL / OBJ model <input type="file" id="print-file" accept=".stl,.obj,model/stl,text/plain"></label>
  <p class="print-msg" id="print-status" role="status" aria-live="polite">Load a model to begin.</p>
  <div class="print-viewport"><canvas id="print-viewer" aria-label="Interactive 3D model preview"></canvas><div class="print-viewport-label">Drag: orbit &middot; Scroll: zoom</div></div>
  <div class="print-action-row"><button type="button" class="btn btn-secondary" id="print-fit">Fit view</button><button type="button" class="btn btn-secondary" id="print-reset">Reset transformations</button><button type="button" class="btn btn-secondary" id="print-clean">Remove degenerate faces</button><button type="button" class="btn btn-primary" id="print-export" disabled>Export STL</button></div>
  <div class="print-cols">
    <section class="print-panel"><h2>Model measurements</h2><dl class="print-stats"><dt>Triangles</dt><dd id="print-faces">—</dd><dt>Size X / Y / Z</dt><dd id="print-dims">—</dd><dt>Surface area</dt><dd id="print-area">—</dd><dt>Enclosed volume</dt><dd id="print-volume">—</dd><dt>Mesh edges</dt><dd id="print-edges">—</dd><dt>Bed fit</dt><dd id="print-bed-result">—</dd></dl><p class="print-small">Volume is only reliable for a closed, consistently oriented mesh. STL dimensions are assumed to be millimeters.</p></section>
    <section class="print-panel"><h2>Transform model</h2><div class="print-fields"><label>Uniform scale (%)<input id="print-scale" type="number" min="0.1" max="10000" step="1" value="100"></label><label>Rotate X (°)<input id="print-rot-x" type="number" step="1" value="0"></label><label>Rotate Y (°)<input id="print-rot-y" type="number" step="1" value="0"></label><label>Rotate Z (°)<input id="print-rot-z" type="number" step="1" value="0"></label><label>Bed X (mm)<input id="print-bed-x" type="number" min="1" value="220"></label><label>Bed Y (mm)<input id="print-bed-y" type="number" min="1" value="220"></label><label>Max height (mm)<input id="print-bed-z" type="number" min="1" value="250"></label></div><p class="print-small">Export centers the model on X/Y and sets its lowest point to Z=0. Rotation and scaling affect both the preview and export.</p></section>
  </div>
  <p class="print-note">This is a model-preparation and inspection tool, not a slicer or automatic manifold repairer. Degenerate-face cleanup removes zero-area triangles only; it cannot seal holes.</p>
</div>
<script src="{{ '/assets/js/print-model.js' | relative_url }}" defer></script>
