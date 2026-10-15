// Explicit opt-in live smoke. Public licensed photos only; no device or service secret access.
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const manifest = require("./photo-product-cases.json");

const maxRequests = 8;
const intervalMs = 25_000;
const apiOrigin = "http://127.0.0.1:3003";
const userAgent =
  "KierratysAppi/0.1.0 (school-scoped photo evaluation; https://github.com/roopeaal/KierratysAppi)";
const digest = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");

function checkCases(cases) {
  assert.ok(cases.length > 0 && cases.length <= maxRequests);
  assert.equal(new Set(cases.map((item) => item.id)).size, cases.length);
  for (const item of cases) {
    assert.match(item.id, /^[a-z]+(?:-[a-z]+)*$/u);
    const url = new URL(item.imageUrl);
    assert.equal(url.origin, "https://images.openfoodfacts.org");
    assert.match(url.pathname, /^\/images\/products\/(?:\d+\/)+front_[a-z]+\.\d+\.400\.jpg$/u);
    assert.ok(item.expectedProduct && item.uploader && item.identityTerms.length);
  }
}

function requestBody(bytes) {
  assert.ok(bytes.length > 4 && bytes.length <= 1_500_000);
  assert.equal(bytes.readUInt16BE(0), 0xffd8);
  assert.equal(bytes.readUInt16BE(bytes.length - 2), 0xffd9);
  return { jpegBase64: bytes.toString("base64"), language: "fi", consentVersion: "photo-ai-v1" };
}

function assessLabels(item, result) {
  if (result.status !== "estimated")
    return { productFamilyMentioned: false, categoryMentioned: false };
  assert.equal(result.source.verificationStatus, "inferred");
  assert.equal(result.source.model, "gpt-4.1-mini-2025-04-14");
  const text = `${result.observation.label.fi} ${result.observation.label.en}`.toLocaleLowerCase();
  return {
    productFamilyMentioned: item.identityTerms.every((group) =>
      group.some((term) => text.includes(term)),
    ),
    categoryMentioned: item.categoryTerms.some((term) => text.includes(term)),
  };
}

function checkLiveArgs(args) {
  assert.deepEqual(args, ["--live"], "Live requests require exactly --live; no implicit retry.");
}

async function evidenceDirectory(input) {
  const work = await fs.realpath(path.resolve("work"));
  const directory = path.resolve(input);
  assert.equal(path.dirname(directory), work);
  assert.match(path.basename(directory), /^photo-products-2026-10-15\.[a-zA-Z0-9]+$/u);
  assert.equal(await fs.realpath(directory), directory);
  return directory;
}

async function boundedBody(response, limit, allowError = false) {
  assert.ok((allowError || response.ok) && response.body, `HTTP ${response.status}`);
  assert.ok(Number(response.headers.get("content-length") ?? 0) <= limit);
  const reader = response.body.getReader();
  let size = 0;
  const chunks = [];
  try {
    while (true) {
      const item = await reader.read();
      if (item.done) break;
      size += item.value.length;
      assert.ok(size <= limit, "Body exceeds test bound");
      chunks.push(Buffer.from(item.value));
    }
    return Buffer.concat(chunks);
  } finally {
    await reader.cancel();
  }
}

async function prepare(directory) {
  checkCases(manifest.cases);
  const fixtures = [];
  for (const item of manifest.cases) {
    const response = await fetch(item.imageUrl, {
      headers: { "User-Agent": userAgent },
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
    });
    assert.match(response.headers.get("content-type") ?? "", /^image\/jpeg/u);
    const bytes = await boundedBody(response, 1_500_000);
    requestBody(bytes);
    await fs.writeFile(path.join(directory, `${item.id}.jpg`), bytes, { flag: "wx" });
    fixtures.push({ id: item.id, sha256: digest(bytes), bytes: bytes.length });
    console.log(JSON.stringify({ prepared: item.id, bytes: bytes.length }));
  }
  await fs.writeFile(
    path.join(directory, "fixtures.json"),
    JSON.stringify(
      { version: manifest.version, preparedAt: new Date().toISOString(), fixtures },
      null,
      2,
    ),
    { flag: "wx" },
  );
}

async function run(directory, args) {
  checkLiveArgs(args);
  checkCases(manifest.cases);
  const fixtures = JSON.parse(await fs.readFile(path.join(directory, "fixtures.json"), "utf8"));
  assert.equal(fixtures.version, manifest.version);
  const requests = [];
  for (const item of manifest.cases) {
    const bytes = await fs.readFile(path.join(directory, `${item.id}.jpg`));
    assert.equal(
      digest(bytes),
      fixtures.fixtures.find((fixture) => fixture.id === item.id)?.sha256,
    );
    requests.push({ item, body: requestBody(bytes) });
  }
  const capability = await fetch(`${apiOrigin}/v1/recycling/photo-capabilities`, {
    signal: AbortSignal.timeout(5_000),
  });
  assert.deepEqual(await capability.json(), { enabled: true, consentVersion: "photo-ai-v1" });
  // A failed/partial run is not automatically resumed or retried; it needs a new explicit decision.
  await fs.writeFile(
    path.join(directory, "live-started.json"),
    JSON.stringify({
      startedAt: new Date().toISOString(),
      maxRequests,
      apiOrigin,
      version: manifest.version,
      manifestSha256: digest(Buffer.from(JSON.stringify(manifest))),
    }),
    { flag: "wx" },
  );
  for (const [index, { item, body }] of requests.entries()) {
    if (index) await new Promise((resolve) => setTimeout(resolve, intervalMs));
    await fs.writeFile(
      path.join(directory, `attempt-${item.id}.json`),
      JSON.stringify({
        id: item.id,
        startedAt: new Date().toISOString(),
        ordinal: index + 1,
      }),
      { flag: "wx" },
    );
    const started = performance.now();
    const response = await fetch(`${apiOrigin}/v1/recycling/photo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      redirect: "error",
      signal: AbortSignal.timeout(22_000),
      body: JSON.stringify(body),
    });
    const result = JSON.parse((await boundedBody(response, 65_536, true)).toString("utf8"));
    const summary = {
      id: item.id,
      http: response.status,
      durationMs: Math.round(performance.now() - started),
      ...assessLabels(item, result),
      result,
    };
    await fs.writeFile(
      path.join(directory, `result-${item.id}.json`),
      JSON.stringify(summary, null, 2),
      { flag: "wx" },
    );
    console.log(JSON.stringify(summary));
    assert.equal(result.status, "estimated", "Stop on unavailable response, without retry.");
  }
}

if (require.main === module) {
  (async () => {
    const [command, input, ...args] = process.argv.slice(2);
    assert.ok(command === "prepare" || command === "run");
    const directory = await evidenceDirectory(input);
    if (command === "prepare") {
      assert.equal(args.length, 0);
      await prepare(directory);
    } else await run(directory, args);
  })().catch(() => {
    console.error("Photo evaluation stopped without retry; no private error details logged.");
    process.exitCode = 1;
  });
}

module.exports = { assessLabels, checkCases, checkLiveArgs, requestBody };
