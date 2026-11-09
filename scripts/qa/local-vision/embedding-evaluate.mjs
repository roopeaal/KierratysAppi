// Explicit offline two-view experiment. No automatic downloads, retries or app integration.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  assertEmbeddingFresh,
  assertEmbeddingStageAvailable,
  captureEmbeddingSources,
  checkedOutput,
  checkedWorkFile,
  claimEmbeddingStage,
  readBounded,
  validateEmbeddingSpec,
  writeJsonExclusive,
} from "./embedding-control.mjs";
import { decodeEmbeddingPair, loadEmbeddingBasis } from "./embedding-data.mjs";
import {
  embeddingTrainingHash,
  fitEmbeddingHead,
  parseEmbeddingHead,
  predictEmbeddingHead,
} from "./embedding-head.mjs";
import {
  applyEmbeddingVeto,
  checkEmbeddingFit,
  embeddingValidationGate,
  measureEmbeddingResults,
} from "./embedding-policy.mjs";
import { splitLinearDataset } from "./linear-data.mjs";

const project = fileURLToPath(new URL("../../../", import.meta.url));
const specFile = "scripts/qa/local-vision/embedding-learning-spec.json";
const modelDirectory =
  "work/mobileclip-candidate-2026-11-06.M305AS/compiled/mobileclip_s0_image.mlmodelc";
const prototypesFile = "work/mobileclip-candidate-2026-11-06.M305AS/prototypes.json";
const priorLockFile = "work/linear-learning-2026-11-08.fBxjdB/freeze/lock.json";
const priorLockSha = "55349a0f6c6571038e6edd63adf22ed8047b7e6a236469788be9e50d21b1c52a";
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const objectHash = (value) => sha(JSON.stringify(value));
const hashPattern = /^[a-f0-9]{64}$/u;
const json = (file, maximum) => JSON.parse(readBounded(file, maximum));
const allocationIds = (split) => ({
  train: split.train.map((r) => r.id),
  validation: split.validation.map((r) => r.id),
});
export function checkEmbeddingWorker(worker, cwd = project) {
  assert.match(worker.binarySha256, hashPattern);
  const binary = checkedWorkFile(worker.binary, cwd);
  const binarySha256 = sha(readBounded(binary, 16_000_000));
  assert.equal(binarySha256, worker.binarySha256, "worker_binary_drift");
  return { binary, binarySha256 };
}
function spec(cwd) {
  const value = validateEmbeddingSpec(json(path.join(cwd, specFile)));
  checkEmbeddingWorker(value.worker, cwd);
  assert.equal(
    sha(readBounded(path.join(cwd, "scripts/qa/local-vision/embedding-main.swift"))),
    value.worker.sourceSha256,
    "worker_source_drift",
  );
  return value;
}
async function basisAndAllocation(cwd) {
  const basis = await loadEmbeddingBasis(cwd),
    split = splitLinearDataset(basis.rows);
  const oldBytes = readBounded(checkedWorkFile(priorLockFile, cwd));
  assert.equal(sha(oldBytes), priorLockSha, "prior_lock_drift");
  assert.deepEqual(allocationIds(split), JSON.parse(oldBytes).allocation, "prior_allocation_drift");
  return { basis, split };
}
export function checkEmbeddingLock(lock, source, basisHash, allocation, specHash) {
  assert.equal(lock.schemaVersion, "two-view-learning-lock-v1");
  assert.equal(lock.experimentId, "kig-embedding-v2");
  assert.equal(lock.referenceStatus, "seen_ai_reviewed_human_review_required");
  assert.equal(lock.imagePredictionsBeforeLock, 0);
  assert.equal(lock.realFitsBeforeLock, 0);
  assert.deepEqual(lock.sources, source, "source_runtime_drift");
  assert.equal(lock.basisHash, basisHash, "basis_drift");
  assert.equal(lock.specHash, specHash, "spec_drift");
  assert.deepEqual(lock.allocation, allocation, "allocation_drift");
  assert.equal(allocation.train.length, 45);
  assert.equal(allocation.validation.length, 27);
  assert.equal(new Set([...allocation.train, ...allocation.validation]).size, 72);
}
export async function freezeEmbeddingExperiment(outputInput, cwd = project) {
  assertEmbeddingFresh(cwd);
  const output = checkedOutput(outputInput, cwd),
    configuration = spec(cwd);
  const sources = captureEmbeddingSources(cwd),
    { basis, split } = await basisAndAllocation(cwd);
  const lock = {
    schemaVersion: "two-view-learning-lock-v1",
    experimentId: configuration.experimentId,
    referenceStatus: configuration.referenceStatus,
    imagePredictionsBeforeLock: 0,
    realFitsBeforeLock: 0,
    sources,
    basisHash: objectHash(basis),
    basisProof: basis.proof,
    allocation: allocationIds(split),
    allocationEvidence: split.allocation,
    priorLinearLockSha256: priorLockSha,
    specHash: sha(readBounded(path.join(cwd, specFile))),
    completedAt: new Date().toISOString(),
  };
  assert.deepEqual(captureEmbeddingSources(cwd), sources, "source_drift_during_freeze");
  checkEmbeddingLock(lock, sources, objectHash(basis), allocationIds(split), lock.specHash);
  fs.mkdirSync(output, { mode: 0o700 });
  const saved = writeJsonExclusive(path.join(output, "lock.json"), lock, cwd);
  return {
    directory: path.relative(cwd, output),
    lockSha256: saved.sha256,
    cases: 72,
    train: 45,
    validation: 27,
    imageCalls: 0,
    fits: 0,
  };
}
async function frozen(options, cwd) {
  assert.match(options.lockSha256, hashPattern);
  const lockBytes = readBounded(checkedWorkFile(options.lock, cwd));
  assert.equal(sha(lockBytes), options.lockSha256, "lock_drift");
  const lock = JSON.parse(lockBytes),
    configuration = spec(cwd),
    sources = captureEmbeddingSources(cwd);
  const { basis, split } = await basisAndAllocation(cwd);
  checkEmbeddingLock(
    lock,
    sources,
    objectHash(basis),
    allocationIds(split),
    sha(readBounded(path.join(cwd, specFile))),
  );
  return { lock, configuration, sources, basis, split };
}
export function makeEmbeddingCall(result, wallMs) {
  const stdout =
    typeof result.stdout === "string" ? result.stdout : (result.stdout?.toString("utf8") ?? "");
  const stderr =
    typeof result.stderr === "string" ? result.stderr : (result.stderr?.toString("utf8") ?? "");
  let raw = null;
  try {
    raw = JSON.parse(stdout);
  } catch {
    /* Preserve malformed bytes, never invent output. */
  }
  const definitePrelaunch =
    result.pid === 0 &&
    ["ENOENT", "EACCES", "ENOTDIR", "ENOEXEC", "E2BIG"].includes(result.error?.code);
  const spawned =
    result.pid > 0 || Number.isInteger(result.status) || result.signal
      ? true
      : definitePrelaunch
        ? false
        : null;
  return {
    raw,
    spawned,
    exitCode: result.status ?? null,
    failed: Boolean(result.error) || result.status !== 0,
    signal: result.signal ?? null,
    errorCode: result.error?.code ?? null,
    wallMs: Math.round(wallMs),
    stdout,
    stderr,
  };
}
export function summarizeEmbeddingAcquisition(cases) {
  const out = {
    plannedCases: cases.length,
    processAttempts: 0,
    processExecutions: 0,
    unknownProcessLaunches: 0,
    observedPairs: 0,
    failedPairs: 0,
    prelaunchFailures: 0,
    notAttempted: 0,
    predictionAttemptsKnown: 0,
    predictionsCompletedKnown: 0,
    exactCounterExecutions: 0,
    lowerBoundCounterExecutions: 0,
    unavailableCounterExecutions: 0,
    retries: 0,
    paidApiCalls: 0,
  };
  for (const row of cases) {
    if (row.status === "not_attempted") {
      out.notAttempted++;
      continue;
    }
    if (row.spawnAttempted !== false) out.processAttempts++;
    if (row.status === "observed") out.observedPairs++;
    else out.failedPairs++;
    if (row.processStarted === false) {
      out.prelaunchFailures++;
      continue;
    }
    if (row.processStarted === true) out.processExecutions++;
    else out.unknownProcessLaunches++;
    const pair = row.pair ?? {},
      counters = pair.counters ?? pair.progress?.lastCounters;
    if (counters) {
      out.predictionAttemptsKnown += counters.imagePredictionsAttempted;
      out.predictionsCompletedKnown += counters.imagePredictionsCompleted;
    }
    if (pair.counterEvidence === "exact_worker_footer") out.exactCounterExecutions++;
    else if (pair.counterEvidence === "progress_lower_bound") out.lowerBoundCounterExecutions++;
    else out.unavailableCounterExecutions++;
  }
  assert.ok(
    out.processAttempts <= 72 &&
      out.processExecutions <= out.processAttempts &&
      out.predictionAttemptsKnown <= 144 &&
      out.predictionsCompletedKnown <= out.predictionAttemptsKnown,
  );
  return out;
}
export function completeEmbeddingAcquisition(summary) {
  const c = summary.counters;
  return (
    summary.status === "complete" &&
    summary.cases.length === 72 &&
    new Set(summary.cases.map((r) => r.id)).size === 72 &&
    summary.cases.every((r) => hashPattern.test(r.id)) &&
    c.plannedCases === 72 &&
    c.processAttempts === 72 &&
    c.processExecutions === 72 &&
    c.unknownProcessLaunches === 0 &&
    c.observedPairs === 72 &&
    c.failedPairs === 0 &&
    c.prelaunchFailures === 0 &&
    c.notAttempted === 0 &&
    c.predictionAttemptsKnown === 144 &&
    c.predictionsCompletedKnown === 144 &&
    c.exactCounterExecutions === 72 &&
    c.lowerBoundCounterExecutions === 0 &&
    c.unavailableCounterExecutions === 0 &&
    summary.sourceHashesUnchanged === true &&
    summary.cases.every(
      (r) =>
        r.status === "observed" &&
        r.processStarted === true &&
        r.pair.valid &&
        r.pair.operationalSuccess &&
        r.pair.counterEvidence === "exact_worker_footer",
    )
  );
}
export async function acquireEmbeddingFeatures(options, cwd = project) {
  assertEmbeddingStageAvailable("images", cwd);
  const state = await frozen(options, cwd),
    output = checkedOutput(options.output, cwd);
  const { lock, configuration, sources, basis } = state;
  const claim = claimEmbeddingStage("images", { lockSha256: options.lockSha256, output }, cwd);
  fs.mkdirSync(output, { mode: 0o700 });
  fs.mkdirSync(path.join(output, "raw"), { mode: 0o700 });
  fs.mkdirSync(path.join(output, "attempts"), { mode: 0o700 });
  const cases = basis.rows.map((r) => ({
      id: r.id,
      status: "not_attempted",
      reason: "not_yet_attempted",
    })),
    featureRows = [];
  writeJsonExclusive(
    path.join(output, "plan.json"),
    { lockSha256: options.lockSha256, plannedCases: cases },
    cwd,
  );
  let stoppedAt = null,
    currentIndex = 0,
    pipelineFailure = false;
  try {
    for (let index = 0; index < basis.rows.length; index++) {
      currentIndex = index;
      const row = basis.rows[index];
      assert.deepEqual(captureEmbeddingSources(cwd), sources, "source_drift_before_pair");
      const workerProof = checkEmbeddingWorker(configuration.worker, cwd);
      const bytes = readBounded(checkedWorkFile(row.imagePath, cwd), 1_500_000);
      assert.equal(sha(bytes), row.id, "original_image_drift");
      const attempt = {
        imageSha256: row.id,
        binarySha256: workerProof.binarySha256,
        lockSha256: options.lockSha256,
        plannedViews: 2,
        startedAt: new Date().toISOString(),
      };
      const attemptSaved = writeJsonExclusive(
        path.join(output, "attempts", `${row.id}.json`),
        attempt,
        cwd,
      );
      cases[index] = {
        id: row.id,
        status: "failed",
        spawnAttempted: false,
        processStarted: false,
        reason: "process_not_completed",
        pair: null,
      };
      const started = performance.now();
      cases[index].spawnAttempted = true;
      cases[index].processStarted = null;
      const result = spawnSync(
        workerProof.binary,
        [
          "--export-views",
          checkedWorkFile(modelDirectory, cwd, true),
          checkedWorkFile(prototypesFile, cwd),
        ],
        {
          cwd,
          input: bytes.toString("base64"),
          encoding: "utf8",
          timeout: configuration.worker.outerTimeoutMs,
          killSignal: "SIGTERM",
          maxBuffer: configuration.worker.maxOutputBytesPerStream,
        },
      );
      const call = makeEmbeddingCall(result, performance.now() - started);
      cases[index].processStarted = call.spawned;
      const rawSaved = writeJsonExclusive(path.join(output, "raw", `${row.id}.json`), call, cwd);
      const pair = decodeEmbeddingPair(call, row, {
        expectedBinarySha256: configuration.worker.binarySha256,
        attempt: { imageSha256: attempt.imageSha256, binarySha256: attempt.binarySha256 },
      });
      const observed = pair.valid && pair.operationalSuccess;
      cases[index] = {
        id: row.id,
        status: observed ? "observed" : "failed",
        spawnAttempted: true,
        processStarted: call.spawned,
        reason: pair.reason,
        rawSha256: rawSaved.sha256,
        attemptSha256: attemptSaved.sha256,
        pair: {
          valid: pair.valid,
          operationalSuccess: pair.operationalSuccess,
          reason: pair.reason,
          counters: pair.counters,
          progress: pair.progress,
          counterEvidence: pair.counterEvidence,
        },
        featureSha256: observed ? objectHash(pair.features) : null,
        fitParityRequired: row.expectedFit18 !== null,
      };
      if (observed) featureRows.push({ id: row.id, features: pair.features });
      else {
        stoppedAt = row.id;
        break;
      }
    }
  } catch {
    pipelineFailure = true;
    stoppedAt = cases[currentIndex].id;
    if (cases[currentIndex].status === "not_attempted")
      cases[currentIndex] = {
        ...cases[currentIndex],
        status: "failed",
        spawnAttempted: false,
        processStarted: false,
        pair: null,
      };
    cases[currentIndex].reason = "input_or_output_pipeline_failure";
  }
  if (stoppedAt)
    for (const row of cases)
      if (row.status === "not_attempted") row.reason = "stopped_after_required_pair_failure";
  let stable = false;
  try {
    spec(cwd);
    const dataNow = await basisAndAllocation(cwd);
    stable =
      objectHash(dataNow.basis) === lock.basisHash &&
      objectHash(captureEmbeddingSources(cwd)) === objectHash(sources);
  } catch {
    /* Source/data drift is a failed acquisition, never a usable matrix. */
  }
  const status =
    !pipelineFailure && !stoppedAt && stable && featureRows.length === 72 ? "complete" : "failed";
  const matrixSaved = writeJsonExclusive(
    path.join(output, "features.json"),
    {
      schemaVersion: "two-view-feature-matrix-v1",
      status,
      lockSha256: options.lockSha256,
      rows: featureRows,
    },
    cwd,
  );
  const summary = {
    schemaVersion: "two-view-acquisition-v1",
    experimentId: lock.experimentId,
    referenceStatus: lock.referenceStatus,
    status,
    lockSha256: options.lockSha256,
    sourceHash: sources.sourceHash,
    sourceHashesUnchanged: stable,
    basisHash: lock.basisHash,
    claimSha256: claim.sha256,
    matrixSha256: matrixSaved.sha256,
    stoppedAt,
    counters: summarizeEmbeddingAcquisition(cases),
    cases,
    completedAt: new Date().toISOString(),
    learningPerformed: false,
    appIntegrationAllowed: false,
  };
  const saved = writeJsonExclusive(path.join(output, "summary.json"), summary, cwd);
  return {
    directory: path.relative(cwd, output),
    summarySha256: saved.sha256,
    status,
    counters: summary.counters,
    learningPerformed: false,
  };
}

export async function verifyEmbeddingAcquisition(options, state, cwd = project) {
  assert.match(options.featuresSha256, hashPattern);
  const summaryFile = checkedWorkFile(options.features, cwd),
    folder = path.dirname(summaryFile);
  assert.equal(path.basename(summaryFile), "summary.json");
  const bytes = readBounded(summaryFile, 2_000_000);
  assert.equal(sha(bytes), options.featuresSha256, "feature_receipt_drift");
  const summary = JSON.parse(bytes);
  assert.equal(summary.schemaVersion, "two-view-acquisition-v1");
  assert.equal(summary.lockSha256, options.lockSha256);
  assert.equal(summary.sourceHash, state.sources.sourceHash);
  assert.equal(summary.basisHash, state.lock.basisHash);
  assert.equal(summary.learningPerformed, false);
  assert.equal(completeEmbeddingAcquisition(summary), true, "incomplete_or_failed_acquisition");
  assert.deepEqual(
    summary.counters,
    summarizeEmbeddingAcquisition(summary.cases),
    "saved_counter_drift",
  );
  const claimFile = checkedWorkFile(
      "work/embedding-learning-attempts/kig-embedding-v2-images.json",
      cwd,
    ),
    claimBytes = readBounded(claimFile);
  assert.equal(sha(claimBytes), summary.claimSha256);
  const claim = JSON.parse(claimBytes);
  assert.equal(claim.output, folder, "copied_feature_folder");
  assert.equal(claim.lockSha256, options.lockSha256);
  const matrixBytes = readBounded(
    checkedWorkFile(path.join(folder, "features.json"), cwd),
    8_000_000,
  );
  assert.equal(sha(matrixBytes), summary.matrixSha256);
  const matrix = JSON.parse(matrixBytes);
  assert.equal(matrix.schemaVersion, "two-view-feature-matrix-v1");
  assert.equal(matrix.status, "complete");
  assert.equal(matrix.lockSha256, options.lockSha256);
  assert.ok(Array.isArray(matrix.rows) && matrix.rows.length === 72);
  assert.deepEqual(
    matrix.rows.map((r) => r.id),
    state.basis.rows.map((r) => r.id),
    "feature_membership_order",
  );
  for (let i = 0; i < 72; i++) {
    const row = state.basis.rows[i],
      stored = summary.cases[i],
      feature = matrix.rows[i];
    assert.equal(stored.id, row.id);
    const rawBytes = readBounded(
      checkedWorkFile(path.join(folder, "raw", `${row.id}.json`), cwd),
      1_500_000,
    );
    const attemptBytes = readBounded(
      checkedWorkFile(path.join(folder, "attempts", `${row.id}.json`), cwd),
      20_000,
    );
    assert.equal(sha(rawBytes), stored.rawSha256);
    assert.equal(sha(attemptBytes), stored.attemptSha256);
    const attempt = JSON.parse(attemptBytes);
    assert.equal(attempt.lockSha256, options.lockSha256);
    assert.equal(attempt.plannedViews, 2);
    const pair = decodeEmbeddingPair(JSON.parse(rawBytes), row, {
      expectedBinarySha256: state.configuration.worker.binarySha256,
      attempt: { imageSha256: attempt.imageSha256, binarySha256: attempt.binarySha256 },
    });
    assert.equal(pair.valid && pair.operationalSuccess, true, "saved_pair_drift");
    assert.deepEqual(
      stored.pair,
      {
        valid: pair.valid,
        operationalSuccess: pair.operationalSuccess,
        reason: pair.reason,
        counters: pair.counters,
        progress: pair.progress,
        counterEvidence: pair.counterEvidence,
      },
      "saved_pair_metadata_drift",
    );
    assert.equal(stored.fitParityRequired, row.expectedFit18 !== null);
    assert.deepEqual(pair.features, feature.features, "saved_feature_values_drift");
    assert.equal(objectHash(feature.features), stored.featureSha256);
  }
  return { matrix, summary, summarySha256: options.featuresSha256 };
}
export async function runEmbeddingLearning(options, cwd = project) {
  assertEmbeddingStageAvailable("fit", cwd);
  const state = await frozen(options, cwd),
    acquired = await verifyEmbeddingAcquisition(options, state, cwd);
  const output = checkedOutput(options.output, cwd);
  const claim = claimEmbeddingStage("fit", { lockSha256: options.lockSha256, output }, cwd);
  fs.mkdirSync(output, { mode: 0o700 });
  const counters = {
    fitsAttempted: 0,
    fitsCompleted: 0,
    internalSanityRowsEvaluated: 0,
    independentSanityRowsEvaluated: 0,
    headDecisionsAttempted: 0,
    headDecisionsCompleted: 0,
    newImagePredictions: 0,
    paidApiCalls: 0,
    retries: 0,
  };
  writeJsonExclusive(
    path.join(output, "attempt.json"),
    {
      claimSha256: claim.sha256,
      lockSha256: options.lockSha256,
      featureSummarySha256: acquired.summarySha256,
    },
    cwd,
  );
  try {
    const byId = new Map(acquired.matrix.rows.map((r) => [r.id, r.features]));
    const rows = state.basis.rows.map((r) => ({ ...r, features: byId.get(r.id) }));
    const trainIds = new Set(state.lock.allocation.train),
      training = rows.filter((r) => trainIds.has(r.id));
    assert.equal(training.length, 45);
    const mathRows = training.map(({ id, label, features }) => ({ id, label, features }));
    counters.fitsAttempted++;
    counters.internalSanityRowsEvaluated = null;
    const model = fitEmbeddingHead(mathRows);
    counters.fitsCompleted++;
    counters.internalSanityRowsEvaluated = 45;
    const modelSaved = writeJsonExclusive(path.join(output, "model.json"), model, cwd);
    const persisted = parseEmbeddingHead(json(modelSaved.path));
    assert.equal(persisted.header.trainingDataSha256, embeddingTrainingHash(mathRows));
    counters.independentSanityRowsEvaluated = null;
    const sanity = checkEmbeddingFit(persisted, training);
    assert.equal(sanity.rowsEvaluated, 45);
    counters.independentSanityRowsEvaluated = sanity.rowsEvaluated;
    writeJsonExclusive(path.join(output, "fit-sanity.json"), sanity, cwd);
    const cases = [];
    for (const row of rows) {
      counters.headDecisionsAttempted++;
      let head;
      try {
        head = predictEmbeddingHead(persisted, row.features);
        counters.headDecisionsCompleted++;
      } catch {
        head = { status: "unavailable", reason: "head_failed" };
      }
      const candidate = applyEmbeddingVeto(row.baseline, row.operational, head);
      cases.push({
        id: row.id,
        label: row.label,
        split: trainIds.has(row.id) ? "train" : "validation",
        sourceProof: row.sourceProof,
        baseline: row.baseline,
        baselineOperational: row.operational,
        head,
        headValid: candidate.headValid,
        headRequired: candidate.headRequired,
        candidate: candidate.decision,
        candidateOperational: candidate.operational,
      });
    }
    assert.equal(cases.length, 72);
    assert.deepEqual(captureEmbeddingSources(cwd), state.sources, "source_drift_after_fit");
    assert.equal(
      objectHash((await basisAndAllocation(cwd)).basis),
      state.lock.basisHash,
      "basis_drift_after_fit",
    );
    const measures = {};
    for (const phase of ["train", "validation", "combined"]) {
      const values = phase === "combined" ? cases : cases.filter((r) => r.split === phase);
      measures[phase] = {
        baseline: measureEmbeddingResults(values, "baseline"),
        candidate: measureEmbeddingResults(values, "candidate"),
      };
    }
    const summary = {
      schemaVersion: "two-view-learning-result-v1",
      experimentId: state.lock.experimentId,
      referenceStatus: state.lock.referenceStatus,
      independentAccuracyEvidence: false,
      appIntegrationAllowed: false,
      developmentQualifies: embeddingValidationGate(
        measures.validation.baseline,
        measures.validation.candidate,
      ),
      knownWrongRemain: measures.combined.candidate.wrongAccepted > 0,
      lockSha256: options.lockSha256,
      featureSummarySha256: acquired.summarySha256,
      modelSha256: modelSaved.sha256,
      sourceHash: state.sources.sourceHash,
      sourceHashesUnchanged: true,
      basisHash: state.lock.basisHash,
      counters,
      fitSanity: sanity,
      measures,
      cases,
      completedAt: new Date().toISOString(),
    };
    const saved = writeJsonExclusive(path.join(output, "summary.json"), summary, cwd);
    return {
      directory: path.relative(cwd, output),
      summarySha256: saved.sha256,
      developmentQualifies: summary.developmentQualifies,
      appIntegrationAllowed: false,
      counters,
      measures,
    };
  } catch {
    writeJsonExclusive(
      path.join(output, "failure.json"),
      {
        status: "failed",
        reason: "preserve_partial_learning_attempt",
        counters,
        appIntegrationAllowed: false,
      },
      cwd,
    );
    throw new Error("preserve_partial_learning_attempt");
  }
}
export function parseEmbeddingArguments(args) {
  const mode = args[0],
    values = {};
  assert.ok(["--freeze", "--acquire", "--run"].includes(mode));
  for (let i = 1; i < args.length; i++) {
    const key = args[i],
      value = args[++i];
    assert.ok(
      ["--output", "--lock", "--lock-sha", "--features", "--features-sha"].includes(key) &&
        !(key in values),
    );
    assert.ok(value && !value.startsWith("--") && !/^[a-z]+:/iu.test(value));
    values[key] = value;
  }
  assert.ok(values["--output"]);
  if (mode === "--freeze") assert.equal(Object.keys(values).length, 1);
  else {
    assert.match(values["--lock-sha"] ?? "", hashPattern);
    assert.ok(values["--lock"]);
    assert.equal(Object.keys(values).length, mode === "--acquire" ? 3 : 5);
    if (mode === "--run") {
      assert.ok(values["--features"]);
      assert.match(values["--features-sha"] ?? "", hashPattern);
    }
  }
  return {
    mode,
    output: values["--output"],
    lock: values["--lock"],
    lockSha256: values["--lock-sha"],
    features: values["--features"],
    featuresSha256: values["--features-sha"],
  };
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const options = parseEmbeddingArguments(process.argv.slice(2));
    console.log(
      JSON.stringify(
        options.mode === "--freeze"
          ? await freezeEmbeddingExperiment(options.output)
          : options.mode === "--acquire"
            ? await acquireEmbeddingFeatures(options)
            : await runEmbeddingLearning(options),
      ),
    );
  } catch {
    console.error("two_view_experiment_failed; preserve all artifacts and never reset ledgers");
    process.exitCode = 1;
  }
}
