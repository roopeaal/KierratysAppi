import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  applyLinearVeto,
  assertExperimentUnclaimed,
  checkedOutput,
  checkLinearFit,
  claimFrozenFit,
  linearValidationGate,
  measureLinearResults,
  parseLinearArguments,
  validateFrozenState,
  validateLearningSpec,
} from "../qa/local-vision/linear-evaluate.mjs";
import { linearHeadClasses, trainLinearHead } from "../qa/local-vision/linear-head.mjs";

const known = linearHeadClasses.slice(0, 5),
  ok = { valid: true, success: true };
const unknown = { status: "unknown", reason: "no_operating_point_match" };
const baseline = (kind) => ({ status: "estimated", kind, method: "system" });
function head(label) {
  return {
    status: label === "unknown" ? "unknown" : "estimated",
    ...(label === "unknown" ? { reason: "outside_kind" } : { kind: label }),
    rawScores: linearHeadClasses.map((k) => ({ label: k, score: k === label ? 0.8 : 0.1 })),
    margin: 0.8 - 0.1,
    scoreMeaning: "regularized_linear_score_not_probability",
  };
}
function evaluated(label, base, prediction, operational = ok) {
  const candidate = applyLinearVeto(base, operational, prediction);
  return {
    label,
    baseline: base,
    baselineOperational: operational,
    candidate: candidate.decision,
    candidateOperational: candidate.operational,
  };
}
function successfulValidation() {
  return [
    ...known.flatMap((k) =>
      [0, 1, 2].map((n) => evaluated(k, n < 2 ? baseline(k) : unknown, head(k))),
    ),
    ...Array.from({ length: 12 }, (_, n) =>
      evaluated("unknown", n === 0 ? baseline("bottle") : unknown, head("unknown")),
    ),
  ];
}
function temp(t) {
  const root = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "kig-linear-eval-"));
  fs.mkdirSync(path.join(root, "work"));
  t.after(() => fs.rmSync(root, { recursive: true }));
  return root;
}
test("learned head retains only a matching already-accepted kind", () => {
  for (const k of known) {
    assert.equal(applyLinearVeto(baseline(k), ok, head(k)).decision.kind, k);
    const other = known.find((v) => v !== k);
    assert.equal(applyLinearVeto(baseline(k), ok, head(other)).decision.status, "unknown");
    assert.equal(applyLinearVeto(baseline(k), ok, head("unknown")).decision.status, "unknown");
  }
});
test("existing unknowns, conflicts and failures cannot be recovered", () => {
  for (const reason of [
    "primary_uncertainty",
    "conflicting_operating_point_matches",
    "weak_similarity",
    "unsupported_kind",
  ]) {
    const base = { status: "unknown", reason },
      operation = { valid: reason !== "primary_uncertainty", success: false };
    const result = applyLinearVeto(base, operation, head("bottle"));
    assert.deepEqual(result.decision, base);
    assert.deepEqual(result.operational, operation);
    assert.equal(result.headRequired, false);
  }
});
test("malformed head response is a required failure, not error-removal credit", () => {
  for (const prediction of [
    undefined,
    { status: "estimated", kind: "bottle" },
    { ...head("bottle"), margin: 9 },
    { ...head("bottle"), kind: "jar" },
  ]) {
    const result = evaluated("unknown", baseline("bottle"), prediction);
    const metrics = measureLinearResults([result], "candidate");
    assert.equal(metrics.removedBaselineWrong, 0);
    assert.equal(metrics.safeAbstention, 0);
    assert.equal(metrics.introducedOperationalFailures, 1);
    assert.equal(metrics.introducedInvalidOutputs, 1);
  }
});
test("numeric extrapolation abstains honestly without fake scores", () => {
  const prediction = {
    status: "unknown",
    reason: "out_of_training_range",
    rawScores: null,
    margin: null,
    scoreMeaning: "regularized_linear_score_not_probability",
  };
  const result = applyLinearVeto(baseline("bottle"), ok, prediction);
  assert.equal(result.decision.status, "unknown");
  assert.deepEqual(result.operational, ok);
});
test("unused head failure does not rewrite a primary failure or drop its denominator", () => {
  const rows = [
    evaluated("bottle", { status: "unknown", reason: "primary_uncertainty" }, undefined, {
      valid: false,
      success: false,
    }),
  ];
  const metrics = measureLinearResults(rows, "candidate");
  assert.equal(metrics.total, 1);
  assert.equal(metrics.operationalFailures, 1);
  assert.equal(metrics.invalidRequiredOutputs, 1);
  assert.equal(metrics.introducedOperationalFailures, 0);
});
test("frozen validation gate needs real error removal, coverage and every kind", () => {
  const rows = successfulValidation(),
    b = measureLinearResults(rows, "baseline"),
    c = measureLinearResults(rows, "candidate");
  assert.equal(b.wrongAccepted, 1);
  assert.equal(c.correctAccepted, 10);
  assert.equal(c.removedBaselineWrong, 1);
  assert.equal(linearValidationGate(b, c), true);
  for (const patch of [
    { wrongAccepted: 1 },
    { lostBaselineCorrect: 1 },
    { removedBaselineWrong: 0 },
    { correctAccepted: 7 },
    { introducedOperationalFailures: 1 },
    { introducedInvalidOutputs: 1 },
    { total: 26 },
  ])
    assert.equal(linearValidationGate(b, { ...c, ...patch }), false);
  const missingKind = structuredClone(c);
  missingKind.perKind.cup.correctAccepted = 0;
  assert.equal(linearValidationGate(b, missingKind), false);
});
test("always unknown and retaining a known wrong result both fail", () => {
  const rows = successfulValidation(),
    b = measureLinearResults(rows, "baseline");
  const always = rows.map((r) => ({ ...r, candidate: unknown }));
  assert.equal(linearValidationGate(b, measureLinearResults(always, "candidate")), false);
  rows[15].candidate = baseline("bottle");
  assert.equal(linearValidationGate(b, measureLinearResults(rows, "candidate")), false);
});
test("wrong answers stay counted even if operation also fails", () => {
  const row = evaluated("unknown", baseline("bottle"), head("bottle"));
  row.candidateOperational = { valid: false, success: false };
  const result = measureLinearResults([row], "candidate");
  assert.equal(result.wrongAccepted, 1);
  assert.equal(result.operationalFailures, 1);
});
test("spec cannot silently change model, objective, margin, split or integration authority", () => {
  const spec = JSON.parse(
    fs.readFileSync(new URL("../qa/local-vision/linear-learning-spec.json", import.meta.url)),
  );
  assert.equal(validateLearningSpec(spec), spec);
  for (const [field, name, value] of [
    ["features", "revision", "other"],
    ["head", "l2", 0.1],
    ["head", "minimumRawMargin", 0.01],
    ["head", "objective", "mean_of_six"],
    ["split", "totalTrain", 50],
    ["execution", "appIntegrationAllowed", true],
  ]) {
    const bad = structuredClone(spec);
    bad[field][name] = value;
    assert.throws(() => validateLearningSpec(bad));
  }
  assert.throws(() => validateLearningSpec({ ...spec, unregisteredSearch: true }));
});
test("frozen source, runtime, data and family allocation may not drift", () => {
  const snapshot = { files: {}, node: "test", platform: "test", sourceHash: "1".repeat(64) };
  const allocation = {
    train: Array.from({ length: 45 }, (_, n) => `train-${n}`),
    validation: Array.from({ length: 27 }, (_, n) => `validation-${n}`),
  };
  const lock = {
    schemaVersion: "linear-learning-lock-v1",
    experimentId: "kig-linear-v1",
    referenceStatus: "seen_ai_reviewed_human_review_required",
    fitsBeforeLock: 0,
    headPredictionsBeforeLock: 0,
    snapshot,
    dataHash: "2".repeat(64),
    allocation,
  };
  validateFrozenState(lock, snapshot, "2".repeat(64), allocation);
  for (const bad of [
    { ...snapshot, node: "changed" },
    { ...snapshot, files: { policy: "changed" } },
  ])
    assert.throws(() => validateFrozenState(lock, bad, "2".repeat(64), allocation));
  assert.throws(() => validateFrozenState(lock, snapshot, "3".repeat(64), allocation));
  assert.throws(() =>
    validateFrozenState(lock, snapshot, "2".repeat(64), {
      ...allocation,
      train: [...allocation.train].reverse(),
    }),
  );
});
test("output is restricted to absent, unlinked paths inside work", (t) => {
  const cwd = temp(t);
  assert.equal(checkedOutput("work/run", cwd), path.join(cwd, "work/run"));
  fs.mkdirSync(path.join(cwd, "work/run"));
  assert.throws(() => checkedOutput("work/run", cwd));
  assert.throws(() => checkedOutput("outside", cwd));
  fs.mkdirSync(path.join(cwd, "work/real"));
  fs.symlinkSync(path.join(cwd, "work/real"), path.join(cwd, "work/link"));
  assert.throws(() => checkedOutput("work/link/run", cwd));
});
test("a frozen lock is single-use even with another requested output", (t) => {
  const cwd = temp(t),
    lock = path.join(cwd, "work/lock.json");
  fs.writeFileSync(lock, "{}");
  claimFrozenFit(lock, "1".repeat(64), "work/run1", cwd);
  assert.throws(() => claimFrozenFit(lock, "1".repeat(64), "work/run2", cwd));
  const receipt = JSON.parse(fs.readFileSync(path.join(cwd, "work/fit-attempt.json")));
  assert.equal(receipt.output, "work/run1");
});
test("copied locks and newly frozen hashes cannot bypass the canonical attempt ledger", (t) => {
  const cwd = temp(t);
  fs.mkdirSync(path.join(cwd, "work/first"));
  fs.mkdirSync(path.join(cwd, "work/copy"));
  const first = path.join(cwd, "work/first/lock.json"),
    copy = path.join(cwd, "work/copy/lock.json");
  fs.writeFileSync(first, "{}");
  fs.writeFileSync(copy, "{}");
  claimFrozenFit(first, "1".repeat(64), "work/run1", cwd);
  assert.throws(
    () => assertExperimentUnclaimed(cwd),
    "a second freeze cannot claim zero prior fits",
  );
  assert.throws(() => claimFrozenFit(copy, "1".repeat(64), "work/run2", cwd));
  assert.throws(() => claimFrozenFit(copy, "2".repeat(64), "work/run3", cwd));
  assert.equal(fs.existsSync(path.join(cwd, "work/copy/fit-attempt.json")), false);
});
test("a symbolic canonical ledger directory is refused without writing through it", (t) => {
  const cwd = temp(t);
  fs.mkdirSync(path.join(cwd, "target"));
  fs.symlinkSync(path.join(cwd, "target"), path.join(cwd, "work/linear-learning-attempts"));
  assert.throws(() =>
    claimFrozenFit(path.join(cwd, "work/lock.json"), "1".repeat(64), "work/run", cwd),
  );
  assert.equal(fs.readdirSync(path.join(cwd, "target")).length, 0);
});
test("actual-fit objective, slope norm and normal equations are checked independently", () => {
  const rows = linearHeadClasses.map((label, n) => ({
    id: n.toString(16).padStart(64, "0"),
    label,
    features: Array(18).fill(0),
  }));
  const model = trainLinearHead(
    rows.map((r) => ({ id: r.id, label: r.label, scores: r.features })),
  );
  const sanity = checkLinearFit(model, rows);
  assert.ok(Math.abs(sanity.objective - 5) < 1e-8);
  assert.ok(sanity.maximumNormalEquationResidual < 1e-8);
  const bad = structuredClone(model);
  bad.coefficients[0][0] += 0.01;
  assert.throws(() => checkLinearFit(bad, rows));
});
test("explicit commands reject missing pins, duplicate flags and URLs", () => {
  assert.equal(parseLinearArguments(["--freeze", "--output", "work/freeze"]).mode, "--freeze");
  assert.equal(
    parseLinearArguments([
      "--run",
      "--output",
      "work/run",
      "--lock",
      "work/lock.json",
      "--lock-sha",
      "1".repeat(64),
    ]).mode,
    "--run",
  );
  for (const args of [
    [],
    ["--run", "--output", "work/run"],
    ["--freeze", "--output", "work/a", "--output", "work/b"],
    ["--freeze", "--output", "https://example.org"],
    ["--freeze", "--output", "work/a", "--lock", "work/x"],
  ])
    assert.throws(() => parseLinearArguments(args));
});
