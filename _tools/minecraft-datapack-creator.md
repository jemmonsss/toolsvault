---
title: "Minecraft Datapack Creator"
link: "/tools/minecraft-datapack-creator/"
description: "Author, validate, and export Minecraft datapacks (functions, recipes, advancements, and more) in your browser."
tags:
  - minecraft
  - datapack
  - functions
  - json
  - editor
  - zip
category: "Minecraft"
icon: "&#128190;"
---

<link rel="stylesheet" href="{{ '/assets/css/tpd.css' | relative_url }}?v={{ site.time | date: '%Y%m%d%H%M' }}">

<div class="tui tpd">
    <h1>Minecraft Datapack Creator</h1>
    <p class="sub">Author, validate, and export Minecraft datapacks (functions, recipes, advancements, loot tables, and more) — entirely in your browser.</p>

    <div class="tpd-savebar">
      <button class="btn btn-secondary tpd-sm" id="tpd-save" type="button" title="Save this project in your browser">Save</button>
      <button class="btn btn-secondary tpd-sm" id="tpd-load" type="button" title="Load the last saved project">Load saved</button>
      <button class="btn btn-secondary tpd-sm" id="tpd-export-project" type="button" title="Download a project file to share or back up">Export file</button>
      <button class="btn btn-secondary tpd-sm" id="tpd-import" type="button" title="Import a saved project file">Import</button>
      <input type="file" id="tpd-import-file" accept="application/json,.json" hidden>
      <button class="btn btn-secondary tpd-sm" id="tpd-clear-project" type="button" title="Remove the saved project from this browser">Delete save</button>
      <span class="tpd-saved" id="tpd-saved-label" hidden></span>
    </div>

  <div class="tpd-bar">
    <div class="tpd-field">
      <label for="tpd-name">Pack name</label>
      <input type="text" id="tpd-name" value="My Datapack" maxlength="48">
    </div>
    <div class="tpd-field">
      <label for="tpd-format">pack_format</label>
      <select id="tpd-format">
        <option value="61">61 — 1.21.5+</option>
        <option value="48">48 — 1.21.2–1.21.4</option>
        <option value="41">41 — 1.21</option>
        <option value="32">32 — 1.20.5–1.20.6</option>
        <option value="26">26 — 1.20.4</option>
        <option value="18">18 — 1.20.2–1.20.3</option>
        <option value="15">15 — 1.20–1.20.1</option>
        <option value="12">12 — 1.19.4</option>
        <option value="11">11 — 1.19.3</option>
        <option value="10">10 — 1.19</option>
        <option value="9">9 — 1.18.2</option>
        <option value="8">8 — 1.18.1</option>
        <option value="7">7 — 1.18</option>
        <option value="6">6 — 1.17</option>
        <option value="5">5 — 1.16.2–1.16.5</option>
      </select>
    </div>
    <div class="tpd-field tpd-field-grow">
      <label for="tpd-desc">Description</label>
      <input type="text" id="tpd-desc" value="My custom datapack">
    </div>
    <div class="tpd-field">
      <label for="tpd-namespace">Default namespace</label>
      <input type="text" id="tpd-namespace" value="minecraft" maxlength="16">
    </div>
  </div>

  <div class="tabs" role="tablist">
    <button class="tab active" data-tab="editor" role="tab" aria-selected="true" aria-controls="tab-editor">Editor</button>
    <button class="tab" data-tab="files" role="tab" aria-selected="false" aria-controls="tab-files">Files</button>
    <button class="tab" data-tab="preview" role="tab" aria-selected="false" aria-controls="tab-preview">Preview</button>
    <button class="tab" data-tab="export" role="tab" aria-selected="false" aria-controls="tab-export">Export</button>
  </div>

  <!-- Global status toast (visible on every tab) -->
  <div class="tpd-status" id="tpd-status" role="status" aria-live="polite" hidden></div>

  <!-- EDITOR -->
  <section class="panel active" id="tab-editor">
    <div class="tpd-layout">
      <aside class="tpd-tree" id="tpd-tree">
        <div class="tpd-tree-head">
          <input type="text" id="tpd-tree-search" placeholder="Search files…">
        </div>
        <div class="tpd-tree-body" id="tpd-tree-body">
          <p class="tpd-empty-tree">No files yet. Use "New file" to add one.</p>
        </div>
      </aside>

      <div class="tpd-main">
        <div class="tpd-toolbar">
          <div class="tpd-tools">
            <button class="btn btn-primary tpd-sm" id="tpd-new-file" type="button" title="Create a new datapack file">+ New file</button>
            <button class="btn btn-secondary tpd-sm" id="tpd-load-template" type="button" title="Load a built-in pack template">Load template</button>
          </div>
          <div class="tpd-tool-opts">
            <button class="btn btn-secondary tpd-sm" id="tpd-validate" type="button" title="Validate the current file">Validate</button>
            <button class="btn btn-secondary tpd-sm" id="tpd-pretty" type="button" title="Pretty-print JSON">Pretty print</button>
            <button class="btn btn-secondary tpd-sm" id="tpd-delete-file" type="button" title="Delete the current file">Delete</button>
            <span class="tpd-validity" id="tpd-validity"></span>
          </div>
        </div>

        <div class="tpd-editor-wrap">
          <div class="tpd-editor-box">
            <div class="tpd-editor-header" id="tpd-editor-header">
              <span class="tpd-editor-filename" id="tpd-editor-filename">No file selected</span>
            </div>
            <textarea id="tpd-editor" class="tpd-editor" spellcheck="false" placeholder="Select a file or create a new one to start editing…"></textarea>
          </div>
        </div>

        <div class="tpd-dropzone" id="tpd-drop">
          <p>Drop a <strong>.json</strong> or <strong>.mcfunction</strong> here, or
            <button class="btn btn-secondary tpd-sm" id="tpd-upload-btn">Upload file</button>
            <input type="file" id="tpd-upload" accept=".json,.mcfunction,text/plain,application/json" hidden>
          </p>
          <p class="tpd-hint" style="margin-top:.5rem">Files are parsed as text and added to the datapack tree.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- FILES -->
  <section class="panel" id="tab-files">
    <div class="tpd-filebar">
      <button class="btn btn-secondary" id="tpd-new-blank">+ New file</button>
      <button class="btn btn-secondary" id="tpd-load-template-files">Load template</button>
      <span class="tpd-count" id="tpd-file-count">0 files</span>
    </div>
    <div class="tpd-filelist" id="tpd-filelist">
      <p class="tpc-empty">No files yet. Create one in the Editor tab.</p>
    </div>
  </section>

  <!-- PREVIEW -->
  <section class="panel" id="tab-preview">
    <div class="tpd-preview-list" id="tpd-preview-list">
      <p class="tpc-empty">Add files to see a live preview here.</p>
    </div>
  </section>

  <!-- EXPORT -->
  <section class="panel" id="tab-export">
    <div class="tpd-export">
      <div class="tpd-export-col">
        <h3>Datapack</h3>
        <p class="tpd-muted">Packages <code>pack.mcmeta</code> and every file under <code>data/&lt;namespace&gt;/…</code> into a downloadable <code>.zip</code>.</p>
        <button class="btn btn-primary" id="tpd-export-zip">{%- include tpc/download.svg -%} Download .zip</button>
        <button class="btn btn-secondary" id="tpd-export-meta">Download pack.mcmeta only</button>
      </div>
      <div class="tpd-export-col">
        <h3>pack.mcmeta preview</h3>
        <pre class="tpd-json" id="tpd-meta-preview"></pre>
      </div>
    </div>
  </section>
</div>
<script src="{{ '/assets/js/zip-writer.js' | relative_url }}?v={{ site.time | date: '%Y%m%d%H%M' }}" defer></script>

<script src="{{ '/assets/js/tpd.js' | relative_url }}?v={{ site.time | date: '%Y%m%d%H%M' }}" defer></script>
