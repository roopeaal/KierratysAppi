import assert from "node:assert/strict";
import test from "node:test";
import {
  canRecover,
  foregroundDecision,
  foregroundState,
  requiredForeground,
  selectForeground,
  confirmForeground,
  decodeForeground,
} from "../qa/local-vision/foreground-policy.mjs";

const noMatch = { status: "unknown", reason: "no_operating_point_match" };
const primary = (object = noMatch) => ({ valid: true, operationalSuccess: true, primary: object });
const estimate = (kind) => ({ status: "estimated", kind });
const weak = { status: "unknown", reason: "weak_similarity" };
const center = { valid: true, operationalSuccess: true };
const ok = { valid: true, success: true };
const fg = (...kinds) => ({
  valid: true,
  operationalSuccess: true,
  instances: kinds.map((kind) => ({ scores: kind })),
});
const decide = (kind) => (kind === "unknown" ? weak : estimate(kind));
const row = (expectedKind, baseline, F1, F2 = F1, states = {}) => ({
  expectedKind,
  decisions: { baseline, F1, F2 },
  operational: { baseline: ok, F1: ok, F2: ok, ...states },
});

test("F1 vetoes supported subject disagreement including the proposed kind, never substitutes", () => {
  assert.deepEqual(
    foregroundDecision("F1", primary(), center, estimate("bottle"), fg("bottle", "box"), decide),
    { status: "unknown", reason: "foreground_disagreement" },
  );
  assert.deepEqual(
    foregroundDecision("F1", primary(), center, estimate("cup"), fg("bottle", "box"), decide),
    estimate("cup"),
  );
});
test("F1 retains matching or unconfident subject observations without recovering unknowns", () => {
  for (const observation of [fg("cup"), fg("cup", "cup"), fg("cup", "unknown")])
    assert.deepEqual(
      foregroundDecision("F1", primary(), center, estimate("cup"), observation, decide),
      estimate("cup"),
    );
  assert.equal(foregroundDecision("F1", primary(), center, weak, fg("cup"), decide), weak);
});
test("F2 recovers only successful primary-no-match/center-weak or ambiguous unanimous subjects", () => {
  for (const reason of ["weak_similarity", "ambiguous_similarity"])
    assert.deepEqual(
      foregroundDecision(
        "F2",
        primary(),
        center,
        { status: "unknown", reason },
        fg("jar", "jar"),
        decide,
      ),
      { status: "estimated", kind: "jar", method: "foreground_subject_consensus" },
    );
});
for (const reason of ["unsupported_kind", "invalid_scores", "primary_uncertainty"])
  test(`F2 never overrides baseline ${reason}`, () => {
    const baseline = { status: "unknown", reason };
    assert.equal(canRecover(primary(), center, baseline), false);
    assert.equal(
      foregroundDecision("F2", primary(), center, baseline, fg("jar"), decide),
      baseline,
    );
  });
test("F2 does not recover primary conflicts, errors or required-center failures", () => {
  for (const p of [
    primary({ status: "unknown", reason: "conflicting_kinds" }),
    { valid: true, operationalSuccess: false, primary: noMatch },
    { valid: false, operationalSuccess: false, primary: noMatch },
  ])
    assert.equal(canRecover(p, center, weak), false);
  assert.equal(canRecover(primary(), { valid: true, operationalSuccess: false }, weak), false);
  for (const observation of [fg("jar", "box"), fg("jar", "unknown")])
    assert.equal(foregroundDecision("F2", primary(), center, weak, observation, decide), weak);
});
test("required mask failure stays unknown and failure, not a successful error removal", () => {
  const failed = { valid: true, operationalSuccess: false, instances: [] };
  assert.equal(
    foregroundDecision("F2", primary(), center, estimate("bottle"), failed, decide).reason,
    "foreground_unavailable",
  );
  assert.deepEqual(foregroundState(true, ok, failed), { valid: true, success: false });
  assert.equal(requiredForeground("F1", primary(), center, weak, ok), false);
  assert.equal(requiredForeground("F2", primary(), center, weak, ok), true);
  assert.equal(foregroundState(false, ok, failed), ok);
  const result = selectForeground([
    row("unknown", estimate("box"), weak, weak, {
      F1: { valid: true, success: false },
      F2: { valid: true, success: false },
    }),
  ]);
  assert.equal(result.selectedVariant, null);
  assert.equal(result.results[0].removedBaselineWrong, 0);
});
test("selection preserves old failed denominators and prefers smaller F1 on ties", () => {
  const failure = { valid: false, success: false };
  const rows = [
    row("unknown", estimate("box"), weak),
    row("jar", estimate("jar"), estimate("jar")),
    row("bottle", weak, weak, weak, { baseline: failure, F1: failure, F2: failure }),
  ];
  const result = selectForeground(rows);
  assert.equal(result.selectedVariant, "F1");
  assert.equal(result.baseline.total, 3);
  assert.equal(result.results[0].invalidRequiredOutputs, 1);
  assert.equal(result.results[0].introducedInvalidOutputs, 0);
});
test("F2 wins only with additional measured correct recovery, never a newly wrong guess", () => {
  const rows = [row("unknown", estimate("box"), weak), row("jar", weak, weak, estimate("jar"))];
  assert.equal(selectForeground(rows).selectedVariant, "F2");
  rows.push(row("unknown", weak, weak, estimate("cup")));
  assert.equal(selectForeground(rows).selectedVariant, "F1");
});
test("fresh confirmation rejects remaining errors and insufficient positive coverage", () => {
  const rows = [row("unknown", estimate("box"), weak)];
  assert.equal(confirmForeground(rows, "F1").integrationEligible, false);
  for (let n = 0; n < 5; n++) rows.push(row("jar", estimate("jar"), estimate("jar")));
  assert.equal(confirmForeground(rows, "F1").integrationEligible, true);
  rows.push(row("unknown", estimate("cup"), estimate("cup")));
  assert.equal(confirmForeground(rows, "F1").integrationEligible, false);
});

const observed = () => ({
  failed: false,
  signal: null,
  errorCode: null,
  exitCode: 0,
  raw: {
    schemaVersion: "mobileclip-foreground-scores-v1",
    status: "observed",
    modelId: "apple-mobileclip-s0-coreml-2024",
    modelRevision: "55c8098c12ba8f928e37e26b2e1dd097777c3f98",
    imageWeightSha256: "87d8f63997bbd2f38ba7defeaaa2c571928bdece56aa9629542198b3ce906ed6",
    prototypesSha256: "0dfe73569d1b2177629d95c4bc21c1392be9228aff6809cab0ed1c3358893c81",
    promptsSha256: "aa726197e10fc1911b88bb6d6da099220339133c6e39e500f112b9077316e610",
    promptPolicy: "packaging-visible-form-v1",
    preprocessing: "foreground-instance-aspect-fit-256-srgb-gray127-v1",
    cropPolicy: "apple-selected-instance-crop-alpha-gray127-v1",
    maskPolicy: "foreground-revision1-max4-logical12s-v1",
    clipComputeUnits: "cpuOnly",
    maskComputeUnits: "vision_system_default",
    maskRequestRevision: 1,
    logicalDeadlineMs: 12000,
    osVersion: "26.7.0",
    durationMs: 20,
    orientedWidth: 20,
    orientedHeight: 20,
    counters: {
      maskRequestsAttempted: 1,
      maskRequestsCompleted: 1,
      maskedImagesAttempted: 1,
      maskedImagesCompleted: 1,
      clipPredictionsAttempted: 1,
      clipPredictionsCompleted: 1,
    },
    mask: {
      width: 4,
      height: 4,
      bytesPerRow: 4,
      pixelFormat: 1278226488,
      encoding: "uint8_instance_labels",
      subjectInstanceIndices: [1],
      observedMaskLabels: [1],
    },
    instances: [
      {
        instanceIndex: 1,
        cropWidth: 10,
        cropHeight: 10,
        cropPixelFormat: 32,
        embeddingNorm: 1,
        scores: "test-vector",
      },
    ],
  },
});
test("strict subject decoder accepts pinned observations and rejects extra claims, changed IDs and late output", () => {
  assert.equal(decodeForeground(observed(), (s) => s === "test-vector").valid, true);
  for (const mutate of [
    (r) => {
      r.accuracy = 1;
    },
    (r) => {
      r.mask.observedMaskLabels = [2];
    },
    (r) => {
      r.durationMs = 12000;
    },
    (r) => {
      r.modelRevision = "wrong";
    },
    (r) => {
      r.counters.clipPredictionsCompleted = 0;
    },
    (r) => {
      r.instances.push(r.instances[0]);
    },
  ]) {
    const c = observed();
    mutate(c.raw);
    assert.equal(decodeForeground(c, () => true).valid, false);
  }
});
test("defined stage failures retain actual partial counters and cannot become successful observations", () => {
  const c = observed();
  c.exitCode = 1;
  c.raw = {
    schemaVersion: "mobileclip-foreground-scores-v1",
    status: "unavailable",
    reason: "timeout",
    durationMs: 12010,
    counters: {
      maskRequestsAttempted: 1,
      maskRequestsCompleted: 1,
      maskedImagesAttempted: 1,
      maskedImagesCompleted: 1,
      clipPredictionsAttempted: 1,
      clipPredictionsCompleted: 0,
    },
  };
  const result = decodeForeground(c, () => true);
  assert.equal(result.valid, true);
  assert.equal(result.operationalSuccess, false);
  assert.equal(result.counters.clipPredictionsCompleted, 0);
  c.failed = true;
  assert.equal(decodeForeground(c, () => true).valid, false);
});
test("foreground encoding cannot spoof its actual CoreVideo mask or crop pixel format", () => {
  for (const mutate of [
    (r) => {
      r.mask.pixelFormat = 32;
    },
    (r) => {
      r.mask.encoding = "float32_integer_instance_labels";
    },
    (r) => {
      r.instances[0].cropPixelFormat = 1278226488;
    },
  ]) {
    const c = observed();
    mutate(c.raw);
    assert.equal(decodeForeground(c, () => true).valid, false);
  }
});
