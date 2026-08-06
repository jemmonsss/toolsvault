---
title: "Minecraft Server Creator"
link: "/tools/minecraft-server-creator/"
description: "Build a fully configured Minecraft server package with custom properties, plugins, mods, and ready-to-run scripts — download as a ZIP and just run it."
tags:
  - minecraft
  - server
  - creator
  - paper
  - spigot
  - forge
  - fabric
  - neoforge
  - purpur
category: "Minecraft"
games_only: true
icon: "&#9881;"
---

<link rel="stylesheet" href="{{ '/assets/css/msc.css' | relative_url }}?v={{ site.time | date: '%Y%m%d%H%M' }}">

<div class="tui msc">
  <h1>Minecraft Server Creator</h1>
  <p class="sub">Configure every aspect of your Minecraft server, then download a ready-to-run package. No hosting — just unzip and launch.</p>

  <div class="msc-callout">
    <strong>How it works:</strong> Pick your server type and version, configure properties, add players, search for plugins/mods, tune JVM settings, then download a <code>.zip</code> containing everything you need. The included scripts auto-download the server JAR and find Java on your machine — no PATH configuration needed.
  </div>

  <div class="msc-savebar">
    <button class="btn btn-secondary msc-sm" id="msc-save" type="button">Save</button>
    <button class="btn btn-secondary msc-sm" id="msc-load" type="button">Load saved</button>
    <button class="btn btn-secondary msc-sm" id="msc-export-project" type="button">Export project</button>
    <button class="btn btn-secondary msc-sm" id="msc-import-project" type="button">Import project</button>
    <input type="file" id="msc-import-project-file" accept="application/json,.json" hidden>
    <button class="btn btn-secondary msc-sm" id="msc-clear" type="button">New project</button>
    <span class="msc-saved" id="msc-saved-label" hidden></span>
  </div>

  <div class="tabs" role="tablist">
    <button class="tab active" data-tab="type" role="tab" aria-selected="true">Server Type</button>
    <button class="tab" data-tab="properties" role="tab" aria-selected="false">Properties</button>
    <button class="tab" data-tab="players" role="tab" aria-selected="false">Players</button>
    <button class="tab" data-tab="addons" role="tab" aria-selected="false">Plugins / Mods</button>
    <button class="tab" data-tab="jvm" role="tab" aria-selected="false">JVM Config</button>
    <button class="tab" data-tab="review" role="tab" aria-selected="false">Review & Export</button>
  </div>

  <div class="msc-status" id="msc-status" role="status" aria-live="polite" hidden></div>

  <!-- TAB: Server Type & Version -->
  <section class="panel active" id="panel-type">
    <div class="msc-card">
      <h3>Choose Server Type</h3>
      <p class="msc-muted">Select the server software. Plugin servers (Paper, Spigot, Purpur) support Bukkit plugins. Modded servers (Fabric, Forge, NeoForge) support mods.</p>
      <div class="msc-type-grid" id="msc-type-grid"></div>
    </div>

    <div class="msc-two-col">
      <div class="msc-card">
        <h3>Minecraft Version</h3>
        <div class="msc-field">
          <label for="msc-version">Version</label>
          <select id="msc-version"></select>
          <span class="msc-hint" id="msc-java-hint">Recommended: Java 21</span>
        </div>
      </div>

      <div class="msc-card">
        <h3>Server Icon</h3>
        <p class="msc-muted">Upload a 64×64 PNG image shown in the server list.</p>
        <div style="display:flex;gap:.75rem;align-items:center;margin-top:.5rem">
          <button class="btn btn-secondary msc-sm" id="msc-icon-upload-btn" type="button">Upload icon</button>
          <input type="file" id="msc-icon-upload" accept="image/png,image/*" hidden>
          <img id="msc-icon-preview" hidden style="width:64px;height:64px;border-radius:8px;border:1px solid var(--border);image-rendering:pixelated" alt="Server icon preview">
        </div>
      </div>
    </div>
  </section>

  <!-- TAB: Server Properties -->
  <section class="panel" id="panel-properties">
    <div class="msc-card">
      <h3>server.properties</h3>
      <p class="msc-muted">Configure every server property. Click a group header to collapse/expand it. Properties are organized by category for easy navigation.</p>
    </div>
    <div id="msc-properties"></div>
  </section>

  <!-- TAB: Players -->
  <section class="panel" id="panel-players">
    <div class="msc-two-col">
      <div class="msc-card">
        <h3>Operators (Ops)</h3>
        <p class="msc-muted">Server operators have admin permissions. Level 4 = full access.</p>
        <div class="msc-add-row">
          <div class="msc-field">
            <label for="msc-op-name">Player Name</label>
            <input type="text" id="msc-op-name" placeholder="Notch">
          </div>
          <div class="msc-field" style="max-width:100px">
            <label for="msc-op-level">Level</label>
            <select id="msc-op-level">
              <option value="4" selected>4 (Owner)</option>
              <option value="3">3 (Admin)</option>
              <option value="2">2 (Mod)</option>
              <option value="1">1 (Basic)</option>
            </select>
          </div>
          <button class="btn btn-primary msc-sm" id="msc-add-op-btn" type="button">Add</button>
        </div>
        <div id="msc-ops-list"></div>
      </div>

      <div class="msc-card">
        <h3>Whitelist</h3>
        <p class="msc-muted">Only whitelisted players can join (enable in Properties tab).</p>
        <div class="msc-add-row">
          <div class="msc-field">
            <label for="msc-whitelist-name">Player Name</label>
            <input type="text" id="msc-whitelist-name" placeholder="Steve">
          </div>
          <button class="btn btn-primary msc-sm" id="msc-add-whitelist-btn" type="button">Add</button>
        </div>
        <div id="msc-whitelist-list"></div>
      </div>

      <div class="msc-card">
        <h3>Banned Players</h3>
        <p class="msc-muted">Pre-ban players before the server starts.</p>
        <div class="msc-add-row">
          <div class="msc-field">
            <label for="msc-ban-name">Player Name</label>
            <input type="text" id="msc-ban-name" placeholder="Griefer123">
          </div>
          <button class="btn btn-primary msc-sm" id="msc-add-ban-btn" type="button">Add</button>
        </div>
        <div id="msc-banned-list"></div>
      </div>

      <div class="msc-card">
        <h3>Banned IPs</h3>
        <p class="msc-muted">Block specific IP addresses from connecting.</p>
        <div class="msc-add-row">
          <div class="msc-field">
            <label for="msc-ban-ip">IP Address</label>
            <input type="text" id="msc-ban-ip" placeholder="192.168.1.100">
          </div>
          <button class="btn btn-primary msc-sm" id="msc-add-ban-ip-btn" type="button">Add</button>
        </div>
        <div id="msc-banned-ips-list"></div>
      </div>
    </div>
  </section>

  <!-- TAB: Plugins / Mods -->
  <section class="panel" id="panel-addons">
    <p class="msc-empty" id="msc-addon-vanilla-msg" hidden>Vanilla servers don't support plugins or mods. Switch to Paper, Spigot, Purpur, Fabric, Forge, or NeoForge in the Server Type tab.</p>

    <div id="msc-addon-content">
      <div class="msc-two-col">
        <div class="msc-card">
          <h3>Search <span id="msc-addon-type-label">Plugins</span> on Modrinth</h3>
          <p class="msc-muted">Find plugins/mods compatible with your server type and Minecraft version. Results are filtered automatically.</p>
          <div class="msc-search-row">
            <input type="search" id="msc-addon-search" placeholder="Search EssentialsX, WorldEdit, Sodium…" autocomplete="off">
            <button class="btn btn-primary" id="msc-addon-search-btn" type="button">Search</button>
          </div>
          <div class="msc-search-results" id="msc-search-results">
            <p class="msc-empty">Search for a plugin or mod to begin.</p>
          </div>
        </div>

        <div class="msc-card">
          <h3>Your <span id="msc-addon-type-label-2">Plugins</span></h3>
          <div class="msc-list-head">
            <span id="msc-addon-count">0 plugins</span>
          </div>
          <p class="msc-muted">These will be listed in a download guide inside your server package. You'll download the actual JAR files from Modrinth and place them in the plugins/mods folder.</p>
          <div class="msc-addon-list" id="msc-addon-list">
            <p class="msc-empty">No addons added yet.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- TAB: JVM Config -->
  <section class="panel" id="panel-jvm">
    <div class="msc-two-col">
      <div class="msc-card">
        <h3>RAM Allocation</h3>
        <p class="msc-muted">Set minimum and maximum RAM for the server. Use G for gigabytes, M for megabytes.</p>
        <div class="msc-ram-row">
          <div class="msc-field">
            <label for="msc-min-ram">Minimum RAM</label>
            <select id="msc-min-ram">
              <option value="512M">512M</option>
              <option value="1G" selected>1G</option>
              <option value="2G">2G</option>
              <option value="3G">3G</option>
              <option value="4G">4G</option>
              <option value="6G">6G</option>
              <option value="8G">8G</option>
              <option value="10G">10G</option>
              <option value="12G">12G</option>
              <option value="16G">16G</option>
            </select>
          </div>
          <div class="msc-field">
            <label for="msc-max-ram">Maximum RAM</label>
            <select id="msc-max-ram">
              <option value="1G">1G</option>
              <option value="2G">2G</option>
              <option value="3G">3G</option>
              <option value="4G" selected>4G</option>
              <option value="6G">6G</option>
              <option value="8G">8G</option>
              <option value="10G">10G</option>
              <option value="12G">12G</option>
              <option value="16G">16G</option>
              <option value="20G">20G</option>
              <option value="24G">24G</option>
              <option value="32G">32G</option>
            </select>
          </div>
        </div>
      </div>

      <div class="msc-card">
        <h3>Auto Restart</h3>
        <p class="msc-muted">Automatically restart the server if it stops or crashes.</p>
        <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;margin-top:.5rem">
          <label class="msc-toggle">
            <input type="checkbox" id="msc-auto-restart" checked>
            <span class="msc-toggle-track"><span class="msc-toggle-thumb"></span></span>
            <span class="msc-toggle-label">Auto restart</span>
          </label>
          <div class="msc-field" style="max-width:140px">
            <label for="msc-restart-delay">Delay (seconds)</label>
            <input type="number" id="msc-restart-delay" value="10" min="0" max="300">
          </div>
        </div>
      </div>
    </div>

    <div class="msc-card">
      <h3>JVM Flag Presets</h3>
      <p class="msc-muted">Choose optimized JVM flags for your server type. Aikar's flags are recommended for Paper/Spigot servers.</p>
      <div class="msc-preset-grid" id="msc-preset-grid"></div>
    </div>

    <div class="msc-card">
      <h3>Custom JVM Flags</h3>
      <p class="msc-muted">Add additional JVM arguments. These are appended after the preset flags.</p>
      <div class="msc-field">
        <label for="msc-custom-flags">Additional flags</label>
        <input type="text" id="msc-custom-flags" placeholder="-Dpaper.maxChunkThreads=2">
      </div>
    </div>

    <div class="msc-card">
      <h3>Generated JVM Flags Preview</h3>
      <pre class="msc-json" id="msc-flags-preview" style="max-height:120px"></pre>
    </div>
  </section>

  <!-- TAB: Review & Export -->
  <section class="panel" id="panel-review">
    <div class="msc-review-grid">
      <div class="msc-card">
        <h3>Validation</h3>
        <p class="msc-muted">Checks your configuration for common issues.</p>
        <div id="msc-diagnostics"></div>
      </div>

      <div class="msc-card">
        <h3>Files in Package</h3>
        <div class="msc-file-tree" id="msc-file-tree"></div>
      </div>

      <div class="msc-card msc-card-wide">
        <h3>server.properties Preview</h3>
        <pre class="msc-json" id="msc-props-preview"></pre>
      </div>

      <div class="msc-card msc-card-wide">
        <h3>Download Server Package</h3>
        <div class="msc-callout" style="margin-top:0">
          <strong>Important:</strong> The <code>eula.txt</code> in this package is set to <code>eula=false</code>. On first launch, you must open <code>eula.txt</code> and change it to <code>eula=true</code> after reading the <a href="https://aka.ms/MinecraftEULA" target="_blank" rel="noopener">Mojang EULA</a>.
        </div>
        <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1rem">
          <button class="btn btn-primary" id="msc-export-zip" type="button">⬇ Download .zip</button>
        </div>
      </div>
    </div>
  </section>
</div>

<script src="{{ '/assets/js/zip-writer.js' | relative_url }}?v={{ site.time | date: '%Y%m%d%H%M' }}" defer></script>
<script src="{{ '/assets/js/msc.js' | relative_url }}?v={{ site.time | date: '%Y%m%d%H%M' }}" defer></script>
