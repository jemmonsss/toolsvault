/* Minimal dependency-free ZIP writer (STORE method, no compression).
 * Produces a valid .zip archive from an array of { name, data:Uint8Array }.
 * Usage: TpcZip.createZip(files) -> Blob (application/zip)
 */
(function (global) {
  'use strict';

  var CRC_TABLE = (function () {
    var table = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[n] = c >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    var crc = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) {
      crc = CRC_TABLE[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function dosTime(date) {
    var time = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
    var dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
    return { time: time & 0xFFFF, date: dosDate & 0xFFFF };
  }

  // Convert a filename to UTF-8 bytes. We also set general-purpose bit 11
  // (UTF-8) in the headers so non-ASCII names decode correctly.
  function nameToBytes(str) {
    return new TextEncoder().encode(str);
  }

  function createZip(files) {
    var now = new Date();
    var t = dosTime(now);

    var localParts = [];
    var central = [];

    files.forEach(function (file) {
      var nameBytes = nameToBytes(file.name);
      var data = file.data;
      var crc = crc32(data);
      var size = data.length;

      // Local file header (30 bytes + name)
      var lh = new Uint8Array(30);
      var dv = new DataView(lh.buffer);
      dv.setUint32(0, 0x04034b50, true);     // local file signature
      dv.setUint16(4, 20, true);             // version needed
      dv.setUint16(6, 0x0800, true);         // general purpose bit (UTF-8 names)
      dv.setUint16(8, 0, true);              // method: store
      dv.setUint16(10, t.time, true);
      dv.setUint16(12, t.date, true);
      dv.setUint32(14, crc, true);
      dv.setUint32(18, size, true);          // compressed size
      dv.setUint32(22, size, true);          // uncompressed size
      dv.setUint16(26, nameBytes.length, true);
      dv.setUint16(28, 0, true);             // extra length

      localParts.push(lh, nameBytes, data);

      // Central directory header (46 bytes + name)
      var ch = new Uint8Array(46);
      var cd = new DataView(ch.buffer);
      cd.setUint32(0, 0x02014b50, true);     // central dir signature
      cd.setUint16(4, 20, true);             // version made by
      cd.setUint16(6, 20, true);             // version needed
      cd.setUint16(8, 0x0800, true);         // general purpose bit
      cd.setUint16(10, 0, true);             // method
      cd.setUint16(12, t.time, true);
      cd.setUint16(14, t.date, true);
      cd.setUint32(16, crc, true);
      cd.setUint32(20, size, true);
      cd.setUint32(24, size, true);
      cd.setUint16(28, nameBytes.length, true);
      cd.setUint16(30, 0, true);             // extra length
      cd.setUint16(32, 0, true);             // comment length
      cd.setUint16(34, 0, true);             // disk number
      cd.setUint16(36, 0, true);             // internal attrs
      cd.setUint32(38, 0, true);             // external attrs
      cd.setUint32(42, 0, true);             // local header offset

      central.push(ch, nameBytes);
    });

    // Compute offsets for central directory local-header offsets.
    var offset = 0;
    for (var i = 0; i < localParts.length; i++) offset += localParts[i].length;
    // localParts pairs: [lh, name, data]; offsets per file:
    var fileOffset = 0;
    for (var f = 0; f < files.length; f++) {
      var off = fileOffset;
      var chdr = central[f * 2];
      new DataView(chdr.buffer).setUint32(42, off, true);
      fileOffset += localParts[f * 3].length + localParts[f * 3 + 1].length + localParts[f * 3 + 2].length;
    }

    // End of central directory (22 bytes)
    var eocd = new Uint8Array(22);
    var ed = new DataView(eocd.buffer);
    ed.setUint32(0, 0x06054b50, true);       // EOCD signature
    ed.setUint16(4, 0, true);                // disk number
    ed.setUint16(6, 0, true);                // disk with central dir
    ed.setUint16(8, files.length, true);     // entries on this disk
    ed.setUint16(10, files.length, true);    // total entries
    // central dir size
    var centralSize = 0;
    for (var c = 0; c < central.length; c++) centralSize += central[c].length;
    ed.setUint32(12, centralSize, true);
    ed.setUint32(16, offset, true);          // central dir offset
    ed.setUint16(20, 0, true);               // comment length

    var parts = localParts.concat(central, [eocd]);
    var total = 0;
    for (var p = 0; p < parts.length; p++) total += parts[p].length;
    var out = new Uint8Array(total);
    var pos = 0;
    for (var q = 0; q < parts.length; q++) {
      out.set(parts[q], pos);
      pos += parts[q].length;
    }
    return new Blob([out], { type: 'application/zip' });
  }

  global.TpcZip = { createZip: createZip, crc32: crc32 };
})(window);
