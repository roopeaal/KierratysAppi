// QA ONLY: captured-reference basis and strict two-view worker decoding. No model execution.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { combineEmbeddingViews } from "./embedding-head.mjs";
import {
  LINEAR_DATA_PINS,
  loadLinearDataset,
  splitLinearDataset,
  validateCanonicalScores,
} from "./linear-data.mjs";
import { decodeClip } from "./robustness-evaluate.mjs";

const project = fileURLToPath(new URL("../../../", import.meta.url));
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const hashPattern = /^[a-f0-9]{64}$/u;
const plain = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const clone = (value) => structuredClone(value);
const exactKeys = (value, names) => {
  assert.ok(plain(value), "object_required");
  assert.deepEqual(Object.keys(value).sort(), [...names].sort(), "unexpected_keys");
};
const integer = (v, max) => Number.isInteger(v) && v >= 0 && v <= max;
const sameScores = (a, b) =>
  validateCanonicalScores(a) &&
  validateCanonicalScores(b) &&
  a.every((s, i) => s.group === b[i].group && Object.is(s.cosine, b[i].cosine));
export const EMBEDDING_SOURCE_POLICY = Object.freeze({
  schemaVersion: "mobileclip-s0-two-view-embeddings-v1",
  progressSchemaVersion: "mobileclip-s0-two-view-progress-v1",
  modelId: "apple-mobileclip-s0-coreml-2024",
  modelRevision: "55c8098c12ba8f928e37e26b2e1dd097777c3f98",
  imageWeightSha256: LINEAR_DATA_PINS.weights,
  compiledGraphSha256: LINEAR_DATA_PINS.graph,
  compiledTreeSha256: LINEAR_DATA_PINS.compiled,
  prototypesSha256: LINEAR_DATA_PINS.prototypes,
  promptsSha256: LINEAR_DATA_PINS.prompts,
  promptPolicy: "packaging-visible-form-v1",
  computeUnits: "cpuOnly",
  inputPolicy: "original-frozen-jpeg-base64-stdin-v1",
  osVersion: "26.7.0",
});
export const FIT_REFERENCE_PINS = Object.freeze({
  receipt: "fd86f9bad85d03775cfddab5edc2c79d88206f1e10ec5617defb9bb17c977ea2",
  binary: "1611f4330c94ab7a932518123537518a54b342f979c3ede77164b8d68f3bdba0",
  source: "a3f7933b66ff08e3ea8ae932599f1a2a1fd1923fc9ec412e21948227569cba0e",
  preprocessing: "aspect-fit-256-srgb-gray127-v1",
});
const viewPolicies = [
  {
    view: "center",
    preprocessing: "center-square-256-srgb-v1",
    scorePolicy: "legacy-center-unclamped-dot-v1",
  },
  {
    view: "full-frame-aspect-fit",
    preprocessing: "aspect-fit-256-srgb-gray127-v1",
    scorePolicy: "legacy-fit-roundoff-clamped-dot-v1",
  },
];
export const EMBEDDING_COUNTER_KEYS = Object.freeze([
  "modelLoadsAttempted",
  "modelLoadsCompleted",
  "imageDecodesAttempted",
  "imageDecodesCompleted",
  "imagePredictionsAttempted",
  "imagePredictionsCompleted",
  "centerPredictionsAttempted",
  "centerPredictionsCompleted",
  "fitPredictionsAttempted",
  "fitPredictionsCompleted",
  "textPredictionsAttempted",
  "textPredictionsCompleted",
]);
const zeroCounters = () => Object.fromEntries(EMBEDDING_COUNTER_KEYS.map((k) => [k, 0]));
const stages = [
  ["model_load_started", { modelLoadsAttempted: 1 }],
  ["model_load_completed", { modelLoadsCompleted: 1 }],
  ["decode_started", { imageDecodesAttempted: 1 }],
  ["decode_completed", { imageDecodesCompleted: 1 }],
  ["center_prediction_started", { imagePredictionsAttempted: 1, centerPredictionsAttempted: 1 }],
  ["center_prediction_completed", { imagePredictionsCompleted: 1, centerPredictionsCompleted: 1 }],
  ["fit_prediction_started", { imagePredictionsAttempted: 2, fitPredictionsAttempted: 1 }],
  ["fit_prediction_completed", { imagePredictionsCompleted: 2, fitPredictionsCompleted: 1 }],
];
const stageStates = [];
let previous = zeroCounters();
for (const [stage, change] of stages) {
  previous = { ...previous, ...change };
  stageStates.push({ stage, counters: previous });
}
function checkedCounters(value) {
  exactKeys(value, EMBEDDING_COUNTER_KEYS);
  for (const k of EMBEDDING_COUNTER_KEYS)
    assert.ok(integer(value[k], k.startsWith("imagePredictions") ? 2 : 1), "counter_bound");
  for (const stem of [
    "modelLoads",
    "imageDecodes",
    "imagePredictions",
    "centerPredictions",
    "fitPredictions",
    "textPredictions",
  ])
    assert.ok(
      value[`${stem}Completed`] <= value[`${stem}Attempted`],
      "counter_completion_without_attempt",
    );
  assert.equal(value.textPredictionsAttempted, 0);
  assert.equal(value.textPredictionsCompleted, 0);
  assert.equal(
    value.imagePredictionsAttempted,
    value.centerPredictionsAttempted + value.fitPredictionsAttempted,
  );
  assert.equal(
    value.imagePredictionsCompleted,
    value.centerPredictionsCompleted + value.fitPredictionsCompleted,
  );
  return clone(value);
}

/** Source-emitted JSONL prefix only. Last counters are LOWER BOUNDS, not final completion evidence. */
export function validateEmbeddingProgress(stderr, { allowPartial = true } = {}) {
  const result = {
    valid: false,
    complete: false,
    recordCount: 0,
    lastDurationMs: 0,
    lastCounters: null,
    reason: "invalid_progress",
  };
  try {
    assert.equal(typeof stderr, "string");
    assert.ok(Buffer.byteLength(stderr) <= 64_000, "progress_bound");
    if (stderr === "")
      return {
        ...result,
        valid: allowPartial,
        reason: allowPartial ? null : "incomplete_progress",
      };
    const lines = stderr.split("\n"),
      tail = lines.pop();
    assert.ok(lines.length <= stageStates.length, "too_many_progress_records");
    for (const [i, line] of lines.entries()) {
      const row = JSON.parse(line);
      exactKeys(row, ["schemaVersion", "stage", "durationMs", "counters"]);
      assert.equal(row.schemaVersion, EMBEDDING_SOURCE_POLICY.progressSchemaVersion);
      assert.ok(
        integer(row.durationMs, 60_000) && row.durationMs >= result.lastDurationMs,
        "progress_duration",
      );
      assert.equal(row.stage, stageStates[i].stage, "progress_stage_order");
      const counters = checkedCounters(row.counters);
      assert.deepEqual(counters, stageStates[i].counters, "progress_stage_counters");
      result.recordCount++;
      result.lastDurationMs = row.durationMs;
      result.lastCounters = counters;
    }
    assert.equal(tail, "", "unterminated_progress");
    result.complete = result.recordCount === stageStates.length;
    assert.ok(allowPartial || result.complete, "incomplete_progress");
    return { ...result, valid: true, reason: null };
  } catch {
    return result;
  }
}
function workerView(value, index) {
  exactKeys(value, [
    "view",
    "preprocessing",
    "scorePolicy",
    "embeddingDimension",
    "normalization",
    "outputFeature",
    "outputShape",
    "outputDataType",
    "embedding",
    "embeddingNorm",
    "scores",
  ]);
  for (const [key, expected] of Object.entries(viewPolicies[index]))
    assert.equal(value[key], expected, "view_policy");
  assert.equal(value.embeddingDimension, 512);
  assert.equal(value.normalization, "l2-double-reduction-order-v1");
  assert.equal(value.outputFeature, "final_emb_1");
  assert.deepEqual(value.outputShape, [1, 512]);
  assert.equal(value.outputDataType, "Float32");
  assert.ok(
    Array.isArray(value.embedding) &&
      value.embedding.length === 512 &&
      value.embedding.every(
        (v) => typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= 1.000001,
      ),
    "invalid_embedding",
  );
  const norm = Math.sqrt(value.embedding.reduce((n, v) => n + v * v, 0));
  assert.ok(
    Number.isFinite(value.embeddingNorm) &&
      Math.abs(value.embeddingNorm - 1) <= 1e-6 &&
      Math.abs(norm - 1) <= 1e-6,
    "embedding_not_unit",
  );
  assert.ok(Math.abs(norm - value.embeddingNorm) <= 1e-12, "reported_norm_drift");
  assert.ok(validateCanonicalScores(value.scores), "invalid_scores");
  return clone(value);
}
const failureReasons = new Set([
  "invalid_arguments",
  "invalid_path",
  "invalid_assets",
  "invalid_model",
  "invalid_prototype",
  "invalid_image",
  "processing_failed",
  "timeout",
]);
function expectedReference(row, options) {
  assert.ok(plain(row));
  assert.match(row.id, hashPattern);
  assert.ok(validateCanonicalScores(row.expectedCenter18), "missing_center_reference");
  assert.ok(
    row.expectedFit18 === null || validateCanonicalScores(row.expectedFit18),
    "invalid_fit_reference",
  );
  assert.ok(plain(options));
  assert.match(options.expectedBinarySha256, hashPattern, "missing_expected_binary");
  exactKeys(options.attempt, ["imageSha256", "binarySha256"]);
  assert.equal(options.attempt.imageSha256, row.id, "attempt_image_drift");
  assert.equal(options.attempt.binarySha256, options.expectedBinarySha256, "attempt_binary_drift");
}

/** Known failures remain failures. Killed/malformed output only retains progress lower bounds. */
export function decodeEmbeddingPair(call, row, options = {}) {
  let stderr = null;
  try {
    stderr = call?.stderr ?? null;
  } catch {
    /* Untrusted wrapper accessors are not diagnostic evidence. */
  }
  const progress = validateEmbeddingProgress(stderr, { allowPartial: true });
  const bad = (reason) => ({
    valid: false,
    operationalSuccess: false,
    reason,
    features: null,
    views: null,
    counters: null,
    progress,
    counterEvidence: progress.lastCounters ? "progress_lower_bound" : "unavailable",
  });
  try {
    expectedReference(row, options);
    assert.ok(plain(call));
    assert.equal(typeof call.failed, "boolean");
    assert.ok(!call.signal && !call.errorCode, "process_failed");
    assert.ok((call.exitCode === 0 && !call.failed) || call.exitCode === 1, "process_exit");
    assert.ok(integer(call.wallMs, 60_000), "wall_duration");
    assert.equal(typeof call.stdout, "string");
    assert.ok(
      Buffer.byteLength(call.stdout) > 0 && Buffer.byteLength(call.stdout) <= 100_000,
      "stdout_bound",
    );
    const raw = JSON.parse(call.stdout);
    assert.deepEqual(raw, call.raw, "raw_stdout_drift");
    assert.ok(progress.valid, "invalid_progress");
    assert.ok(plain(raw));
    assert.equal(raw.schemaVersion, EMBEDDING_SOURCE_POLICY.schemaVersion);
    assert.ok(
      integer(raw.durationMs, 60_000) && raw.durationMs >= progress.lastDurationMs,
      "duration_drift",
    );
    const counters = checkedCounters(raw.counters);
    assert.deepEqual(counters, progress.lastCounters ?? zeroCounters(), "footer_progress_drift");
    if (raw.status === "unavailable") {
      exactKeys(raw, [
        "schemaVersion",
        "status",
        "reason",
        "durationMs",
        "counters",
        "completedViews",
      ]);
      assert.equal(call.exitCode, 1);
      assert.ok(failureReasons.has(raw.reason), "unknown_failure_reason");
      assert.ok(
        Array.isArray(raw.completedViews) && raw.completedViews.length <= 2,
        "completed_views",
      );
      assert.deepEqual(
        raw.completedViews,
        viewPolicies.slice(0, raw.completedViews.length).map((v) => v.view),
        "completed_views_order",
      );
      if (raw.completedViews.length >= 1) assert.equal(counters.centerPredictionsCompleted, 1);
      if (raw.completedViews.length === 2) assert.equal(counters.fitPredictionsCompleted, 1);
      return {
        valid: true,
        operationalSuccess: false,
        reason: raw.reason,
        features: null,
        views: null,
        counters,
        progress,
        counterEvidence: "exact_worker_footer",
        completedViews: [...raw.completedViews],
      };
    }
    exactKeys(raw, [
      "schemaVersion",
      "status",
      "modelId",
      "modelRevision",
      "imageWeightSha256",
      "compiledGraphSha256",
      "compiledTreeSha256",
      "prototypesSha256",
      "promptsSha256",
      "promptPolicy",
      "computeUnits",
      "inputPolicy",
      "inputImageSha256",
      "osVersion",
      "durationMs",
      "views",
      "counters",
    ]);
    assert.equal(call.exitCode, 0);
    assert.equal(raw.status, "observed");
    for (const [key, value] of Object.entries(EMBEDDING_SOURCE_POLICY))
      if (key !== "progressSchemaVersion") assert.equal(raw[key], value, "source_policy_drift");
    assert.equal(raw.inputImageSha256, row.id, "input_image_drift");
    assert.ok(raw.durationMs <= 12_000, "late_success");
    assert.ok(call.wallMs <= 15_000, "late_wall_success");
    assert.equal(progress.complete, true, "incomplete_success_progress");
    assert.deepEqual(counters, stageStates.at(-1).counters, "incomplete_success_counters");
    assert.ok(Array.isArray(raw.views) && raw.views.length === 2, "pair_views");
    const views = raw.views.map(workerView);
    // A score-parity defect invalidates the pair, but these source-bound, complete
    // worker/footer records still prove both image predictions actually returned.
    const parityFailure = (reason) => ({
      ...bad(reason),
      counters,
      counterEvidence: "exact_worker_footer",
    });
    if (!sameScores(views[0].scores, row.expectedCenter18))
      return parityFailure("center_parity_failed");
    if (row.expectedFit18 !== null && !sameScores(views[1].scores, row.expectedFit18))
      return parityFailure("fit_parity_failed");
    const features = combineEmbeddingViews(views[0].embedding, views[1].embedding);
    return {
      valid: true,
      operationalSuccess: true,
      reason: null,
      features,
      views,
      counters,
      progress,
      counterEvidence: "exact_worker_footer",
      proof: {
        inputImageSha256: row.id,
        binarySha256: options.expectedBinarySha256,
        centerParity: true,
        fitParity: row.expectedFit18 === null ? "not_previously_observed" : true,
        rawSha256: sha(call.stdout),
        progressSha256: sha(call.stderr),
        sourcePolicy: { ...EMBEDDING_SOURCE_POLICY },
      },
    };
  } catch {
    return bad("invalid_pair_output");
  }
}

function regular(file, root) {
  const p = path.resolve(file),
    stat = fs.lstatSync(p);
  assert.ok(p.startsWith(`${root}${path.sep}`));
  assert.equal(fs.realpathSync(p), p, "linked_path");
  assert.ok(stat.isFile() && !stat.isSymbolicLink() && stat.nlink === 1, "not_regular_single_file");
  return p;
}
function readBytes(file, maximum = 2_000_000) {
  const fd = fs.openSync(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0));
  try {
    const stat = fs.fstatSync(fd);
    assert.ok(stat.isFile() && stat.nlink === 1 && stat.size > 0 && stat.size <= maximum);
    const bytes = Buffer.alloc(stat.size + 1);
    let count = 0;
    while (true) {
      const size = fs.readSync(fd, bytes, count, bytes.length - count, null);
      if (size === 0) break;
      count += size;
      assert.ok(count <= stat.size, "growing_file");
    }
    assert.equal(count, stat.size);
    return bytes.subarray(0, count);
  } finally {
    fs.closeSync(fd);
  }
}
const sourceDirectories = {
  robustness: "work/robustness-corpus-2026-11-07.93wuSo/final-reviewed",
  spatial: "work/spatial-data-2026-11-07.P8gFzP/final-reviewed",
  foreground: "work/foreground-data-2026-11-07.7bsky0/final-reviewed",
};
/** Reuses the frozen, openly seen72 references; no new embedding or head call. */
export async function loadEmbeddingBasis(cwd = project) {
  const base = await loadLinearDataset(cwd),
    root = fs.realpathSync(cwd),
    work = fs.realpathSync(path.join(root, "work"));
  const rawRoot = "work/local-reliability-2026-11-07.kbWGyb/validation";
  const paths = {
    receipt: `${rawRoot}/summary.json`,
    binary: "work/mobileclip-robustness-2026-11-07.CwXMfb/mobileclip-fit-qa",
    source: "scripts/qa/local-vision/mobileclip-robustness-main.swift",
  };
  const sourceHashes = {};
  for (const [key, p] of Object.entries(paths)) {
    const bytes = readBytes(
      regular(path.join(root, p), p.startsWith("work/") ? work : root),
      key === "binary" ? 50_000_000 : 2_000_000,
    );
    sourceHashes[key] = sha(bytes);
    assert.equal(sourceHashes[key], FIT_REFERENCE_PINS[key], `fit_source_drift:${key}`);
  }
  const receipt = JSON.parse(readBytes(regular(path.join(root, paths.receipt), work)));
  assert.equal(receipt.phase, "validation");
  assert.equal(receipt.sourceHashesUnchanged, true);
  assert.equal(receipt.cases.length, 16);
  assert.equal(receipt.hashes.fit, FIT_REFERENCE_PINS.binary);
  assert.equal(receipt.hashes.fitSource, FIT_REFERENCE_PINS.source);
  for (const key of ["prototypes", "prompts", "gate", "normalizer"])
    assert.equal(receipt.hashes[key], LINEAR_DATA_PINS[key]);
  const oldFits = new Map();
  for (const captured of receipt.cases) {
    assert.ok(!oldFits.has(captured.imageSha256), "duplicate_fit_capture");
    const reference = base.rows.find((r) => r.id === captured.imageSha256);
    assert.ok(reference, "unmapped_fit_capture");
    assert.equal(reference.sourceProof.sourceId, captured.id);
    assert.equal(reference.label, captured.expectedKind);
    assert.equal(reference.sourceProof.receiptId, `validation-${captured.id}`);
    const rawPath = `${rawRoot}/raw-${captured.id}-fit.json`,
      attemptPath = `${rawRoot}/attempt-${captured.id}-fit.json`;
    const rawBytes = readBytes(regular(path.join(root, rawPath), work)),
      attemptBytes = readBytes(regular(path.join(root, attemptPath), work));
    const raw = JSON.parse(rawBytes),
      attempt = JSON.parse(attemptBytes);
    assert.equal(attempt.imageSha256, reference.id);
    assert.equal(attempt.binarySha256, FIT_REFERENCE_PINS.binary);
    const fit = decodeClip(raw, FIT_REFERENCE_PINS.preprocessing, validateCanonicalScores);
    assert.equal(fit.valid, true);
    assert.equal(fit.operationalSuccess, true);
    assert.deepEqual(fit, captured.fit, "fit_capture_drift");
    assert.equal(raw.raw.osVersion, EMBEDDING_SOURCE_POLICY.osVersion);
    oldFits.set(reference.id, {
      scores: clone(fit.scores),
      proof: {
        receiptSha256: FIT_REFERENCE_PINS.receipt,
        receiptId: captured.id,
        rawPath,
        rawSha256: sha(rawBytes),
        attemptPath,
        attemptSha256: sha(attemptBytes),
        binarySha256: FIT_REFERENCE_PINS.binary,
      },
    });
  }
  assert.equal(oldFits.size, 16);
  const rows = base.rows.map((row) => {
    const directory = sourceDirectories[row.sourceProof.corpus];
    assert.ok(directory, "unknown_original_corpus");
    const imagePath = regular(path.join(root, directory, `${row.sourceProof.sourceId}.jpg`), work);
    assert.equal(sha(readBytes(imagePath, 1_500_000)), row.id, "original_image_drift");
    const fit = oldFits.get(row.id);
    return {
      ...row,
      imagePath,
      expectedCenter18: clone(row.scores),
      expectedFit18: fit?.scores ?? null,
      fitSourceProof: fit?.proof ?? null,
    };
  });
  const allocation = splitLinearDataset(rows).allocation;
  return {
    rows,
    proof: {
      schemaVersion: "embedding-basis-v1",
      linearProof: base.proof,
      sourcePaths: paths,
      sourceHashes,
      allocation,
      allocationSha256: sha(JSON.stringify(allocation)),
      originalImagesVerified: 72,
      centerReferencesVerified: 72,
      fitReferencesVerified: 16,
      headFits: 0,
      newImagePredictions: 0,
      networkCalls: 0,
    },
  };
}
