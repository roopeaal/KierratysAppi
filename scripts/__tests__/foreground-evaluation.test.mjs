import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { decodeBoundedPrimary, parseArguments } from "../qa/local-vision/foreground-evaluate.mjs";

const dev = [
  "--run",
  "--phase",
  "development",
  "--foreground",
  "work/bin",
  "--compiled",
  "work/model",
  "--prototypes",
  "work/prototypes",
  "--output",
  "work/new",
];
test("development requires explicit run and cannot accept fresh-selection flags or labels", () => {
  assert.equal(parseArguments(dev).phase, "development");
  for (const args of [
    dev.slice(1),
    [...dev, "--selection", "work/choice"],
    [...dev, "--expected-kind", "bottle"],
    [...dev, "--output", "work/other"],
    dev.map((value) => (value === "work/bin" ? "https://example.com/bin" : value)),
  ])
    assert.throws(() => parseArguments(args));
});
test("confirmation requires every independently frozen data/selection/primary argument", () => {
  const args = dev.map((s) => (s === "development" ? "confirmatory" : s));
  for (const [key, value] of Object.entries({
    corpus: "work/newdata",
    "manifest-sha": "a".repeat(64),
    selection: "work/devsummary",
    "selection-sha": "b".repeat(64),
    primary: "work/primary",
    "primary-resources": "work/empty",
    center: "work/center",
  }))
    args.push(`--${key}`, value);
  assert.equal(parseArguments(args).phase, "confirmatory");
  assert.throws(() => parseArguments(args.slice(0, -2)));
});
test("typed bounded-primary timeout remains a valid operational failure, never a no-match", () => {
  const call = {
    failed: false,
    signal: null,
    errorCode: null,
    exitCode: 1,
    raw: { status: "unavailable", reason: "timeout" },
  };
  const result = decodeBoundedPrimary(call, () => ({ status: "unavailable" }));
  assert.equal(result.valid, true);
  assert.equal(result.operationalSuccess, false);
  assert.equal(result.primary.reason, "processing_failed");
  for (const patch of [
    { failed: true },
    { signal: "SIGTERM" },
    { raw: { ...call.raw, extra: true } },
    { raw: { ...call.raw, reason: "unexpected" } },
  ])
    assert.equal(
      decodeBoundedPrimary({ ...call, ...patch }, () => ({ status: "unavailable" })).valid,
      false,
    );
});
test("primary decoder accepts actual V4 system match, never a disguised CLIP guess", () => {
  const normalized = {
    status: "observed",
    source: {
      nativeSchemaVersion: "local-vision-v4",
      supplement: { status: "skipped", reason: "primary_match" },
    },
    object: { status: "estimated", kind: "bottle" },
  };
  const call = { failed: false, signal: null, errorCode: null, exitCode: 0, raw: {} };
  assert.equal(decodeBoundedPrimary(call, () => normalized).operationalSuccess, true);
  for (const value of [
    { ...normalized, source: { ...normalized.source, nativeSchemaVersion: "local-vision-v3" } },
    { ...normalized, source: { ...normalized.source, supplement: { status: "observed" } } },
    { ...normalized, source: { ...normalized.source, supplement: { status: "unavailable" } } },
    { ...normalized, object: { ...normalized.object, method: "mobileclip-s0" } },
  ])
    assert.equal(decodeBoundedPrimary(call, () => value).valid, false);
});
test("primary decoder retains legitimate primary-conflict and no-match branches", () => {
  const call = { failed: false, signal: null, errorCode: null, exitCode: 0, raw: {} };
  for (const [supplement, object] of [
    [
      { status: "skipped", reason: "primary_conflict" },
      { status: "unknown", reason: "conflicting_kinds" },
    ],
    [
      { status: "unavailable", reason: "model_unavailable" },
      { status: "unknown", reason: "no_operating_point_match" },
    ],
  ]) {
    const value = {
      status: "observed",
      source: { nativeSchemaVersion: "local-vision-v4", supplement },
      object,
    };
    const result = decodeBoundedPrimary(call, () => value);
    assert.equal(result.valid, true);
    assert.equal(result.operationalSuccess, true);
    assert.deepEqual(result.primary, object);
  }
});
test("harness only supplies image bytes and labels former held-out pictures explicitly seen", () => {
  const s = readFileSync(
    new URL("../qa/local-vision/foreground-evaluate.mjs", import.meta.url),
    "utf8",
  );
  assert.match(s, /old-heldout-now-seen/);
  assert.match(s, /failed-confirmation-now-seen/);
  assert.match(s, /input: bytes\.toString\("base64"\)/);
  assert.match(s, /sourceHashesUnchanged/);
  assert.match(s, /flag: "wx"/);
  assert.doesNotMatch(s, /fetch\(|URLSession|OPENAI|process\.env/);
});
