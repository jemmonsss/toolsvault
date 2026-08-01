/* Toolsvault Minecraft Modpack Creator
 * Builds Modrinth .mrpack archives entirely in the browser.
 * Depends on MinecraftPack and TpcZip.
 */
(function () {
  'use strict';

  var API = 'https://api.modrinth.com/v2';
  var STORAGE_KEY = 'tpm:modpack:v2';
  var ALLOWED_DOWNLOAD_HOSTS = ['cdn.modrinth.com', 'github.com', 'raw.githubusercontent.com', 'gitlab.com'];
  var project;
  var statusTimer;

  function blankProject() {
    return {
      schema: 2,
      name: 'My Modpack',
      versionId: '1.0.0',
      minecraft: '26.2',
      loader: 'fabric',
      loaderVersion: '',
      summary: 'A custom Minecraft modpack',
      mods: [],
      overrides: []
    };
  }

  function $(id) { return document.getElementById(id); }
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function uid(prefix) { return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function prettyBytes(size) {
    size = Number(size) || 0;
    if (size < 1024) return size + ' B';
    if (size < 1048576) return (size / 1024).toFixed(1) + ' KB';
    return (size / 1048576).toFixed(1) + ' MB';
  }
  function showStatus(message, ok) {
    var el = $('tpm-status');
    if (!el) return;
    clearTimeout(statusTimer);
    el.hidden = false;
    el.className = 'tpm-status ' + (ok === false ? 'err' : 'ok');
    el.textContent = message;
    statusTimer = setTimeout(function () { el.hidden = true; }, 5500);
  }
  function downloadJson(data, filename) {
    MinecraftPack.downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), filename);
  }
  function storageAvailable() {
    try {
      localStorage.setItem('__tpm_test__', '1');
      localStorage.removeItem('__tpm_test__');
      return true;
    } catch (e) { return false; }
  }
  function base64FromBytes(bytes) {
    var out = '';
    for (var i = 0; i < bytes.length; i += 0x8000) out += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(out);
  }
  function bytesFromBase64(value) {
    var raw = atob(value || '');
    var bytes = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return bytes;
  }

  function syncProjectFromForm() {
    project.name = $('tpm-name').value.trim();
    project.versionId = $('tpm-version-id').value.trim();
    project.minecraft = $('tpm-minecraft').value.trim();
    project.loader = $('tpm-loader').value;
    project.loaderVersion = $('tpm-loader-version').value.trim();
    project.summary = $('tpm-summary').value.trim();
  }

  function syncFormFromProject() {
    $('tpm-name').value = project.name || '';
    $('tpm-version-id').value = project.versionId || '';
    $('tpm-minecraft').value = project.minecraft || '';
    $('tpm-loader').value = project.loader || 'fabric';
    $('tpm-loader-version').value = project.loaderVersion || '';
    $('tpm-summary').value = project.summary || '';
  }

  function serializableProject() {
    syncProjectFromForm();
    return {
      schema: 2,
      name: project.name,
      versionId: project.versionId,
      minecraft: project.minecraft,
      loader: project.loader,
      loaderVersion: project.loaderVersion,
      summary: project.summary,
      mods: project.mods.map(function (mod) {
        return {
          id: mod.id,
          projectId: mod.projectId || null,
          versionId: mod.versionId || null,
          name: mod.name,
          versionName: mod.versionName || '',
          path: mod.path,
          hashes: mod.hashes,
          downloads: mod.downloads,
          fileSize: mod.fileSize || 0,
          env: mod.env || { client: 'required', server: 'required' },
          source: mod.source || 'manual'
        };
      }),
      overrides: project.overrides.map(function (file) {
        return {
          id: file.id,
          layer: file.layer,
          path: file.path,
          name: file.name,
          type: file.type || 'application/octet-stream',
          data: base64FromBytes(file.data)
        };
      })
    };
  }

  function normalizeProject(data) {
    if (!data || typeof data !== 'object') throw new Error('The project file is not valid JSON project data.');
    var next = blankProject();
    next.name = String(data.name || next.name);
    next.versionId = String(data.versionId || data.version_id || next.versionId);
    next.minecraft = String(data.minecraft || next.minecraft);
    next.loader = String(data.loader || next.loader);
    next.loaderVersion = String(data.loaderVersion || data.loader_version || '');
    next.summary = String(data.summary || '');
    next.mods = Array.isArray(data.mods) ? data.mods.map(function (mod) {
      return {
        id: mod.id || uid('mod'),
        projectId: mod.projectId || null,
        versionId: mod.versionId || null,
        name: String(mod.name || mod.path || 'Download'),
        versionName: String(mod.versionName || ''),
        path: String(mod.path || ''),
        hashes: mod.hashes || {},
        downloads: Array.isArray(mod.downloads) ? mod.downloads : [],
        fileSize: Number(mod.fileSize) || 0,
        env: mod.env || { client: 'required', server: 'required' },
        source: mod.source || 'manual'
      };
    }) : [];
    next.overrides = Array.isArray(data.overrides) ? data.overrides.map(function (file) {
      return {
        id: file.id || uid('override'),
        layer: ['overrides', 'client-overrides', 'server-overrides'].includes(file.layer) ? file.layer : 'overrides',
        path: String(file.path || file.name || 'file'),
        name: String(file.name || file.path || 'file'),
        type: file.type || 'application/octet-stream',
        data: file.data instanceof Uint8Array ? file.data : bytesFromBase64(file.data || '')
      };
    }) : [];
    return next;
  }

  function applyProject(data) {
    project = normalizeProject(data);
    syncFormFromProject();
    renderAll();
  }

  function saveProject() {
    if (!storageAvailable()) return showStatus('Local storage is blocked in this browser.', false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableProject()));
      var label = $('tpm-saved-label');
      label.hidden = false;
      label.textContent = 'Saved ' + new Date().toLocaleTimeString();
      showStatus('Project saved locally.', true);
    } catch (error) { showStatus('Save failed: ' + error.message, false); }
  }

  function loadProject() {
    if (!storageAvailable()) return showStatus('Local storage is blocked in this browser.', false);
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return showStatus('No saved project was found.', false);
      applyProject(JSON.parse(raw));
      showStatus('Saved project loaded.', true);
    } catch (error) { showStatus('Load failed: ' + error.message, false); }
  }

  function exportProject() {
    downloadJson(serializableProject(), MinecraftPack.sanitizeName(project.name, 'modpack') + '.toolsvault-modpack.json');
  }

  async function importProjectFile(file) {
    if (!file) return;
    try {
      applyProject(JSON.parse(await file.text()));
      showStatus('Project imported.', true);
    } catch (error) { showStatus('Project import failed: ' + error.message, false); }
  }

  function buildDependencies() {
    syncProjectFromForm();
    var dependencies = { minecraft: project.minecraft };
    var keyMap = { fabric: 'fabric-loader', quilt: 'quilt-loader', forge: 'forge', neoforge: 'neoforge' };
    if (keyMap[project.loader] && project.loaderVersion) dependencies[keyMap[project.loader]] = project.loaderVersion;
    return dependencies;
  }

  function buildManifest() {
    syncProjectFromForm();
    return {
      formatVersion: 1,
      game: 'minecraft',
      versionId: project.versionId,
      name: project.name,
      summary: project.summary,
      files: project.mods.map(function (mod) {
        return {
          path: mod.path,
          hashes: { sha1: String(mod.hashes.sha1 || '').toLowerCase(), sha512: String(mod.hashes.sha512 || '').toLowerCase() },
          env: { client: mod.env.client, server: mod.env.server },
          downloads: mod.downloads.slice(),
          fileSize: mod.fileSize || undefined
        };
      }).map(function (entry) {
        if (!entry.fileSize) delete entry.fileSize;
        return entry;
      }),
      dependencies: buildDependencies()
    };
  }

  function validate() {
    syncProjectFromForm();
    var items = [];
    function add(level, message) { items.push({ level: level, message: message }); }
    if (!project.name) add('error', 'Pack name is required.');
    if (!project.versionId) add('error', 'Version ID is required.');
    if (!project.minecraft) add('error', 'Minecraft version is required.');
    if (project.loader !== 'minecraft' && !project.loaderVersion) add('error', 'Enter the exact ' + project.loader + ' loader version.');
    if (!project.summary) add('warning', 'Add a summary so launchers can explain the pack.');
    if (!project.mods.length && !project.overrides.length) add('error', 'Add at least one mod or override file.');
    if (!project.mods.length) add('warning', 'This pack contains only overrides and no downloadable mods.');

    var paths = new Set();
    project.mods.forEach(function (mod) {
      var prefix = mod.name || mod.path || 'Download';
      try { MinecraftPack.safePath(mod.path); } catch (e) { add('error', prefix + ': unsafe install path.'); }
      if (paths.has(mod.path)) add('error', 'Duplicate archive path: ' + mod.path);
      paths.add(mod.path);
      if (!/^https:\/\//i.test(mod.downloads[0] || '')) add('error', prefix + ': download URL must use HTTPS.');
      if (!/^[a-f0-9]{40}$/i.test(mod.hashes.sha1 || '')) add('error', prefix + ': SHA-1 must contain 40 hexadecimal characters.');
      if (!/^[a-f0-9]{128}$/i.test(mod.hashes.sha512 || '')) add('error', prefix + ': SHA-512 must contain 128 hexadecimal characters.');
      try {
        var host = new URL(mod.downloads[0]).hostname.toLowerCase();
        if (!ALLOWED_DOWNLOAD_HOSTS.some(function (allowed) { return host === allowed || host.endsWith('.' + allowed); })) {
          add('warning', prefix + ': ' + host + ' may be rejected by Modrinth upload validation.');
        }
      } catch (e) { /* URL error already covered */ }
      if (!['required', 'optional', 'unsupported'].includes(mod.env.client) || !['required', 'optional', 'unsupported'].includes(mod.env.server)) {
        add('error', prefix + ': invalid client/server environment setting.');
      }
    });
    project.overrides.forEach(function (file) {
      try { MinecraftPack.safePath(file.path); } catch (e) { add('error', file.name + ': unsafe override path.'); }
      var fullPath = file.layer + '/' + file.path;
      if (paths.has(fullPath)) add('error', 'Duplicate archive path: ' + fullPath);
      paths.add(fullPath);
      if (!file.data || !file.data.length) add('warning', fullPath + ' is empty.');
    });
    if (!items.some(function (item) { return item.level === 'error'; })) add('success', 'Manifest and archive structure are ready to export.');
    return items;
  }

  function diagnosticHtml(items) {
    if (!items.length) return '<p class="tpm-empty">No checks have run.</p>';
    return '<ul class="tpm-diagnostic-list">' + items.map(function (item) {
      return '<li class="' + item.level + '"><span aria-hidden="true">' + (item.level === 'error' ? '✕' : item.level === 'warning' ? '!' : '✓') + '</span>' + esc(item.message) + '</li>';
    }).join('') + '</ul>';
  }

  function renderReview() {
    if (!$('tpm-diagnostics')) return;
    var diagnostics = validate();
    $('tpm-diagnostics').innerHTML = diagnosticHtml(diagnostics);
    $('tpm-dependency-preview').textContent = JSON.stringify(buildDependencies(), null, 2);
    $('tpm-manifest-preview').textContent = JSON.stringify(buildManifest(), null, 2);
    $('tpm-export-checklist').innerHTML = diagnosticHtml(diagnostics);
  }

  function envLabel(value) { return value.charAt(0).toUpperCase() + value.slice(1); }

  function renderMods() {
    var root = $('tpm-mod-list');
    $('tpm-mod-count').textContent = project.mods.length + (project.mods.length === 1 ? ' file' : ' files');
    if (!project.mods.length) {
      root.innerHTML = '<p class="tpm-empty">No mods added yet.</p>';
      return;
    }
    root.innerHTML = project.mods.map(function (mod) {
      return '<article class="tpm-mod-row" data-id="' + esc(mod.id) + '">' +
        '<div class="tpm-mod-main"><strong>' + esc(mod.name) + '</strong><span>' + esc(mod.versionName || mod.source) + '</span><code>' + esc(mod.path) + '</code></div>' +
        '<div class="tpm-mod-meta"><span>' + prettyBytes(mod.fileSize) + '</span>' +
          '<label>Client<select data-action="client"><option value="required"' + (mod.env.client === 'required' ? ' selected' : '') + '>Required</option><option value="optional"' + (mod.env.client === 'optional' ? ' selected' : '') + '>Optional</option><option value="unsupported"' + (mod.env.client === 'unsupported' ? ' selected' : '') + '>Unsupported</option></select></label>' +
          '<label>Server<select data-action="server"><option value="required"' + (mod.env.server === 'required' ? ' selected' : '') + '>Required</option><option value="optional"' + (mod.env.server === 'optional' ? ' selected' : '') + '>Optional</option><option value="unsupported"' + (mod.env.server === 'unsupported' ? ' selected' : '') + '>Unsupported</option></select></label>' +
          '<button class="tpm-icon-btn" data-action="remove" type="button" aria-label="Remove ' + esc(mod.name) + '">Remove</button></div></article>';
    }).join('');
  }

  function renderOverrides() {
    var root = $('tpm-override-list');
    if (!project.overrides.length) {
      root.innerHTML = '<p class="tpm-empty">No override files added.</p>';
      return;
    }
    root.innerHTML = project.overrides.map(function (file) {
      return '<article class="tpm-override-row" data-id="' + esc(file.id) + '">' +
        '<div><strong>' + esc(file.name) + '</strong><code>' + esc(file.layer + '/' + file.path) + '</code><span>' + prettyBytes(file.data.length) + '</span></div>' +
        '<div class="tpm-row-actions"><button class="btn btn-secondary tpm-sm" data-action="rename" type="button">Rename path</button><button class="tpm-icon-btn" data-action="remove" type="button">Remove</button></div></article>';
    }).join('');
  }

  function renderAll() {
    renderMods();
    renderOverrides();
    renderReview();
  }

  function resultEnvironment(projectHit) {
    var client = projectHit.client_side || 'required';
    var server = projectHit.server_side || 'required';
    return {
      client: ['required', 'optional', 'unsupported'].includes(client) ? client : 'required',
      server: ['required', 'optional', 'unsupported'].includes(server) ? server : 'required'
    };
  }

  async function apiJson(path) {
    var response = await fetch(API + path, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Modrinth returned HTTP ' + response.status + '.');
    return response.json();
  }

  async function searchModrinth() {
    syncProjectFromForm();
    var query = $('tpm-search').value.trim();
    if (!query) return showStatus('Enter a mod name to search.', false);
    var root = $('tpm-search-results');
    root.innerHTML = '<p class="tpm-empty">Searching Modrinth…</p>';
    try {
      var facets = [['project_type:mod'], ['versions:' + project.minecraft]];
      if (project.loader !== 'minecraft') facets.push(['categories:' + project.loader]);
      var params = new URLSearchParams({ query: query, limit: '12', index: 'relevance', facets: JSON.stringify(facets) });
      var data = await apiJson('/search?' + params.toString());
      if (!data.hits || !data.hits.length) {
        root.innerHTML = '<p class="tpm-empty">No compatible results found. Check the Minecraft version and loader.</p>';
        return;
      }
      root.innerHTML = data.hits.map(function (hit) {
        var icon = hit.icon_url ? '<img src="' + esc(hit.icon_url) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : '<span class="tpm-result-placeholder">◆</span>';
        return '<article class="tpm-result-card" data-project="' + esc(hit.project_id || hit.slug) + '">' + icon + '<div><strong>' + esc(hit.title) + '</strong><p>' + esc(hit.description || '') + '</p><span>' + esc((hit.categories || []).slice(0, 4).join(' · ')) + '</span></div><button class="btn btn-primary tpm-sm" type="button">Add</button></article>';
      }).join('');
    } catch (error) {
      root.innerHTML = '<p class="tpm-empty">Search failed. ' + esc(error.message) + '</p>';
      showStatus('Modrinth search failed: ' + error.message, false);
    }
  }

  function compatibleVersionPath(projectId) {
    var params = new URLSearchParams();
    params.set('game_versions', JSON.stringify([project.minecraft]));
    if (project.loader !== 'minecraft') params.set('loaders', JSON.stringify([project.loader]));
    params.set('include_changelog', 'false');
    return '/project/' + encodeURIComponent(projectId) + '/version?' + params.toString();
  }

  async function resolveVersion(projectId) {
    var versions = await apiJson(compatibleVersionPath(projectId));
    if (!versions.length) throw new Error('No release matches Minecraft ' + project.minecraft + ' and ' + project.loader + '.');
    return versions.find(function (version) { return version.version_type === 'release' && version.status !== 'draft'; }) || versions[0];
  }

  function primaryFile(version) {
    return version.files.find(function (file) { return file.primary; }) || version.files[0];
  }

  async function addVersion(version, displayName, source, env) {
    var file = primaryFile(version);
    if (!file) throw new Error('This version has no downloadable file.');
    if (project.mods.some(function (mod) { return mod.versionId === version.id || mod.path === 'mods/' + file.filename; })) return false;
    project.mods.push({
      id: uid('mod'),
      projectId: version.project_id || null,
      versionId: version.id || null,
      name: displayName || version.name || file.filename,
      versionName: version.version_number || version.name || '',
      path: 'mods/' + file.filename,
      hashes: { sha1: file.hashes.sha1 || '', sha512: file.hashes.sha512 || '' },
      downloads: [file.url],
      fileSize: file.size || 0,
      env: env || { client: 'required', server: 'required' },
      source: source || 'modrinth'
    });
    return true;
  }

  async function addDependency(dep, seen, depth) {
    if (depth > 8) return;
    var key = dep.version_id || dep.project_id;
    if (!key || seen.has(key)) return;
    seen.add(key);
    var version;
    if (dep.version_id) version = await apiJson('/version/' + encodeURIComponent(dep.version_id));
    else version = await resolveVersion(dep.project_id);
    var added = await addVersion(version, version.name || 'Required dependency', 'modrinth dependency');
    if (added && version.dependencies) {
      var required = version.dependencies.filter(function (item) { return item.dependency_type === 'required'; });
      for (var i = 0; i < required.length; i++) await addDependency(required[i], seen, depth + 1);
    }
  }

  async function addModrinthProject(projectId, button) {
    syncProjectFromForm();
    var original = button ? button.textContent : '';
    if (button) { button.disabled = true; button.textContent = 'Adding…'; }
    try {
      var details = await apiJson('/project/' + encodeURIComponent(projectId));
      var version = await resolveVersion(projectId);
      var added = await addVersion(version, details.title, 'modrinth', resultEnvironment(details));
      if (!added) return showStatus(details.title + ' is already in the pack.', false);
      var depsAdded = 0;
      if ($('tpm-auto-deps').checked) {
        var before = project.mods.length;
        var required = (version.dependencies || []).filter(function (dep) { return dep.dependency_type === 'required'; });
        var seen = new Set([version.id, version.project_id]);
        for (var i = 0; i < required.length; i++) await addDependency(required[i], seen, 0);
        depsAdded = project.mods.length - before;
      }
      renderAll();
      showStatus('Added ' + details.title + (depsAdded ? ' and ' + depsAdded + ' required ' + (depsAdded === 1 ? 'dependency.' : 'dependencies.') : '.'), true);
    } catch (error) { showStatus('Could not add mod: ' + error.message, false); }
    finally { if (button) { button.disabled = false; button.textContent = original; } }
  }

  function addManual() {
    var url = $('tpm-manual-url').value.trim();
    var path = $('tpm-manual-path').value.trim();
    var name = $('tpm-manual-name').value.trim() || path.split('/').pop() || 'Direct download';
    var sha1 = $('tpm-manual-sha1').value.trim().toLowerCase();
    var sha512 = $('tpm-manual-sha512').value.trim().toLowerCase();
    try {
      var parsed = new URL(url);
      if (parsed.protocol !== 'https:') throw new Error('Use an HTTPS download URL.');
      path = MinecraftPack.safePath(path);
      if (!/^[a-f0-9]{40}$/i.test(sha1)) throw new Error('SHA-1 must contain 40 hexadecimal characters.');
      if (!/^[a-f0-9]{128}$/i.test(sha512)) throw new Error('SHA-512 must contain 128 hexadecimal characters.');
      if (project.mods.some(function (mod) { return mod.path === path; })) throw new Error('A file already uses that install path.');
      project.mods.push({ id: uid('mod'), name: name, versionName: 'Direct download', path: path, hashes: { sha1: sha1, sha512: sha512 }, downloads: [url], fileSize: 0, env: { client: $('tpm-manual-client').value, server: $('tpm-manual-server').value }, source: 'manual' });
      renderAll();
      showStatus('Direct download added.', true);
    } catch (error) { showStatus(error.message, false); }
  }

  async function addOverrideFiles(files, layer) {
    var added = 0;
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var relative = file.webkitRelativePath || file.name;
      try {
        var path = MinecraftPack.safePath(relative);
        var full = layer + '/' + path;
        if (project.overrides.some(function (existing) { return existing.layer + '/' + existing.path === full; })) continue;
        project.overrides.push({ id: uid('override'), layer: layer, path: path, name: file.name, type: file.type, data: new Uint8Array(await file.arrayBuffer()) });
        added++;
      } catch (error) { showStatus('Skipped ' + file.name + ': ' + error.message, false); }
    }
    renderAll();
    if (added) showStatus('Added ' + added + ' override ' + (added === 1 ? 'file.' : 'files.'), true);
  }

  async function importMrpack(file) {
    if (!file) return;
    try {
      var entries = await MinecraftPack.readZip(file);
      var indexEntry = entries.find(function (entry) { return entry.name === 'modrinth.index.json'; });
      if (!indexEntry) throw new Error('The archive has no root modrinth.index.json file.');
      var manifest = JSON.parse(MinecraftPack.bytesText(indexEntry.data));
      if (manifest.formatVersion !== 1 || manifest.game !== 'minecraft') throw new Error('Unsupported Modrinth pack format.');
      var next = blankProject();
      next.name = manifest.name || next.name;
      next.versionId = manifest.versionId || next.versionId;
      next.summary = manifest.summary || '';
      next.minecraft = String((manifest.dependencies || {}).minecraft || next.minecraft);
      var dep = manifest.dependencies || {};
      if (dep['fabric-loader']) { next.loader = 'fabric'; next.loaderVersion = String(dep['fabric-loader']); }
      else if (dep['quilt-loader']) { next.loader = 'quilt'; next.loaderVersion = String(dep['quilt-loader']); }
      else if (dep.neoforge) { next.loader = 'neoforge'; next.loaderVersion = String(dep.neoforge); }
      else if (dep.forge) { next.loader = 'forge'; next.loaderVersion = String(dep.forge); }
      else next.loader = 'minecraft';
      next.mods = (manifest.files || []).map(function (entry) {
        return {
          id: uid('mod'), name: entry.path.split('/').pop(), versionName: 'Imported .mrpack', path: entry.path,
          hashes: entry.hashes || {}, downloads: entry.downloads || [], fileSize: entry.fileSize || 0,
          env: entry.env || { client: 'required', server: 'required' }, source: 'imported'
        };
      });
      entries.forEach(function (entry) {
        var match = entry.name.match(/^(overrides|client-overrides|server-overrides)\/(.+)$/);
        if (!match) return;
        next.overrides.push({ id: uid('override'), layer: match[1], path: match[2], name: match[2].split('/').pop(), type: 'application/octet-stream', data: entry.data });
      });
      applyProject(next);
      showStatus('Imported ' + next.mods.length + ' downloads and ' + next.overrides.length + ' override files.', true);
    } catch (error) { showStatus('Could not import .mrpack: ' + error.message, false); }
  }

  function exportMrpack() {
    var diagnostics = validate();
    var errors = diagnostics.filter(function (item) { return item.level === 'error'; });
    if (errors.length) {
      switchTab('review');
      return showStatus('Fix ' + errors.length + ' validation ' + (errors.length === 1 ? 'error' : 'errors') + ' before exporting.', false);
    }
    try {
      var files = [{ name: 'modrinth.index.json', data: MinecraftPack.textBytes(JSON.stringify(buildManifest(), null, 2)) }];
      project.overrides.forEach(function (file) { files.push({ name: file.layer + '/' + file.path, data: file.data }); });
      var blob = TpcZip.createZip(files);
      MinecraftPack.downloadBlob(new Blob([blob], { type: 'application/x-modrinth-modpack+zip' }), MinecraftPack.sanitizeName(project.name, 'modpack') + '-' + MinecraftPack.sanitizeName(project.versionId, '1.0.0') + '.mrpack');
      showStatus('Modrinth pack exported.', true);
    } catch (error) { showStatus('Export failed: ' + error.message, false); }
  }

  function switchTab(name) {
    document.querySelectorAll('.tpm .tab').forEach(function (tab) {
      var active = tab.dataset.tab === name;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    document.querySelectorAll('.tpm .panel').forEach(function (panel) { panel.classList.toggle('active', panel.id === 'tab-' + name); });
    if (name === 'review' || name === 'export') renderReview();
  }

  function bindEvents() {
    ['tpm-name', 'tpm-version-id', 'tpm-minecraft', 'tpm-loader', 'tpm-loader-version', 'tpm-summary'].forEach(function (id) {
      $(id).addEventListener(id === 'tpm-loader' ? 'change' : 'input', function () { syncProjectFromForm(); renderReview(); });
    });
    document.querySelectorAll('.tpm .tab').forEach(function (tab) { tab.addEventListener('click', function () { switchTab(tab.dataset.tab); }); });
    $('tpm-save').addEventListener('click', saveProject);
    $('tpm-load').addEventListener('click', loadProject);
    $('tpm-export-project').addEventListener('click', exportProject);
    $('tpm-import-project').addEventListener('click', function () { $('tpm-import-project-file').click(); });
    $('tpm-import-project-file').addEventListener('change', function () { importProjectFile(this.files[0]); this.value = ''; });
    $('tpm-import-pack').addEventListener('click', function () { $('tpm-import-pack-file').click(); });
    $('tpm-import-pack-file').addEventListener('change', function () { importMrpack(this.files[0]); this.value = ''; });
    $('tpm-clear').addEventListener('click', function () {
      if (project.mods.length || project.overrides.length) {
        if (!confirm('Start a new modpack and discard the current in-browser project?')) return;
      }
      applyProject(blankProject());
      showStatus('New project created.', true);
    });
    $('tpm-search-btn').addEventListener('click', searchModrinth);
    $('tpm-search').addEventListener('keydown', function (event) { if (event.key === 'Enter') { event.preventDefault(); searchModrinth(); } });
    $('tpm-search-results').addEventListener('click', function (event) {
      var card = event.target.closest('[data-project]');
      if (card && event.target.closest('button')) addModrinthProject(card.dataset.project, event.target.closest('button'));
    });
    $('tpm-manual-add').addEventListener('click', addManual);
    $('tpm-mod-list').addEventListener('change', function (event) {
      var row = event.target.closest('[data-id]');
      if (!row) return;
      var mod = project.mods.find(function (item) { return item.id === row.dataset.id; });
      if (!mod) return;
      if (event.target.dataset.action === 'client') mod.env.client = event.target.value;
      if (event.target.dataset.action === 'server') mod.env.server = event.target.value;
      renderReview();
    });
    $('tpm-mod-list').addEventListener('click', function (event) {
      if (event.target.dataset.action !== 'remove') return;
      var row = event.target.closest('[data-id]');
      project.mods = project.mods.filter(function (item) { return item.id !== row.dataset.id; });
      renderAll();
    });
    $('tpm-add-overrides').addEventListener('click', function () { $('tpm-override-files').click(); });
    $('tpm-add-folder').addEventListener('click', function () { $('tpm-override-folder').click(); });
    $('tpm-override-files').addEventListener('change', function () { addOverrideFiles(this.files, $('tpm-override-layer').value); this.value = ''; });
    $('tpm-override-folder').addEventListener('change', function () { addOverrideFiles(this.files, $('tpm-override-layer').value); this.value = ''; });
    var drop = $('tpm-drop');
    ['dragenter', 'dragover'].forEach(function (type) { drop.addEventListener(type, function (event) { event.preventDefault(); drop.classList.add('drag'); }); });
    ['dragleave', 'drop'].forEach(function (type) { drop.addEventListener(type, function (event) { event.preventDefault(); drop.classList.remove('drag'); }); });
    drop.addEventListener('drop', function (event) { addOverrideFiles(event.dataTransfer.files, $('tpm-override-layer').value); });
    $('tpm-override-list').addEventListener('click', function (event) {
      var row = event.target.closest('[data-id]');
      if (!row) return;
      var file = project.overrides.find(function (item) { return item.id === row.dataset.id; });
      if (!file) return;
      if (event.target.dataset.action === 'remove') project.overrides = project.overrides.filter(function (item) { return item.id !== file.id; });
      if (event.target.dataset.action === 'rename') {
        var next = prompt('Path inside ' + file.layer + ':', file.path);
        if (next == null) return;
        try { file.path = MinecraftPack.safePath(next); } catch (error) { return showStatus(error.message, false); }
      }
      renderAll();
    });
    $('tpm-export-mrpack').addEventListener('click', exportMrpack);
    $('tpm-export-manifest').addEventListener('click', function () { downloadJson(buildManifest(), 'modrinth.index.json'); });
  }

  function init() {
    if (!window.MinecraftPack || !window.TpcZip) return showStatus('Required ZIP helpers did not load. Refresh the page.', false);
    project = blankProject();
    bindEvents();
    syncFormFromProject();
    renderAll();
  }

  window.ToolsvaultModpack = {
    getState: function () { return project; },
    buildManifest: buildManifest,
    validate: validate,
    applyProject: applyProject
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
