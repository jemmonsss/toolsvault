/* Toolsvault Minecraft Seed Map — Java Edition coordinate/seed utilities.
 * Structure attempt parameters and PRNG follow cubiomes (MIT; Cubitect).
 * https://github.com/Cubitect/cubiomes — THESE ARE PLACEMENT ATTEMPTS,
 * not biome/terrain-validated final structures.
 */
(function (root, factory) {
  var core = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
  root.ToolsvaultSeedCore = core;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const MASK48 = (1n << 48n) - 1n;
  const MASK64 = (1n << 64n) - 1n;
  const MULT = 0x5deece66dn;
  const ADD = 11n;
  const MIN_I64 = -(1n << 63n);
  const MAX_I64 = (1n << 63n) - 1n;

  function parseSeed(value) {
    const text = String(value == null ? '' : value).trim();
    // Minecraft Java: parse a signed 64-bit number; otherwise String.hashCode().
    if (/^[+-]?\d+$/.test(text)) {
      try {
        const n = BigInt(text);
        if (n >= MIN_I64 && n <= MAX_I64) return n;
      } catch (_) { /* Java falls through to text hashing */ }
    }
    let h = 0;
    for (let i = 0; i < text.length; ++i) h = (Math.imul(h, 31) + text.charCodeAt(i)) | 0;
    return BigInt(h);
  }
  function seedLabel(value) { return parseSeed(value).toString(); }
  function randomSeed() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const values = new Uint32Array(2);
      crypto.getRandomValues(values);
      return BigInt.asIntN(64, (BigInt(values[0]) << 32n) | BigInt(values[1])).toString();
    }
    return BigInt.asIntN(64, BigInt(Math.floor(Math.random() * 2 ** 32)) << 32n |
      BigInt(Math.floor(Math.random() * 2 ** 32))).toString();
  }
  class JavaRandom {
    constructor(seed) { this.s = (BigInt(seed) ^ MULT) & MASK48; }
    next(bits) {
      this.s = (this.s * MULT + ADD) & MASK48;
      return Number(this.s >> (48n - BigInt(bits)));
    }
    nextInt(bound) {
      if (!Number.isInteger(bound) || bound <= 0) throw new RangeError('bad bound');
      if ((bound & (bound - 1)) === 0) return Math.floor(bound * this.next(31) / 2147483648);
      let bits, val;
      do {
        bits = this.next(31);
        val = bits % bound;
      } while (bits - val + (bound - 1) > 2147483647);
      return val;
    }
    nextLong() {
      // Java Random.nextLong() signs both of its 32-bit pieces.
      const hi = BigInt(this.next(32) | 0);
      const lo = BigInt(this.next(32) | 0);
      return BigInt.asIntN(64, (hi << 32n) + lo);
    }
  }
  function slimeChunk(seed, cx, cz) {
    // Exactly the Java slime-chunk algorithm, including Java 32-bit overflow.
    const x = BigInt(cx), z = BigInt(cz);
    const int32 = n => BigInt.asIntN(32, n);
    let s = BigInt.asUintN(64, BigInt(seed));
    s = (s + int32(x * 0x5ac0dbn) + int32(x * x * 0x4c1906n) +
         int32(z * 0x5f24fn) + int32(z * z) * 0x4307a7n) & MASK64;
    s = s ^ 0x3ad8025fn;
    return new JavaRandom(s).nextInt(10) === 0;
  }
  function atLeast(version, required) {
    return Number(version) >= Number(required);
  }
  const TYPES = [
    { id:'village', name:'Village', dim:'overworld', salt:10387312, spacing:34, range:26, min:1.16, color:'#e6b567' },
    { id:'desert_pyramid', name:'Desert Pyramid', dim:'overworld', salt:14357617, spacing:32, range:24, min:1.16, color:'#f0cb48' },
    { id:'jungle_temple', name:'Jungle Temple', dim:'overworld', salt:14357619, spacing:32, range:24, min:1.16, color:'#41aa70' },
    { id:'swamp_hut', name:'Swamp Hut', dim:'overworld', salt:14357620, spacing:32, range:24, min:1.16, color:'#56856c' },
    { id:'igloo', name:'Igloo', dim:'overworld', salt:14357618, spacing:32, range:24, min:1.16, color:'#dbebff' },
    { id:'ocean_monument', name:'Ocean Monument', dim:'overworld', salt:10387313, spacing:32, range:27, min:1.16, large:true, color:'#47a5d6' },
    { id:'woodland_mansion', name:'Woodland Mansion', dim:'overworld', salt:10387319, spacing:80, range:60, min:1.16, large:true, color:'#4c9250' },
    { id:'pillager_outpost', name:'Pillager Outpost', dim:'overworld', salt:165745296, spacing:32, range:24, min:1.16, outpost:true, color:'#ff8844' },
    { id:'shipwreck', name:'Shipwreck', dim:'overworld', salt:165745295, spacing:24, range:20, min:1.16, color:'#9a6b55' },
    { id:'ocean_ruin', name:'Ocean Ruins', dim:'overworld', salt:14357621, spacing:20, range:12, min:1.16, color:'#6dbacb' },
    { id:'ruined_portal', name:'Ruined Portal', dim:'overworld', salt:34222645, spacing:40, range:25, min:1.16, color:'#ac77e9' },
    { id:'ancient_city', name:'Ancient City', dim:'overworld', salt:20083232, spacing:24, range:16, min:1.19, color:'#3db6b1' },
    { id:'trail_ruins', name:'Trail Ruins', dim:'overworld', salt:83469867, spacing:34, range:26, min:1.20, color:'#ca7d4b' },
    { id:'trial_chambers', name:'Trial Chambers', dim:'overworld', salt:94251327, spacing:34, range:22, min:1.21, color:'#da924f' },
    { id:'nether_fortress', name:'Nether Fortress', dim:'nether', salt:30084232, spacing:27, range:23, min:1.16, fortress:true, color:'#ef6666' },
    { id:'bastion_remnant', name:'Bastion Remnant', dim:'nether', salt:30084232, spacing:27, range:23, min:1.16, bastion:true, color:'#eac16c' },
    { id:'nether_portal', name:'Ruined Portal', dim:'nether', salt:34222645, spacing:40, range:25, min:1.16, color:'#b692e6' },
    { id:'end_city', name:'End City', dim:'end', salt:10387313, spacing:20, range:9, min:1.16, large:true, color:'#ca9cf6' }
  ];
  function getTypes(dimension, version) { return TYPES.filter(t => t.dim === dimension && atLeast(version, t.min)); }
  function candidateAt(seed, type, rx, rz, version) {
    let spacing = type.spacing, range = type.range;
    if (type.id === 'village' && !atLeast(version, 1.18)) { spacing = 32; range = 24; }
    if (type.id === 'shipwreck' && !atLeast(version, 1.16)) { spacing = 16; range = 8; }
    const worldSeed = BigInt(seed);
    const mixedSeed = worldSeed + BigInt(rx) * 341873128712n + BigInt(rz) * 132897987541n + BigInt(type.salt);
    const rnd = new JavaRandom(mixedSeed);
    const offsetX = type.large ? Math.floor((rnd.nextInt(range) + rnd.nextInt(range)) / 2) : rnd.nextInt(range);
    const offsetZ = type.large ? Math.floor((rnd.nextInt(range) + rnd.nextInt(range)) / 2) : rnd.nextInt(range);
    const cx = rx * spacing + offsetX, cz = rz * spacing + offsetZ;
    const x = cx * 16, z = cz * 16;
    if (type.id === 'end_city' && x*x + z*z < 1008*1008) return null;
    if (type.outpost) {
      let s = (BigInt(seed) ^ BigInt(cx >> 4) ^ (BigInt(cz >> 4) << 4n)) & MASK64;
      const rng = new JavaRandom(s);
      rng.next(31);
      if (rng.nextInt(5) !== 0) return null;
    }
    if (type.fortress || type.bastion) {
      // 1.18+ Nether splits fortress/bastion attempts using the chunk RNG.
      if (atLeast(version, 1.18)) {
        const rng = new JavaRandom(seed);
        const a = rng.nextLong(), b = rng.nextLong();
        const chunkSeed = (a * BigInt(cx) ^ b * BigInt(cz) ^ BigInt(seed)) & MASK64;
        const bastion = new JavaRandom(chunkSeed).nextInt(5) >= 2;
        if (bastion !== !!type.bastion) return null;
      } else {
        // Earlier fortress/bastion placement also uses the shared position RNG.
        const bastion = rnd.nextInt(5) >= 2;
        if (bastion !== !!type.bastion) return null;
      }
    }
    return { x, z, type: type.id, name: type.name, color: type.color, candidate: true };
  }
  function structureCandidates(seed, dimension, version, left, top, right, bottom, visibleTypes) {
    const types = getTypes(dimension, version).filter(t => !visibleTypes || visibleTypes.has(t.id));
    const out = [];
    for (const type of types) {
      const step = type.spacing * 16;
      const x0 = Math.floor(left / step) - 1, x1 = Math.floor(right / step) + 1;
      const z0 = Math.floor(top / step) - 1, z1 = Math.floor(bottom / step) + 1;
      for (let rz = z0; rz <= z1; ++rz) for (let rx = x0; rx <= x1; ++rx) {
        const p = candidateAt(seed, type, rx, rz, version);
        if (p && p.x >= left && p.x <= right && p.z >= top && p.z <= bottom) out.push(p);
      }
    }
    return out;
  }
  function structureNearest(seed, dimension, version, x, z, typeId, radius) {
    const type = getTypes(dimension, version).find(t => t.id === typeId);
    if (!type) return null;
    const step = type.spacing * 16;
    const r = Math.min(32000, Math.max(512, radius || 6000));
    let closest = null, best = r*r;
    for (let rz = Math.floor((z-r)/step)-1; rz <= Math.floor((z+r)/step)+1; rz++)
      for (let rx = Math.floor((x-r)/step)-1; rx <= Math.floor((x+r)/step)+1; rx++) {
        const p = candidateAt(seed, type, rx, rz, version);
        if (!p) continue;
        const d2 = (p.x-x)**2 + (p.z-z)**2;
        if (d2 < best) { best = d2; closest = Object.assign({distance:Math.sqrt(d2)}, p); }
      }
    return closest;
  }
  return { parseSeed, seedLabel, randomSeed, JavaRandom, slimeChunk, getTypes, candidateAt, structureCandidates, structureNearest, TYPES };
});
