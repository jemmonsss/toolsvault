---
title: "G-code Analyzer"
link: "/tools/gcode-analyzer/"
description: "Free local G-code file analyzer for filament use, layer count, print bounds, and idealized motion time."
tags:
  - 3d printing
  - gcode
  - filament
  - print analysis
category: "3D Printing"
icon: "&#128203;"
---
<link rel="stylesheet" href="{{ '/assets/css/printing.css' | relative_url }}">
<div class="print-tool" id="gcode-analyzer">
<p>Analyze <strong>G-code locally</strong> with no account, upload server, or usage limits. Supports common Marlin/RepRap-style G0/G1, G90/G91, M82/M83, and G92 commands.</p>
<label class="print-upload" for="gc-file">Open .gcode / .gco file <input id="gc-file" type="file" accept=".gcode,.gco,.gc,text/plain"></label>
<p id="gc-status" class="print-msg" role="status" aria-live="polite">Choose a G-code file to analyze.</p>
<div class="print-cols">
<section class="print-panel"><h2>Material &amp; cost</h2><div class="print-fields"><label>Filament diameter (mm)<input type="number" min="0.1" step="0.01" id="gc-diameter" value="1.75"></label><label>Density (g/cm³)<input type="number" min="0.1" step="0.01" id="gc-density" value="1.24"></label><label>Spool price<input type="number" min="0" step="0.01" id="gc-price" value="20"></label><label>Spool weight (g)<input type="number" min="1" step="1" id="gc-spool" value="1000"></label></div></section>
<section class="print-panel"><h2>File analysis</h2><dl class="print-stats"><dt>Moves</dt><dd id="gc-moves">—</dd><dt>Extruding layers</dt><dd id="gc-layers">—</dd><dt>XY print area</dt><dd id="gc-bounds">—</dd><dt>Max print height</dt><dd id="gc-height">—</dd><dt>Extruded filament</dt><dd id="gc-length">—</dd><dt>Filament weight</dt><dd id="gc-weight">—</dd><dt>Material cost</dt><dd id="gc-cost">—</dd><dt>Ideal motion time</dt><dd id="gc-time">—</dd></dl><button id="gc-report" class="btn btn-primary" type="button" disabled>Download CSV report</button></section>
</div>
<p class="print-note">Time is a simplified feedrate calculation, not a machine or slicer time estimate (no acceleration, heating, dwell, or firmware timing). Extrusion figures assume E values measure filament in millimeters, not volumetric extrusion. Always verify with your printer and slicer.</p>
</div>
<script src="{{ '/assets/js/print-gcode.js' | relative_url }}" defer></script>
