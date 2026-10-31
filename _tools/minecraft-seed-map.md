---
title: "Minecraft Seed Map"
link: "/tools/minecraft-seed-map/"
description: "Explore Java seeds with correct coordinate navigation and slime chunks, plus deterministic structure placement candidates and a clearly labeled schematic terrain backdrop."
tags:
  - minecraft
  - seed
  - map
  - biome
  - structures
  - worldgen
category: "Minecraft"
icon: "&#128506;"
games_only: true
---

<link rel="stylesheet" href="{{ '/assets/css/smap.css' | relative_url }}?v={{ site.time | date: '%Y%m%d%H%M' }}">

<div class="tui smap">
  <h1>Minecraft Seed Map</h1>
  <p class="sub">Explore Java Edition seeds with pan, zoom, chunk grid, exact slime chunks, and seed-derived structure placement <strong>candidates</strong>. The terrain backdrop is <strong>illustrative, not actual biome data</strong> until an accurate worldgen engine is bundled.</p>

  <div class="smap-bar">
    <div class="smap-field">
      <label for="smap-seed">Seed</label>
      <input type="text" id="smap-seed" value="123456789" placeholder="Enter seed...">
    </div>
    <div class="smap-field">
      <label for="smap-version">Java version (candidate presets)</label>
      <select id="smap-version">
        <option value="1.21.5">1.21.5+</option>
        <option value="1.21.2">1.21.2–1.21.4</option>
        <option value="1.21">1.21</option>
        <option value="1.20.5">1.20.5–1.20.6</option>
        <option value="1.20.4">1.20.4</option>
        <option value="1.20.2">1.20.2–1.20.3</option>
        <option value="1.20">1.20–1.20.1</option>
        <option value="1.19.4">1.19.4</option>
        <option value="1.19.3">1.19.3</option>
        <option value="1.19">1.19</option>
        <option value="1.18.2">1.18.2</option>
        <option value="1.17">1.17</option>
        <option value="1.16.2">1.16.2–1.16.5</option>
      </select>
    </div>
    <div class="smap-field">
      <label for="smap-dimension">Dimension</label>
      <select id="smap-dimension">
        <option value="overworld">Overworld</option>
        <option value="nether">Nether</option>
        <option value="end">End</option>
      </select>
    </div>
    <div class="smap-field">
      <label for="smap-scale">Scale</label>
      <select id="smap-scale">
        <option value="1">1x (closest)</option>
        <option value="2">2x</option>
        <option value="4" selected>4x</option>
        <option value="8">8x</option>
        <option value="16">16x</option>
        <option value="32">32x (farthest)</option>
      </select>
    </div>
    <div class="smap-field">
      <label for="smap-jump-x">Go to X</label><input id="smap-jump-x" type="number" step="1" value="0">
    </div>
    <div class="smap-field">
      <label for="smap-jump-z">Go to Z</label><input id="smap-jump-z" type="number" step="1" value="0">
    </div>
    <div class="smap-field">
      <label>&nbsp;</label>
      <div class="smap-toggles">
        <label class="smap-toggle"><input type="checkbox" id="smap-structures" checked> Structures</label>
        <label class="smap-toggle"><input type="checkbox" id="smap-slime"> Slime chunks</label>
        <label class="smap-toggle"><input type="checkbox" id="smap-grid"> Grid</label>
      </div>
    </div>
    <div class="smap-actions">
      <button class="btn btn-primary" id="smap-generate" type="button">Generate Map</button>
      <button class="btn btn-secondary" id="smap-random" type="button">Random Seed</button>
      <button class="btn btn-secondary" id="smap-jump" type="button">Go to coordinates</button>
      <button class="btn btn-secondary" id="smap-share" type="button">Copy map link</button>
      <button class="btn btn-secondary" id="smap-download" type="button">Download PNG</button>
    </div>
  </div>

  <div class="smap-status" id="smap-status" role="status" aria-live="polite" hidden></div>

  <div class="smap-wrap">
    <div class="smap-canvas-wrap" id="smap-canvas-wrap">
      <canvas id="smap-canvas"></canvas>
      <canvas id="smap-overlay-canvas"></canvas>
      <div class="smap-overlay" id="smap-overlay">
        <div class="smap-coords" id="smap-coords">X: 0 Z: 0</div>
        <div class="smap-zoom-controls">
          <button class="btn btn-secondary smap-sm" id="smap-zoom-in" type="button">+</button>
          <button class="btn btn-secondary smap-sm" id="smap-zoom-out" type="button">−</button>
          <button class="btn btn-secondary smap-sm" id="smap-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="smap-minimap" id="smap-minimap">
        <canvas id="smap-minimap-canvas"></canvas>
        <div class="smap-minimap-viewport" id="smap-minimap-viewport"></div>
      </div>
    </div>
  </div>

  <div class="smap-legend" id="smap-legend">
    <div class="smap-legend-title">Illustrative terrain colors (NOT biome predictions)</div>
    <div class="smap-legend-items" id="smap-legend-items"></div>
    <p class="smap-warning">Structure markers show deterministic generation <strong>attempts</strong>. Biome suitability, terrain checks, special exclusions, and dimension rules are not verified. Check positions in-game before relying on them. Java only; this does not represent Bedrock.</p>
    <div class="smap-legend-title" style="margin-top:.75rem">Structure candidates</div>
    <div class="smap-legend-items" id="smap-struct-legend"></div>
    <div class="smap-legend-title" style="margin-top:.75rem">Hover info</div>
    <div class="smap-legend-items" id="smap-info">Hover for coordinates, click to pin a location.</div>
  </div>
</div>

<script src="{{ '/assets/js/smap.js' | relative_url }}?v={{ site.time | date: '%Y%m%d%H%M' }}" defer></script>
