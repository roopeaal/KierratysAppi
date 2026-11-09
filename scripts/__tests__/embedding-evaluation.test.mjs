import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  checkEmbeddingLock,
  checkEmbeddingWorker,
  completeEmbeddingAcquisition,
  makeEmbeddingCall,
  parseEmbeddingArguments,
  summarizeEmbeddingAcquisition,
} from "../qa/local-vision/embedding-evaluate.mjs";

test("actual worker bytes are rehashed instead of trusting the configured SHA", (t) => {
  const cwd = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "kig-worker-pin-"));
  t.after(() => fs.rmSync(cwd, { recursive: true }));
  fs.mkdirSync(path.join(cwd, "work"));
  const binary = path.join(cwd, "work/worker");
  fs.writeFileSync(binary, "numeric test fixture, never executable");
  const binarySha256 = createHash("sha256").update(fs.readFileSync(binary)).digest("hex");
  const worker = { binary: "work/worker", binarySha256 };
  assert.deepEqual(checkEmbeddingWorker(worker, cwd), { binary, binarySha256 });
  fs.writeFileSync(binary, "replaced fixture");
  assert.throws(() => checkEmbeddingWorker(worker, cwd), /worker_binary_drift/u);
  const source = fs.readFileSync(
    new URL("../qa/local-vision/embedding-evaluate.mjs", import.meta.url),
    "utf8",
  );
  assert.match(source, /const workerProof = checkEmbeddingWorker\(configuration\.worker, cwd\)/u);
  assert.match(source, /binarySha256: workerProof\.binarySha256/u);
  assert.match(source, /try \{\s*spec\(cwd\);\s*const dataNow/u);
});

const id = (n) => n.toString(16).padStart(64, "0");
const footer = (attempted = 2, completed = 2) => ({
  imagePredictionsAttempted: attempted,
  imagePredictionsCompleted: completed,
});
function observed(n) {
  return {
    id: id(n),
    status: "observed",
    processStarted: true,
    pair: {
      valid: true,
      operationalSuccess: true,
      counters: footer(),
      progress: { lastCounters: footer() },
      counterEvidence: "exact_worker_footer",
    },
  };
}
function summary() {
  const cases = Array.from({ length: 72 }, (_, n) => observed(n));
  return {
    status: "complete",
    sourceHashesUnchanged: true,
    cases,
    counters: summarizeEmbeddingAcquisition(cases),
  };
}
test("72 cases with two views count144 predictions, never144 independent cases", () => {
  const value = summary();
  assert.equal(completeEmbeddingAcquisition(value), true);
  assert.equal(value.counters.plannedCases, 72);
  assert.equal(value.counters.observedPairs, 72);
  assert.equal(value.counters.predictionAttemptsKnown, 144);
  assert.equal(value.counters.predictionsCompletedKnown, 144);
});
test("parity failure retains exact process/prediction counts but prevents learning", () => {
  const value = summary();
  value.cases[0] = {
    ...observed(0),
    status: "failed",
    pair: {
      ...observed(0).pair,
      valid: false,
      operationalSuccess: false,
      reason: "center_parity_failed",
    },
  };
  value.status = "failed";
  value.counters = summarizeEmbeddingAcquisition(value.cases);
  assert.equal(value.counters.predictionsCompletedKnown, 144);
  assert.equal(value.counters.exactCounterExecutions, 72);
  assert.equal(value.counters.failedPairs, 1);
  assert.equal(completeEmbeddingAcquisition(value), false);
});
test("one killed process stops with lower bounds and all72 planned denominators", () => {
  const cases = [
    {
      id: id(0),
      status: "failed",
      processStarted: true,
      pair: {
        valid: false,
        operationalSuccess: false,
        counters: null,
        progress: { lastCounters: footer(2, 1) },
        counterEvidence: "progress_lower_bound",
      },
    },
    ...Array.from({ length: 71 }, (_, n) => ({ id: id(n + 1), status: "not_attempted" })),
  ];
  const out = summarizeEmbeddingAcquisition(cases);
  assert.equal(out.processExecutions, 1);
  assert.equal(out.failedPairs, 1);
  assert.equal(out.notAttempted, 71);
  assert.equal(out.predictionAttemptsKnown, 2);
  assert.equal(out.predictionsCompletedKnown, 1);
  assert.equal(out.lowerBoundCounterExecutions, 1);
  assert.equal(
    completeEmbeddingAcquisition({
      status: "failed",
      sourceHashesUnchanged: true,
      cases,
      counters: out,
    }),
    false,
  );
});
test("missing telemetry is unknown, not zero completed calls certified", () => {
  const out = summarizeEmbeddingAcquisition([
    { id: id(0), status: "failed", processStarted: true, pair: null },
  ]);
  assert.equal(out.processExecutions, 1);
  assert.equal(out.unavailableCounterExecutions, 1);
  assert.equal(out.exactCounterExecutions, 0);
});
test("prelaunch failure is not falsely counted as an image process", () => {
  const out = summarizeEmbeddingAcquisition([
    { id: id(0), status: "failed", spawnAttempted: false, processStarted: false, pair: null },
  ]);
  assert.equal(out.prelaunchFailures, 1);
  assert.equal(out.failedPairs, 1);
  assert.equal(out.processExecutions, 0);
  assert.equal(out.unavailableCounterExecutions, 0);
  assert.equal(out.processAttempts, 0);
});
test("ambiguous launch errors retain unknown execution and counter evidence", () => {
  const call = makeEmbeddingCall(
    { pid: 0, status: null, signal: null, error: { code: "EINTR" } },
    2,
  );
  assert.equal(call.spawned, null);
  const out = summarizeEmbeddingAcquisition([
    { id: id(0), status: "failed", spawnAttempted: true, processStarted: call.spawned, pair: null },
  ]);
  assert.equal(out.processAttempts, 1);
  assert.equal(out.processExecutions, 0);
  assert.equal(out.unknownProcessLaunches, 1);
  assert.equal(out.prelaunchFailures, 0);
  assert.equal(out.unavailableCounterExecutions, 1);
});
test("partial, duplicate, noncanonical or changed-source sets cannot qualify", () => {
  for (const change of [
    (v) => {
      v.status = "failed";
    },
    (v) => {
      v.sourceHashesUnchanged = false;
    },
    (v) => {
      v.cases.pop();
    },
    (v) => {
      v.cases[1].id = v.cases[0].id;
    },
    (v) => {
      v.cases[0].id = "label-not-image-hash";
    },
    (v) => {
      v.cases[0].pair.counterEvidence = "progress_lower_bound";
    },
    (v) => {
      v.cases[0].processStarted = false;
    },
    (v) => {
      v.counters.predictionsCompletedKnown = 143;
    },
  ]) {
    const value = summary();
    change(value);
    assert.equal(completeEmbeddingAcquisition(value), false);
  }
});
test("worker envelope preserves exact stdout, progress, exit and kill evidence", () => {
  const call = makeEmbeddingCall(
    { status: 0, stdout: '{"status":"observed"}\n', stderr: "progress\n", signal: null },
    3.4,
  );
  assert.deepEqual(call.raw, { status: "observed" });
  assert.equal(call.failed, false);
  assert.equal(call.wallMs, 3);
  const killed = makeEmbeddingCall(
    {
      status: null,
      stdout: "{partial",
      stderr: "last-stage\n",
      signal: "SIGTERM",
      error: { code: "ETIMEDOUT" },
    },
    15001,
  );
  assert.equal(killed.raw, null);
  assert.equal(killed.errorCode, "ETIMEDOUT");
  assert.equal(killed.signal, "SIGTERM");
  assert.equal(killed.stdout, "{partial");
  assert.equal(killed.failed, true);
  assert.equal(makeEmbeddingCall({ status: 1, stdout: "{}", stderr: "" }, 2).failed, true);
  assert.equal(
    makeEmbeddingCall(
      { pid: 0, status: null, stdout: "", stderr: "", error: { code: "EACCES" } },
      2,
    ).spawned,
    false,
  );
});
test("image/head budget overflow is rejected", () => {
  assert.throws(() =>
    summarizeEmbeddingAcquisition(Array.from({ length: 73 }, (_, n) => observed(n))),
  );
  assert.throws(() =>
    summarizeEmbeddingAcquisition([
      { ...observed(0), pair: { ...observed(0).pair, counters: footer(145, 145) } },
    ]),
  );
});
test("lock binds source/runtime/data/spec and the exact45/27 opaque allocation", () => {
  const source = { files: { worker: "same" }, node: "test" };
  const allocation = {
    train: Array.from({ length: 45 }, (_, n) => id(n)),
    validation: Array.from({ length: 27 }, (_, n) => id(n + 45)),
  };
  const lock = {
    schemaVersion: "two-view-learning-lock-v1",
    experimentId: "kig-embedding-v2",
    referenceStatus: "seen_ai_reviewed_human_review_required",
    imagePredictionsBeforeLock: 0,
    realFitsBeforeLock: 0,
    sources: source,
    basisHash: "basis",
    allocation,
    specHash: "spec",
  };
  checkEmbeddingLock(lock, source, "basis", allocation, "spec");
  for (const [s, b, a, p] of [
    [{ ...source, node: "changed" }, "basis", allocation, "spec"],
    [source, "changed", allocation, "spec"],
    [source, "basis", { ...allocation, train: [...allocation.train].reverse() }, "spec"],
    [source, "basis", allocation, "changed"],
  ])
    assert.throws(() => checkEmbeddingLock(lock, s, b, a, p));
  assert.throws(() =>
    checkEmbeddingLock({ ...lock, realFitsBeforeLock: 1 }, source, "basis", allocation, "spec"),
  );
});
test("only explicit freeze/acquire/run modes with actual pinned hashes are accepted", () => {
  const base = [
    "--lock",
    "work/freeze/lock.json",
    "--lock-sha",
    "1".repeat(64),
    "--output",
    "work/result",
  ];
  assert.equal(parseEmbeddingArguments(["--freeze", "--output", "work/freeze"]).mode, "--freeze");
  assert.equal(parseEmbeddingArguments(["--acquire", ...base]).mode, "--acquire");
  assert.equal(
    parseEmbeddingArguments([
      "--run",
      ...base,
      "--features",
      "work/images/summary.json",
      "--features-sha",
      "2".repeat(64),
    ]).mode,
    "--run",
  );
  for (const args of [
    [],
    ["--run", ...base],
    ["--acquire", ...base, "--features", "work/a"],
    ["--freeze", "--output", "https://example.org"],
    ["--freeze", "--output", "work/a", "--output", "work/b"],
    ["--run", ...base, "--features", "work/a", "--features-sha", "fake"],
  ])
    assert.throws(() => parseEmbeddingArguments(args));
});
