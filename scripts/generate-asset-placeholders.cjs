/**
 * Génère icon-background.png (1024x1024 #0B0F1A) et splash/splash-dark (2732x2732).
 * À exécuter une fois: node scripts/generate-asset-placeholders.cjs
 */
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

function crc32(data) {
  let crc = 0xffffffff;
  const table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c >>> 0;
    }
    return t;
  })();
  for (let i = 0; i < data.length; i++) crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function writeChunk(buf, type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  buf.push(len, Buffer.from(type, "ascii"), data);
  const chunk = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(chunk), 0);
  buf.push(crc);
}

function createSolidPng(width, height, r, g, b, a = 255) {
  const buf = [];
  buf.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9);  // color type RGBA
  ihdr.writeUInt8(0, 10); ihdr.writeUInt8(0, 11); ihdr.writeUInt8(0, 12);
  writeChunk(buf, "IHDR", ihdr);

  const raw = Buffer.alloc(width * (1 + height * 4));
  let off = 0;
  for (let y = 0; y < height; y++) {
    raw[off++] = 0; // filter
    for (let x = 0; x < width; x++) {
      raw[off++] = r;
      raw[off++] = g;
      raw[off++] = b;
      raw[off++] = a;
    }
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  writeChunk(buf, "IDAT", idat);
  writeChunk(buf, "IEND", Buffer.alloc(0));

  return Buffer.concat(buf);
}

const assetsDir = path.join(__dirname, "..", "assets");
// #0B0F1A
const r = 11, g = 15, b = 26;
fs.mkdirSync(assetsDir, { recursive: true });

const bg1024 = createSolidPng(1024, 1024, r, g, b);
fs.writeFileSync(path.join(assetsDir, "icon-background.png"), bg1024);
console.log("Written assets/icon-background.png (1024x1024 #0B0F1A)");

const splash2732 = createSolidPng(2732, 2732, r, g, b);
fs.writeFileSync(path.join(assetsDir, "splash.png"), splash2732);
fs.writeFileSync(path.join(assetsDir, "splash-dark.png"), splash2732);
console.log("Written assets/splash.png and assets/splash-dark.png (2732x2732)");
