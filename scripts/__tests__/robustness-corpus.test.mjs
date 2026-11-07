import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import {
  coverage,
  validateCase,
  validateLocal,
  validateManifest,
  validateSpecification,
} from "../qa/local-vision/robustness-corpus.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const read = (name) =>
  JSON.parse(fs.readFileSync(path.join(root, "scripts/qa/local-vision", name)));
const clone = (value) => structuredClone(value);
const manifest = read("robustness-manifest.json");
const specification = read("robustness-cases.json");
const supplement = read("robustness-supplement-cases.json");
const review = read("robustness-review.json");
const prior = read("robustness-prior.json");

test("fresh corpus is exactly32 balanced references without training or prediction", () => {
  assert.equal(validateManifest(manifest), manifest);
  for (const split of ["validation", "heldout"]) {
    assert.deepEqual(coverage(manifest.fixtures)[split], {
      bottle: 2,
      jar: 2,
      box: 2,
      bag: 2,
      cup: 2,
      unknown: 6,
    });
  }
  assert.equal(manifest.trainingExecuted, false);
  assert.equal(manifest.inferenceExecuted, false);
  assert.equal(manifest.pretrainingMembership, "unknown");
  assert.match(manifest.limitations, /human review/u);
});

test("all48 actual candidates have a pre-inference review and16 explicit exclusions", () => {
  validateSpecification(specification);
  validateSpecification(supplement);
  const ids = [...specification.cases, ...supplement.cases].map((r) => r.id).sort();
  assert.equal(ids.length, 48);
  assert.deepEqual(review.cases.map((r) => r.id).sort(), ids);
  assert.equal(review.cases.filter((r) => r.eligible).length, 32);
  assert.equal(review.cases.filter((r) => !r.eligible).length, 16);
  assert.equal(review.reviewedBeforeInference, true);
  assert.match(review.cases.find((r) => r.id === "bottle-cacaolat").reason, /Privacy exclusion/u);
  assert.match(review.cases.find((r) => r.id === "box-bulbs").reason, /shipping label/u);
});

test("all46 historic candidates including excluded images are on the freshness denylist", () => {
  assert.equal(prior.fixtures.length, 46);
  assert.equal(new Set(prior.fixtures.map((r) => r.sha256)).size, 46);
  for (const r of manifest.fixtures) {
    assert.ok(
      !prior.fixtures.some(
        (p) => p.sha256 === r.sha256 || p.title === r.title || p.sourceSha1 === r.sourceSha1,
      ),
    );
    assert.equal(r.seenDiagnostic, false);
  }
});

for (const [name, mutate, reason] of [
  [
    "train split",
    (s) => {
      s.cases[0].split = "train";
    },
    /invalid_split/u,
  ],
  [
    "unsupported form",
    (s) => {
      s.cases[0].expectedKind = "aerosol";
    },
    /unsupported_kind/u,
  ],
  [
    "unsupported licence",
    (s) => {
      s.cases[0].license = "CC-BY-SA-4.0";
    },
    /unsupported_licence/u,
  ],
  [
    "excess download count",
    (s) => {
      s.maximumNewImages = 61;
    },
    /60/u,
  ],
  [
    "excess byte budget",
    (s) => {
      s.maximumNewBytes = 35000001;
    },
    /35000000/u,
  ],
  [
    "duplicate id",
    (s) => {
      s.cases[1].id = s.cases[0].id;
    },
    /duplicate_id/u,
  ],
  [
    "duplicate source",
    (s) => {
      s.cases[1].title = s.cases[0].title;
    },
    /duplicate_source/u,
  ],
  [
    "duplicate object group",
    (s) => {
      s.cases[1].group = s.cases[0].group;
    },
    /duplicate_object_group/u,
  ],
  [
    "source-family split leakage",
    (s) => {
      s.cases[0].sourceFamily = "one-family";
      s.cases[1].sourceFamily = "one-family";
    },
    /source_family_split_leakage/u,
  ],
  [
    "prior exact source",
    (s) => {
      s.cases[0].title = prior.fixtures.find((r) => r.title).title;
    },
    /prior_source_or_group/u,
  ],
  [
    "prior source-family variant",
    (s) => {
      s.cases[0].title = "File:WcDonalds bag - 99.jpg";
    },
    /prior_source_family/u,
  ],
  [
    "material truth",
    (s) => {
      s.cases[0].requiresNoSortingTruth = false;
    },
    /sorting_truth_forbidden/u,
  ],
  [
    "untrusted title path",
    (s) => {
      s.cases[0].title = "File:../../secret.jpg";
    },
    /invalid_title/u,
  ],
  [
    "untrusted image id path",
    (s) => {
      s.cases[0].id = "../secret";
    },
    /invalid_id/u,
  ],
]) {
  test(`specification rejects ${name}`, () => {
    const input = clone(specification);
    mutate(input);
    assert.throws(() => validateSpecification(input), reason);
  });
}

for (const [name, mutate, reason] of [
  [
    "seen result relabelled fresh",
    (m) => {
      m.fixtures[0].seenDiagnostic = true;
    },
    /seen_data_forbidden/u,
  ],
  [
    "material claim",
    (m) => {
      m.fixtures[0].requiresNoSortingTruth = false;
    },
    /sorting_truth_forbidden/u,
  ],
  [
    "reference kind tamper",
    (m) => {
      m.fixtures[0].expectedKind = "jar";
    },
    /fixture_reference_changed/u,
  ],
  [
    "reviewed split tamper",
    (m) => {
      m.fixtures[0].split = "heldout";
    },
    /reviewed_split_changed/u,
  ],
  [
    "reviewed reason tamper",
    (m) => {
      m.fixtures[0].reviewNote = "new label";
    },
    /reviewed_label_changed/u,
  ],
  [
    "reviewed family tamper",
    (m) => {
      m.fixtures[0].sourceFamily = "new family";
    },
    /reviewed_family_changed/u,
  ],
  [
    "privacy not checked",
    (m) => {
      m.fixtures[0].privacyReview = "unchecked";
    },
    /no_identifiable_person/u,
  ],
  [
    "historic byte reuse",
    (m) => {
      m.fixtures[0].sha256 = prior.fixtures[0].sha256;
    },
    /prior_bytes_or_source/u,
  ],
  [
    "historic original reuse",
    (m) => {
      m.fixtures[0].sourceSha1 = prior.fixtures.find((r) => r.sourceSha1).sourceSha1;
    },
    /prior_bytes_or_source/u,
  ],
  [
    "missing credit",
    (m) => {
      m.fixtures[0].author = "";
    },
    /missing_credit/u,
  ],
  [
    "licence URL tamper",
    (m) => {
      m.fixtures[0].licenseUrl = "https://example.com";
    },
    /creativecommons/u,
  ],
  [
    "non-HTTPS image",
    (m) => {
      m.fixtures[0].downloadUrl = "http://upload.wikimedia.org/x.jpg";
    },
    /invalid_image_protocol/u,
  ],
  [
    "foreign source page",
    (m) => {
      m.fixtures[0].pageUrl = "https://example.com/wiki/File:x.jpg";
    },
    /commons.wikimedia.org/u,
  ],
  [
    "review hash tamper",
    (m) => {
      m.reviewSha256 = "0".repeat(64);
    },
    /review_bytes_changed/u,
  ],
  [
    "prior hash tamper",
    (m) => {
      m.priorManifestSha256 = "0".repeat(64);
    },
    /prior_bytes_changed/u,
  ],
  [
    "count tamper",
    (m) => {
      m.acquisitionBudget.newImagesDownloaded = 61;
    },
    /assert/u,
  ],
]) {
  test(`manifest rejects ${name}`, () => {
    const input = clone(manifest);
    mutate(input);
    assert.throws(() => validateManifest(input), reason);
  });
}

test("aerosols/batteries/mixed scenes are unknown, reusable forms are not automatic negatives", () => {
  for (const r of manifest.fixtures.filter((r) => /battery|aerosol|mixed/u.test(r.id)))
    assert.equal(r.expectedKind, "unknown");
  for (const id of ["bottle-metal", "bag-canvas", "jar-screw", "cup-yokohama"]) {
    const r = manifest.fixtures.find((r) => r.id === id);
    assert.equal(r.contextChallenge, true);
    assert.notEqual(r.expectedKind, "unknown");
    assert.equal(r.requiresNoSortingTruth, true);
  }
});

test("same-era transistor family never crosses splits", () => {
  const pair = manifest.fixtures.filter((r) => r.id.startsWith("box-transistors"));
  assert.equal(pair.length, 2);
  assert.deepEqual([...new Set(pair.map((r) => r.split))], ["validation"]);
  assert.deepEqual([...new Set(pair.map((r) => r.sourceFamily))], ["soviet-transistor-box-series"]);
});

test("local validation rejects missing image and symbolic-link fixture without model execution", () => {
  const temp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "kig-robustness-test-")));
  // Test-owned temporary files only; no recursive cleanup of user/work data.
  assert.throws(() => validateLocal(manifest, temp), /ENOENT/u);
  const target = path.join(temp, "target.jpg"),
    link = path.join(temp, `${manifest.fixtures[0].id}.jpg`);
  fs.writeFileSync(target, Buffer.from([255, 216, 255, 217]), { flag: "wx" });
  fs.symlinkSync(target, link);
  assert.throws(() => validateLocal(manifest, temp), /linked_or_nonfile_image/u);
  fs.unlinkSync(link);
  fs.unlinkSync(target);
  fs.rmdirSync(temp);
});

test("all fresh source attribution has exact licence, credit, change and content hashes", () => {
  for (const r of manifest.fixtures) {
    validateCase(r);
    assert.ok(r.author && r.credit && r.pageUrl && r.downloadUrl && r.changes);
    assert.match(r.sha256, /^[a-f0-9]{64}$/u);
    assert.match(r.sourceSha1, /^[a-f0-9]{40}$/u);
    assert.equal(r.privacyReview, "no_identifiable_person_or_private_text_observed");
  }
  const file = fs.readFileSync(path.join(root, "scripts/qa/local-vision/robustness-review.json"));
  assert.equal(createHash("sha256").update(file).digest("hex"), manifest.reviewSha256);
});
