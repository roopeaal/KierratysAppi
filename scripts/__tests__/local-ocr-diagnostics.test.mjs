import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const protocol = JSON.parse(read("scripts/qa/local-vision/ocr-diagnostic-cases.json"));

test("owned OCR reproduction cases are bounded, unique and explicitly not held-out camera evidence", () => {
  assert.equal(protocol.heldOut, false);
  assert.match(protocol.purpose, /already-seen owned synthetic/);
  assert.match(protocol.purpose, /not held-out/);
  assert.equal(protocol.cases.length, 39);
  assert.equal(new Set(protocol.cases.map((item) => item.id)).size, 39);
  assert.deepEqual(protocol.knownDevelopmentInputs, []);
  for (const item of protocol.cases) {
    assert.match(item.id, /^[a-z][a-z0-9-]{1,40}$/u);
    assert.ok(item.lines.length >= 1 && item.lines.length <= 2);
    assert.ok(item.lines.every((line) => line.length > 0 && line.length <= 64));
    assert.ok(["none", "candidates", "ambiguous"].includes(item.expectedStatus));
    if (item.expectedStatus === "candidates") assert.ok(item.expectedCode);
  }
  assert.equal(protocol.retries, 0);
  assert.equal(protocol.paidCalls, 0);
  assert.equal(protocol.noSortingWithoutConfirmation, true);
});

test("OCR comparison retains the baseline and no-correction arm beside the finite explicit lexicon", () => {
  assert.deepEqual(
    protocol.arms.map((arm) => arm.id),
    ["a-current", "b-latin", "c-lexicon"],
  );
  assert.equal(protocol.arms[0].languageCorrection, false);
  assert.equal(protocol.arms[1].languageCorrection, false);
  assert.deepEqual(protocol.arms[2].languages, ["en-US"]);
  assert.equal(protocol.arms[2].languageCorrection, true);
  assert.deepEqual(protocol.arms[2].customWords, [
    "PET",
    "HDPE",
    "PVC",
    "LDPE",
    "PP",
    "PS",
    "PAP",
    "FE",
    "ALU",
    "FOR",
    "COT",
    "TEX",
    "GL",
  ]);
  assert.equal(protocol.constantSettings.topCandidates, 1);
  assert.equal(protocol.executionsPerImagePerArm, 1);
  for (const id of [
    "near-rr",
    "near-pft",
    "gtin",
    "zero-number",
    "conflicting-codes",
    "mixed-mismatch",
  ])
    assert.ok(
      protocol.cases.some((item) => item.id === id && item.expectedStatus !== "candidates"),
    );
});

test("the OCR diagnostic driver limits work-tree writes and local pixel inputs, without networking or expected-answer injection", () => {
  const source = read("scripts/qa/local-vision/ocr-diagnostics.swift");
  assert.match(source, /args\.count == 2/);
  assert.match(source, /root\.path\.hasPrefix\(workRoot\.path \+ "\/"\)/);
  assert.match(source, /protocol_too_large/);
  assert.match(source, /allFixtures\.count <= 64/);
  assert.match(source, /fixture_exists/);
  assert.match(source, /FileAttributeType == \.typeRegular/);
  assert.match(source, /1_500_000/);
  assert.match(source, /args\[0\] == "generate"/);
  assert.match(source, /args\[0\] == "run"/);
  assert.doesNotMatch(
    source,
    /URLSession|URLRequest|\.expectedCode|\.expectedStatus|OPENAI|http:\/\/|https:\/\//,
  );
});
