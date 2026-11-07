import assert from "node:assert/strict";
import test from "node:test";
import {
  cascade,
  decodeBaseline,
  metrics,
  parseArguments,
  selectValidationPolicy,
} from "../qa/local-vision/packaging-evaluate.mjs";

const unavailable = () => ({ status: "unavailable", reason: "invalid_response" });
const failed = (reason = "failed", extra = {}) => ({
  raw: { status: "unavailable", reason, ...extra },
  exitCode: 1,
  failed: false,
  wallMs: 15491,
});
const unknown = { status: "unknown", reason: "no_operating_point_match" };
const estimate = (kind) => ({ status: "estimated", kind });

for (const reason of ["failed", "busy", "invalid_image", "unavailable"]) {
  test(`defined native CLI ${reason} is a well-formed failure, never observed/no-match`, () => {
    const result = decodeBaseline(failed(reason), unavailable);
    assert.equal(result.valid, true);
    assert.equal(result.operationalSuccess, false);
    assert.equal(result.failureReason, reason);
    assert.equal(result.primary.status, "unknown");
    assert.notEqual(result.primary.reason, "no_operating_point_match");
    assert.equal(cascade(result.primary, estimate("bottle")).status, "unknown");
  });
}
for (const [name, call] of [
  ["unknown code", failed("new_error")],
  ["extra data", failed("failed", { image: "private" })],
  ["wrong exit", { ...failed(), exitCode: 0 }],
  ["process error", { ...failed(), failed: true }],
  ["signal", { ...failed(), exitCode: null }],
  [
    "malformed JSON sentinel",
    { ...failed(), raw: { status: "unavailable", reason: "invalid_cli_output" } },
  ],
])
  test(`malformed ${name} remains invalid`, () =>
    assert.equal(decodeBaseline(call, unavailable).valid, false));

test("only successful exit0 observations are operational successes", () => {
  const result = decodeBaseline({ raw: {}, exitCode: 0, failed: false }, () => ({
    status: "observed",
    object: estimate("bottle"),
  }));
  assert.equal(result.operationalSuccess, true);
  assert.deepEqual(result.primary, estimate("bottle"));
});
test("cascade retains accepted system estimates and never overrides conflicting primary evidence", () => {
  assert.deepEqual(cascade(estimate("bottle"), estimate("jar")), {
    ...estimate("bottle"),
    method: "system",
  });
  assert.equal(
    cascade({ status: "unknown", reason: "conflicting_kinds" }, estimate("jar")).status,
    "unknown",
  );
  assert.deepEqual(cascade(unknown, estimate("jar")), estimate("jar"));
});
test("validation selects the most conservative eligible policy only", () => {
  const cases = ["jar", "cup", "box"].map((kind) => ({
    valid: true,
    expectedKind: kind,
    primary: unknown,
    scores: kind,
  }));
  const selected = selectValidationPolicy(cases, (kind) => estimate(kind));
  assert.equal(selected.selectedPolicy, "strict");
});
test("a retained processing failure cannot contribute a gain or promote the medium gate", () => {
  const cases = [
    {
      valid: true,
      expectedKind: "bottle",
      primary: { status: "unknown", reason: "processing_failed" },
      scores: "bottle",
    },
    ...["jar", "cup"].map((kind) => ({
      valid: true,
      expectedKind: kind,
      primary: unknown,
      scores: kind,
    })),
  ];
  const selected = selectValidationPolicy(cases, (kind, policy) =>
    policy === "loose" || kind === "bottle" ? estimate(kind) : { status: "unknown" },
  );
  assert.equal(selected.selectedPolicy, "loose");
  assert.equal(selected.results.find((r) => r.policy === "medium").additionalCorrect, 0);
  assert.equal(selected.results.find((r) => r.policy === "loose").additionalCorrect, 2);
});
test("new wrong acceptance and invalid transport prevent eligibility", () => {
  const cases = ["jar", "cup", "unknown"].map((kind) => ({
    valid: true,
    expectedKind: kind,
    primary: unknown,
    scores: kind,
  }));
  assert.equal(selectValidationPolicy(cases, () => estimate("jar")).selectedPolicy, null);
  const invalid = cases.slice(0, 2).map((row) => ({ ...row, valid: false }));
  assert.equal(selectValidationPolicy(invalid, (kind) => estimate(kind)).selectedPolicy, null);
});
test("metrics retain the failed-case denominator without pretending it was recognized", () => {
  const result = metrics([
    { expectedKind: "bottle", primary: { status: "unknown" }, decision: { status: "unknown" } },
  ]);
  assert.deepEqual(result, {
    baselineCorrect: 0,
    candidateCorrect: 0,
    additionalCorrect: 0,
    newErrors: 0,
    lostCorrect: 0,
  });
});
test("evaluation is explicit and phase/selection/accounting arguments cannot cross", () => {
  assert.throws(() => parseArguments([]));
  const args = [
    "--run",
    "--baseline",
    "work/base",
    "--clip",
    "work/clip",
    "--compiled",
    "work/model",
    "--prototypes",
    "work/proto.json",
    "--corpus",
    "work/data",
    "--manifest-sha",
    "a".repeat(64),
    "--phase",
    "validation",
    "--output",
    "work/out",
  ];
  assert.equal(parseArguments(args).phase, "validation");
  assert.throws(() => parseArguments([...args, "--selection", "work/selection.json"]));
  assert.throws(() => parseArguments([...args, "--run"]));
  assert.throws(() =>
    parseArguments(args.map((v) => (v === "work/base" ? "https://example.invalid" : v))),
  );
});
