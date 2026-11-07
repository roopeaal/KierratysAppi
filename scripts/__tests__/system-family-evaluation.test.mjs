import assert from "node:assert/strict";
import test from "node:test";
import {
  coarseGrouping,
  derivedEngine,
  parseArguments,
} from "../qa/local-vision/system-family-evaluate.mjs";

const baseline = ["bottle", "wine_bottle", "jar", "carton", "cardboard_box", "paper_bag", "cup"];
const expanded = [...baseline, "bag", "sack", "mug"];
// Source-transformation fixture only, not a fake native model/accuracy result.
const source = `import Vision\nfinal class TestEngine {\n  let schemaVersion = "local-vision-v3"\n  static let classificationIdentifiers = [\n    "bottle", "wine_bottle", "jar", "carton", "cardboard_box", "paper_bag", "cup",\n  ]\n  // hasMinimumRecall(0.01, forPrecision: 0.9)\n}\n`;
const record = (identifier, pass = false) => ({
  identifier,
  score: pass ? 0.2 : 0.9,
  hasPrecisionRecallCurve: true,
  passesOperatingPoint: pass,
});

test("family diagnostic needs explicit local execution and rejects ambiguous arguments", () => {
  assert.throws(() => parseArguments([]), /explicit_run_required/u);
  assert.deepEqual(
    parseArguments(["--run", "--fixture-dir", "work/fixtures", "--evidence-root", "work/results"]),
    { fixtureDir: "work/fixtures", evidenceRoot: "work/results" },
  );
  for (const args of [
    ["--run", "--run"],
    ["--network", "https://example.invalid"],
    ["--run", "--fixture-dir", "https://example.invalid"],
    ["--run", "--fixture-dir", "work/a", "--fixture-dir", "work/b"],
  ])
    assert.throws(() => parseArguments(args));
});

test("baseline engine copy is exact and candidate changes only the frozen identifier list", () => {
  assert.equal(derivedEngine(source, baseline), source);
  const candidate = derivedEngine(source, expanded);
  assert.notEqual(candidate, source);
  assert.equal(candidate.replace(', "bag", "sack", "mug",', ","), source);
  assert.match(candidate, /hasMinimumRecall\(0\.01, forPrecision: 0\.9\)/u);
  assert.throws(() => derivedEngine(source, [...expanded, "container"]), /unfrozen_labels/u);
  assert.throws(() => derivedEngine(source.replace('"paper_bag"', '"shopping_bag"'), expanded));
});

test("family grouping never ranks independent confidence scores", () => {
  assert.deepEqual(coarseGrouping([record("bottle"), record("bag", true)]), {
    status: "estimated",
    kind: "bag",
    matches: ["bag"],
  });
});

test("the frozen family experiment refuses a newer native wire schema", () => {
  assert.throws(
    () => derivedEngine(source.replace("local-vision-v3", "local-vision-v4"), baseline),
    /frozen_v3_source_required/u,
  );
});

test("generic and specific accepted bags remain one visible family, not verified packaging", () => {
  const result = coarseGrouping([
    record("bag", true),
    record("paper_bag", true),
    record("sack", true),
  ]);
  assert.deepEqual(result, {
    status: "estimated",
    kind: "bag",
    matches: ["bag", "paper_bag", "sack"],
  });
  for (const key of ["material", "safety", "destination", "bin", "product"])
    assert.equal(key in result, false);
});

test("accepted mug and cup remain one family, while different kinds abstain", () => {
  assert.deepEqual(coarseGrouping([record("cup", true), record("mug", true)]), {
    status: "estimated",
    kind: "cup",
    matches: ["cup", "mug"],
  });
  assert.deepEqual(coarseGrouping([record("jar", true), record("mug", true)]), {
    status: "unknown",
    reason: "conflicting_kinds",
  });
});

test("unsupported, duplicate, invalid-score and impossible pass records fail validation", () => {
  assert.deepEqual(coarseGrouping([record("bag"), record("cup")]), {
    status: "unknown",
    reason: "no_operating_point_match",
  });
  for (const records of [
    [record("container", true)],
    [record("bag"), record("bag")],
    [{ ...record("mug"), score: Number.NaN }],
    [{ ...record("mug", true), hasPrecisionRecallCurve: false }],
    [{ ...record("mug"), material: "plastic" }],
  ])
    assert.throws(() => coarseGrouping(records));
});
