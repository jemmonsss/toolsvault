/* Minecraft Datapack Creator — app logic.
 * Depends on: TpcZip (assets/js/zip-writer.js)
 * State: project = { name, format, description, namespace, files: Map<path, {content, type}> }
 * path example: "data/minecraft/functions/tick.mcfunction"
 */
(function () {
  'use strict';

  /* ---------- Templates ---------- */
  var TEMPLATES = {
    functions: {
      ext: '.mcfunction',
      content: '# Datapack function\nsay Hello from <namespace>!\n'
    },
    advancements: {
      ext: '.json',
      content: '{\n  "display": {\n    "title": "Example Advancement",\n    "description": "First advancement",\n    "icon": "minecraft:stone",\n    "background": "minecraft:textures/block/stone.png",\n    "frame": "task",\n    "announce_to_chat": true,\n    "show_toast": true\n  },\n  "criteria": {\n    "example": {\n      "trigger": "minecraft:impossible"\n    }\n  }\n}\n'
    },
    recipes: {
      ext: '.json',
      content: '{\n  "type": "minecraft:crafting_shaped",\n  "pattern": ["#  ", " # ", "  #"],\n  "key": {\n    "#": { "item": "minecraft:diamond" }\n  },\n  "result": {\n    "item": "minecraft:diamond_sword",\n    "count": 1\n  }\n}\n'
    },
    loot_tables: {
      ext: '.json',
      content: '{\n  "pools": [\n    {\n      "rolls": 1,\n      "entries": [\n        {\n          "type": "minecraft:item",\n          "name": "minecraft:stone"\n        }\n      ]\n    }\n  ]\n}\n'
    },
    tags: {
      ext: '.json',
      content: '{\n  "values": []\n}\n'
    },
    predicates: {
      ext: '.json',
      content: '{\n  "condition": "minecraft:entity_properties",\n  "entity": "this",\n  "predicate": {\n    "location": {\n      "biome": "minecraft:plains"\n    }\n  }\n}\n'
    },
    item_modifiers: {
      ext: '.json',
      content: '{\n  "function": "minecraft:set_count",\n  "count": {\n    "type": "minecraft:uniform",\n    "min": 1,\n    "max": 3\n  }\n}\n'
    },
    dimension: {
      ext: '.json',
      content: '{\n  // Dimension JSON — generate with a data pack generator or copy from an existing dimension\n}\n'
    },
    dimension_type: {
      ext: '.json',
      content: '{\n  // Dimension type JSON — see Minecraft Wiki for schema\n}\n'
    },
    worldgen: {
      ext: '.json',
      content: '{\n  // Worldgen JSON — see Minecraft Wiki for configured_feature / placed_feature schema\n}\n'
    },
    structures: {
      ext: '.nbt',
      content: '# Binary .nbt structures are not editable as text.\n# Paste raw NBT here if your tool supports it, or leave empty.\n'
    }
  };

  var TYPE_GROUPS = [
    { label: 'Functions', key: 'functions' },
    { label: 'Advancements', key: 'advancements' },
    { label: 'Recipes', key: 'recipes' },
    { label: 'Loot tables', key: 'loot_tables' },
    { label: 'Tags', key: 'tags' },
    { label: 'Predicates', key: 'predicates' },
    { label: 'Item modifiers', key: 'item_modifiers' },
    { label: 'Dimension', key: 'dimension' },
    { label: 'Dimension type', key: 'dimension_type' },
    { label: 'Worldgen', key: 'worldgen' },
    { label: 'Structures', key: 'structures' }
  ];

  /* ---------- State ---------- */
  var project = {
    name: 'My Datapack',
    format: 61,
    description: 'My custom datapack',
    namespace: 'minecraft',
    files: new Map()
  };
  var selectedPath = null;
  var inited = false;
  var saveDebounce = null;

  /* ---------- Element refs ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var editor = $('tpd-editor');

  /* ---------- Persistence (localStorage + file import/export) ---------- */
  var STORAGE_KEY = 'tpd:project';
  var SAVE_VERSION = 1;

  function serializeProject() {
    if (selectedPath && project.files.has(selectedPath)) {
      project.files.get(selectedPath).content = editor.value;
    }
    var filesArr = [];
    project.files.forEach(function (entry, path) {
      filesArr.push({ path: path, name: entry.name, type: entry.type, content: entry.content });
    });
    return {
      version: SAVE_VERSION,
      name: project.name,
      format: project.format,
      description: project.description,
      namespace: project.namespace,
      files: filesArr
    };
  }

  function applyProject(obj) {
    if (!obj || !obj.files) throw new Error('Invalid project');
    project.name = obj.name || 'My Datapack';
    project.format = obj.format || 61;
    project.description = obj.description || '';
    project.namespace = obj.namespace || 'minecraft';
    project.files = new Map();
    $('tpd-name').value = project.name;
    $('tpc-format').value = String(project.format);
    $('tpc-desc').value = project.description;
    $('tpd-namespace').value = project.namespace;
    var tasks = [];
    obj.files.forEach(function (f) {
      tasks.push(function () {
        project.files.set(f.path, { name: f.name || f.path.split('/').pop(), type: f.type || guessType(f.path), content: f.content || '' });
      });
    });
    return Promise.all(tasks.map(function (t) { try { t(); } catch (e) {} return Promise.resolve(); }));
  }

  function storageAvailable() {
    try {
      var k = '__tpd_test__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  }

  function saveProject() {
    if (!storageAvailable()) { showMsg('Browser storage is unavailable — cannot save here.', false); return; }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeProject()));
      setSavedLabel(true);
      showMsg('Saved "' + project.name + '" to this browser.', true);
    } catch (e) {
      showMsg('Save failed: ' + e.message, false);
    }
  }

  function loadSavedProject() {
    if (!storageAvailable()) { showMsg('Browser storage is unavailable.', false); return; }
    var raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) { showMsg('No saved project found in this browser.', false); return; }
    try {
      applyProject(JSON.parse(raw)).then(function () {
        selectedPath = null;
        editor.value = '';
        updateEditorHeader();
        refreshTreeFlags(); renderFileList(); renderPreview(); renderMeta();
        showMsg('Loaded saved project.', true);
      }).catch(function (e) { showMsg('Could not load saved project: ' + e.message, false); });
    } catch (e) { showMsg('Saved project is corrupted.', false); }
  }

  function deleteSavedProject() {
    if (!storageAvailable()) return;
    window.localStorage.removeItem(STORAGE_KEY);
    setSavedLabel(false);
    showMsg('Deleted saved project from this browser.', true);
  }

  function importProjectFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var obj = JSON.parse(reader.result);
        applyProject(obj).then(function () {
          selectedPath = null;
          editor.value = '';
          updateEditorHeader();
          refreshTreeFlags(); renderFileList(); renderPreview(); renderMeta();
          setSavedLabel(false);
          showMsg('Imported "' + (obj.name || 'project') + '".', true);
        }).catch(function (e) { showMsg('Import failed: ' + e.message, false); });
      } catch (e) { showMsg('Invalid project file.', false); }
    };
    reader.onerror = function () { showMsg('Could not read file.', false); };
    reader.readAsText(file);
  }

  function exportProjectFile() {
    var data = serializeProject();
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = sanitizeName(project.name) + '.tpd.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    showMsg('Exported project file "' + sanitizeName(project.name) + '.tpd.json".', true);
  }

  function setSavedLabel(has) {
    var el = $('tpd-saved-label');
    if (!el) return;
    if (has) {
      var raw = storageAvailable() ? window.localStorage.getItem(STORAGE_KEY) : null;
      var name = 'project';
      if (raw) { try { name = JSON.parse(raw).name || 'project'; } catch (e) {} }
      el.hidden = false;
      el.textContent = 'Saved: ' + name;
    } else { el.hidden = true; el.textContent = ''; }
  }

  function checkSavedExists() {
    if (!storageAvailable()) { setSavedLabel(false); return; }
    setSavedLabel(!!window.localStorage.getItem(STORAGE_KEY));
  }

  /* ---------- Helpers ---------- */
  function guessType(path) {
    if (/\.mcfunction$/.test(path)) return 'functions';
    if (/\/advancements\//.test(path)) return 'advancements';
    if (/\/recipes\//.test(path)) return 'recipes';
    if (/\/loot_tables\//.test(path)) return 'loot_tables';
    if (/\/tags\//.test(path)) return 'tags';
    if (/\/predicates\//.test(path)) return 'predicates';
    if (/\/item_modifiers\//.test(path)) return 'item_modifiers';
    if (/\/dimension(_type)?\//.test(path)) return /\/dimension_type\//.test(path) ? 'dimension_type' : 'dimension';
    if (/\/worldgen\//.test(path)) return 'worldgen';
    if (/\/structures\//.test(path)) return 'structures';
    return 'unknown';
  }

  function sanitizeName(s) {
    return (s || 'pack').toLowerCase().replace(/[^a-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'pack';
  }

  function sanitizeNamespace(ns) {
    return (ns || 'minecraft').toLowerCase().replace(/[^a-z0-9_.-]+/g, '_').replace(/^_+|_+$/g, '') || 'minecraft';
  }

  function fileNameFromPath(path) {
    return path.replace(/^.*\//, '');
  }

  /* ---------- New file menu ---------- */
  function showNewFileMenu() {
    var existing = $('tpd-new-menu');
    if (existing) { existing.remove(); return; }
    var btn = $('tpd-new-file');
    var rect = btn.getBoundingClientRect();
    var menu = document.createElement('div');
    menu.className = 'tpd-new-menu';
    menu.id = 'tpd-new-menu';
    menu.style.position = 'fixed';
    menu.style.top = (rect.bottom + 4) + 'px';
    menu.style.left = rect.left + 'px';
    var ns = sanitizeNamespace($('tpd-namespace').value || 'minecraft');
    TYPE_GROUPS.forEach(function (g) {
      var groupLabel = document.createElement('div');
      groupLabel.className = 'tpd-new-group';
      groupLabel.textContent = g.label;
      menu.appendChild(groupLabel);
      var item = document.createElement('div');
      item.className = 'tpd-new-item';
      item.innerHTML = '<span>New ' + g.label.toLowerCase().slice(0, -1) + '</span><span class="tpd-new-ext">' + TEMPLATES[g.key].ext + '</span>';
      item.addEventListener('click', function () {
        createNewFile(g.key, ns);
        menu.remove();
      });
      menu.appendChild(item);
    });
    document.body.appendChild(menu);
    var close = function (e) {
      if (!menu.contains(e.target) && e.target !== btn) { menu.remove(); document.removeEventListener('click', close); }
    };
    setTimeout(function () { document.addEventListener('click', close); }, 0);
  }

  function createNewFile(typeKey, ns) {
    var tmpl = TEMPLATES[typeKey];
    if (!tmpl) return;
    var ext = tmpl.ext;
    var content = tmpl.content.replace(/<namespace>/g, ns);
    var basePath = 'data/' + ns + '/' + typeKey;
    var name = 'new_' + typeKey.slice(0, -1);
    var path = basePath + '/' + name + ext;
    var counter = 1;
    while (project.files.has(path)) {
      path = basePath + '/' + name + '_' + counter + ext;
      counter++;
    }
    project.files.set(path, { name: fileNameFromPath(path), type: typeKey, content: content });
    selectFile(path);
    refreshTreeFlags(); renderFileList(); renderPreview(); renderMeta();
    showMsg('Created ' + path, true);
  }

  /* ---------- Tree ---------- */
  function buildTree() {
    var body = $('tpd-tree-body');
    body.innerHTML = '';
    if (project.files.size === 0) {
      body.innerHTML = '<p class="tpd-empty-tree">No files yet. Use "New file" to add one.</p>';
      return;
    }
    var groups = {};
    project.files.forEach(function (entry, path) {
      var parts = path.split('/');
      if (parts.length < 3) return;
      var type = parts[2];
      if (!groups[type]) groups[type] = [];
      groups[type].push({ path: path, entry: entry });
    });
    Object.keys(groups).sort().forEach(function (type) {
      var group = document.createElement('div');
      group.className = 'tpd-group';
      var head = document.createElement('div');
      head.className = 'tpd-cat tpd-cat-toggle';
      head.innerHTML = '<span class="tpd-caret">&#9654;</span> ' + type;
      var bodyGroup = document.createElement('div');
      bodyGroup.className = 'tpd-group-body';
      groups[type].forEach(function (f) {
        var node = document.createElement('div');
        node.className = 'tpd-node';
        node.dataset.path = f.path;
        node.innerHTML = '<span class="tpd-dot"></span><span class="tpd-name">' + f.entry.name + '</span>';
        node.addEventListener('click', function () { selectFile(f.path); });
        bodyGroup.appendChild(node);
      });
      head.addEventListener('click', function () {
        var open = bodyGroup.style.display !== 'none';
        bodyGroup.style.display = open ? 'none' : 'block';
        head.querySelector('.tpd-caret').textContent = open ? '&#9654;' : '&#9660;';
      });
      group.appendChild(head);
      group.appendChild(bodyGroup);
      body.appendChild(group);
    });
    refreshTreeFlags();
  }

  function refreshTreeFlags() {
    document.querySelectorAll('.tpd-node').forEach(function (n) {
      n.classList.toggle('has', project.files.has(n.dataset.path));
      n.classList.toggle('active', n.dataset.path === selectedPath);
    });
  }

  function selectFile(path) {
    if (selectedPath && project.files.has(selectedPath)) {
      project.files.get(selectedPath).content = editor.value;
    }
    selectedPath = path;
    var entry = project.files.get(path);
    if (entry) {
      editor.value = entry.content;
      editor.disabled = false;
    } else {
      editor.value = '';
      editor.disabled = true;
    }
    updateEditorHeader();
    validateCurrent();
    refreshTreeFlags();
    editor.focus();
  }

  function updateEditorHeader() {
    var header = $('tpd-editor-filename');
    if (selectedPath && project.files.has(selectedPath)) {
      header.textContent = selectedPath;
    } else {
      header.textContent = 'No file selected';
    }
  }

  /* ---------- Validation ---------- */
  function validateJSON(str) {
    try {
      JSON.parse(str);
      return { ok: true, msg: 'Valid JSON' };
    } catch (e) {
      var match = /position\s+(\d+)/.exec(e.message);
      var pos = match ? parseInt(match[1], 10) : 0;
      var line = 1;
      for (var i = 0; i < pos && i < str.length; i++) {
        if (str[i] === '\n') line++;
      }
      var col = pos - (str.lastIndexOf('\n', pos - 1) + 1) + 1;
      return { ok: false, msg: 'Invalid JSON at line ' + line + ', col ' + col + ': ' + e.message };
    }
  }

  function validateMcfunction(str) {
    var lines = str.split('\n');
    var issues = [];
    lines.forEach(function (line, i) {
      var trimmed = line.trim();
      if (!trimmed) return;
      if (trimmed.startsWith('#')) return;
      if (trimmed.startsWith('//')) return;
      if (trimmed.startsWith('$')) return;
      if (!/^[a-z0-9_./]/.test(trimmed) && !trimmed.startsWith('$')) {
        issues.push('Line ' + (i + 1) + ': command starts with unexpected character');
      }
    });
    if (issues.length === 0) return { ok: true, msg: lines.length + ' line(s)' };
    return { ok: true, msg: lines.length + ' line(s), ' + issues.length + ' warning(s)' };
  }

  function validateCurrent() {
    var validity = $('tpd-validity');
    if (!selectedPath || !project.files.has(selectedPath)) {
      if (validity) { validity.textContent = ''; validity.className = 'tpd-validity'; }
      return;
    }
    var content = editor.value;
    var entry = project.files.get(selectedPath);
    var result;
    if (entry.type === 'functions') {
      result = validateMcfunction(content);
    } else {
      result = validateJSON(content);
    }
    if (validity) {
      validity.textContent = result.msg;
      validity.className = 'tpd-validity ' + (result.ok ? 'ok' : 'err');
    }
  }

  /* ---------- pack.mcmeta ---------- */
  function buildMeta() {
    return {
      pack: {
        pack_format: parseInt($('tpc-format').value, 10) || 61,
        description: $('tpc-desc').value || ''
      }
    };
  }
  function renderMeta() {
    var el = $('tpd-meta-preview');
    if (el) el.textContent = JSON.stringify(buildMeta(), null, 2);
  }

  /* ---------- File list ---------- */
  function renderFileList() {
    var list = $('tpd-filelist');
    var count = project.files.size;
    $('tpd-file-count').textContent = count + (count === 1 ? ' file' : ' files');
    if (count === 0) { list.innerHTML = '<p class="tpc-empty">No files yet. Create one in the Editor tab.</p>'; return; }
    list.innerHTML = '';
    project.files.forEach(function (entry, path) {
      var card = document.createElement('div');
      card.className = 'tpd-filecard';
      var type = document.createElement('div');
      type.className = 'tpd-type'; type.textContent = entry.type;
      var name = document.createElement('div');
      name.className = 'tpd-fname'; name.textContent = entry.name;
      var del = document.createElement('button');
      del.className = 'tpd-del'; del.textContent = '×'; del.title = 'Remove';
      del.addEventListener('click', function () {
        if (selectedPath === path) { selectedPath = null; editor.value = ''; updateEditorHeader(); validateCurrent(); }
        project.files.delete(path);
        refreshTreeFlags(); renderFileList(); renderPreview(); renderMeta();
      });
      card.appendChild(del); card.appendChild(type); card.appendChild(name);
      list.appendChild(card);
    });
  }

  /* ---------- Preview ---------- */
  function renderPreview() {
    var list = $('tpd-preview-list');
    if (project.files.size === 0) { list.innerHTML = '<p class="tpc-empty">Add files to see a live preview here.</p>'; return; }
    list.innerHTML = '';
    project.files.forEach(function (entry, path) {
      var item = document.createElement('div');
      item.className = 'tpd-preview-item';
      var head = document.createElement('div');
      head.className = 'tpd-prev-head';
      var name = document.createElement('div');
      name.className = 'tpd-fname'; name.textContent = entry.name;
      var type = document.createElement('div');
      type.className = 'tpd-type'; type.textContent = entry.type;
      head.appendChild(name); head.appendChild(type);
      var content = document.createElement('div');
      content.className = 'tpd-preview-content';
      content.textContent = entry.content || '(empty)';
      item.appendChild(head); item.appendChild(content);
      list.appendChild(item);
    });
  }

  /* ---------- Export ---------- */
  function textToBytes(str) {
    return new TextEncoder().encode(str);
  }

  function zipName() { return sanitizeName($('tpd-name').value) + '.zip'; }

  var statusTimer = null;
  function showMsg(text, ok) {
    var m = $('tpd-status');
    if (!m) return;
    m.hidden = false;
    m.className = 'tpd-status ' + (ok ? 'ok' : 'err');
    m.textContent = text;
    if (statusTimer) clearTimeout(statusTimer);
    statusTimer = setTimeout(function () { m.hidden = true; }, ok ? 3500 : 6000);
  }

  function exportZip() {
    if (project.files.size === 0) { showMsg('Add at least one file before exporting.', false); return; }
    try {
      var files = [];
      var meta = buildMeta();
      var metaStr = JSON.stringify(meta, null, 2);
      files.push({ name: 'pack.mcmeta', data: textToBytes(metaStr) });
      project.files.forEach(function (entry, path) {
        files.push({ name: path, data: textToBytes(entry.content || '') });
      });
      var zip = TpcZip.createZip(files);
      var url = URL.createObjectURL(zip);
      var a = document.createElement('a');
      a.href = url; a.download = zipName();
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      showMsg('Exported ' + files.length + ' files to ' + zipName() + '.', true);
    } catch (e) {
      showMsg('Export failed: ' + e.message, false);
    }
  }

  function exportMetaOnly() {
    var metaStr = JSON.stringify(buildMeta(), null, 2);
    var blob = new Blob([metaStr], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'pack.mcmeta';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  /* ---------- Upload handling ---------- */
  async function handleFiles(fileList) {
    for (var i = 0; i < fileList.length; i++) {
      var f = fileList[i];
      var rel = (f.webkitRelativePath || f.name).replace(/\\/g, '/');
      var path;
      if (/^data\//i.test(rel)) {
        path = rel;
      } else {
        var ns = sanitizeNamespace($('tpd-namespace').value || 'minecraft');
        var base = sanitizeName(rel.replace(/\.[^.]+$/, ''));
        var ext = '';
        if (/\.mcfunction$/.test(rel)) {
          path = 'data/' + ns + '/functions/' + base + '.mcfunction';
        } else if (/\.json$/.test(rel)) {
          var type = guessTypeFromName(rel);
          path = 'data/' + ns + '/' + type + '/' + base + '.json';
        } else {
          path = 'data/' + ns + '/functions/' + base + '.txt';
        }
      }
      try {
        var text = await readFileAsText(f);
        var type = guessType(path);
        project.files.set(path, { name: fileNameFromPath(path), type: type, content: text });
      } catch (e) {
        showMsg('Could not load ' + f.name, false);
      }
    }
    buildTree(); renderFileList(); renderPreview(); renderMeta();
    if (!selectedPath && project.files.size > 0) selectFile(Array.from(project.files.keys())[0]);
    showMsg('Imported ' + fileList.length + ' file(s).', true);
  }

  function guessTypeFromName(name) {
    name = name.toLowerCase();
    if (name.indexOf('advancement') !== -1) return 'advancements';
    if (name.indexOf('recipe') !== -1) return 'recipes';
    if (name.indexOf('loot') !== -1 || name.indexOf('loot_table') !== -1) return 'loot_tables';
    if (name.indexOf('tag') !== -1) return 'tags';
    if (name.indexOf('predicate') !== -1) return 'predicates';
    if (name.indexOf('item_modifier') !== -1 || name.indexOf('loot_modifier') !== -1) return 'item_modifiers';
    if (name.indexOf('dimension_type') !== -1) return 'dimension_type';
    if (name.indexOf('dimension') !== -1) return 'dimension';
    if (name.indexOf('worldgen') !== -1 || name.indexOf('configured_feature') !== -1 || name.indexOf('placed_feature') !== -1) return 'worldgen';
    if (name.indexOf('structure') !== -1) return 'structures';
    return 'functions';
  }

  function readFileAsText(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  /* ---------- Wire up UI ---------- */
  function activateTab(name) {
    document.querySelectorAll('.tpd .tab').forEach(function (t) {
      var on = t.dataset.tab === name;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    document.querySelectorAll('.tpd .panel').forEach(function (p) {
      p.classList.toggle('active', p.id === 'tab-' + name);
    });
    if (name === 'preview') renderPreview();
    if (name === 'files') renderFileList();
    if (name === 'export') renderMeta();
  }

  function bindUI() {
    var tabsEl = document.querySelector('.tpd .tabs');
    if (tabsEl) {
      tabsEl.addEventListener('click', function (e) {
        var t = e.target.closest ? e.target.closest('.tab') : null;
        if (t && t.dataset && t.dataset.tab) activateTab(t.dataset.tab);
      });
    }
    document.querySelectorAll('.tpd .tab').forEach(function (tab) {
      tab.addEventListener('click', function () { activateTab(tab.dataset.tab); });
      tab.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateTab(tab.dataset.tab); }
      });
    });

    $('tpd-new-file').addEventListener('click', function (e) {
      e.stopPropagation();
      showNewFileMenu();
    });

    $('tpd-new-blank').addEventListener('click', function () {
      var ns = sanitizeNamespace($('tpd-namespace').value || 'minecraft');
      showNewFileMenu();
    });

    $('tpd-delete-file').addEventListener('click', function () {
      if (!selectedPath) { showMsg('No file selected.', false); return; }
      project.files.delete(selectedPath);
      selectedPath = null;
      editor.value = '';
      updateEditorHeader(); validateCurrent();
      refreshTreeFlags(); renderFileList(); renderPreview(); renderMeta();
      showMsg('Deleted file.', true);
    });

    $('tpd-validate').addEventListener('click', function () {
      validateCurrent();
      var validity = $('tpd-validity');
      if (validity && validity.classList.contains('err')) {
        showMsg(validity.textContent, false);
      } else {
        showMsg('File looks valid.', true);
      }
    });

    $('tpd-pretty').addEventListener('click', function () {
      if (!selectedPath || !project.files.has(selectedPath)) { showMsg('Select a JSON file first.', false); return; }
      try {
        var parsed = JSON.parse(editor.value);
        editor.value = JSON.stringify(parsed, null, 2);
        project.files.get(selectedPath).content = editor.value;
        validateCurrent();
        renderPreview();
        showMsg('Pretty-printed.', true);
      } catch (e) {
        showMsg('Cannot pretty-print invalid JSON.', false);
      }
    });

    editor.addEventListener('input', function () {
      if (saveDebounce) clearTimeout(saveDebounce);
      saveDebounce = setTimeout(function () {
        if (selectedPath && project.files.has(selectedPath)) {
          project.files.get(selectedPath).content = editor.value;
          renderPreview();
        }
      }, 300);
      validateCurrent();
    });

    // Metadata inputs
    $('tpd-name').addEventListener('input', function () { project.name = this.value; renderMeta(); });
    $('tpc-format').addEventListener('change', function () { project.format = parseInt(this.value, 10) || 61; renderMeta(); });
    $('tpc-desc').addEventListener('input', function () { project.description = this.value; renderMeta(); });
    $('tpd-namespace').addEventListener('input', function () { project.namespace = sanitizeNamespace(this.value); renderMeta(); });

    // Tree search
    $('tpd-tree-search').addEventListener('input', function () {
      var q = this.value.toLowerCase();
      document.querySelectorAll('.tpd-node').forEach(function (n) {
        var show = !q || n.dataset.path.toLowerCase().indexOf(q) !== -1 || (n.textContent || '').toLowerCase().indexOf(q) !== -1;
        n.style.display = show ? '' : 'none';
      });
      document.querySelectorAll('.tpd-group').forEach(function (group) {
        var cat = group.querySelector('.tpd-cat');
        var nodes = group.querySelectorAll('.tpd-node');
        var visible = false;
        nodes.forEach(function (n) { if (n.style.display !== 'none') visible = true; });
        if (cat) cat.style.display = visible ? '' : 'none';
      });
    });

    // Export
    $('tpd-export-zip').addEventListener('click', exportZip);
    $('tpd-export-meta').addEventListener('click', exportMetaOnly);

    // Save / load / import / delete
    $('tpd-save').addEventListener('click', saveProject);
    $('tpd-load').addEventListener('click', loadSavedProject);
    $('tpd-export-project').addEventListener('click', exportProjectFile);
    $('tpd-import').addEventListener('click', function () { $('tpd-import-file').click(); });
    $('tpd-import-file').addEventListener('change', function () {
      if (this.files && this.files[0]) importProjectFile(this.files[0]);
      this.value = '';
    });
    $('tpd-clear-project').addEventListener('click', function () {
      if (window.confirm('Delete the saved project from this browser?')) deleteSavedProject();
    });

    // Upload
    $('tpd-upload-btn').addEventListener('click', function () { $('tpc-upload').click(); });
    $('tpc-upload').addEventListener('change', function () { handleFiles(this.files); this.value = ''; });
    var dz = $('tpd-drop');
    ['dragenter', 'dragover'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('drag'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('drag'); });
    });
    dz.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.ctrlKey && e.key.toLowerCase() === 's') { e.preventDefault(); saveProject(); }
    });
  }

  /* ---------- Init ---------- */
  function init() {
    if (inited) return;
    inited = true;
    if (!editor || typeof TpcZip === 'undefined') {
      console.error('TPD init failed: missing editor or TpcZip.');
      return;
    }
    project.name = $('tpd-name').value;
    project.format = parseInt($('tpc-format').value, 10) || 61;
    project.description = $('tpc-desc').value;
    project.namespace = sanitizeNamespace($('tpd-namespace').value || 'minecraft');
    bindUI();
    buildTree();
    renderFileList();
    renderPreview();
    renderMeta();
    try { checkSavedExists(); } catch (e) {}
    // Auto-select first file if any
    try {
      var first = project.files.size > 0 ? Array.from(project.files.keys())[0] : null;
      if (first) selectFile(first);
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
