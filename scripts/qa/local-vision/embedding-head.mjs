// PURE QA NUMERICAL HEAD. No images, model calls, storage, network or app integration.
// Synthetic tests are numerical evidence, not image-recognition or OOD quality evidence.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

export const EMBEDDING_CLASSES = Object.freeze(["bottle", "jar", "box", "bag", "cup", "unknown"]);
export const VIEW_FEATURE_COUNT = 512;
export const FEATURE_COUNT = 1024;
export const EMBEDDING_POLICY = Object.freeze({
  schemaVersion: "dual-view-unit-ridge-v2",
  featurePolicy: "center-fit-concat-div-sqrt2-unit1024-v2",
  featureCount: FEATURE_COUNT,
  viewFeatureCount: VIEW_FEATURE_COUNT,
  views: Object.freeze(["center", "full-frame-aspect-fit"]),
  preprocessing: Object.freeze(["center-square-256-srgb-v1", "aspect-fit-256-srgb-gray127-v1"]),
  geometry: "raw-unit-no-zscore-weighted-centering-only",
  unitNormTolerance: 1e-6,
  lambda: 0.1,
  classWeightPolicy: "inverse-class-count-total-six",
  interceptPolicy: "joint-weighted-unpenalized",
  lossPolicy: "weighted-sum-squared-error-plus-lambda-slope-squared",
  rawMargin: 0.1,
  scoreMeaning: "ridge_response_not_probability",
});

const MAX_ROWS = 100;
const NUMERIC_TOLERANCE = 1e-7;
const SLOPE_SQUARED_LIMIT = 50;
const biasLimit = 1 / 6 + (1 + EMBEDDING_POLICY.unitNormTolerance) * Math.sqrt(SLOPE_SQUARED_LIMIT);
const hashPattern = /^[a-f0-9]{64}$/u;
const plain = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  [Object.prototype, null].includes(Object.getPrototypeOf(value));
function keys(value, expected, error) {
  assert.ok(plain(value), error);
  assert.deepEqual(Reflect.ownKeys(value).sort(), [...expected].sort(), error);
  assert.ok(
    expected.every((k) => Object.hasOwn(Object.getOwnPropertyDescriptor(value, k), "value")),
    error,
  );
}
function dense(value, length, error) {
  assert.ok(
    Array.isArray(value) &&
      Object.getPrototypeOf(value) === Array.prototype &&
      value.length === length,
    error,
  );
  assert.equal(Reflect.ownKeys(value).length, length + 1, error);
  for (let i = 0; i < length; i++)
    assert.ok(
      Object.hasOwn(Object.getOwnPropertyDescriptor(value, String(i)) ?? {}, "value"),
      error,
    );
  return value;
}
function finite(value, maximum, error) {
  assert.ok(
    typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= maximum,
    error,
  );
  return Object.is(value, -0) ? 0 : value;
}
function dot(a, b) {
  assert.equal(a.length, b.length, "dot_dimensions");
  let sum = 0,
    correction = 0;
  for (let i = 0; i < a.length; i++) {
    const term = a[i] * b[i] - correction;
    const next = sum + term;
    correction = next - sum - term;
    sum = next;
  }
  return sum;
}
function rawView(vector) {
  dense(vector, VIEW_FEATURE_COUNT, "view_dimension");
  const copy = vector.map((v) =>
    finite(v, 1 + EMBEDDING_POLICY.unitNormTolerance, "invalid_view_value"),
  );
  assert.ok(
    Math.abs(Math.sqrt(dot(copy, copy)) - 1) <= EMBEDDING_POLICY.unitNormTolerance,
    "view_not_unit",
  );
  return copy;
}

/** Both views are mandatory; do not renormalize a missing or malformed view. */
export function combineEmbeddingViews(center, fullFrameFit) {
  const a = rawView(center),
    b = rawView(fullFrameFit);
  const combined = [...a, ...b].map((v) => v / Math.SQRT2);
  return validateEmbeddingFeature(combined);
}
export function validateEmbeddingFeature(vector) {
  dense(vector, FEATURE_COUNT, "feature_dimension");
  const copy = vector.map((v) =>
    finite(v, 1 + EMBEDDING_POLICY.unitNormTolerance, "invalid_feature_value"),
  );
  assert.ok(
    Math.abs(Math.sqrt(dot(copy, copy)) - 1) <= EMBEDDING_POLICY.unitNormTolerance,
    "feature_not_unit",
  );
  for (let view = 0; view < 2; view++) {
    const half = copy.slice(view * VIEW_FEATURE_COUNT, (view + 1) * VIEW_FEATURE_COUNT);
    assert.ok(
      Math.abs(Math.sqrt(2 * dot(half, half)) - 1) <= EMBEDDING_POLICY.unitNormTolerance,
      "missing_or_unbalanced_view",
    );
  }
  return copy;
}
function trainingRows(input) {
  assert.ok(
    Array.isArray(input) && input.length >= EMBEDDING_CLASSES.length && input.length <= MAX_ROWS,
    "training_count",
  );
  dense(input, input.length, "training_array");
  const ids = new Set();
  const rows = input
    .map((row) => {
      keys(row, ["id", "label", "features"], "training_row_schema");
      assert.match(row.id, hashPattern, "training_id");
      assert.ok(!ids.has(row.id), "duplicate_training_id");
      ids.add(row.id);
      assert.ok(EMBEDDING_CLASSES.includes(row.label), "training_label");
      return { id: row.id, label: row.label, features: validateEmbeddingFeature(row.features) };
    })
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const counts = Object.fromEntries(
    EMBEDDING_CLASSES.map((label) => [label, rows.filter((r) => r.label === label).length]),
  );
  assert.ok(
    Object.values(counts).every((n) => n > 0),
    "missing_training_class",
  );
  return { rows, counts };
}
const hashTrainingRows = (rows) => createHash("sha256").update(JSON.stringify(rows)).digest("hex");
export function embeddingTrainingHash(input) {
  return hashTrainingRows(trainingRows(input).rows);
}
function choleskySolve(matrix, right) {
  const n = matrix.length,
    outputs = EMBEDDING_CLASSES.length;
  const lower = Array.from({ length: n }, () => new Float64Array(n));
  for (let i = 0; i < n; i++)
    for (let j = 0; j <= i; j++) {
      let value = matrix[i][j];
      for (let k = 0; k < j; k++) value -= lower[i][k] * lower[j][k];
      assert.ok(Number.isFinite(value), "nonfinite_factor");
      if (i === j) {
        assert.ok(value > 1e-12, "nonpositive_kernel");
        lower[i][j] = Math.sqrt(value);
      } else lower[i][j] = value / lower[j][j];
    }
  const intermediate = Array.from({ length: n }, () => new Float64Array(outputs));
  const solution = Array.from({ length: n }, () => new Float64Array(outputs));
  for (let i = 0; i < n; i++)
    for (let k = 0; k < outputs; k++) {
      let value = right[i][k];
      for (let j = 0; j < i; j++) value -= lower[i][j] * intermediate[j][k];
      intermediate[i][k] = value / lower[i][i];
    }
  for (let i = n - 1; i >= 0; i--)
    for (let k = 0; k < outputs; k++) {
      let value = intermediate[i][k];
      for (let j = i + 1; j < n; j++) value -= lower[j][i] * solution[j][k];
      solution[i][k] = value / lower[i][i];
      assert.ok(Number.isFinite(solution[i][k]), "nonfinite_solution");
    }
  return solution;
}
function makeHeader(counts, trainingDataSha256) {
  assert.match(trainingDataSha256, hashPattern, "training_hash");
  return {
    ...EMBEDDING_POLICY,
    views: [...EMBEDDING_POLICY.views],
    preprocessing: [...EMBEDDING_POLICY.preprocessing],
    classOrder: [...EMBEDDING_CLASSES],
    trainingDataSha256,
    trainingCount: Object.values(counts).reduce((a, b) => a + b, 0),
    classCounts: Object.fromEntries(EMBEDDING_CLASSES.map((label) => [label, counts[label]])),
  };
}

/** Balanced SUM loss, fixed lambda0.1. Intercept is optimized jointly, never penalized.
 * mu=sum(w*x)/6; nu=1/6; A=sqrt(w)*(X-mu), B=sqrt(w)*(Y-nu).
 * Solve the n<=100 dual system, W=A^T(AA^T+lambda*I)^-1B, b=nu-mu*W.
 * Membership SHA256 is computed from canonical sorted validated rows, never supplied by a caller.
 * Training examples, IDs, mean and kernel are not retained in the serialized model.
 */
export function fitEmbeddingHead(input, ...unexpected) {
  assert.equal(unexpected.length, 0, "fit_argument_count");
  const { rows, counts } = trainingRows(input);
  const trainingDataSha256 = hashTrainingRows(rows);
  const mean = new Float64Array(FEATURE_COUNT);
  for (const row of rows)
    for (let j = 0; j < FEATURE_COUNT; j++) mean[j] += row.features[j] / counts[row.label] / 6;
  const a = [],
    b = [];
  for (const row of rows) {
    const scale = Math.sqrt(1 / counts[row.label]);
    a.push(Float64Array.from(row.features, (v, j) => scale * (v - mean[j])));
    b.push(
      Float64Array.from(
        EMBEDDING_CLASSES,
        (label) => scale * ((label === row.label ? 1 : 0) - 1 / 6),
      ),
    );
  }
  const kernel = Array.from({ length: rows.length }, () => new Float64Array(rows.length));
  for (let i = 0; i < rows.length; i++)
    for (let j = 0; j <= i; j++) {
      const value = dot(a[i], a[j]) + (i === j ? EMBEDDING_POLICY.lambda : 0);
      kernel[i][j] = value;
      kernel[j][i] = value;
    }
  const dual = choleskySolve(kernel, b);
  const coefficients = EMBEDDING_CLASSES.map((_, k) => {
    const slopes = Array(FEATURE_COUNT).fill(0);
    for (let j = 0; j < FEATURE_COUNT; j++)
      for (let i = 0; i < rows.length; i++) slopes[j] += a[i][j] * dual[i][k];
    return [...slopes, 1 / 6 - dot(mean, slopes)].map((v) => (Object.is(v, -0) ? 0 : v));
  });
  const model = parseEmbeddingHead({
    header: makeHeader(counts, trainingDataSha256),
    coefficients,
  });
  const sanity = embeddingTrainingDiagnostics(model, rows);
  assert.ok(sanity.objective <= 5 + NUMERIC_TOLERANCE, "objective_bound");
  assert.ok(sanity.slopeSquared <= SLOPE_SQUARED_LIMIT + NUMERIC_TOLERANCE, "slope_bound");
  assert.ok(sanity.maxWeightedBiasResidual <= 1e-8, "weighted_intercept_residual");
  assert.ok(sanity.maxNormalEquationResidual <= 1e-8, "weighted_slope_residual");
  return model;
}

/** Strict transport validation only, not proof that coefficients came from a real fit. */
export function parseEmbeddingHead(raw) {
  keys(raw, ["header", "coefficients"], "model_schema");
  const headerKeys = [
    ...Object.keys(EMBEDDING_POLICY),
    "classOrder",
    "trainingDataSha256",
    "trainingCount",
    "classCounts",
  ];
  keys(raw.header, headerKeys, "header_schema");
  for (const [key, expected] of Object.entries(EMBEDDING_POLICY))
    assert.deepEqual(raw.header[key], expected, `header_policy:${key}`);
  assert.deepEqual(raw.header.classOrder, EMBEDDING_CLASSES, "class_order");
  assert.match(raw.header.trainingDataSha256, hashPattern, "training_hash");
  keys(raw.header.classCounts, EMBEDDING_CLASSES, "counts_schema");
  for (const n of Object.values(raw.header.classCounts))
    assert.ok(Number.isInteger(n) && n > 0 && n <= MAX_ROWS, "class_count");
  const count = Object.values(raw.header.classCounts).reduce((a, b) => a + b, 0);
  assert.ok(
    count >= 6 && count <= MAX_ROWS && raw.header.trainingCount === count,
    "training_count",
  );
  dense(raw.coefficients, 6, "coefficient_classes");
  let slopeSquared = 0;
  const coefficients = raw.coefficients.map((row) => {
    dense(row, FEATURE_COUNT + 1, "coefficient_dimensions");
    const copy = row.map((value, j) =>
      finite(
        value,
        j === FEATURE_COUNT
          ? biasLimit + NUMERIC_TOLERANCE
          : Math.sqrt(SLOPE_SQUARED_LIMIT) + NUMERIC_TOLERANCE,
        "coefficient_value",
      ),
    );
    slopeSquared += dot(copy.slice(0, FEATURE_COUNT), copy.slice(0, FEATURE_COUNT));
    return copy;
  });
  assert.ok(slopeSquared <= SLOPE_SQUARED_LIMIT + NUMERIC_TOLERANCE, "coefficient_norm_bound");
  return {
    header: makeHeader(raw.header.classCounts, raw.header.trainingDataSha256),
    coefficients,
  };
}
function responses(model, feature) {
  return model.coefficients.map(
    (row) => dot(row.slice(0, FEATURE_COUNT), feature) + row[FEATURE_COUNT],
  );
}
export function predictEmbeddingHead(rawModel, input) {
  const model = parseEmbeddingHead(rawModel),
    feature = validateEmbeddingFeature(input);
  const values = responses(model, feature);
  assert.ok(values.every(Number.isFinite), "nonfinite_response");
  const ordered = values
    .map((response, i) => ({ label: EMBEDDING_CLASSES[i], response }))
    .sort((a, b) => b.response - a.response);
  const first = ordered[0],
    second = ordered[1],
    margin = first.response - second.response;
  const common = {
    scores: EMBEDDING_CLASSES.map((label, i) => ({ label, response: values[i] })),
    margin,
    scoreMeaning: EMBEDDING_POLICY.scoreMeaning,
  };
  if (first.response === second.response)
    return { status: "unknown", reason: "tied_responses", ...common };
  if (first.label === "unknown") return { status: "unknown", reason: "learned_unknown", ...common };
  if (margin < EMBEDDING_POLICY.rawMargin)
    return { status: "unknown", reason: "weak_margin", ...common };
  return { status: "estimated", kind: first.label, ...common };
}

/** Diagnostic forward/residual arithmetic; these calls must be counted separately by a future runner. */
export function embeddingTrainingDiagnostics(rawModel, input) {
  const model = parseEmbeddingHead(rawModel),
    { rows, counts } = trainingRows(input);
  assert.deepEqual(counts, model.header.classCounts, "diagnostic_counts");
  assert.equal(
    hashTrainingRows(rows),
    model.header.trainingDataSha256,
    "diagnostic_membership_hash",
  );
  const biasResidual = new Float64Array(6);
  const gradient = Array.from({ length: 6 }, () => new Float64Array(FEATURE_COUNT));
  let loss = 0,
    slopeSquared = 0;
  for (let k = 0; k < 6; k++)
    for (let j = 0; j < FEATURE_COUNT; j++) {
      const value = model.coefficients[k][j];
      slopeSquared += value * value;
      gradient[k][j] = EMBEDDING_POLICY.lambda * value;
    }
  for (const row of rows) {
    const predicted = responses(model, row.features),
      weight = 1 / counts[row.label];
    for (let k = 0; k < 6; k++) {
      const residual = predicted[k] - (EMBEDDING_CLASSES[k] === row.label ? 1 : 0);
      loss += weight * residual * residual;
      biasResidual[k] += weight * residual;
      for (let j = 0; j < FEATURE_COUNT; j++) gradient[k][j] += weight * row.features[j] * residual;
    }
  }
  return {
    rows: rows.length,
    weightedSumLoss: loss,
    penalty: EMBEDDING_POLICY.lambda * slopeSquared,
    objective: loss + EMBEDDING_POLICY.lambda * slopeSquared,
    slopeSquared,
    maxWeightedBiasResidual: Math.max(...Array.from(biasResidual, Math.abs)),
    maxNormalEquationResidual: Math.max(...gradient.flatMap((row) => Array.from(row, Math.abs))),
  };
}
