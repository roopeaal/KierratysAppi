import assert from "node:assert/strict";
import test from "node:test";
import {
  LinearHeadError,
  linearHeadClasses,
  linearHeadFeatureCount,
  linearHeadMargin,
  linearHeadMaxStandardizedMagnitude,
  predictLinearHead,
  trainLinearHead,
  validateLinearHead,
} from "../qa/local-vision/linear-head.mjs";

// All rows below are owned numeric fixtures, never image/model observations.
const id = (index) => index.toString(16).padStart(64, "0");
const feature = (index) => Array.from({ length: 18 }, (_, i) => (i === index ? 1 : 0));
const toyRows = () =>
  linearHeadClasses.map((label, index) => ({ id: id(index + 1), label, scores: feature(index) }));
const clone = (value) => JSON.parse(JSON.stringify(value));
const close = (actual, expected, tolerance = 1e-11) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
const rejects = (operation, code) =>
  assert.throws(
    operation,
    (error) => error instanceof LinearHeadError && error.code === code && error.message === code,
  );
function explicitModel() {
  const model = clone(trainLinearHead(toyRows()));
  model.means.fill(0);
  model.scales.fill(1);
  model.coefficients.forEach((row) => {
    row.fill(0);
  });
  return model;
}

test("fixed header, class order and engineering constants cannot be configured", () => {
  assert.deepEqual(linearHeadClasses, ["bottle", "jar", "box", "bag", "cup", "unknown"]);
  assert.equal(linearHeadFeatureCount, 18);
  assert.equal(linearHeadMargin, 0.1);
  assert.equal(linearHeadMaxStandardizedMagnitude, 8);
  assert.ok(Object.isFrozen(linearHeadClasses));
  const model = trainLinearHead(toyRows());
  assert.equal(model.lambda, 1);
  assert.equal(model.featureCount, 18);
  assert.equal(model.schemaVersion, "linear-ridge-head-v1");
  assert.equal(model.maxStandardizedMagnitude, 8);
  assert.deepEqual(model.trainingClassCounts, [1, 1, 1, 1, 1, 1]);
});

test("six orthogonal synthetic rows match the analytic ridge solution", () => {
  const model = trainLinearHead(toyRows());
  for (let i = 0; i < 18; i++) {
    close(model.means[i], i < 6 ? 1 / 6 : 0);
    close(model.scales[i], i < 6 ? Math.sqrt(5) / 6 : 1);
  }
  for (let label = 0; label < 6; label++) {
    close(model.coefficients[label][0], 1 / 6);
    for (let i = 0; i < 18; i++)
      close(
        model.coefficients[label][i + 1],
        i >= 6 ? 0 : i === label ? (5 * Math.sqrt(5)) / 41 : -Math.sqrt(5) / 41,
      );
    const result = predictLinearHead(model, feature(label));
    close(result.margin, 36 / 41);
    close(result.rawScores[label].score, 1 / 6 + 30 / 41);
    for (let other = 0; other < 6; other++)
      if (other !== label) close(result.rawScores[other].score, 1 / 6 - 6 / 41);
    assert.equal(result.status, label === 5 ? "unknown" : "estimated");
    if (label < 5) assert.equal(result.kind, linearHeadClasses[label]);
  }
});

test("stable opaque-id sorting gives byte-identical output and training hash", () => {
  const rows = toyRows(),
    original = JSON.stringify(rows);
  const forward = trainLinearHead(rows),
    reversed = trainLinearHead([...rows].reverse());
  assert.equal(JSON.stringify(forward), JSON.stringify(reversed));
  assert.equal(JSON.stringify(rows), original);
  assert.match(forward.trainingHash, /^[a-f0-9]{64}$/u);
  const changed = clone(rows);
  changed[0].scores[17] = 0.01;
  assert.notEqual(trainLinearHead(changed).trainingHash, forward.trainingHash);
});

test("unweighted population normalization uses training rows only", () => {
  const rows = toyRows();
  rows.forEach((row, index) => {
    row.scores[17] = index / 10;
  });
  const model = trainLinearHead(rows),
    before = JSON.stringify(model);
  close(model.means[17], 0.25);
  close(model.scales[17], Math.sqrt(0.175 / 6));
  predictLinearHead(model, Array(18).fill(-1));
  predictLinearHead(model, Array(18).fill(1));
  assert.equal(JSON.stringify(model), before);
});

test("constant and collinear features remain solvable with unpenalized bias", () => {
  const rows = toyRows();
  for (const row of rows) row.scores.fill(1);
  rows.push(
    ...Array.from({ length: 4 }, (_, i) => ({
      id: id(20 + i),
      label: "bottle",
      scores: Array(18).fill(1),
    })),
  );
  const model = trainLinearHead(rows);
  assert.deepEqual(model.means, Array(18).fill(1));
  assert.deepEqual(model.scales, Array(18).fill(1));
  for (const coefficients of model.coefficients) {
    close(coefficients[0], 1 / 6);
    assert.deepEqual(coefficients.slice(1), Array(18).fill(0));
  }
  const result = predictLinearHead(model, Array(18).fill(1));
  assert.equal(result.status, "unknown");
  assert.ok(result.margin < 1e-12);
  const collinear = toyRows();
  collinear.forEach((row, index) => {
    row.scores.fill(index % 2 ? -1 : 1);
  });
  assert.ok(trainLinearHead(collinear).coefficients.flat().every(Number.isFinite));
});

test("unbalanced classes satisfy the joint weighted normal equations and objective bound", () => {
  const rows = toyRows();
  for (let i = 0; i < 4; i++)
    rows.push({ id: id(30 + i), label: "bottle", scores: Array(18).fill((i + 1) / 10) });
  const model = trainLinearHead(rows),
    gradients = Array.from({ length: 6 }, () => Array(19).fill(0));
  let loss = 0;
  const weightedFeatureMeans = Array(18).fill(0);
  for (const row of rows) {
    const label = linearHeadClasses.indexOf(row.label),
      weight = 1 / model.trainingClassCounts[label];
    const x = [1, ...row.scores.map((value, i) => (value - model.means[i]) / model.scales[i])];
    for (let i = 0; i < 18; i++) weightedFeatureMeans[i] += weight * x[i + 1];
    for (let category = 0; category < 6; category++) {
      const prediction = model.coefficients[category].reduce(
        (sum, coefficient, i) => sum + coefficient * x[i],
        0,
      );
      const residual = prediction - (category === label ? 1 : 0);
      loss += weight * residual * residual;
      for (let i = 0; i < 19; i++) gradients[category][i] += weight * residual * x[i];
    }
  }
  assert.ok(
    weightedFeatureMeans.some((value) => Math.abs(value) > 0.01),
    "Unweighted standardization must not incorrectly zero the weighted bias cross terms",
  );
  let squaredNorm = 0;
  for (let category = 0; category < 6; category++) {
    for (let i = 0; i < 19; i++) {
      if (i > 0) {
        gradients[category][i] += model.coefficients[category][i];
        squaredNorm += model.coefficients[category][i] ** 2;
      }
      close(gradients[category][i], 0, 1e-10);
    }
  }
  assert.ok(loss + squaredNorm <= 5 + 1e-10);
  assert.ok(Math.sqrt(squaredNorm) <= Math.sqrt(5) + 1e-10);
});

test("exact and near-zero population scales use the fixed floor, not input tuning", () => {
  const rows = toyRows();
  rows.forEach((row, i) => {
    row.scores[16] = i % 2 ? 1e-13 : -1e-13;
    row.scores[17] = i % 2 ? 2e-12 : -2e-12;
  });
  const model = trainLinearHead(rows);
  assert.equal(model.scales[16], 1);
  close(model.scales[17], 2e-12, 1e-25);
  const unseen = feature(0);
  unseen[17] = 1;
  const result = predictLinearHead(model, unseen);
  assert.equal(result.reason, "out_of_training_range");
  assert.equal(result.rawScores, null);
  assert.equal(result.margin, null);
});

test("exact standardized8 is allowed and any value beyond8 abstains without clipping", () => {
  const model = explicitModel();
  model.scales[0] = 0.1;
  model.coefficients[0][1] = 0.1;
  const boundary = Array(18).fill(0);
  boundary[0] = 0.8;
  assert.equal(predictLinearHead(model, boundary).status, "estimated");
  const beyond = [...boundary];
  beyond[0] = 0.800000000000001;
  assert.equal(predictLinearHead(model, beyond).reason, "out_of_training_range");
  beyond[0] = -0.800000000000001;
  assert.equal(predictLinearHead(model, beyond).reason, "out_of_training_range");
});

test("raw margin0.10 is inclusive while weaker margins and ties are unknown", () => {
  const model = explicitModel();
  model.coefficients[0][0] = 0.1;
  let result = predictLinearHead(model, Array(18).fill(0));
  assert.equal(result.status, "estimated");
  assert.equal(result.kind, "bottle");
  assert.equal(result.margin, 0.1);
  assert.equal(result.scoreMeaning, "regularized_linear_score_not_probability");
  model.coefficients[0][0] = 0.099999999999;
  assert.equal(predictLinearHead(model, Array(18).fill(0)).reason, "weak_margin");
  model.coefficients[0][0] = 0;
  result = predictLinearHead(model, Array(18).fill(0));
  assert.equal(result.reason, "tied_scores");
  assert.equal(result.margin, 0);
  model.coefficients[0][0] = 1;
  model.coefficients[1][0] = 1;
  assert.equal(predictLinearHead(model, Array(18).fill(0)).reason, "tied_scores");
});

test("an unknown winner never becomes a known kind even with a large margin", () => {
  const model = explicitModel();
  model.coefficients[5][0] = 2;
  const result = predictLinearHead(model, Array(18).fill(0));
  assert.equal(result.status, "unknown");
  assert.equal(result.reason, "outside_kind");
  assert.equal(result.margin, 2);
  assert.equal(result.rawScores.length, 6);
  assert.equal("kind" in result, false);
});

test("training accepts at most100 rows and requires all six classes", () => {
  const rows = toyRows();
  for (let i = 7; i <= 100; i++)
    rows.push({ id: id(i), label: "bottle", scores: Array(18).fill(0) });
  assert.equal(trainLinearHead(rows).trainingRows, 100);
  rejects(
    () => trainLinearHead([...rows, { id: id(101), label: "bottle", scores: feature(0) }]),
    "invalid_training_rows",
  );
  rejects(() => trainLinearHead(toyRows().slice(0, 5)), "invalid_training_rows");
  const missing = toyRows();
  missing[5].label = "bottle";
  rejects(() => trainLinearHead(missing), "missing_training_class");
});

test("duplicate, nonopaque, malformed and extra training fields fail closed", () => {
  const mutations = [
    (rows) => {
      rows[1].id = rows[0].id;
    },
    (rows) => {
      rows[0].id = "bottle-labelled-file";
    },
    (rows) => {
      rows[0].label = "battery";
    },
    (rows) => {
      rows[0].scores = Array(17).fill(0);
    },
    (rows) => {
      rows[0].scores[0] = Number.NaN;
    },
    (rows) => {
      rows[0].scores[0] = Number.POSITIVE_INFINITY;
    },
    (rows) => {
      rows[0].scores[0] = 1.00001;
    },
    (rows) => {
      rows[0].scores[0] = -1.00001;
    },
    (rows) => {
      rows[0].scores[0] = "0";
    },
    (rows) => {
      rows[0].extra = true;
    },
    (rows) => {
      delete rows[0].scores[0];
    },
  ];
  for (const mutate of mutations) {
    const rows = toyRows();
    mutate(rows);
    rejects(() => trainLinearHead(rows), "invalid_training_rows");
  }
  for (const invalid of [null, {}, "rows", [], new Float64Array(6)])
    rejects(() => trainLinearHead(invalid), "invalid_training_rows");
});

test("JSON persistence retains exact results but returns immutable independent model copies", () => {
  const model = trainLinearHead(toyRows()),
    parsed = validateLinearHead(JSON.parse(JSON.stringify(model)));
  assert.deepEqual(parsed, model);
  assert.notEqual(parsed.means, model.means);
  assert.ok(
    Object.isFrozen(model) &&
      Object.isFrozen(model.means) &&
      Object.isFrozen(model.coefficients[0]),
  );
  assert.deepEqual(predictLinearHead(parsed, feature(1)), predictLinearHead(model, feature(1)));
  assert.equal("ids" in model, false);
  assert.equal("rows" in model, false);
});

test("closed model schema rejects changed policies, shapes and nonfinite numeric state", () => {
  const mutations = [
    (m) => {
      m.extra = "no";
    },
    (m) => {
      m.schemaVersion = "other";
    },
    (m) => {
      m.algorithm = "softmax";
    },
    (m) => {
      m.normalization = "test-data";
    },
    (m) => {
      m.featureCount = 17;
    },
    (m) => {
      m.classes.reverse();
    },
    (m) => {
      m.lambda = 0;
    },
    (m) => {
      m.decisionMargin = 0.01;
    },
    (m) => {
      m.maxStandardizedMagnitude = 9;
    },
    (m) => {
      m.trainingRows = 101;
    },
    (m) => {
      m.trainingHash = "A".repeat(64);
    },
    (m) => {
      m.trainingClassCounts[0] = 0;
    },
    (m) => {
      m.trainingClassCounts[0] = 2;
    },
    (m) => {
      m.means[0] = 2;
    },
    (m) => {
      m.means[0] = Number.NaN;
    },
    (m) => {
      m.scales[0] = 0;
    },
    (m) => {
      m.scales[0] = 1e-13;
    },
    (m) => {
      m.scales[0] = 2;
    },
    (m) => {
      m.coefficients[0][0] = Number.POSITIVE_INFINITY;
    },
    (m) => {
      m.coefficients[0][0] = 1e7;
    },
    (m) => {
      m.coefficients[0].pop();
    },
    (m) => {
      m.coefficients.pop();
    },
    (m) => {
      m.means.extra = 1;
    },
  ];
  for (const mutate of mutations) {
    const model = explicitModel();
    mutate(model);
    rejects(() => validateLinearHead(model), "invalid_model");
  }
});

test("prediction rejects invalid features rather than clipping or treating errors as unknown", () => {
  const model = explicitModel();
  for (const values of [
    null,
    {},
    Array(17).fill(0),
    Array(19).fill(0),
    Array(18).fill(Number.NaN),
    Array(18).fill(Number.NEGATIVE_INFINITY),
    Array(18).fill(1.1),
    Array(18).fill("0"),
  ])
    rejects(() => predictLinearHead(model, values), "invalid_features");
  const edge = Array(18).fill(-1);
  edge[0] = 1;
  assert.equal(predictLinearHead(model, edge).status, "unknown");
});

test("accessors, proxies and inherited objects cannot leak diagnostics or mutate inputs", () => {
  const model = explicitModel();
  Object.defineProperty(model, "means", {
    enumerable: true,
    get() {
      throw new Error("private diagnostic");
    },
  });
  rejects(() => validateLinearHead(model), "invalid_model");
  const rows = toyRows();
  Object.defineProperty(rows[0], "scores", {
    enumerable: true,
    get() {
      throw new Error("private diagnostic");
    },
  });
  rejects(() => trainLinearHead(rows), "invalid_training_rows");
  const proxy = new Proxy(
    {},
    {
      getPrototypeOf() {
        throw new Error("private diagnostic");
      },
    },
  );
  rejects(() => validateLinearHead(proxy), "invalid_model");
  const inherited = Object.assign(Object.create({ injected: true }), explicitModel());
  rejects(() => validateLinearHead(inherited), "invalid_model");
});
