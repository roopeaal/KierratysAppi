import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  acquire,
  coverage,
  validateCase,
  validateLocal,
  validateManifest,
  validateReview,
  validateSpecification,
} from "../qa/local-vision/packaging-corpus.mjs";

const json = (name) =>
  JSON.parse(readFileSync(new URL(`../qa/local-vision/${name}`, import.meta.url)));
const initial = json("packaging-cases.json");
const supplement = json("packaging-supplement-cases.json");
const manifest = json("packaging-manifest.json");
const review = json("packaging-review.json");
const prior = json("independent-manifest.json");
const clone = (value) => structuredClone(value);
const candidates = [
  ...initial.cases,
  ...supplement.cases,
  ...initial.reuseTrainOnly.map((id) => ({
    ...prior.fixtures.find((r) => r.id === id),
    id: `seen-${id}`,
    split: "train",
    seenDiagnostic: true,
  })),
];

test("packaging seed freezes22 AI-reviewed cases without claiming inference or complete training coverage", () => {
  assert.equal(validateSpecification(initial), initial);
  assert.equal(validateSpecification(supplement), supplement);
  assert.equal(validateManifest(manifest), manifest);
  assert.equal(manifest.fixtures.length, 22);
  assert.equal(manifest.fixtures.filter((r) => r.seenDiagnostic).length, 4);
  assert.deepEqual(coverage(manifest.fixtures), manifest.coverage);
  for (const kind of ["bottle", "jar", "box", "bag", "cup"]) {
    assert.equal(manifest.coverage[kind].validation, 1);
    assert.equal(manifest.coverage[kind].heldout, 1);
  }
  assert.equal(manifest.coverage.jar.train, 1);
  assert.equal(manifest.coverage.cup.train, 1);
  assert.equal(manifest.acquisitionBudget.newImagesDownloaded, 26);
  assert.equal(manifest.acquisitionBudget.newBytesDownloaded, 5_230_170);
});

for (const [name, mutate] of [
  [
    "path IDs",
    (x) => {
      x.cases[0].id = "../image";
    },
  ],
  [
    "unbounded counts",
    (x) => {
      x.cases = Array.from({ length: 41 }, (_, i) => ({ ...x.cases[0], id: `case-${i}` }));
    },
  ],
  [
    "unknown kind",
    (x) => {
      x.cases[0].expectedKind = "safe-plastic";
    },
  ],
  [
    "unknown split",
    (x) => {
      x.cases[0].split = "accuracy-proof";
    },
  ],
  [
    "missing group",
    (x) => {
      x.cases[0].group = "";
    },
  ],
  [
    "duplicate IDs",
    (x) => {
      x.cases[1].id = x.cases[0].id;
    },
  ],
  [
    "duplicate source",
    (x) => {
      x.cases[1].title = x.cases[0].title;
    },
  ],
  [
    "group leakage",
    (x) => {
      x.cases[1].group = x.cases[0].group;
    },
  ],
  [
    "unapproved share-alike",
    (x) => {
      x.cases[0].license = "CC-BY-SA-4.0";
    },
  ],
  [
    "invented human acceptance",
    (x) => {
      x.labelReviewStatus = "human_approved";
    },
  ],
  [
    "invented pretraining knowledge",
    (x) => {
      x.pretrainingMembership = "never-seen";
    },
  ],
  [
    "expanded image budget",
    (x) => {
      x.maximumNewImages = 100;
    },
  ],
  [
    "expanded byte budget",
    (x) => {
      x.maximumNewBytes = 100_000_000;
    },
  ],
]) {
  test(`packaging specification rejects ${name}`, () => {
    const value = clone(initial);
    mutate(value);
    assert.throws(() => validateSpecification(value));
  });
}

for (const [name, mutate] of [
  [
    "missing credits",
    (x) => {
      x.fixtures[0].author = "";
    },
  ],
  [
    "wrong licence URL",
    (x) => {
      x.fixtures[0].licenseUrl = "https://example.invalid/";
    },
  ],
  [
    "unapproved image host",
    (x) => {
      x.fixtures[0].downloadUrl = "https://example.invalid/image.jpg";
    },
  ],
  [
    "credential-bearing image URL",
    (x) => {
      x.fixtures[0].downloadUrl =
        "https://secret@upload.wikimedia.org/wikipedia/commons/a/aa/image.jpg";
    },
  ],
  [
    "wrong file page",
    (x) => {
      x.fixtures[0].pageUrl = "https://commons.wikimedia.org/wiki/File:Other.jpg";
    },
  ],
  [
    "wrong timestamp",
    (x) => {
      x.fixtures[0].sourceTimestamp = "never";
    },
  ],
  [
    "invalid hashes",
    (x) => {
      x.fixtures[0].sha256 = "not-a-hash";
    },
  ],
  [
    "duplicate pixels",
    (x) => {
      x.fixtures[1].sha256 = x.fixtures[0].sha256;
    },
  ],
  [
    "oversized JPEG",
    (x) => {
      x.fixtures[0].bytes = 1_500_001;
    },
  ],
  [
    "too many total acquired images",
    (x) => {
      x.acquisitionBudget.newImagesDownloaded = 41;
    },
  ],
  [
    "too many total acquired bytes",
    (x) => {
      x.acquisitionBudget.newBytesDownloaded = 25_000_001;
    },
  ],
  [
    "seen diagnostic in validation",
    (x) => {
      x.fixtures.find((r) => r.seenDiagnostic).split = "validation";
    },
  ],
  [
    "seen diagnostic in heldout",
    (x) => {
      x.fixtures.find((r) => r.seenDiagnostic).split = "heldout";
    },
  ],
  [
    "hidden seen status",
    (x) => {
      x.fixtures.find((r) => r.seenDiagnostic).seenDiagnostic = false;
    },
  ],
  [
    "old development bytes disguised as fresh",
    (x) => {
      x.fixtures[0].sha256 = "56d48570eeac647c4eef1bf4497c926df7e9984a729b58ae01f7ed04cc47f28e";
    },
  ],
  [
    "claim that inference already occurred",
    (x) => {
      x.inferenceExecuted = true;
    },
  ],
  [
    "claim that training already occurred",
    (x) => {
      x.trainingExecuted = true;
    },
  ],
]) {
  test(`packaging manifest rejects ${name}`, () => {
    const value = clone(manifest);
    mutate(value);
    assert.throws(() => validateManifest(value));
  });
}

test("review accounts for every candidate and preserves pre-inference exclusions", () => {
  assert.equal(validateReview(review, candidates), review);
  assert.equal(candidates.length, 31);
  assert.equal(review.eligibleIds.length, 22);
  assert.equal(review.excluded.length, 9);
  assert.ok(review.excluded.some((r) => r.id === "seen-cup-takeaway"));
  assert.equal(review.splitOverrides[0].id, "cup-red-stack");
});

for (const [name, mutate] of [
  [
    "missing disposition",
    (x) => {
      x.eligibleIds.pop();
    },
  ],
  [
    "duplicate disposition",
    (x) => {
      x.eligibleIds.push(x.eligibleIds[0]);
    },
  ],
  [
    "unknown case",
    (x) => {
      x.eligibleIds[0] = "not-a-case";
    },
  ],
  [
    "after-inference review",
    (x) => {
      x.reviewedBeforeInference = false;
    },
  ],
  [
    "wrong old split",
    (x) => {
      x.splitOverrides[0].from = "validation";
    },
  ],
  [
    "seen source promotion",
    (x) => {
      x.splitOverrides = [
        { id: "seen-bag-wcdonalds", from: "train", to: "heldout", reason: "Invalid test fixture." },
      ];
    },
  ],
]) {
  test(`packaging review rejects ${name}`, () => {
    const value = clone(review);
    mutate(value);
    assert.throws(() => validateReview(value, candidates));
  });
}

test("corpus acquisition rejects unknown batches before any network/write action", async () => {
  await assert.rejects(
    acquire("work/no-output", "work/no-input", process.cwd(), "unknown"),
    /unknown_batch/u,
  );
});

test("read-only local-byte validation rejects missing input before inference", () => {
  assert.throws(() => validateLocal("/nonexistent-packaging-schema-fixture", manifest));
});

test("standalone case guard keeps seen data train-only", () => {
  const seen = { ...manifest.fixtures[0], seenDiagnostic: true, split: "heldout" };
  assert.throws(() => validateCase(seen), /seen_data_cannot_be_held_out/u);
});
