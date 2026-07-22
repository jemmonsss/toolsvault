/* Minecraft Content Pack Maker — app logic.
 * Depends on: TpcZip (assets/js/zip-writer.js)
 * State: project = { name, format, description, namespace, textures: Map, content: Map }
 * content entries: { id, type, name, path, data, content }
 */
(function () {
  'use strict';

  /* ---------- Content type definitions ---------- */
  var CONTENT_TYPES = {
    items: { folder: 'items', ext: '.json', simple: 'item', label: 'Items' },
    recipes: { folder: 'recipes', ext: '.json', simple: 'recipe', label: 'Recipes' },
    loot_tables: { folder: 'loot_tables', ext: '.json', simple: 'loot', label: 'Loot Tables' },
    advancements: { folder: 'advancements', ext: '.json', simple: 'advancement', label: 'Advancements' },
    predicates: { folder: 'predicates', ext: '.json', simple: 'predicate', label: 'Predicates' },
    functions: { folder: 'functions', ext: '.mcfunction', simple: 'function', label: 'Functions' },
    tags: { folder: 'tags', ext: '.json', simple: 'tag', label: 'Tags' }
  };

  /* ---------- Pack templates ---------- */
  var PACK_TEMPLATES = {
    custom_item: 'Custom Item',
    tool_pack: 'Tool Pack',
    food_pack: 'Food Pack',
    recipe_pack: 'Recipe Pack',
    loot_table_pack: 'Loot Table Pack',
    advancement_pack: 'Advancement Pack',
    function_pack: 'Function Pack',
    complete_pack: 'Complete Pack'
  };

  /* ---------- State ---------- */
  var project = {
    name: 'My Content Pack',
    format: 41,
    description: 'My custom content pack',
    namespace: 'mypack',
    textures: new Map(),
    content: new Map()
  };
  var selectedId = null;
  var selectedType = null;
  var simpleMode = false;
  var inited = false;
  var statusTimer = null;

  /* ---------- Element refs ---------- */
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- Utilities ---------- */
  function sanitizeName(s) {
    return (s || 'pack').toLowerCase().replace(/[^a-z0-9_\-]+/g, '_').replace(/^_+|_+$/g, '') || 'pack';
  }
  function sanitizeNamespace(s) {
    return (s || 'mypack').toLowerCase().replace(/[^a-z0-9_\-]+/g, '_').replace(/^_+|_+$/g, '') || 'mypack';
  }
  function escHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function tryParseJson(str) {
    try { return JSON.parse(str); } catch (e) { return null; }
  }
  function generateId() {
    return 'c_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
  }

  /* ---------- Path helpers ---------- */
  function contentPath(typeKey, name, ns) {
    return 'data/' + ns + '/' + CONTENT_TYPES[typeKey].folder + '/' + sanitizeName(name) + CONTENT_TYPES[typeKey].ext;
  }
  function texturePath(name, ns) {
    return 'assets/' + ns + '/textures/item/' + sanitizeName(name) + '.png';
  }
  function modelPath(name, ns) {
    return 'assets/' + ns + '/models/item/' + sanitizeName(name) + '.json';
  }

  /* ---------- Persistence ---------- */
  var STORAGE_KEY = 'tpm:project';
  var SAVE_VERSION = 1;

  function serializeProject() {
    var filesArr = [];
    project.textures.forEach(function (canvas, name) {
      filesArr.push({ name: name, type: 'texture', data: canvasToDataURL(canvas) });
    });
    var contentArr = [];
    project.content.forEach(function (entry, id) {
      contentArr.push({ id: id, type: entry.type, name: entry.name, path: entry.path, data: entry.data, content: entry.content });
    });
    return {
      version: SAVE_VERSION,
      name: project.name,
      format: project.format,
      description: project.description,
      namespace: project.namespace,
      textures: filesArr,
      content: contentArr
    };
  }

  function canvasToDataURL(c) { return c.toDataURL('image/png'); }
  function dataUrlToCanvas(dataUrl) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var c = document.createElement('canvas');
        c.width = img.naturalWidth || img.width;
        c.height = img.naturalHeight || img.height;
        c.getContext('2d').drawImage(img, 0, 0);
        resolve(c);
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  function applyProject(obj) {
    if (!obj || !obj.name) throw new Error('Invalid project');
    project.name = obj.name;
    project.format = obj.format || 41;
    project.description = obj.description || '';
    project.namespace = obj.namespace || 'mypack';
    project.textures = new Map();
    project.content = new Map();
    $('tpm-name').value = project.name;
    $('tpm-format').value = String(project.format);
    $('tpm-desc').value = project.description;
    $('tpm-namespace').value = project.namespace;
    if (obj.textures) {
      obj.textures.forEach(function (t) {
        dataUrlToCanvas(t.data).then(function (c) {
          project.textures.set(t.name, c);
          renderPreview();
        });
      });
    }
    if (obj.content) {
      obj.content.forEach(function (c) {
        project.content.set(c.id, c);
      });
    }
    renderFileList();
    renderPreview();
    renderMeta();
    refreshTreeFlags();
  }

  function storageAvailable() {
    try { return 'localStorage' in window && window.localStorage !== null; } catch (e) { return false; }
  }
  function saveProject() {
    if (!storageAvailable()) { showMsg('Local storage is not available.', false); return; }
    try {
      var data = serializeProject();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      var label = $('tpm-saved-label');
      label.hidden = false; label.textContent = 'Saved ' + new Date().toLocaleTimeString();
      showMsg('Project saved.', true);
    } catch (e) { showMsg('Save failed: ' + e.message, false); }
  }
  function loadSavedProject() {
    if (!storageAvailable()) { showMsg('Local storage is not available.', false); return; }
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) { showMsg('No saved project found.', false); return; }
      applyProject(JSON.parse(raw));
      showMsg('Project loaded.', true);
    } catch (e) { showMsg('Load failed: ' + e.message, false); }
  }
  function deleteSavedProject() {
    if (!storageAvailable()) return;
    localStorage.removeItem(STORAGE_KEY);
    showMsg('Saved project deleted.', true);
  }
  function exportProjectFile() {
    var data = serializeProject();
    var blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = sanitizeName(project.name) + '.tpm.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }
  function importProjectFile(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        applyProject(JSON.parse(reader.result));
        showMsg('Project imported.', true);
      } catch (e) { showMsg('Invalid project file.', false); }
    };
    reader.readAsText(file);
  }

  /* ---------- Content builders ---------- */
  function createContent(typeKey, name, extraData) {
    var id = generateId();
    var path = contentPath(typeKey, name, project.namespace);
    var data = {
      id: id,
      type: typeKey,
      name: sanitizeName(name),
      path: path,
      data: extraData || {},
      content: ''
    };
    project.content.set(id, data);
    selectContent(id);
    renderFileList();
    renderPreview();
    refreshTreeFlags();
    showMsg('Created ' + (CONTENT_TYPES[typeKey].label.toLowerCase()) + ': ' + data.name, true);
  }
  function deleteContent(id) {
    if (!id) return;
    project.content.delete(id);
    if (selectedId === id) { selectedId = null; selectedType = null; updateEditorHeader(); }
    renderFileList();
    renderPreview();
    refreshTreeFlags();
  }
  function selectContent(id) {
    selectedId = id;
    selectedType = id ? project.content.get(id).type : null;
    updateEditorHeader();
    refreshTreeFlags();
  }
  function updateEditorHeader() {
    var filenameEl = $('tpm-editor-filename');
    if (selectedId && project.content.has(selectedId)) {
      var entry = project.content.get(selectedId);
      filenameEl.textContent = entry.path;
    } else {
      filenameEl.textContent = 'No content selected';
    }
  }

  /* ---------- JSON generators ---------- */
  function buildItemJSON(data) {
    var itemName = sanitizeName(data.item_name || 'custom_item');
    var displayName = data.display_name || 'Custom Item';
    var hasTexture = project.textures.has(itemName + '.png');
    var model = hasTexture ? project.namespace + ':item/' + itemName : 'minecraft:item/generated';
    var cmd = data.custom_model_data ? parseInt(data.custom_model_data, 10) : 1;
    var json = {
      model: {
        type: 'minecraft:model',
        model: {
          type: 'minecraft:select',
          property: 'custom_model_data',
          cases: {
            [String(cmd)]: { type: 'minecraft:model', model: model }
          },
          fallback: { type: 'minecraft:model', model: model }
        }
      }
    };
    if (displayName) {
      json.display_name = displayName;
    }
    return JSON.stringify(json, null, 2);
  }

  function buildRecipeJSON(data) {
    var type = data.recipe_type || 'minecraft:crafting_shaped';
    var key = {};
    var pattern = [];
    var result = data.result_item || 'minecraft:stone';
    var count = parseInt(data.result_count, 10) || 1;
    var ingredients = data.ingredients ? data.ingredients.split('\n').filter(Boolean) : [];
    if (type === 'minecraft:crafting_shaped') {
      for (var i = 0; i < Math.min(3, ingredients.length); i++) {
        var row = ingredients[i] || '   ';
        pattern.push(row.split(''));
        for (var j = 0; j < row.length; j++) {
          var ch = row[j];
          if (ch !== ' ' && !key[ch]) key[ch] = { item: 'minecraft:stone' };
        }
      }
      var shaped = { type: type, pattern: pattern, key: key, result: { item: result, count: count } };
      return JSON.stringify(shaped, null, 2);
    } else {
      var ingredientsFlat = [];
      ingredients.forEach(function (ing) { ingredientsFlat.push({ item: 'minecraft:stone' }); });
      var shapeless = { type: type, ingredients: ingredientsFlat, result: { item: result, count: count } };
      return JSON.stringify(shapeless, null, 2);
    }
  }

  function buildLootTableJSON(data) {
    var pool = {
      rolls: 1,
      entries: [
        {
          type: 'minecraft:item',
          name: data.loot_item || 'minecraft:diamond',
          functions: data.functions ? data.functions.split('\n').filter(Boolean).map(function (f) {
            return { function: 'minecraft:set_count', count: { type: 'minecraft:uniform', min: 1, max: 3 } };
          }) : []
        }
      ]
    };
    return JSON.stringify({ type: 'minecraft:block', pools: [pool] }, null, 2);
  }

  function buildAdvancementJSON(data) {
    return JSON.stringify({
      criteria: {
        trigger: { trigger: 'minecraft:impossible' }
      },
      rewards: { loot: data.reward_loot ? data.reward_loot.split('\n').filter(Boolean) : [] }
    }, null, 2);
  }

  function buildPredicateJSON(data) {
    return JSON.stringify({ condition: 'minecraft:alternative', terms: [] }, null, 2);
  }

  function buildFunctionLines(data) {
    return data.lines || 'say Hello from ' + project.namespace + '!';
  }

  function buildTagJSON(data, itemName) {
    var tagName = sanitizeName(data.tag_name || itemName) || 'custom';
    var values = data.values ? data.values.split('\n').filter(Boolean) : [];
    var entries = values.map(function (v) { return { id: v || 'minecraft:stone' }; });
    return JSON.stringify({ values: entries }, null, 2);
  }

  /* ---------- Simple form renderers ---------- */
  function renderSimpleForm() {
    if (!selectedId || !project.content.has(selectedId)) return;
    var entry = project.content.get(selectedId);
    var body = $('tpm-simple-body');
    body.innerHTML = '';
    var typeKey = entry.type;
    if (typeKey === 'items') renderSimpleItem(entry, body);
    else if (typeKey === 'recipes') renderSimpleRecipe(entry, body);
    else if (typeKey === 'loot_tables') renderSimpleLootTable(entry, body);
    else if (typeKey === 'advancements') renderSimpleAdvancement(entry, body);
    else if (typeKey === 'predicates') renderSimplePredicate(entry, body);
    else if (typeKey === 'functions') renderSimpleFunction(entry, body);
    else if (typeKey === 'tags') renderSimpleTag(entry, body);
  }

  function bindSimpleInput(id, data, cb) {
    var el = $(id);
    if (!el) return;
    if (el.tagName === 'INPUT' || el.tagName === 'SELECT') {
      el.oninput = function (e) { cb(e.target.value); };
    } else {
      el.oninput = function (e) { cb(e.target.value); };
    }
  }

  function renderSimpleItem(entry, body) {
    var data = entry.data || {};
    body.innerHTML = buildItemSimple(data);
    bindSimpleInput('tpmsi-name', data, function (v) { data.item_name = v; entry.content = buildItemJSON(data); updateEditorFromSimple(); });
    bindSimpleInput('tpmsi-display', data, function (v) { data.display_name = v; entry.content = buildItemJSON(data); updateEditorFromSimple(); });
    bindSimpleInput('tpmsi-cmd', data, function (v) { data.custom_model_data = v; entry.content = buildItemJSON(data); updateEditorFromSimple(); });
  }
  function buildItemSimple(data) {
    return '<div class="tpm-row"><div class="tpm-field"><label>Item name</label><input id="tpmsi-name" value="' + escHtml(data.item_name || '') + '"></div>' +
      '<div class="tpm-field"><label>Display name</label><input id="tpmsi-display" value="' + escHtml(data.display_name || '') + '"></div></div>' +
      '<div class="tpm-field"><label>Custom Model Data</label><input id="tpmsi-cmd" type="number" value="' + escHtml(data.custom_model_data || '1') + '"></div>';
  }

  function renderSimpleRecipe(entry, body) {
    var data = entry.data || {};
    body.innerHTML = buildRecipeSimple(data);
    bindSimpleInput('tpmsr-type', data, function (v) { data.recipe_type = v === 'shapeless' ? 'minecraft:crafting_shapeless' : 'minecraft:crafting_shaped'; entry.content = buildRecipeJSON(data); updateEditorFromSimple(); });
    bindSimpleInput('tpmsr-result', data, function (v) { data.result_item = v; entry.content = buildRecipeJSON(data); updateEditorFromSimple(); });
    bindSimpleInput('tpmsr-count', data, function (v) { data.result_count = v; entry.content = buildRecipeJSON(data); updateEditorFromSimple(); });
    bindSimpleInput('tpmsr-ing', data, function (v) { data.ingredients = v; entry.content = buildRecipeJSON(data); updateEditorFromSimple(); });
  }
  function buildRecipeSimple(data) {
    return '<div class="tpm-row"><div class="tpm-field"><label>Recipe type</label><select id="tpmsr-type"><option value="shaped">Shaped</option><option value="shapeless">Shapeless</option></select></div>' +
      '<div class="tpm-field"><label>Result item</label><input id="tpmsr-result" value="' + escHtml(data.result_item || 'minecraft:stone') + '"></div></div>' +
      '<div class="tpm-field"><label>Result count</label><input id="tpmsr-count" type="number" value="' + escHtml(data.result_count || '1') + '"></div>' +
      '<div class="tpm-field"><label>Ingredients (one per line)</label><textarea id="tpmsr-ing" rows="3">' + escHtml(data.ingredients || '') + '</textarea></div>';
  }

  function renderSimpleLootTable(entry, body) {
    var data = entry.data || {};
    body.innerHTML = buildLootTableSimple(data);
    bindSimpleInput('tpmsl-item', data, function (v) { data.loot_item = v; entry.content = buildLootTableJSON(data); updateEditorFromSimple(); });
    bindSimpleInput('tpmsl-fns', data, function (v) { data.functions = v; entry.content = buildLootTableJSON(data); updateEditorFromSimple(); });
  }
  function buildLootTableSimple(data) {
    return '<div class="tpm-field"><label>Loot item</label><input id="tpmsl-item" value="' + escHtml(data.loot_item || 'minecraft:diamond') + '"></div>' +
      '<div class="tpm-field"><label>Functions (one per line)</label><textarea id="tpmsl-fns" rows="3">' + escHtml(data.functions || '') + '</textarea></div>';
  }

  function renderSimpleAdvancement(entry, body) {
    var data = entry.data || {};
    body.innerHTML = buildAdvancementSimple(data);
    bindSimpleInput('tpmsa-reward', data, function (v) { data.reward_loot = v; entry.content = buildAdvancementJSON(data); updateEditorFromSimple(); });
  }
  function buildAdvancementSimple(data) {
    return '<div class="tpm-field"><label>Reward loot tables (one file per line)</label><textarea id="tpmsa-reward" rows="3">' + escHtml(data.reward_loot || '') + '</textarea></div>';
  }

  function renderSimplePredicate(entry, body) {
    var data = entry.data || {};
    body.innerHTML = '<div class="tpm-field"><label>Predicate</label><input disabled value="Simple predicate editor coming soon."></div>';
  }
  function renderSimpleFunction(entry, body) {
    body.innerHTML = '<div class="tpm-field"><label>Function commands</label><textarea id="tpmsf-lines" rows="6">' + escHtml(entry.content || '') + '</textarea></div>';
    bindSimpleInput('tpmsf-lines', entry, function (v) { entry.content = v; updateEditorFromSimple(); });
  }
  function renderSimpleTag(entry, body) {
    var data = entry.data || {};
    body.innerHTML = buildTagSimple(data, entry.name);
    bindSimpleInput('tpmst-tag', data, function (v) { data.tag_name = v; entry.content = buildTagJSON(data, entry.name); updateEditorFromSimple(); });
    bindSimpleInput('tpmst-vals', data, function (v) { data.values = v; entry.content = buildTagJSON(data, entry.name); updateEditorFromSimple(); });
  }
  function buildTagSimple(data, name) {
    return '<div class="tpm-field"><label>Tag name</label><input id="tpmst-tag" value="' + escHtml(data.tag_name || name || 'custom') + '"></div>' +
      '<div class="tpm-field"><label>Values (one id per line)</label><textarea id="tpmst-vals" rows="3">' + escHtml(data.values || '') + '</textarea></div>';
  }

  function updateEditorFromSimple() {
    if (selectedId && project.content.has(selectedId)) {
      var entry = project.content.get(selectedId);
      $('tpm-editor').value = entry.content || '';
    }
    renderPreview();
    renderMeta();
  }

  /* ---------- Tree ---------- */
  function buildTree() {
    var body = $('tpm-tree-body');
    body.innerHTML = '<p class="tpm-empty">No content yet. Click "+ New" to add items, recipes, and more.</p>';
    Object.keys(CONTENT_TYPES).forEach(function (typeKey) {
      var section = document.createElement('div');
      section.className = 'tpm-section';
      section.textContent = CONTENT_TYPES[typeKey].label;
      body.appendChild(section);
      var group = document.createElement('div');
      group.className = 'tpm-group-body';
      group.dataset.type = typeKey;
      body.appendChild(group);
    });
    refreshTreeFlags();
  }

  function refreshTreeFlags() {
    var body = $('tpm-tree-body');
    if (!body) return;
    body.querySelectorAll('.tpm-group-body').forEach(function (g) {
      var typeKey = g.dataset.type;
      var found = false;
      project.content.forEach(function (entry) {
        if (entry.type === typeKey) {
          found = true;
          var node = document.createElement('div');
          node.className = 'tpm-node';
          node.dataset.id = entry.id;
          node.innerHTML = '<span class="tpm-dot"></span><span class="tpm-name">' + escHtml(entry.name) + '</span>';
          node.addEventListener('click', function () { selectContent(entry.id); loadIntoEditor(entry); });
          g.appendChild(node);
        }
      });
      if (!found) {
        g.innerHTML = '<div class="tpm-loading">None yet.</div>';
      }
    });
    document.querySelectorAll('.tpm-node').forEach(function (n) {
      n.classList.toggle('active', n.dataset.id === selectedId);
    });
  }

  function loadIntoEditor(entry) {
    $('tpm-editor-filename').textContent = entry.path;
    $('tpm-editor').value = entry.content || '';
    if (simpleMode) renderSimpleForm();
  }

  /* ---------- Render views ---------- */
  function renderFileList() {
    var list = $('tpm-filelist');
    var countEl = $('tpm-file-count');
    var count = project.content.size + project.textures.size;
    countEl.textContent = count + (count === 1 ? ' item' : ' items');
    if (count === 0) { list.innerHTML = '<p class="tpm-empty">No content yet. Create some in the Editor tab.</p>'; return; }
    list.innerHTML = '';
    project.content.forEach(function (entry, id) {
      var card = document.createElement('div');
      card.className = 'tpm-filecard';
      card.innerHTML = '<div class="tpm-type">' + escHtml(entry.type) + '</div><div class="tpm-fname">' + escHtml(entry.name) + '</div>';
      var del = document.createElement('button');
      del.className = 'tpm-del'; del.textContent = '×'; del.title = 'Remove';
      del.addEventListener('click', function () { deleteContent(id); });
      card.appendChild(del);
      list.appendChild(card);
    });
  }

  function renderPreview() {
    var list = $('tpm-preview-list');
    if (project.content.size === 0 && project.textures.size === 0) {
      list.innerHTML = '<p class="tpm-empty">Add content to see a live preview here.</p>';
      return;
    }
    list.innerHTML = '';
    project.content.forEach(function (entry, id) {
      var item = document.createElement('div');
      item.className = 'tpm-preview-item';
      item.innerHTML = '<div class="tpm-prev-head"><span class="tpm-fname">' + escHtml(entry.name) + '</span><span class="tpm-type">' + escHtml(entry.type) + '</span></div>' +
        '<div class="tpm-preview-content">' + escHtml(entry.content || '') + '</div>';
      list.appendChild(item);
    });
    project.textures.forEach(function (canvas, name) {
      var item = document.createElement('div');
      item.className = 'tpm-preview-item';
      item.innerHTML = '<div class="tpm-prev-head"><span class="tpm-fname">' + escHtml(name) + '</span><span class="tpm-type">texture</span></div>' +
        '<div class="tpm-preview-content"><img src="' + canvasToDataURL(canvas) + '" style="max-width:64px;image-rendering:pixelated"></div>';
      list.appendChild(item);
    });
  }

  function buildMeta() {
    var ns = sanitizeNamespace($('tpm-namespace').value);
    return { pack: { pack_format: parseInt($('tpm-format').value, 10), description: $('tpm-desc').value } };
  }
  function renderMeta() {
    $('tpm-meta-preview').textContent = JSON.stringify(buildMeta(), null, 2);
  }

  /* ---------- Export ---------- */
  function textToBytes(str) {
    var d = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) d[i] = str.charCodeAt(i);
    return d;
  }

  function zipName() { return sanitizeName(project.name) + '.zip'; }

  function showMsg(text, ok) {
    var m = $('tpm-status');
    if (!m) return;
    m.hidden = false;
    m.className = 'tpm-status ' + (ok ? 'ok' : 'err');
    m.textContent = text;
    if (statusTimer) clearTimeout(statusTimer);
    statusTimer = setTimeout(function () { m.hidden = true; }, ok ? 3500 : 6000);
  }

  async function exportZip() {
    if (project.content.size === 0 && project.textures.size === 0) { showMsg('Add at least one item or texture before exporting.', false); return; }
    try {
      var files = [];
      var meta = buildMeta();
      var metaStr = JSON.stringify(meta, null, 2);
      files.push({ name: 'pack.mcmeta', data: textToBytes(metaStr) });
      var ns = sanitizeNamespace(project.namespace);
      project.textures.forEach(function (canvas, name) {
        canvas.toBlob(function (blob) {
          var fr = new FileReader();
          fr.onload = function () { files.push({ name: texturePath(name, ns), data: new Uint8Array(fr.result) }); };
          fr.readAsArrayBuffer(blob);
        }, 'image/png');
      });
      project.content.forEach(function (entry) {
        if (entry.type === 'items' || entry.type === 'recipes' || entry.type === 'loot_tables' || entry.type === 'advancements' || entry.type === 'predicates' || entry.type === 'tags') {
          files.push({ name: entry.path, data: textToBytes(entry.content || '{}') });
          var itemName = entry.name;
          files.push({ name: modelPath(itemName, ns), data: textToBytes(JSON.stringify({ parent: 'minecraft:item/generated', textures: { layer0: ns + ':item/' + itemName } }, null, 2)) });
        } else if (entry.type === 'functions') {
          files.push({ name: entry.path, data: textToBytes(entry.content || '') });
          var loadTag = 'data/' + ns + '/tags/functions/load.json';
          if (!files.some(function (f) { return f.name === loadTag; })) {
            files.push({ name: loadTag, data: textToBytes(JSON.stringify({ values: [ns + ':load' ] }, null, 2)) });
          }
        }
      });
      await new Promise(function (resolve) { setTimeout(resolve, 50); });
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

  async function exportDatapackOnly() {
    if (project.content.size === 0) { showMsg('Add content before exporting.', false); return; }
    try {
      var files = [];
      var ns = sanitizeNamespace(project.namespace);
      project.content.forEach(function (entry) {
        files.push({ name: entry.path, data: textToBytes(entry.content || '{}') });
      });
      var zip = TpcZip.createZip(files);
      var url = URL.createObjectURL(zip);
      var a = document.createElement('a');
      a.href = url; a.download = sanitizeName(project.name) + '_datapack.zip';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      showMsg('Exported datapack.', true);
    } catch (e) { showMsg('Export failed: ' + e.message, false); }
  }

  async function exportResourcePackOnly() {
    if (project.textures.size === 0) { showMsg('Add textures before exporting.', false); return; }
    try {
      var files = [];
      var meta = buildMeta();
      files.push({ name: 'pack.mcmeta', data: textToBytes(JSON.stringify(meta, null, 2)) });
      var ns = sanitizeNamespace(project.namespace);
      await new Promise(function (resolve, done) {
        var pending = project.textures.size;
        if (pending === 0) { done(); return; }
        project.textures.forEach(function (canvas, name) {
          canvas.toBlob(function (blob) {
            var fr = new FileReader();
            fr.onload = function () {
              files.push({ name: texturePath(name, ns), data: new Uint8Array(fr.result) });
              if (--pending === 0) done();
            };
            fr.readAsArrayBuffer(blob);
          }, 'image/png');
        });
      });
      var zip = TpcZip.createZip(files);
      var url = URL.createObjectURL(zip);
      var a = document.createElement('a');
      a.href = url; a.download = sanitizeName(project.name) + '_resourcepack.zip';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      showMsg('Exported resource pack.', true);
    } catch (e) { showMsg('Export failed: ' + e.message, false); }
  }

  /* ---------- Upload handling ---------- */
  async function handleFiles(fileList) {
    for (var i = 0; i < fileList.length; i++) {
      var f = fileList[i];
      if (!/image\//.test(f.type)) continue;
      try {
        var img = await new Promise(function (resolve, reject) {
          var reader = new FileReader();
          reader.onload = function () {
            var img = new Image();
            img.onload = function () { resolve(img); };
            img.onerror = reject;
            img.src = reader.result;
          };
          reader.onerror = reject;
          reader.readAsDataURL(f);
        });
        var name = f.name.replace(/\.[^.]+$/, '') + '.png';
        var c = document.createElement('canvas');
        c.width = img.width || 16; c.height = img.height || 16;
        c.getContext('2d').drawImage(img, 0, 0);
        project.textures.set(name, c);
        renderPreview();
        showMsg('Loaded texture ' + name + '.', true);
      } catch (e) { showMsg('Could not load ' + f.name, false); }
    }
  }

  /* ---------- Tabs ---------- */
  function activateTab(name) {
    document.querySelectorAll('.tpm .tab').forEach(function (t) {
      var on = t.dataset.tab === name;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    document.querySelectorAll('.tpm .panel').forEach(function (p) {
      p.classList.toggle('active', p.id === 'tab-' + name);
    });
    if (name === 'preview') renderPreview();
    if (name === 'files') renderFileList();
    if (name === 'export') renderMeta();
    if (name === 'editor' && simpleMode) renderSimpleForm();
  }

  /* ---------- Validation helpers ---------- */
  function validateJSON(str) {
    try { JSON.parse(str); return true; } catch (e) { return false; }
  }
  function validateMcfunction(str) {
    return true;
  }
  function validateCurrent() {
    var el = $('tpm-editor');
    if (!el) return true;
    var str = el.value.trim();
    if (!str) return true;
    if (selectedId && project.content.has(selectedId)) {
      var entry = project.content.get(selectedId);
      if (entry.type === 'functions') return validateMcfunction(str);
      return validateJSON(str);
    }
    return true;
  }
  function updateValidity() {
    var el = $('tpm-validity');
    if (!el) return;
    var ok = validateCurrent();
    el.textContent = ok ? 'Valid' : 'Invalid JSON';
    el.className = 'tpm-validity ' + (ok ? 'ok' : 'err');
  }

  /* ---------- UI binding ---------- */
  function bindUI() {
    // Tabs
    var tabsEl = document.querySelector('.tpm .tabs');
    if (tabsEl) {
      tabsEl.addEventListener('click', function (e) {
        var t = e.target.closest ? e.target.closest('.tab') : null;
        if (t && t.dataset && t.dataset.tab) activateTab(t.dataset.tab);
      });
    }
    document.querySelectorAll('.tpm .tab').forEach(function (tab) {
      tab.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateTab(tab.dataset.tab); }
      });
    });

    // New / Delete / Templates
    $('tpm-new-content').addEventListener('click', function () {
      var name = prompt('Content name (e.g. my_sword):', 'custom_item');
      if (!name) return;
      createContent('items', name);
    });
    $('tpm-delete-content').addEventListener('click', function () {
      if (!selectedId) return;
      if (!window.confirm('Delete this content?')) return;
      deleteContent(selectedId);
    });
    var templateBtn = $('tpm-load-template');
    if (templateBtn) {
      templateBtn.addEventListener('click', function () {
        var choice = prompt('Template: custom_item, tool_pack, food_pack, recipe_pack, loot_table_pack, advancement_pack, function_pack, complete_pack');
        if (!choice) return;
        applyTemplate(choice);
      });
    }

    // Mode toggle
    $('tpm-mode-toggle').addEventListener('click', function () {
      simpleMode = !simpleMode;
      this.textContent = simpleMode ? 'Simple mode: on' : 'Simple mode: off';
      $('tpm-simple').hidden = !simpleMode;
      if (simpleMode) renderSimpleForm();
    });

    // Editor
    $('tpm-editor').addEventListener('input', function () {
      if (selectedId && project.content.has(selectedId)) {
        project.content.get(selectedId).content = this.value;
      }
      updateValidity();
      renderPreview();
    });

    // Save / load / import / export
    $('tpm-save').addEventListener('click', saveProject);
    $('tpm-load').addEventListener('click', loadSavedProject);
    $('tpm-export-project').addEventListener('click', exportProjectFile);
    $('tpm-import').addEventListener('click', function () { $('tpm-import-file').click(); });
    $('tpm-import-file').addEventListener('change', function () {
      if (this.files && this.files[0]) importProjectFile(this.files[0]);
      this.value = '';
    });
    $('tpm-clear-project').addEventListener('click', function () {
      if (window.confirm('Delete the saved project from this browser?')) deleteSavedProject();
    });

    // Export buttons
    $('tpm-export-zip').addEventListener('click', exportZip);
    $('tpm-export-datapack').addEventListener('click', exportDatapackOnly);
    $('tpm-export-resource').addEventListener('click', exportResourcePackOnly);

    // Upload
    $('tpm-upload-btn').addEventListener('click', function () { $('tpm-upload').click(); });
    $('tpm-upload').addEventListener('change', function () { handleFiles(this.files); this.value = ''; });
    var dz = $('tpm-drop');
    ['dragenter', 'dragover'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('drag'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('drag'); });
    });
    dz.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    });

    // Metadata inputs
    $('tpm-name').addEventListener('input', function () { project.name = this.value; });
    $('tpm-format').addEventListener('change', function () { project.format = parseInt(this.value, 10); renderMeta(); });
    $('tpm-desc').addEventListener('input', function () { project.description = this.value; renderMeta(); });
    $('tpm-namespace').addEventListener('input', function () { project.namespace = sanitizeNamespace(this.value); });

    // Tree search
    $('tpm-tree-search').addEventListener('input', function () {
      var q = this.value.toLowerCase();
      document.querySelectorAll('.tpm-node').forEach(function (n) {
        var show = !q || n.dataset.name.toLowerCase().indexOf(q) !== -1;
        n.style.display = show ? '' : 'none';
      });
      document.querySelectorAll('.tpm-section').forEach(function (sec) {
        var sib = sec.nextElementSibling; var visible = false;
        while (sib && sib.classList.contains('tpm-group-body')) {
          var nodes = sib.querySelectorAll('.tpm-node');
          for (var i = 0; i < nodes.length; i++) { if (nodes[i].style.display !== 'none') { visible = true; break; } }
          break;
        }
        sec.style.display = visible ? '' : 'none';
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); saveProject(); }
    });

    // Responsive resize
    window.addEventListener('resize', function () { renderPreview(); });
  }

  function applyTemplate(name) {
    if (name === 'custom_item') {
      createContent('items', 'custom_sword');
      var entry = project.content.get(selectedId);
      entry.data = { item_name: 'custom_sword', display_name: 'Custom Sword', custom_model_data: '1' };
      entry.content = buildItemJSON(entry.data);
    } else if (name === 'tool_pack') {
      createContent('items', 'custom_pickaxe');
      var entry = project.content.get(selectedId);
      entry.data = { item_name: 'custom_pickaxe', display_name: 'Custom Pickaxe', custom_model_data: '2' };
      entry.content = buildItemJSON(entry.data);
    } else if (name === 'food_pack') {
      createContent('items', 'custom_food');
      var entry = project.content.get(selectedId);
      entry.data = { item_name: 'custom_food', display_name: 'Custom Food', custom_model_data: '3' };
      entry.content = buildItemJSON(entry.data);
    } else if (name === 'recipe_pack') {
      createContent('recipes', 'custom_recipe');
      var entry = project.content.get(selectedId);
      entry.data = { recipe_type: 'minecraft:crafting_shaped', result_item: 'minecraft:stone', result_count: '4', ingredients: 'A\nA\nA' };
      entry.content = buildRecipeJSON(entry.data);
    } else if (name === 'loot_table_pack') {
      createContent('loot_tables', 'custom_loot');
      var entry = project.content.get(selectedId);
      entry.data = { loot_item: 'minecraft:diamond', functions: '' };
      entry.content = buildLootTableJSON(entry.data);
    } else if (name === 'advancement_pack') {
      createContent('advancements', 'custom_advancement');
      var entry = project.content.get(selectedId);
      entry.data = { reward_loot: '' };
      entry.content = buildAdvancementJSON(entry.data);
    } else if (name === 'function_pack') {
      createContent('functions', 'load');
      var entry = project.content.get(selectedId);
      entry.content = 'say ' + project.namespace + ' loaded!';
    } else if (name === 'complete_pack') {
      applyTemplate('custom_item');
      applyTemplate('recipe_pack');
      applyTemplate('loot_table_pack');
    }
    loadIntoEditor(project.content.get(selectedId));
    renderFileList();
    renderPreview();
    refreshTreeFlags();
    updateEditorHeader();
  }

  /* ---------- Init ---------- */
  function init() {
    if (inited) return;
    inited = true;
    if (!$('tpm-editor') || typeof TpcZip === 'undefined') {
      console.error('TPM init failed: missing editor or TpcZip.');
      return;
    }
    project.name = $('tpm-name').value;
    project.format = parseInt($('tpm-format').value, 10);
    project.description = $('tpm-desc').value;
    project.namespace = sanitizeNamespace($('tpm-namespace').value);
    bindUI();
    renderMeta();
    buildTree();
    try { checkSavedExists(); } catch (e) {}
  }

  function checkSavedExists() {
    if (!storageAvailable()) return;
    var saved = localStorage.getItem(STORAGE_KEY);
    var label = $('tpm-saved-label');
    if (saved && label) {
      label.hidden = false; label.textContent = 'Saved project available';
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
