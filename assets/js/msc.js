/* ============================================================
   Minecraft Server Creator (msc.js)
   Generates a fully-configured, ready-to-run Minecraft server
   package as a downloadable .zip file.
   ============================================================ */
(function () {
  'use strict';

  /* ── Constants ── */
  var STORAGE_KEY = 'msc_project';
  var MODRINTH_API = 'https://api.modrinth.com/v2';

  /* ── Server Types ── */
  var SERVER_TYPES = [
    { id: 'vanilla',  label: 'Vanilla',  icon: '🟩', desc: 'Official Mojang server', category: 'vanilla' },
    { id: 'paper',    label: 'Paper',    icon: '📄', desc: 'High-performance Spigot fork', category: 'plugin' },
    { id: 'spigot',   label: 'Spigot',   icon: '🔧', desc: 'CraftBukkit fork with plugins', category: 'plugin' },
    { id: 'purpur',   label: 'Purpur',   icon: '🟣', desc: 'Paper fork with extra config', category: 'plugin' },
    { id: 'fabric',   label: 'Fabric',   icon: '🧵', desc: 'Lightweight mod loader', category: 'mod' },
    { id: 'forge',    label: 'Forge',    icon: '⚒️', desc: 'Classic mod loader', category: 'mod' },
    { id: 'neoforge', label: 'NeoForge', icon: '🔥', desc: 'Modern Forge continuation', category: 'mod' }
  ];

  /* ── MC Versions (fallback — APIs may provide more) ── */
  var MC_VERSIONS = [
    '1.21.5','1.21.4','1.21.3','1.21.2','1.21.1','1.21',
    '1.20.6','1.20.5','1.20.4','1.20.3','1.20.2','1.20.1','1.20',
    '1.19.4','1.19.3','1.19.2','1.19.1','1.19',
    '1.18.2','1.18.1','1.18',
    '1.17.1','1.17',
    '1.16.5','1.16.4','1.16.3','1.16.2','1.16.1','1.16',
    '1.15.2','1.15.1','1.15',
    '1.14.4','1.14.3','1.14.2','1.14.1','1.14',
    '1.13.2','1.13.1','1.13',
    '1.12.2','1.12.1','1.12',
    '1.11.2','1.11.1','1.11',
    '1.10.2','1.10',
    '1.9.4','1.9.2','1.9',
    '1.8.9','1.8.8','1.8',
    '1.7.10','1.7.2'
  ];

  /* ── Java version recommendations ── */
  function recommendedJava(mcVersion) {
    var parts = mcVersion.split('.').map(Number);
    var minor = parts[1] || 0;
    if (minor >= 21) return '21';
    if (minor >= 18) return '17';
    if (minor >= 17) return '17';
    if (minor >= 12) return '8';
    return '8';
  }

  /* ── server.properties schema ── */
  var PROPERTIES_SCHEMA = [
    { group: 'World', props: [
      { key: 'level-name',          label: 'World Name',          type: 'text',    def: 'world',   desc: 'Name of the world folder' },
      { key: 'level-seed',          label: 'World Seed',          type: 'text',    def: '',        desc: 'Leave blank for random seed' },
      { key: 'level-type',          label: 'World Type',          type: 'select',  def: 'minecraft\\:normal', desc: 'World generation type',
        options: [
          { value: 'minecraft\\:normal', label: 'Normal' },
          { value: 'minecraft\\:flat', label: 'Flat / Superflat' },
          { value: 'minecraft\\:large_biomes', label: 'Large Biomes' },
          { value: 'minecraft\\:amplified', label: 'Amplified' },
          { value: 'minecraft\\:single_biome_surface', label: 'Single Biome' }
        ]},
      { key: 'generate-structures', label: 'Generate Structures', type: 'bool',    def: true,      desc: 'Villages, temples, etc.' },
      { key: 'max-world-size',      label: 'Max World Size',      type: 'number',  def: 29999984,  desc: 'Radius of world border in blocks', min: 1, max: 29999984 },
      { key: 'spawn-protection',    label: 'Spawn Protection',    type: 'number',  def: 16,        desc: 'Radius around spawn that non-ops cannot modify (0 = off)', min: 0, max: 1000 },
      { key: 'allow-nether',        label: 'Allow Nether',        type: 'bool',    def: true,      desc: 'Enable the Nether dimension' }
    ]},
    { group: 'Gameplay', props: [
      { key: 'gamemode',            label: 'Default Gamemode',    type: 'select',  def: 'survival', desc: 'Default gamemode for new players',
        options: [
          { value: 'survival', label: 'Survival' },
          { value: 'creative', label: 'Creative' },
          { value: 'adventure', label: 'Adventure' },
          { value: 'spectator', label: 'Spectator' }
        ]},
      { key: 'force-gamemode',      label: 'Force Gamemode',      type: 'bool',    def: false,     desc: 'Force default gamemode on join' },
      { key: 'difficulty',          label: 'Difficulty',          type: 'select',  def: 'easy',    desc: 'Server difficulty',
        options: [
          { value: 'peaceful', label: 'Peaceful' },
          { value: 'easy', label: 'Easy' },
          { value: 'normal', label: 'Normal' },
          { value: 'hard', label: 'Hard' }
        ]},
      { key: 'hardcore',            label: 'Hardcore',            type: 'bool',    def: false,     desc: 'Players are banned on death' },
      { key: 'pvp',                 label: 'PvP',                 type: 'bool',    def: true,      desc: 'Allow player-vs-player combat' },
      { key: 'allow-flight',        label: 'Allow Flight',        type: 'bool',    def: false,     desc: 'Allow survival flight (anti-cheat)' },
      { key: 'spawn-animals',       label: 'Spawn Animals',       type: 'bool',    def: true,      desc: 'Spawn passive mobs' },
      { key: 'spawn-monsters',      label: 'Spawn Monsters',      type: 'bool',    def: true,      desc: 'Spawn hostile mobs' },
      { key: 'spawn-npcs',          label: 'Spawn NPCs',          type: 'bool',    def: true,      desc: 'Spawn villagers' },
      { key: 'enable-command-block', label: 'Command Blocks',     type: 'bool',    def: false,     desc: 'Enable command blocks' },
      { key: 'player-idle-timeout', label: 'Idle Timeout (min)',  type: 'number',  def: 0,         desc: 'Kick idle players after N minutes (0 = off)', min: 0, max: 1440 }
    ]},
    { group: 'Network', props: [
      { key: 'server-port',         label: 'Server Port',         type: 'number',  def: 25565,     desc: 'Port the server listens on', min: 1, max: 65535 },
      { key: 'server-ip',           label: 'Server IP',           type: 'text',    def: '',        desc: 'Leave blank to bind to all interfaces' },
      { key: 'max-players',         label: 'Max Players',         type: 'number',  def: 20,        desc: 'Maximum simultaneous players', min: 1, max: 1000000 },
      { key: 'online-mode',         label: 'Online Mode',         type: 'bool',    def: true,      desc: 'Authenticate with Mojang (disable for offline/cracked)' },
      { key: 'network-compression-threshold', label: 'Compression Threshold', type: 'number', def: 256, desc: 'Bytes before packet compression (-1 = disabled)', min: -1, max: 65535 },
      { key: 'prevent-proxy-connections', label: 'Prevent Proxy',  type: 'bool',    def: false,     desc: 'Block VPN/proxy connections' },
      { key: 'enable-status',       label: 'Enable Status',       type: 'bool',    def: true,      desc: 'Show server in server list' }
    ]},
    { group: 'Performance', props: [
      { key: 'view-distance',       label: 'View Distance',       type: 'number',  def: 10,        desc: 'Render distance in chunks', min: 2, max: 32 },
      { key: 'simulation-distance', label: 'Simulation Distance', type: 'number',  def: 10,        desc: 'Entity tick distance in chunks (1.18+)', min: 2, max: 32 },
      { key: 'max-tick-time',       label: 'Max Tick Time (ms)',   type: 'number',  def: 60000,     desc: 'Crash if a tick takes longer (-1 = off)', min: -1, max: 600000 },
      { key: 'entity-broadcast-range-percentage', label: 'Entity Broadcast %', type: 'number', def: 100, desc: 'How far entities are visible', min: 10, max: 1000 }
    ]},
    { group: 'MOTD & Display', props: [
      { key: 'motd',                label: 'Server MOTD',         type: 'text',    def: 'A Minecraft Server', desc: 'Message shown in server list (supports §color codes)' }
    ]},
    { group: 'Security & Admin', props: [
      { key: 'white-list',          label: 'Whitelist',           type: 'bool',    def: false,     desc: 'Only whitelisted players can join' },
      { key: 'enforce-whitelist',   label: 'Enforce Whitelist',   type: 'bool',    def: false,     desc: 'Kick non-whitelisted players when enabled' },
      { key: 'enable-rcon',         label: 'Enable RCON',         type: 'bool',    def: false,     desc: 'Remote console access' },
      { key: 'rcon.port',           label: 'RCON Port',           type: 'number',  def: 25575,     desc: 'RCON port', min: 1, max: 65535 },
      { key: 'rcon.password',       label: 'RCON Password',       type: 'password', def: '',       desc: 'Set a strong password if RCON is enabled' },
      { key: 'enable-query',        label: 'Enable Query',        type: 'bool',    def: false,     desc: 'GameSpy4 query protocol' },
      { key: 'query.port',          label: 'Query Port',          type: 'number',  def: 25565,     desc: 'Query port', min: 1, max: 65535 }
    ]}
  ];

  /* ── JVM Presets ── */
  var JVM_PRESETS = [
    {
      id: 'default',
      name: 'Basic / Default',
      desc: 'Simple flags suitable for any server',
      flags: function(minRam, maxRam) {
        return '-Xms' + minRam + ' -Xmx' + maxRam;
      }
    },
    {
      id: 'aikars',
      name: "Aikar's Flags",
      desc: 'Optimized GC flags for Paper/Spigot (recommended)',
      flags: function(minRam, maxRam) {
        var maxInt = parseInt(maxRam) || 4;
        var g1Reserve = maxInt >= 12 ? '15' : '20';
        return '-Xms' + minRam + ' -Xmx' + maxRam +
          ' -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200' +
          ' -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC' +
          ' -XX:+AlwaysPreTouch -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40' +
          ' -XX:G1HeapRegionSize=8M -XX:G1ReservePercent=' + g1Reserve +
          ' -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4' +
          ' -XX:InitiatingHeapOccupancyPercent=15 -XX:G1MixedGCLiveThresholdPercent=90' +
          ' -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32' +
          ' -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1' +
          ' -Dusing.aikars.flags=https://mcflags.emc.gs -Daikars.new.flags=true';
      }
    },
    {
      id: 'graalvm',
      name: 'GraalVM Optimized',
      desc: 'For GraalVM JDK — max throughput',
      flags: function(minRam, maxRam) {
        return '-Xms' + minRam + ' -Xmx' + maxRam +
          ' -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200' +
          ' -XX:+UnlockExperimentalVMOptions -XX:+UnlockDiagnosticVMOptions' +
          ' -XX:+AlwaysPreTouch -XX:+UseStringDeduplication' +
          ' -XX:+UseCompressedOops -XX:+OptimizeStringConcat';
      }
    },
    {
      id: 'lowmem',
      name: 'Low Memory',
      desc: 'For servers with 1-2GB RAM',
      flags: function(minRam, maxRam) {
        return '-Xms' + minRam + ' -Xmx' + maxRam +
          ' -XX:+UseG1GC -XX:G1HeapRegionSize=4M' +
          ' -XX:+UnlockExperimentalVMOptions -XX:MaxGCPauseMillis=150' +
          ' -XX:G1NewSizePercent=20 -XX:G1ReservePercent=20';
      }
    }
  ];

  /* ── State ── */
  var state = createDefaultState();

  function createDefaultState() {
    return {
      serverType: 'paper',
      mcVersion: '1.21.5',
      serverName: 'My Minecraft Server',
      properties: buildDefaultProperties(),
      ops: [],
      whitelist: [],
      bannedPlayers: [],
      bannedIps: [],
      addons: [],         // plugins or mods
      jvm: {
        minRam: '1G',
        maxRam: '4G',
        preset: 'aikars',
        customFlags: '',
        autoRestart: true,
        restartDelay: 10
      },
      serverIcon: null     // data-URL or null
    };
  }

  function buildDefaultProperties() {
    var props = {};
    PROPERTIES_SCHEMA.forEach(function (g) {
      g.props.forEach(function (p) {
        props[p.key] = p.def;
      });
    });
    return props;
  }

  /* ── DOM helpers ── */
  function $(id) { return document.getElementById(id); }
  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'className') e.className = attrs[k];
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    });
    if (children) {
      if (!Array.isArray(children)) children = [children];
      children.forEach(function (c) {
        if (typeof c === 'string') e.appendChild(document.createTextNode(c));
        else if (c) e.appendChild(c);
      });
    }
    return e;
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  /* ── Status toast ── */
  function showStatus(msg, type) {
    var s = $('msc-status');
    if (!s) return;
    s.textContent = msg;
    s.className = 'msc-status ' + (type || '');
    s.hidden = false;
    clearTimeout(showStatus._t);
    showStatus._t = setTimeout(function () { s.hidden = true; }, 4000);
  }

  /* ── Tab: Server Type & Version ── */
  function renderTypeTab() {
    /* Server type buttons */
    var grid = $('msc-type-grid');
    if (!grid) return;
    clear(grid);
    SERVER_TYPES.forEach(function (st) {
      var btn = el('button', {
        className: 'msc-type-btn' + (state.serverType === st.id ? ' active' : ''),
        type: 'button',
        onClick: function () {
          state.serverType = st.id;
          renderTypeTab();
          renderAddonsTab();
          updateAddonLabel();
        }
      }, [
        el('span', { className: 'msc-type-icon' }, st.icon),
        el('span', { className: 'msc-type-label' }, st.label),
        el('span', { className: 'msc-type-desc' }, st.desc)
      ]);
      grid.appendChild(btn);
    });

    /* Version select */
    var vsel = $('msc-version');
    if (vsel) {
      var cur = vsel.value;
      clear(vsel);
      MC_VERSIONS.forEach(function (v) {
        var opt = el('option', { value: v }, v);
        if (v === state.mcVersion) opt.selected = true;
        vsel.appendChild(opt);
      });
      if (cur !== state.mcVersion) vsel.value = state.mcVersion;
    }

    /* Java recommendation */
    var javaHint = $('msc-java-hint');
    if (javaHint) {
      javaHint.textContent = 'Recommended: Java ' + recommendedJava(state.mcVersion);
    }
  }

  /* ── Tab: Server Properties ── */
  function renderPropertiesTab() {
    var container = $('msc-properties');
    if (!container) return;
    clear(container);

    PROPERTIES_SCHEMA.forEach(function (group) {
      var section = el('div', { className: 'msc-prop-group' });

      var chevron = el('span', { className: 'msc-chevron' }, '▼');
      var header = el('div', { className: 'msc-prop-group-header', onClick: function () {
        body.classList.toggle('collapsed');
        chevron.classList.toggle('collapsed');
      }}, [
        el('h4', null, group.group),
        chevron
      ]);

      var body = el('div', { className: 'msc-prop-group-body' });

      group.props.forEach(function (prop) {
        var row = el('div', { className: 'msc-prop-row' });

        var labelEl = el('label', null, [
          prop.label + ' ',
          el('span', { className: 'msc-prop-key' }, prop.key)
        ]);

        var input;
        if (prop.type === 'bool') {
          var toggleLabel = el('label', { className: 'msc-toggle' });
          var cb = el('input', { type: 'checkbox' });
          cb.checked = !!state.properties[prop.key];
          cb.addEventListener('change', function () { state.properties[prop.key] = cb.checked; });
          var track = el('span', { className: 'msc-toggle-track' }, [
            el('span', { className: 'msc-toggle-thumb' })
          ]);
          toggleLabel.appendChild(cb);
          toggleLabel.appendChild(track);
          toggleLabel.appendChild(el('span', { className: 'msc-toggle-label' }, cb.checked ? 'true' : 'false'));
          cb.addEventListener('change', function () {
            toggleLabel.querySelector('.msc-toggle-label').textContent = cb.checked ? 'true' : 'false';
          });
          input = toggleLabel;
        } else if (prop.type === 'select') {
          input = el('select');
          (prop.options || []).forEach(function (o) {
            var opt = el('option', { value: o.value }, o.label);
            if (String(state.properties[prop.key]) === String(o.value)) opt.selected = true;
            input.appendChild(opt);
          });
          input.addEventListener('change', function () { state.properties[prop.key] = input.value; });
        } else if (prop.type === 'number') {
          input = el('input', { type: 'number', value: String(state.properties[prop.key]) });
          if (prop.min !== undefined) input.min = prop.min;
          if (prop.max !== undefined) input.max = prop.max;
          input.addEventListener('change', function () {
            state.properties[prop.key] = input.value === '' ? prop.def : Number(input.value);
          });
        } else {
          input = el('input', { type: prop.type || 'text', value: String(state.properties[prop.key] || '') });
          if (prop.type === 'password') input.setAttribute('autocomplete', 'new-password');
          input.addEventListener('input', function () { state.properties[prop.key] = input.value; });
        }

        var descEl = el('div', { className: 'msc-prop-desc' }, prop.desc);

        row.appendChild(labelEl);
        row.appendChild(input);
        row.appendChild(descEl);
        body.appendChild(row);
      });

      section.appendChild(header);
      section.appendChild(body);
      container.appendChild(section);
    });
  }

  /* ── Tab: Players ── */
  function renderPlayersTab() {
    renderPlayerList('msc-ops-list', state.ops, 'ops');
    renderPlayerList('msc-whitelist-list', state.whitelist, 'whitelist');
    renderPlayerList('msc-banned-list', state.bannedPlayers, 'banned');
    renderPlayerList('msc-banned-ips-list', state.bannedIps, 'bannedIps');
  }

  function renderPlayerList(containerId, list, type) {
    var container = $(containerId);
    if (!container) return;
    clear(container);
    if (list.length === 0) {
      container.appendChild(el('p', { className: 'msc-empty' }, 'None added yet.'));
      return;
    }
    list.forEach(function (item, i) {
      var row = el('div', { className: 'msc-player-row' });
      var name = typeof item === 'string' ? item : (item.name || item.ip || item);
      row.appendChild(el('span', null, name));
      if (type === 'ops' && item.level !== undefined) {
        row.appendChild(el('span', { className: 'msc-player-level' }, 'Level ' + item.level));
      }
      var removeBtn = el('button', {
        className: 'msc-icon-btn',
        type: 'button',
        title: 'Remove',
        onClick: function () {
          list.splice(i, 1);
          renderPlayerList(containerId, list, type);
        }
      }, '✕');
      row.appendChild(removeBtn);
      container.appendChild(row);
    });
  }

  function addOp() {
    var nameInput = $('msc-op-name');
    var levelInput = $('msc-op-level');
    if (!nameInput) return;
    var name = nameInput.value.trim();
    if (!name) { showStatus('Enter a player name', 'err'); return; }
    if (state.ops.some(function (o) { return o.name === name; })) {
      showStatus('Player already in ops', 'err'); return;
    }
    state.ops.push({ name: name, level: parseInt(levelInput.value) || 4 });
    nameInput.value = '';
    renderPlayersTab();
    showStatus('Added ' + name + ' to ops', 'ok');
  }

  function addWhitelist() {
    var input = $('msc-whitelist-name');
    if (!input) return;
    var name = input.value.trim();
    if (!name) { showStatus('Enter a player name', 'err'); return; }
    if (state.whitelist.indexOf(name) >= 0) { showStatus('Already whitelisted', 'err'); return; }
    state.whitelist.push(name);
    input.value = '';
    renderPlayersTab();
    showStatus('Added ' + name + ' to whitelist', 'ok');
  }

  function addBannedPlayer() {
    var input = $('msc-ban-name');
    if (!input) return;
    var name = input.value.trim();
    if (!name) { showStatus('Enter a player name', 'err'); return; }
    if (state.bannedPlayers.indexOf(name) >= 0) { showStatus('Already banned', 'err'); return; }
    state.bannedPlayers.push(name);
    input.value = '';
    renderPlayersTab();
    showStatus('Banned ' + name, 'ok');
  }

  function addBannedIp() {
    var input = $('msc-ban-ip');
    if (!input) return;
    var ip = input.value.trim();
    if (!ip) { showStatus('Enter an IP address', 'err'); return; }
    if (state.bannedIps.indexOf(ip) >= 0) { showStatus('Already banned', 'err'); return; }
    state.bannedIps.push(ip);
    input.value = '';
    renderPlayersTab();
    showStatus('Banned IP ' + ip, 'ok');
  }

  /* ── Tab: Plugins / Mods (Addons) ── */
  function getAddonType() {
    var st = SERVER_TYPES.find(function (t) { return t.id === state.serverType; });
    return st ? st.category : 'vanilla';
  }

  function updateAddonLabel() {
    var label = $('msc-addon-type-label');
    var cat = getAddonType();
    if (label) label.textContent = cat === 'plugin' ? 'Plugins' : cat === 'mod' ? 'Mods' : 'Plugins/Mods';
    var vanillaMsg = $('msc-addon-vanilla-msg');
    if (vanillaMsg) vanillaMsg.hidden = cat !== 'vanilla';
    var addonContent = $('msc-addon-content');
    if (addonContent) addonContent.hidden = cat === 'vanilla';
  }

  var searchTimeout = null;
  function searchAddons() {
    var query = $('msc-addon-search');
    if (!query) return;
    var q = query.value.trim();
    if (q.length < 2) { showStatus('Enter at least 2 characters', 'err'); return; }

    var cat = getAddonType();
    var facetType = cat === 'mod' ? 'mod' : 'plugin';
    var loaders = [];
    if (state.serverType === 'paper' || state.serverType === 'spigot' || state.serverType === 'purpur') {
      loaders = ['paper', 'spigot', 'bukkit'];
    } else if (state.serverType === 'fabric') {
      loaders = ['fabric'];
    } else if (state.serverType === 'forge') {
      loaders = ['forge'];
    } else if (state.serverType === 'neoforge') {
      loaders = ['neoforge'];
    }

    var facets = '[["project_type:' + facetType + '"]';
    if (loaders.length) {
      facets += ',[' + loaders.map(function (l) { return '"categories:' + l + '"'; }).join(',') + ']';
    }
    facets += ',["versions:' + state.mcVersion + '"]';
    facets += ']';

    var results = $('msc-search-results');
    if (results) { clear(results); results.appendChild(el('p', { className: 'msc-empty' }, 'Searching...')); }

    fetch(MODRINTH_API + '/search?query=' + encodeURIComponent(q) + '&facets=' + encodeURIComponent(facets) + '&limit=20')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!results) return;
        clear(results);
        if (!data.hits || data.hits.length === 0) {
          results.appendChild(el('p', { className: 'msc-empty' }, 'No results found. Try a different search term.'));
          return;
        }
        data.hits.forEach(function (hit) {
          var isAdded = state.addons.some(function (a) { return a.slug === hit.slug; });
          var card = el('div', { className: 'msc-result-card' });

          if (hit.icon_url) {
            card.appendChild(el('img', { src: hit.icon_url, alt: hit.title, loading: 'lazy' }));
          } else {
            card.appendChild(el('div', { className: 'msc-result-placeholder' }, '📦'));
          }

          var info = el('div');
          info.appendChild(el('h4', null, hit.title));
          info.appendChild(el('p', null, hit.description || ''));
          info.appendChild(el('span', { className: 'msc-result-meta' },
            (hit.downloads ? numberFormat(hit.downloads) + ' downloads' : '') +
            (hit.follows ? ' • ' + numberFormat(hit.follows) + ' followers' : '')
          ));
          card.appendChild(info);

          var addBtn = el('button', {
            className: 'btn ' + (isAdded ? 'btn-secondary' : 'btn-primary'),
            type: 'button',
            disabled: isAdded ? 'true' : undefined,
            onClick: function () {
              if (!isAdded) {
                state.addons.push({
                  slug: hit.slug,
                  title: hit.title,
                  icon_url: hit.icon_url || '',
                  project_id: hit.project_id,
                  description: hit.description || '',
                  url: 'https://modrinth.com/' + (facetType === 'mod' ? 'mod' : 'plugin') + '/' + hit.slug
                });
                renderAddonList();
                showStatus('Added ' + hit.title, 'ok');
                addBtn.textContent = 'Added';
                addBtn.className = 'btn btn-secondary';
                addBtn.disabled = true;
              }
            }
          }, isAdded ? 'Added' : 'Add');
          card.appendChild(addBtn);

          results.appendChild(card);
        });
      })
      .catch(function (err) {
        if (results) { clear(results); results.appendChild(el('p', { className: 'msc-empty' }, 'Search failed: ' + err.message)); }
      });
  }

  function renderAddonList() {
    var container = $('msc-addon-list');
    var count = $('msc-addon-count');
    if (!container) return;
    clear(container);
    if (count) {
      var cat = getAddonType();
      var label = cat === 'mod' ? 'mods' : 'plugins';
      count.textContent = state.addons.length + ' ' + label;
    }
    if (state.addons.length === 0) {
      container.appendChild(el('p', { className: 'msc-empty' }, 'No addons added yet. Search above to find and add some.'));
      return;
    }
    state.addons.forEach(function (addon, i) {
      var row = el('div', { className: 'msc-addon-row' });
      if (addon.icon_url) {
        row.appendChild(el('img', { src: addon.icon_url, alt: addon.title, loading: 'lazy' }));
      }
      var info = el('div', { className: 'msc-addon-info' });
      info.appendChild(el('h4', null, addon.title));
      info.appendChild(el('span', null, addon.description || addon.slug));
      row.appendChild(info);
      row.appendChild(el('button', {
        className: 'msc-icon-btn',
        type: 'button',
        title: 'Remove',
        onClick: function () {
          state.addons.splice(i, 1);
          renderAddonList();
          showStatus('Removed ' + addon.title, 'ok');
        }
      }, '✕'));
      container.appendChild(row);
    });
  }

  function renderAddonsTab() {
    updateAddonLabel();
    renderAddonList();
  }

  /* ── Tab: JVM Config ── */
  function renderJvmTab() {
    var minRam = $('msc-min-ram');
    var maxRam = $('msc-max-ram');
    var customFlags = $('msc-custom-flags');
    var autoRestart = $('msc-auto-restart');
    var restartDelay = $('msc-restart-delay');

    if (minRam) minRam.value = state.jvm.minRam;
    if (maxRam) maxRam.value = state.jvm.maxRam;
    if (customFlags) customFlags.value = state.jvm.customFlags;
    if (autoRestart) autoRestart.checked = state.jvm.autoRestart;
    if (restartDelay) restartDelay.value = state.jvm.restartDelay;

    /* Presets */
    var presetGrid = $('msc-preset-grid');
    if (presetGrid) {
      clear(presetGrid);
      JVM_PRESETS.forEach(function (preset) {
        var btn = el('button', {
          className: 'msc-preset-btn' + (state.jvm.preset === preset.id ? ' active' : ''),
          type: 'button',
          onClick: function () {
            state.jvm.preset = preset.id;
            renderJvmTab();
          }
        }, [
          el('strong', null, preset.name),
          el('span', null, preset.desc)
        ]);
        presetGrid.appendChild(btn);
      });
    }

    /* Preview generated flags */
    var preview = $('msc-flags-preview');
    if (preview) {
      var preset = JVM_PRESETS.find(function (p) { return p.id === state.jvm.preset; }) || JVM_PRESETS[0];
      var flags = preset.flags(state.jvm.minRam, state.jvm.maxRam);
      if (state.jvm.customFlags) flags += ' ' + state.jvm.customFlags;
      preview.textContent = flags;
    }
  }

  /* ── Tab: Review & Export ── */
  function validate() {
    var issues = [];
    /* Warnings */
    if (!state.properties['online-mode'] && !state.properties['white-list']) {
      issues.push({ level: 'warning', msg: 'Online mode is OFF without a whitelist — anyone can join as any player!' });
    }
    if (state.properties['enable-rcon'] && !state.properties['rcon.password']) {
      issues.push({ level: 'warning', msg: 'RCON is enabled but no password is set — this is a security risk.' });
    }
    if (state.properties['view-distance'] > 16) {
      issues.push({ level: 'warning', msg: 'View distance > 16 can cause heavy CPU/RAM usage.' });
    }
    if (state.jvm.maxRam === '1G' || state.jvm.maxRam === '512M') {
      issues.push({ level: 'warning', msg: 'Max RAM is low (' + state.jvm.maxRam + '). 2-4G recommended for most servers.' });
    }
    if (state.serverType === 'vanilla' && state.addons.length > 0) {
      issues.push({ level: 'warning', msg: 'You have addons but selected Vanilla — addons require Paper/Forge/Fabric etc.' });
    }

    /* Info */
    issues.push({ level: 'info', msg: 'Server type: ' + state.serverType.charAt(0).toUpperCase() + state.serverType.slice(1) });
    issues.push({ level: 'info', msg: 'Minecraft version: ' + state.mcVersion });
    issues.push({ level: 'info', msg: 'Recommended Java: ' + recommendedJava(state.mcVersion) });
    if (state.addons.length > 0) {
      issues.push({ level: 'info', msg: state.addons.length + ' addon(s) will need to be downloaded manually or via the addon URLs list.' });
    }

    /* Success */
    if (issues.filter(function (i) { return i.level === 'warning'; }).length === 0) {
      issues.unshift({ level: 'success', msg: 'No issues found! Your server configuration looks good.' });
    }

    return issues;
  }

  function renderReviewTab() {
    /* Diagnostics */
    var diag = $('msc-diagnostics');
    if (diag) {
      clear(diag);
      var issues = validate();
      var list = el('ul', { className: 'msc-diagnostic-list' });
      issues.forEach(function (issue) {
        var iconMap = { error: '✕', warning: '⚠', success: '✓', info: 'ℹ' };
        var li = el('li');
        li.appendChild(el('span', { className: 'msc-diag-icon ' + issue.level }, iconMap[issue.level] || '•'));
        li.appendChild(document.createTextNode(issue.msg));
        list.appendChild(li);
      });
      diag.appendChild(list);
    }

    /* server.properties preview */
    var propsPreview = $('msc-props-preview');
    if (propsPreview) {
      propsPreview.textContent = generateServerProperties();
    }

    /* File tree preview */
    var fileTree = $('msc-file-tree');
    if (fileTree) {
      clear(fileTree);
      var files = getExportFileList();
      files.forEach(function (f) {
        var isDir = f.name.slice(-1) === '/';
        var line = el('div', { className: isDir ? 'dir' : 'file' });
        var indent = (f.name.match(/\//g) || []).length - (isDir ? 1 : 0);
        line.textContent = '  '.repeat(indent) + (isDir ? '📁 ' : '📄 ') + f.name;
        fileTree.appendChild(line);
      });
    }
  }

  /* ── File Generation ── */
  function generateServerProperties() {
    var lines = [
      '#Minecraft server properties',
      '#Generated by ToolsVault Minecraft Server Creator',
      '#' + new Date().toISOString(),
      ''
    ];
    PROPERTIES_SCHEMA.forEach(function (group) {
      lines.push('# ' + group.group);
      group.props.forEach(function (prop) {
        var val = state.properties[prop.key];
        if (typeof val === 'boolean') val = val ? 'true' : 'false';
        lines.push(prop.key + '=' + val);
      });
      lines.push('');
    });
    return lines.join('\n');
  }

  function generateEula() {
    return [
      '#By changing the setting below to TRUE you are indicating your agreement to the Minecraft EULA',
      '#Read the EULA here: https://aka.ms/MinecraftEULA',
      '#Generated by ToolsVault Minecraft Server Creator',
      '#' + new Date().toISOString(),
      'eula=false'
    ].join('\n');
  }

  function generateOpsJson() {
    if (state.ops.length === 0) return '[]';
    var ops = state.ops.map(function (op) {
      return {
        uuid: '00000000-0000-0000-0000-000000000000',
        name: op.name,
        level: op.level || 4,
        bypassesPlayerLimit: false
      };
    });
    return JSON.stringify(ops, null, 2);
  }

  function generateWhitelistJson() {
    if (state.whitelist.length === 0) return '[]';
    var wl = state.whitelist.map(function (name) {
      return { uuid: '00000000-0000-0000-0000-000000000000', name: name };
    });
    return JSON.stringify(wl, null, 2);
  }

  function generateBannedPlayersJson() {
    if (state.bannedPlayers.length === 0) return '[]';
    var bp = state.bannedPlayers.map(function (name) {
      return {
        uuid: '00000000-0000-0000-0000-000000000000',
        name: name,
        created: new Date().toISOString(),
        source: 'Server',
        expires: 'forever',
        reason: 'Banned by server creator'
      };
    });
    return JSON.stringify(bp, null, 2);
  }

  function generateBannedIpsJson() {
    if (state.bannedIps.length === 0) return '[]';
    var bi = state.bannedIps.map(function (ip) {
      return {
        ip: ip,
        created: new Date().toISOString(),
        source: 'Server',
        expires: 'forever',
        reason: 'Banned by server creator'
      };
    });
    return JSON.stringify(bi, null, 2);
  }

  /* ── Download URL builders ── */
  function getDownloadUrl() {
    var v = state.mcVersion;
    switch (state.serverType) {
      case 'vanilla':
        // Mojang's version manifest → we encode a script that fetches it
        return { type: 'vanilla_manifest', version: v };
      case 'paper':
        return { type: 'paper_api', version: v, url: 'https://api.papermc.io/v2/projects/paper/versions/' + v };
      case 'spigot':
        return { type: 'spigot_buildtools', version: v };
      case 'purpur':
        return { type: 'purpur_api', version: v, url: 'https://api.purpurmc.org/v2/purpur/' + v };
      case 'fabric':
        return { type: 'fabric_installer', version: v };
      case 'forge':
        return { type: 'forge_installer', version: v };
      case 'neoforge':
        return { type: 'neoforge_installer', version: v };
      default:
        return { type: 'vanilla_manifest', version: v };
    }
  }

  /* ── Script generators ── */
  function generateDownloadBat() {
    var dl = getDownloadUrl();
    var lines = [
      '@echo off',
      'title Minecraft Server Downloader',
      'echo ============================================',
      'echo  Minecraft Server Downloader',
      'echo  Server Type: ' + state.serverType.charAt(0).toUpperCase() + state.serverType.slice(1),
      'echo  MC Version:  ' + state.mcVersion,
      'echo ============================================',
      'echo.',
      ''
    ];

    switch (dl.type) {
      case 'vanilla_manifest':
        lines.push(
          'echo Downloading Vanilla server ' + dl.version + '...',
          'echo Fetching version manifest from Mojang...',
          '',
          'set "MANIFEST_URL=https://launchermeta.mojang.com/mc/game/version_manifest_v2.json"',
          'set "VERSION=' + dl.version + '"',
          '',
          'REM Download the version manifest',
          'powershell -Command "try { $manifest = Invoke-WebRequest -Uri \'%MANIFEST_URL%\' -UseBasicParsing | ConvertFrom-Json; $ver = $manifest.versions | Where-Object { $_.id -eq \'%VERSION%\' }; if ($ver) { $verData = Invoke-WebRequest -Uri $ver.url -UseBasicParsing | ConvertFrom-Json; $serverUrl = $verData.downloads.server.url; Write-Host \'Downloading server JAR...\'; Invoke-WebRequest -Uri $serverUrl -OutFile \'server.jar\' -UseBasicParsing; Write-Host \'Download complete!\' } else { Write-Host \'ERROR: Version %VERSION% not found!\'; exit 1 } } catch { Write-Host \'ERROR: Download failed -\' $_.Exception.Message; exit 1 }"',
          ''
        );
        break;
      case 'paper_api':
        lines.push(
          'echo Downloading Paper server ' + dl.version + '...',
          '',
          'REM Get the latest build for this version from Paper API',
          'powershell -Command "try { $builds = Invoke-WebRequest -Uri \'' + dl.url + '/builds\' -UseBasicParsing | ConvertFrom-Json; $latest = $builds.builds[-1]; $build = $latest.build; $dlName = $latest.downloads.application.name; $dlUrl = \'' + dl.url + '/builds/\' + $build + \'/downloads/\' + $dlName; Write-Host \'Downloading Paper build\' $build \'...\'; Invoke-WebRequest -Uri $dlUrl -OutFile \'server.jar\' -UseBasicParsing; Write-Host \'Download complete!\' } catch { Write-Host \'ERROR: Download failed -\' $_.Exception.Message; exit 1 }"',
          ''
        );
        break;
      case 'purpur_api':
        lines.push(
          'echo Downloading Purpur server ' + dl.version + '...',
          '',
          'powershell -Command "try { Invoke-WebRequest -Uri \'https://api.purpurmc.org/v2/purpur/' + dl.version + '/latest/download\' -OutFile \'server.jar\' -UseBasicParsing; Write-Host \'Download complete!\' } catch { Write-Host \'ERROR: Download failed -\' $_.Exception.Message; exit 1 }"',
          ''
        );
        break;
      case 'fabric_installer':
        lines.push(
          'echo Downloading Fabric server ' + dl.version + '...',
          '',
          'REM Download Fabric server launcher JAR',
          'powershell -Command "try { $meta = Invoke-WebRequest -Uri \'https://meta.fabricmc.net/v2/versions/loader/' + dl.version + '\' -UseBasicParsing | ConvertFrom-Json; $loaderVer = $meta[0].loader.version; $url = \'https://meta.fabricmc.net/v2/versions/loader/' + dl.version + '/\' + $loaderVer + \'/1.0.1/server/jar\'; Write-Host \'Downloading Fabric loader\' $loaderVer \'...\'; Invoke-WebRequest -Uri $url -OutFile \'server.jar\' -UseBasicParsing; Write-Host \'Download complete!\' } catch { Write-Host \'ERROR: Download failed -\' $_.Exception.Message; exit 1 }"',
          ''
        );
        break;
      case 'forge_installer':
        lines.push(
          'echo ============================================',
          'echo  Forge requires manual installation:',
          'echo ============================================',
          'echo.',
          'echo  1. Go to: https://files.minecraftforge.net/net/minecraftforge/forge/index_' + dl.version + '.html',
          'echo  2. Download the INSTALLER (not the universal)',
          'echo  3. Place the installer .jar in this folder',
          'echo  4. Run: java -jar forge-*-installer.jar --installServer',
          'echo  5. Then run start.bat to launch your server',
          'echo.',
          'echo Opening the Forge download page...',
          'start https://files.minecraftforge.net/net/minecraftforge/forge/index_' + dl.version + '.html',
          ''
        );
        break;
      case 'neoforge_installer':
        lines.push(
          'echo ============================================',
          'echo  NeoForge requires manual installation:',
          'echo ============================================',
          'echo.',
          'echo  1. Go to: https://neoforged.net/',
          'echo  2. Download the installer for MC ' + dl.version,
          'echo  3. Place the installer .jar in this folder',
          'echo  4. Run: java -jar neoforge-*-installer.jar --installServer',
          'echo  5. Then run start.bat to launch your server',
          'echo.',
          'echo Opening the NeoForge download page...',
          'start https://neoforged.net/',
          ''
        );
        break;
      case 'spigot_buildtools':
        lines.push(
          'echo ============================================',
          'echo  Spigot requires BuildTools:',
          'echo ============================================',
          'echo.',
          'echo Downloading BuildTools...',
          'powershell -Command "try { Invoke-WebRequest -Uri \'https://hub.spigotmc.org/jenkins/job/BuildTools/lastSuccessfulBuild/artifact/target/BuildTools.jar\' -OutFile \'BuildTools.jar\' -UseBasicParsing; Write-Host \'BuildTools downloaded!\' } catch { Write-Host \'ERROR: Download failed -\' $_.Exception.Message; exit 1 }"',
          'echo.',
          'echo Running BuildTools (this may take 10-15 minutes)...',
          'java -jar BuildTools.jar --rev ' + dl.version,
          'if exist spigot-' + dl.version + '.jar (',
          '  copy spigot-' + dl.version + '.jar server.jar',
          '  echo Build complete! server.jar is ready.',
          ') else (',
          '  echo ERROR: BuildTools did not produce the expected JAR.',
          '  echo Look for a spigot-*.jar file in this directory.',
          ')',
          ''
        );
        break;
    }

    lines.push(
      'if exist server.jar (',
      '  echo.',
      '  echo ============================================',
      '  echo  server.jar is ready!',
      '  echo  Run start.bat to launch your server.',
      '  echo ============================================',
      ') else (',
      '  echo.',
      '  echo  server.jar was not found.',
      '  echo  Please check the output above for errors.',
      ')',
      'echo.',
      'pause'
    );
    return lines.join('\r\n');
  }

  function generateDownloadSh() {
    var dl = getDownloadUrl();
    var lines = [
      '#!/usr/bin/env bash',
      '# Minecraft Server Downloader',
      '# Server Type: ' + state.serverType.charAt(0).toUpperCase() + state.serverType.slice(1),
      '# MC Version:  ' + state.mcVersion,
      'set -e',
      '',
      'download() {',
      '  if command -v curl &>/dev/null; then',
      '    curl -fSL -o "$2" "$1"',
      '  elif command -v wget &>/dev/null; then',
      '    wget -q -O "$2" "$1"',
      '  else',
      '    echo "ERROR: Neither curl nor wget found. Please install one."',
      '    exit 1',
      '  fi',
      '}',
      '',
      'fetch_json() {',
      '  if command -v curl &>/dev/null; then',
      '    curl -fsSL "$1"',
      '  elif command -v wget &>/dev/null; then',
      '    wget -q -O- "$1"',
      '  fi',
      '}',
      ''
    ];

    switch (dl.type) {
      case 'vanilla_manifest':
        lines.push(
          'echo "Downloading Vanilla server ' + dl.version + '..."',
          'VERSION="' + dl.version + '"',
          'MANIFEST_URL="https://launchermeta.mojang.com/mc/game/version_manifest_v2.json"',
          '',
          '# Parse version manifest to get server download URL',
          'VERSION_URL=$(fetch_json "$MANIFEST_URL" | grep -o \'"id": *"\'"$VERSION"\'.*"url": *"[^"]*"\' | grep -o \'"url": *"[^"]*"\' | head -1 | grep -o \'https://[^"]*\')',
          '',
          'if [ -z "$VERSION_URL" ]; then',
          '  # Fallback: try python/python3 for JSON parsing',
          '  if command -v python3 &>/dev/null; then',
          '    VERSION_URL=$(fetch_json "$MANIFEST_URL" | python3 -c "import sys,json; m=json.load(sys.stdin); print(next(v[\'url\'] for v in m[\'versions\'] if v[\'id\']==\'$VERSION\'))")',
          '  fi',
          'fi',
          '',
          'if [ -z "$VERSION_URL" ]; then',
          '  echo "ERROR: Could not find version ' + dl.version + ' in manifest"',
          '  exit 1',
          'fi',
          '',
          'SERVER_URL=$(fetch_json "$VERSION_URL" | grep -o \'"server".*"url": *"[^"]*"\' | grep -o \'https://[^"]*\' | head -1)',
          '',
          'if [ -z "$SERVER_URL" ]; then',
          '  if command -v python3 &>/dev/null; then',
          '    SERVER_URL=$(fetch_json "$VERSION_URL" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[\'downloads\'][\'server\'][\'url\'])")',
          '  fi',
          'fi',
          '',
          'if [ -z "$SERVER_URL" ]; then',
          '  echo "ERROR: Could not extract server download URL"',
          '  exit 1',
          'fi',
          '',
          'echo "Downloading server.jar..."',
          'download "$SERVER_URL" server.jar',
          'echo "Download complete!"',
          ''
        );
        break;
      case 'paper_api':
        lines.push(
          'echo "Downloading Paper server ' + dl.version + '..."',
          'BUILDS_JSON=$(fetch_json "' + dl.url + '/builds")',
          '',
          'if command -v python3 &>/dev/null; then',
          '  BUILD=$(echo "$BUILDS_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); b=d[\'builds\'][-1]; print(b[\'build\'])")',
          '  DL_NAME=$(echo "$BUILDS_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); b=d[\'builds\'][-1]; print(b[\'downloads\'][\'application\'][\'name\'])")',
          'else',
          '  BUILD=$(echo "$BUILDS_JSON" | grep -o \'"build":[0-9]*\' | tail -1 | grep -o \'[0-9]*\')',
          '  DL_NAME="paper-' + dl.version + '-${BUILD}.jar"',
          'fi',
          '',
          'DL_URL="' + dl.url + '/builds/${BUILD}/downloads/${DL_NAME}"',
          'echo "Downloading Paper build ${BUILD}..."',
          'download "$DL_URL" server.jar',
          'echo "Download complete!"',
          ''
        );
        break;
      case 'purpur_api':
        lines.push(
          'echo "Downloading Purpur server ' + dl.version + '..."',
          'download "https://api.purpurmc.org/v2/purpur/' + dl.version + '/latest/download" server.jar',
          'echo "Download complete!"',
          ''
        );
        break;
      case 'fabric_installer':
        lines.push(
          'echo "Downloading Fabric server ' + dl.version + '..."',
          '',
          'if command -v python3 &>/dev/null; then',
          '  LOADER_VER=$(fetch_json "https://meta.fabricmc.net/v2/versions/loader/' + dl.version + '" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0][\'loader\'][\'version\'])")',
          'else',
          '  LOADER_VER=$(fetch_json "https://meta.fabricmc.net/v2/versions/loader/' + dl.version + '" | grep -o \'"version":"[^"]*"\' | head -1 | cut -d\'"\' -f4)',
          'fi',
          '',
          'DL_URL="https://meta.fabricmc.net/v2/versions/loader/' + dl.version + '/${LOADER_VER}/1.0.1/server/jar"',
          'echo "Downloading Fabric loader ${LOADER_VER}..."',
          'download "$DL_URL" server.jar',
          'echo "Download complete!"',
          ''
        );
        break;
      case 'forge_installer':
        lines.push(
          'echo "============================================"',
          'echo " Forge requires manual installation:"',
          'echo "============================================"',
          'echo ""',
          'echo " 1. Go to: https://files.minecraftforge.net/net/minecraftforge/forge/index_' + dl.version + '.html"',
          'echo " 2. Download the INSTALLER"',
          'echo " 3. Place the installer .jar in this folder"',
          'echo " 4. Run: java -jar forge-*-installer.jar --installServer"',
          'echo " 5. Then run ./start.sh to launch your server"',
          ''
        );
        break;
      case 'neoforge_installer':
        lines.push(
          'echo "============================================"',
          'echo " NeoForge requires manual installation:"',
          'echo "============================================"',
          'echo ""',
          'echo " 1. Go to: https://neoforged.net/"',
          'echo " 2. Download the installer for MC ' + dl.version + '"',
          'echo " 3. Place the installer .jar in this folder"',
          'echo " 4. Run: java -jar neoforge-*-installer.jar --installServer"',
          'echo " 5. Then run ./start.sh to launch your server"',
          ''
        );
        break;
      case 'spigot_buildtools':
        lines.push(
          'echo "Downloading Spigot BuildTools..."',
          'download "https://hub.spigotmc.org/jenkins/job/BuildTools/lastSuccessfulBuild/artifact/target/BuildTools.jar" BuildTools.jar',
          'echo "Running BuildTools (this may take 10-15 minutes)..."',
          'java -jar BuildTools.jar --rev ' + dl.version,
          'if [ -f "spigot-' + dl.version + '.jar" ]; then',
          '  cp "spigot-' + dl.version + '.jar" server.jar',
          '  echo "Build complete!"',
          'else',
          '  echo "ERROR: BuildTools did not produce the expected JAR."',
          'fi',
          ''
        );
        break;
    }

    lines.push(
      'if [ -f "server.jar" ]; then',
      '  echo ""',
      '  echo "============================================"',
      '  echo " server.jar is ready!"',
      '  echo " Run ./start.sh to launch your server."',
      '  echo "============================================"',
      'else',
      '  echo ""',
      '  echo " server.jar was not found."',
      '  echo " Please check the output above for errors."',
      'fi'
    );
    return lines.join('\n');
  }

  function generateStartBat() {
    var preset = JVM_PRESETS.find(function (p) { return p.id === state.jvm.preset; }) || JVM_PRESETS[0];
    var flags = preset.flags(state.jvm.minRam, state.jvm.maxRam);
    if (state.jvm.customFlags) flags += ' ' + state.jvm.customFlags;

    var forgeType = state.serverType === 'forge' || state.serverType === 'neoforge';
    var jarName = forgeType ? 'forge-server.jar' : 'server.jar';
    // For Forge/NeoForge, there may be a run.bat generated by the installer
    var forgeRunCheck = '';
    if (forgeType) {
      forgeRunCheck = [
        'REM Forge/NeoForge: check if the installer generated run scripts',
        'if exist run.bat (',
        '  echo Found Forge/NeoForge run.bat, using that instead...',
        '  call run.bat',
        '  goto :end',
        ')',
        'REM Also check for @user_jvm_args.txt pattern',
        'if exist @user_jvm_args.txt (',
        '  echo Found @user_jvm_args.txt — this server was installed with a modern Forge/NeoForge installer.',
        '  echo Use the generated run.bat instead of this script.',
        '  pause',
        '  goto :end',
        ')',
        ''
      ].join('\r\n');
    }

    var lines = [
      '@echo off',
      'title ' + state.properties.motd.replace(/§./g, '').substring(0, 60) || 'Minecraft Server',
      'echo ============================================',
      'echo  ' + (state.properties.motd.replace(/§./g, '') || 'Minecraft Server'),
      'echo  Type: ' + state.serverType.charAt(0).toUpperCase() + state.serverType.slice(1) + ' ' + state.mcVersion,
      'echo ============================================',
      'echo.',
      ''
    ];

    // EULA check
    lines.push(
      'REM Check EULA',
      'if not exist eula.txt (',
      '  echo eula=false> eula.txt',
      ')',
      'findstr /C:"eula=true" eula.txt >nul 2>&1',
      'if errorlevel 1 (',
      '  echo ============================================',
      '  echo  You must accept the Minecraft EULA to run',
      '  echo  this server.',
      '  echo.',
      '  echo  Read the EULA: https://aka.ms/MinecraftEULA',
      '  echo.',
      '  echo  Open eula.txt in this folder and change',
      '  echo  eula=false to eula=true',
      '  echo ============================================',
      '  echo.',
      '  pause',
      '  exit /b 1',
      ')',
      ''
    );

    // Server JAR check
    lines.push(
      'REM Check for server JAR',
      'if not exist ' + jarName + ' (',
      '  echo Server JAR not found! Running download script...',
      '  call download-server.bat',
      '  if not exist ' + jarName + ' (',
      '    echo.',
      '    echo Failed to download server JAR. Please run download-server.bat manually.',
      '    pause',
      '    exit /b 1',
      '  )',
      ')',
      ''
    );

    if (forgeRunCheck) lines.push(forgeRunCheck);

    // Find Java
    lines.push(
      'REM Find Java',
      'set "JAVA_CMD="',
      '',
      'REM Check JAVA_HOME first',
      'if defined JAVA_HOME (',
      '  if exist "%JAVA_HOME%\\bin\\java.exe" (',
      '    set "JAVA_CMD=%JAVA_HOME%\\bin\\java.exe"',
      '    goto :found_java',
      '  )',
      ')',
      '',
      'REM Check PATH',
      'where java >nul 2>&1',
      'if not errorlevel 1 (',
      '  set "JAVA_CMD=java"',
      '  goto :found_java',
      ')',
      '',
      'REM Search common install locations',
      'for /d %%G in ("%ProgramFiles%\\Java\\*") do (',
      '  if exist "%%G\\bin\\java.exe" (',
      '    set "JAVA_CMD=%%G\\bin\\java.exe"',
      '    goto :found_java',
      '  )',
      ')',
      'for /d %%G in ("%ProgramFiles%\\Eclipse Adoptium\\*") do (',
      '  if exist "%%G\\bin\\java.exe" (',
      '    set "JAVA_CMD=%%G\\bin\\java.exe"',
      '    goto :found_java',
      '  )',
      ')',
      'for /d %%G in ("%ProgramFiles%\\Microsoft\\*") do (',
      '  if exist "%%G\\bin\\java.exe" (',
      '    set "JAVA_CMD=%%G\\bin\\java.exe"',
      '    goto :found_java',
      '  )',
      ')',
      'for /d %%G in ("%ProgramFiles%\\Zulu\\*") do (',
      '  if exist "%%G\\bin\\java.exe" (',
      '    set "JAVA_CMD=%%G\\bin\\java.exe"',
      '    goto :found_java',
      '  )',
      ')',
      'for /d %%G in ("%ProgramFiles%\\AdoptOpenJDK\\*") do (',
      '  if exist "%%G\\bin\\java.exe" (',
      '    set "JAVA_CMD=%%G\\bin\\java.exe"',
      '    goto :found_java',
      '  )',
      ')',
      '',
      'echo ============================================',
      'echo  Java was not found on this system!',
      'echo.',
      'echo  Recommended: Java ' + recommendedJava(state.mcVersion),
      'echo.',
      'echo  Download from:',
      'echo    https://adoptium.net/',
      'echo    https://www.oracle.com/java/technologies/downloads/',
      'echo ============================================',
      'pause',
      'exit /b 1',
      '',
      ':found_java',
      'echo Using Java: %JAVA_CMD%',
      '"%JAVA_CMD%" -version 2>&1 | findstr /i "version"',
      'echo.',
      ''
    );

    // Launch server
    if (state.jvm.autoRestart) {
      lines.push(
        ':restart',
        'echo Starting server...',
        '"%JAVA_CMD%" ' + flags + ' -jar ' + jarName + ' nogui',
        'echo.',
        'echo Server stopped. Restarting in ' + state.jvm.restartDelay + ' seconds...',
        'echo Press Ctrl+C to cancel restart.',
        'timeout /t ' + state.jvm.restartDelay + ' /nobreak >nul 2>&1',
        'goto :restart',
        '',
        ':end'
      );
    } else {
      lines.push(
        'echo Starting server...',
        '"%JAVA_CMD%" ' + flags + ' -jar ' + jarName + ' nogui',
        'echo.',
        'echo Server stopped.',
        'pause',
        '',
        ':end'
      );
    }

    return lines.join('\r\n');
  }

  function generateStartSh() {
    var preset = JVM_PRESETS.find(function (p) { return p.id === state.jvm.preset; }) || JVM_PRESETS[0];
    var flags = preset.flags(state.jvm.minRam, state.jvm.maxRam);
    if (state.jvm.customFlags) flags += ' ' + state.jvm.customFlags;

    var forgeType = state.serverType === 'forge' || state.serverType === 'neoforge';
    var jarName = forgeType ? 'forge-server.jar' : 'server.jar';

    var lines = [
      '#!/usr/bin/env bash',
      '# ' + (state.properties.motd.replace(/§./g, '') || 'Minecraft Server'),
      '# Type: ' + state.serverType.charAt(0).toUpperCase() + state.serverType.slice(1) + ' ' + state.mcVersion,
      '',
      'cd "$(dirname "$0")"',
      ''
    ];

    // EULA check
    lines.push(
      '# Check EULA',
      'if [ ! -f "eula.txt" ]; then',
      '  echo "eula=false" > eula.txt',
      'fi',
      '',
      'if ! grep -q "eula=true" eula.txt 2>/dev/null; then',
      '  echo "============================================"',
      '  echo " You must accept the Minecraft EULA to run"',
      '  echo " this server."',
      '  echo ""',
      '  echo " Read the EULA: https://aka.ms/MinecraftEULA"',
      '  echo ""',
      '  echo " Open eula.txt in this folder and change"',
      '  echo " eula=false to eula=true"',
      '  echo "============================================"',
      '  exit 1',
      'fi',
      ''
    );

    // Server JAR check
    lines.push(
      '# Check for server JAR',
      'if [ ! -f "' + jarName + '" ]; then',
      '  echo "Server JAR not found! Running download script..."',
      '  chmod +x download-server.sh 2>/dev/null',
      '  bash download-server.sh',
      '  if [ ! -f "' + jarName + '" ]; then',
      '    echo "Failed to download server JAR."',
      '    exit 1',
      '  fi',
      'fi',
      ''
    );

    // Forge run script check
    if (forgeType) {
      lines.push(
        '# Forge/NeoForge: check for installer-generated scripts',
        'if [ -f "run.sh" ]; then',
        '  echo "Found Forge/NeoForge run.sh, using that instead..."',
        '  chmod +x run.sh',
        '  exec ./run.sh',
        'fi',
        ''
      );
    }

    // Find Java
    lines.push(
      '# Find Java',
      'JAVA_CMD=""',
      '',
      '# Check JAVA_HOME',
      'if [ -n "$JAVA_HOME" ] && [ -x "$JAVA_HOME/bin/java" ]; then',
      '  JAVA_CMD="$JAVA_HOME/bin/java"',
      '',
      '# Check PATH',
      'elif command -v java &>/dev/null; then',
      '  JAVA_CMD="java"',
      '',
      '# Search common locations',
      'else',
      '  for dir in /usr/lib/jvm/*/bin /usr/local/lib/jvm/*/bin /opt/java/*/bin /opt/jdk*/bin; do',
      '    if [ -x "$dir/java" ]; then',
      '      JAVA_CMD="$dir/java"',
      '      break',
      '    fi',
      '  done',
      'fi',
      '',
      'if [ -z "$JAVA_CMD" ]; then',
      '  echo "============================================"',
      '  echo " Java was not found on this system!"',
      '  echo ""',
      '  echo " Recommended: Java ' + recommendedJava(state.mcVersion) + '"',
      '  echo ""',
      '  echo " Install with:"',
      '  echo "   Ubuntu/Debian: sudo apt install openjdk-' + recommendedJava(state.mcVersion) + '-jre-headless"',
      '  echo "   Fedora/RHEL:   sudo dnf install java-' + recommendedJava(state.mcVersion) + '-openjdk-headless"',
      '  echo "   macOS:         brew install openjdk@' + recommendedJava(state.mcVersion) + '"',
      '  echo "   Or download from: https://adoptium.net/"',
      '  echo "============================================"',
      '  exit 1',
      'fi',
      '',
      'echo "Using Java: $JAVA_CMD"',
      '"$JAVA_CMD" -version 2>&1 | head -1',
      'echo ""',
      ''
    );

    // Launch
    if (state.jvm.autoRestart) {
      lines.push(
        '# Start with auto-restart',
        'while true; do',
        '  echo "Starting server..."',
        '  "$JAVA_CMD" ' + flags + ' -jar ' + jarName + ' nogui',
        '  echo ""',
        '  echo "Server stopped. Restarting in ' + state.jvm.restartDelay + ' seconds..."',
        '  echo "Press Ctrl+C to cancel restart."',
        '  sleep ' + state.jvm.restartDelay,
        'done'
      );
    } else {
      lines.push(
        'echo "Starting server..."',
        '"$JAVA_CMD" ' + flags + ' -jar ' + jarName + ' nogui',
        'echo ""',
        'echo "Server stopped."'
      );
    }

    return lines.join('\n');
  }

  function generateReadme() {
    var st = state.serverType.charAt(0).toUpperCase() + state.serverType.slice(1);
    var addonType = getAddonType();
    var lines = [
      '# ' + (state.properties.motd.replace(/§./g, '') || 'Minecraft Server'),
      '',
      'Server Type: **' + st + '**  ',
      'Minecraft Version: **' + state.mcVersion + '**  ',
      'Recommended Java: **Java ' + recommendedJava(state.mcVersion) + '**  ',
      '',
      '---',
      '',
      '## Quick Start',
      '',
      '### Windows',
      '1. Make sure you have Java ' + recommendedJava(state.mcVersion) + ' installed (download from https://adoptium.net/)',
      '2. Double-click `start.bat`',
      '3. The script will automatically download the server JAR on first run',
      '4. **On first launch:** Open `eula.txt` and change `eula=false` to `eula=true`',
      '5. Run `start.bat` again — your server is ready!',
      '',
      '### Linux / macOS',
      '1. Make sure you have Java ' + recommendedJava(state.mcVersion) + ' installed',
      '2. Open a terminal in this directory',
      '3. Run: `chmod +x start.sh download-server.sh && ./start.sh`',
      '4. **On first launch:** Edit `eula.txt` and change `eula=false` to `eula=true`',
      '5. Run `./start.sh` again — your server is ready!',
      '',
      '---',
      '',
      '## Files Included',
      '',
      '| File | Purpose |',
      '|------|---------|',
      '| `start.bat` | Windows start script (auto-finds Java, auto-restarts) |',
      '| `start.sh` | Linux/macOS start script |',
      '| `download-server.bat` | Downloads the server JAR (Windows) |',
      '| `download-server.sh` | Downloads the server JAR (Linux/macOS) |',
      '| `server.properties` | All server configuration |',
      '| `eula.txt` | Mojang EULA (you must accept this) |',
      '| `ops.json` | Server operators |',
      '| `whitelist.json` | Whitelisted players |',
      '| `banned-players.json` | Banned players |',
      '| `banned-ips.json` | Banned IP addresses |',
      ''
    ];

    if (state.addons.length > 0) {
      lines.push(
        '---',
        '',
        '## ' + (addonType === 'mod' ? 'Mods' : 'Plugins'),
        '',
        'The following ' + (addonType === 'mod' ? 'mods' : 'plugins') + ' need to be downloaded and placed in the `' + (addonType === 'mod' ? 'mods' : 'plugins') + '/` folder:',
        ''
      );
      state.addons.forEach(function (addon, i) {
        lines.push((i + 1) + '. **' + addon.title + '** — ' + (addon.url || 'https://modrinth.com'));
      });
      lines.push('');
    }

    lines.push(
      '---',
      '',
      '## JVM Configuration',
      '',
      '- Min RAM: `' + state.jvm.minRam + '`',
      '- Max RAM: `' + state.jvm.maxRam + '`',
      '- Preset: ' + (JVM_PRESETS.find(function (p) { return p.id === state.jvm.preset; }) || JVM_PRESETS[0]).name,
      '- Auto-restart: ' + (state.jvm.autoRestart ? 'Yes' : 'No'),
      '',
      '---',
      '',
      '*Generated by [ToolsVault Minecraft Server Creator](https://toolsvault.dev)*'
    );

    return lines.join('\n');
  }

  function generateAddonsList() {
    if (state.addons.length === 0) return null;
    var addonType = getAddonType();
    var lines = [
      '# ' + (addonType === 'mod' ? 'Mods' : 'Plugins') + ' List',
      '# Download these and place them in the ' + (addonType === 'mod' ? 'mods' : 'plugins') + '/ folder',
      '#',
      '# Generated by ToolsVault Minecraft Server Creator',
      ''
    ];
    state.addons.forEach(function (addon) {
      lines.push('# ' + addon.title);
      lines.push(addon.url || 'https://modrinth.com/' + (addonType === 'mod' ? 'mod' : 'plugin') + '/' + addon.slug);
      lines.push('');
    });
    return lines.join('\n');
  }

  /* ── Export / ZIP ── */
  function getExportFileList() {
    var addonType = getAddonType();
    var files = [
      { name: 'start.bat' },
      { name: 'start.sh' },
      { name: 'download-server.bat' },
      { name: 'download-server.sh' },
      { name: 'server.properties' },
      { name: 'eula.txt' },
      { name: 'ops.json' },
      { name: 'whitelist.json' },
      { name: 'banned-players.json' },
      { name: 'banned-ips.json' },
      { name: 'README.md' }
    ];
    if (state.addons.length > 0) {
      var folder = addonType === 'mod' ? 'mods/' : 'plugins/';
      files.push({ name: folder });
      files.push({ name: folder + 'DOWNLOAD_ADDONS.txt' });
    }
    if (state.serverIcon) {
      files.push({ name: 'server-icon.png' });
    }
    return files;
  }

  function exportZip() {
    if (typeof TpcZip === 'undefined') {
      showStatus('ZIP library not loaded. Please refresh and try again.', 'err');
      return;
    }

    var enc = new TextEncoder();
    var files = [];

    files.push({ name: 'start.bat', data: enc.encode(generateStartBat()) });
    files.push({ name: 'start.sh', data: enc.encode(generateStartSh()) });
    files.push({ name: 'download-server.bat', data: enc.encode(generateDownloadBat()) });
    files.push({ name: 'download-server.sh', data: enc.encode(generateDownloadSh()) });
    files.push({ name: 'server.properties', data: enc.encode(generateServerProperties()) });
    files.push({ name: 'eula.txt', data: enc.encode(generateEula()) });
    files.push({ name: 'ops.json', data: enc.encode(generateOpsJson()) });
    files.push({ name: 'whitelist.json', data: enc.encode(generateWhitelistJson()) });
    files.push({ name: 'banned-players.json', data: enc.encode(generateBannedPlayersJson()) });
    files.push({ name: 'banned-ips.json', data: enc.encode(generateBannedIpsJson()) });
    files.push({ name: 'README.md', data: enc.encode(generateReadme()) });

    var addonsList = generateAddonsList();
    if (addonsList) {
      var addonType = getAddonType();
      var folder = addonType === 'mod' ? 'mods/' : 'plugins/';
      files.push({ name: folder + 'DOWNLOAD_ADDONS.txt', data: enc.encode(addonsList) });
    }

    if (state.serverIcon) {
      try {
        var b64 = state.serverIcon.split(',')[1];
        var binary = atob(b64);
        var bytes = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        files.push({ name: 'server-icon.png', data: bytes });
      } catch (e) { /* skip icon if invalid */ }
    }

    var blob = TpcZip.createZip(files);
    var safeName = (state.properties.motd || 'minecraft-server').replace(/§./g, '').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = safeName + '-server.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showStatus('Server package downloaded! See README.md inside the zip for setup instructions.', 'ok');
  }

  /* ── Save / Load ── */
  function saveProject() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      showStatus('Project saved!', 'ok');
      var label = $('msc-saved-label');
      if (label) { label.textContent = 'Saved ' + new Date().toLocaleTimeString(); label.hidden = false; }
    } catch (e) {
      showStatus('Failed to save: ' + e.message, 'err');
    }
  }

  function loadProject() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      if (!data) { showStatus('No saved project found', 'err'); return; }
      var parsed = JSON.parse(data);
      // Merge with defaults so new properties are included
      var def = createDefaultState();
      Object.keys(def).forEach(function (k) {
        if (parsed[k] === undefined) parsed[k] = def[k];
      });
      if (parsed.properties) {
        Object.keys(def.properties).forEach(function (k) {
          if (parsed.properties[k] === undefined) parsed.properties[k] = def.properties[k];
        });
      }
      if (parsed.jvm) {
        Object.keys(def.jvm).forEach(function (k) {
          if (parsed.jvm[k] === undefined) parsed.jvm[k] = def.jvm[k];
        });
      }
      state = parsed;
      renderAll();
      showStatus('Project loaded!', 'ok');
    } catch (e) {
      showStatus('Failed to load: ' + e.message, 'err');
    }
  }

  function clearProject() {
    if (!confirm('Start a new project? This will reset all settings.')) return;
    state = createDefaultState();
    renderAll();
    showStatus('New project started', 'ok');
  }

  function exportProject() {
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'minecraft-server-project.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showStatus('Project exported!', 'ok');
  }

  function importProject(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var parsed = JSON.parse(e.target.result);
        var def = createDefaultState();
        Object.keys(def).forEach(function (k) {
          if (parsed[k] === undefined) parsed[k] = def[k];
        });
        state = parsed;
        renderAll();
        showStatus('Project imported!', 'ok');
      } catch (err) {
        showStatus('Invalid project file: ' + err.message, 'err');
      }
    };
    reader.readAsText(file);
  }

  /* ── Server icon upload ── */
  function handleIconUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
      showStatus('Please upload a PNG image (64×64 recommended)', 'err');
      return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
      // Resize to 64x64
      var img = new Image();
      img.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        var ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, 64, 64);
        state.serverIcon = canvas.toDataURL('image/png');
        var preview = $('msc-icon-preview');
        if (preview) { preview.src = state.serverIcon; preview.hidden = false; }
        showStatus('Server icon set!', 'ok');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /* ── Helpers ── */
  function numberFormat(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }

  /* ── Render all ── */
  function renderAll() {
    renderTypeTab();
    renderPropertiesTab();
    renderPlayersTab();
    renderAddonsTab();
    renderJvmTab();
    renderReviewTab();
  }

  /* ── Tab switching (use tools.js pattern) ── */
  function initMscTabs() {
    var root = document.querySelector('.tui.msc');
    if (!root) return;
    root.querySelectorAll('.tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tab = btn.dataset.tab;
        root.querySelectorAll('.tab').forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        root.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        var panel = $('tab-' + tab);
        if (panel) panel.classList.add('active');

        // Re-render active tab
        if (tab === 'type') renderTypeTab();
        else if (tab === 'properties') renderPropertiesTab();
        else if (tab === 'players') renderPlayersTab();
        else if (tab === 'addons') renderAddonsTab();
        else if (tab === 'jvm') renderJvmTab();
        else if (tab === 'review') renderReviewTab();
      });
    });
  }

  /* ── Init ── */
  function init() {
    initMscTabs();

    /* Savebar */
    var saveBtn = $('msc-save');
    var loadBtn = $('msc-load');
    var clearBtn = $('msc-clear');
    var exportProjBtn = $('msc-export-project');
    var importProjBtn = $('msc-import-project');
    var importFile = $('msc-import-project-file');

    if (saveBtn) saveBtn.addEventListener('click', saveProject);
    if (loadBtn) loadBtn.addEventListener('click', loadProject);
    if (clearBtn) clearBtn.addEventListener('click', clearProject);
    if (exportProjBtn) exportProjBtn.addEventListener('click', exportProject);
    if (importProjBtn) importProjBtn.addEventListener('click', function () { if (importFile) importFile.click(); });
    if (importFile) importFile.addEventListener('change', function (e) {
      if (e.target.files[0]) importProject(e.target.files[0]);
      e.target.value = '';
    });

    /* Version select */
    var vsel = $('msc-version');
    if (vsel) vsel.addEventListener('change', function () {
      state.mcVersion = vsel.value;
      var javaHint = $('msc-java-hint');
      if (javaHint) javaHint.textContent = 'Recommended: Java ' + recommendedJava(state.mcVersion);
    });

    /* Server name */
    var nameInput = $('msc-server-name');
    if (nameInput) {
      nameInput.value = state.serverName;
      nameInput.addEventListener('input', function () { state.serverName = nameInput.value; });
    }

    /* Players tab buttons */
    var addOpBtn = $('msc-add-op-btn');
    if (addOpBtn) addOpBtn.addEventListener('click', addOp);
    var addWlBtn = $('msc-add-whitelist-btn');
    if (addWlBtn) addWlBtn.addEventListener('click', addWhitelist);
    var addBanBtn = $('msc-add-ban-btn');
    if (addBanBtn) addBanBtn.addEventListener('click', addBannedPlayer);
    var addBanIpBtn = $('msc-add-ban-ip-btn');
    if (addBanIpBtn) addBanIpBtn.addEventListener('click', addBannedIp);

    /* Allow Enter key in player inputs */
    ['msc-op-name', 'msc-whitelist-name', 'msc-ban-name', 'msc-ban-ip'].forEach(function (id) {
      var input = $(id);
      if (input) input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          var btnMap = {
            'msc-op-name': 'msc-add-op-btn',
            'msc-whitelist-name': 'msc-add-whitelist-btn',
            'msc-ban-name': 'msc-add-ban-btn',
            'msc-ban-ip': 'msc-add-ban-ip-btn'
          };
          var btn = $(btnMap[id]);
          if (btn) btn.click();
        }
      });
    });

    /* Addon search */
    var searchBtn = $('msc-addon-search-btn');
    if (searchBtn) searchBtn.addEventListener('click', searchAddons);
    var searchInput = $('msc-addon-search');
    if (searchInput) searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); searchAddons(); }
    });

    /* JVM inputs */
    var minRam = $('msc-min-ram');
    var maxRam = $('msc-max-ram');
    var customFlags = $('msc-custom-flags');
    var autoRestart = $('msc-auto-restart');
    var restartDelay = $('msc-restart-delay');
    if (minRam) minRam.addEventListener('change', function () { state.jvm.minRam = minRam.value; renderJvmTab(); });
    if (maxRam) maxRam.addEventListener('change', function () { state.jvm.maxRam = maxRam.value; renderJvmTab(); });
    if (customFlags) customFlags.addEventListener('input', function () { state.jvm.customFlags = customFlags.value; renderJvmTab(); });
    if (autoRestart) autoRestart.addEventListener('change', function () { state.jvm.autoRestart = autoRestart.checked; });
    if (restartDelay) restartDelay.addEventListener('change', function () { state.jvm.restartDelay = parseInt(restartDelay.value) || 10; });

    /* Server icon upload */
    var iconBtn = $('msc-icon-upload-btn');
    var iconInput = $('msc-icon-upload');
    if (iconBtn) iconBtn.addEventListener('click', function () { if (iconInput) iconInput.click(); });
    if (iconInput) iconInput.addEventListener('change', function (e) {
      if (e.target.files[0]) handleIconUpload(e.target.files[0]);
      e.target.value = '';
    });

    /* Export button */
    var exportBtn = $('msc-export-zip');
    if (exportBtn) exportBtn.addEventListener('click', exportZip);

    /* Initial render */
    renderAll();
  }

  /* Boot */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
