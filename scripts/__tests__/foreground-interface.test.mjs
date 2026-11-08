import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { probeCompleted } from "../qa/local-vision/foreground-interface-check.mjs";

const valid = () => ({
  failed: false,
  signal: null,
  exitCode: 0,
  raw: {
    schemaVersion: "foreground-interface-probe-v1",
    status: "completed",
    purpose: "owned_uniform_rgb512_interface_only_not_accuracy",
    maskRequestRevision: 1,
    maskComputeUnits: "vision_system_default",
    maskRequestsAttempted: 1,
    maskRequestsCompleted: 1,
    clipPredictions: 0,
    durationMs: 5,
    subjectCount: 0,
    outcome: "no_subjects",
    mask: null,
  },
});
test("a no-subject uniform-image observation validates only the interface, never accuracy", () => {
  assert.equal(probeCompleted(valid()), true);
  const subjects = valid();
  subjects.raw.subjectCount = 1;
  subjects.raw.outcome = "subjects_observed";
  subjects.raw.mask = {
    width: 4,
    height: 4,
    bytesPerRow: 4,
    pixelFormat: 1278226488,
    encoding: "uint8_instance_labels",
    subjectInstanceIndices: [1],
    observedMaskLabels: [1],
  };
  assert.equal(probeCompleted(subjects), true);
});
test("extra quality claims and contradictory mask labels cannot authorize images", () => {
  const extra = valid();
  extra.raw.accuracy = 1;
  assert.equal(probeCompleted(extra), false);
  const missing = valid();
  missing.raw.subjectCount = 1;
  missing.raw.outcome = "subjects_observed";
  assert.equal(probeCompleted(missing), false);
});
for (const [key, value] of [
  ["status", "unavailable"],
  ["clipPredictions", 1],
  ["maskRequestsAttempted", 2],
  ["maskRequestsCompleted", 0],
  ["durationMs", 12_000],
  ["maskRequestRevision", 2],
  ["subjectCount", 5],
  ["outcome", "accurate"],
])
  test(`rejects incompatible or excessive probe field ${key}`, () => {
    const c = valid();
    c.raw[key] = value;
    assert.equal(probeCompleted(c), false);
  });
test("crashed, timed-out or invalid process output cannot authorize pictures", () => {
  for (const change of [{ failed: true }, { signal: "SIGTERM" }, { exitCode: 1 }, { raw: null }])
    assert.equal(probeCompleted({ ...valid(), ...change }), false);
});
test("owned probe performs a single mask request and no photo read, encoder or network", () => {
  const s = readFileSync(
    new URL("../qa/local-vision/foreground-main.swift", import.meta.url),
    "utf8",
  );
  const body = s.slice(
    s.indexOf("private func interfaceProbe"),
    s.indexOf("private func selfTest"),
  );
  assert.match(body, /width: 512, height: 512/);
  assert.equal([...body.matchAll(/handler\.perform\(\[request\]\)/gu)].length, 1);
  assert.doesNotMatch(body, /readInput\(|loaded|\.prediction\(|URLSession|URLRequest/);
  assert.match(s, /generateMaskedImage\(ofInstances:/);
  assert.match(s, /observed == Set\(indices\)/);
  assert.match(s, /dataBytes <= 70_000_000/);
});
