---
title: "Filament & Print Cost Calculator"
link: "/tools/filament-calculator/"
description: "Free estimate of filament grams, meters, print cost, and time using dimensions and printer settings."
tags:
  - 3d printing
  - filament
  - cost
  - calculator
category: "3D Printing"
icon: "&#129525;"
---
<link rel="stylesheet" href="{{ '/assets/css/printing.css' | relative_url }}">
<div class="print-tool" id="fil-calc">
<p>Quickly estimate filament use and cost for a box-shaped model envelope. Everything updates as you type; there is no paywall or sign-in.</p>
<div class="print-cols">
<section class="print-panel"><h2>Model &amp; print settings</h2><div class="print-fields">
<label>Width X (mm)<input id="fil-x" type="number" value="60" min="1" step="1"></label>
<label>Depth Y (mm)<input id="fil-y" type="number" value="40" min="1" step="1"></label>
<label>Height Z (mm)<input id="fil-z" type="number" value="30" min="1" step="1"></label>
<label>Infill (%)<input id="fil-infill" type="number" value="20" min="0" max="100" step="1"></label>
<label>Wall thickness (mm)<input id="fil-wall" type="number" value="1.2" min="0" step="0.1"></label>
<label>Top/bottom thickness (mm)<input id="fil-top" type="number" value="0.8" min="0" step="0.1"></label>
<label>Support / waste (%)<input id="fil-waste" type="number" value="10" min="0" max="500" step="1"></label>
<label>Filament diameter (mm)<select id="fil-diameter"><option value="1.75">1.75</option><option value="2.85">2.85</option></select></label>
<label>Material<select id="fil-material"><option value="1.24">PLA (1.24 g/cm³)</option><option value="1.27">PETG (1.27 g/cm³)</option><option value="1.04">ABS (1.04 g/cm³)</option><option value="1.14">Nylon (1.14 g/cm³)</option><option value="1.21">TPU (1.21 g/cm³)</option><option value="custom">Custom density</option></select></label>
<label>Density (g/cm³)<input id="fil-density" type="number" min="0.1" step="0.01" value="1.24"></label>
<label>Spool price (your currency)<input id="fil-price" type="number" min="0" step="0.01" value="20"></label>
<label>Spool weight (g)<input id="fil-spool" type="number" min="1" step="1" value="1000"></label>
<label>Effective flow (mm³/s)<input id="fil-flow" type="number" min="0.1" step="0.1" value="4"></label>
</div></section>
<section class="print-panel"><h2>Estimated result</h2><dl class="print-stats"><dt>Plastic volume</dt><dd id="fil-volume">—</dd><dt>Filament weight</dt><dd id="fil-grams">—</dd><dt>Filament length</dt><dd id="fil-meters">—</dd><dt>Material cost</dt><dd id="fil-cost">—</dd><dt>Extrusion time minimum</dt><dd id="fil-time">—</dd><dt>Spool remaining</dt><dd id="fil-left">—</dd></dl><button id="fil-copy" class="btn btn-primary" type="button">Copy estimate</button><p class="print-small">This is a <strong>bounding-box approximation</strong>, not a slicer estimate. Curved or hollow models can use much less material. Actual print time depends heavily on speed, travel, acceleration, supports and machine.</p></section>
</div>
</div>
<script src="{{ '/assets/js/print-filament.js' | relative_url }}" defer></script>
