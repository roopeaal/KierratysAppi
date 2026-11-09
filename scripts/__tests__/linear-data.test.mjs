import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  classifyLinearReference,
  GROUPS,
  LINEAR_DATA_PINS,
  loadLinearDataset,
  SPLIT_TARGETS,
  splitLinearDataset,
  validateCanonicalScores,
  validateCapturedCenter,
  validateLinearRows,
} from "../qa/local-vision/linear-data.mjs";

const hash = (text) => createHash("sha256").update(text).digest("hex");
const clone = (value) => structuredClone(value);
const scores = () => GROUPS.map((group, i) => ({ group, cosine: (i - 9) / 100 }));
function rows() {
  let index = 0;
  return Object.entries(SPLIT_TARGETS).flatMap(([stratum, target]) =>
    Array.from({ length: target.train + target.validation }, (_, i) => {
      const n = index++,
        values = scores(),
        known = ["bottle", "jar", "box", "bag", "cup"].includes(stratum);
      return {
        id: hash(`synthetic-case-${n}`),
        label: known ? stratum : "unknown",
        features: values.map((s) => s.cosine),
        scores: values,
        baseline: { status: "unknown", reason: "synthetic_fixture_not_inferred" },
        operational: { valid: true, success: true },
        sourceProof: {
          sourceId: `case-${n}`,
          group: `group-${n}`,
          sourceFamily: `family-${n}`,
          stratum,
          subtype: known
            ? "form"
            : stratum === "mixed_supported"
              ? "mixed_supported"
              : i < 2
                ? "other_ambiguous"
                : "outside",
        },
      };
    }),
  );
}
function capture() {
  const value = scores();
  return {
    call: {
      failed: false,
      signal: null,
      errorCode: null,
      exitCode: 0,
      raw: {
        schemaVersion: "mobileclip-s0-scores-v1",
        modelId: "apple-mobileclip-s0-coreml-2024",
        modelRevision: "55c8098c12ba8f928e37e26b2e1dd097777c3f98",
        imageWeightSha256: LINEAR_DATA_PINS.weights,
        prototypesSha256: LINEAR_DATA_PINS.prototypes,
        promptsSha256: LINEAR_DATA_PINS.prompts,
        promptPolicy: "packaging-visible-form-v1",
        preprocessing: "center-square-256-srgb-v1",
        computeUnits: "cpuOnly",
        osVersion: "26.7.0",
        embeddingNorm: 1,
        durationMs: 7,
        scores: value,
      },
    },
    normalized: { valid: true, operationalSuccess: true, scores: value, failureReason: null },
    attempt: { imageSha256: hash("image"), binarySha256: LINEAR_DATA_PINS.center },
  };
}

test("registered metadata split has45train27validation and exact per-stratum counts", () => {
  const data = rows(),
    result = splitLinearDataset(data);
  assert.equal(result.train.length, 45);
  assert.equal(result.validation.length, 27);
  assert.equal(result.allocation.totalComponents, 72);
  for (const [stratum, target] of Object.entries(SPLIT_TARGETS)) {
    assert.equal(
      result.train.filter((r) => r.sourceProof.stratum === stratum).length,
      target.train,
    );
    assert.equal(
      result.validation.filter((r) => r.sourceProof.stratum === stratum).length,
      target.validation,
    );
  }
  assert.equal(new Set([...result.train, ...result.validation].map((r) => r.id)).size, 72);
});
test("input ordering, valid feature values and captured outcomes cannot affect allocation", () => {
  const data = rows(),
    original = splitLinearDataset(data),
    changed = clone(data).reverse();
  for (const r of changed) {
    r.features = r.features.map((v) => -v);
    r.scores = r.scores.map((s) => ({ ...s, cosine: -s.cosine }));
    r.baseline = { status: "estimated", kind: "bottle", method: "synthetic_changed_outcome" };
  }
  assert.deepEqual(splitLinearDataset(changed).allocation, original.allocation);
  assert.deepEqual(
    splitLinearDataset(changed).train.map((r) => r.id),
    original.train.map((r) => r.id),
  );
});
test("two-image source family remains on one side and component rank has exact registered bytes", () => {
  const data = rows(),
    boxes = data.filter((r) => r.label === "box");
  boxes[0].sourceProof.sourceFamily = "shared-box-series";
  boxes[1].sourceProof.sourceFamily = "shared-box-series";
  const result = splitLinearDataset(data);
  assert.equal(result.allocation.totalComponents, 71);
  const component = result.allocation.components.find((c) => c.ids.includes(boxes[0].id));
  assert.deepEqual(component.ids, [boxes[0].id, boxes[1].id].sort());
  assert.equal(component.rank, hash(`kig-linear-split-v1\n${component.ids.join("\n")}`));
  const side = new Set(result.train.map((r) => r.id));
  assert.equal(side.has(boxes[0].id), side.has(boxes[1].id));
});
test("group/family alias chains and case variants bind conservatively", () => {
  const data = rows(),
    boxes = data.filter((r) => r.label === "box");
  boxes[0].sourceProof.group = "Alias-A";
  boxes[1].sourceProof.sourceFamily = "alias-a";
  boxes[1].sourceProof.group = "Alias-B";
  boxes[2].sourceProof.sourceFamily = "alias-b";
  const result = splitLinearDataset(data),
    component = result.allocation.components.find((c) => c.ids.includes(boxes[0].id));
  assert.deepEqual(
    component.ids,
    boxes
      .slice(0, 3)
      .map((r) => r.id)
      .sort(),
  );
  assert.equal(result.allocation.totalComponents, 70);
});
test("family disagreement on labels or unknown strata is rejected", () => {
  const data = rows();
  data[0].sourceProof.sourceFamily = data.find((r) => r.label === "jar").sourceProof.sourceFamily;
  assert.throws(() => splitLinearDataset(data), /heterogeneous_component/);
  const unknown = rows(),
    a = unknown.find((r) => r.sourceProof.stratum === "mixed_supported"),
    b = unknown.find((r) => r.sourceProof.stratum === "other_unknown");
  a.sourceProof.group = b.sourceProof.sourceFamily;
  assert.throws(() => splitLinearDataset(unknown), /heterogeneous_component/);
});
test("unreachable odd sample count is not repaired by splitting a source family", () => {
  const data = rows(),
    bottles = data.filter((r) => r.label === "bottle");
  for (const [i, r] of bottles.entries())
    r.sourceProof.sourceFamily = `paired-bottle-${Math.floor(i / 2)}`;
  assert.throws(() => splitLinearDataset(data), /unreachable_group_count/);
});
test("dynamic program selects the first lexicographic feasible component subset", () => {
  const data = rows(),
    boxes = data.filter((r) => r.label === "box");
  boxes[0].sourceProof.sourceFamily = "same-box";
  boxes[1].sourceProof.sourceFamily = "same-box";
  const result = splitLinearDataset(data),
    candidates = result.allocation.components
      .filter((c) => c.stratum === "box")
      .sort((a, b) => a.rank.localeCompare(b.rank));
  const feasible = [];
  for (let bits = 0; bits < 2 ** candidates.length; bits++) {
    const selected = candidates.map((_, i) => i).filter((i) => (bits & (1 << i)) !== 0);
    if (selected.reduce((n, i) => n + candidates[i].ids.length, 0) === 5) feasible.push(selected);
  }
  feasible.sort((a, b) => {
    for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] - b[i];
    return a.length - b.length;
  });
  assert.deepEqual(
    candidates
      .map((c, i) => ({ c, i }))
      .filter((r) => r.c.split === "train")
      .map((r) => r.i),
    feasible[0],
  );
});
test("duplicate image or source IDs and altered quotas are rejected", () => {
  const data = rows();
  data[1].id = data[0].id;
  assert.throws(() => validateLinearRows(data), /duplicate_image/);
  const ids = rows();
  ids[1].sourceProof.sourceId = ids[0].sourceProof.sourceId;
  assert.throws(() => validateLinearRows(ids), /duplicate_source_id/);
  assert.throws(() => splitLinearDataset(rows().slice(1)), /registered_72_required/);
  const counts = rows(),
    r = counts.find((r) => r.label === "jar");
  r.label = "box";
  r.sourceProof.stratum = "box";
  assert.throws(() => splitLinearDataset(counts), /stratum_count/);
});
test("nonfinite, unbounded, wrong-length, reordered and inconsistent features fail closed", () => {
  for (const value of [NaN, Infinity, -Infinity, "0.1", 2, -2]) {
    const data = rows();
    data[0].features[0] = value;
    assert.throws(() => validateLinearRows(data), /invalid_features/);
  }
  const data = rows();
  data[0].features.pop();
  assert.throws(() => validateLinearRows(data), /invalid_features/);
  const order = rows();
  order[0].scores.reverse();
  assert.throws(() => validateLinearRows(order), /invalid_scores/);
  const drift = rows();
  drift[0].features[0] = 0;
  assert.throws(() => validateLinearRows(drift), /feature_order_drift/);
  assert.equal(validateCanonicalScores(scores()), true);
  assert.equal(validateCanonicalScores([...scores(), scores()[0]]), false);
});
test("invalid labels, strata, family descriptors and operational promotion fail closed", () => {
  for (const mutate of [
    (r) => {
      r.label = "material-plastic";
    },
    (r) => {
      r.sourceProof.stratum = "arbitrary";
    },
    (r) => {
      r.sourceProof.stratum = "jar";
    },
    (r) => {
      r.sourceProof.group = "../outside";
    },
    (r) => {
      r.sourceProof.sourceFamily = "bad\nfamily";
    },
    (r) => {
      r.operational = { valid: false, success: true };
    },
    (r) => {
      r.operational = { valid: false, success: false };
      r.baseline = { status: "estimated", kind: "bottle" };
    },
  ]) {
    const data = rows();
    mutate(data[0]);
    assert.throws(() => validateLinearRows(data));
  }
  const retained = rows();
  retained[0].operational = { valid: false, success: false };
  retained[1].operational = { valid: true, success: false };
  assert.equal(validateLinearRows(retained).length, 72);
});
test("manifest target precedes misleading IDs and legacy food stays ambiguous", () => {
  assert.deepEqual(
    classifyLinearReference(
      { id: "mixed-pantry", expectedKind: "jar", challenge: "form" },
      "foreground",
    ),
    { stratum: "jar", subtype: "form" },
  );
  assert.deepEqual(
    classifyLinearReference(
      { id: "control-food-bread", expectedKind: "unknown", contextChallenge: false },
      "robustness",
    ),
    { stratum: "other_unknown", subtype: "other_ambiguous" },
  );
  assert.deepEqual(
    classifyLinearReference({ id: "control-mixed-beach", expectedKind: "unknown" }, "robustness"),
    { stratum: "mixed_supported", subtype: "mixed_supported" },
  );
  assert.deepEqual(
    classifyLinearReference(
      { id: "mixed-not-a-control", expectedKind: "unknown", challenge: "outside" },
      "foreground",
    ),
    { stratum: "other_unknown", subtype: "outside" },
  );
  assert.throws(
    () =>
      classifyLinearReference(
        { id: "control-mixed-unregistered", expectedKind: "unknown" },
        "robustness",
      ),
    /unregistered_legacy_unknown/,
  );
});
test("captured center strictly retains fixed source metadata, image and binary binding", () => {
  const c = capture();
  assert.deepEqual(
    validateCapturedCenter(c.call, c.normalized, c.attempt, hash("image")),
    c.normalized,
  );
  for (const mutate of [
    (x) => {
      x.attempt.imageSha256 = hash("other");
    },
    (x) => {
      x.attempt.binarySha256 = hash("binary");
    },
    (x) => {
      x.call.raw.modelRevision = "different";
    },
    (x) => {
      x.call.raw.promptsSha256 = hash("prompts");
    },
    (x) => {
      x.call.raw.preprocessing = "full-frame-fit-256";
    },
    (x) => {
      x.call.raw.computeUnits = "all";
    },
    (x) => {
      x.call.raw.osVersion = "26.6.0";
    },
    (x) => {
      x.call.failed = true;
    },
    (x) => {
      x.call.exitCode = 1;
    },
    (x) => {
      x.call.raw.scores[0].cosine = NaN;
    },
    (x) => {
      x.normalized.failureReason = "invented";
    },
  ]) {
    const changed = clone(c);
    mutate(changed);
    assert.throws(() =>
      validateCapturedCenter(changed.call, changed.normalized, changed.attempt, hash("image")),
    );
  }
});
test("failed or invalid captured center is not silently omitted or called successful abstention", () => {
  const c = capture();
  c.call.raw = { status: "unavailable", reason: "processing_failed" };
  c.call.exitCode = 1;
  c.normalized = {
    valid: true,
    operationalSuccess: false,
    scores: [],
    failureReason: "processing_failed",
  };
  assert.throws(
    () => validateCapturedCenter(c.call, c.normalized, c.attempt, hash("image")),
    /failed_center/,
  );
  c.call.raw = { status: "unavailable", reason: "not_a_known_failure" };
  assert.throws(
    () => validateCapturedCenter(c.call, c.normalized, c.attempt, hash("image")),
    /invalid_center/,
  );
});
test("missing or linked project data roots fail without creating outputs", async (t) => {
  const temp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "kig-linear-data-")));
  t.after(() => {
    assert.ok(temp.startsWith(`${fs.realpathSync(os.tmpdir())}${path.sep}kig-linear-data-`));
    fs.rmSync(temp, { recursive: true });
  });
  fs.mkdirSync(path.join(temp, "work"));
  await assert.rejects(loadLinearDataset(temp));
  assert.deepEqual(fs.readdirSync(temp), ["work"]);
  const link = path.join(temp, "linked-root");
  fs.symlinkSync(temp, link, "dir");
  await assert.rejects(loadLinearDataset(link), /linked_project/);
});
test("data preparation has no direct network, inference, fit, output-write or credential entry", () => {
  const text = fs.readFileSync(
    new URL("../qa/local-vision/linear-data.mjs", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    text,
    /\b(?:fetch|spawn|spawnSync|exec|execSync|execFile|execFileSync|writeFile|writeFileSync|mkdir|mkdirSync|train|fit)\s*\(/u,
  );
  assert.doesNotMatch(text, /process\.env|OPENAI_API_KEY|https:\/\//u);
  assert.match(text, /rawCenterSha256/);
  assert.match(text, /primaryFailuresRetained:\s*2/);
});
