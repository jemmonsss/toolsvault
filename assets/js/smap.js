/* Minecraft Seed Map — client-side interactive seed explorer.
 * Renders a biome/structure map on a canvas with pan, zoom, and download.
 * Biome placement is approximated using layered seeded pseudo-noise.
 */
(function () {
  'use strict';

  var canvas = document.getElementById('smap-canvas');
  var ctx = canvas.getContext('2d');
  var wrap = document.getElementById('smap-canvas-wrap');

  var state = {
    seed: 123456789,
    version: '1.21.5',
    dimension: 'overworld',
    scale: 4,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragOffsetX: 0,
    dragOffsetY: 0,
    mapData: null,
    structures: [],
    imageBitmap: null
  };

  var STRUCTURE_COLORS = {
    village: '#e74c3c',
    temple: '#f1c40f',
    mineshaft: '#95a5a6',
    stronghold: '#8e44ad',
    ocean_monument: '#3498db',
    woodland_mansion: '#27ae60',
    nether_fortress: '#c0392b',
    bastion: '#d35400',
    end_city: '#1abc9c'
  };

  var BIOME_COLORS = {
    'minecraft:plains': '#91bd59',
    'minecraft:forest': '#77ab2f',
    'minecraft:flower_forest': '#77ab2f',
    'minecraft:birch_forest': '#aad240',
    'minecraft:dark_forest': '#283813',
    'minecraft:old_growth_birch_forest': '#aad240',
    'minecraft:old_growth_pine_taiga': '#7d9a47',
    'minecraft:old_growth_spruce_taiga': '#7d9a47',
    'minecraft:taiga': '#7d9a47',
    'minecraft:snowy_plains': '#f0f0f0',
    'minecraft:snowy_taiga': '#b5d5c8',
    'minecraft:ice_spikes': '#b5d5c8',
    'minecraft:desert': '#f4e27a',
    'minecraft:savanna': '#e3c070',
    'minecraft:savanna_plateau': '#e3c070',
    'minecraft:badlands': '#b08555',
    'minecraft:wooded_badlands': '#b08555',
    'minecraft:eroded_badlands': '#b08555',
    'minecraft:swamp': '#607534',
    'minecraft:mangrove_swamp': '#607534',
    'minecraft:jungle': '#5d8b3e',
    'minecraft:sparse_jungle': '#5d8b3e',
    'minecraft:bamboo_jungle': '#5d8b3e',
    'minecraft:river': '#3344aa',
    'minecraft:frozen_river': '#3344aa',
    'minecraft:ocean': '#3366cc',
    'minecraft:deep_ocean': '#1a3380',
    'minecraft:warm_ocean': '#3366cc',
    'minecraft:lukewarm_ocean': '#3366cc',
    'minecraft:cold_ocean': '#3366cc',
    'minecraft:deep_frozen_ocean': '#1a3380',
    'minecraft:deep_cold_ocean': '#1a3380',
    'minecraft:deep_lukewarm_ocean': '#1a3380',
    'minecraft:nether_wastes': '#3d1c02',
    'minecraft:soul_sand_valley': '#3d1c02',
    'minecraft:crimson_forest': '#7a1020',
    'minecraft:warped_forest': '#1a6040',
    'minecraft:basalt_deltas': '#3d3d3d',
    'minecraft:the_end': '#0a0a0a',
    'minecraft:small_end_islands': '#0a0a0a',
    'minecraft:end_midlands': '#0a0a0a',
    'minecraft:end_highlands': '#0a0a0a',
    'minecraft:end_barrens': '#0a0a0a',
    'minecraft:cherry_grove': '#f5a0b5',
    'minecraft:meadow': '#9ab87a',
    'minecraft:grove': '#d0e8d0',
    'minecraft:snowy_slopes': '#d0e8d0',
    'minecraft:stony_peaks': '#8a7a6a',
    'minecraft:lush_caves': '#2d5a1e',
    'minecraft:dripstone_caves': '#5a4a3a',
    'minecraft:deep_dark': '#0f0f0f'
  };

  function hashSeed(seed, x, z) {
    var h = seed + x * 374761393 + z * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    h = h ^ (h >> 16);
    return h;
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(a, b, t) { return a + t * (b - a); }

  function grad(hash, x, y, z) {
    var h = hash & 15;
    var u = h < 8 ? x : y;
    var v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  function perlin(x, y, z, seed) {
    var X = Math.floor(x) & 255;
    var Y = Math.floor(y) & 255;
    var Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    var u = fade(x);
    var v = fade(y);
    var w = fade(z);
    var A = (hashSeed(seed, X, Y) & 255) * 2;
    var AA = (hashSeed(seed, A + X, Y) & 255) * 2;
    var AB = (hashSeed(seed, A + X + 1, Y) & 255) * 2;
    var B = (hashSeed(seed, X + 1, Y) & 255) * 2;
    var BA = (hashSeed(seed, B + X, Y) & 255) * 2;
    var BB = (hashSeed(seed, B + X + 1, Y) & 255) * 2;

    return lerp(
      lerp(
        lerp(grad(hashSeed(seed, AA, Z), x, y, z), grad(hashSeed(seed, BA, Z), x - 1, y, z), u),
        lerp(grad(hashSeed(seed, AB, Z), x, y, z), grad(hashSeed(seed, BB, Z), x - 1, y, z), u),
        v
      ),
      lerp(
        lerp(grad(hashSeed(seed, AA + 1, Z), x, y, z - 1), grad(hashSeed(seed, BA + 1, Z), x - 1, y, z - 1), u),
        lerp(grad(hashSeed(seed, AB + 1, Z), x, y, z - 1), grad(hashSeed(seed, BB + 1, Z), x - 1, y, z - 1), u),
        v
      ),
      w
    );
  }

  function fbm(x, y, z, seed, octaves) {
    var value = 0;
    var amplitude = 1;
    var frequency = 1;
    var maxValue = 0;
    for (var i = 0; i < octaves; i++) {
      value += amplitude * perlin(x * frequency, y * frequency, z * frequency, seed);
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }
    return value / maxValue;
  }

  function getBiome(temp, humidity) {
    if (temp < 0.15) {
      if (humidity < 0.5) return 'minecraft:snowy_plains';
      if (humidity < 0.75) return 'minecraft:ice_spikes';
      return 'minecraft:snowy_taiga';
    }
    if (temp > 0.95) {
      if (humidity < 0.5) return 'minecraft:desert';
      return 'minecraft:desert';
    }
    if (temp > 0.75) {
      if (humidity < 0.4) return 'minecraft:savanna';
      if (humidity < 0.7) return 'minecraft:plains';
      return 'minecraft:forest';
    }
    if (temp > 0.55) {
      if (humidity < 0.35) return 'minecraft:savanna_plateau';
      if (humidity < 0.55) return 'minecraft:plains';
      return 'minecraft:forest';
    }
    if (temp > 0.35) {
      if (humidity < 0.3) return 'minecraft:badlands';
      if (humidity < 0.5) return 'minecraft:forest';
      if (humidity < 0.7) return 'minecraft:taiga';
      return 'minecraft:forest';
    }
    if (temp > 0.2) {
      if (humidity < 0.4) return 'minecraft:forest';
      if (humidity < 0.6) return 'minecraft:taiga';
      return 'minecraft:forest';
    }
    if (humidity > 0.7) return 'minecraft:old_growth_spruce_taiga';
    return 'minecraft:taiga';
  }

  function getBiomeColor(biome) {
    return BIOME_COLORS[biome] || '#7a7a7a';
  }

  function generateBiomeData(cx, cz, width, height, scale, seed, dimension) {
    var data = new Uint8ClampedArray(width * height * 4);
    var invScale = 1 / Math.max(1, scale);
    var seed2 = seed * 65535;
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        var worldX = (cx + x) * invScale;
        var worldZ = (cz + y) * invScale;
        var temp, humidity;
        if (dimension === 'nether') {
          temp = 0.9 + fbm(worldX * 0.05, 0, worldZ * 0.05, seed, 3) * 0.2;
          humidity = fbm(worldX * 0.05 + 100, 0, worldZ * 0.05 + 100, seed, 3) * 0.6 + 0.2;
          temp = Math.max(0, Math.min(1, temp));
          humidity = Math.max(0, Math.min(1, humidity));
        } else if (dimension === 'end') {
          temp = 0.5 + fbm(worldX * 0.02, 0, worldZ * 0.02, seed, 2) * 0.1;
          humidity = 0.3 + fbm(worldX * 0.02 + 50, 0, worldZ * 0.02 + 50, seed, 2) * 0.1;
        } else {
          temp = fbm(worldX * 0.003, 0, worldZ * 0.003, seed, 4) * 0.5 + 0.25;
          humidity = fbm(worldX * 0.003 + 1000, 0, worldZ * 0.003 + 1000, seed, 4) * 0.5 + 0.25;
          temp = Math.max(0, Math.min(1, temp));
          humidity = Math.max(0, Math.min(1, humidity));
        }
        var biome = getBiome(temp, humidity);
        var color = getBiomeColor(biome);
        var idx = (y * width + x) * 4;
        data[idx] = parseInt(color.slice(1, 3), 16);
        data[idx + 1] = parseInt(color.slice(3, 5), 16);
        data[idx + 2] = parseInt(color.slice(5, 7), 16);
        data[idx + 3] = 255;
      }
    }
    return { data: data, width: width, height: height, biomeMap: null };
  }

  function generateStructures(cx, cz, width, height, scale, seed, dimension) {
    var structures = [];
    var invScale = 1 / Math.max(1, scale);
    var spacing = dimension === 'nether' ? 32 : (dimension === 'end' ? 64 : 32);
    var rand = mulberry32(seed);
    if (dimension === 'overworld') {
      for (var z = cz; z < cz + height * invScale; z += spacing) {
        for (var x = cx; x < cx + width * invScale; x += spacing) {
          var r = rand();
          if (r < 0.08) {
            structures.push({ type: 'village', x: x * invScale + rand() * 16, z: z * invScale + rand() * 16 });
          } else if (r < 0.12) {
            structures.push({ type: 'temple', x: x * invScale + rand() * 16, z: z * invScale + rand() * 16 });
          } else if (r < 0.18) {
            structures.push({ type: 'mineshaft', x: x * invScale + rand() * 16, z: z * invScale + rand() * 16 });
          } else if (r < 0.22) {
            structures.push({ type: 'ocean_monument', x: x * invScale + rand() * 32, z: z * invScale + rand() * 32 });
          } else if (r < 0.25) {
            structures.push({ type: 'woodland_mansion', x: x * invScale + rand() * 32, z: z * invScale + rand() * 32 });
          } else if (r < 0.28) {
            structures.push({ type: 'stronghold', x: x * invScale + rand() * 32, z: z * invScale + rand() * 32 });
          }
        }
      }
    } else if (dimension === 'nether') {
      for (var z = cz; z < cz + height * invScale; z += spacing) {
        for (var x = cx; x < cx + width * invScale; x += spacing) {
          var r = rand();
          if (r < 0.06) {
            structures.push({ type: 'nether_fortress', x: x * invScale + rand() * 16, z: z * invScale + rand() * 16 });
          } else if (r < 0.12) {
            structures.push({ type: 'bastion', x: x * invScale + rand() * 16, z: z * invScale + rand() * 16 });
          }
        }
      }
    } else if (dimension === 'end') {
      for (var z = cz; z < cz + height * invScale; z += spacing) {
        for (var x = cx; x < cx + width * invScale; x += spacing) {
          if (rand() < 0.03) {
            structures.push({ type: 'end_city', x: x * invScale + rand() * 16, z: z * invScale + rand() * 16 });
          }
        }
      }
    }
    return structures;
  }

  function renderMap() {
    var seed = parseInt(state.seed, 10);
    if (isNaN(seed)) seed = hashStringSeed(state.seed);
    state.seed = seed;
    var scale = parseInt(state.scale, 10) || 4;
    state.scale = scale;
    var rect = wrap.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    var width = Math.max(1, Math.floor(rect.width));
    var height = Math.max(1, Math.floor(rect.height));
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var viewW = width * scale;
    var viewH = height * scale;
    var cx = Math.floor(state.offsetX - viewW / 2);
    var cz = Math.floor(state.offsetY - viewH / 2);

    showStatus('Generating map...', 'ok');
    setTimeout(function () {
      var biomeData = generateBiomeData(cx, cz, width, height, scale, seed, state.dimension);
      var structures = generateStructures(cx, cz, width, height, scale, seed, state.dimension);
      state.mapData = biomeData;
      state.structures = structures;

      var imgData = ctx.createImageData(width, height);
      var src = biomeData.data;
      for (var i = 0; i < src.length; i++) imgData.data[i] = src[i];
      ctx.putImageData(imgData, 0, 0);

      ctx.globalAlpha = 0.9;
      structures.forEach(function (s) {
        var sx = (s.x - cx) / scale;
        var sz = (s.z - cz) / scale;
        if (sx < -10 || sx > width + 10 || sz < -10 || sz > height + 10) return;
        var color = STRUCTURE_COLORS[s.type] || '#ffffff';
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(sx, sz, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      ctx.globalAlpha = 1;

      updateLegend(structures);
      showStatus('Ready — seed: ' + seed, 'ok');
    }, 10);
  }

  function hashStringSeed(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  function updateLegend(structures) {
    var items = document.getElementById('smap-legend-items');
    var structLegend = document.getElementById('smap-struct-legend');
    items.innerHTML = '';
    structLegend.innerHTML = '';
    var seen = {};
    structures.forEach(function (s) {
      if (!seen[s.type]) {
        seen[s.type] = true;
        var color = STRUCTURE_COLORS[s.type] || '#ffffff';
        var item = document.createElement('div');
        item.className = 'smap-legend-item';
        item.innerHTML = '<span class="smap-swatch" style="background:' + color + '"></span>' + s.type.replace(/_/g, ' ');
        structLegend.appendChild(item);
      }
    });
    if (structLegend.children.length === 0) {
      structLegend.innerHTML = '<span class="smap-legend-item">No structures in this view</span>';
    }
  }

  function showStatus(text, ok) {
    var el = document.getElementById('smap-status');
    if (!el) return;
    el.hidden = false;
    el.className = 'smap-status ' + (ok ? 'ok' : 'err');
    el.textContent = text;
    setTimeout(function () { el.hidden = true; }, 3000);
  }

  function screenToWorld(sx, sy) {
    var rect = wrap.getBoundingClientRect();
    var x = sx - rect.left;
    var y = sy - rect.top;
    var scale = parseInt(state.scale, 10) || 4;
    var worldX = state.offsetX + (x - rect.width / 2) * scale;
    var worldZ = state.offsetY + (y - rect.height / 2) * scale;
    return { x: Math.floor(worldX), z: Math.floor(worldZ) };
  }

  function updateCoords(e) {
    var coords = document.getElementById('smap-coords');
    if (!coords) return;
    var w = screenToWorld(e.clientX, e.clientY);
    coords.textContent = 'X: ' + w.x + '  Z: ' + w.z;
  }

  wrap.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    state.isDragging = true;
    state.dragStartX = e.clientX;
    state.dragStartY = e.clientY;
    state.dragOffsetX = state.offsetX;
    state.dragOffsetY = state.offsetY;
    wrap.setPointerCapture(e.pointerId);
  });

  wrap.addEventListener('pointermove', function (e) {
    updateCoords(e);
    if (!state.isDragging) return;
    var scale = parseInt(state.scale, 10) || 4;
    var dx = (e.clientX - state.dragStartX) * scale;
    var dy = (e.clientY - state.dragStartY) * scale;
    state.offsetX = state.dragOffsetX - dx;
    state.offsetY = state.dragOffsetY - dy;
    renderMap();
  });

  wrap.addEventListener('pointerup', function (e) {
    state.isDragging = false;
    wrap.releasePointerCapture(e.pointerId);
  });

  wrap.addEventListener('pointerleave', function () {
    state.isDragging = false;
  });

  wrap.addEventListener('wheel', function (e) {
    e.preventDefault();
    var delta = e.deltaY > 0 ? 1 : -1;
    var scales = [1, 2, 4, 8, 16, 32];
    var idx = scales.indexOf(parseInt(state.scale, 10) || 4);
    if (idx < 0) idx = 2;
    idx = Math.max(0, Math.min(scales.length - 1, idx + delta));
    state.scale = scales[idx];
    document.getElementById('smap-scale').value = String(state.scale);
    renderMap();
  }, { passive: false });

  function zoomIn() {
    var scales = [1, 2, 4, 8, 16, 32];
    var idx = scales.indexOf(parseInt(state.scale, 10) || 4);
    if (idx < 0) idx = 2;
    idx = Math.max(0, Math.min(scales.length - 1, idx + 1));
    state.scale = scales[idx];
    document.getElementById('smap-scale').value = String(state.scale);
    renderMap();
  }

  function zoomOut() {
    var scales = [1, 2, 4, 8, 16, 32];
    var idx = scales.indexOf(parseInt(state.scale, 10) || 4);
    if (idx < 0) idx = 2;
    idx = Math.max(0, Math.min(scales.length - 1, idx - 1));
    state.scale = scales[idx];
    document.getElementById('smap-scale').value = String(state.scale);
    renderMap();
  }

  function resetView() {
    state.zoom = 1;
    state.offsetX = 0;
    state.offsetY = 0;
    state.scale = 4;
    document.getElementById('smap-scale').value = '4';
    renderMap();
  }

  function downloadMap() {
    var link = document.createElement('a');
    link.download = 'seedmap_' + state.seed + '_' + state.dimension + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function randomSeed() {
    var s = Math.floor(Math.random() * 999999999999);
    document.getElementById('smap-seed').value = s;
    state.seed = s;
    renderMap();
  }

  document.getElementById('smap-generate').addEventListener('click', function () {
    state.seed = document.getElementById('smap-seed').value;
    state.version = document.getElementById('smap-version').value;
    state.dimension = document.getElementById('smap-dimension').value;
    state.scale = document.getElementById('smap-scale').value;
    state.offsetX = 0;
    state.offsetY = 0;
    renderMap();
  });

  document.getElementById('smap-random').addEventListener('click', randomSeed);
  document.getElementById('smap-download').addEventListener('click', downloadMap);
  document.getElementById('smap-zoom-in').addEventListener('click', zoomIn);
  document.getElementById('smap-zoom-out').addEventListener('click', zoomOut);
  document.getElementById('smap-reset').addEventListener('click', resetView);

  document.getElementById('smap-seed').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('smap-generate').click();
  });

  window.addEventListener('resize', function () {
    if (state.mapData) renderMap();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { renderMap(); });
  else renderMap();
})();
