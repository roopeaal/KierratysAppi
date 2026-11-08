import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import {
  coverage,
  validateCase,
  validateManifest,
  validateSpecification,
} from "../qa/local-vision/spatial-data-corpus.mjs";

const read = (name) =>
  fs.readFileSync(new URL(`../qa/local-vision/${name}`, import.meta.url), "utf8");
const manifest = JSON.parse(read("spatial-data-manifest.json"));
const spec = JSON.parse(read("spatial-data-cases.json"));
const prior = JSON.parse(read("spatial-data-prior.json"));
const copy = () => structuredClone(manifest);

test("spatial manifest freezes20 human-review-required references without inference or training", () => {
  assert.equal(validateManifest(copy()).fixtures.length, 20);
  assert.deepEqual(coverage(manifest.fixtures), {
    bottle: 2,
    jar: 2,
    box: 2,
    bag: 2,
    cup: 2,
    unknown: 10,
  });
  assert.equal(manifest.fixtures.filter((r) => r.challenge === "mixed").length, 5);
  assert.equal(validateSpecification(structuredClone(spec)).cases.length, 29);
});
test("manifest ties exact review/prior bytes to the freeze and retains all48 previous candidates", () => {
  for (const [file, key] of [
    ["spatial-data-review.json", "reviewSha256"],
    ["spatial-data-prior.json", "priorManifestSha256"],
  ])
    assert.equal(createHash("sha256").update(read(file)).digest("hex"), manifest[key]);
  assert.equal(
    prior.fixtures.filter(
      (r) =>
        r.sourceManifest ===
        "work/robustness-corpus-2026-11-07.93wuSo/all-candidates/fixtures.json",
    ).length,
    48,
  );
});
for (const [name, edit] of [
  [
    "fabricated human labels",
    (m) => {
      m.labelReviewStatus = "human_verified";
    },
  ],
  [
    "known pretraining membership",
    (m) => {
      m.pretrainingMembership = "not_seen";
    },
  ],
  [
    "training disguised as frozen data",
    (m) => {
      m.trainingExecuted = true;
    },
  ],
  [
    "missing review",
    (m) => {
      m.reviewSha256 = "0".repeat(64);
    },
  ],
  [
    "changed prior",
    (m) => {
      m.priorManifestSha256 = "0".repeat(64);
    },
  ],
  [
    "insufficient cases",
    (m) => {
      m.fixtures.pop();
    },
  ],
  [
    "false acquisition count",
    (m) => {
      m.acquisitionBudget.newImagesDownloaded = 19;
    },
  ],
  [
    "unbounded acquisition",
    (m) => {
      m.acquisitionBudget.newImagesDownloaded = 41;
    },
  ],
  [
    "fractional acquisition",
    (m) => {
      m.acquisitionBudget.newImagesDownloaded = 29.5;
    },
  ],
  [
    "hidden download bytes",
    (m) => {
      m.acquisitionBudget.newBytesDownloaded = 1;
    },
  ],
  [
    "unbounded bytes",
    (m) => {
      m.acquisitionBudget.newBytesDownloaded = 25000001;
    },
  ],
  [
    "invalid freeze date",
    (m) => {
      m.frozenAt = "unknown";
    },
  ],
  [
    "invalid candidate hash",
    (m) => {
      m.candidateManifestSha256 = "unknown";
    },
  ],
  [
    "invented label",
    (m) => {
      m.fixtures[0].expectedKind = "plastic";
    },
  ],
  [
    "post-review wording",
    (m) => {
      m.fixtures[0].reviewNote = "changed";
    },
  ],
  [
    "new privacy status",
    (m) => {
      m.fixtures[0].privacyReview = "not_checked";
    },
  ],
  [
    "untraceable credit",
    (m) => {
      m.fixtures[0].credit = "";
    },
  ],
  [
    "licence substitution",
    (m) => {
      m.fixtures[0].license = "MIT";
    },
  ],
  [
    "credential URL",
    (m) => {
      m.fixtures[0].pageUrl = "https://name:pass@commons.wikimedia.org/wiki/File:x.jpg";
    },
  ],
  [
    "foreign source",
    (m) => {
      m.fixtures[0].pageUrl = "https://example.com/wiki/File:x.jpg";
    },
  ],
  [
    "foreign image origin",
    (m) => {
      m.fixtures[0].downloadUrl = "https://example.com/x.jpg";
    },
  ],
  [
    "seen diagnostic",
    (m) => {
      m.fixtures[0].seenDiagnostic = true;
    },
  ],
  [
    "duplicate object group",
    (m) => {
      m.fixtures[1].group = m.fixtures[0].group;
    },
  ],
  [
    "duplicate source family",
    (m) => {
      m.fixtures[1].sourceFamily = m.fixtures[0].sourceFamily;
    },
  ],
  [
    "prior publisher series",
    (m) => {
      m.fixtures[0].author = "Meanwell Packaging";
    },
  ],
])
  test(`rejects ${name}`, () => {
    const value = copy();
    edit(value);
    assert.throws(() => validateManifest(value));
  });

test("prior source, byte hash and original-source hash cannot become a fresh reference", () => {
  const old = prior.fixtures.find((r) => r.title && r.sha256 && r.sourceSha1);
  assert.ok(old);
  assert.throws(() => validateCase({ ...spec.cases[0], title: old.title }));
  for (const key of ["sha256", "sourceSha1"]) {
    const value = copy();
    value.fixtures[0][key] = old[key];
    assert.throws(() => validateManifest(value));
  }
});
test("acquisition/review source stays bounded, no-follow, no overwrite and classifier-free", () => {
  const source = read("spatial-data-corpus.mjs");
  for (const token of ["25_000_000", "1_500_000", "O_NOFOLLOW", 'flag: "wx"', "isSymbolicLink()"]) {
    assert.ok(source.includes(token), token);
  }
  assert.doesNotMatch(
    source,
    /spawnSync|execFile|recognizeLocalPhoto|MLModel|prediction\(|OPENAI|process\.env/,
  );
});
