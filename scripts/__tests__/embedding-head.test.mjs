// All numeric vectors below are made-up unit directions, never image features.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import {
  combineEmbeddingViews,
  EMBEDDING_CLASSES,
  EMBEDDING_POLICY,
  embeddingTrainingDiagnostics,
  embeddingTrainingHash,
  FEATURE_COUNT,
  fitEmbeddingHead,
  parseEmbeddingHead,
  predictEmbeddingHead,
  VIEW_FEATURE_COUNT,
  validateEmbeddingFeature,
} from "../qa/local-vision/embedding-head.mjs";

const hash = (s) => createHash("sha256").update(s).digest("hex");
const copy = (value) => structuredClone(value);
const support = [0, 1, 2, 512, 513, 514];
function basis(index) {
  const v = Array(VIEW_FEATURE_COUNT).fill(0);
  v[index] = 1;
  return v;
}
function toyFeatures(k, i = 0) {
  const angle = (2 * Math.PI * k) / 6 + 0.07 * i;
  const a = Array(VIEW_FEATURE_COUNT).fill(0),
    b = [...a];
  a[0] = 0.8 * Math.cos(angle);
  a[1] = 0.8 * Math.sin(angle);
  a[2] = 0.6;
  b[0] = Math.sqrt(0.75) * Math.cos(2 * angle + 0.1);
  b[1] = Math.sqrt(0.75) * Math.sin(2 * angle + 0.1);
  b[2] = 0.5;
  return combineEmbeddingViews(a, b);
}
function toyRows(counts = [2, 2, 2, 2, 2, 2], constant = false) {
  return EMBEDDING_CLASSES.flatMap((label, k) =>
    Array.from({ length: counts[k] }, (_, i) => ({
      id: hash(`synthetic-${label}-${i}`),
      label,
      features: constant ? combineEmbeddingViews(basis(0), basis(1)) : toyFeatures(k, i),
    })),
  );
}
function close(a, b, tolerance = 1e-10) {
  assert.ok(Math.abs(a - b) <= tolerance, `${a} vs ${b}`);
}

// Independent low-dimensional primal normal equations, not the production dual solver.
// The six nonzero toy coordinates are padded across BOTH512-dimensional views.
function primalReference(rows) {
  const size = support.length + 1,
    outputs = 6;
  const counts = Object.fromEntries(
    EMBEDDING_CLASSES.map((label) => [label, rows.filter((r) => r.label === label).length]),
  );
  const matrix = Array.from({ length: size }, () => Array(size + outputs).fill(0));
  for (const row of [...rows].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) {
    const x = [...support.map((j) => row.features[j]), 1],
      weight = 1 / counts[row.label];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) matrix[i][j] += weight * x[i] * x[j];
      matrix[i][size + EMBEDDING_CLASSES.indexOf(row.label)] += weight * x[i];
    }
  }
  for (let i = 0; i < size - 1; i++) matrix[i][i] += 0.1;
  for (let column = 0; column < size; column++) {
    let pivot = column;
    for (let r = column + 1; r < size; r++)
      if (Math.abs(matrix[r][column]) > Math.abs(matrix[pivot][column])) pivot = r;
    assert.ok(Math.abs(matrix[pivot][column]) > 1e-12);
    [matrix[pivot], matrix[column]] = [matrix[column], matrix[pivot]];
    const scale = matrix[column][column];
    for (let j = column; j < size + outputs; j++) matrix[column][j] /= scale;
    for (let r = 0; r < size; r++)
      if (r !== column) {
        const factor = matrix[r][column];
        for (let j = column; j < size + outputs; j++) matrix[r][j] -= factor * matrix[column][j];
      }
  }
  return EMBEDDING_CLASSES.map((_, k) => matrix.map((r) => r[size + k]));
}
function manualConstantHead(responses) {
  const model = fitEmbeddingHead(toyRows([1, 1, 1, 1, 1, 1], true));
  for (let k = 0; k < 6; k++) {
    model.coefficients[k].fill(0);
    model.coefficients[k][FEATURE_COUNT] = responses[k];
  }
  return model;
}

test("both individual512views are mandatory and combine only by concat/sqrt2", () => {
  const a = basis(2),
    b = basis(7),
    combined = combineEmbeddingViews(a, b);
  assert.equal(combined.length, 1024);
  close(combined[2], 1 / Math.SQRT2, 0);
  close(combined[519], 1 / Math.SQRT2, 0);
  assert.equal(combined.filter((v) => v !== 0).length, 2);
  assert.deepEqual(validateEmbeddingFeature(combined), combined);
  for (const bad of [
    undefined,
    null,
    [],
    basis(0).slice(1),
    Array(512).fill(0),
    basis(0).map((v) => 0.99 * v),
  ]) {
    assert.throws(() => combineEmbeddingViews(a, bad));
    assert.throws(() => combineEmbeddingViews(bad, b));
  }
});
test("overall renormalization cannot hide a missing or unbalanced view", () => {
  const missing = Array(FEATURE_COUNT).fill(0);
  missing[0] = 1;
  assert.throws(() => validateEmbeddingFeature(missing), /missing_or_unbalanced_view/);
  const skewed = Array(FEATURE_COUNT).fill(0);
  skewed[0] = Math.sqrt(0.8);
  skewed[512] = Math.sqrt(0.2);
  assert.throws(() => validateEmbeddingFeature(skewed), /missing_or_unbalanced_view/);
});
test("unit geometry rejects nonfinite values, wrong dimensions, sparse and accessor vectors", () => {
  for (const bad of [NaN, Infinity, -Infinity, "0.5", new Number(1)]) {
    const v = basis(0);
    v[0] = bad;
    assert.throws(() => combineEmbeddingViews(v, basis(0)));
  }
  const sparse = Array(512);
  sparse[0] = 1;
  assert.throws(() => combineEmbeddingViews(sparse, basis(0)));
  const accessor = basis(0);
  Object.defineProperty(accessor, "1", { get: () => 0 });
  assert.throws(() => combineEmbeddingViews(accessor, basis(0)));
  assert.throws(() => validateEmbeddingFeature(Array(1024).fill(0)), /feature_not_unit/);
  assert.throws(
    () => validateEmbeddingFeature(new Float32Array(toyFeatures(0))),
    /feature_dimension/,
  );
});
test("dual ridge matches independent padded-toy primal joint-intercept normal equations", () => {
  const rows = toyRows(),
    model = fitEmbeddingHead(rows),
    primal = primalReference(rows);
  for (let k = 0; k < 6; k++) {
    for (let j = 0; j < support.length; j++) close(model.coefficients[k][support[j]], primal[k][j]);
    close(model.coefficients[k][FEATURE_COUNT], primal[k].at(-1));
    for (let j = 0; j < FEATURE_COUNT; j++)
      if (!support.includes(j)) close(model.coefficients[k][j], 0, 1e-12);
  }
});
test("unbalanced class weights optimize the bias jointly, not by unweighted centering", () => {
  const rows = toyRows([1, 2, 3, 4, 5, 6]),
    model = fitEmbeddingHead(rows),
    primal = primalReference(rows);
  for (let k = 0; k < 6; k++) {
    for (let j = 0; j < support.length; j++) close(model.coefficients[k][support[j]], primal[k][j]);
    close(model.coefficients[k][FEATURE_COUNT], primal[k].at(-1));
  }
  const sanity = embeddingTrainingDiagnostics(model, rows);
  assert.ok(sanity.maxWeightedBiasResidual < 1e-10);
  assert.ok(sanity.maxNormalEquationResidual < 1e-10);
});
test("45duplicate constant directions remain SPD and predict the balanced one-sixth bias", () => {
  const rows = toyRows([5, 5, 5, 5, 5, 20], true),
    model = fitEmbeddingHead(rows);
  for (const coefficients of model.coefficients) {
    close(coefficients[FEATURE_COUNT], 1 / 6);
    assert.ok(coefficients.slice(0, FEATURE_COUNT).every((v) => Math.abs(v) < 1e-10));
  }
  const sanity = embeddingTrainingDiagnostics(model, rows);
  close(sanity.objective, 5);
  assert.ok(sanity.slopeSquared <= 50 + 1e-7);
  assert.equal(predictEmbeddingHead(model, rows[0].features).status, "unknown");
});
test("objective and slope bounds use lambda0.1 SUM loss, not lambda1 or averaged loss", () => {
  for (const counts of [
    [1, 1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2],
    [1, 2, 3, 4, 5, 6],
  ]) {
    const rows = toyRows(counts),
      model = fitEmbeddingHead(rows),
      d = embeddingTrainingDiagnostics(model, rows);
    assert.equal(model.header.lambda, 0.1);
    assert.ok(d.objective <= 5 + 1e-7);
    assert.ok(d.slopeSquared <= 50 + 1e-7);
    close(d.penalty, 0.1 * d.slopeSquared);
    close(d.objective, d.weightedSumLoss + d.penalty);
  }
});
test("sorting IDs makes coefficients and serialized bytes deterministic without mutating inputs", () => {
  const rows = toyRows([1, 2, 3, 4, 5, 6]),
    original = copy(rows);
  const first = fitEmbeddingHead(rows),
    second = fitEmbeddingHead([...rows].reverse());
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(first), JSON.stringify(second));
  assert.deepEqual(rows, original);
});
test("membership hash is self-computed from canonical rows and diagnostics reject same-count tampering", () => {
  const rows = toyRows([1, 2, 3, 4, 5, 6]);
  const canonical = copy(rows)
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((r) => ({
      id: r.id,
      label: r.label,
      features: r.features.map((v) => (Object.is(v, -0) ? 0 : v)),
    }));
  const expected = hash(JSON.stringify(canonical)),
    model = fitEmbeddingHead(rows);
  assert.equal(embeddingTrainingHash(rows), expected);
  assert.equal(model.header.trainingDataSha256, expected);
  const wrongHeader = copy(model);
  wrongHeader.header.trainingDataSha256 = hash("spoofed-membership");
  assert.throws(
    () => embeddingTrainingDiagnostics(wrongHeader, rows),
    /diagnostic_membership_hash/,
  );
  const changedId = copy(rows);
  changedId[0].id = hash("different-member-id");
  assert.throws(() => embeddingTrainingDiagnostics(model, changedId), /diagnostic_membership_hash/);
  const changedFeature = copy(rows);
  changedFeature[0].features = toyFeatures(0, 10);
  assert.throws(
    () => embeddingTrainingDiagnostics(model, changedFeature),
    /diagnostic_membership_hash/,
  );
  const changedLabels = copy(rows),
    second = changedLabels.findIndex((r) => r.label !== changedLabels[0].label);
  [changedLabels[0].label, changedLabels[second].label] = [
    changedLabels[second].label,
    changedLabels[0].label,
  ];
  assert.throws(
    () => embeddingTrainingDiagnostics(model, changedLabels),
    /diagnostic_membership_hash/,
  );
  assert.throws(() => fitEmbeddingHead(rows, hash("caller-chosen-hash")), /fit_argument_count/);
});
test("serialized model stores only strict header/counts/hash and6x1025coefficients", () => {
  const model = fitEmbeddingHead(toyRows()),
    serialized = JSON.stringify(model),
    roundtrip = parseEmbeddingHead(JSON.parse(serialized));
  assert.deepEqual(roundtrip, model);
  assert.deepEqual(Object.keys(model).sort(), ["coefficients", "header"]);
  assert.equal(model.coefficients.length, 6);
  assert.ok(model.coefficients.every((row) => row.length === 1025));
  assert.equal(model.header.trainingDataSha256, embeddingTrainingHash(toyRows()));
  assert.equal(model.header.featureCount, 1024);
  assert.deepEqual(model.header.views, ["center", "full-frame-aspect-fit"]);
  assert.equal(model.header.geometry, "raw-unit-no-zscore-weighted-centering-only");
  for (const field of ["rows", "examples", "kernel", "mean", "trainingIds"])
    assert.ok(!(field in model) && !(field in model.header));
});
test("strict model schema rejects unknown policies, NaN, coefficient shape and norm violations", () => {
  const model = fitEmbeddingHead(toyRows());
  for (const mutate of [
    (m) => {
      m.extra = "untrusted";
    },
    (m) => {
      m.header.extra = 1;
    },
    (m) => {
      m.header.lambda = 1;
    },
    (m) => {
      m.header.rawMargin = 0;
    },
    (m) => {
      m.header.featureCount = 512;
    },
    (m) => {
      m.header.geometry = "zscore";
    },
    (m) => {
      m.header.views.reverse();
    },
    (m) => {
      m.header.unitNormTolerance = 1e-5;
    },
    (m) => {
      m.header.scoreMeaning = "probability";
    },
    (m) => {
      m.header.trainingDataSha256 = "invalid";
    },
    (m) => {
      m.header.classCounts.unknown = 0;
    },
    (m) => {
      m.header.trainingCount++;
    },
    (m) => {
      m.coefficients[0][0] = NaN;
    },
    (m) => {
      m.coefficients[0][0] = Infinity;
    },
    (m) => {
      m.coefficients[0].pop();
    },
    (m) => {
      m.coefficients.pop();
    },
    (m) => {
      m.coefficients[0][0] = 6;
      m.coefficients[0][1] = 6;
    },
    (m) => {
      m.coefficients[0][FEATURE_COUNT] = 8;
    },
  ]) {
    const changed = copy(model);
    mutate(changed);
    assert.throws(() => parseEmbeddingHead(changed));
  }
  const sparse = copy(model);
  delete sparse.coefficients[0][3];
  assert.throws(() => parseEmbeddingHead(sparse));
});
test("training inputs reject duplicate IDs, missing classes, excessive rows and wrong feature schema", () => {
  const rows = toyRows();
  for (const mutate of [
    (r) => {
      r[1].id = r[0].id;
    },
    (r) => {
      r[0].id = "bad";
    },
    (r) => {
      r[0].label = "material";
    },
    (r) => {
      r[0].features[0] = 2;
    },
    (r) => {
      r[0].features.pop();
    },
    (r) => {
      r[0].extra = true;
    },
  ]) {
    const changed = copy(rows);
    mutate(changed);
    assert.throws(() => fitEmbeddingHead(changed));
  }
  assert.throws(
    () => fitEmbeddingHead(rows.filter((r) => r.label !== "unknown")),
    /missing_training_class/,
  );
  assert.throws(
    () =>
      fitEmbeddingHead(
        Array.from({ length: 101 }, (_, i) => ({ ...rows[0], id: hash(`too-many-${i}`) })),
      ),
    /training_count/,
  );
  assert.throws(() => fitEmbeddingHead(rows, "not-hash"), /fit_argument_count/);
});
test("unique rawmargin0.1 is selective and never interpreted as probability", () => {
  const feature = toyFeatures(0);
  const accepted = predictEmbeddingHead(manualConstantHead([0.5, 0.1, 0, 0, 0, 0]), feature);
  assert.equal(accepted.status, "estimated");
  assert.equal(accepted.kind, "bottle");
  assert.equal(accepted.scoreMeaning, "ridge_response_not_probability");
  close(accepted.margin, 0.4);
  assert.equal(
    predictEmbeddingHead(manualConstantHead([0.2, 0.2, 0, 0, 0, 0]), feature).reason,
    "tied_responses",
  );
  assert.equal(
    predictEmbeddingHead(manualConstantHead([0.2, 0.15, 0, 0, 0, 0]), feature).reason,
    "weak_margin",
  );
  assert.equal(
    predictEmbeddingHead(manualConstantHead([0.2, 0, 0, 0, 0, 0.6]), feature).reason,
    "learned_unknown",
  );
  assert.equal(
    predictEmbeddingHead(manualConstantHead([0.1, 0, -0.1, -0.1, -0.1, -0.1]), feature).status,
    "estimated",
  );
});
test("prediction rejects wrong or absent views instead of returning partial confidence", () => {
  const model = manualConstantHead([0.5, 0, 0, 0, 0, 0]);
  assert.throws(() => predictEmbeddingHead(model, basis(0)), /feature_dimension/);
  const partial = Array(1024).fill(0);
  partial[0] = 1;
  assert.throws(() => predictEmbeddingHead(model, partial), /missing_or_unbalanced_view/);
});
test("prototype has no data acquisition, filesystem writes, network or inference dependency", () => {
  const source = fs.readFileSync(
    new URL("../qa/local-vision/embedding-head.mjs", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    source,
    /node:(?:fs|child_process|http|https|net)|process\.env|fetch\(|OPENAI_API_KEY/u,
  );
  assert.equal(EMBEDDING_POLICY.lambda, 0.1);
  assert.equal(EMBEDDING_POLICY.rawMargin, 0.1);
});
