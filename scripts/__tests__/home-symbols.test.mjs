import assert from "node:assert/strict";
import { lstatSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));
const assetRoot = path.join(repositoryRoot, "mobile/app/assets/symbols");
const names = [
  "home-camera",
  "home-location",
  "home-recycling",
  "tab-home",
  "tab-location",
  "tab-scan",
  "tab-settings",
];

function readLocalAsset(filename) {
  const target = path.join(assetRoot, filename);
  const stat = lstatSync(target);
  assert.ok(stat.isFile() && !stat.isSymbolicLink(), `${filename} must be a regular local file`);
  assert.equal(realpathSync(target), target, `${filename} must not traverse a symbolic link`);
  return readFileSync(target);
}

function paeth(a, b, c) {
  const prediction = a + b - c;
  const distanceA = Math.abs(prediction - a);
  const distanceB = Math.abs(prediction - b);
  const distanceC = Math.abs(prediction - c);
  return distanceA <= distanceB && distanceA <= distanceC ? a : distanceB <= distanceC ? b : c;
}

/** Decode only the deliberately small, non-interlaced 8-bit RGBA export format. */
function decodeSymbolPng(filename) {
  const png = readLocalAsset(filename);
  assert.deepEqual(png.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const compressed = [];
  let header;
  let end = false;
  let offset = 8;
  while (offset < png.length) {
    assert.ok(offset + 12 <= png.length, "PNG chunk header must fit inside the file");
    const length = png.readUInt32BE(offset);
    const type = png.toString("ascii", offset + 4, offset + 8);
    assert.ok(offset + 12 + length <= png.length, "PNG chunk payload must fit inside the file");
    assert.ok(["IHDR", "pHYs", "IDAT", "IEND"].includes(type), "No embedded image metadata");
    const data = png.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      assert.equal(offset, 8);
      assert.equal(length, 13);
      assert.equal(header, undefined);
      header = data;
    }
    if (type === "IDAT") compressed.push(data);
    if (type === "IEND") {
      assert.equal(length, 0);
      assert.equal(offset + 12, png.length);
      end = true;
    }
    offset += 12 + length;
  }
  assert.ok(header && compressed.length && end, "Complete PNG structure is required");
  assert.equal(header.readUInt32BE(0), 192);
  assert.equal(header.readUInt32BE(4), 192);
  assert.deepEqual([...header.subarray(8)], [8, 6, 0, 0, 0], "8-bit RGBA, no interlacing");
  const width = 192;
  const stride = width * 4;
  const expectedLength = (stride + 1) * width;
  const packed = inflateSync(Buffer.concat(compressed), { maxOutputLength: expectedLength });
  assert.equal(packed.length, expectedLength);
  const pixels = Buffer.alloc(stride * width);
  for (let y = 0; y < width; y++) {
    const row = y * (stride + 1);
    const filter = packed[row];
    assert.ok(filter <= 4, "PNG filter must be supported");
    for (let x = 0; x < stride; x++) {
      const left = x >= 4 ? pixels[y * stride + x - 4] : 0;
      const above = y ? pixels[(y - 1) * stride + x] : 0;
      const upperLeft = y && x >= 4 ? pixels[(y - 1) * stride + x - 4] : 0;
      const predictor =
        filter === 1
          ? left
          : filter === 2
            ? above
            : filter === 3
              ? Math.floor((left + above) / 2)
              : filter === 4
                ? paeth(left, above, upperLeft)
                : 0;
      pixels[y * stride + x] = (packed[row + 1 + x] + predictor) & 255;
    }
  }
  return pixels;
}

test("seven original Home symbol pairs remain bounded local vector drawings and PNG exports", () => {
  assert.deepEqual(
    readdirSync(assetRoot)
      .filter((filename) => /\.(?:svg|png)$/.test(filename))
      .sort(),
    names.flatMap((name) => [`${name}.svg`, `${name}.png`]).sort(),
  );
  let aggregateBytes = 0;
  for (const name of names) {
    const source = readLocalAsset(`${name}.svg`);
    const svg = source.toString("utf8");
    const png = readLocalAsset(`${name}.png`);
    assert.ok(source.length < 8_192 && png.length < 12_000);
    aggregateBytes += source.length + png.length;
    assert.match(svg, /<svg\b[^>]*viewBox="0 0 64 64"/);
    assert.match(svg, /<path\b/);
    assert.doesNotMatch(
      svg,
      /<(?:script|image|foreignObject|text|style|animate|set)\b|<!DOCTYPE|<!ENTITY|\b(?:href|xlink:href|onload)\s*=/i,
    );
    for (const [, reference] of svg.matchAll(/url\(([^)]+)\)/g)) {
      assert.match(reference, /^#[a-z][a-z-]*$/, "Only local gradient references are allowed");
      assert.ok(svg.includes(`id="${reference.slice(1)}"`));
    }
  }
  assert.ok(aggregateBytes < 64_000, `Seven source/export pairs total ${aggregateBytes} bytes`);
});

test("native symbol exports are 192-pixel RGBA with transparent corners and visible geometry", () => {
  for (const name of names) {
    const pixels = decodeSymbolPng(`${name}.png`);
    for (const pixel of [0, 191, 191 * 192, 192 * 192 - 1]) {
      assert.equal(pixels[pixel * 4 + 3], 0, `${name} canvas corner must remain transparent`);
    }
    assert.ok(
      pixels.some((value, index) => index % 4 === 3 && value >= 128),
      `${name} must contain visible symbol geometry`,
    );
  }
});

test("recycling symbol retains three separate substantial arrows and an empty center", () => {
  const pixels = decodeSymbolPng("home-recycling.png");
  const size = 192;
  for (let y = 93; y <= 105; y++) {
    for (let x = 90; x <= 102; x++) {
      assert.equal(pixels[(y * size + x) * 4 + 3], 0, "Recycling center must remain open");
    }
  }
  const visited = new Uint8Array(size * size);
  const components = [];
  for (let start = 0; start < visited.length; start++) {
    if (visited[start] || pixels[start * 4 + 3] < 128) continue;
    const pending = [start];
    visited[start] = 1;
    let count = 0;
    while (pending.length) {
      const pixel = pending.pop();
      count++;
      const x = pixel % size;
      const y = Math.floor(pixel / size);
      // Eight-neighbor connectivity includes antialiased diagonal edges.
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (x + dx < 0 || x + dx >= size || y + dy < 0 || y + dy >= size) continue;
          const next = (y + dy) * size + x + dx;
          if (visited[next] || pixels[next * 4 + 3] < 128) continue;
          visited[next] = 1;
          pending.push(next);
        }
      }
    }
    components.push(count);
  }
  assert.equal(components.length, 3, `Expected three separate arrows, got ${components}`);
  assert.ok(
    components.every((count) => count >= 500),
    "Every arrow must remain substantial",
  );
});

test("ReferenceSymbol uses native static assets and remains purely decorative and motionless", () => {
  const source = readFileSync(
    path.join(repositoryRoot, "mobile/app/src/components/reference-symbol.tsx"),
    "utf8",
  );
  assert.match(source, /import \{ Image \} from "react-native"/);
  for (const name of names) {
    assert.ok(source.includes(`require("../../assets/symbols/${name}.png")`));
  }
  assert.equal((source.match(/require\(/g) ?? []).length, 7);
  assert.match(source, /source=\{symbols\[name\]\}/);
  for (const expression of [
    "accessible={false}",
    "aria-hidden",
    "accessibilityElementsHidden",
    'importantForAccessibility="no-hide-descendants"',
    'pointerEvents="none"',
  ]) {
    assert.ok(source.includes(expression));
  }
  assert.doesNotMatch(
    source,
    /fetch\(|https?:|uri:|setInterval|requestAnimationFrame|withRepeat|Animated|onPress|accessibilityRole=/,
  );
});
