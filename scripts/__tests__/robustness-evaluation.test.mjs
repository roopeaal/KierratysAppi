import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  baselineDecision,
  contradictionVeto,
  decodeClip,
  heldoutDecision,
  measure,
  modelStageCounts,
  operationalState,
  parseArguments,
  selectValidation,
  twoViewAgreement,
} from "../qa/local-vision/robustness-evaluate.mjs";

const estimate = (kind) => ({ status: "estimated", kind });
const noMatch = { status: "unknown", reason: "no_operating_point_match" };
const uncertain = { status: "unknown", reason: "uncertain" };
const supported = ["bottle", "jar", "box", "bag", "cup"];
const prompts = JSON.parse(
  readFileSync(new URL("../qa/local-vision/mobileclip-prompts.json", import.meta.url)),
);
const groups = prompts.groups.map((group) => group.identifier);
const observation = (winner, top = 0.4, other = 0.05) => ({
  valid: true,
  operationalSuccess: true,
  scores: groups.map((group) => ({ group, cosine: group === winner ? top : other })),
});
const decide = (scores, policy) => {
  assert.equal(policy, "loose");
  const [first, second] = [...scores].sort((a, b) => b.cosine - a.cosine);
  return supported.includes(first.group) &&
    first.cosine >= 0.2 &&
    first.cosine - second.cosine >= 0.02
    ? estimate(first.group)
    : uncertain;
};
const primary = (object) => ({ valid: true, operationalSuccess: true, primary: object });
const ok = { valid: true, success: true };
const row = (expectedKind, baseline, a, b = a, overrides = {}) => ({
  expectedKind,
  decisions: { baseline, A: a, B: b },
  operational: { baseline: ok, A: ok, B: ok, ...overrides },
});
const coverageRows = () =>
  Array.from({ length: 5 }, () => row("jar", estimate("jar"), estimate("jar")));

test("baseline reconstruction preserves primary precedence and center fallback", () => {
  assert.equal(baselineDecision(estimate("bottle"), observation("jar"), decide).kind, "bottle");
  assert.equal(baselineDecision(noMatch, observation("jar"), decide).kind, "jar");
  assert.equal(
    baselineDecision({ status: "unknown", reason: "conflicting_kinds" }, observation("jar"), decide)
      .status,
    "unknown",
  );
});
test("A vetoes confidently different positives and outside winners, never substitutes", () => {
  for (const group of ["jar", "other-aerosol", "other-battery"])
    assert.deepEqual(contradictionVeto(estimate("bottle"), observation(group), decide), {
      status: "unknown",
      reason: "cross_model_contradiction",
    });
});
test("A keeps primary when center is matching, weak or insufficiently separated", () => {
  for (const scores of [
    observation("bottle"),
    observation("jar", 0.19),
    observation("jar", 0.3, 0.29),
  ])
    assert.equal(contradictionVeto(estimate("bottle"), scores, decide).kind, "bottle");
});
test("A uses unchanged positive gate only for a genuine primary no-match", () => {
  assert.equal(contradictionVeto(noMatch, observation("jar"), decide).kind, "jar");
  assert.equal(contradictionVeto(noMatch, observation("other-aerosol"), decide).status, "unknown");
});
for (const reason of ["conflicting_kinds", "processing_failed", "invalid_response"])
  test(`neither algorithm repairs primary ${reason}`, () => {
    const object = { status: "unknown", reason };
    assert.equal(contradictionVeto(object, observation("jar"), decide).status, "unknown");
    assert.equal(
      twoViewAgreement(object, observation("jar"), observation("jar"), decide).status,
      "unknown",
    );
  });
test("required center failure cannot be called a successful veto", () => {
  const failed = { valid: true, operationalSuccess: false, scores: [] };
  assert.equal(contradictionVeto(estimate("bottle"), failed, decide).reason, "model_failure");
  assert.equal(
    twoViewAgreement(noMatch, failed, observation("bottle"), decide).reason,
    "model_failure",
  );
});
test("B requires matching accepted positive views and any primary kind", () => {
  assert.equal(
    twoViewAgreement(noMatch, observation("jar"), observation("jar"), decide).kind,
    "jar",
  );
  assert.equal(
    twoViewAgreement(estimate("jar"), observation("jar"), observation("jar"), decide).kind,
    "jar",
  );
  for (const [object, first, second] of [
    [noMatch, observation("jar"), observation("bottle")],
    [noMatch, observation("jar"), observation("jar", 0.19)],
    [noMatch, observation("other-aerosol"), observation("other-aerosol")],
    [estimate("bottle"), observation("jar"), observation("jar")],
  ])
    assert.equal(twoViewAgreement(object, first, second, decide).status, "unknown");
});
test("operational accounting requires only the observations used by each algorithm", () => {
  const failed = { valid: true, operationalSuccess: false, scores: [] };
  const invalid = { valid: false, operationalSuccess: false, scores: [] };
  assert.deepEqual(operationalState(primary(estimate("jar")), failed, invalid, "baseline"), ok);
  assert.deepEqual(operationalState(primary(estimate("jar")), failed, invalid, "A"), {
    valid: true,
    success: false,
  });
  assert.deepEqual(
    operationalState(primary(estimate("jar")), observation("jar"), invalid, "A"),
    ok,
  );
  assert.deepEqual(operationalState(primary(estimate("jar")), observation("jar"), invalid, "B"), {
    valid: false,
    success: false,
  });
  assert.deepEqual(
    operationalState(
      primary({ status: "unknown", reason: "conflicting_kinds" }),
      invalid,
      invalid,
      "B",
    ),
    ok,
  );
});
test("metrics distinguish safe abstention from failure and retain every denominator", () => {
  const measured = measure(
    [
      row("unknown", estimate("jar"), uncertain),
      row("unknown", estimate("jar"), uncertain, uncertain, { A: { valid: true, success: false } }),
      row("cup", estimate("cup"), uncertain),
      row("jar", uncertain, estimate("cup")),
    ],
    "A",
  );
  assert.equal(measured.total, 4);
  assert.equal(measured.safeAbstention, 1);
  assert.equal(measured.removedBaselineWrong, 1);
  assert.equal(measured.operationalFailures, 1);
  assert.equal(measured.introducedOperationalFailures, 1);
  assert.equal(measured.lostBaselineCorrect, 1);
  assert.equal(measured.wrongKindAccepted, 1);
  assert.equal(measured.newlyWrong, 1);
});
test("primary observation and required object-model failures remain separate", () => {
  const result = modelStageCounts([
    {
      primary: primary(estimate("jar")),
      center: { valid: true, operationalSuccess: false },
      fit: null,
    },
    {
      primary: { valid: true, operationalSuccess: false },
      center: observation("jar"),
      fit: { valid: false, operationalSuccess: false },
    },
  ]);
  assert.deepEqual(result.primary, {
    executions: 2,
    observed: 1,
    definedFailures: 1,
    invalidOutputs: 0,
  });
  assert.deepEqual(result.center, {
    executions: 2,
    observed: 1,
    definedFailures: 1,
    invalidOutputs: 0,
  });
  assert.deepEqual(result.fit, {
    executions: 1,
    observed: 0,
    definedFailures: 0,
    invalidOutputs: 1,
  });
});
test("validation does not promote agreement or always-unknown when baseline made no errors", () => {
  assert.equal(
    selectValidation([row("jar", estimate("jar"), estimate("jar"))]).selectedAlgorithm,
    null,
  );
  assert.equal(selectValidation([row("jar", estimate("jar"), uncertain)]).selectedAlgorithm, null);
});
test("validation picks higher retained correct count, then cheaper A on a tie", () => {
  const fixedError = row("unknown", estimate("jar"), uncertain);
  assert.equal(
    selectValidation([...coverageRows(), fixedError, row("cup", estimate("cup"), estimate("cup"))])
      .selectedAlgorithm,
    "A",
  );
  assert.equal(
    selectValidation([
      ...coverageRows(),
      fixedError,
      row("cup", estimate("cup"), uncertain, estimate("cup")),
    ]).selectedAlgorithm,
    "B",
  );
});
test("always-unknown cannot qualify by removing one wrong and losing one correct baseline", () => {
  const rows = [row("unknown", estimate("jar"), uncertain), row("cup", estimate("cup"), uncertain)];
  assert.equal(selectValidation(rows).selectedAlgorithm, null);
  assert.equal(heldoutDecision(rows, "A").integrationEligible, false);
});
test("validation rejects new errors, excess coverage loss and operational/schema failure", () => {
  const fixed = row("unknown", estimate("jar"), uncertain);
  for (const extra of [
    [row("unknown", uncertain, estimate("cup"))],
    [row("cup", estimate("cup"), uncertain), row("jar", estimate("jar"), uncertain)],
    [
      row("cup", estimate("cup"), uncertain, uncertain, {
        A: { valid: true, success: false },
        B: { valid: true, success: false },
      }),
    ],
    [
      row("cup", estimate("cup"), uncertain, uncertain, {
        A: { valid: false, success: false },
        B: { valid: false, success: false },
      }),
    ],
  ])
    assert.equal(selectValidation([...coverageRows(), fixed, ...extra]).selectedAlgorithm, null);
});
test("heldout null selection cannot choose a candidate or gain integration eligibility", () => {
  const result = heldoutDecision([row("unknown", estimate("jar"), uncertain)], null);
  assert.equal(result.candidate, null);
  assert.equal(result.integrationEligible, false);
});
test("heldout uses only the locked candidate and rejects any wrong or introduced failure", () => {
  assert.equal(
    heldoutDecision([...coverageRows(), row("unknown", uncertain, uncertain, estimate("jar"))], "A")
      .integrationEligible,
    true,
  );
  assert.equal(
    heldoutDecision([...coverageRows(), row("unknown", uncertain, uncertain, estimate("jar"))], "B")
      .integrationEligible,
    false,
  );
  assert.equal(
    heldoutDecision(
      [row("cup", estimate("cup"), uncertain, uncertain, { A: { valid: true, success: false } })],
      "A",
    ).integrationEligible,
    false,
  );
  assert.throws(() => heldoutDecision([], "C"));
});

const rawObservation = (preprocessing = "center-square-256-srgb-v1") => ({
  schemaVersion: "mobileclip-s0-scores-v1",
  modelId: "apple-mobileclip-s0-coreml-2024",
  modelRevision: "55c8098c12ba8f928e37e26b2e1dd097777c3f98",
  imageWeightSha256: "87d8f63997bbd2f38ba7defeaaa2c571928bdece56aa9629542198b3ce906ed6",
  prototypesSha256: "0dfe73569d1b2177629d95c4bc21c1392be9228aff6809cab0ed1c3358893c81",
  promptPolicy: "packaging-visible-form-v1",
  promptsSha256: "aa726197e10fc1911b88bb6d6da099220339133c6e39e500f112b9077316e610",
  preprocessing,
  computeUnits: "cpuOnly",
  osVersion: "26.6.0",
  durationMs: 100,
  embeddingNorm: 1,
  scores: observation("jar").scores,
});
const validScores = (scores) =>
  Array.isArray(scores) &&
  scores.length === 18 &&
  new Set(scores.map((entry) => entry.group)).size === 18 &&
  scores.every(
    (entry) =>
      groups.includes(entry.group) &&
      Number.isFinite(entry.cosine) &&
      entry.cosine >= -1 &&
      entry.cosine <= 1,
  );
test("exact observed model metadata validates separately for center and fit", () => {
  for (const preprocessing of ["center-square-256-srgb-v1", "aspect-fit-256-srgb-gray127-v1"])
    assert.equal(
      decodeClip(
        { raw: rawObservation(preprocessing), exitCode: 0, failed: false },
        preprocessing,
        validScores,
      ).operationalSuccess,
      true,
    );
});
test("changed model metadata, extra keys, nonfinite/missing scores or process errors are invalid", () => {
  for (const mutate of [
    (raw) => {
      raw.extra = "forbidden";
    },
    (raw) => {
      raw.preprocessing = "different";
    },
    (raw) => {
      raw.prototypesSha256 = "0".repeat(64);
    },
    (raw) => {
      raw.embeddingNorm = Number.NaN;
    },
    (raw) => {
      raw.durationMs = 0.5;
    },
    (raw) => {
      raw.scores.pop();
    },
    (raw) => {
      raw.scores[0].cosine = Number.POSITIVE_INFINITY;
    },
  ]) {
    const raw = rawObservation();
    mutate(raw);
    assert.equal(
      decodeClip({ raw, exitCode: 0, failed: false }, "center-square-256-srgb-v1", validScores)
        .valid,
      false,
    );
  }
  for (const call of [
    { exitCode: 1, failed: false },
    { exitCode: 0, failed: true },
  ])
    assert.equal(
      decodeClip({ ...call, raw: rawObservation() }, "center-square-256-srgb-v1", validScores)
        .valid,
      false,
    );
});
test("known exact model-failure envelope stays failure, extra/unknown/crash envelope invalid", () => {
  const call = {
    raw: { status: "unavailable", reason: "processing_failed" },
    exitCode: 1,
    failed: false,
  };
  assert.deepEqual(decodeClip(call, "center-square-256-srgb-v1", validScores), {
    valid: true,
    operationalSuccess: false,
    scores: [],
    failureReason: "processing_failed",
  });
  for (const changed of [
    { ...call, raw: { ...call.raw, extra: true } },
    { ...call, raw: { ...call.raw, reason: "unknown" } },
    { ...call, exitCode: 0 },
    { ...call, failed: true },
    { ...call, signal: "SIGTERM" },
    { ...call, errorCode: "ETIMEDOUT" },
  ])
    assert.equal(decodeClip(changed, "center-square-256-srgb-v1", validScores).valid, false);
});
test("explicit run, split and pinned selection receipt arguments are mandatory", () => {
  const args = [
    "--run",
    ...["primary", "center", "fit", "compiled", "prototypes", "corpus", "output"].flatMap(
      (name) => [`--${name}`, `work/${name}`],
    ),
    "--manifest-sha",
    "a".repeat(64),
    "--phase",
    "validation",
  ];
  assert.equal(parseArguments(args).phase, "validation");
  for (const bad of [
    args.slice(1),
    [...args, "--selection", "work/summary.json"],
    [...args, "--run"],
    args.map((value) => (value === "work/fit" ? "https://example.invalid" : value)),
  ])
    assert.throws(() => parseArguments(bad));
  const held = args.map((value) => (value === "validation" ? "heldout" : value));
  assert.throws(() => parseArguments(held));
  assert.throws(() => parseArguments([...held, "--selection", "work/summary.json"]));
  assert.equal(
    parseArguments([...held, "--selection", "work/summary.json", "--selection-sha", "b".repeat(64)])
      .phase,
    "heldout",
  );
});
test("fit tool is isolated, bounded, CPU-only and emits observations without winner logic", () => {
  const source = readFileSync(
    new URL("../qa/local-vision/mobileclip-robustness-main.swift", import.meta.url),
    "utf8",
  );
  for (const text of [
    "aspect-fit-256-srgb-gray127-v1",
    "127.0 / 255",
    "CGColorSpace.sRGB",
    "fitGeometry(extent)",
    "composited(over: background)",
    "config.computeUnits = .cpuOnly",
    "2_000_000",
    "1_500_000",
    "16_000_000",
    "isAllowedValue(featureValue)",
    ".cacheIntermediates: false",
    "defer { context.clearCaches() }",
    'args[0] == "--preflight"',
  ])
    assert.ok(source.includes(text), text);
  assert.doesNotMatch(
    source,
    /URLSession|URLRequest|MLUpdateTask|FileHandle\.standardInput.*path|forWritingTo|\.write\(to:|winner\s*=|minimumCosine|minimumLead/,
  );
  const frozen = readFileSync(new URL("../qa/local-vision/mobileclip-main.swift", import.meta.url));
  assert.equal(
    createHash("sha256").update(frozen).digest("hex"),
    "34b86bded0603048ed558bd831c4aad4aa9e5d8d83d9f4d99b1a0f8a5265c6a3",
  );
});
