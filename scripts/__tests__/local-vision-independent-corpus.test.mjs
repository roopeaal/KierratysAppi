import assert from "node:assert/strict";
import {
  existsSync,
  lstatSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmdirSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  checkedImageUrl,
  fetchImage,
  parseArguments,
  readCorpusJson,
  validateFrozenManifest,
  validateReview,
  validateSpecification,
} from "../qa/local-vision/independent-corpus.mjs";

const specification = JSON.parse(
  readFileSync(new URL("../qa/local-vision/independent-cases.json", import.meta.url), "utf8"),
);
const clone = (value) => structuredClone(value);

function temporaryFiles(t, names) {
  const directory = realpathSync(mkdtempSync(path.join(tmpdir(), "kig-corpus-json-test-")));
  t.after(() => {
    for (const name of names) {
      const file = path.join(directory, name);
      if (!existsSync(file)) continue;
      const info = lstatSync(file);
      assert.ok(info.isFile() || info.isSymbolicLink());
      unlinkSync(file); // Exact test-owned file/link only; never follow/recurse.
    }
    rmdirSync(directory);
  });
  return directory;
}

test("local manifest reader rejects symlinks before reading or parsing", (t) => {
  const directory = temporaryFiles(t, ["linked.json", "target.json"]);
  const target = path.join(directory, "target.json");
  writeFileSync(target, '{"publicSchemaFixture":true}', { flag: "wx" });
  const link = path.join(directory, "linked.json");
  symlinkSync(target, link);
  assert.throws(() => readCorpusJson(link), /linked_or_nonfile_manifest/u);
  assert.deepEqual(readCorpusJson(target).value, { publicSchemaFixture: true });
});

test("local manifest reader bounds bytes and never prints malformed contents", (t) => {
  const directory = temporaryFiles(t, ["oversized.json", "invalid.json"]);
  const large = path.join(directory, "oversized.json");
  writeFileSync(large, " ".repeat(65_537), { flag: "wx" });
  assert.throws(() => readCorpusJson(large), /manifest_too_large/u);
  const invalid = path.join(directory, "invalid.json");
  writeFileSync(invalid, "not-json-fixture-content", { flag: "wx" });
  assert.throws(
    () => readCorpusJson(invalid),
    (error) => error.message === "invalid_manifest_json",
  );
});
const frozen = () => ({
  schemaVersion: "independent-corpus-v1",
  purpose: "A test of schema validation, not a real image-quality result.",
  trainingIncluded: false,
  pretrainingMembership: "unknown",
  labelReviewStatus: "ai_reviewed_human_review_required",
  frozenAt: "2026-11-06T10:00:00Z",
  specificationSha256: "a".repeat(64),
  fixtures: [
    {
      ...specification.cases[0],
      author: "Test schema credit",
      pageUrl: "https://commons.wikimedia.org/wiki/File:Empty_Plastic_Bottle.jpg",
      downloadUrl: "https://upload.wikimedia.org/wikipedia/commons/5/55/Empty_Plastic_Bottle.jpg",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      sourceSha1: "a".repeat(40),
      sourceTimestamp: "2025-11-27T14:21:14Z",
      changes: "Schema fixture only; not a downloaded or scorable photograph.",
      labelReviewStatus: "ai_reviewed_human_review_required",
      bytes: 100,
      sha256: "b".repeat(64),
    },
  ],
});

test("independent case specification is bounded, licence-traced and not training/human acceptance", () => {
  assert.equal(validateSpecification(specification), specification);
  assert.equal(specification.cases.length, 12);
  assert.equal(specification.cases.filter((record) => record.split === "validation").length, 5);
  assert.equal(specification.cases.filter((record) => record.split === "heldout").length, 7);
});

for (const [name, mutate] of [
  [
    "missing IDs",
    (value) => {
      delete value.cases[0].id;
    },
  ],
  [
    "path IDs",
    (value) => {
      value.cases[0].id = "../other";
    },
  ],
  [
    "duplicate IDs",
    (value) => {
      value.cases[1].id = value.cases[0].id;
    },
  ],
  [
    "duplicate source files",
    (value) => {
      value.cases[1].title = value.cases[0].title;
    },
  ],
  [
    "group leakage",
    (value) => {
      value.cases[1].group = value.cases[0].group;
    },
  ],
  [
    "training split",
    (value) => {
      value.cases[0].split = "train";
    },
  ],
  [
    "unknown rights",
    (value) => {
      value.cases[0].license = "found-online";
    },
  ],
  [
    "invented material class",
    (value) => {
      value.cases[0].expectedKind = "verified-plastic";
    },
  ],
  [
    "invented human review",
    (value) => {
      value.labelReviewStatus = "human_accepted";
    },
  ],
  [
    "unsafe source title",
    (value) => {
      value.cases[0].title = "File:one.jpg|File:two.jpg";
    },
  ],
])
  test(`independent specification rejects ${name}`, () => {
    const value = clone(specification);
    mutate(value);
    assert.throws(() => validateSpecification(value));
  });

test("frozen manifest retains checksums, source and pending review without inferring material", () => {
  const value = frozen();
  assert.equal(validateFrozenManifest(value), value);
  assert.throws(
    () => validateFrozenManifest(value, [value.fixtures[0].sha256]),
    /historical_image_not_independent/u,
  );
  value.fixtures[0].sha256 = "56d48570eeac647c4eef1bf4497c926df7e9984a729b58ae01f7ed04cc47f28e";
  assert.throws(() => validateFrozenManifest(value), /historical_image_not_independent/u);
});

for (const [name, mutate] of [
  [
    "bad hash",
    (record) => {
      record.sha256 = "not-a-hash";
    },
  ],
  [
    "oversized bytes",
    (record) => {
      record.bytes = 1_500_001;
    },
  ],
  [
    "missing credit",
    (record) => {
      record.author = "";
    },
  ],
  [
    "mismatched licence URL",
    (record) => {
      record.licenseUrl = "https://example.invalid/";
    },
  ],
  [
    "wrong source page",
    (record) => {
      record.pageUrl = "https://commons.wikimedia.org/wiki/File:Other.jpg";
    },
  ],
])
  test(`frozen manifest rejects ${name}`, () => {
    const value = frozen();
    mutate(value.fixtures[0]);
    assert.throws(() => validateFrozenManifest(value));
  });

test("frozen manifest rejects duplicated image bytes despite different IDs/source/groups", () => {
  const value = frozen();
  value.fixtures.push({
    ...value.fixtures[0],
    id: "second-bottle",
    group: "second-object",
    title: "File:Other.jpg",
    pageUrl: "https://commons.wikimedia.org/wiki/File:Other.jpg",
  });
  assert.throws(() => validateFrozenManifest(value), /duplicate_image_bytes/u);
});

test("image fetch is limited to credential-free Wikimedia JPEG URLs, not arbitrary endpoints", () => {
  assert.equal(checkedImageUrl(frozen().fixtures[0].downloadUrl).hostname, "upload.wikimedia.org");
  for (const url of [
    "http://upload.wikimedia.org/wikipedia/commons/image.jpg",
    "https://example.invalid/wikipedia/commons/image.jpg",
    "https://upload.wikimedia.org.evil.invalid/wikipedia/commons/image.jpg",
    "https://person:secret@upload.wikimedia.org/wikipedia/commons/image.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/image.jpg?token=secret",
    "https://upload.wikimedia.org/wikipedia/commons/image.svg",
    "https://upload.wikimedia.org/wikipedia/commons/%2e%2e/image.jpg",
    "file:///private/image.jpg",
  ])
    assert.throws(() => checkedImageUrl(url));
});

test("network diagnostics fail closed on redirects, MIME, size and malformed JPEG with no retry", async () => {
  const url = frozen().fixtures[0].downloadUrl;
  let calls = 0;
  for (const response of [
    new Response("bad", { status: 302, headers: { "content-type": "image/jpeg" } }),
    new Response("bad", { headers: { "content-type": "text/html" } }),
    new Response("bad", { headers: { "content-type": "image/jpeg", "content-length": "1500001" } }),
    new Response("not-a-jpeg-actually", { headers: { "content-type": "image/jpeg" } }),
  ])
    await assert.rejects(
      fetchImage(url, async (_url, options) => {
        calls++;
        assert.equal(options.redirect, "error");
        return response;
      }),
    );
  assert.equal(calls, 4);
});

test("visual review accounts for every candidate exactly once, including pre-inference exclusions", () => {
  const candidate = { fixtures: specification.cases };
  const review = JSON.parse(
    readFileSync(new URL("../qa/local-vision/independent-review.json", import.meta.url), "utf8"),
  );
  assert.equal(validateReview(review, candidate), review);
  assert.equal(review.eligibleIds.length, 9);
  assert.equal(review.excluded.length, 3);
  assert.equal(review.eligibleIds.includes("bottle-empty"), false);
  const duplicate = clone(review);
  duplicate.eligibleIds.push(duplicate.excluded[0].id);
  assert.throws(() => validateReview(duplicate, candidate), /duplicate_review_disposition/u);
  const incomplete = clone(review);
  incomplete.excluded.pop();
  assert.throws(() => validateReview(incomplete, candidate), /incomplete_review/u);
});

test("corpus tooling requires explicit download/review/validation and local paths", () => {
  assert.deepEqual(parseArguments(["--validate", "work/corpus"]), {
    action: "--validate",
    directory: "work/corpus",
  });
  assert.deepEqual(parseArguments(["--review", "work/source", "work/reviewed"]), {
    action: "--review",
    directory: "work/source",
    output: "work/reviewed",
  });
  for (const args of [
    [],
    ["--run"],
    ["--download", "https://example.invalid"],
    ["--review", "work/source", "file:///private"],
    ["--download", "work/source", "extra"],
  ])
    assert.throws(() => parseArguments(args));
});
