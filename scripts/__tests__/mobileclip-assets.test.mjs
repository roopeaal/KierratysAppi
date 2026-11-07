import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  assetUrl,
  parseArguments,
  retrieveAsset,
  validateManifest,
} from "../qa/local-vision/mobileclip-fetch.mjs";

const manifest = () =>
  JSON.parse(
    readFileSync(new URL("../qa/local-vision/mobileclip-assets.json", import.meta.url), "utf8"),
  );

test("MobileCLIP acquisition requires an explicit bounded local action", () => {
  for (const mode of ["--download", "--complete", "--validate"])
    assert.deepEqual(parseArguments([mode, "--run", "work/fresh/assets"]), {
      action: mode,
      directory: "work/fresh/assets",
    });
  for (const args of [
    [],
    ["--download", "work/x"],
    ["--delete", "--run", "work/x"],
    ["--download", "--run", "https://example.com/x"],
    ["--download", "--run", "work/x", "--extra"],
  ])
    assert.throws(() => parseArguments(args));
});

test("model provenance pins original2024 ASCL release, not research-only MobileCLIP2", () => {
  const value = validateManifest(manifest());
  assert.equal(
    value.assets.reduce((sum, item) => sum + item.bytes, 0),
    112_232_614,
  );
  assert.ok(assetUrl(value.assets[0], value).includes("55c8098c12ba8f928e37e26b2e1dd097777c3f98"));
  const licence = value.assets.find((item) => item.origin === "weight-licence");
  assert.ok(
    assetUrl(licence, value).includes(
      "341ef058802f0e4e5ab13c02f0cb32a3a94e367b/LICENSE_weights_data",
    ),
  );
});

test("asset manifest rejects changed revision, budget, duplicate, invalid hash and path traversal", () => {
  for (const mutate of [
    (x) => {
      x.modelRevision = "main";
    },
    (x) => {
      x.maximumTotalBytes = 1_000_000_000;
    },
    (x) => {
      x.assets[1] = x.assets[0];
    },
    (x) => {
      x.assets[0].sha256 = "not-a-hash";
    },
    (x) => {
      x.assets[0].bytes = 90_000_000;
    },
    (x) => {
      x.assets[0].path = "../../.env";
    },
    (x) => {
      x.assets[0].origin = "untrusted";
    },
  ]) {
    const value = manifest();
    mutate(value);
    assert.throws(() => validateManifest(value));
  }
});

test("decoded gzip bytes are bounded even when wire Content-Length is compressed", async () => {
  const bytes = await retrieveAsset(
    "https://raw.githubusercontent.com/pinned/source",
    4,
    async () =>
      new Response("data", { headers: { "content-length": "2", "content-encoding": "gzip" } }),
  );
  assert.equal(bytes.toString(), "data");
});

test("oversized or truncated decoded asset is rejected", async () => {
  await assert.rejects(() =>
    retrieveAsset(
      "https://raw.githubusercontent.com/pinned/source",
      3,
      async () => new Response("data"),
    ),
  );
  await assert.rejects(() =>
    retrieveAsset(
      "https://raw.githubusercontent.com/pinned/source",
      5,
      async () => new Response("data"),
    ),
  );
});

test("unapproved hosts are refused before any fetch", async () => {
  let calls = 0;
  for (const url of [
    "http://raw.githubusercontent.com/file",
    "https://example.com/file",
    "https://user:pass@huggingface.co/file",
    "https://huggingface.co:8443/file",
  ])
    await assert.rejects(() =>
      retrieveAsset(url, 4, async () => {
        calls++;
        return new Response("data");
      }),
    );
  assert.equal(calls, 0);
});

test("an approved source cannot redirect to local HTTP or an arbitrary host", async () => {
  for (const target of ["http://127.0.0.1/private", "https://example.com/private"]) {
    let calls = 0;
    await assert.rejects(() =>
      retrieveAsset("https://huggingface.co/pinned/file", 4, async () => {
        calls++;
        return new Response(null, { status: 302, headers: { location: target } });
      }),
    );
    assert.equal(calls, 1);
  }
});

test("asset redirect budget is finite with no retry loop", async () => {
  let calls = 0;
  await assert.rejects(() =>
    retrieveAsset("https://huggingface.co/pinned/file", 4, async () => {
      calls++;
      return new Response(null, {
        status: 302,
        headers: { location: "https://huggingface.co/again" },
      });
    }),
  );
  assert.equal(calls, 6);
});

test("frozen prompts retain five object kinds and thirteen outside-kind contrasts", () => {
  const p = JSON.parse(
    readFileSync(new URL("../qa/local-vision/mobileclip-prompts.json", import.meta.url), "utf8"),
  );
  assert.equal(p.frozenBeforeImageInference, true);
  assert.deepEqual(
    p.groups.slice(0, 5).map((g) => g.identifier),
    ["bottle", "jar", "box", "bag", "cup"],
  );
  assert.equal(p.groups.length, 18);
  assert.equal(p.groups.filter((g) => g.role === "outside").length, 13);
  assert.ok(p.groups.every((g, i) => g.prompts.length === (i < 5 ? 3 : 1)));
  assert.ok(p.groups.flatMap((g) => g.prompts).every((s) => /^[\x20-\x7e]{1,240}$/u.test(s)));
});

test("QA scoring does not include winner gates, image paths or paid provider integration", () => {
  const source = readFileSync(
    new URL("../qa/local-vision/mobileclip-main.swift", import.meta.url),
    "utf8",
  );
  assert.match(source, /FileHandle\.standardInput/);
  assert.match(source, /isAllowedValue\(value\)/);
  assert.match(source, /pixelFormat: constraint\.pixelFormatType/);
  assert.match(source, /mobileclip-s0-scores-v1/);
  assert.doesNotMatch(
    source,
    /URLSession|URLRequest|OPENAI|api\.openai|winner\s*=|0\.30|0\.25|0\.20/,
  );
});
