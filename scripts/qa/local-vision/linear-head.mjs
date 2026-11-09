// Pure bounded diagnostic math. No filesystem, image/model, network or app access.
// These linear scores and engineering guards are not calibrated probabilities.
import { createHash } from "node:crypto";

export const linearHeadClasses = Object.freeze(["bottle", "jar", "box", "bag", "cup", "unknown"]);
export const linearHeadFeatureCount = 18;
export const linearHeadMargin = 0.1;
export const linearHeadMaxStandardizedMagnitude = 8;
const lambda = 1;
const scaleFloor = 1e-12;
const coefficientBound = 1e6;
const idPattern = /^(?:[a-f0-9]{64}|r-[a-f0-9]{20,64})$/u;
const hashPattern = /^[a-f0-9]{64}$/u;
const errorCodes = new Set([
  "invalid_input",
  "invalid_training_rows",
  "invalid_features",
  "invalid_model",
  "missing_training_class",
  "unstable_system",
  "non_finite_result",
]);

export class LinearHeadError extends Error {
  constructor(code) {
    const safe = errorCodes.has(code) ? code : "invalid_input";
    super(safe);
    this.name = "LinearHeadError";
    this.code = safe;
  }
}
const fail = (code) => {
  throw new LinearHeadError(code);
};
function guarded(code, operation) {
  try {
    return operation();
  } catch (error) {
    let safe = code;
    try {
      if (error instanceof LinearHeadError && errorCodes.has(error.code)) safe = error.code;
    } catch {
      /* Never forward rejection accessors, source values or diagnostics. */
    }
    return fail(safe);
  }
}
function record(input, fields, code) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return fail(code);
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== null && prototype !== Object.prototype) return fail(code);
  const descriptors = Object.getOwnPropertyDescriptors(input),
    keys = Reflect.ownKeys(descriptors);
  if (keys.length !== fields.length || !fields.every((field) => keys.includes(field)))
    return fail(code);
  const result = {};
  for (const field of fields) {
    const descriptor = descriptors[field];
    if (!descriptor || !("value" in descriptor)) return fail(code);
    result[field] = descriptor.value;
  }
  return result;
}
function array(input, length, code) {
  if (!Array.isArray(input) || input.length !== length) return fail(code);
  const descriptors = Object.getOwnPropertyDescriptors(input),
    keys = Reflect.ownKeys(descriptors);
  if (keys.length !== length + 1) return fail(code);
  const result = [];
  for (let index = 0; index < length; index++) {
    const descriptor = descriptors[String(index)];
    if (!descriptor || !("value" in descriptor)) return fail(code);
    result.push(descriptor.value);
  }
  return result;
}
function vector(input, length, predicate, code) {
  const result = array(input, length, code);
  if (
    !result.every(
      (value) => typeof value === "number" && Number.isFinite(value) && predicate(value),
    )
  )
    return fail(code);
  return result;
}
function features(input, code = "invalid_features") {
  return vector(input, linearHeadFeatureCount, (value) => value >= -1 && value <= 1, code);
}
function freezeModel(model) {
  for (const row of model.coefficients) Object.freeze(row);
  for (const field of ["classes", "trainingClassCounts", "means", "scales", "coefficients"])
    Object.freeze(model[field]);
  return Object.freeze(model);
}

function parseModel(input) {
  const code = "invalid_model";
  const model = record(
    input,
    [
      "schemaVersion",
      "algorithm",
      "normalization",
      "featureCount",
      "classes",
      "lambda",
      "decisionMargin",
      "maxStandardizedMagnitude",
      "trainingRows",
      "trainingClassCounts",
      "trainingHash",
      "means",
      "scales",
      "coefficients",
    ],
    code,
  );
  if (
    model.schemaVersion !== "linear-ridge-head-v1" ||
    model.algorithm !== "class-balanced-ridge-least-squares-v1" ||
    model.normalization !== "train-population-standardization-v1" ||
    model.featureCount !== linearHeadFeatureCount ||
    model.lambda !== lambda ||
    model.decisionMargin !== linearHeadMargin ||
    model.maxStandardizedMagnitude !== linearHeadMaxStandardizedMagnitude
  )
    return fail(code);
  const classes = array(model.classes, linearHeadClasses.length, code);
  if (!classes.every((value, index) => value === linearHeadClasses[index])) return fail(code);
  if (
    !Number.isInteger(model.trainingRows) ||
    model.trainingRows < 6 ||
    model.trainingRows > 100 ||
    typeof model.trainingHash !== "string" ||
    !hashPattern.test(model.trainingHash)
  )
    return fail(code);
  const counts = vector(
    model.trainingClassCounts,
    6,
    (value) => Number.isInteger(value) && value >= 1 && value <= 100,
    code,
  );
  if (counts.reduce((total, count) => total + count, 0) !== model.trainingRows) return fail(code);
  const means = vector(model.means, linearHeadFeatureCount, (value) => Math.abs(value) <= 1, code);
  const scales = vector(
    model.scales,
    linearHeadFeatureCount,
    (value) => value > scaleFloor && value <= 1,
    code,
  );
  const coefficients = array(model.coefficients, 6, code).map((row) =>
    vector(row, linearHeadFeatureCount + 1, (value) => Math.abs(value) <= coefficientBound, code),
  );
  return freezeModel({
    ...model,
    classes,
    trainingClassCounts: counts,
    means,
    scales,
    coefficients,
  });
}

/** Strict closed JSON-compatible model schema, copied to remove mutable inputs. */
export function validateLinearHead(input) {
  return guarded("invalid_model", () => parseModel(input));
}

function trainingRows(input) {
  const code = "invalid_training_rows";
  if (!Array.isArray(input) || input.length < 6 || input.length > 100) return fail(code);
  const rows = array(input, input.length, code),
    seen = new Set();
  return rows
    .map((value) => {
      const row = record(value, ["id", "label", "scores"], code);
      if (
        typeof row.id !== "string" ||
        !idPattern.test(row.id) ||
        seen.has(row.id) ||
        !linearHeadClasses.includes(row.label)
      )
        return fail(code);
      seen.add(row.id);
      return { id: row.id, label: row.label, scores: features(row.scores, code) };
    })
    .sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
}

function cholesky(matrix) {
  const size = matrix.length,
    lower = Array.from({ length: size }, () => Array(size).fill(0));
  for (let row = 0; row < size; row++) {
    for (let column = 0; column <= row; column++) {
      let value = matrix[row][column];
      for (let index = 0; index < column; index++)
        value -= lower[row][index] * lower[column][index];
      if (!Number.isFinite(value)) return fail("non_finite_result");
      if (row === column) {
        if (value <= scaleFloor) return fail("unstable_system");
        lower[row][column] = Math.sqrt(value);
      } else lower[row][column] = value / lower[column][column];
    }
  }
  return lower;
}
function solve(lower, rhs) {
  const size = lower.length,
    forward = Array(size).fill(0),
    output = Array(size).fill(0);
  for (let row = 0; row < size; row++) {
    let value = rhs[row];
    for (let index = 0; index < row; index++) value -= lower[row][index] * forward[index];
    forward[row] = value / lower[row][row];
  }
  for (let row = size - 1; row >= 0; row--) {
    let value = forward[row];
    for (let index = row + 1; index < size; index++) value -= lower[index][row] * output[index];
    output[row] = value / lower[row][row];
    if (!Number.isFinite(output[row]) || Math.abs(output[row]) > coefficientBound)
      return fail("non_finite_result");
  }
  return output;
}

/** Fits exactly one fixed regularized linear head; only supplied training rows exist here. */
export function trainLinearHead(input) {
  return guarded("invalid_training_rows", () => {
    const rows = trainingRows(input),
      counts = linearHeadClasses.map((label) => rows.filter((row) => row.label === label).length);
    if (counts.some((count) => count === 0)) return fail("missing_training_class");
    const sums = Array(linearHeadFeatureCount).fill(0);
    for (const row of rows)
      for (let index = 0; index < sums.length; index++) sums[index] += row.scores[index];
    const means = sums.map((sum) => sum / rows.length);
    const scales = means.map((mean, index) => {
      let sum = 0;
      for (const row of rows) sum += (row.scores[index] - mean) ** 2;
      const scale = Math.sqrt(sum / rows.length);
      return scale <= scaleFloor ? 1 : scale;
    });
    const size = linearHeadFeatureCount + 1;
    const normal = Array.from({ length: size }, () => Array(size).fill(0));
    const targets = Array.from({ length: 6 }, () => Array(size).fill(0));
    for (const row of rows) {
      const label = linearHeadClasses.indexOf(row.label),
        weight = 1 / counts[label];
      const x = [1, ...row.scores.map((value, index) => (value - means[index]) / scales[index])];
      for (let i = 0; i < size; i++) {
        targets[label][i] += weight * x[i];
        for (let j = 0; j <= i; j++) normal[i][j] += weight * x[i] * x[j];
      }
    }
    for (let i = 0; i < size; i++) {
      if (i > 0) normal[i][i] += lambda;
      for (let j = 0; j < i; j++) normal[j][i] = normal[i][j];
    }
    const lower = cholesky(normal),
      coefficients = targets.map((target) => solve(lower, target));
    const trainingHash = createHash("sha256").update(JSON.stringify(rows)).digest("hex");
    return parseModel({
      schemaVersion: "linear-ridge-head-v1",
      algorithm: "class-balanced-ridge-least-squares-v1",
      normalization: "train-population-standardization-v1",
      featureCount: linearHeadFeatureCount,
      classes: [...linearHeadClasses],
      lambda,
      decisionMargin: linearHeadMargin,
      maxStandardizedMagnitude: linearHeadMaxStandardizedMagnitude,
      trainingRows: rows.length,
      trainingClassCounts: counts,
      trainingHash,
      means,
      scales,
      coefficients,
    });
  });
}

/** The head may estimate a coarse form, not identify a product/material or authorize sorting. */
export function predictLinearHead(input, values) {
  return guarded("invalid_features", () => {
    const model = parseModel(input),
      scores = features(values);
    const normalized = scores.map(
      (value, index) => (value - model.means[index]) / model.scales[index],
    );
    const meaning = "regularized_linear_score_not_probability";
    if (
      normalized.some(
        (value) => !Number.isFinite(value) || Math.abs(value) > linearHeadMaxStandardizedMagnitude,
      )
    )
      return {
        status: "unknown",
        reason: "out_of_training_range",
        rawScores: null,
        margin: null,
        scoreMeaning: meaning,
      };
    const rawScores = model.coefficients.map((row, index) => {
      let value = row[0];
      for (let i = 0; i < normalized.length; i++) value += row[i + 1] * normalized[i];
      if (!Number.isFinite(value)) return fail("non_finite_result");
      return { label: linearHeadClasses[index], score: value };
    });
    const ranked = rawScores
      .map((row, index) => ({ ...row, index }))
      .sort((a, b) => b.score - a.score || a.index - b.index);
    const top = ranked[0],
      margin = top.score - ranked[1].score;
    const common = { rawScores, margin, scoreMeaning: meaning };
    if (margin === 0) return { status: "unknown", reason: "tied_scores", ...common };
    if (top.label === "unknown") return { status: "unknown", reason: "outside_kind", ...common };
    if (margin < linearHeadMargin) return { status: "unknown", reason: "weak_margin", ...common };
    return { status: "estimated", kind: top.label, ...common };
  });
}
