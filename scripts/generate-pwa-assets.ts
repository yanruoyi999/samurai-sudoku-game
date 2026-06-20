#!/usr/bin/env tsx

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { deflateSync } from 'node:zlib';

type Rgba = [number, number, number, number];

interface Canvas {
  width: number;
  height: number;
  data: Buffer;
}

const CRC_TABLE = new Uint32Array(256).map((_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function encodePng(canvas: Canvas): Buffer {
  const raw = Buffer.alloc((canvas.width * 4 + 1) * canvas.height);
  for (let y = 0; y < canvas.height; y += 1) {
    const rawRow = y * (canvas.width * 4 + 1);
    raw[rawRow] = 0;
    canvas.data.copy(raw, rawRow + 1, y * canvas.width * 4, (y + 1) * canvas.width * 4);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(canvas.width, 0);
  header.writeUInt32BE(canvas.height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function createCanvas(width: number, height: number): Canvas {
  return { width, height, data: Buffer.alloc(width * height * 4) };
}

function setPixel(canvas: Canvas, x: number, y: number, color: Rgba) {
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;
  const offset = (y * canvas.width + x) * 4;
  canvas.data[offset] = color[0];
  canvas.data[offset + 1] = color[1];
  canvas.data[offset + 2] = color[2];
  canvas.data[offset + 3] = color[3];
}

function fillRect(canvas: Canvas, x: number, y: number, width: number, height: number, color: Rgba) {
  const startX = Math.max(0, Math.floor(x));
  const startY = Math.max(0, Math.floor(y));
  const endX = Math.min(canvas.width, Math.ceil(x + width));
  const endY = Math.min(canvas.height, Math.ceil(y + height));
  for (let row = startY; row < endY; row += 1) {
    for (let col = startX; col < endX; col += 1) {
      setPixel(canvas, col, row, color);
    }
  }
}

function strokeRect(canvas: Canvas, x: number, y: number, width: number, height: number, color: Rgba, lineWidth = 1) {
  fillRect(canvas, x, y, width, lineWidth, color);
  fillRect(canvas, x, y + height - lineWidth, width, lineWidth, color);
  fillRect(canvas, x, y, lineWidth, height, color);
  fillRect(canvas, x + width - lineWidth, y, lineWidth, height, color);
}

function paintGradient(canvas: Canvas, top: Rgba, bottom: Rgba) {
  for (let y = 0; y < canvas.height; y += 1) {
    const amount = y / Math.max(1, canvas.height - 1);
    const color: Rgba = [
      Math.round(top[0] * (1 - amount) + bottom[0] * amount),
      Math.round(top[1] * (1 - amount) + bottom[1] * amount),
      Math.round(top[2] * (1 - amount) + bottom[2] * amount),
      255,
    ];
    fillRect(canvas, 0, y, canvas.width, 1, color);
  }
}

function drawSudokuGrid(canvas: Canvas, x: number, y: number, cell: number, opacity = 255) {
  const size = cell * 9;
  fillRect(canvas, x, y, size, size, [255, 255, 255, Math.round(opacity * 0.94)]);

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if ((row * 7 + col * 5) % 11 === 0) {
        fillRect(
          canvas,
          x + col * cell + cell * 0.22,
          y + row * cell + cell * 0.22,
          cell * 0.56,
          cell * 0.56,
          [31, 41, 55, Math.round(opacity * 0.78)],
        );
      }
    }
  }

  for (let line = 0; line <= 9; line += 1) {
    const width = line % 3 === 0 ? Math.max(2, Math.round(cell * 0.13)) : 1;
    fillRect(canvas, x + line * cell - Math.floor(width / 2), y, width, size, [15, 23, 42, opacity]);
    fillRect(canvas, x, y + line * cell - Math.floor(width / 2), size, width, [15, 23, 42, opacity]);
  }
}

function drawSamuraiBoard(canvas: Canvas, centerX: number, centerY: number, cell: number) {
  const grid = cell * 9;
  const gap = cell * 3;
  const left = centerX - grid - gap / 2;
  const top = centerY - grid - gap / 2;
  const right = centerX + gap / 2;
  const bottom = centerY + gap / 2;
  const middle = centerX - grid / 2;
  const middleY = centerY - grid / 2;

  drawSudokuGrid(canvas, left, top, cell);
  drawSudokuGrid(canvas, right, top, cell);
  drawSudokuGrid(canvas, middle, middleY, cell);
  drawSudokuGrid(canvas, left, bottom, cell);
  drawSudokuGrid(canvas, right, bottom, cell);
}

function createIcon(size: number): Canvas {
  const canvas = createCanvas(size, size);
  paintGradient(canvas, [32, 29, 78, 255], [10, 15, 26, 255]);
  const cell = Math.max(4, Math.floor(size / 38));
  drawSamuraiBoard(canvas, size / 2, size / 2, cell);
  strokeRect(canvas, size * 0.08, size * 0.08, size * 0.84, size * 0.84, [245, 158, 11, 255], Math.max(3, size / 96));
  return canvas;
}

function createDesktopScreenshot(): Canvas {
  const canvas = createCanvas(1280, 720);
  paintGradient(canvas, [244, 247, 251, 255], [226, 232, 240, 255]);
  fillRect(canvas, 0, 0, 1280, 76, [15, 23, 42, 255]);
  drawSamuraiBoard(canvas, 430, 390, 22);
  fillRect(canvas, 900, 130, 260, 80, [255, 255, 255, 255]);
  fillRect(canvas, 930, 158, 200, 18, [99, 102, 241, 255]);
  fillRect(canvas, 900, 240, 260, 300, [255, 255, 255, 255]);
  for (let i = 0; i < 9; i += 1) {
    fillRect(canvas, 930 + (i % 3) * 70, 280 + Math.floor(i / 3) * 70, 46, 46, [226, 232, 240, 255]);
  }
  return canvas;
}

function createMobileScreenshot(): Canvas {
  const canvas = createCanvas(750, 1334);
  paintGradient(canvas, [248, 250, 252, 255], [226, 232, 240, 255]);
  fillRect(canvas, 0, 0, 750, 104, [15, 23, 42, 255]);
  drawSamuraiBoard(canvas, 375, 510, 13);
  fillRect(canvas, 72, 880, 606, 92, [255, 255, 255, 255]);
  for (let i = 0; i < 9; i += 1) {
    fillRect(canvas, 78 + i * 66, 1030, 46, 46, [99, 102, 241, 255]);
  }
  fillRect(canvas, 96, 1160, 558, 78, [15, 23, 42, 255]);
  return canvas;
}

function createOgImage(): Canvas {
  const canvas = createCanvas(1200, 630);
  paintGradient(canvas, [30, 41, 59, 255], [15, 23, 42, 255]);
  drawSamuraiBoard(canvas, 380, 335, 18);
  fillRect(canvas, 760, 170, 300, 32, [245, 158, 11, 255]);
  fillRect(canvas, 760, 235, 360, 24, [248, 250, 252, 255]);
  fillRect(canvas, 760, 285, 280, 24, [203, 213, 225, 255]);
  fillRect(canvas, 760, 380, 220, 60, [99, 102, 241, 255]);
  return canvas;
}

async function writePng(filePath: string, canvas: Canvas) {
  await writeFile(filePath, encodePng(canvas));
  console.log(`Wrote ${filePath}`);
}

async function main() {
  const publicDir = path.join(process.cwd(), 'public');
  await mkdir(publicDir, { recursive: true });

  for (const size of [192, 256, 384, 512]) {
    await writePng(path.join(publicDir, `icon-${size}x${size}.png`), createIcon(size));
  }

  await writePng(path.join(publicDir, 'screenshot-desktop.png'), createDesktopScreenshot());
  await writePng(path.join(publicDir, 'screenshot-mobile.png'), createMobileScreenshot());
  await writePng(path.join(publicDir, 'og-image.png'), createOgImage());
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
