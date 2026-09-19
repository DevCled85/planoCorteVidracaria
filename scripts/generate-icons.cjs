const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function makeCrcTable() {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }
  return table;
}
const crcTable = makeCrcTable();

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function createPNG(width, height, drawPixel) {
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    scanlines[offset++] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixel(x, y, width, height);
      scanlines[offset++] = r;
      scanlines[offset++] = g;
      scanlines[offset++] = b;
      scanlines[offset++] = a;
    }
  }

  const deflated = zlib.deflateSync(scanlines);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  function makeChunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const toCrc = Buffer.concat([typeBuf, data]);
    const crcVal = crc32(toCrc);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal, 0);
    return Buffer.concat([lenBuf, toCrc, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', deflated),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

// Icon drawer: smooth gradient background with glass sheet cutouts
function renderIcon(x, y, width, height, isMaskable = false) {
  const nx = x / width;
  const ny = y / height;

  // Background gradient: from cyan (#06b6d4) at top-left to deep blue (#1d4ed8) at bottom-right
  const t = (nx + ny) / 2;
  let bgR = Math.round(6 + (29 - 6) * t);
  let bgG = Math.round(182 + (78 - 182) * t);
  let bgB = Math.round(212 + (216 - 212) * t);

  // If not maskable, round corners with anti-aliasing
  let alpha = 255;
  if (!isMaskable) {
    const radius = 0.22;
    // Normalized coords relative to center
    const cx = Math.abs(nx - 0.5);
    const cy = Math.abs(ny - 0.5);
    const cornerDx = Math.max(0, cx - (0.5 - radius));
    const cornerDy = Math.max(0, cy - (0.5 - radius));
    const distSq = cornerDx * cornerDx + cornerDy * cornerDy;
    const radSq = radius * radius;
    if (distSq > radSq) {
      return [0, 0, 0, 0];
    }
  }

  // Safe zone scaling: if maskable, shrink geometry slightly into central 80%
  const scale = isMaskable ? 0.78 : 0.88;
  const gx = (nx - 0.5) / scale + 0.5;
  const gy = (ny - 0.5) / scale + 0.5;

  // Main glass sheet rect: [0.18, 0.20, 0.82, 0.80]
  const inMainSheet = gx >= 0.18 && gx <= 0.82 && gy >= 0.20 && gy <= 0.80;

  if (inMainSheet) {
    // Border of main sheet
    const isBorder = gx <= 0.19 || gx >= 0.81 || gy <= 0.21 || gy >= 0.79;
    if (isBorder) {
      return [255, 255, 255, 240];
    }

    // Cut guide lines (vertical at gx=0.58, horizontal at gy=0.55)
    const isCutV = Math.abs(gx - 0.58) < 0.008 && gy < 0.55;
    const isCutH = Math.abs(gy - 0.55) < 0.008;
    if (isCutV || isCutH) {
      // Dotted cut line look
      const dash = Math.sin((gx + gy) * 120);
      if (dash > 0) {
        return [244, 63, 94, 255]; // Rose-500 cut mark
      }
    }

    // Piece 1: Top-Left (gx 0.20..0.56, gy 0.22..0.53)
    if (gx >= 0.21 && gx <= 0.56 && gy >= 0.22 && gy <= 0.53) {
      const isInnerBorder = gx <= 0.22 || gx >= 0.55 || gy <= 0.23 || gy >= 0.52;
      if (isInnerBorder) return [165, 243, 252, 230];
      return [56, 189, 248, 190];
    }

    // Piece 2: Top-Right (gx 0.60..0.80, gy 0.22..0.53)
    if (gx >= 0.60 && gx <= 0.79 && gy >= 0.22 && gy <= 0.53) {
      const isInnerBorder = gx <= 0.61 || gx >= 0.78 || gy <= 0.23 || gy >= 0.52;
      if (isInnerBorder) return [147, 197, 253, 230];
      return [59, 130, 246, 170];
    }

    // Piece 3: Bottom (gx 0.21..0.79, gy 0.57..0.78)
    if (gx >= 0.21 && gx <= 0.79 && gy >= 0.57 && gy <= 0.77) {
      const isInnerBorder = gx <= 0.22 || gx >= 0.78 || gy <= 0.58 || gy >= 0.76;
      if (isInnerBorder) return [125, 211, 252, 230];
      return [14, 165, 233, 160];
    }

    // Sheet backdrop
    return [255, 255, 255, 70];
  }

  // Diamond glass cutter point top right
  const dcx = isMaskable ? 0.82 : 0.84;
  const dcy = isMaskable ? 0.18 : 0.16;
  const dDist = Math.hypot(nx - dcx, ny - dcy);
  if (dDist < 0.07) {
    if (dDist > 0.058) return [56, 189, 248, 255];
    if (dDist < 0.02) return [244, 63, 94, 255];
    return [15, 23, 42, 255];
  }

  return [bgR, bgG, bgB, alpha];
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA and App icons...');

// 1. pwa-192x192.png
fs.writeFileSync(
  path.join(publicDir, 'pwa-192x192.png'),
  createPNG(192, 192, (x, y, w, h) => renderIcon(x, y, w, h, false))
);
console.log('Generated public/pwa-192x192.png');

// 2. pwa-512x512.png
fs.writeFileSync(
  path.join(publicDir, 'pwa-512x512.png'),
  createPNG(512, 512, (x, y, w, h) => renderIcon(x, y, w, h, false))
);
console.log('Generated public/pwa-512x512.png');

// 3. pwa-maskable-512x512.png
fs.writeFileSync(
  path.join(publicDir, 'pwa-maskable-512x512.png'),
  createPNG(512, 512, (x, y, w, h) => renderIcon(x, y, w, h, true))
);
console.log('Generated public/pwa-maskable-512x512.png');

// 4. apple-touch-icon.png (180x180)
fs.writeFileSync(
  path.join(publicDir, 'apple-touch-icon.png'),
  createPNG(180, 180, (x, y, w, h) => renderIcon(x, y, w, h, false))
);
console.log('Generated public/apple-touch-icon.png');

// 5. favicon.ico (using 32x32 PNG)
fs.writeFileSync(
  path.join(publicDir, 'favicon.ico'),
  createPNG(32, 32, (x, y, w, h) => renderIcon(x, y, w, h, false))
);
console.log('Generated public/favicon.ico');

console.log('All icons generated successfully!');
