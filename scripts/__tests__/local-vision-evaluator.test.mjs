import assert from "node:assert/strict";
import test from "node:test";
import { parseArguments } from "../qa/local-vision/evaluate.mjs";

const base = [
  "--binary",
  "work/engine",
  "--fixture-dir",
  "work/fixtures",
  "--evidence-dir",
  "work/result",
];

test("local evaluation requires explicit execution opt-in and all local paths", () => {
  assert.throws(() => parseArguments(base), /explicit_local_run_required/u);
  assert.throws(() => parseArguments(["--run"]), /explicit_local_run_required/u);
  assert.deepEqual(parseArguments(["--run", ...base]), {
    binary: "work/engine",
    fixtureDir: "work/fixtures",
    evidenceDir: "work/result",
  });
});

test("local evaluation rejects URL/data/file inputs, duplicate flags and unknown options", () => {
  for (const value of [
    "https://example.invalid/a.jpg",
    "file:///private/a.jpg",
    "data:image/jpeg;base64,AAAA",
  ])
    assert.throws(
      () => parseArguments(["--run", ...base, "--synthetic-manifest", value]),
      /invalid_arguments/u,
    );
  assert.throws(() => parseArguments(["--run", ...base, "--run"]), /invalid_arguments/u);
  assert.throws(
    () => parseArguments(["--run", ...base, "--binary", "work/other"]),
    /invalid_arguments/u,
  );
  assert.throws(
    () => parseArguments(["--run", ...base, "--unknown", "value"]),
    /invalid_arguments/u,
  );
  assert.throws(
    () => parseArguments(["--run", ...base, "--synthetic-manifest"]),
    /invalid_arguments/u,
  );
});
