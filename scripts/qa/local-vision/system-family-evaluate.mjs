// Explicit local-only diagnostic. The expanded raw response is QA-only, not an app contract.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readCorpusJson, validateLocalCorpus } from "./independent-corpus.mjs";

const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const hashFile = (file) => digest(fs.readFileSync(file));
const developer = "/Applications/Xcode.app/Contents/Developer";
const sourcePath = "mobile/app/modules/local-vision/ios/local-vision-engine.swift";
const cliPath = "scripts/qa/local-vision/main.swift";
const protocolPath = "scripts/qa/local-vision/system-family-protocol.json";
const baseLabels = ["bottle", "wine_bottle", "jar", "carton", "cardboard_box", "paper_bag", "cup"];
const extraLabels = ["bag", "sack", "mug"];
const knownKinds = new Map([
  ["bottle", "bottle"],
  ["wine_bottle", "bottle"],
  ["jar", "jar"],
  ["carton", "box"],
  ["cardboard_box", "box"],
  ["paper_bag", "bag"],
  ["cup", "cup"],
  ["bag", "bag"],
  ["sack", "bag"],
  ["mug", "cup"],
]);

export function parseArguments(args) {
  const options = {};
  let run = false;
  for (let index = 0; index < args.length; index++) {
    if (args[index] === "--run") {
      assert.equal(run, false, "duplicate_run");
      run = true;
      continue;
    }
    const flag = args[index];
    assert.ok(["--fixture-dir", "--evidence-root"].includes(flag), "invalid_argument");
    assert.equal(options[flag], undefined, "duplicate_argument");
    const value = args[++index];
    assert.ok(value && !value.startsWith("--") && !/^[a-z]+:/iu.test(value), "invalid_path");
    options[flag] = value;
  }
  assert.ok(run && options["--fixture-dir"] && options["--evidence-root"], "explicit_run_required");
  return { fixtureDir: options["--fixture-dir"], evidenceRoot: options["--evidence-root"] };
}

export function derivedEngine(source, labels) {
  assert.match(
    source,
    /^ {2}let schemaVersion = "local-vision-v3"$/mu,
    "frozen_v3_source_required",
  );
  assert.ok(
    JSON.stringify(labels) === JSON.stringify(baseLabels) ||
      JSON.stringify(labels) === JSON.stringify([...baseLabels, ...extraLabels]),
    "unfrozen_labels",
  );
  const matches = [
    ...source.matchAll(/ {2}static let classificationIdentifiers = \[\n([\s\S]*?)\n {2}\]/gu),
  ];
  assert.equal(matches.length, 1, "engine_identifier_block_changed");
  const block = matches[0][0];
  const actual = [...block.matchAll(/"([a-z_]+)"/gu)].map((match) => match[1]);
  assert.deepEqual(actual, baseLabels, "production_identifiers_changed");
  if (labels.length === baseLabels.length) return source;
  const replacement = `  static let classificationIdentifiers = [\n    ${labels.map((label) => JSON.stringify(label)).join(", ")},\n  ]`;
  const variant = source.replace(block, replacement);
  assert.equal(variant.replace(replacement, block), source, "unexpected_source_delta");
  return variant;
}

export function coarseGrouping(classifications) {
  const matches = [];
  for (const item of classifications) {
    assert.ok(item && typeof item === "object" && !Array.isArray(item));
    assert.deepEqual(Object.keys(item).sort(), [
      "hasPrecisionRecallCurve",
      "identifier",
      "passesOperatingPoint",
      "score",
    ]);
    assert.ok(knownKinds.has(item.identifier), "unsupported_identifier");
    assert.ok(Number.isFinite(item.score) && item.score >= 0 && item.score <= 1, "invalid_score");
    assert.equal(typeof item.hasPrecisionRecallCurve, "boolean");
    assert.equal(typeof item.passesOperatingPoint, "boolean");
    assert.ok(item.hasPrecisionRecallCurve || !item.passesOperatingPoint, "invalid_pass_flag");
    if (item.hasPrecisionRecallCurve && item.passesOperatingPoint) matches.push(item.identifier);
  }
  assert.equal(
    new Set(classifications.map((item) => item.identifier)).size,
    classifications.length,
    "duplicate_identifier",
  );
  const kinds = new Set(matches.map((identifier) => knownKinds.get(identifier)));
  if (kinds.size === 0) return { status: "unknown", reason: "no_operating_point_match" };
  if (kinds.size > 1) return { status: "unknown", reason: "conflicting_kinds" };
  return { status: "estimated", kind: [...kinds][0], matches };
}

function workDirectory(cwd, input, empty = false) {
  const work = fs.realpathSync(path.join(cwd, "work"));
  const result = path.resolve(cwd, input);
  assert.ok(result.startsWith(`${work}${path.sep}`), "outside_work");
  const info = fs.lstatSync(result);
  assert.ok(info.isDirectory() && !info.isSymbolicLink(), "linked_directory");
  assert.equal(fs.realpathSync(result), result, "noncanonical_directory");
  if (empty) assert.equal(fs.readdirSync(result).length, 0, "evidence_not_empty");
  return result;
}

export async function evaluate(options, cwd = process.cwd()) {
  const fixtures = workDirectory(cwd, options.fixtureDir);
  const output = workDirectory(cwd, options.evidenceRoot, true);
  const manifestFile = path.join(cwd, "scripts/qa/local-vision/independent-manifest.json");
  const manifest = readCorpusJson(manifestFile).value;
  validateLocalCorpus(fixtures, manifest);
  assert.equal(manifest.fixtures.length, 9, "unfrozen_case_count");
  const protocol = readCorpusJson(path.join(cwd, protocolPath)).value;
  assert.equal(protocol.schemaVersion, "system-family-experiment-v1");
  assert.equal(protocol.minimumPrecision, 0.9);
  assert.equal(protocol.minimumRecall, 0.01);
  assert.equal(protocol.executionsPerImagePerArm, 1);
  assert.equal(protocol.retries, 0);
  assert.deepEqual(
    protocol.arms.map((arm) => arm.identifiers),
    [baseLabels, [...baseLabels, ...extraLabels]],
  );
  assert.deepEqual(Object.entries(protocol.kindMapping), [...knownKinds]);
  const source = fs.readFileSync(path.join(cwd, sourcePath), "utf8");
  // Reject schema evolution before writing a run marker or compiling/calling a model.
  derivedEngine(source, baseLabels);
  assert.match(source, /hasMinimumRecall\(0\.01, forPrecision: 0\.9\)/u);
  const requireFromMobile = createRequire(path.join(cwd, "mobile/app/package.json"));
  const normalizerPath = requireFromMobile.resolve("@kierratysappi/contracts/local-vision");
  const { NativeLocalVisionResultSchema, normalizeLocalVisionResult } = await import(
    pathToFileURL(normalizerPath).href
  );
  const tracked = {
    engine: path.join(cwd, sourcePath),
    cli: path.join(cwd, cliPath),
    protocol: path.join(cwd, protocolPath),
    manifest: manifestFile,
    normalizer: normalizerPath,
    evaluator: fileURLToPath(import.meta.url),
    ...Object.fromEntries(
      manifest.fixtures.map((record) => [
        `input-${record.id}`,
        path.join(fixtures, `${record.id}.jpg`),
      ]),
    ),
  };
  const hashes = Object.fromEntries(
    Object.entries(tracked).map(([key, file]) => [key, hashFile(file)]),
  );
  const write = (name, value) =>
    fs.writeFileSync(path.join(output, name), JSON.stringify(value, null, 2), { flag: "wx" });
  write("protocol-before-calls.json", {
    ...protocol,
    frozenAt: new Date().toISOString(),
    hashes,
    plannedCalls: 18,
    paidCalls: 0,
    newDownloads: 0,
  });
  const arms = [];
  for (const arm of protocol.arms) {
    assert.ok(arm.id === "baseline" || arm.id === "expanded");
    const directory = path.join(output, arm.id);
    fs.mkdirSync(directory);
    const engine = path.join(directory, "local-vision-engine.swift");
    fs.writeFileSync(engine, derivedEngine(source, arm.identifiers), { flag: "wx" });
    const binary = path.join(directory, "system-family");
    const compile = spawnSync(
      path.join(developer, "Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc"),
      [
        "-swift-version",
        "6",
        "-sdk",
        path.join(developer, "Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk"),
        "-module-cache-path",
        path.join(output, "module-cache"),
        engine,
        path.join(cwd, cliPath),
        "-o",
        binary,
      ],
      {
        encoding: "utf8",
        timeout: 180_000,
        maxBuffer: 2_000_000,
        env: { ...process.env, DEVELOPER_DIR: developer },
      },
    );
    fs.writeFileSync(
      path.join(directory, "compile.log"),
      `${compile.stdout ?? ""}${compile.stderr ?? ""}`,
      { flag: "wx" },
    );
    assert.equal(compile.status, 0, `compile_${arm.id}_failed_before_calls`);
    const selfTest = spawnSync(binary, ["--self-test"], {
      encoding: "utf8",
      timeout: 30_000,
      maxBuffer: 100_000,
    });
    write(`${arm.id}-self-test.json`, { exitCode: selfTest.status, stdout: selfTest.stdout });
    assert.equal(selfTest.status, 0, "self_test_failed");
    arms.push({
      ...arm,
      binary,
      engine,
      engineHash: hashFile(engine),
      binaryHash: hashFile(binary),
    });
  }
  write("started.json", {
    startedAt: new Date().toISOString(),
    hashes,
    arms: arms.map(({ binary, engine, ...arm }) => arm),
    plannedCalls: 18,
  });
  const results = [];
  for (const arm of arms) {
    for (const input of manifest.fixtures) {
      write(`attempt-${arm.id}-${input.id}.json`, {
        at: new Date().toISOString(),
        inputSha256: input.sha256,
      });
      const bytes = fs.readFileSync(path.join(fixtures, `${input.id}.jpg`));
      assert.equal(digest(bytes), input.sha256, "input_changed_before_call");
      const start = performance.now();
      const call = spawnSync(arm.binary, ["--base64-stdin"], {
        input: bytes.toString("base64"),
        encoding: "utf8",
        timeout: 30_000,
        maxBuffer: 100_000,
      });
      let raw;
      let coarse;
      let schemaAccepted = false;
      try {
        raw = JSON.parse(call.stdout);
        assert.ok(Array.isArray(raw.classifications));
        assert.deepEqual(
          raw.classifications.map((item) => item.identifier),
          arm.identifiers,
        );
        const projected = {
          ...raw,
          classifications: raw.classifications.filter((item) =>
            baseLabels.includes(item.identifier),
          ),
        };
        schemaAccepted = NativeLocalVisionResultSchema.safeParse(projected).success;
        assert.ok(schemaAccepted, "invalid_base_projection");
        coarse = coarseGrouping(raw.classifications);
        if (arm.id === "baseline") {
          const normalized = normalizeLocalVisionResult(raw);
          assert.equal(normalized.status, "observed");
          assert.deepEqual(
            coarse,
            normalized.object.status === "estimated"
              ? {
                  status: "estimated",
                  kind: normalized.object.kind,
                  matches: normalized.object.matches.map((item) => item.identifier),
                }
              : normalized.object,
          );
        }
      } catch {
        coarse = { status: "unavailable", reason: "invalid_qa_response" };
      }
      const result = {
        arm: arm.id,
        id: input.id,
        expectedKind: input.expectedKind,
        sourceSplit: input.split,
        dataStatus: protocol.dataStatus,
        inputSha256: input.sha256,
        exitCode: call.status,
        wallDurationMs: Math.round(performance.now() - start),
        qaBaseProjectionSchemaAccepted: schemaAccepted,
        coarse,
        raw: raw ?? null,
      };
      write(`result-${arm.id}-${input.id}.json`, result);
      results.push(result);
    }
  }
  const after = Object.fromEntries(
    Object.entries(tracked).map(([key, file]) => [key, hashFile(file)]),
  );
  const sourceHashesUnchanged = JSON.stringify(after) === JSON.stringify(hashes);
  const binaryHashesUnchanged = arms.every(
    (arm) => hashFile(arm.binary) === arm.binaryHash && hashFile(arm.engine) === arm.engineHash,
  );
  const summary = {
    completedAt: new Date().toISOString(),
    sourceHashesUnchanged,
    binaryHashesUnchanged,
    calls: results.length,
    retries: 0,
    paidCalls: 0,
    newDownloads: 0,
    hashes,
    armHashes: arms.map(({ binary, engine, ...arm }) => arm),
    results,
    limitations:
      "Seen development corpus; AI reference labels/human review pending; no product/material/safety/bin claims. Expanded response only validated as QA projection, never a production contract.",
  };
  write("summary.json", summary);
  assert.ok(sourceHashesUnchanged && binaryHashesUnchanged, "experiment_hash_drift");
  assert.equal(results.length, 18);
  return summary;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const result = await evaluate(parseArguments(process.argv.slice(2)));
    console.log(
      JSON.stringify(
        {
          calls: result.calls,
          sourceHashesUnchanged: result.sourceHashesUnchanged,
          binaryHashesUnchanged: result.binaryHashesUnchanged,
          results: result.results.map(({ raw, ...row }) => row),
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : "experiment_failed");
    process.exitCode = 1;
  }
}
