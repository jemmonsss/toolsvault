---
title: "Minecraft Modpack Creator"
link: "/tools/minecraft-mod-maker/"
description: "Search compatible Modrinth mods, manage overrides, validate dependencies, and export a standards-compliant .mrpack modpack."
tags:
  - minecraft
  - modpack
  - modrinth
  - fabric
  - neoforge
  - forge
  - quilt
  - mrpack
category: "Minecraft"
games_only: true
icon: "&#128736;"
---

<link rel="stylesheet" href="{{ '/assets/css/tpm.css' | relative_url }}?v={{ site.time | date: '%Y%m%d%H%M' }}">

<div class="tui tpm">
  <h1>Minecraft Modpack Creator</h1>
  <p class="sub">Build a real Modrinth <code>.mrpack</code>: find compatible mods, resolve required dependencies, add config files, validate the manifest, and export locally.</p>

  <div class="tpm-callout"><strong>Privacy:</strong> projects and override files stay in your browser. Mod searches call the public Modrinth API; no account or token is required.</div>

  <div class="tpm-savebar">
    <button class="btn btn-secondary tpm-sm" id="tpm-save" type="button">Save</button>
    <button class="btn btn-secondary tpm-sm" id="tpm-load" type="button">Load saved</button>
    <button class="btn btn-secondary tpm-sm" id="tpm-export-project" type="button">Export project</button>
    <button class="btn btn-secondary tpm-sm" id="tpm-import-project" type="button">Import project</button>
    <input type="file" id="tpm-import-project-file" accept="application/json,.json" hidden>
    <button class="btn btn-secondary tpm-sm" id="tpm-import-pack" type="button">Import .mrpack</button>
    <input type="file" id="tpm-import-pack-file" accept=".mrpack,.zip,application/zip" hidden>
    <button class="btn btn-secondary tpm-sm" id="tpm-clear" type="button">New project</button>
    <span class="tpm-saved" id="tpm-saved-label" hidden></span>
  </div>

  <div class="tpm-meta-grid">
    <div class="tpm-field"><label for="tpm-name">Pack name</label><input id="tpm-name" value="My Modpack" maxlength="80"></div>
    <div class="tpm-field"><label for="tpm-version-id">Version ID</label><input id="tpm-version-id" value="1.0.0" maxlength="40"></div>
    <div class="tpm-field"><label for="tpm-minecraft">Minecraft version</label><input id="tpm-minecraft" value="26.2" list="tpm-mc-versions"><datalist id="tpm-mc-versions"><option value="26.2"><option value="26.1"><option value="1.21.11"><option value="1.21.9"><option value="1.21.6"><option value="1.21.5"><option value="1.21.4"><option value="1.21.1"><option value="1.20.6"><option value="1.20.1"></datalist></div>
    <div class="tpm-field"><label for="tpm-loader">Mod loader</label><select id="tpm-loader"><option value="fabric">Fabric</option><option value="neoforge">NeoForge</option><option value="forge">Forge</option><option value="quilt">Quilt</option><option value="minecraft">Vanilla / no loader</option></select></div>
    <div class="tpm-field"><label for="tpm-loader-version">Loader version</label><input id="tpm-loader-version" placeholder="Required for modded packs"></div>
    <div class="tpm-field tpm-field-wide"><label for="tpm-summary">Summary</label><input id="tpm-summary" value="A custom Minecraft modpack" maxlength="250"></div>
  </div>

  <div class="tabs" role="tablist">
    <button class="tab active" data-tab="mods" role="tab" aria-selected="true">Mods</button>
    <button class="tab" data-tab="overrides" role="tab" aria-selected="false">Overrides</button>
    <button class="tab" data-tab="review" role="tab" aria-selected="false">Review</button>
    <button class="tab" data-tab="export" role="tab" aria-selected="false">Export</button>
  </div>

  <div class="tpm-status" id="tpm-status" role="status" aria-live="polite" hidden></div>

  <section class="panel active" id="tab-mods">
    <div class="tpm-two-col">
      <div class="tpm-card">
        <h3>Find mods on Modrinth</h3>
        <p class="tpm-muted">Results are filtered to the selected Minecraft version and loader. Adding a mod chooses its newest compatible release and can include required dependencies.</p>
        <div class="tpm-search-row">
          <input id="tpm-search" type="search" placeholder="Search Sodium, Create, JEI…" autocomplete="off">
          <button class="btn btn-primary" id="tpm-search-btn" type="button">Search</button>
        </div>
        <label class="tpm-check"><input type="checkbox" id="tpm-auto-deps" checked> Automatically add required dependencies</label>
        <div class="tpm-search-results" id="tpm-search-results"><p class="tpm-empty">Search for a mod to begin.</p></div>
      </div>

      <div class="tpm-card">
        <h3>Add a direct download</h3>
        <p class="tpm-muted">For GitHub, GitLab, or a Modrinth CDN file. A valid public <code>.mrpack</code> needs SHA-1 and SHA-512 hashes.</p>
        <div class="tpm-form-grid">
          <div class="tpm-field tpm-field-wide"><label for="tpm-manual-url">HTTPS download URL</label><input id="tpm-manual-url" placeholder="https://cdn.modrinth.com/data/…/file.jar"></div>
          <div class="tpm-field"><label for="tpm-manual-name">Display name</label><input id="tpm-manual-name" placeholder="Example Mod"></div>
          <div class="tpm-field"><label for="tpm-manual-path">Install path</label><input id="tpm-manual-path" value="mods/example.jar"></div>
          <div class="tpm-field"><label for="tpm-manual-client">Client</label><select id="tpm-manual-client"><option value="required">Required</option><option value="optional">Optional</option><option value="unsupported">Unsupported</option></select></div>
          <div class="tpm-field"><label for="tpm-manual-server">Server</label><select id="tpm-manual-server"><option value="required">Required</option><option value="optional">Optional</option><option value="unsupported">Unsupported</option></select></div>
          <div class="tpm-field tpm-field-wide"><label for="tpm-manual-sha1">SHA-1</label><input id="tpm-manual-sha1" placeholder="40 hexadecimal characters"></div>
          <div class="tpm-field tpm-field-wide"><label for="tpm-manual-sha512">SHA-512</label><input id="tpm-manual-sha512" placeholder="128 hexadecimal characters"></div>
        </div>
        <button class="btn btn-secondary" id="tpm-manual-add" type="button">Add download</button>
      </div>
    </div>

    <div class="tpm-list-head"><h3>Pack contents</h3><span id="tpm-mod-count">0 files</span></div>
    <div class="tpm-mod-list" id="tpm-mod-list"><p class="tpm-empty">No mods added yet.</p></div>
  </section>

  <section class="panel" id="tab-overrides">
    <div class="tpm-card">
      <h3>Config and instance files</h3>
      <p class="tpm-muted">Add config files, scripts, resource packs, datapacks, default options, and server properties. Choose the layer that receives each file.</p>
      <div class="tpm-override-toolbar">
        <label class="tpm-field"><span>Layer</span><select id="tpm-override-layer"><option value="overrides">Both client and server</option><option value="client-overrides">Client only</option><option value="server-overrides">Server only</option></select></label>
        <button class="btn btn-primary" id="tpm-add-overrides" type="button">Add files</button>
        <button class="btn btn-secondary" id="tpm-add-folder" type="button">Add folder</button>
        <input type="file" id="tpm-override-files" multiple hidden>
        <input type="file" id="tpm-override-folder" webkitdirectory directory multiple hidden>
      </div>
      <div class="tpm-dropzone" id="tpm-drop">Drop override files here</div>
    </div>
    <div class="tpm-override-list" id="tpm-override-list"><p class="tpm-empty">No override files added.</p></div>
  </section>

  <section class="panel" id="tab-review">
    <div class="tpm-review-grid">
      <div class="tpm-card"><h3>Validation</h3><div id="tpm-diagnostics"></div></div>
      <div class="tpm-card"><h3>Dependencies</h3><pre class="tpm-json" id="tpm-dependency-preview"></pre></div>
      <div class="tpm-card tpm-card-wide"><h3>modrinth.index.json</h3><pre class="tpm-json" id="tpm-manifest-preview"></pre></div>
    </div>
  </section>

  <section class="panel" id="tab-export">
    <div class="tpm-export-grid">
      <div class="tpm-card">
        <h3>Modrinth modpack</h3>
        <p class="tpm-muted">Exports <code>modrinth.index.json</code> plus common, client, and server override layers as a standards-compliant <code>.mrpack</code>.</p>
        <button class="btn btn-primary" id="tpm-export-mrpack" type="button">Download .mrpack</button>
        <button class="btn btn-secondary" id="tpm-export-manifest" type="button">Download manifest JSON</button>
      </div>
      <div class="tpm-card">
        <h3>Compatibility checklist</h3>
        <div id="tpm-export-checklist"></div>
      </div>
    </div>
  </section>
</div>

<script src="{{ '/assets/js/zip-writer.js' | relative_url }}?v={{ site.time | date: '%Y%m%d%H%M' }}" defer></script>
<script src="{{ '/assets/js/minecraft-pack-utils.js' | relative_url }}?v={{ site.time | date: '%Y%m%d%H%M' }}" defer></script>
<script src="{{ '/assets/js/tpm.js' | relative_url }}?v={{ site.time | date: '%Y%m%d%H%M' }}" defer></script>
