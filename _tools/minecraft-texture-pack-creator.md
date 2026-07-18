---
title: "Minecraft Texture Pack Creator"
link: "/tools/minecraft-texture-pack-creator/"
description: "Design, edit, preview, and export Minecraft resource-pack textures directly in your browser."
tags:
  - minecraft
  - texture
  - resource-pack
  - editor
  - zip
category: "Minecraft"
icon: "&#127959;"
---

<link rel="stylesheet" href="{{ '/assets/css/tpc.css' | relative_url }}">

<div class="tui tpc">
  <h1>Minecraft Texture Pack Creator</h1>
  <p class="sub">Design, edit, preview, and export a valid Minecraft resource pack — entirely in your browser.</p>

  <div class="tpc-bar">
    <div class="tpc-field">
      <label for="tpc-name">Pack name</label>
      <input type="text" id="tpc-name" value="My Texture Pack" maxlength="48">
    </div>
    <div class="tpc-field">
      <label for="tpc-format">pack_format</label>
      <select id="tpc-format">
        <option value="48">48 — 1.21.5+</option>
        <option value="42">42 — 1.21.2–1.21.4</option>
        <option value="34" selected>34 — 1.21</option>
        <option value="32">32 — 1.20.5–1.20.6</option>
        <option value="26">26 — 1.20.4</option>
        <option value="22">22 — 1.20.2–1.20.3</option>
        <option value="18">18 — 1.19.4</option>
        <option value="15">15 — 1.19.3</option>
        <option value="13">13 — 1.19.1–1.19.2</option>
        <option value="9">9 — 1.18.2</option>
        <option value="8">8 — 1.18–1.18.1</option>
        <option value="7">7 — 1.17–1.17.1</option>
        <option value="6">6 — 1.16.2–1.16.5</option>
      </select>
    </div>
    <div class="tpc-field tpc-field-grow">
      <label for="tpc-desc">Description (supports <span style="color:var(--accent)">§</span> codes)</label>
      <input type="text" id="tpc-desc" value="§6My custom textures">
    </div>
  </div>

  <div class="tabs" role="tablist">
    <button class="tab active" data-tab="editor" role="tab" aria-selected="true" aria-controls="tab-editor">Editor</button>
    <button class="tab" data-tab="files" role="tab" aria-selected="false" aria-controls="tab-files">Files</button>
    <button class="tab" data-tab="preview" role="tab" aria-selected="false" aria-controls="tab-preview">Preview</button>
    <button class="tab" data-tab="export" role="tab" aria-selected="false" aria-controls="tab-export">Export</button>
  </div>

  <!-- Global status toast (visible on every tab) -->
  <div class="tpc-status" id="tpc-status" role="status" aria-live="polite" hidden></div>

  <!-- EDITOR -->
  <section class="panel active" id="tab-editor">
    <div class="tpc-layout">
      <aside class="tpc-tree" id="tpc-tree">
        <div class="tpc-tree-head">
          <input type="text" id="tpc-tree-search" placeholder="Search textures…">
        </div>
        <div class="tpc-tree-body" id="tpc-tree-body"></div>
      </aside>

      <div class="tpc-main">
        <div class="tpc-toolbar">
          <div class="tpc-tools">
            <button class="tpc-tool active" data-tool="pencil" title="Pencil (B)">✏️</button>
            <button class="tpc-tool" data-tool="eraser" title="Eraser (E)">🧽</button>
            <button class="tpc-tool" data-tool="fill" title="Fill (G)">🪣</button>
            <button class="tpc-tool" data-tool="picker" title="Eyedropper (I)">💉</button>
            <button class="tpc-tool" data-tool="line" title="Line">📏</button>
            <button class="tpc-tool" data-tool="rect" title="Rectangle">▭</button>
          </div>
          <div class="tpc-tool-opts">
            <label class="tpc-inline">Size
              <select id="tpc-brush"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>6</option><option>8</option></select>
            </label>
            <label class="tpc-inline">Zoom
              <input type="range" id="tpc-zoom" min="4" max="32" value="16">
            </label>
            <label class="tpc-inline"><input type="checkbox" id="tpc-grid" checked> Grid</label>
            <button class="btn btn-secondary tpc-sm" id="tpc-undo" title="Undo (Ctrl+Z)">↶</button>
            <button class="btn btn-secondary tpc-sm" id="tpc-redo" title="Redo (Ctrl+Y)">↷</button>
            <button class="btn btn-secondary tpc-sm" id="tpc-clear">Clear</button>
          </div>
        </div>

        <div class="tpc-canvas-wrap">
          <div class="tpc-canvas-box">
            <div class="tpc-canvas-stage" id="tpc-stage">
              <canvas id="tpc-canvas" width="16" height="16"></canvas>
              <div class="tpc-grid-overlay" id="tpc-grid-overlay"></div>
            </div>
          </div>
          <div class="tpc-colorbar">
            <label class="tpc-inline">Color
              <input type="color" id="tpc-color" value="#8b5cf6">
            </label>
            <div class="tpc-swatches" id="tpc-swatches"></div>
            <div class="tpc-vanilla" id="tpc-vanilla" hidden>
              <span class="tpc-vanilla-label">Vanilla reference</span>
              <img id="tpc-vanilla-img" alt="Vanilla texture reference" crossorigin="anonymous">
              <button class="btn btn-secondary tpc-sm" id="tpc-load-vanilla" type="button">Edit this texture</button>
            </div>
            <p class="tpc-hint" id="tpc-slot-hint">Select a texture on the left to begin.</p>
          </div>
        </div>

        <div class="tpc-dropzone" id="tpc-drop">
          <p>Drop a <strong>.png</strong> here, or
            <button class="btn btn-secondary tpc-sm" id="tpc-upload-btn">Upload to selected slot</button>
            <input type="file" id="tpc-upload" accept="image/png,image/*" hidden>
          </p>
          <p class="tpc-hint" style="margin-top:.5rem">Vanilla textures are loaded live from a public CDN and are <strong>not</strong> hosted on this site.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- FILES -->
  <section class="panel" id="tab-files">
    <div class="tpc-filebar">
      <button class="btn btn-secondary" id="tpc-import-folder">Import folder…</button>
      <input type="file" id="tpc-folder" webkitdirectory directory multiple hidden>
      <button class="btn btn-secondary" id="tpc-new-blank">+ New blank texture</button>
      <span class="tpc-count" id="tpc-file-count">0 textures</span>
    </div>
    <div class="tpc-filelist" id="tpc-filelist">
      <p class="tpc-empty">No textures yet. Pick a slot in the Editor and upload or draw one.</p>
    </div>
  </section>

  <!-- PREVIEW -->
  <section class="panel" id="tab-preview">
    <div class="tpc-preview-grid" id="tpc-preview-grid">
      <p class="tpc-empty">Add textures to see a live preview here.</p>
    </div>
  </section>

  <!-- EXPORT -->
  <section class="panel" id="tab-export">
    <div class="tpc-export">
      <div class="tpc-export-col">
        <h3>Resource pack</h3>
        <p class="tpc-muted">Packages <code>pack.mcmeta</code>, an optional <code>pack.png</code> icon,
          and every texture under <code>assets/minecraft/…</code> into a downloadable <code>.zip</code>.</p>
        <div class="tpc-field">
          <label for="tpc-icon">Pack icon (from slot)</label>
          <select id="tpc-icon"><option value="">None</option></select>
        </div>
        <button class="btn btn-primary" id="tpc-export-zip">⬇ Download .zip</button>
        <button class="btn btn-secondary" id="tpc-export-meta">Download pack.mcmeta only</button>
      </div>
      <div class="tpc-export-col">
        <h3>pack.mcmeta preview</h3>
        <pre class="tpc-json" id="tpc-meta-preview"></pre>
      </div>
    </div>
  </section>
</div>

<script src="{{ '/assets/js/zip-writer.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/tpc.js' | relative_url }}" defer></script>
