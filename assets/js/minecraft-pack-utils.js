/* Shared Minecraft pack helpers for Toolsvault creators. */
(function () {
  'use strict';

  var textEncoder = new TextEncoder();
  var textDecoder = new TextDecoder('utf-8');

  function textBytes(value) { return textEncoder.encode(String(value == null ? '' : value)); }
  function bytesText(bytes) { return textDecoder.decode(bytes); }

  function sanitizeName(value, fallback) {
    return String(value || fallback || 'pack').toLowerCase().replace(/[^a-z0-9._-]+/g, '_').replace(/^[_\.]+|[_\.]+$/g, '') || (fallback || 'pack');
  }

  function sanitizeNamespace(value) {
    return sanitizeName(value, 'mypack').replace(/\.+/g, '.');
  }

  function safePath(value) {
    var path = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
    if (!path || path.startsWith('/') || /^[a-zA-Z]:\//.test(path) || path.split('/').includes('..')) {
      throw new Error('Unsafe or empty path: ' + value);
    }
    return path.split('/').filter(Boolean).join('/');
  }

  function parseFormat(value) {
    if (Array.isArray(value)) return [Number(value[0]) || 0, Number(value[1]) || 0];
    var parts = String(value == null ? '0' : value).split('.');
    return [Number(parts[0]) || 0, Number(parts[1]) || 0];
  }

  function formatLabel(value) {
    var p = parseFormat(value);
    return p[0] + '.' + p[1];
  }

  function modernThreshold(kind) { return kind === 'data' ? 82 : 65; }

  function buildPackMeta(kind, version, description, options) {
    options = options || {};
    var min = parseFormat(options.minFormat || version);
    var max = parseFormat(options.maxFormat || version);
    var pack = { description: String(description || '') };
    var threshold = modernThreshold(kind);
    if (min[0] >= threshold) {
      pack.min_format = min;
      pack.max_format = max;
    } else {
      pack.pack_format = min[0];
      if (max[0] !== min[0]) pack.supported_formats = { min_inclusive: min[0], max_inclusive: max[0] };
    }
    return { pack: pack };
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  function blobToBytes(blob) {
    return blob.arrayBuffer().then(function (buffer) { return new Uint8Array(buffer); });
  }

  function hex(bytes) {
    return Array.from(new Uint8Array(bytes)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  async function digest(bytes, algorithm) {
    if (!window.crypto || !window.crypto.subtle) throw new Error('Secure hashing is unavailable in this browser.');
    return hex(await window.crypto.subtle.digest(algorithm, bytes));
  }

  async function fileHashes(bytes) {
    return {
      sha1: await digest(bytes, 'SHA-1'),
      sha512: await digest(bytes, 'SHA-512')
    };
  }

  function findEocd(bytes) {
    var min = Math.max(0, bytes.length - 65557);
    for (var i = bytes.length - 22; i >= min; i--) {
      if (bytes[i] === 0x50 && bytes[i + 1] === 0x4b && bytes[i + 2] === 0x05 && bytes[i + 3] === 0x06) return i;
    }
    return -1;
  }

  async function inflateRaw(bytes) {
    if (typeof DecompressionStream === 'undefined') throw new Error('This browser cannot decompress ZIP files.');
    var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  async function readZip(fileOrBytes) {
    var bytes = fileOrBytes instanceof Uint8Array ? fileOrBytes : new Uint8Array(await fileOrBytes.arrayBuffer());
    var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    var eocd = findEocd(bytes);
    if (eocd < 0) throw new Error('Not a valid ZIP archive.');
    var entryCount = view.getUint16(eocd + 10, true);
    var centralOffset = view.getUint32(eocd + 16, true);
    var pos = centralOffset;
    var out = [];
    for (var i = 0; i < entryCount; i++) {
      if (view.getUint32(pos, true) !== 0x02014b50) throw new Error('Corrupt ZIP central directory.');
      var flags = view.getUint16(pos + 8, true);
      var method = view.getUint16(pos + 10, true);
      var compressedSize = view.getUint32(pos + 20, true);
      var uncompressedSize = view.getUint32(pos + 24, true);
      var nameLen = view.getUint16(pos + 28, true);
      var extraLen = view.getUint16(pos + 30, true);
      var commentLen = view.getUint16(pos + 32, true);
      var localOffset = view.getUint32(pos + 42, true);
      var nameBytes = bytes.slice(pos + 46, pos + 46 + nameLen);
      var name = (flags & 0x800) ? bytesText(nameBytes) : bytesText(nameBytes);
      pos += 46 + nameLen + extraLen + commentLen;
      if (name.endsWith('/')) continue;
      name = safePath(name);
      if (view.getUint32(localOffset, true) !== 0x04034b50) throw new Error('Corrupt ZIP local header.');
      var localNameLen = view.getUint16(localOffset + 26, true);
      var localExtraLen = view.getUint16(localOffset + 28, true);
      var dataOffset = localOffset + 30 + localNameLen + localExtraLen;
      var compressed = bytes.slice(dataOffset, dataOffset + compressedSize);
      var data;
      if (method === 0) data = compressed;
      else if (method === 8) data = await inflateRaw(compressed);
      else throw new Error('Unsupported ZIP compression method ' + method + ' for ' + name + '.');
      if (uncompressedSize && data.length !== uncompressedSize) throw new Error('ZIP size mismatch for ' + name + '.');
      out.push({ name: name, data: data });
    }
    return out;
  }

  function fileToDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  window.MinecraftPack = {
    textBytes: textBytes,
    bytesText: bytesText,
    sanitizeName: sanitizeName,
    sanitizeNamespace: sanitizeNamespace,
    safePath: safePath,
    parseFormat: parseFormat,
    formatLabel: formatLabel,
    buildPackMeta: buildPackMeta,
    downloadBlob: downloadBlob,
    blobToBytes: blobToBytes,
    fileHashes: fileHashes,
    readZip: readZip,
    fileToDataUrl: fileToDataUrl
  };
})();
