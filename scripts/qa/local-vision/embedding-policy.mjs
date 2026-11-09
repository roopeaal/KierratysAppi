// Pure decision/accounting and independent numerical checks, never an image call.
import assert from "node:assert/strict";
import {
  EMBEDDING_CLASSES,
  EMBEDDING_POLICY,
  embeddingTrainingHash,
  FEATURE_COUNT,
  parseEmbeddingHead,
  validateEmbeddingFeature,
} from "./embedding-head.mjs";

export {
  linearValidationGate as embeddingValidationGate,
  measureLinearResults as measureEmbeddingResults,
} from "./linear-evaluate.mjs";

const known = EMBEDDING_CLASSES.slice(0, 5);
const numericalTolerance = 1e-7;
const residualTolerance = 1e-8;
const plain = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  [Object.prototype, null].includes(Object.getPrototypeOf(value));

function closedRecord(value, fields) {
  assert.ok(plain(value), "invalid_head_record");
  const descriptors = Object.getOwnPropertyDescriptors(value);
  assert.deepEqual(Reflect.ownKeys(descriptors).sort(), [...fields].sort(), "head_fields");
  const copy = {};
  for (const field of fields) {
    assert.ok(Object.hasOwn(descriptors[field] ?? {}, "value"), "head_accessor");
    copy[field] = descriptors[field].value;
  }
  return copy;
}
function denseCopy(value, length) {
  assert.ok(
    Array.isArray(value) && Object.getPrototypeOf(value) === Array.prototype,
    "invalid_head_array",
  );
  const descriptors = Object.getOwnPropertyDescriptors(value);
  assert.equal(descriptors.length?.value, length, "head_array_length");
  assert.equal(Reflect.ownKeys(descriptors).length, length + 1, "head_array_fields");
  return Array.from({ length }, (_, index) => {
    const descriptor = descriptors[String(index)];
    assert.ok(Object.hasOwn(descriptor ?? {}, "value"), "head_array_accessor");
    return descriptor.value;
  });
}
function validHead(input) {
  assert.ok(plain(input), "invalid_head");
  const status = Object.getOwnPropertyDescriptor(input, "status");
  assert.ok(Object.hasOwn(status ?? {}, "value"), "head_status");
  assert.ok(["estimated", "unknown"].includes(status.value), "head_status");
  const result = closedRecord(input, [
    "status",
    status.value === "estimated" ? "kind" : "reason",
    "scores",
    "margin",
    "scoreMeaning",
  ]);
  assert.equal(result.scoreMeaning, EMBEDDING_POLICY.scoreMeaning, "head_score_meaning");
  const scores = denseCopy(result.scores, EMBEDDING_CLASSES.length).map((item, index) => {
    const score = closedRecord(item, ["label", "response"]);
    assert.equal(score.label, EMBEDDING_CLASSES[index], "head_class_order");
    assert.ok(
      typeof score.response === "number" && Number.isFinite(score.response),
      "head_response",
    );
    return score;
  });
  assert.ok(typeof result.margin === "number" && Number.isFinite(result.margin), "head_margin");
  const ranked = [...scores].sort((a, b) => b.response - a.response);
  const top = ranked[0],
    second = ranked[1];
  const margin = top.response - second.response;
  assert.ok(Number.isFinite(margin) && margin >= 0, "head_derived_margin");
  assert.equal(result.margin, margin, "head_margin_drift");
  const tied = top.response === second.response;
  if (result.status === "estimated") {
    assert.ok(
      !tied &&
        known.includes(result.kind) &&
        result.kind === top.label &&
        margin >= EMBEDDING_POLICY.rawMargin,
      "head_estimate_semantics",
    );
  } else {
    assert.ok(
      (tied && result.reason === "tied_responses") ||
        (!tied && top.label === "unknown" && result.reason === "learned_unknown") ||
        (!tied &&
          known.includes(top.label) &&
          margin < EMBEDDING_POLICY.rawMargin &&
          result.reason === "weak_margin"),
      "head_unknown_semantics",
    );
  }
  return result;
}

/** Only an already accepted matching form may survive; no identity/material/sorting recovery. */
export function applyEmbeddingVeto(baseline, operational, head) {
  let parsed,
    headValid = true;
  try {
    parsed = validHead(head);
  } catch {
    headValid = false;
  }
  if (baseline.status !== "estimated")
    return { decision: baseline, operational, headRequired: false, headValid };
  if (!headValid)
    return {
      decision: { status: "unknown", reason: "head_unavailable" },
      operational: { valid: false, success: false },
      headRequired: true,
      headValid: false,
    };
  return {
    decision:
      parsed.status === "estimated" && parsed.kind === baseline.kind
        ? { ...baseline, method: "baseline_and_embedding_head" }
        : { status: "unknown", reason: "embedding_head_veto" },
    operational,
    headRequired: true,
    headValid: true,
  };
}

function diagnosticRows(input) {
  assert.ok(Array.isArray(input) && input.length >= 6 && input.length <= 100, "sanity_rows");
  return denseCopy(input, input.length)
    .map((row) => {
      assert.ok(plain(row), "sanity_row");
      const descriptors = Object.getOwnPropertyDescriptors(row);
      for (const key of ["id", "label", "features"])
        assert.ok(Object.hasOwn(descriptors[key] ?? {}, "value"), "sanity_row_accessor");
      assert.ok(
        typeof descriptors.id.value === "string" && /^[a-f0-9]{64}$/u.test(descriptors.id.value),
        "sanity_id",
      );
      assert.ok(EMBEDDING_CLASSES.includes(descriptors.label.value), "sanity_label");
      return {
        id: descriptors.id.value,
        label: descriptors.label.value,
        features: validateEmbeddingFeature(descriptors.features.value),
      };
    })
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/** Independent PLAIN primal arithmetic, not the dual solver/core diagnostics/predictor.
 * Returned row evaluations are additional to the core's internal fit-sanity rows.
 * The registered runner separately enforces the actual45-row training allocation.
 */
export function checkEmbeddingFit(rawModel, input) {
  const model = parseEmbeddingHead(rawModel),
    rows = diagnosticRows(input);
  assert.equal(model.header.trainingCount, rows.length, "sanity_training_count");
  assert.equal(
    model.header.trainingDataSha256,
    embeddingTrainingHash(rows),
    "sanity_membership_hash",
  );
  const counts = Object.fromEntries(
    EMBEDDING_CLASSES.map((label) => [label, rows.filter((row) => row.label === label).length]),
  );
  assert.deepEqual(model.header.classCounts, counts, "sanity_class_counts");
  const gradients = EMBEDDING_CLASSES.map(() => Array(FEATURE_COUNT).fill(0));
  const biasResiduals = Array(EMBEDDING_CLASSES.length).fill(0);
  let residualLoss = 0,
    slopeSquaredNorm = 0;
  for (let k = 0; k < EMBEDDING_CLASSES.length; k++) {
    for (let j = 0; j < FEATURE_COUNT; j++) {
      const coefficient = model.coefficients[k][j];
      slopeSquaredNorm += coefficient * coefficient;
      gradients[k][j] = 0.1 * coefficient;
    }
  }
  for (const row of rows) {
    const weight = 1 / counts[row.label];
    for (let k = 0; k < EMBEDDING_CLASSES.length; k++) {
      let prediction = model.coefficients[k][FEATURE_COUNT];
      for (let j = 0; j < FEATURE_COUNT; j++)
        prediction += model.coefficients[k][j] * row.features[j];
      const residual = prediction - (EMBEDDING_CLASSES[k] === row.label ? 1 : 0);
      const weightedResidual = weight * residual;
      residualLoss += weight * residual * residual;
      biasResiduals[k] += weightedResidual;
      for (let j = 0; j < FEATURE_COUNT; j++) gradients[k][j] += weightedResidual * row.features[j];
    }
  }
  const objective = residualLoss + 0.1 * slopeSquaredNorm;
  const maximumWeightedBiasResidual = Math.max(...biasResiduals.map(Math.abs));
  const maximumNormalEquationResidual = Math.max(
    maximumWeightedBiasResidual,
    ...gradients.flat().map(Math.abs),
  );
  assert.ok(
    [
      objective,
      residualLoss,
      slopeSquaredNorm,
      maximumWeightedBiasResidual,
      maximumNormalEquationResidual,
    ].every(Number.isFinite),
    "sanity_nonfinite",
  );
  assert.ok(objective <= 5 + numericalTolerance, "sanity_objective_bound");
  assert.ok(slopeSquaredNorm <= 50 + numericalTolerance, "sanity_slope_bound");
  assert.ok(maximumWeightedBiasResidual <= residualTolerance, "sanity_bias_residual");
  assert.ok(maximumNormalEquationResidual <= residualTolerance, "sanity_normal_residual");
  return {
    rowsEvaluated: rows.length,
    objective,
    residualLoss,
    slopeSquaredNorm,
    maximumWeightedBiasResidual,
    maximumNormalEquationResidual,
    numericalTolerance,
    residualTolerance,
  };
}
