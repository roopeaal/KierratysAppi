// Made-up numeric worker envelopes only. No image/backbone/head prediction is executed.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import {
  decodeEmbeddingPair,
  EMBEDDING_COUNTER_KEYS,
  EMBEDDING_SOURCE_POLICY,
  validateEmbeddingProgress,
} from "../qa/local-vision/embedding-data.mjs";
import { GROUPS } from "../qa/local-vision/linear-data.mjs";

const hash = (s) => createHash("sha256").update(s).digest("hex");
const clone = (v) => structuredClone(v);
const zero = () => Object.fromEntries(EMBEDDING_COUNTER_KEYS.map((k) => [k, 0]));
const steps = [
  ["model_load_started", { modelLoadsAttempted: 1 }],
  ["model_load_completed", { modelLoadsCompleted: 1 }],
  ["decode_started", { imageDecodesAttempted: 1 }],
  ["decode_completed", { imageDecodesCompleted: 1 }],
  ["center_prediction_started", { imagePredictionsAttempted: 1, centerPredictionsAttempted: 1 }],
  ["center_prediction_completed", { imagePredictionsCompleted: 1, centerPredictionsCompleted: 1 }],
  ["fit_prediction_started", { imagePredictionsAttempted: 2, fitPredictionsAttempted: 1 }],
  ["fit_prediction_completed", { imagePredictionsCompleted: 2, fitPredictionsCompleted: 1 }],
];
function progress(n = 8, lastDuration = null) {
  let counters = zero();
  const records = steps.slice(0, n).map(([stage, change], i) => {
    counters = { ...counters, ...change };
    return {
      schemaVersion: EMBEDDING_SOURCE_POLICY.progressSchemaVersion,
      stage,
      durationMs: lastDuration !== null && i === n - 1 ? lastDuration : i + 1,
      counters,
    };
  });
  return { records, counters, stderr: records.map((r) => `${JSON.stringify(r)}\n`).join("") };
}
const scores = (offset) => GROUPS.map((group, i) => ({ group, cosine: offset - i / 100 }));
function view(index) {
  const embedding = Array(512).fill(0);
  embedding[index] = 1;
  return {
    view: index === 0 ? "center" : "full-frame-aspect-fit",
    preprocessing: index === 0 ? "center-square-256-srgb-v1" : "aspect-fit-256-srgb-gray127-v1",
    scorePolicy:
      index === 0 ? "legacy-center-unclamped-dot-v1" : "legacy-fit-roundoff-clamped-dot-v1",
    embeddingDimension: 512,
    normalization: "l2-double-reduction-order-v1",
    outputFeature: "final_emb_1",
    outputShape: [1, 512],
    outputDataType: "Float32",
    embedding,
    embeddingNorm: 1,
    scores: scores(index === 0 ? 0.4 : 0.3),
  };
}
function fixture(withFit = true) {
  const id = hash("original-frozen-source-not-a-real-image"),
    p = progress();
  const { progressSchemaVersion: _unused, ...policy } = EMBEDDING_SOURCE_POLICY;
  const raw = {
    ...policy,
    status: "observed",
    inputImageSha256: id,
    durationMs: 9,
    views: [view(0), view(1)],
    counters: p.counters,
  };
  const row = {
    id,
    expectedCenter18: clone(raw.views[0].scores),
    expectedFit18: withFit ? clone(raw.views[1].scores) : null,
  };
  const options = {
    expectedBinarySha256: hash("synthetic-worker"),
    attempt: { imageSha256: id, binarySha256: hash("synthetic-worker") },
  };
  return {
    row,
    options,
    call: {
      raw,
      exitCode: 0,
      failed: false,
      signal: null,
      errorCode: null,
      wallMs: 10,
      stdout: `${JSON.stringify(raw)}\n`,
      stderr: p.stderr,
    },
  };
}
const refresh = (f) => {
  f.call.stdout = `${JSON.stringify(f.call.raw)}\n`;
  return f;
};
function decode(f) {
  return decodeEmbeddingPair(f.call, f.row, f.options);
}
function failure(prefix, reason = "processing_failed", completedViews = [], late = false) {
  const f = fixture(),
    p = progress(prefix, late ? 13_000 : null);
  f.call.stderr = p.stderr;
  f.call.exitCode = 1;
  f.call.failed = true;
  f.call.wallMs = late ? 13_002 : 10;
  f.call.raw = {
    schemaVersion: EMBEDDING_SOURCE_POLICY.schemaVersion,
    status: "unavailable",
    reason,
    durationMs: late ? 13_001 : 9,
    counters: p.counters,
    completedViews,
  };
  return refresh(f);
}

test("complete pair verifies both source views, original SHA, exact parity and1024 features", () => {
  const f = fixture(),
    r = decode(f);
  assert.equal(r.valid, true);
  assert.equal(r.operationalSuccess, true);
  assert.equal(r.reason, null);
  assert.equal(r.features.length, 1024);
  assert.equal(r.features[0], 1 / Math.SQRT2);
  assert.equal(r.features[513], 1 / Math.SQRT2);
  assert.equal(r.counters.imagePredictionsAttempted, 2);
  assert.equal(r.counters.imagePredictionsCompleted, 2);
  assert.equal(r.counterEvidence, "exact_worker_footer");
  assert.equal(r.progress.recordCount, 8);
  assert.equal(r.proof.centerParity, true);
  assert.equal(r.proof.fitParity, true);
  assert.equal(r.proof.inputImageSha256, f.row.id);
});
test("unseen fit companion is explicit while both views remain mandatory", () => {
  const f = fixture(false),
    r = decode(f);
  assert.equal(r.valid, true);
  assert.equal(r.proof.fitParity, "not_previously_observed");
  f.call.raw.views.pop();
  refresh(f);
  const invalid = decode(f);
  assert.equal(invalid.valid, false);
  assert.equal(invalid.features, null);
});
test("center and available fit parity compare all18 scores exactly without epsilon", () => {
  for (const index of [0, 1])
    for (let group = 0; group < 18; group++) {
      const f = fixture();
      f.call.raw.views[index].scores[group].cosine += Number.EPSILON;
      refresh(f);
      const r = decode(f);
      assert.equal(r.valid, false);
      assert.equal(r.reason, index === 0 ? "center_parity_failed" : "fit_parity_failed");
      assert.equal(r.features, null);
      assert.equal(r.views, null);
      assert.equal(r.counters.imagePredictionsAttempted, 2);
      assert.equal(r.counters.imagePredictionsCompleted, 2);
      assert.equal(r.counterEvidence, "exact_worker_footer");
    }
  const f = fixture();
  f.row.expectedCenter18[0].cosine = 0;
  f.call.raw.views[0].scores[0].cosine = -0;
  // JSON preserves a literal negative zero when expressly supplied; raw and stdout must agree.
  refresh(f);
  f.call.stdout = f.call.stdout.replace('"cosine":0', '"cosine":-0');
  assert.equal(decode(f).valid, false);
});
test("stage prefixes validate exact source counters and completion cannot precede attempt", () => {
  for (let n = 0; n <= 8; n++) {
    const p = progress(n),
      r = validateEmbeddingProgress(p.stderr);
    assert.equal(r.valid, true);
    assert.equal(r.complete, n === 8);
    assert.equal(r.recordCount, n);
    assert.deepEqual(r.lastCounters, n ? p.counters : null);
  }
  assert.equal(validateEmbeddingProgress("", { allowPartial: false }).valid, false);
  const p = progress();
  p.records[0].counters.modelLoadsCompleted = 1;
  assert.equal(
    validateEmbeddingProgress(p.records.map((r) => `${JSON.stringify(r)}\n`).join("")).valid,
    false,
  );
});
test("duplicate, missing, reordered progress and counter jumps are invalid", () => {
  for (const mutate of [
    (r) => {
      r[1] = clone(r[0]);
    },
    (r) => {
      r.splice(2, 1);
    },
    (r) => {
      [r[2], r[3]] = [r[3], r[2]];
    },
    (r) => {
      r[4].counters.imagePredictionsAttempted = 2;
    },
    (r) => {
      r[5].counters.textPredictionsAttempted = 1;
    },
    (r) => {
      r[6].durationMs = 0;
    },
    (r) => {
      r[6].durationMs = 60_001;
    },
    (r) => {
      r[4].extra = "not-source";
    },
  ]) {
    const records = clone(progress().records);
    mutate(records);
    assert.equal(
      validateEmbeddingProgress(records.map((r) => `${JSON.stringify(r)}\n`).join("")).valid,
      false,
    );
  }
});
test("partial JSON after a kill retains the last validated counter lower bound", () => {
  const p = progress(5),
    r = validateEmbeddingProgress(`${p.stderr}{"partial":`);
  assert.equal(r.valid, false);
  assert.equal(r.recordCount, 5);
  assert.equal(r.lastCounters.centerPredictionsAttempted, 1);
  assert.equal(r.lastCounters.centerPredictionsCompleted, 0);
  assert.equal(validateEmbeddingProgress("x".repeat(64_001)).valid, false);
});
test("known structured failure is never successful abstention or partial features", () => {
  const f = failure(3, "invalid_image"),
    r = decode(f);
  assert.equal(r.valid, true);
  assert.equal(r.operationalSuccess, false);
  assert.equal(r.reason, "invalid_image");
  assert.equal(r.features, null);
  assert.equal(r.views, null);
  assert.equal(r.counters.imagePredictionsAttempted, 0);
  assert.equal(r.counterEvidence, "exact_worker_footer");
  const legacyCarrier = clone(f);
  legacyCarrier.call.failed = false;
  assert.equal(decode(legacyCarrier).valid, true);
  const early = decode(failure(0, "invalid_assets"));
  assert.equal(early.valid, true);
  assert.deepEqual(early.counters, zero());
});
test("late completed prediction counters remain when completedViews lags postprocessing", () => {
  for (const f of [
    failure(6, "timeout", [], true),
    failure(8, "processing_failed", ["center"], true),
    failure(8, "timeout", ["center", "full-frame-aspect-fit"], true),
  ]) {
    const r = decode(f);
    assert.equal(r.valid, true);
    assert.equal(r.operationalSuccess, false);
    assert.equal(r.features, null);
    assert.ok(r.counters.imagePredictionsCompleted >= 1);
    assert.ok(r.progress.lastDurationMs > 12_000);
  }
});
test("unstructured kill retains lower bounds without inventing exact completion counts", () => {
  const f = fixture();
  f.call = {
    ...f.call,
    raw: null,
    stdout: "",
    exitCode: null,
    failed: true,
    errorCode: "ETIMEDOUT",
    signal: "SIGTERM",
    wallMs: 15_001,
    stderr: progress(5).stderr,
  };
  const r = decode(f);
  assert.equal(r.valid, false);
  assert.equal(r.operationalSuccess, false);
  assert.equal(r.counters, null);
  assert.equal(r.features, null);
  assert.equal(r.counterEvidence, "progress_lower_bound");
  assert.equal(r.progress.lastCounters.centerPredictionsAttempted, 1);
  const none = decodeEmbeddingPair({ raw: null, stderr: "" }, f.row, f.options);
  assert.equal(none.counters, null);
  assert.equal(none.counterEvidence, "unavailable");
});
test("success requires zero exit, all8 progress records, matching footer and bounded native/wall time", () => {
  for (const mutate of [
    (f) => {
      f.call.exitCode = 1;
    },
    (f) => {
      f.call.signal = "SIGTERM";
    },
    (f) => {
      f.call.failed = true;
    },
    (f) => {
      f.call.errorCode = "ETIMEDOUT";
    },
    (f) => {
      f.call.raw.durationMs = 12_001;
    },
    (f) => {
      f.call.wallMs = 15_001;
    },
    (f) => {
      f.call.raw.durationMs = 7;
    },
    (f) => {
      f.call.stderr = progress(7).stderr;
    },
    (f) => {
      f.call.raw.counters.fitPredictionsCompleted = 0;
    },
    (f) => {
      f.call.raw.counters.imagePredictionsAttempted = 3;
    },
    (f) => {
      f.call.raw.counters.textPredictionsAttempted = 1;
    },
  ]) {
    const f = fixture();
    mutate(f);
    refresh(f);
    const r = decode(f);
    assert.equal(r.valid, false);
    assert.equal(r.features, null);
  }
});
test("wall deadline is mandatory for success while late failure telemetry remains bounded60s", () => {
  const boundary = fixture();
  boundary.call.wallMs = 15_000;
  assert.equal(decode(boundary).operationalSuccess, true);
  boundary.call.wallMs = 15_001;
  const late = decode(boundary);
  assert.equal(late.valid, false);
  assert.equal(late.operationalSuccess, false);
  assert.equal(late.features, null);
  assert.equal(late.counters, null);
  assert.equal(late.counterEvidence, "progress_lower_bound");
  const failed = failure(6, "timeout", [], true);
  failed.call.wallMs = 60_000;
  assert.equal(decode(failed).valid, true);
  assert.equal(decode(failed).operationalSuccess, false);
  failed.call.wallMs = 60_001;
  assert.equal(decode(failed).valid, false);
});
test("worker backbone, prompt, preprocessing, original hash and runtime pins fail closed", () => {
  for (const [field, value] of [
    ["modelId", "different"],
    ["modelRevision", hash("revision")],
    ["imageWeightSha256", hash("weight")],
    ["compiledGraphSha256", hash("graph")],
    ["compiledTreeSha256", hash("tree")],
    ["prototypesSha256", hash("proto")],
    ["promptsSha256", hash("prompts")],
    ["promptPolicy", "other"],
    ["computeUnits", "all"],
    ["inputImageSha256", hash("sanitized-copy")],
    ["inputPolicy", "reviewer-copy"],
    ["osVersion", "26.6.0"],
    ["status", "ready"],
    ["schemaVersion", "legacy"],
  ]) {
    const f = fixture();
    f.call.raw[field] = value;
    refresh(f);
    assert.equal(decode(f).valid, false);
  }
});
test("both views require unit512 vectors, strict output headers and unique ordered18 scores", () => {
  for (const mutate of [
    (v) => {
      v.view = "center";
    },
    (v) => {
      v.preprocessing = "center-square-256-srgb-v1";
    },
    (v) => {
      v.scorePolicy = "legacy-center-unclamped-dot-v1";
    },
    (v) => {
      v.embeddingDimension = 511;
    },
    (v) => {
      v.outputDataType = "Double";
    },
    (v) => {
      v.outputShape = [512, 1];
    },
    (v) => {
      v.outputFeature = "other";
    },
    (v) => {
      v.normalization = "renormalized-new-policy";
    },
    (v) => {
      v.embedding.pop();
    },
    (v) => {
      v.embedding.fill(0);
      v.embeddingNorm = 0;
    },
    (v) => {
      v.embedding[1] = NaN;
    },
    (v) => {
      v.embedding[1] = Infinity;
    },
    (v) => {
      v.embeddingNorm = 1.0000005;
    },
    (v) => {
      v.scores.reverse();
    },
    (v) => {
      v.scores[1] = clone(v.scores[0]);
    },
    (v) => {
      v.scores[0].cosine = 2;
    },
    (v) => {
      v.extra = true;
    },
  ]) {
    const f = fixture();
    mutate(f.call.raw.views[1]);
    refresh(f);
    assert.equal(decode(f).valid, false);
  }
  const f = fixture();
  f.call.raw.views.reverse();
  refresh(f);
  assert.equal(decode(f).valid, false);
});
test("attempt binary, original image binding and reference presence are mandatory", () => {
  for (const mutate of [
    (f) => {
      f.options.expectedBinarySha256 = hash("wrong");
    },
    (f) => {
      f.options.attempt.imageSha256 = hash("other");
    },
    (f) => {
      delete f.options.attempt;
    },
    (f) => {
      delete f.row.expectedCenter18;
    },
    (f) => {
      delete f.row.expectedFit18;
    },
    (f) => {
      f.row.expectedCenter18[0].group = "unknown";
    },
  ]) {
    const f = fixture();
    mutate(f);
    assert.equal(decode(f).valid, false);
  }
});
test("structured failure prefix, reason, footer and late bounds are validated", () => {
  for (const mutate of [
    (f) => {
      f.call.raw.reason = "invented";
    },
    (f) => {
      f.call.raw.completedViews = ["full-frame-aspect-fit"];
    },
    (f) => {
      f.call.raw.completedViews = ["center"];
    },
    (f) => {
      f.call.raw.durationMs = 60_001;
    },
    (f) => {
      f.call.raw.counters.modelLoadsAttempted = 0;
    },
    (f) => {
      f.call.exitCode = 0;
    },
    (f) => {
      f.call.raw.extra = true;
    },
  ]) {
    const f = failure(3);
    mutate(f);
    refresh(f);
    assert.equal(decode(f).valid, false);
  }
});
test("malformed stdout, extra output, raw disagreement and throwing wrappers stay typed failures", () => {
  for (const mutate of [
    (f) => {
      f.call.stdout = "not-json";
    },
    (f) => {
      f.call.stdout += JSON.stringify(f.call.raw);
    },
    (f) => {
      f.call.raw.inputImageSha256 = hash("not-stdout");
    },
    (f) => {
      f.call.raw.extra = true;
      f.call.stdout = JSON.stringify(f.call.raw);
    },
    (f) => {
      f.call.stdout = "x".repeat(100_001);
    },
  ]) {
    const f = fixture();
    mutate(f);
    assert.equal(decode(f).valid, false);
  }
  const f = fixture();
  Object.defineProperty(f.call, "stderr", {
    get() {
      throw Error("untrusted accessor");
    },
  });
  assert.equal(decode(f).valid, false);
  assert.equal(decodeEmbeddingPair(null, f.row, f.options).valid, false);
});
test("source has no inference, process, network, write or credential entry and keeps original references", () => {
  const source = fs.readFileSync(
    new URL("../qa/local-vision/embedding-data.mjs", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    source,
    /\b(?:fetch|spawn|spawnSync|execFile|execFileSync|writeFile|writeFileSync|mkdir|mkdirSync|fitEmbeddingHead|predictEmbeddingHead)\s*\(/u,
  );
  assert.doesNotMatch(source, /OPENAI_API_KEY|process\.env/);
  assert.match(source, /originalImagesVerified:\s*72/);
  assert.match(source, /fitReferencesVerified:\s*16/);
  assert.match(source, /newImagePredictions:\s*0/);
});
