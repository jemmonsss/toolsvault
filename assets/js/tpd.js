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

  var PACK_TEMPLATES = {
    hello_world: {
      name: 'Hello World',
      description: 'A minimal datapack that prints a message on load.',
      files: [
        { path: 'pack.mcmeta', type: 'meta', content: '{\n  "pack": {\n    "pack_format": 61,\n    "description": "Hello World Datapack"\n  }\n}\n' },
        { path: 'data/hello_world/functions/load.mcfunction', type: 'functions', content: '# Runs when the datapack loads\nsay Hello from my datapack!\n' },
        { path: 'data/hello_world/functions/tick.mcfunction', type: 'functions', content: '# Runs every tick\n# execute as @a at @s run say Tick!\n' }
      ]
    },
    custom_recipe: {
      name: 'Custom Crafting Recipe',
      description: 'Adds a new shaped crafting recipe (netherite ingot example).',
      files: [
        { path: 'data/custom_recipe/recipes/netherite_ingot.json', type: 'recipes', content: '{\n  "type": "minecraft:crafting_shaped",\n  "pattern": ["NNN", "GNG", "NNN"],\n  "key": {\n    "N": { "item": "minecraft:netherite_scrap" },\n    "G": { "item": "minecraft:gold_ingot" }\n  },\n  "result": {\n    "item": "minecraft:netherite_ingot",\n    "count": 1\n  }\n}\n' }
      ]
    },
    loot_table_modifier: {
      name: 'Loot Table Modifier',
      description: 'Adds an item modifier that sets count on chest loot.',
      files: [
        { path: 'data/custom_loot/loot_tables/chests/simple_dungeon.json', type: 'loot_tables', content: '{\n  "pools": [\n    {\n      "rolls": 1,\n      "entries": [\n        {\n          "type": "minecraft:item",\n          "name": "minecraft:diamond",\n          "functions": [\n            {\n              "function": "minecraft:set_count",\n              "count": {\n                "type": "minecraft:uniform",\n                "min": 1,\n                "max": 3\n              }\n            }\n          ]\n        }\n      ]\n    }\n  ]\n}\n' }
      ]
    },
    tag_example: {
      name: 'Tag Example',
      description: 'Adds a custom item tag and a function that uses it.',
      files: [
        { path: 'data/custom_tags/tags/item/my_gems.json', type: 'tags', content: '{\n  "values": [\n    "minecraft:diamond",\n    "minecraft:emerald",\n    "minecraft:lapis_lazuli"\n  ]\n}\n' },
        { path: 'data/custom_tags/functions/check_gems.mcfunction', type: 'functions', content: '# This function references the tag above\n# execute as @a if entity @s[nbt={Inventory:[{tag:{Tags:["my_gems"]}}]}] run say You have a custom gem!\n' }
      ]
    },
    advancement_reward: {
      name: 'Advancement Reward',
      description: 'Grants the player a reward when they craft a diamond.',
      files: [
        { path: 'data/advancement_rewards/advancements/craft_diamond.json', type: 'advancements', content: '{\n  "display": {\n    "title": "Diamond Crafter",\n    "description": "Craft a diamond",\n    "icon": { "item": "minecraft:diamond" },\n    "frame": "task",\n    "announce_to_chat": true,\n    "show_toast": true\n  },\n  "criteria": {\n    "crafted_diamond": {\n      "trigger": "minecraft:recipe_crafted",\n      "conditions": {\n        "recipe_id": "minecraft:diamond"\n      }\n    }\n  },\n  "rewards": {\n    "function": "advancement_rewards:give_reward"\n  }\n}\n' },
        { path: 'data/advancement_rewards/functions/give_reward.mcfunction', type: 'functions', content: '# Reward function\ngive @s minecraft:golden_apple 1\nadvancement revoke @s only advancement_rewards:craft_diamond\n' }
      ]
    },
    custom_dimension: {
      name: 'Custom Dimension',
      description: 'Adds a new dimension type and dimension JSON (requires worldgen folder).',
      files: [
        { path: 'data/custom_dim/dimension_type/my_dimension.json', type: 'dimension_type', content: '{\n  "name": "my_dimension",\n  "ultrawarm": false,\n  "natural": true,\n  "coordinate_scale": 1.0,\n  "has_skylight": true,\n  "has_ceiling": false,\n  "ambient_light": 0.0,\n  "bed_works": true,\n  "respawn_anchor_works": true,\n  "has_raids": true,\n  "logical_height": 256,\n  "min_y": 0,\n  "max_y": 256,\n  "infiniburn": "#minecraft:infiniburn_overworld",\n  "effects": "minecraft:overworld"\n}\n' },
        { path: 'data/custom_dim/dimension/my_dimension.json', type: 'dimension', content: '{\n  "type": "minecraft:overworld",\n  "generator": {\n    "type": "minecraft:noise",\n    "seed": 0,\n    "settings": "minecraft:overworld",\n    "biome_source": {\n      "type": "minecraft:fixed",\n      "biome": "minecraft:plains"\n    }\n  }\n}\n' }
      ]
    },
    custom_biome: {
      name: 'Custom Biome (Worldgen)',
      description: 'Adds a basic configured_feature, placed_feature, and biome for world generation.',
      files: [
        { path: 'data/custom_biome/worldgen/configured_feature/my_tree.json', type: 'worldgen', content: '{\n  "type": "minecraft:tree",\n  "config": {\n    "minimum_size": {\n      "type": "minecraft:two_layers_feature_size",\n      "limit": 1,\n      "lower_size": 0,\n      "upper_size": 1\n    },\n    "trunk_provider": {\n      "type": "minecraft:simple_state_provider",\n      "state": { "Name": "minecraft:oak_log" }\n    },\n    "foliage_provider": {\n      "type": "minecraft:simple_state_provider",\n      "state": { "Name": "minecraft:oak_leaves" }\n    },\n    "trunk_height": 5,\n    "foliage_height": 3,\n    "foliage_radius": 2\n  }\n}\n' },
        { path: 'data/custom_biome/worldgen/placed_feature/my_tree.json', type: 'worldgen', content: '{\n  "feature": "custom_biome:my_tree",\n  "placement": [\n    { "type": "minecraft:count", "count": 2 },\n    { "type": "minecraft:in_square" },\n    { "type": "minecraft:surface_water_depth_filter", "max_water_depth": 0 },\n    { "type": "minecraft:heightmap", "heightmap": "WORLD_SURFACE_WG" },\n    { "type": "minecraft:block_predicate_filter", "predicate": { "type": "minecraft:matching_blocks", "blocks": [ "minecraft:grass_block" ] } }\n  ]\n}\n' }
      ]
    },
    custom_item: {
      name: 'Custom Item Pack',
      description: 'Adds a recipe, loot table entry, and item tag for a custom item.',
      files: [
        { path: 'data/custom_item/recipes/my_item.json', type: 'recipes', content: '{\n  "type": "minecraft:crafting_shaped",\n  "pattern": ["###", "###", "###"],\n  "key": {\n    "#": { "item": "minecraft:diamond" }\n  },\n  "result": {\n    "item": "minecraft:netherite_ingot",\n    "count": 1\n  }\n}\n' },
        { path: 'data/custom_item/loot_tables/chests/village_blacksmith.json', type: 'loot_tables', content: '{\n  "pools": [\n    {\n      "rolls": 1,\n      "entries": [\n        {\n          "type": "minecraft:item",\n          "name": "minecraft:emerald",\n          "weight": 1,\n          "functions": [\n            { "function": "minecraft:set_count", "count": { "type": "minecraft:uniform", "min": 1, "max": 5 } }\n          ]\n        }\n      ]\n    }\n  ]\n}\n' },
        { path: 'data/custom_item/tags/item/my_item_tag.json', type: 'tags', content: '{\n  "values": [\n    "minecraft:diamond",\n    "minecraft:emerald",\n    "minecraft:netherite_ingot"\n  ]\n}\n' }
      ]
    },
    tag_pack: {
      name: 'Tag Pack',
      description: 'Shows item, block, function, entity_type, and fluid tags.',
      files: [
        { path: 'data/tag_pack/tags/item/my_gems.json', type: 'tags', content: '{\n  "values": [\n    "minecraft:diamond",\n    "minecraft:emerald",\n    "minecraft:lapis_lazuli"\n  ]\n}\n' },
        { path: 'data/tag_pack/tags/block/my_ores.json', type: 'tags', content: '{\n  "values": [\n    "minecraft:coal_ore",\n    "minecraft:iron_ore",\n    "minecraft:gold_ore"\n  ]\n}\n' },
        { path: 'data/tag_pack/tags/function/load.json', type: 'tags', content: '{\n  "values": [\n    "tag_pack:init"\n  ]\n}\n' },
        { path: 'data/tag_pack/functions/init.mcfunction', type: 'functions', content: '# Initialize tag pack\ndatapack enable "self"\nsay Tag pack loaded!\n' }
      ]
    },
    predicate_showcase: {
      name: 'Predicate Showcase',
      description: 'Shows entity_properties and location_check predicates used by advancements or loot tables.',
      files: [
        { path: 'data/pred_show/predicates/is_in_plains.json', type: 'predicates', content: '{\n  "condition": "minecraft:entity_properties",\n  "entity": "this",\n  "predicate": {\n    "location": {\n      "biome": "minecraft:plains",\n      "structure": "minecraft:village"\n    }\n  }\n}\n' },
        { path: 'data/pred_show/predicates/random_drop.json', type: 'predicates', content: '{\n  "condition": "minecraft:random_chance",\n  "chance": 0.15\n}\n' }
      ]
    },
    function_pack: {
      name: 'Function Pack',
      description: 'Multiple functions linked via tags and advancements.',
      files: [
        { path: 'data/func_pack/tags/function/load.json', type: 'tags', content: '{\n  "values": [\n    "func_pack:main"\n  ]\n}\n' },
        { path: 'data/func_pack/functions/main.mcfunction', type: 'functions', content: '# Main load function\ndatapack enable "self"\nsay Function pack loaded!\nfunction func_pack:give_items\n' },
        { path: 'data/func_pack/functions/give_items.mcfunction', type: 'functions', content: '# Give starter items\ngive @a minecraft:stone 64\ngive @a minecraft:oak_log 64\n' },
        { path: 'data/func_pack/advancements/root.json', type: 'advancements', content: '{\n  "display": {\n    "title": "Function Pack",\n    "description": "Loaded the function pack",\n    "icon": { "item": "minecraft:knowledge_book" },\n    "frame": "task",\n    "show_toast": true,\n    "announce_to_chat": true\n  },\n  "criteria": {\n    "loaded": {\n      "trigger": "minecraft:tick"\n    }\n  }\n}\n' }
      ]
    },
    full_pack: {
      name: 'Full Starter Pack',
      description: 'A complete starter pack with advancement, recipe, function, tag, predicate, and item modifier.',
      files: [
        { path: 'data/full_pack/tags/function/load.json', type: 'tags', content: '{\n  "values": [\n    "full_pack:on_load"\n  ]\n}\n' },
        { path: 'data/full_pack/functions/on_load.mcfunction', type: 'functions', content: 'say Full pack loaded!\ngive @a minecraft:stone 1\n' },
        { path: 'data/full_pack/advancements/first_join.json', type: 'advancements', content: '{\n  "display": {\n    "title": "Welcome",\n    "description": "Joined the world",\n    "icon": { "item": "minecraft:grass_block" },\n    "frame": "task",\n    "show_toast": true,\n    "announce_to_chat": true\n  },\n  "criteria": {\n    "joined": {\n      "trigger": "minecraft:tick"\n    }\n  }\n}\n' },
        { path: 'data/full_pack/recipes/stone_recipe.json', type: 'recipes', content: '{\n  "type": "minecraft:crafting_shaped",\n  "pattern": ["## ", "## ", "   "],\n  "key": {\n    "#": { "item": "minecraft:cobblestone" }\n  },\n  "result": {\n    "item": "minecraft:stone",\n    "count": 2\n  }\n}\n' },
        { path: 'data/full_pack/tags/item/starters.json', type: 'tags', content: '{\n  "values": [\n    "minecraft:stone",\n    "minecraft:cobblestone"\n  ]\n}\n' },
        { path: 'data/full_pack/predicates/always_true.json', type: 'predicates', content: '{\n  "condition": "minecraft:random_chance",\n  "chance": 1.0\n}\n' },
        { path: 'data/full_pack/item_modifiers/give_chance.json', type: 'item_modifiers', content: '{\n  "function": "minecraft:set_count",\n  "count": {\n    "type": "minecraft:uniform",\n    "min": 1,\n    "max": 3\n  }\n}\n' }
      ]
    }
  };

  var TEMPLATE_LIST = Object.keys(PACK_TEMPLATES).map(function (k) {
    return { key: k, name: PACK_TEMPLATES[k].name, desc: PACK_TEMPLATES[k].description };
  });

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
  var simpleMode = false;

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
    $('tpd-format').value = String(project.format);
    $('tpd-desc').value = project.description;
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
          autoResizeEditor();
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
          autoResizeEditor();
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

  function autoResizeEditor() {
    var el = $('tpd-editor');
    if (!el) return;
    el.style.height = 'auto';
    var maxH = 600;
    el.style.height = Math.min(el.scrollHeight, maxH) + 'px';
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
    autoResizeEditor();
    refreshTreeFlags(); renderFileList(); renderPreview(); renderMeta();
    showMsg('Created ' + path, true);
  }

  function showTemplateMenu() {
    var existing = $('tpd-template-menu');
    if (existing) { existing.remove(); return; }
    var btn = $('tpd-load-template');
    var rect = btn.getBoundingClientRect();
    var menu = document.createElement('div');
    menu.className = 'tpd-new-menu';
    menu.id = 'tpd-template-menu';
    menu.style.position = 'fixed';
    menu.style.top = (rect.bottom + 4) + 'px';
    menu.style.left = rect.left + 'px';
    TEMPLATE_LIST.forEach(function (t) {
      var item = document.createElement('div');
      item.className = 'tpd-new-item';
      item.innerHTML = '<span>' + t.name + '</span><span class="tpd-new-ext">pack</span>';
      item.addEventListener('click', function () {
        loadPackTemplate(t.key);
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

  function loadPackTemplate(key) {
    var tmpl = PACK_TEMPLATES[key];
    if (!tmpl) return;
    project.name = tmpl.name;
    project.description = tmpl.description;
    $('tpd-name').value = project.name;
    $('tpd-desc').value = project.description;
    project.files = new Map();
    selectedPath = null;
    editor.value = '';
    tmpl.files.forEach(function (f) {
      var path = f.path.replace('<namespace>', project.namespace);
      project.files.set(path, { name: fileNameFromPath(path), type: f.type, content: f.content });
    });
    updateEditorHeader(); validateCurrent();
    buildTree(); renderFileList(); renderPreview(); renderMeta();
    if (project.files.size > 0) selectFile(Array.from(project.files.keys())[0]);
    autoResizeEditor();
    showMsg('Loaded template: ' + tmpl.name, true);
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
    autoResizeEditor();
    if (simpleMode) renderSimpleForm();
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
        pack_format: parseInt($('tpd-format').value, 10) || 61,
        description: $('tpd-desc').value || ''
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

  /* ---------- Simple mode ---------- */
  function toggleSimpleMode() {
    simpleMode = !simpleMode;
    var btn = $('tpd-mode-toggle');
    var simpleEl = $('tpd-simple');
    var editorEl = $('tpd-editor');
    if (btn) btn.textContent = 'Simple mode: ' + (simpleMode ? 'on' : 'off');
    if (simpleEl) simpleEl.hidden = !simpleMode;
    if (simpleMode) {
      if (editorEl) editorEl.style.display = 'none';
      renderSimpleForm();
    } else {
      if (editorEl) editorEl.style.display = '';
    }
  }

  function renderSimpleForm() {
    var body = $('tpd-simple-body');
    if (!body) return;
    body.innerHTML = '';
    if (!selectedPath || !project.files.has(selectedPath)) {
      body.innerHTML = '<div class=\"tpd-field\"><label>No file selected</label></div>';
      return;
    }
    var entry = project.files.get(selectedPath);
    var content = editor.value || entry.content || '';
    if (entry.type === 'functions') {
      renderSimpleFunctions(body, content);
    } else if (entry.type === 'recipes') {
      renderSimpleRecipe(body, content);
    } else if (entry.type === 'advancements') {
      renderSimpleAdvancement(body, content);
    } else if (entry.type === 'loot_tables') {
      renderSimpleLootTable(body, content);
    } else if (entry.type === 'tags') {
      renderSimpleTag(body, content);
    } else if (entry.type === 'item_modifiers') {
      renderSimpleItemModifier(body, content);
    } else if (entry.type === 'predicates') {
      renderSimplePredicate(body, content);
    } else if (entry.type === 'dimension_type') {
      renderSimpleDimensionType(body, content);
    } else if (entry.type === 'dimension') {
      renderSimpleDimension(body, content);
    } else if (entry.type === 'worldgen') {
      renderSimpleWorldgen(body, content);
    } else {
      body.innerHTML = '<div class=\"tpd-field\"><label>Simple editing is not supported for this file type yet. Use Code mode.</label></div>';
    }
  }

  function renderSimpleFunctions(body, content) {
    body.innerHTML = '<div class=\"tpd-field\"><label>Commands (one per line)</label><textarea id=\"tpd-simple-cmds\">' + escHtml(content) + '</textarea></div>';
    bindSimpleInput('tpd-simple-cmds', content);
  }

  function renderSimpleRecipe(body, content) {
    var data = tryParseJson(content) || {};
    var type = data.type || 'minecraft:crafting_shaped';
    var pattern = Array.isArray(data.pattern) ? data.pattern.join('\n') : '###\n # \n # ';
    var key = data.key || {};
    var result = data.result || {};
    var resultItem = result.item || 'minecraft:stone';
    var resultCount = result.count || 1;
    body.innerHTML =
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Type</label><select id=\"tpd-simple-recipe-type\"><option value=\"minecraft:crafting_shaped\">Shaped</option><option value=\"minecraft:crafting_shapeless\">Shapeless</option><option value=\"minecraft:stonecutting\">Stonecutting</option><option value=\"minecraft:smithing\">Smithing</option></select></div>' +
        '<div class=\"tpd-field\"><label>Result item</label><input id=\"tpd-simple-recipe-result\" value=\"' + escHtml(resultItem) + '\"></div>' +
        '<div class=\"tpd-field\"><label>Count</label><input id=\"tpd-simple-recipe-count\" type=\"number\" min=\"1\" max=\"64\" value=\"' + resultCount + '\"></div>' +
      '</div>' +
      '<div class=\"tpd-field\"><label>Pattern (3 lines, use # for key placeholders)</label><textarea id=\"tpd-simple-recipe-pattern\">' + escHtml(pattern) + '</textarea></div>' +
      '<div class=\"tpd-field\"><label>Key (one per line, format: symbol=item_id)</label><textarea id=\"tpd-simple-recipe-key\">' + escHtml(formatRecipeKey(key)) + '</textarea></div>';
    bindSimpleInput('tpd-simple-recipe-type', data, function () { return buildRecipe(); });
    bindSimpleInput('tpd-simple-recipe-result', data, function () { return buildRecipe(); });
    bindSimpleInput('tpd-simple-recipe-count', data, function () { return buildRecipe(); });
    bindSimpleInput('tpd-simple-recipe-pattern', data, function () { return buildRecipe(); });
    bindSimpleInput('tpd-simple-recipe-key', data, function () { return buildRecipe(); });
  }

  function formatRecipeKey(key) {
    var lines = [];
    Object.keys(key).forEach(function (k) {
      var item = key[k] && key[k].item ? key[k].item : 'minecraft:stone';
      lines.push(k + '=' + item);
    });
    return lines.join('\n');
  }

  function buildRecipe() {
    var type = $('tpd-simple-recipe-type') ? $('tpd-simple-recipe-type').value : 'minecraft:crafting_shaped';
    var resultItem = $('tpd-simple-recipe-result') ? $('tpd-simple-recipe-result').value : 'minecraft:stone';
    var resultCount = $('tpd-simple-recipe-count') ? parseInt($('tpd-simple-recipe-count').value, 10) || 1 : 1;
    var patternRaw = $('tpd-simple-recipe-pattern') ? $('tpd-simple-recipe-pattern').value : '';
    var keyRaw = $('tpd-simple-recipe-key') ? $('tpd-simple-recipe-key').value : '';
    var pattern = patternRaw.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    var key = {};
    keyRaw.split('\n').forEach(function (line) {
      line = line.trim();
      if (!line) return;
      var parts = line.split('=');
      if (parts.length >= 2) key[parts[0].trim()] = { item: parts[1].trim() };
    });
    var out = { type: type, result: { item: resultItem, count: resultCount } };
    if (type === 'minecraft:crafting_shaped' || type === 'minecraft:smithing') {
      out.pattern = pattern;
      out.key = key;
    } else if (type === 'minecraft:crafting_shapeless') {
      out.ingredients = [];
      Object.keys(key).forEach(function (k) {
        out.ingredients.push({ item: key[k].item });
      });
    }
    return JSON.stringify(out, null, 2);
  }

  function renderSimpleAdvancement(body, content) {
    var data = tryParseJson(content) || {};
    var display = data.display || {};
    var criteria = data.criteria || {};
    var firstKey = Object.keys(criteria)[0] || 'example';
    var firstCriteria = criteria[firstKey] || { trigger: 'minecraft:impossible' };
    body.innerHTML =
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Title</label><input id=\"tpd-simple-adv-title\" value=\"' + escHtml(display.title || '') + '\"></div>' +
        '<div class=\"tpd-field\"><label>Description</label><input id=\"tpd-simple-adv-desc\" value=\"' + escHtml(display.description || '') + '\"></div>' +
      '</div>' +
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Icon item</label><input id=\"tpd-simple-adv-icon\" value=\"' + escHtml((display.icon && display.icon.item) || 'minecraft:stone') + '\"></div>' +
        '<div class=\"tpd-field\"><label>Frame</label><select id=\"tpd-simple-adv-frame\"><option value=\"task\">Task</option><option value=\"challenge\">Challenge</option><option value=\"goal\">Goal</option></select></div>' +
      '</div>' +
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Trigger</label><select id=\"tpd-simple-adv-trigger\"><option value=\"minecraft:impossible\">Impossible</option><option value=\"minecraft:recipe_crafted\">Recipe Crafted</option><option value=\"minecraft:inventory_changed\">Inventory Changed</option><option value=\"minecraft:player_killed_entity\">Player Killed Entity</option><option value=\"minecraft:entity_killed_player\">Entity Killed Player</option></select></div>' +
        '<div class=\"tpd-field\"><label>Background (optional)</label><input id=\"tpd-simple-adv-bg\" value=\"' + escHtml(display.background || '') + '\"></div>' +
      '</div>';
    if (display.frame) $('tpd-simple-adv-frame').value = display.frame;
    if (firstCriteria.trigger) $('tpd-simple-adv-trigger').value = firstCriteria.trigger;
    bindSimpleInput('tpd-simple-adv-title', data, function () { return buildAdvancement(); });
    bindSimpleInput('tpd-simple-adv-desc', data, function () { return buildAdvancement(); });
    bindSimpleInput('tpd-simple-adv-icon', data, function () { return buildAdvancement(); });
    bindSimpleInput('tpd-simple-adv-frame', data, function () { return buildAdvancement(); });
    bindSimpleInput('tpd-simple-adv-trigger', data, function () { return buildAdvancement(); });
    bindSimpleInput('tpd-simple-adv-bg', data, function () { return buildAdvancement(); });
  }

  function buildAdvancement() {
    var title = $('tpd-simple-adv-title') ? $('tpd-simple-adv-title').value : '';
    var desc = $('tpd-simple-adv-desc') ? $('tpd-simple-adv-desc').value : '';
    var icon = $('tpd-simple-adv-icon') ? $('tpd-simple-adv-icon').value : 'minecraft:stone';
    var frame = $('tpd-simple-adv-frame') ? $('tpd-simple-adv-frame').value : 'task';
    var trigger = $('tpd-simple-adv-trigger') ? $('tpd-simple-adv-trigger').value : 'minecraft:impossible';
    var bg = $('tpd-simple-adv-bg') ? $('tpd-simple-adv-bg').value : '';
    var out = {
      display: { title: title, description: desc, icon: { item: icon }, frame: frame, show_toast: true, announce_to_chat: true },
      criteria: { triggered: { trigger: trigger } }
    };
    if (bg) out.display.background = bg;
    return JSON.stringify(out, null, 2);
  }

  function renderSimpleLootTable(body, content) {
    var data = tryParseJson(content) || {};
    var pool = (data.pools && data.pools[0]) || {};
    var entries = Array.isArray(pool.entries) ? pool.entries : [];
    var entry = entries[0] || {};
    var functions = entry.functions || [];
    var func = functions[0] || {};
    body.innerHTML =
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Entry type</label><select id=\"tpd-simple-loot-type\"><option value=\"minecraft:item\">Item</option><option value=\"minecraft:empty\">Empty</option><option value=\"minecraft:tag\">Tag</option><option value=\"minecraft:loot_table\">Loot Table</option></select></div>' +
        '<div class=\"tpd-field\"><label>Item / target</label><input id=\"tpd-simple-loot-name\" value=\"' + escHtml(entry.name || 'minecraft:stone') + '\"></div>' +
        '<div class=\"tpd-field\"><label>Weight</label><input id=\"tpd-simple-loot-weight\" type=\"number\" value=\"' + (entry.weight || 1) + '\"></div>' +
      '</div>' +
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Function</label><select id=\"tpd-simple-loot-func\"><option value=\"\">None</option><option value=\"minecraft:set_count\">Set Count</option><option value=\"minecraft:set_damage\">Set Damage</option><option value=\"minecraft:enchant_randomly\">Enchant Randomly</option><option value=\"minecraft:looting_enchant\">Looting Enchant</option></select></div>' +
        '<div class=\"tpd-field\"><label>Min</label><input id=\"tpd-simple-loot-min\" type=\"number\" value=\"' + (func.count ? (typeof func.count === 'object' ? (func.count.min || 1) : func.count) : 1) + '\"></div>' +
        '<div class=\"tpd-field\"><label>Max</label><input id=\"tpd-simple-loot-max\" type=\"number\" value=\"' + (func.count ? (typeof func.count === 'object' ? (func.count.max || 1) : func.count) : 1) + '\"></div>' +
      '</div>';
    bindSimpleInput('tpd-simple-loot-type', data, function () { return buildLootTable(); });
    bindSimpleInput('tpd-simple-loot-name', data, function () { return buildLootTable(); });
    bindSimpleInput('tpd-simple-loot-weight', data, function () { return buildLootTable(); });
    bindSimpleInput('tpd-simple-loot-func', data, function () { return buildLootTable(); });
    bindSimpleInput('tpd-simple-loot-min', data, function () { return buildLootTable(); });
    bindSimpleInput('tpd-simple-loot-max', data, function () { return buildLootTable(); });
  }

  function buildLootTable() {
    var type = $('tpd-simple-loot-type') ? $('tpd-simple-loot-type').value : 'minecraft:item';
    var name = $('tpd-simple-loot-name') ? $('tpd-simple-loot-name').value : 'minecraft:stone';
    var weight = $('tpd-simple-loot-weight') ? parseInt($('tpd-simple-loot-weight').value, 10) || 1 : 1;
    var func = $('tpd-simple-loot-func') ? $('tpd-simple-loot-func').value : '';
    var min = $('tpd-simple-loot-min') ? parseInt($('tpd-simple-loot-min').value, 10) || 1 : 1;
    var max = $('tpd-simple-loot-max') ? parseInt($('tpd-simple-loot-max').value, 10) || 1 : 1;
    var entry = { type: type, name: name, weight: weight };
    if (func) {
      entry.functions = [];
      var f = { function: func };
      if (func === 'minecraft:set_count') f.count = { type: 'minecraft:uniform', min: min, max: max };
      if (func === 'minecraft:set_damage') f.damage = { type: 'minecraft:uniform', min: min/100, max: max/100 };
      entry.functions.push(f);
    }
    var out = { pools: [{ rolls: 1, entries: [entry] }] };
    return JSON.stringify(out, null, 2);
  }

  function renderSimpleTag(body, content) {
    var data = tryParseJson(content) || {};
    var values = Array.isArray(data.values) ? data.values : [];
    body.innerHTML =
      '<div class=\"tpd-field\"><label>Values (one per line, e.g. minecraft:diamond)</label><textarea id=\"tpd-simple-tag-values\">' + escHtml(values.join('\n')) + '</textarea></div>';
    bindSimpleInput('tpd-simple-tag-values', data, function () { return buildTag(); });
  }

  function buildTag() {
    var raw = $('tpd-simple-tag-values') ? $('tpd-simple-tag-values').value : '';
    var values = raw.split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l.length > 0; });
    return JSON.stringify({ values: values }, null, 2);
  }

  function renderSimpleItemModifier(body, content) {
    var data = tryParseJson(content) || {};
    var func = data.function || 'minecraft:set_count';
    var count = data.count || 1;
    body.innerHTML =
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Function</label><select id=\"tpd-simple-im-func\"><option value=\"minecraft:set_count\">Set Count</option><option value=\"minecraft:set_damage\">Set Damage</option><option value=\"minecraft:enchant_randomly\">Enchant Randomly</option><option value=\"minecraft:set_attributes\">Set Attributes</option></select></div>' +
        '<div class=\"tpd-field\"><label>Value</label><input id=\"tpd-simple-im-value\" type=\"number\" value=\"' + (typeof count === 'object' ? (count.min || 1) : count) + '\"></div>' +
        '<div class=\"tpd-field\"><label>Max (for range)</label><input id=\"tpd-simple-im-max\" type=\"number\" value=\"' + (typeof count === 'object' ? (count.max || 1) : count) + '\"></div>' +
      '</div>';
    bindSimpleInput('tpd-simple-im-func', data, function () { return buildItemModifier(); });
    bindSimpleInput('tpd-simple-im-value', data, function () { return buildItemModifier(); });
    bindSimpleInput('tpd-simple-im-max', data, function () { return buildItemModifier(); });
  }

  function buildItemModifier() {
    var func = $('tpd-simple-im-func') ? $('tpd-simple-im-func').value : 'minecraft:set_count';
    var val = $('tpd-simple-im-value') ? parseInt($('tpd-simple-im-value').value, 10) || 1 : 1;
    var max = $('tpd-simple-im-max') ? parseInt($('tpd-simple-im-max').value, 10) || val : val;
    var out = { function: func };
    if (func === 'minecraft:set_count') out.count = { type: 'minecraft:uniform', min: val, max: max };
    if (func === 'minecraft:set_damage') out.damage = { type: 'minecraft:uniform', min: Math.max(0, val/100), max: Math.max(0, max/100) };
    return JSON.stringify(out, null, 2);
  }

  function renderSimplePredicate(body, content) {
    var data = tryParseJson(content) || {};
    var condition = data.condition || 'minecraft:entity_properties';
    body.innerHTML =
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Condition</label><select id=\"tpd-simple-pred-cond\"><option value=\"minecraft:entity_properties\">Entity Properties</option><option value=\"minecraft:location_check\">Location Check</option><option value=\"minecraft:random_chance\">Random Chance</option><option value=\"minecraft:match_tool\">Match Tool</option></select></div>' +
        '<div class=\"tpd-field\"><label>Entity / target</label><input id=\"tpd-simple-pred-entity\" value=\"' + escHtml(data.entity || 'this') + '\"></div>' +
      '</div>' +
      '<div class=\"tpd-field\"><label>Biome (for location_check)</label><input id=\"tpd-simple-pred-biome\" value=\"' + escHtml((data.predicate && data.predicate.location && data.predicate.location.biome) || 'minecraft:plains') + '\"></div>';
    bindSimpleInput('tpd-simple-pred-cond', data, function () { return buildPredicate(); });
    bindSimpleInput('tpd-simple-pred-entity', data, function () { return buildPredicate(); });
    bindSimpleInput('tpd-simple-pred-biome', data, function () { return buildPredicate(); });
  }

  function buildPredicate() {
    var cond = $('tpd-simple-pred-cond') ? $('tpd-simple-pred-cond').value : 'minecraft:entity_properties';
    var entity = $('tpd-simple-pred-entity') ? $('tpd-simple-pred-entity').value : 'this';
    var biome = $('tpd-simple-pred-biome') ? $('tpd-simple-pred-biome').value : 'minecraft:plains';
    var out = { condition: cond, entity: entity };
    if (cond === 'minecraft:entity_properties') {
      out.predicate = { location: { biome: biome } };
    } else if (cond === 'minecraft:location_check') {
      out.predicate = { location: { biome: biome } };
    }
    return JSON.stringify(out, null, 2);
  }

  function renderSimpleDimensionType(body, content) {
    var data = tryParseJson(content) || {};
    body.innerHTML =
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Name</label><input id=\"tpd-simple-dimtype-name\" value=\"' + escHtml(data.name || 'my_dimension') + '\"></div>' +
        '<div class=\"tpd-field\"><label>Effects</label><select id=\"tpd-simple-dimtype-fx\"><option value=\"minecraft:overworld\">Overworld</option><option value=\"minecraft:the_nether\">Nether</option><option value=\"minecraft:the_end\">End</option></select></div>' +
      '</div>' +
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Min Y</label><input id=\"tpd-simple-dimtype-miny\" type=\"number\" value=\"' + (data.min_y || 0) + '\"></div>' +
        '<div class=\"tpd-field\"><label>Max Y</label><input id=\"tpd-simple-dimtype-maxy\" type=\"number\" value=\"' + (data.max_y || 256) + '\"></div>' +
      '</div>' +
      '<div class=\"tpd-field\"><label>Infiniburn</label><input id=\"tpd-simple-dimtype-inf\" value=\"' + escHtml(data.infiniburn || '#minecraft:infiniburn_overworld') + '\"></div>';
    bindSimpleInput('tpd-simple-dimtype-name', data, function () { return buildDimensionType(); });
    bindSimpleInput('tpd-simple-dimtype-fx', data, function () { return buildDimensionType(); });
    bindSimpleInput('tpd-simple-dimtype-miny', data, function () { return buildDimensionType(); });
    bindSimpleInput('tpd-simple-dimtype-maxy', data, function () { return buildDimensionType(); });
    bindSimpleInput('tpd-simple-dimtype-inf', data, function () { return buildDimensionType(); });
  }

  function buildDimensionType() {
    var name = $('tpd-simple-dimtype-name') ? $('tpd-simple-dimtype-name').value : 'my_dimension';
    var fx = $('tpd-simple-dimtype-fx') ? $('tpd-simple-dimtype-fx').value : 'minecraft:overworld';
    var minY = $('tpd-simple-dimtype-miny') ? parseInt($('tpd-simple-dimtype-miny').value, 10) || 0 : 0;
    var maxY = $('tpd-simple-dimtype-maxy') ? parseInt($('tpd-simple-dimtype-maxy').value, 10) || 256 : 256;
    var inf = $('tpd-simple-dimtype-inf') ? $('tpd-simple-dimtype-inf').value : '#minecraft:infiniburn_overworld';
    var out = {
      name: name,
      ultrawarm: false,
      natural: true,
      coordinate_scale: 1.0,
      has_skylight: true,
      has_ceiling: false,
      ambient_light: 0.0,
      bed_works: true,
      respawn_anchor_works: true,
      has_raids: true,
      logical_height: maxY,
      min_y: minY,
      max_y: maxY,
      infiniburn: inf,
      effects: fx
    };
    return JSON.stringify(out, null, 2);
  }

  function renderSimpleDimension(body, content) {
    var data = tryParseJson(content) || {};
    var gen = data.generator || {};
    body.innerHTML =
      '<div class=\"tpd-field\"><label>Dimension type</label><input id=\"tpd-simple-dim-type\" value=\"' + escHtml(data.type || 'minecraft:overworld') + '\"></div>' +
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Generator type</label><select id=\"tpd-simple-dim-gen\"><option value=\"minecraft:noise\">Noise</option><option value=\"minecraft:flat\">Flat</option><option value=\"minecraft:debug\">Debug</option></select></div>' +
        '<div class=\"tpd-field\"><label>Seed</label><input id=\"tpd-simple-dim-seed\" type=\"number\" value=\"' + (gen.seed || 0) + '\"></div>' +
      '</div>' +
      '<div class=\"tpd-field\"><label>Biome source type</label><select id=\"tpd-simple-dim-biome\"><option value=\"minecraft:fixed\">Fixed</option><option value=\"minecraft:multi_noise\">Multi Noise</option><option value=\"minecraft:checkerboard\">Checkerboard</option></select></div>' +
      '<div class=\"tpd-field\"><label>Fixed biome (if fixed)</label><input id=\"tpd-simple-dim-biome-fixed\" value=\"' + escHtml((gen.biome_source && gen.biome_source.biome) || 'minecraft:plains') + '\"></div>';
    bindSimpleInput('tpd-simple-dim-type', data, function () { return buildDimension(); });
    bindSimpleInput('tpd-simple-dim-gen', data, function () { return buildDimension(); });
    bindSimpleInput('tpd-simple-dim-seed', data, function () { return buildDimension(); });
    bindSimpleInput('tpd-simple-dim-biome', data, function () { return buildDimension(); });
    bindSimpleInput('tpd-simple-dim-biome-fixed', data, function () { return buildDimension(); });
  }

  function buildDimension() {
    var type = $('tpd-simple-dim-type') ? $('tpd-simple-dim-type').value : 'minecraft:overworld';
    var genType = $('tpd-simple-dim-gen') ? $('tpd-simple-dim-gen').value : 'minecraft:noise';
    var seed = $('tpd-simple-dim-seed') ? parseInt($('tpd-simple-dim-seed').value, 10) || 0 : 0;
    var biomeType = $('tpd-simple-dim-biome') ? $('tpd-simple-dim-biome').value : 'minecraft:fixed';
    var fixedBiome = $('tpd-simple-dim-biome-fixed') ? $('tpd-simple-dim-biome-fixed').value : 'minecraft:plains';
    var biomeSource = { type: biomeType };
    if (biomeType === 'minecraft:fixed') biomeSource.biome = fixedBiome;
    var out = {
      type: type,
      generator: {
        type: genType,
        seed: seed,
        settings: 'minecraft:overworld',
        biome_source: biomeSource
      }
    };
    return JSON.stringify(out, null, 2);
  }

  function renderSimpleWorldgen(body, content) {
    var data = tryParseJson(content) || {};
    var featureType = data.type || 'minecraft:tree';
    body.innerHTML =
      '<div class=\"tpd-row\">' +
        '<div class=\"tpd-field\"><label>Feature type</label><select id=\"tpd-simple-wg-type\"><option value=\"minecraft:tree\">Tree</option><option value=\"minecraft:ore\">Ore</option><option value=\"minecraft:flower\">Flower</option><option value=\"minecraft:random_patch\">Random Patch</option></select></div>' +
        '<div class=\"tpd-field\"><label>Target block</label><input id=\"tpd-simple-wg-target\" value=\"' + escHtml(data.config && data.config.trunk_provider && data.config.trunk_provider.state ? data.config.trunk_provider.state.Name : 'minecraft:oak_log') + '\"></div>' +
      '</div>' +
      '<div class=\"tpd-field\"><label>Notes / extra JSON</label><textarea id=\"tpd-simple-wg-notes\">Use simple fields above or paste custom JSON in the code editor.</textarea></div>';
    bindSimpleInput('tpd-simple-wg-type', data, function () { return buildWorldgen(); });
    bindSimpleInput('tpd-simple-wg-target', data, function () { return buildWorldgen(); });
    bindSimpleInput('tpd-simple-wg-notes', data, function () { return buildWorldgen(); });
  }

  function buildWorldgen() {
    var type = $('tpd-simple-wg-type') ? $('tpd-simple-wg-type').value : 'minecraft:tree';
    var target = $('tpd-simple-wg-target') ? $('tpd-simple-wg-target').value : 'minecraft:oak_log';
    var notes = $('tpd-simple-wg-notes') ? $('tpd-simple-wg-notes').value : '';
    var out = { type: type };
    if (type === 'minecraft:tree') {
      out.config = {
        minimum_size: { type: 'minecraft:two_layers_feature_size', limit: 1, lower_size: 0, upper_size: 1 },
        trunk_provider: { type: 'minecraft:simple_state_provider', state: { Name: target } },
        foliage_provider: { type: 'minecraft:simple_state_provider', state: { Name: target.replace('_log', '_leaves') } },
        trunk_height: 5,
        foliage_height: 3,
        foliage_radius: 2
      };
    } else if (type === 'minecraft:ore') {
      out = {
        type: 'minecraft:ore',
        config: {
          target: {
            target: { type: 'minecraft:replace', predicate: { type: 'minecraft:block', block: target } },
            state: { Name: target }
          },
          size: 8,
          discard_chance_on_air_exposure: 0
        }
      };
    } else {
      out.config = { raw: notes };
    }
    return JSON.stringify(out, null, 2);
  }

  function bindSimpleInput(id, data, cb) {
    var el = $('tpd-simple-' + id.replace('tpd-simple-', ''));
    if (!el) return;
    el.addEventListener('input', function () {
      if (selectedPath && project.files.has(selectedPath)) {
        var generated = cb ? cb() : el.value;
        project.files.get(selectedPath).content = generated;
        editor.value = generated;
        validateCurrent();
        renderPreview();
      }
    });
  }

  function escHtml(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function tryParseJson(str) {
    try { return JSON.parse(str); } catch (e) { return {}; }
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

    $('tpd-load-template').addEventListener('click', function (e) {
      e.stopPropagation();
      showTemplateMenu();
    });

    $('tpd-new-blank').addEventListener('click', function () {
      var ns = sanitizeNamespace($('tpd-namespace').value || 'minecraft');
      showNewFileMenu();
    });

    var templateFilesBtn = $('tpd-load-template-files');
    if (templateFilesBtn) {
      templateFilesBtn.addEventListener('click', function () {
        showTemplateMenu();
      });
    }

    $('tpd-delete-file').addEventListener('click', function () {
      if (!selectedPath) { showMsg('No file selected.', false); return; }
      project.files.delete(selectedPath);
      selectedPath = null;
      editor.value = '';
      updateEditorHeader(); validateCurrent();
      refreshTreeFlags(); renderFileList(); renderPreview(); renderMeta();
      showMsg('Deleted file.', true);
    });

    $('tpd-mode-toggle').addEventListener('click', function () {
      toggleSimpleMode();
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
      autoResizeEditor();
    });

    // Metadata inputs
    $('tpd-name').addEventListener('input', function () { project.name = this.value; renderMeta(); });
    $('tpd-format').addEventListener('change', function () { project.format = parseInt(this.value, 10) || 61; renderMeta(); });
    $('tpd-desc').addEventListener('input', function () { project.description = this.value; renderMeta(); });
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
    $('tpd-upload-btn').addEventListener('click', function () { $('tpd-upload').click(); });
    $('tpd-upload').addEventListener('change', function () { handleFiles(this.files); this.value = ''; });
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
    project.format = parseInt($('tpd-format').value, 10) || 61;
    project.description = $('tpd-desc').value;
    project.namespace = sanitizeNamespace($('tpd-namespace').value || 'minecraft');
    bindUI();
    buildTree();
    renderFileList();
    renderPreview();
    renderMeta();
    try { checkSavedExists(); } catch (e) {}
    autoResizeEditor();
    // Auto-select first file if any
    try {
      var first = project.files.size > 0 ? Array.from(project.files.keys())[0] : null;
      if (first) selectFile(first);
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
