// Synthetic numeric/status fixtures only: no actual reference features or image calls.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import {
  combineEmbeddingViews,
  EMBEDDING_CLASSES,
  FEATURE_COUNT,
  fitEmbeddingHead,
} from "../qa/local-vision/embedding-head.mjs";
import {
  applyEmbeddingVeto,
  checkEmbeddingFit,
  embeddingValidationGate,
  measureEmbeddingResults,
} from "../qa/local-vision/embedding-policy.mjs";
import { linearValidationGate, measureLinearResults } from "../qa/local-vision/linear-evaluate.mjs";

const known = EMBEDDING_CLASSES.slice(0, 5);
const ok = { valid: true, success: true };
const unknown = { status: "unknown", reason: "no_operating_point_match" };
const baseline = (kind) => ({ status: "estimated", kind, method: "system" });
const hash = (text) => createHash("sha256").update(text).digest("hex");
const copy = (value) => structuredClone(value);
const close = (actual, expected, tolerance = 1e-10) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} vs ${expected}`);
function head(winner) {
  return {
    status: winner === "unknown" ? "unknown" : "estimated",
    ...(winner === "unknown" ? { reason: "learned_unknown" } : { kind: winner }),
    scores: EMBEDDING_CLASSES.map((label) => ({ label, response: label === winner ? 0.8 : 0.1 })),
    margin: 0.8 - 0.1,
    scoreMeaning: "ridge_response_not_probability",
  };
}
function statusRow(label, base, prediction, operational = ok) {
  const result = applyEmbeddingVeto(base, operational, prediction);
  return {
    label,
    baseline: base,
    baselineOperational: operational,
    candidate: result.decision,
    candidateOperational: result.operational,
  };
}
function numericRows(counts = [1, 1, 1, 1, 1, 1]) {
  return EMBEDDING_CLASSES.flatMap((label, k) =>
    Array.from({ length: counts[k] }, (_, n) => {
      const a = Array(512).fill(0),
        b = Array(512).fill(0);
      a[k] = 1;
      b[(k + 2) % 6] = 1;
      return {
        id: hash(`owned-numeric-${label}-${n}`),
        label,
        features: combineEmbeddingViews(a, b),
      };
    }),
  );
}

test("only the same already-accepted known kind survives the embedding head", () => {
  for (const kind of known) {
    const result = applyEmbeddingVeto(baseline(kind), ok, head(kind));
    assert.equal(result.decision.kind, kind);
    assert.equal(result.decision.method, "baseline_and_embedding_head");
    assert.deepEqual(result.operational, ok);
    assert.equal(result.headRequired, true);
    assert.equal(result.headValid, true);
    for (const winner of EMBEDDING_CLASSES.filter((v) => v !== kind))
      assert.equal(applyEmbeddingVeto(baseline(kind), ok, head(winner)).decision.status, "unknown");
  }
});
test("unknown/conflict/error cannot be recovered and an unused head failure changes nothing", () => {
  for (const reason of [
    "no_operating_point_match",
    "conflicting_operating_point_matches",
    "primary_uncertainty",
    "weak_similarity",
    "unsupported_kind",
  ]) {
    const base = { status: "unknown", reason },
      operation = { valid: false, success: false };
    for (const prediction of [undefined, head("bottle")]) {
      const result = applyEmbeddingVeto(base, operation, prediction);
      assert.equal(result.decision, base);
      assert.equal(result.operational, operation);
      assert.equal(result.headRequired, false);
      assert.equal(result.headValid, prediction !== undefined);
    }
  }
});
test("malformed, legacy-shaped and semantically contradictory heads are required failures", () => {
  const mutations = [
    (h) => {
      h.extra = true;
    },
    (h) => {
      h.reason = "weak_margin";
    },
    (h) => {
      h.status = "unavailable";
    },
    (h) => {
      h.kind = "jar";
    },
    (h) => {
      h.scoreMeaning = "probability";
    },
    (h) => {
      h.margin = 1;
    },
    (h) => {
      h.margin = NaN;
    },
    (h) => {
      h.scores.reverse();
    },
    (h) => {
      h.scores[0].response = Infinity;
    },
    (h) => {
      h.scores[0].response = "0.8";
    },
    (h) => {
      h.scores[0].extra = true;
    },
    (h) => {
      delete h.scores[0];
    },
    (h) => {
      h.rawScores = h.scores;
      delete h.scores;
    },
    (h) => {
      h.scores[0] = { group: "bottle", cosine: 0.8 };
    },
  ];
  for (const mutate of mutations) {
    const prediction = head("bottle");
    mutate(prediction);
    const result = applyEmbeddingVeto(baseline("bottle"), ok, prediction);
    assert.equal(result.decision.reason, "head_unavailable");
    assert.deepEqual(result.operational, { valid: false, success: false });
    const metrics = measureEmbeddingResults(
      [statusRow("unknown", baseline("bottle"), prediction)],
      "candidate",
    );
    assert.equal(metrics.removedBaselineWrong, 0);
    assert.equal(metrics.safeAbstention, 0);
    assert.equal(metrics.introducedOperationalFailures, 1);
    assert.equal(metrics.introducedInvalidOutputs, 1);
  }
});
test("unknown reasons follow tie, unknown-winner and weak-margin priority exactly", () => {
  const tied = head("unknown");
  tied.scores.forEach((row) => {
    row.response = 0;
  });
  tied.margin = 0;
  tied.reason = "tied_responses";
  assert.equal(applyEmbeddingVeto(baseline("bottle"), ok, tied).headValid, true);
  const weak = head("bottle");
  weak.status = "unknown";
  delete weak.kind;
  weak.reason = "weak_margin";
  weak.scores[0].response = 0.15;
  weak.margin = 0.15 - 0.1;
  assert.equal(applyEmbeddingVeto(baseline("bottle"), ok, weak).headValid, true);
  const learned = head("unknown");
  learned.scores[5].response = 0.15;
  learned.margin = 0.15 - 0.1;
  assert.equal(applyEmbeddingVeto(baseline("bottle"), ok, learned).headValid, true);
  const strongButUnknown = head("bottle");
  strongButUnknown.status = "unknown";
  delete strongButUnknown.kind;
  strongButUnknown.reason = "weak_margin";
  for (const wrong of [
    { ...tied, reason: "learned_unknown" },
    { ...weak, reason: "tied_responses" },
    { ...learned, reason: "weak_margin" },
    strongButUnknown,
  ])
    assert.equal(applyEmbeddingVeto(baseline("bottle"), ok, wrong).headValid, false);
});
test("raw margin0.1 is inclusive and negative responses remain valid non-probabilities", () => {
  const prediction = head("bottle");
  prediction.scores.forEach((row, i) => {
    row.response = i === 0 ? 0.1 : 0;
  });
  prediction.margin = 0.1;
  assert.equal(applyEmbeddingVeto(baseline("bottle"), ok, prediction).decision.kind, "bottle");
  const negative = head("jar");
  negative.scores.forEach((row, i) => {
    row.response = i === 1 ? -1 : -2;
  });
  negative.margin = 1;
  assert.equal(applyEmbeddingVeto(baseline("jar"), ok, negative).headValid, true);
  prediction.scores[0].response = 0.099999999;
  prediction.margin = 0.099999999;
  assert.equal(applyEmbeddingVeto(baseline("bottle"), ok, prediction).headValid, false);
});
test("accessors are rejected without evaluating their diagnostic payload", () => {
  const prediction = head("bottle");
  let accessed = false;
  Object.defineProperty(prediction, "scores", {
    enumerable: true,
    get() {
      accessed = true;
      throw Error("not for output");
    },
  });
  assert.equal(applyEmbeddingVeto(baseline("bottle"), ok, prediction).headValid, false);
  assert.equal(accessed, false);
});
test("metrics and strict8-positive/every-kind validation gate reuse the frozen policy", () => {
  assert.equal(measureEmbeddingResults, measureLinearResults);
  assert.equal(embeddingValidationGate, linearValidationGate);
  const rows = [
    ...known.flatMap((kind) =>
      [0, 1, 2].map((n) => statusRow(kind, n < 2 ? baseline(kind) : unknown, head(kind))),
    ),
    ...Array.from({ length: 12 }, (_, n) =>
      statusRow("unknown", n === 0 ? baseline("bottle") : unknown, head("unknown")),
    ),
  ];
  const original = measureEmbeddingResults(rows, "baseline"),
    candidate = measureEmbeddingResults(rows, "candidate");
  assert.equal(embeddingValidationGate(original, candidate), true);
  for (const patch of [
    { lostBaselineCorrect: 1 },
    { wrongAccepted: 1 },
    { introducedOperationalFailures: 1 },
    { introducedInvalidOutputs: 1 },
    { removedBaselineWrong: 0 },
    { correctAccepted: 7 },
  ])
    assert.equal(embeddingValidationGate(original, { ...candidate, ...patch }), false);
  const missingKind = copy(candidate);
  missingKind.perKind.cup.correctAccepted = 0;
  assert.equal(embeddingValidationGate(original, missingKind), false);
});
test("independent plain primal checker matches exact six-direction ridge objective", () => {
  const rows = numericRows(),
    model = fitEmbeddingHead(rows);
  const checked = checkEmbeddingFit(model, rows);
  assert.equal(checked.rowsEvaluated, 6);
  close(checked.objective, 5 / 11);
  close(checked.residualLoss, 5 / 121);
  close(checked.slopeSquaredNorm, 500 / 121);
  assert.ok(checked.maximumWeightedBiasResidual < 1e-10);
  assert.ok(checked.maximumNormalEquationResidual < 1e-10);
});
test("45 synthetic rows check balanced SUM weights, bias-last and training metadata projection", () => {
  const rows = numericRows([5, 5, 5, 5, 5, 20]),
    model = fitEmbeddingHead(rows);
  const before = JSON.stringify(rows),
    annotated = rows.map((row) => ({ ...row, metadata: "ignored by numeric fit" }));
  const checked = checkEmbeddingFit(model, annotated);
  assert.equal(checked.rowsEvaluated, 45);
  close(checked.objective, 5 / 11);
  close(checked.slopeSquaredNorm, 500 / 121);
  assert.ok(checked.maximumNormalEquationResidual < 1e-10);
  assert.equal(JSON.stringify(rows), before);
});
test("same-count membership, feature and class changes cannot pass the fit check", () => {
  const rows = numericRows(),
    model = fitEmbeddingHead(rows);
  const changedId = copy(rows);
  changedId[0].id = hash("different owned member");
  assert.throws(() => checkEmbeddingFit(model, changedId), /sanity_membership_hash/);
  const changedFeature = copy(rows);
  changedFeature[0].features = rows[1].features;
  assert.throws(() => checkEmbeddingFit(model, changedFeature), /sanity_membership_hash/);
  const changedLabels = copy(rows);
  [changedLabels[0].label, changedLabels[1].label] = [
    changedLabels[1].label,
    changedLabels[0].label,
  ];
  assert.throws(() => checkEmbeddingFit(model, changedLabels), /sanity_membership_hash/);
  const missing = rows.slice(1);
  assert.throws(() => checkEmbeddingFit(model, missing));
  const duplicate = copy(rows);
  duplicate[1].id = duplicate[0].id;
  assert.throws(() => checkEmbeddingFit(model, duplicate));
});
test("finite slope or bias tampering fails the independent weighted primal residual", () => {
  const rows = numericRows(),
    model = fitEmbeddingHead(rows);
  const bias = copy(model);
  bias.coefficients[0][FEATURE_COUNT] += 0.001;
  assert.throws(() => checkEmbeddingFit(bias, rows), /sanity_bias_residual/);
  const slope = copy(model);
  slope.coefficients[0][0] += 0.001;
  assert.throws(() => checkEmbeddingFit(slope, rows), /sanity_(?:bias|normal)_residual/);
  const constant = copy(model);
  constant.coefficients.forEach((row) => {
    row.fill(0);
    row[FEATURE_COUNT] = 1 / 6;
  });
  assert.throws(() => checkEmbeddingFit(constant, rows), /sanity_normal_residual/);
});
test("checker has no fitting, prediction, core-diagnostics, network or filesystem call", () => {
  const source = fs.readFileSync(
    new URL("../qa/local-vision/embedding-policy.mjs", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    source,
    /\b(?:fitEmbeddingHead|predictEmbeddingHead|embeddingTrainingDiagnostics)\s*\(/u,
  );
  assert.doesNotMatch(source, /node:(?:fs|child_process|http|https|net)|process\.env|fetch\(/u);
});
