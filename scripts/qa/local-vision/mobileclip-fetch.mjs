// Explicit QA asset acquisition; never bundled networking or an inference service.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const manifestPath = fileURLToPath(new URL("./mobileclip-assets.json", import.meta.url));
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const gitOrigin = "https://raw.githubusercontent.com/apple-aiml-research/ml-mobileclip/";
const modelOrigin = "https://huggingface.co/apple/coreml-mobileclip/resolve/";

export function assetUrl(record, manifest) {
  assert.match(record.path, /^[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*$/u);
  assert.ok(!record.path.split("/").some((part) => part === "." || part === ".."));
  const git = `${gitOrigin}${manifest.softwareRevision}/`;
  switch (record.origin) {
    case "model":
      return `${modelOrigin}${manifest.modelRevision}/${record.path}`;
    case "resource":
      return `${git}ios_app/MobileCLIPExplore/Resources/${record.path}`;
    case "weight-licence":
      return `${gitOrigin}341ef058802f0e4e5ab13c02f0cb32a3a94e367b/LICENSE_weights_data`;
    case "software-licence":
      return `${git}LICENSE`;
    case "acknowledgements":
      return `${git}ACKNOWLEDGEMENTS`;
    case "tokenizer-licence":
      return "https://raw.githubusercontent.com/huggingface/swift-coreml-transformers/47cb600b46f89f966907f999556cfd1335b4ad25/LICENSE";
    default:
      throw new Error("invalid_asset_origin");
  }
}

export function validateManifest(input) {
  assert.equal(input.schemaVersion, "mobileclip-assets-v1");
  assert.equal(input.modelId, "apple-mobileclip-s0-coreml-2024");
  assert.equal(input.modelRevision, "55c8098c12ba8f928e37e26b2e1dd097777c3f98");
  assert.equal(input.softwareRevision, "1140b8d197e4ed7d56b3a92216ded98bb1c2ac87");
  assert.equal(input.maximumTotalBytes, 150_000_000);
  assert.ok(Array.isArray(input.assets) && input.assets.length === 12);
  const names = new Set();
  let total = 0;
  for (const record of input.assets) {
    assert.ok(!names.has(record.path), "duplicate_asset");
    names.add(record.path);
    assert.match(record.sha256, /^[a-f0-9]{64}$/u);
    assert.ok(Number.isInteger(record.bytes) && record.bytes > 0 && record.bytes < 90_000_000);
    total += record.bytes;
    assetUrl(record, input);
  }
  assert.ok(total < input.maximumTotalBytes, "asset_budget_exceeded");
  return input;
}

export function parseArguments(args) {
  assert.ok(
    args.length === 3 &&
      ["--download", "--complete", "--validate"].includes(args[0]) &&
      args[1] === "--run",
    "explicit_action_required",
  );
  assert.ok(args[2] && !/^[a-z]+:/iu.test(args[2]), "local_directory_required");
  return { action: args[0], directory: args[2] };
}

function checkedDirectory(cwd, value, create) {
  const work = fs.realpathSync(path.join(cwd, "work"));
  const absolute = path.resolve(cwd, value);
  const parent = fs.realpathSync(path.dirname(absolute));
  assert.ok(parent === work || parent.startsWith(`${work}${path.sep}`), "outside_work");
  if (create) {
    assert.equal(fs.existsSync(absolute), false, "refuse_overwrite");
    fs.mkdirSync(absolute);
  }
  const stat = fs.lstatSync(absolute);
  assert.ok(stat.isDirectory() && !stat.isSymbolicLink(), "invalid_asset_directory");
  const canonical = fs.realpathSync(absolute);
  assert.equal(canonical, absolute, "directory_link_not_allowed");
  return canonical;
}

function checkedBytes(directory, record) {
  const file = path.join(directory, record.path);
  assert.equal(fs.realpathSync(file), file, "asset_link_not_allowed");
  const descriptor = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const info = fs.fstatSync(descriptor);
    assert.ok(info.isFile() && info.size === record.bytes, "asset_size_changed");
    const data = fs.readFileSync(descriptor);
    assert.equal(digest(data), record.sha256, "asset_hash_changed");
  } finally {
    fs.closeSync(descriptor);
  }
}

export async function retrieveAsset(initial, expectedBytes, fetchImpl) {
  assert.ok(Number.isInteger(expectedBytes) && expectedBytes > 0 && expectedBytes < 90_000_000);
  let next = new URL(initial);
  for (let redirects = 0; redirects <= 5; redirects++) {
    assert.equal(next.protocol, "https:");
    assert.ok(!next.username && !next.password && !next.port, "invalid_redirect");
    assert.ok(
      [
        "huggingface.co",
        "raw.githubusercontent.com",
        "cdn-lfs.huggingface.co",
        "cdn-lfs-us-1.huggingface.co",
        "cas-bridge.xethub.hf.co",
        "us.aws.cdn.hf.co",
      ].includes(next.hostname),
      "invalid_redirect_host",
    );
    const response = await fetchImpl(next, {
      redirect: "manual",
      signal: AbortSignal.timeout(120_000),
      headers: {
        "User-Agent":
          "KierratysAppi-bounded-local-QA/0.1 (https://github.com/roopeaal/KierratysAppi)",
      },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      assert.ok(location && redirects < 5, "redirect_limit");
      next = new URL(location, next);
      continue;
    }
    assert.ok(response.ok && response.body, "asset_fetch_failed");
    const length = response.headers.get("content-length");
    // Fetch decodes gzip, but Content-Length describes compressed wire bytes.
    if (length && !response.headers.get("content-encoding"))
      assert.equal(Number(length), expectedBytes, "asset_length_changed");
    const chunks = [];
    let count = 0;
    for await (const chunk of response.body) {
      count += chunk.byteLength;
      assert.ok(count <= expectedBytes, "asset_too_large");
      chunks.push(chunk);
    }
    assert.equal(count, expectedBytes, "asset_size_changed");
    return Buffer.concat(chunks);
  }
  throw new Error("redirect_limit");
}

export async function run(options, cwd = process.cwd(), fetchImpl = fetch) {
  assert.ok(
    ["--download", "--complete", "--validate"].includes(options.action),
    "explicit_action_required",
  );
  const raw = fs.readFileSync(manifestPath);
  const manifest = validateManifest(JSON.parse(raw));
  const download = options.action === "--download";
  const complete = options.action === "--complete";
  const directory = checkedDirectory(cwd, options.directory, download);
  const receipt = {
    schemaVersion: "mobileclip-asset-receipt-v1",
    manifestSha256: digest(raw),
    modelId: manifest.modelId,
    modelRevision: manifest.modelRevision,
    startedAt: new Date().toISOString(),
    assets: [],
  };
  if (download)
    fs.writeFileSync(path.join(directory, "started.json"), JSON.stringify(receipt, null, 2), {
      flag: "wx",
    });
  if (complete) {
    const marker = path.join(directory, "started.json");
    assert.equal(fs.realpathSync(marker), marker, "linked_marker");
    const descriptor = fs.openSync(marker, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
    let previous;
    try {
      const info = fs.fstatSync(descriptor);
      assert.ok(info.isFile() && info.size > 0 && info.size <= 65_536, "invalid_marker");
      previous = JSON.parse(fs.readFileSync(descriptor, "utf8"));
    } finally {
      fs.closeSync(descriptor);
    }
    assert.equal(previous.manifestSha256, receipt.manifestSha256, "partial_manifest_changed");
    assert.equal(fs.existsSync(path.join(directory, "receipt.json")), false, "already_complete");
  }
  for (const record of manifest.assets) {
    if (download || (complete && !fs.existsSync(path.join(directory, record.path)))) {
      const bytes = await retrieveAsset(assetUrl(record, manifest), record.bytes, fetchImpl);
      assert.equal(digest(bytes), record.sha256, "asset_hash_changed");
      const target = path.join(directory, record.path);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, bytes, { flag: "wx" });
    }
    checkedBytes(directory, record);
    receipt.assets.push({ path: record.path, bytes: record.bytes, sha256: record.sha256 });
  }
  assert.equal(digest(fs.readFileSync(manifestPath)), receipt.manifestSha256, "manifest_changed");
  receipt.completedAt = new Date().toISOString();
  receipt.totalBytes = manifest.assets.reduce((sum, item) => sum + item.bytes, 0);
  if (download || complete)
    fs.writeFileSync(path.join(directory, "receipt.json"), JSON.stringify(receipt, null, 2), {
      flag: "wx",
    });
  return receipt;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    console.log(JSON.stringify(await run(parseArguments(process.argv.slice(2))), null, 2));
  } catch {
    console.error("mobileclip_asset_check_failed; no retries or overwrite performed");
    process.exitCode = 1;
  }
}
