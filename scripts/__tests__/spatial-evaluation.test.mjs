import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  confirmSpatial,
  decodeSpatial,
  parseArguments,
  selectSpatialDevelopment,
  spatialGuard,
  spatialOperational,
} from "../qa/local-vision/spatial-evaluate.mjs";

const prompts = JSON.parse(
  readFileSync(new URL("../qa/local-vision/mobileclip-prompts.json", import.meta.url)),
);
const groups = prompts.groups.map((group) => group.identifier);
const positives = ["bottle", "jar", "box", "bag", "cup"];
const estimated = (kind) => ({ status: "estimated", kind });
const unknown = { status: "unknown", reason: "no_operating_point_match" };
const scores = (winner, top = 0.4, other = 0.05) =>
  groups.map((group) => ({ group, cosine: group === winner ? top : other }));
const decide = (input, policy) => {
  assert.equal(policy, "loose");
  const [first, second] = [...input].sort((a, b) => b.cosine - a.cosine);
  return positives.includes(first.group) &&
    first.cosine >= 0.2 &&
    first.cosine - second.cosine >= 0.02
    ? estimated(first.group)
    : unknown;
};
const spatial = (...winners) => ({
  valid: true,
  operationalSuccess: true,
  views: winners.map((winner) => ({ scores: scores(winner) })),
});
const ok = { valid: true, success: true };
const row = (expectedKind, baseline, s1, s2 = s1, states = {}) => ({
  expectedKind,
  decisions: { baseline, S1: s1, S2: s2 },
  operational: { baseline: ok, S1: ok, S2: ok, ...states },
});
const correctRows = () =>
  Array.from({ length: 5 }, () => row("cup", estimated("cup"), estimated("cup")));

test("S1 and S2 veto different confident supported regions without substituting a kind", () => {
  for (const variant of ["S1", "S2"])
    assert.deepEqual(
      spatialGuard(estimated("box"), spatial("box", "bag", "box", "bag"), decide, variant),
      { status: "unknown", reason: "spatial_disagreement" },
    );
});
test("S2 requires a region kind matching baseline; S1 is deliberately more restrictive", () => {
  const observations = spatial("box", "bag", "box", "bag");
  assert.equal(spatialGuard(estimated("jar"), observations, decide, "S1").status, "unknown");
  assert.equal(spatialGuard(estimated("jar"), observations, decide, "S2").kind, "jar");
});
test("same-kind, weak, close and outside-only regions do not invent multi-kind evidence", () => {
  const same = spatial("box", "box", "box", "box");
  const weak = spatial("box", "bag", "other-battery", "other-aerosol");
  weak.views[1].scores = scores("bag", 0.19);
  const close = spatial("box", "bag", "other-battery", "other-aerosol");
  close.views[1].scores = scores("bag", 0.3, 0.29);
  for (const observation of [
    same,
    weak,
    close,
    spatial("other-aerosol", "other-battery", "other-food", "other-leaf"),
  ])
    for (const variant of ["S1", "S2"])
      assert.equal(spatialGuard(estimated("box"), observation, decide, variant).kind, "box");
});
for (const reason of [
  "conflicting_kinds",
  "processing_failed",
  "invalid_response",
  "no_operating_point_match",
])
  test(`baseline ${reason} never becomes an estimate or newly required crop failure`, () => {
    const baseline = { status: "unknown", reason };
    const failed = { valid: false, operationalSuccess: false, views: [] };
    assert.equal(spatialGuard(baseline, failed, decide, "S1"), baseline);
    assert.equal(spatialOperational(baseline, ok, failed), ok);
  });
test("required spatial failure is typed unknown, never successful veto or safe abstention", () => {
  const baseline = estimated("box"),
    failed = { valid: true, operationalSuccess: false, views: [] };
  const decision = spatialGuard(baseline, failed, decide, "S2");
  assert.deepEqual(decision, { status: "unknown", reason: "spatial_unavailable" });
  const state = spatialOperational(baseline, ok, failed);
  assert.deepEqual(state, { valid: true, success: false });
  const result = selectSpatialDevelopment([
    ...correctRows(),
    row("unknown", baseline, decision, decision, { S1: state, S2: state }),
  ]);
  assert.equal(result.selectedVariant, null);
  assert.equal(result.results[0].removedBaselineWrong, 0);
  assert.equal(result.results[0].safeAbstention, 0);
  assert.equal(result.results[0].introducedOperationalFailures, 1);
});
test("development selects a real error removal, zero correct loss and prefers anchored S2 on ties", () => {
  const fixed = row("unknown", estimated("box"), unknown);
  assert.equal(selectSpatialDevelopment([...correctRows(), fixed]).selectedVariant, "S2");
  assert.equal(
    selectSpatialDevelopment([
      ...correctRows(),
      row("unknown", estimated("box"), unknown, estimated("box")),
    ]).selectedVariant,
    "S1",
  );
});
test("agreement alone, an always-unknown guard or one correct loss cannot qualify", () => {
  assert.equal(selectSpatialDevelopment(correctRows()).selectedVariant, null);
  assert.equal(
    selectSpatialDevelopment([row("unknown", estimated("box"), unknown)]).selectedVariant,
    null,
  );
  assert.equal(
    selectSpatialDevelopment([
      ...correctRows(),
      row("unknown", estimated("box"), unknown),
      row("bag", estimated("bag"), unknown),
    ]).selectedVariant,
    null,
  );
});
test("confirmation rejects any wrong acceptance, correct loss, failure or inadequate coverage", () => {
  const fixed = row("unknown", estimated("box"), unknown);
  assert.equal(confirmSpatial([...correctRows(), fixed], "S2").integrationEligible, true);
  assert.equal(confirmSpatial(correctRows(), "S2").integrationEligible, true);
  for (const extra of [
    row("unknown", estimated("box"), estimated("box")),
    row("bag", estimated("bag"), unknown),
    row("unknown", estimated("box"), unknown, unknown, { S2: { valid: true, success: false } }),
    row("unknown", estimated("box"), unknown, unknown, { S2: { valid: false, success: false } }),
  ])
    assert.equal(confirmSpatial([...correctRows(), fixed, extra], "S2").integrationEligible, false);
  assert.equal(confirmSpatial([fixed], "S2").integrationEligible, false);
  assert.throws(() => confirmSpatial([], null));
});

const rectangles = [
  { x: 0, y: 0, width: 0.6, height: 1 },
  { x: 0.4, y: 0, width: 0.6, height: 1 },
  { x: 0, y: 0, width: 1, height: 0.6 },
  { x: 0, y: 0.4, width: 1, height: 0.6 },
];
const rawObservation = () => ({
  schemaVersion: "mobileclip-spatial-scores-v1",
  status: "observed",
  modelId: "apple-mobileclip-s0-coreml-2024",
  modelRevision: "55c8098c12ba8f928e37e26b2e1dd097777c3f98",
  imageWeightSha256: "87d8f63997bbd2f38ba7defeaaa2c571928bdece56aa9629542198b3ce906ed6",
  prototypesSha256: "0dfe73569d1b2177629d95c4bc21c1392be9228aff6809cab0ed1c3358893c81",
  promptsSha256: "aa726197e10fc1911b88bb6d6da099220339133c6e39e500f112b9077316e610",
  promptPolicy: "packaging-visible-form-v1",
  preprocessing: "four-sides-60pct-aspect-fit-256-srgb-gray127-v1",
  cropPolicy: "horizontal-vertical-overlap-20pct-v1",
  computeUnits: "cpuOnly",
  osVersion: "26.7.0",
  durationMs: 400,
  orientedWidth: 1000,
  orientedHeight: 500,
  predictionsAttempted: 4,
  predictionsCompleted: 4,
  views: ["left", "right", "bottom", "top"].map((side, index) => ({
    side,
    normalizedRect: { ...rectangles[index] },
    pixelRect: {
      x: rectangles[index].x * 1000,
      y: rectangles[index].y * 500,
      width: rectangles[index].width * 1000,
      height: rectangles[index].height * 500,
    },
    embeddingNorm: 1,
    scores: scores("box"),
  })),
});
const validScores = (input) =>
  Array.isArray(input) &&
  input.length === 18 &&
  new Set(input.map((value) => value.group)).size === 18 &&
  input.every(
    (value) =>
      groups.includes(value.group) &&
      Number.isFinite(value.cosine) &&
      value.cosine >= -1 &&
      value.cosine <= 1,
  );
const call = (raw, exitCode = 0) => ({
  raw,
  exitCode,
  failed: false,
  signal: null,
  errorCode: null,
});
test("four-view observations retain exact crop geometry, pins and completed prediction counts", () => {
  const parsed = decodeSpatial(call(rawObservation()), validScores);
  assert.equal(parsed.operationalSuccess, true);
  assert.equal(parsed.predictionsCompleted, 4);
  assert.equal(parsed.views.length, 4);
});
for (const [name, change] of [
  [
    "extra field",
    (r) => {
      r.material = "cardboard";
    },
  ],
  [
    "model pin",
    (r) => {
      r.modelRevision = "other";
    },
  ],
  [
    "preprocessing",
    (r) => {
      r.preprocessing = "center-square-256-srgb-v1";
    },
  ],
  [
    "crop identity",
    (r) => {
      r.views[0].side = "right";
    },
  ],
  [
    "pixel crop",
    (r) => {
      r.views[1].pixelRect.x = 0;
    },
  ],
  [
    "normalized crop",
    (r) => {
      r.views[2].normalizedRect.height = 1;
    },
  ],
  [
    "missing view",
    (r) => {
      r.views.pop();
    },
  ],
  [
    "prediction counts",
    (r) => {
      r.predictionsCompleted = 3;
    },
  ],
  [
    "output norm",
    (r) => {
      r.views[0].embeddingNorm = Number.NaN;
    },
  ],
  [
    "invalid scores",
    (r) => {
      r.views[0].scores[0].cosine = Number.POSITIVE_INFINITY;
    },
  ],
])
  test(`spatial decoder rejects ${name}`, () => {
    const raw = rawObservation();
    change(raw);
    assert.equal(decodeSpatial(call(raw), validScores).valid, false);
  });
test("partial prediction failures stay well-formed failures, not four successful model calls", () => {
  const failure = {
    schemaVersion: "mobileclip-spatial-scores-v1",
    status: "unavailable",
    reason: "processing_failed",
    predictionsAttempted: 2,
    predictionsCompleted: 1,
  };
  const result = decodeSpatial(call(failure, 1), validScores);
  assert.equal(result.valid, true);
  assert.equal(result.operationalSuccess, false);
  assert.equal(result.predictionsAttempted, 2);
  assert.equal(result.predictionsCompleted, 1);
  for (const raw of [
    { ...failure, reason: "unknown" },
    { ...failure, extra: "no" },
    { ...failure, predictionsCompleted: 3 },
  ])
    assert.equal(decodeSpatial(call(raw, 1), validScores).valid, false);
  assert.equal(decodeSpatial({ ...call(failure, 1), signal: "SIGTERM" }, validScores).valid, false);
});
test("explicit development and prospective arguments are disjoint; no hidden run or baseline retake", () => {
  const common = [
    "--run",
    "--phase",
    "development",
    "--spatial",
    "work/spatial",
    "--compiled",
    "work/model",
    "--prototypes",
    "work/prototypes",
    "--corpus",
    "work/corpus",
    "--manifest-sha",
    "a".repeat(64),
    "--output",
    "work/new",
  ];
  const dev = [...common, "--baseline", "work/old/summary.json", "--baseline-sha", "b".repeat(64)];
  assert.equal(parseArguments(dev).phase, "development");
  assert.throws(() => parseArguments(dev.slice(1)));
  assert.throws(() => parseArguments([...dev, "--primary", "work/primary"]));
  assert.throws(() => parseArguments([...dev, "--unknown", "work/path"]));
  const prospective = [...common];
  prospective[2] = "confirmatory";
  prospective.push(
    "--primary",
    "work/primary",
    "--center",
    "work/center",
    "--selection",
    "work/selection.json",
    "--selection-sha",
    "c".repeat(64),
  );
  assert.equal(parseArguments(prospective).phase, "confirmatory");
  assert.throws(() => parseArguments([...prospective, "--baseline", "work/old.json"]));
});
test("QA spatial source cannot network, read image paths, change prompts or supply sorting truth", () => {
  const source = readFileSync(
    new URL("../qa/local-vision/spatial-main.swift", import.meta.url),
    "utf8",
  );
  assert.match(source, /Side\.allCases\.map/);
  assert.match(source, /counter\.attempted \+= 1/);
  assert.match(source, /counter\.completed \+= 1/);
  assert.match(source, /\.cacheIntermediates: false/);
  assert.match(source, /defer \{ context\.clearCaches\(\) \}/);
  assert.doesNotMatch(
    source,
    /URLSession|URLRequest|CGImageSourceCreateWithURL|NSLog|print\(|minimumCosine|winner\s*=/,
  );
  assert.match(source, /FileHandle\.standardInput\.read/);
});
