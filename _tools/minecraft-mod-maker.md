---
title: "Minecraft Content Pack Maker"
link: "/tools/minecraft-content-pack-maker/"
description: "Design custom items, recipes, loot tables, advancements, and more. Export a complete datapack + resource pack zip — entirely in your browser."
tags:
  - minecraft
  - datapack
  - resource-pack
  - content-pack
  - maker
category: "Minecraft"
games_only: true
icon: "&#128736;"
---

<link rel="stylesheet" href="{{ '/assets/css/tpm.css' | relative_url }}?v={{ site.time | date: '%Y%m%d%H%M' }}">

<div class="tui tpm">
    <h1>Minecraft Content Pack Maker</h1>
    <p class="sub">Design custom items, recipes, loot tables, advancements, and more. Export a complete datapack + resource pack zip — entirely in your browser.</p>

    <div class="tpm-savebar">
      <button class="btn btn-secondary tpm-sm" id="tpm-save" type="button" title="Save this project in your browser">Save</button>
      <button class="btn btn-secondary tpm-sm" id="tpm-load" type="button" title="Load the last saved project">Load saved</button>
      <button class="btn btn-secondary tpm-sm" id="tpm-export-project" type="button" title="Download a project file to share or back up">Export file</button>
      <button class="btn btn-secondary tpm-sm" id="tpm-import" type="button" title="Import a saved project file">Import</button>
      <input type="file" id="tpm-import-file" accept="application/json,.json" hidden>
      <button class="btn btn-secondary tpm-sm" id="tpm-clear-project" type="button" title="Remove the saved project from this browser">Delete save</button>
      <span class="tpm-saved" id="tpm-saved-label" hidden></span>
    </div>

  <div class="tpm-bar">
    <div class="tpm-field">
      <label for="tpm-name">Pack name</label>
      <input type="text" id="tpm-name" value="My Content Pack" maxlength="48">
    </div>
    <div class="tpm-field">
      <label for="tpm-format">pack_format</label>
      <select id="tpm-format">
        <option value="61">61 — 1.21.5+</option>
        <option value="48">48 — 1.21.2–1.21.4</option>
        <option value="41" selected>41 — 1.21</option>
        <option value="32">32 — 1.20.5–1.20.6</option>
        <option value="26">26 — 1.20.4</option>
        <option value="18">18 — 1.20.2–1.20.3</option>
      </select>
    </div>
    <div class="tpm-field tpm-field-grow">
      <label for="tpm-desc">Description</label>
      <input type="text" id="tpm-desc" value="My custom content pack">
    </div>
    <div class="tpm-field">
      <label for="tpm-namespace">Namespace</label>
      <input type="text" id="tpm-namespace" value="mypack" maxlength="16">
    </div>
  </div>

  <div class="tabs" role="tablist">
    <button class="tab active" data-tab="editor" role="tab" aria-selected="true" aria-controls="tab-editor">Editor</button>
    <button class="tab" data-tab="files" role="tab" aria-selected="false" aria-controls="tab-files">Files</button>
    <button class="tab" data-tab="preview" role="tab" aria-selected="false" aria-controls="tab-preview">Preview</button>
    <button class="tab" data-tab="export" role="tab" aria-selected="false" aria-controls="tab-export">Export</button>
  </div>

  <!-- Global status toast -->
  <div class="tpm-status" id="tpm-status" role="status" aria-live="polite" hidden></div>

  <!-- EDITOR -->
  <section class="panel active" id="tab-editor">
    <div class="tpm-layout">
      <aside class="tpm-tree" id="tpm-tree">
        <div class="tpm-tree-head">
          <input type="text" id="tpm-tree-search" placeholder="Search content…">
        </div>
        <div class="tpm-tree-body" id="tpm-tree-body">
          <p class="tpm-empty">No content yet. Click "+ New" to add items, recipes, and more.</p>
        </div>
      </aside>

      <div class="tpm-main">
        <div class="tpm-toolbar">
          <div class="tpm-tools">
            <button class="btn btn-primary tpm-sm" id="tpm-new-content" type="button" title="Add new content">+ New</button>
            <button class="btn btn-secondary tpm-sm" id="tpm-load-template" type="button" title="Load a built-in template">Templates</button>
            <button class="btn btn-secondary tpm-sm" id="tpm-delete-content" type="button" title="Delete selected content">Delete</button>
          </div>
          <div class="tpm-tool-opts">
            <button class="btn btn-secondary tpm-sm" id="tpm-mode-toggle" type="button" title="Switch between Simple and Code mode">Simple mode: off</button>
            <span class="tpm-validity" id="tpm-validity"></span>
          </div>
        </div>

        <div class="tpm-embed-wrap" id="tpm-embed-wrap">
          <!-- Inline new-content form (shown by + New) -->
          <div class="tpm-form" id="tpm-new-form" hidden>
            <div class="tpm-form-row">
              <div class="tpm-field">
                <label for="tpm-new-name">Name</label>
                <input type="text" id="tpm-new-name" value="custom_item" maxlength="64">
              </div>
              <div class="tpm-field">
                <label for="tpm-new-type">Type</label>
                <select id="tpm-new-type">
                  <option value="items">Item</option>
                  <option value="recipes">Recipe</option>
                  <option value="loot_tables">Loot Table</option>
                  <option value="advancements">Advancement</option>
                  <option value="predicates">Predicate</option>
                  <option value="functions">Function</option>
                  <option value="tags">Tag</option>
                </select>
              </div>
              <div class="tpm-form-actions">
                <button class="btn btn-primary tpm-sm" id="tpm-new-confirm" type="button">Create</button>
                <button class="btn btn-secondary tpm-sm" id="tpm-new-cancel" type="button">Cancel</button>
              </div>
            </div>
          </div>

          <!-- Inline template picker (shown by Templates) -->
          <div class="tpm-form" id="tpm-template-form" hidden>
            <div class="tpm-template-grid" id="tpm-template-grid"></div>
            <div class="tpm-form-actions">
              <button class="btn btn-secondary tpm-sm" id="tpm-template-close" type="button">Close</button>
            </div>
          </div>
        </div>

        <div class="tpm-editor-wrap" id="tpm-editor-wrap">
          <div class="tpm-editor-header" id="tpm-editor-header">
            <span class="tpm-editor-filename" id="tpm-editor-filename">No content selected</span>
          </div>
          <textarea id="tpm-editor" class="tpm-editor" spellcheck="false" placeholder="Select or create content to edit…"></textarea>
          <div class="tpm-simple" id="tpm-simple" hidden>
            <div class="tpm-simple-header">Simple editor — fill in the fields and the code updates automatically.</div>
            <div class="tpm-simple-body" id="tpm-simple-body"></div>
          </div>
        </div>

        <div class="tpm-dropzone" id="tpm-drop">
          <p>Drag & drop textures here, or
            <button class="btn btn-secondary tpm-sm" id="tpm-upload-btn">Upload texture</button>
            <input type="file" id="tpm-upload" accept="image/png,image/*" hidden>
          </p>
          <p class="tpm-hint" style="margin-top:.5rem">Upload item/block textures to include in your resource pack.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- FILES -->
  <section class="panel" id="tab-files">
    <div class="tpm-filebar">
      <button class="btn btn-secondary" id="tpm-new-blank">+ New content</button>
      <button class="btn btn-secondary" id="tpm-load-template-files">Templates</button>
      <span class="tpm-count" id="tpm-file-count">0 items</span>
    </div>
    <div class="tpm-filelist" id="tpm-filelist">
      <p class="tpm-empty">No content yet. Create some in the Editor tab.</p>
    </div>
  </section>

  <!-- PREVIEW -->
  <section class="panel" id="tab-preview">
    <div class="tpm-preview-list" id="tpm-preview-list">
      <p class="tpm-empty">Add content to see a live preview here.</p>
    </div>
  </section>

  <!-- EXPORT -->
  <section class="panel" id="tab-export">
    <div class="tpm-export">
      <div class="tpm-export-col">
        <h3>Content Pack</h3>
        <p class="tpm-muted">Packages your datapack (<code>data/</code>) and resource pack (<code>assets/</code>) into a downloadable <code>.zip</code>.</p>
        <button class="btn btn-primary" id="tpm-export-zip">Download .zip</button>
        <button class="btn btn-secondary" id="tpm-export-datapack">Download datapack only</button>
        <button class="btn btn-secondary" id="tpm-export-resource">Download resource pack only</button>
      </div>
      <div class="tpm-export-col">
        <h3>pack.mcmeta preview</h3>
        <pre class="tpm-json" id="tpm-meta-preview"></pre>
      </div>
    </div>
  </section>
</div>

<script src="{{ '/assets/js/zip-writer.js' | relative_url }}?v={{ site.time | date: '%Y%m%d%H%M' }}" defer></script>
<script src="{{ '/assets/js/tpm.js' | relative_url }}?v={{ site.time | date: '%Y%m%d%H%M' }}" defer></script>