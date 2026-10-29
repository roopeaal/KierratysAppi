import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstat, readFile, realpath, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Build-time vector compilation only: no runtime dependency, network or image editing.
const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = await realpath(path.join(scriptRoot, ".."));
const assetRoot = path.join(repositoryRoot, "mobile/app/assets/symbols");
assert.equal(await realpath(assetRoot), assetRoot, "The symbol directory must not be a symlink");
const names = [
  "home-camera",
  "home-location",
  "home-recycling",
  "tab-home",
  "tab-location",
  "tab-scan",
  "tab-settings",
];
const modulePath = process.env.SHARP_MODULE_PATH;
assert.ok(modulePath && path.isAbsolute(modulePath), "Set SHARP_MODULE_PATH to installed sharp");
const require = createRequire(import.meta.url);
const sharp = require(modulePath);
const check = process.argv.slice(2);
assert.ok(
  check.length === 0 || (check.length === 1 && check[0] === "--check"),
  "Use --check or no arguments",
);

for (const name of names) {
  assert.match(name, /^[a-z]+(?:-[a-z]+)+$/);
  const svgPath = path.join(assetRoot, `${name}.svg`);
  const pngPath = path.join(assetRoot, `${name}.png`);
  assert.equal(path.dirname(svgPath), assetRoot);
  assert.equal(path.dirname(pngPath), assetRoot);
  const svgStat = await lstat(svgPath);
  assert.ok(svgStat.isFile() && !svgStat.isSymbolicLink(), "SVG input must be a regular file");
  const pngStat = await lstat(pngPath).catch((error) => {
    if (error.code === "ENOENT") return null;
    throw error;
  });
  assert.ok(
    !pngStat || (pngStat.isFile() && !pngStat.isSymbolicLink()),
    "PNG output must be a regular file",
  );
  const svg = await readFile(svgPath, "utf8");
  assert.ok(Buffer.byteLength(svg) < 8_192, "Bound SVG input size");
  assert.match(svg, /viewBox="0 0 64 64"/);
  assert.doesNotMatch(
    svg,
    /<(?:script|image|foreignObject|text)\b|(?:href|url)\s*=|url\((?!#[a-z-]+\))/i,
  );
  const png = await sharp(Buffer.from(svg), { density: 216 })
    .resize(192, 192)
    .ensureAlpha()
    .png({ compressionLevel: 9, adaptiveFiltering: false, palette: false })
    .toBuffer();
  const metadata = await sharp(png).metadata();
  assert.equal(metadata.width, 192);
  assert.equal(metadata.height, 192);
  assert.equal(metadata.channels, 4);
  assert.equal(metadata.hasAlpha, true);
  const { data } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  assert.equal(data[3], 0, "Canvas corner must remain transparent");
  assert.ok(
    data.some((value, index) => index % 4 === 3 && value > 0),
    "Symbol must have visible pixels",
  );
  if (check[0] === "--check") {
    assert.deepEqual(await readFile(pngPath), png, `${name} PNG must match its SVG source`);
  } else {
    await writeFile(pngPath, png, { flag: pngStat ? "w" : "wx" });
  }
  process.stdout.write(
    `${check[0] === "--check" ? "PASS" : "RENDERED"} ${name}: 192x192 RGBA ${png.length} bytes sha256=${createHash("sha256").update(png).digest("hex")}\n`,
  );
}
