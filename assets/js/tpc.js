/* Minecraft Texture Pack Creator — app logic.
 * Depends on: TpcZip (assets/js/zip-writer.js)
 * State: project = { name, format, description, files: Map<slotPath, {canvas}> }
 * slotPath example: "assets/minecraft/textures/block/stone.png"
 */
(function () {
  'use strict';

  /* ---------- Minecraft texture namespace (common slots) ---------- */
  var CATEGORIES = {
    Block: ['stone', 'grass_block_top', 'dirt', 'cobblestone', 'oak_planks', 'glass',
            'bricks', 'sand', 'gravel', 'gold_block', 'iron_block', 'diamond_block',
            'crafting_table_top', 'furnace_front', 'chest_front', 'obsidian', 'netherrack', 'end_stone'],
    Item: ['stick', 'diamond', 'iron_ingot', 'gold_ingot', 'apple', 'diamond_sword',
           'iron_sword', 'bow', 'arrow', 'clock', 'compass', 'ender_pearl', 'totem_of_undying'],
    Entity: ['creeper', 'zombie', 'skeleton', 'spider', 'sheep', 'pig', 'cow', 'villager', 'enderman', 'slime'],
    GUI: ['heart', 'heart_full', 'hunger', 'experience_bar_background', 'slot', 'recipe_book'],
    Environment: ['sky', 'sun', 'moon', 'cloud', 'water', 'lava', 'portal'],
    Mob: ['cat', 'wolf', 'horse', 'rabbit', 'chicken', 'bee'],
    Font: ['ascii', 'ascii_sga']
  };

  /* ---------- State ---------- */
  var project = {
    name: 'My Texture Pack',
    format: 34,
    description: '§6My custom textures',
    files: new Map()
  };
  var selectedSlot = null;
  var currentTool = 'pencil';
  var currentColor = '#8b5cf6';
  var brushSize = 2;
  var zoom = 16;
  var showGrid = true;
  var undoStack = [];
  var redoStack = [];
  var inited = false;
  var recentColors = ['#8b5cf6', '#000000', '#ffffff', '#7cba3f', '#a05a2c', '#5b9cff'];
  var drawing = false;
  var lastPt = null;
  var shapeSnapshot = null;

  /* ---------- Element refs ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var canvas = $('tpc-canvas');
  var ctx = canvas.getContext('2d', { willReadFrequently: true });
  // Pixel art must never be smoothed. Setting canvas.width/height resets this,
  // so we re-apply it via prepCtx() after every dimension change.
  function prepCtx() { ctx.imageSmoothingEnabled = false; }
  prepCtx();

  /* ---------- Helpers ---------- */
  function slotPath(cat, name) {
    var base = 'assets/minecraft/textures/';
    if (cat === 'Block') return base + 'block/' + name + '.png';
    if (cat === 'Item') return base + 'item/' + name + '.png';
    if (cat === 'Entity') return base + 'entity/' + name + '.png';
    if (cat === 'GUI') return base + 'gui/' + name + '.png';
    if (cat === 'Environment') return base + 'environment/' + name + '.png';
    if (cat === 'Mob') return base + 'entity/' + name + '.png';
    if (cat === 'Font') return base + 'font/' + name + '.png';
    return base + name + '.png';
  }

  function sanitizeName(s) {
    return (s || 'pack').toLowerCase().replace(/[^a-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'pack';
  }

  /* ---------- Vanilla reference textures (fetched from a public CDN, never
   * hosted on this site). Source: InventivetalentDev/minecraft-assets on the
   * GitHub raw CDN, which sends `access-control-allow-origin: *`, so images can
   * be drawn to the canvas (crossOrigin) and re-exported. ---------- */
  var VANILLA_BASE = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/';
  // Map pack_format -> asset version tag used by the CDN repo.
  function formatToVersion(fmt) {
    fmt = parseInt(fmt, 10);
    if (fmt >= 48) return '1.21.5';
    if (fmt >= 42) return '1.21.4';
    if (fmt >= 34) return '1.21';
    if (fmt >= 32) return '1.20.6';
    if (fmt >= 26) return '1.20.4';
    if (fmt >= 22) return '1.20.2';
    if (fmt >= 18) return '1.19.4';
    if (fmt >= 15) return '1.19.3';
    if (fmt >= 13) return '1.19.2';
    if (fmt >= 9) return '1.18.2';
    if (fmt >= 8) return '1.18.1';
    if (fmt >= 7) return '1.17.1';
    return '1.16.5';
  }
  function vanillaUrl(slot) {
    var ver = formatToVersion($('tpc-format').value);
    return VANILLA_BASE + ver + '/' + slot;
  }

  function loadImageCORS(url) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error('not found')); };
      img.src = url;
    });
  }

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
    return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) };
  }

  function canvasToDataURL(c) { return c.toDataURL('image/png'); }

  function fileToCanvas(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () { resolve(img); };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ---------- Undo / Redo ---------- */
  function snapshot() {
    try { return ctx.getImageData(0, 0, canvas.width, canvas.height); } catch (e) { return null; }
  }
  function pushUndo() {
    var s = snapshot();
    if (s) { undoStack.push(s); if (undoStack.length > 40) undoStack.shift(); redoStack = []; }
  }
  function applyImageData(d) { if (d) ctx.putImageData(d, 0, 0); }
  function undo() { if (undoStack.length) { redoStack.push(snapshot()); applyImageData(undoStack.pop()); afterEdit(); } }
  function redo() { if (redoStack.length) { undoStack.push(snapshot()); applyImageData(redoStack.pop()); afterEdit(); } }

  /* ---------- Render canvas at zoom (non-destructive grid overlay) ---------- */
  function renderCanvas() {
    var w = canvas.width, h = canvas.height;
    var dispW = w * zoom, dispH = h * zoom;
    canvas.style.width = dispW + 'px';
    canvas.style.height = dispH + 'px';
    var overlay = $('tpc-grid-overlay');
    if (overlay) {
      overlay.style.width = dispW + 'px';
      overlay.style.height = dispH + 'px';
      overlay.style.backgroundSize = zoom + 'px ' + zoom + 'px';
      overlay.classList.toggle('show', showGrid && zoom >= 6);
    }
  }

  // Choose a zoom that fits the canvas comfortably inside its box (responsive).
  // Never produce a broken (near-zero) size: if the box can't be measured yet,
  // keep the current zoom rather than collapsing the canvas.
  function fitZoom() {
    var slider = $('tpc-zoom');
    var min = slider ? parseInt(slider.min, 10) || 4 : 4;
    var max = slider ? parseInt(slider.max, 10) || 32 : 32;
    var box = document.querySelector('.tpc-canvas-box');
    var avail = box ? box.clientWidth - 24 : 0; // minus padding
    if (avail < 32 || !isFinite(avail)) {
      // Box not laid out yet (hidden panel / pre-paint). Do not touch zoom now;
      // the ResizeObserver will re-fit once the box has a real width.
      if (!zoom || zoom < min) zoom = Math.min(max, Math.max(min, Math.floor(512 / canvas.width)));
      renderCanvas();
      return;
    }
    var z = Math.floor(avail / canvas.width);
    z = Math.max(min, Math.min(max, z));
    zoom = z;
    if (slider) slider.value = String(z);
    renderCanvas();
  }

  // Re-fit automatically whenever the canvas box actually changes size. This
  // removes all timing races (async CSS, hidden panels, window resize, layout).
  function observeCanvasBox() {
    var box = document.querySelector('.tpc-canvas-box');
    if (!box || typeof ResizeObserver === 'undefined') return;
    var ro = new ResizeObserver(function () { fitZoom(); });
    ro.observe(box);
  }

  /* ---------- Pixel drawing ---------- */
  function eventToPixel(e) {
    var rect = canvas.getBoundingClientRect();
    var cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    var cy = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    return { x: Math.floor(cx / (rect.width / canvas.width)), y: Math.floor(cy / (rect.height / canvas.height)) };
  }

  function brushBox(cx, cy) {
    // Centered, canvas-clamped square for the current brush size.
    var s = Math.max(1, brushSize);
    var half = Math.floor(s / 2);
    var x0 = Math.max(0, cx - half);
    var y0 = Math.max(0, cy - half);
    var x1 = Math.min(canvas.width, cx - half + s);
    var y1 = Math.min(canvas.height, cy - half + s);
    return { x: x0, y: y0, w: Math.max(0, x1 - x0), h: Math.max(0, y1 - y0) };
  }

  function paintPixel(x, y, color, alpha) {
    var b = brushBox(x, y);
    if (b.w === 0 || b.h === 0) return;
    var rgb = hexToRgb(color);
    ctx.fillStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (alpha == null ? 1 : alpha) + ')';
    ctx.fillRect(b.x, b.y, b.w, b.h);
  }

  function erasePixel(x, y) {
    var b = brushBox(x, y);
    if (b.w === 0 || b.h === 0) return;
    ctx.clearRect(b.x, b.y, b.w, b.h);
  }

  function floodFill(x, y, color) {
    var img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var d = img.data;
    var idx = (y * canvas.width + x) * 4;
    var tr = d[idx], tg = d[idx + 1], tb = d[idx + 2], ta = d[idx + 3];
    var rgb = hexToRgb(color);
    if (tr === rgb.r && tg === rgb.g && tb === rgb.b && ta === 255) return;
    var stack = [[x, y]];
    function match(i) { return d[i] === tr && d[i + 1] === tg && d[i + 2] === tb && d[i + 3] === ta; }
    while (stack.length) {
      var p = stack.pop();
      var px = p[0], py = p[1];
      if (px < 0 || py < 0 || px >= canvas.width || py >= canvas.height) continue;
      var i = (py * canvas.width + px) * 4;
      if (!match(i)) continue;
      d[i] = rgb.r; d[i + 1] = rgb.g; d[i + 2] = rgb.b; d[i + 3] = 255;
      stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
    }
    ctx.putImageData(img, 0, 0);
  }

  function drawLine(x0, y0, x1, y1, color) {
    var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    var sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    var err = dx - dy;
    while (true) {
      paintPixel(x0, y0, color);
      if (x0 === x1 && y0 === y1) break;
      var e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
  }

  function drawRect(x0, y0, x1, y1, color) {
    var minX = Math.min(x0, x1), maxX = Math.max(x0, x1);
    var minY = Math.min(y0, y1), maxY = Math.max(y0, y1);
    for (var x = minX; x <= maxX; x++) { paintPixel(x, minY, color); paintPixel(x, maxY, color); }
    for (var y = minY; y <= maxY; y++) { paintPixel(minX, y, color); paintPixel(maxX, y, color); }
  }

  function pickColor(x, y) {
    var d = ctx.getImageData(x, y, 1, 1).data;
    var hex = '#' + [d[0], d[1], d[2]].map(function (v) { return ('0' + v.toString(16)).slice(-2); }).join('');
    currentColor = hex;
    $('tpc-color').value = hex;
    addRecent(hex);
  }

  function addRecent(hex) {
    if (recentColors.indexOf(hex) === -1) { recentColors.unshift(hex); recentColors = recentColors.slice(0, 12); }
    renderSwatches();
  }

  function renderSwatches() {
    var wrap = $('tpc-swatches');
    wrap.innerHTML = '';
    recentColors.forEach(function (c) {
      var b = document.createElement('button');
      b.style.background = c; b.title = c;
      b.addEventListener('click', function () { currentColor = c; $('tpc-color').value = c; });
      wrap.appendChild(b);
    });
  }

  /* ---------- Slots / tree ----------
   * The tree is populated from the vanilla asset listing on the public CDN
   * (each directory has a _list.json with { directories, files }). This gives
   * EVERY editable texture in the game, always accurate for the chosen version,
   * without hosting anything. Directories load lazily on expand. If the CDN is
   * unreachable, we fall back to the built-in CATEGORIES list. */
  var TEX_ROOT = 'assets/minecraft/textures';

  function cdnListUrl(relDir) {
    var ver = formatToVersion($('tpc-format').value);
    return VANILLA_BASE + ver + '/' + TEX_ROOT + (relDir ? '/' + relDir : '') + '/_list.json';
  }

  function fetchJSON(url) {
    if (typeof fetch !== 'function') return Promise.reject(new Error('no fetch'));
    return fetch(url, { cache: 'force-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function makeFileNode(relPath, name) {
    var path = TEX_ROOT + '/' + relPath;
    var node = document.createElement('div');
    node.className = 'tpc-node';
    node.dataset.path = path;
    node.dataset.name = name;
    node.innerHTML = '<span class="tpc-dot"></span><span class="tpc-name">' + name + '</span>';
    node.addEventListener('click', function () { selectSlot(path); });
    return node;
  }

  // Create a collapsible group for a directory; lazy-loads its contents.
  function makeDirGroup(relDir, label, depth) {
    var wrap = document.createElement('div');
    wrap.className = 'tpc-group';
    var head = document.createElement('div');
    head.className = 'tpc-cat tpc-cat-toggle';
    head.style.paddingLeft = (0.4 + depth * 0.6) + 'rem';
    head.innerHTML = '<span class="tpc-caret">▸</span> ' + label;
    var body = document.createElement('div');
    body.className = 'tpc-group-body';
    body.style.display = 'none';
    var loaded = false;
    head.addEventListener('click', function () {
      var open = body.style.display !== 'none';
      body.style.display = open ? 'none' : 'block';
      head.querySelector('.tpc-caret').textContent = open ? '▸' : '▾';
      if (!loaded && !open) {
        loaded = true;
        body.innerHTML = '<div class="tpc-loading">Loading…</div>';
        fetchJSON(cdnListUrl(relDir)).then(function (data) {
          body.innerHTML = '';
          (data.directories || []).sort().forEach(function (d) {
            body.appendChild(makeDirGroup(relDir + '/' + d, d, depth + 1));
          });
          (data.files || []).filter(function (f) { return /\.png$/i.test(f); }).sort().forEach(function (f) {
            var rel = relDir + '/' + f;
            var node = makeFileNode(rel, f.replace(/\.png$/i, ''));
            node.style.paddingLeft = (0.6 + depth * 0.6) + 'rem';
            body.appendChild(node);
          });
          refreshTreeFlags();
        }).catch(function (e) {
          body.innerHTML = '<div class="tpc-loading">Could not load list.</div>';
          loaded = false;
        });
      }
    });
    wrap.appendChild(head);
    wrap.appendChild(body);
    return wrap;
  }

  function buildTreeFallback() {
    var body = $('tpc-tree-body');
    body.innerHTML = '';
    Object.keys(CATEGORIES).forEach(function (cat) {
      var h = document.createElement('div');
      h.className = 'tpc-cat'; h.textContent = cat;
      body.appendChild(h);
      CATEGORIES[cat].forEach(function (name) {
        var path = slotPath(cat, name);
        var node = document.createElement('div');
        node.className = 'tpc-node';
        node.dataset.path = path;
        node.dataset.name = name;
        node.innerHTML = '<span class="tpc-dot"></span><span class="tpc-name">' + name + '</span>';
        node.addEventListener('click', function () { selectSlot(path); });
        body.appendChild(node);
      });
    });
    refreshTreeFlags();
  }

  function buildTree() {
    var body = $('tpc-tree-body');
    body.innerHTML = '<div class="tpc-loading">Loading texture list…</div>';
    fetchJSON(cdnListUrl('')).then(function (data) {
      body.innerHTML = '';
      var dirs = (data.directories || []).sort();
      if (!dirs.length) throw new Error('empty');
      dirs.forEach(function (d) { body.appendChild(makeDirGroup(d, d, 0)); });
      // Auto-open block + item so users see content immediately.
      var groups = body.querySelectorAll('.tpc-cat-toggle');
      for (var i = 0; i < groups.length; i++) {
        var t = groups[i].textContent.trim().toLowerCase();
        if (t === 'block' || t === 'item') { groups[i].click(); }
      }
      refreshTreeFlags();
    }).catch(function () {
      buildTreeFallback();
      showMsg('Using built-in texture list (could not reach the vanilla CDN).', false);
    });
  }


  function refreshTreeFlags() {
    document.querySelectorAll('.tpc-node').forEach(function (n) {
      n.classList.toggle('has', project.files.has(n.dataset.path));
      n.classList.toggle('active', n.dataset.path === selectedSlot);
    });
  }

  function selectSlot(path, cat, name) {
    // Save current canvas into project before switching.
    if (selectedSlot && project.files.has(selectedSlot)) {
      project.files.get(selectedSlot).canvas = cloneCanvas(canvas);
    }
    selectedSlot = path;
    var entry = project.files.get(path);
    if (entry) {
      copyCanvas(entry.canvas, canvas);
    } else {
      // New empty canvas (default 16x16)
      resetCanvas(16, 16);
    }
    $('tpc-slot-hint').textContent = 'Editing: ' + path;
    refreshTreeFlags();
    fitZoom();
    showVanillaPreview(path);
    undoStack = []; redoStack = [];
  }

  // Show a live vanilla reference thumbnail for the selected slot (from CDN).
  function showVanillaPreview(path) {
    var wrap = $('tpc-vanilla');
    var img = $('tpc-vanilla-img');
    if (!wrap || !img) return;
    wrap.hidden = true;
    var url = vanillaUrl(path);
    var probe = new Image();
    probe.crossOrigin = 'anonymous';
    probe.onload = function () {
      img.src = url;
      wrap.hidden = false;
    };
    probe.onerror = function () { wrap.hidden = true; };
    probe.src = url;
  }

  function resetCanvas(w, h) {
    canvas.width = w; canvas.height = h;
    prepCtx();
    ctx.clearRect(0, 0, w, h);
    renderCanvas();
  }

  function cloneCanvas(src) {
    var c = document.createElement('canvas');
    c.width = src.width; c.height = src.height;
    var cctx = c.getContext('2d');
    cctx.imageSmoothingEnabled = false;
    cctx.drawImage(src, 0, 0);
    return c;
  }
  function copyCanvas(src, dst) {
    dst.width = src.width; dst.height = src.height;
    prepCtx();
    ctx.drawImage(src, 0, 0);
    renderCanvas();
  }

  /* ---------- After edit: store + refresh views ---------- */
  function afterEdit() {
    if (selectedSlot) {
      var c = cloneCanvas(canvas);
      if (!project.files.has(selectedSlot)) {
        project.files.set(selectedSlot, { canvas: c, name: selectedSlot.split('/').pop() });
      } else {
        project.files.get(selectedSlot).canvas = c;
      }
    }
    refreshTreeFlags();
    renderFileList();
    renderPreview();
    renderMeta();
    renderIconOptions();
  }

  /* ---------- File list ---------- */
  function renderFileList() {
    var list = $('tpc-filelist');
    var count = project.files.size;
    $('tpc-file-count').textContent = count + (count === 1 ? ' texture' : ' textures');
    if (count === 0) { list.innerHTML = '<p class="tpc-empty">No textures yet. Pick a slot in the Editor and upload or draw one.</p>'; return; }
    list.innerHTML = '';
    project.files.forEach(function (entry, path) {
      var card = document.createElement('div');
      card.className = 'tpc-filecard';
      var img = document.createElement('img');
      img.src = canvasToDataURL(entry.canvas);
      var del = document.createElement('button');
      del.className = 'tpc-del'; del.textContent = '×'; del.title = 'Remove';
      del.addEventListener('click', function () {
        project.files.delete(path);
        if (selectedSlot === path) selectedSlot = null;
        refreshTreeFlags(); renderFileList(); renderPreview(); renderMeta(); renderIconOptions();
      });
      var name = document.createElement('div');
      name.className = 'tpc-fname'; name.textContent = path.replace('assets/minecraft/textures/', '');
      card.appendChild(del); card.appendChild(img); card.appendChild(name);
      list.appendChild(card);
    });
  }

  /* ---------- Preview ---------- */
  function renderPreview() {
    var grid = $('tpc-preview-grid');
    if (project.files.size === 0) { grid.innerHTML = '<p class="tpc-empty">Add textures to see a live preview here.</p>'; return; }
    grid.innerHTML = '';
    project.files.forEach(function (entry, path) {
      var div = document.createElement('div');
      div.className = 'tpc-prev';
      var img = document.createElement('img');
      img.src = canvasToDataURL(entry.canvas);
      var name = document.createElement('div');
      name.className = 'tpc-fname'; name.textContent = path.split('/').pop();
      div.appendChild(img); div.appendChild(name);
      grid.appendChild(div);
    });
  }

  /* ---------- pack.mcmeta ---------- */
  function buildMeta() {
    return {
      pack: {
        pack_format: parseInt($('tpc-format').value, 10),
        description: $('tpc-desc').value
      }
    };
  }
  function renderMeta() {
    $('tpc-meta-preview').textContent = JSON.stringify(buildMeta(), null, 2);
  }
  function renderIconOptions() {
    var sel = $('tpc-icon');
    var cur = sel.value;
    sel.innerHTML = '<option value="">None</option>';
    project.files.forEach(function (entry, path) {
      var o = document.createElement('option');
      o.value = path; o.textContent = path.split('/').pop();
      sel.appendChild(o);
    });
    if (cur) sel.value = cur;
  }

  /* ---------- Export ---------- */
  function canvasToPngBytes(c) {
    return new Promise(function (resolve) {
      c.toBlob(function (blob) {
        var fr = new FileReader();
        fr.onload = function () { resolve(new Uint8Array(fr.result)); };
        fr.readAsArrayBuffer(blob);
      }, 'image/png');
    });
  }

  function zipName() { return sanitizeName($('tpc-name').value) + '.zip'; }

  var statusTimer = null;
  function showMsg(text, ok) {
    var m = $('tpc-status');
    if (!m) return;
    m.hidden = false;
    m.className = 'tpc-status ' + (ok ? 'ok' : 'err');
    m.textContent = text;
    if (statusTimer) clearTimeout(statusTimer);
    // Errors stay a little longer; both auto-dismiss so the toast never lingers.
    statusTimer = setTimeout(function () { m.hidden = true; }, ok ? 3500 : 6000);
  }

  async function exportZip() {
    if (project.files.size === 0) { showMsg('Add at least one texture before exporting.', false); return; }
    try {
      var files = [];
      // pack.mcmeta
      var meta = buildMeta();
      var metaStr = JSON.stringify(meta, null, 2);
      files.push({ name: 'pack.mcmeta', data: new TextEncoder().encode(metaStr) });
      // optional pack.png icon
      var iconPath = $('tpc-icon').value;
      if (iconPath && project.files.has(iconPath)) {
        var ic = project.files.get(iconPath).canvas;
        var iconCanvas = document.createElement('canvas');
        iconCanvas.width = 64; iconCanvas.height = 64;
        var ictx = iconCanvas.getContext('2d');
        ictx.imageSmoothingEnabled = false;
        ictx.drawImage(ic, 0, 0, 64, 64);
        var iconBytes = await canvasToPngBytes(iconCanvas);
        files.push({ name: 'pack.png', data: iconBytes });
      }
      // textures
      var entries = Array.from(project.files.entries());
      for (var i = 0; i < entries.length; i++) {
        var bytes = await canvasToPngBytes(entries[i][1].canvas);
        files.push({ name: entries[i][0], data: bytes });
      }
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
    if (!selectedSlot) { showMsg('Select a texture slot on the left first.', false); return; }
    for (var i = 0; i < fileList.length; i++) {
      var f = fileList[i];
      if (!/image\//.test(f.type)) continue;
      try {
        var img = await fileToCanvas(f);
        // Place onto current canvas, preserving slot dimensions if it already exists.
        var entry = project.files.get(selectedSlot);
        var w, h;
        if (entry) { w = canvas.width; h = canvas.height; }
        else { w = img.width; h = img.height; resetCanvas(w, h); }
        prepCtx();
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        renderCanvas();
        afterEdit();
        if (w !== h || (w & (w - 1)) !== 0) {
          showMsg('Note: ' + w + '×' + h + ' is not a square power-of-two; Minecraft may not load it.', false);
        } else { showMsg('Loaded ' + selectedSlot.split('/').pop() + '.', true); }
      } catch (e) { showMsg('Could not load ' + f.name, false); }
    }
  }

  // Fetch the current slot's vanilla texture from the CDN and draw it in.
  async function loadVanilla() {
    if (!selectedSlot) { showMsg('Select a texture slot on the left first.', false); return; }
    var url = vanillaUrl(selectedSlot);
    showMsg('Fetching vanilla ' + selectedSlot.split('/').pop() + '…', true);
    try {
      var img = await loadImageCORS(url);
      var w = img.width, h = img.height;
      resetCanvas(w, h);
      prepCtx();
      ctx.drawImage(img, 0, 0, w, h);
      renderCanvas();
      fitZoom();
      afterEdit();
      showMsg('Loaded vanilla ' + selectedSlot.split('/').pop() + ' — edit and export.', true);
    } catch (e) {
      showMsg('No vanilla texture found for this slot in ' + formatToVersion($('tpc-format').value) + '. It may live in a sub-folder or not exist.', false);
    }
  }

  async function importFolder(fileList) {
    var added = 0;
    for (var i = 0; i < fileList.length; i++) {
      var f = fileList[i];
      if (!/image\/png/.test(f.type)) continue;
      var rel = (f.webkitRelativePath || f.name).replace(/\\/g, '/');
      // Map into assets/minecraft/... or keep relative if already namespaced.
      var path;
      if (/assets\/minecraft\//i.test(rel)) path = rel;
      else path = 'assets/minecraft/' + rel.replace(/^textures\/?/i, 'textures/');
      try {
        var img = await fileToCanvas(f);
        var c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        c.getContext('2d').drawImage(img, 0, 0);
        project.files.set(path, { canvas: c, name: path.split('/').pop() });
        added++;
      } catch (e) {}
    }
    if (added) { renderFileList(); renderPreview(); renderMeta(); renderIconOptions(); refreshTreeFlags();
      showMsg('Imported ' + added + ' file(s).', true); }
  }

  /* ---------- Wire up UI ---------- */
  function activateTab(name) {
    document.querySelectorAll('.tpc .tab').forEach(function (t) {
      var on = t.dataset.tab === name;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    document.querySelectorAll('.tpc .panel').forEach(function (p) {
      p.classList.toggle('active', p.id === 'tab-' + name);
    });
    if (name === 'preview') renderPreview();
    if (name === 'files') renderFileList();
    if (name === 'export') { renderMeta(); renderIconOptions(); }
  }

  function bindUI() {
    // Tabs
    document.querySelectorAll('.tpc .tab').forEach(function (tab) {
      tab.addEventListener('click', function () { activateTab(tab.dataset.tab); });
      tab.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateTab(tab.dataset.tab); }
      });
    });

    // Tools
    document.querySelectorAll('.tpc-tool').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.tpc-tool').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        currentTool = b.dataset.tool;
      });
    });

    // Brush, zoom, grid
    $('tpc-brush').addEventListener('change', function () { brushSize = parseInt(this.value, 10); });
    $('tpc-zoom').addEventListener('input', function () { zoom = parseInt(this.value, 10); renderCanvas(); });
    $('tpc-grid').addEventListener('change', function () { showGrid = this.checked; renderCanvas(); });
    $('tpc-color').addEventListener('input', function () { currentColor = this.value; addRecent(this.value); });
    $('tpc-undo').addEventListener('click', undo);
    $('tpc-redo').addEventListener('click', redo);
    $('tpc-clear').addEventListener('click', function () {
      if (!selectedSlot) return;
      pushUndo(); ctx.clearRect(0, 0, canvas.width, canvas.height); afterEdit();
    });

    // Canvas pointer events
    canvas.addEventListener('pointerdown', function (e) {
      if (!selectedSlot) { showMsg('Select a texture slot on the left first.', false); return; }
      drawing = true; canvas.setPointerCapture(e.pointerId);
      var p = eventToPixel(e);
      if (currentTool === 'picker') { pickColor(p.x, p.y); drawing = false; return; }
      if (currentTool === 'fill') { pushUndo(); floodFill(p.x, p.y, currentColor); afterEdit(); drawing = false; return; }
      pushUndo();
      lastPt = p;
      if (currentTool === 'pencil' || currentTool === 'eraser') {
        if (currentTool === 'eraser') erasePixel(p.x, p.y);
        else paintPixel(p.x, p.y, currentColor);
        afterEdit();
      } else if (currentTool === 'line' || currentTool === 'rect') {
        shapeSnapshot = snapshot();
      }
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!drawing) return;
      var p = eventToPixel(e);
      if (currentTool === 'pencil') paintPixel(p.x, p.y, currentColor);
      else if (currentTool === 'eraser') erasePixel(p.x, p.y);
      else if ((currentTool === 'line' || currentTool === 'rect') && lastPt && shapeSnapshot) {
        applyImageData(shapeSnapshot);
        if (currentTool === 'line') drawLine(lastPt.x, lastPt.y, p.x, p.y, currentColor);
        else drawRect(lastPt.x, lastPt.y, p.x, p.y, currentColor);
      }
    });
    canvas.addEventListener('pointerup', function (e) {
      if (!drawing) return;
      var p = eventToPixel(e);
      if (currentTool === 'line' || currentTool === 'rect') {
        if (lastPt && shapeSnapshot) {
          applyImageData(shapeSnapshot);
          if (currentTool === 'line') drawLine(lastPt.x, lastPt.y, p.x, p.y, currentColor);
          else drawRect(lastPt.x, lastPt.y, p.x, p.y, currentColor);
        }
        afterEdit();
        shapeSnapshot = null;
      } else if (currentTool === 'pencil' || currentTool === 'eraser') afterEdit();
      drawing = false; lastPt = null;
    });

    // Upload
    $('tpc-upload-btn').addEventListener('click', function () { $('tpc-upload').click(); });
    $('tpc-upload').addEventListener('change', function () { handleFiles(this.files); this.value = ''; });
    var loadVanillaBtn = $('tpc-load-vanilla');
    if (loadVanillaBtn) loadVanillaBtn.addEventListener('click', loadVanilla);
    var dz = $('tpc-drop');
    ['dragenter', 'dragover'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('drag'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('drag'); });
    });
    dz.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    });

    // Folder import
    $('tpc-import-folder').addEventListener('click', function () { $('tpc-folder').click(); });
    $('tpc-folder').addEventListener('change', function () { importFolder(this.files); this.value = ''; });

    // New blank
    $('tpc-new-blank').addEventListener('click', function () {
      var name = prompt('Texture file name (e.g. custom_block):', 'custom_block');
      if (!name) return;
      var path = 'assets/minecraft/textures/' + sanitizeName(name) + '.png';
      var c = document.createElement('canvas'); c.width = 16; c.height = 16;
      project.files.set(path, { canvas: c, name: path.split('/').pop() });
      refreshTreeFlags(); renderFileList(); renderPreview(); renderMeta(); renderIconOptions();
      showMsg('Created blank ' + path.split('/').pop(), true);
    });

    // Metadata inputs
    $('tpc-name').addEventListener('input', function () { project.name = this.value; });
    $('tpc-format').addEventListener('change', function () {
      renderMeta();
      if (selectedSlot) showVanillaPreview(selectedSlot);
    });
    $('tpc-desc').addEventListener('input', renderMeta);

    // Tree search
    $('tpc-tree-search').addEventListener('input', function () {
      var q = this.value.toLowerCase();
      document.querySelectorAll('.tpc-node').forEach(function (n) {
        var show = !q || n.dataset.name.indexOf(q) !== -1 || n.dataset.path.indexOf(q) !== -1;
        n.style.display = show ? '' : 'none';
      });
      document.querySelectorAll('.tpc-cat').forEach(function (cat) {
        // Hide a category header if none of its sibling nodes are visible.
        var sib = cat.nextElementSibling; var visible = false;
        while (sib && sib.classList.contains('tpc-node')) { if (sib.style.display !== 'none') visible = true; sib = sib.nextElementSibling; }
        cat.style.display = visible ? '' : 'none';
      });
    });

    // Export
    $('tpc-export-zip').addEventListener('click', exportZip);
    $('tpc-export-meta').addEventListener('click', exportMetaOnly);

    // Responsive: re-fit the canvas when the viewport changes (debounced).
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fitZoom, 150);
    });

    // Keyboard
    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.ctrlKey && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
      else if (e.ctrlKey && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) { e.preventDefault(); redo(); }
      else if (e.key.toLowerCase() === 'b') setTool('pencil');
      else if (e.key.toLowerCase() === 'e') setTool('eraser');
      else if (e.key.toLowerCase() === 'g') setTool('fill');
      else if (e.key.toLowerCase() === 'i') setTool('picker');
    });
  }

  function setTool(t) {
    currentTool = t;
    document.querySelectorAll('.tpc-tool').forEach(function (x) { x.classList.toggle('active', x.dataset.tool === t); });
  }

  /* ---------- Init ---------- */
  function init() {
    if (inited) return;
    inited = true;
    if (!canvas || typeof TpcZip === 'undefined') {
      console.error('TPC init failed: missing canvas or TpcZip.');
      return;
    }
    project.name = $('tpc-name').value;
    project.format = parseInt($('tpc-format').value, 10);
    project.description = $('tpc-desc').value;
    resetCanvas(16, 16);
    buildTree();
    renderSwatches();
    bindUI();
    renderMeta();
    renderIconOptions();
    // Auto-select first node so users can start immediately.
    var first = document.querySelector('.tpc-node');
    if (first) first.click();
    // Re-fit whenever the canvas box gets a real size (covers async CSS,
    // desktop grid layout, window resize, and switching back to the Editor).
    observeCanvasBox();
    requestAnimationFrame(fitZoom);
    setTimeout(fitZoom, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
