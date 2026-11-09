// Offline, captured-feature data preparation only. Never runs a model or fits a head.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { decodeBoundedPrimary } from "./foreground-evaluate.mjs";
import { decodeBaseline } from "./packaging-evaluate.mjs";
import { baselineDecision, decodeClip, operationalState } from "./robustness-evaluate.mjs";

const project = fileURLToPath(new URL("../../../", import.meta.url));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const hashPattern = /^[a-f0-9]{64}$/u;
const tokenPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,149}$/u;
const sourceIdPattern = /^[a-z][a-z0-9-]{1,63}$/u;
const kinds = ["bottle", "jar", "box", "bag", "cup"];
export const GROUPS = Object.freeze([
  ...kinds,
  "other-battery",
  "other-phone",
  "other-book",
  "other-food",
  "other-person",
  "other-animal",
  "other-leaf",
  "other-clothes",
  "other-electronics",
  "other-tools",
  "other-plate",
  "other-aerosol",
  "other-drink-can",
]);
export const LINEAR_DATA_PINS = Object.freeze({
  center: "4d9694bbade83b4117a109c9430235983dd0293ffc646b42e14904e05fd93c60",
  legacyPrimary: "622a898cf789889d7380d27b80e9fa8837b0b01c456cb2d04a3e524b7fab9e37",
  boundedPrimary: "1f5cf9e709e885c2512a0c70d4798f4a3f3dabc2d85340a37c7bc54d4b1a55b3",
  prototypes: "0dfe73569d1b2177629d95c4bc21c1392be9228aff6809cab0ed1c3358893c81",
  prompts: "aa726197e10fc1911b88bb6d6da099220339133c6e39e500f112b9077316e610",
  weights: "87d8f63997bbd2f38ba7defeaaa2c571928bdece56aa9629542198b3ce906ed6",
  graph: "858f2fc75c7d7b2fd182c1a13ae099a3f66c16ba1d0ea72375a0cdf6fe97b984",
  compiled: "8d6437b7a6add34c1a198e98b58c2059bc36573074cce49bfca82338a2f1d12b",
  gate: "6d75d21ff085ed5a18614e62696be11121f61678a546e2f5edf7b53658801649",
  normalizer: "439c2c76a6cabe5e47ca2d993d4bb31139b51f5ab6b286340c6e6bc3d87b40e6",
  centerSource: "34b86bded0603048ed558bd831c4aad4aa9e5d8d83d9f4d99b1a0f8a5265c6a3",
  tokenizerSource: "2266b984c85e4d71a5231bdcfa74b13007ef51f3fd03563d2646b2d184fb2f75",
  tsxPackage: "6e764b21991c21595441f82387c1451ccd10a3e7a3f0973cc5e3649a12dea7d2",
});
const corpora = [
  {
    name: "robustness",
    directory: "work/robustness-corpus-2026-11-07.93wuSo/final-reviewed",
    sha256: "b822665aa26031a9f64c16e99fc11b2e12e0c62614c7db7dbd21bb052850ec5f",
    validator: "./robustness-corpus.mjs",
    count: 32,
  },
  {
    name: "spatial",
    directory: "work/spatial-data-2026-11-07.P8gFzP/final-reviewed",
    sha256: "e6567b3d7ba522e59787fc9ff0419950c36755ee789a36b673728ab598401220",
    validator: "./spatial-data-corpus.mjs",
    count: 20,
  },
  {
    name: "foreground",
    directory: "work/foreground-data-2026-11-07.7bsky0/final-reviewed",
    sha256: "877442b5f0ca80023367475019d08213e1e55d4a23586aec1a92e950085487af",
    validator: "./foreground-data-corpus.mjs",
    count: 20,
  },
];
const receipts = [
  {
    name: "development",
    file: "work/foreground-candidate-2026-11-08.14KQvV/development/summary.json",
    sha256: "6f11f146f43d466cdcc89a5a04ddc3b02cc745512464cf92b6bf94e8d525b4e8",
    count: 52,
  },
  {
    name: "confirmatory",
    file: "work/foreground-candidate-2026-11-08.14KQvV/confirmatory/summary.json",
    sha256: "b2b9394a478104299611fcb7dd5b0183005787ff32913fcfd3c36cbd3cebd529",
    count: 20,
  },
];
const rawRoots = {
  validation: "work/local-reliability-2026-11-07.kbWGyb/validation",
  heldout: "work/local-reliability-2026-11-07.kbWGyb/heldout",
  spatial: "work/local-reliability-2026-11-07.kbWGyb/spatial-confirmatory",
  foreground: "work/foreground-candidate-2026-11-08.14KQvV/confirmatory",
};
const mixedOld = new Set(["control-mixed-takeaway", "control-mixed-beach"]);
const ambiguousOld = new Set(["control-food-bread", "control-food-pepper"]);
const outsideOld = new Set([
  "control-battery-single",
  "control-battery-ikea",
  "control-aerosol-french",
  "control-aerosol-contact",
  "control-usb-bad",
  "control-usb-huawei",
  "control-bowl-rice",
  "control-bowl-simple",
]);
export const SPLIT_TARGETS = Object.freeze({
  bottle: Object.freeze({ train: 5, validation: 3 }),
  jar: Object.freeze({ train: 5, validation: 3 }),
  box: Object.freeze({ train: 5, validation: 3 }),
  bag: Object.freeze({ train: 5, validation: 3 }),
  cup: Object.freeze({ train: 5, validation: 3 }),
  mixed_supported: Object.freeze({ train: 8, validation: 4 }),
  other_unknown: Object.freeze({ train: 12, validation: 8 }),
});

function regular(file, root) {
  const resolved = path.resolve(file),
    stat = fs.lstatSync(resolved);
  assert.ok(resolved.startsWith(`${root}${path.sep}`), "path_outside_root");
  assert.equal(fs.realpathSync(resolved), resolved, "linked_path");
  assert.ok(stat.isFile() && !stat.isSymbolicLink() && stat.nlink === 1, "not_regular_single_file");
  return resolved;
}
function boundedRead(file, maximum = 2_000_000) {
  const fd = fs.openSync(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0));
  try {
    const stat = fs.fstatSync(fd);
    assert.ok(
      stat.isFile() && stat.nlink === 1 && stat.size > 0 && stat.size <= maximum,
      "file_bound",
    );
    const result = Buffer.alloc(stat.size + 1);
    let count = 0;
    while (true) {
      const read = fs.readSync(fd, result, count, result.length - count, null);
      if (read === 0) break;
      count += read;
      assert.ok(count <= stat.size, "file_grew");
    }
    assert.equal(count, stat.size, "file_changed");
    return result.subarray(0, count);
  } finally {
    fs.closeSync(fd);
  }
}
const readJson = (file) => JSON.parse(boundedRead(file));
function fileHash(file, maximum = 50_000_000) {
  return hash(boundedRead(file, maximum));
}
function compiledTreeHash(directory) {
  const files = [];
  let bytes = 0;
  function visit(root) {
    for (const name of fs.readdirSync(root).sort()) {
      const file = path.join(root, name),
        stat = fs.lstatSync(file);
      assert.ok(!stat.isSymbolicLink(), "linked_model");
      if (stat.isDirectory()) visit(file);
      else {
        bytes += stat.size;
        assert.ok(bytes <= 40_000_000 && files.length < 200, "model_bound");
        files.push([path.relative(directory, file), fileHash(regular(file, directory))]);
      }
    }
  }
  visit(directory);
  return hash(JSON.stringify(files));
}
const plain = (value) => value && typeof value === "object" && !Array.isArray(value);
export function validateCanonicalScores(scores) {
  return (
    Array.isArray(scores) &&
    scores.length === GROUPS.length &&
    scores.every(
      (s, i) =>
        plain(s) &&
        Object.keys(s).sort().join(",") === "cosine,group" &&
        s.group === GROUPS[i] &&
        Number.isFinite(s.cosine) &&
        s.cosine >= -1 &&
        s.cosine <= 1,
    )
  );
}
export function validateCapturedCenter(call, normalized, attempt, imageSha256) {
  assert.match(imageSha256, hashPattern);
  assert.ok(plain(attempt));
  assert.equal(attempt.imageSha256, imageSha256, "center_input_drift");
  assert.equal(attempt.binarySha256, LINEAR_DATA_PINS.center, "center_binary_drift");
  const result = decodeClip(call, "center-square-256-srgb-v1", validateCanonicalScores);
  assert.equal(result.valid, true, "invalid_center");
  assert.equal(result.operationalSuccess, true, "failed_center");
  assert.deepEqual(result, normalized, "captured_center_drift");
  assert.equal(call.raw.osVersion, "26.7.0", "center_platform_drift");
  return result;
}
export function classifyLinearReference(fixture, corpus) {
  assert.ok(plain(fixture));
  assert.ok([...kinds, "unknown"].includes(fixture.expectedKind), "unknown_label");
  if (fixture.expectedKind !== "unknown") {
    if (corpus !== "robustness") assert.equal(fixture.challenge, "form", "positive_challenge");
    return { stratum: fixture.expectedKind, subtype: "form" };
  }
  if (corpus === "robustness") {
    if (mixedOld.has(fixture.id)) return { stratum: "mixed_supported", subtype: "mixed_supported" };
    if (ambiguousOld.has(fixture.id))
      return { stratum: "other_unknown", subtype: "other_ambiguous" };
    assert.ok(outsideOld.has(fixture.id), "unregistered_legacy_unknown");
    return { stratum: "other_unknown", subtype: "outside" };
  }
  assert.ok(["spatial", "foreground"].includes(corpus), "unknown_corpus");
  assert.ok(["mixed", "outside"].includes(fixture.challenge), "unknown_challenge");
  return fixture.challenge === "mixed"
    ? { stratum: "mixed_supported", subtype: "mixed_supported" }
    : { stratum: "other_unknown", subtype: "outside" };
}
export function validateLinearRows(rows) {
  assert.ok(Array.isArray(rows) && rows.length > 0 && rows.length <= 100, "row_count");
  const ids = new Set(),
    sourceIds = new Set();
  for (const r of rows) {
    assert.ok(plain(r));
    assert.match(r.id, hashPattern);
    assert.ok(!ids.has(r.id), "duplicate_image");
    ids.add(r.id);
    assert.ok([...kinds, "unknown"].includes(r.label), "unknown_label");
    assert.ok(
      Array.isArray(r.features) &&
        r.features.length === GROUPS.length &&
        r.features.every((v) => Number.isFinite(v) && v >= -1 && v <= 1),
      "invalid_features",
    );
    assert.ok(validateCanonicalScores(r.scores), "invalid_scores");
    assert.deepEqual(
      r.features,
      r.scores.map((s) => s.cosine),
      "feature_order_drift",
    );
    assert.ok(
      plain(r.operational) &&
        typeof r.operational.valid === "boolean" &&
        typeof r.operational.success === "boolean" &&
        (!r.operational.success || r.operational.valid),
      "invalid_operational",
    );
    assert.ok(
      plain(r.baseline) && ["estimated", "unknown"].includes(r.baseline.status),
      "invalid_baseline",
    );
    if (r.baseline.status === "estimated")
      assert.ok(kinds.includes(r.baseline.kind) && r.operational.success, "invalid_estimate");
    const p = r.sourceProof;
    assert.ok(plain(p));
    assert.match(p.sourceId, sourceIdPattern);
    assert.ok(!sourceIds.has(p.sourceId), "duplicate_source_id");
    sourceIds.add(p.sourceId);
    assert.match(p.group, tokenPattern);
    assert.match(p.sourceFamily, tokenPattern);
    assert.ok(Object.hasOwn(SPLIT_TARGETS, p.stratum), "unknown_stratum");
    assert.ok(
      r.label === "unknown"
        ? ["mixed_supported", "other_unknown"].includes(p.stratum)
        : p.stratum === r.label,
      "label_stratum_mismatch",
    );
    assert.ok(
      p.stratum === "other_unknown"
        ? ["outside", "other_ambiguous"].includes(p.subtype)
        : p.stratum === "mixed_supported"
          ? p.subtype === "mixed_supported"
          : p.subtype === "form",
      "invalid_subtype",
    );
  }
  return rows;
}

/** Metadata-only split: labels/identity/families, never feature values or outcomes. */
export function splitLinearDataset(rows) {
  validateLinearRows(rows);
  assert.equal(rows.length, 72, "registered_72_required");
  const sorted = [...rows].sort((a, b) => a.id.localeCompare(b.id));
  const parents = sorted.map((_, i) => i),
    tokens = new Map();
  const find = (i) => {
    while (parents[i] !== i) {
      parents[i] = parents[parents[i]];
      i = parents[i];
    }
    return i;
  };
  const join = (a, b) => {
    const x = find(a),
      y = find(b);
    if (x !== y) parents[Math.max(x, y)] = Math.min(x, y);
  };
  for (const [i, r] of sorted.entries())
    for (const token of [r.sourceProof.group, r.sourceProof.sourceFamily]) {
      const key = token.toLowerCase();
      if (tokens.has(key)) join(i, tokens.get(key));
      else tokens.set(key, i);
    }
  const grouped = new Map();
  for (const [i, r] of sorted.entries()) {
    const k = find(i);
    grouped.set(k, [...(grouped.get(k) ?? []), r]);
  }
  const components = [...grouped.values()].map((members) => {
    const label = members[0].label,
      stratum = members[0].sourceProof.stratum;
    assert.ok(
      members.every((r) => r.label === label && r.sourceProof.stratum === stratum),
      "heterogeneous_component",
    );
    const ids = members.map((r) => r.id).sort();
    return { rank: hash(`kig-linear-split-v1\n${ids.join("\n")}`), stratum, ids };
  });
  assert.equal(
    new Set(components.map((c) => c.rank)).size,
    components.length,
    "component_rank_collision",
  );
  const trainIds = new Set(),
    allocations = [];
  for (const [stratum, target] of Object.entries(SPLIT_TARGETS)) {
    const available = components
      .filter((c) => c.stratum === stratum)
      .sort((a, b) => a.rank.localeCompare(b.rank));
    assert.equal(
      available.reduce((n, c) => n + c.ids.length, 0),
      target.train + target.validation,
      "stratum_count",
    );
    const memo = new Map();
    function reachable(i, remaining) {
      if (remaining === 0) return true;
      if (i === available.length || remaining < 0) return false;
      const key = `${i}:${remaining}`;
      if (!memo.has(key))
        memo.set(
          key,
          reachable(i + 1, remaining - available[i].ids.length) || reachable(i + 1, remaining),
        );
      return memo.get(key);
    }
    assert.ok(reachable(0, target.train), "unreachable_group_count");
    let remaining = target.train;
    for (const [i, c] of available.entries()) {
      const selected =
        remaining > 0 && c.ids.length <= remaining && reachable(i + 1, remaining - c.ids.length);
      if (selected) {
        remaining -= c.ids.length;
        for (const id of c.ids) trainIds.add(id);
      }
      allocations.push({ ...c, split: selected ? "train" : "validation" });
    }
    assert.equal(remaining, 0);
  }
  const train = sorted.filter((r) => trainIds.has(r.id)),
    validation = sorted.filter((r) => !trainIds.has(r.id));
  assert.equal(train.length, 45);
  assert.equal(validation.length, 27);
  return {
    train,
    validation,
    allocation: {
      policy: "kig-linear-split-v1",
      counts: SPLIT_TARGETS,
      components: allocations.sort((a, b) => a.rank.localeCompare(b.rank)),
      totalComponents: components.length,
    },
  };
}

/** Hash-bound real captures only; no fitting, new embedding, image/model or network call. */
export async function loadLinearDataset(cwd = project) {
  const root = fs.realpathSync(cwd),
    work = fs.realpathSync(path.join(root, "work"));
  assert.equal(path.resolve(cwd), root, "linked_project");
  assert.equal(work, path.join(root, "work"), "linked_work");
  const file = (p, base = root) => regular(path.resolve(root, p), base);
  const sourcePaths = {
    center: "work/mobileclip-candidate-2026-11-06.M305AS/mobileclip-qa",
    legacyPrimary: "work/local-ocr-ablation-2026-11-06.mf32q8/production-v3",
    boundedPrimary: "work/recognition-timeout-2026-11-08.dSyBP8/local-vision-qa",
    prototypes: "work/mobileclip-candidate-2026-11-06.M305AS/prototypes.json",
    prompts: "scripts/qa/local-vision/mobileclip-prompts.json",
    centerSource: "scripts/qa/local-vision/mobileclip-main.swift",
    tokenizerSource: "scripts/qa/local-vision/mobileclip-tokenizer.swift",
    tsxPackage: "node_modules/.pnpm/tsx@4.21.0/node_modules/tsx/package.json",
  };
  const compiled = path.resolve(
    root,
    "work/mobileclip-candidate-2026-11-06.M305AS/compiled/mobileclip_s0_image.mlmodelc",
  );
  assert.equal(fs.realpathSync(compiled), compiled);
  sourcePaths.graph = path.relative(root, path.join(compiled, "model.mil"));
  sourcePaths.weights = path.relative(root, path.join(compiled, "weights/weight.bin"));
  const requireMobile = createRequire(path.join(root, "mobile/app/package.json"));
  sourcePaths.gate = path.relative(
    root,
    requireMobile.resolve("@kierratysappi/contracts/packaging-classifier"),
  );
  sourcePaths.normalizer = path.relative(
    root,
    requireMobile.resolve("@kierratysappi/contracts/local-vision"),
  );
  const sourceHashes = {};
  for (const [name, p] of Object.entries(sourcePaths)) {
    sourceHashes[name] = fileHash(file(p, p.startsWith("work/") ? work : root));
    assert.equal(sourceHashes[name], LINEAR_DATA_PINS[name], `source_drift:${name}`);
  }
  sourceHashes.compiled = compiledTreeHash(compiled);
  assert.equal(sourceHashes.compiled, LINEAR_DATA_PINS.compiled, "compiled_drift");
  sourcePaths.compiled = path.relative(root, compiled);
  const tsxFile = file(sourcePaths.tsxPackage);
  const tsx = JSON.parse(boundedRead(tsxFile));
  assert.equal(tsx.version, "4.21.0");
  const { tsImport } = await import(
    pathToFileURL(
      path.join(root, "node_modules/.pnpm/tsx@4.21.0/node_modules/tsx/dist/esm/api/index.mjs"),
    )
  );
  const { PackagingScoresSchema, decidePackagingScores } = await tsImport(
    pathToFileURL(file(sourcePaths.gate)).href,
    import.meta.url,
  );
  const { normalizeLocalVisionResult } = await tsImport(
    pathToFileURL(file(sourcePaths.normalizer)).href,
    import.meta.url,
  );
  const byHash = new Map(),
    manifestProof = [];
  for (const spec of corpora) {
    const p = file(`${spec.directory}/fixtures.json`, work);
    assert.equal(fileHash(p), spec.sha256, "manifest_drift");
    const manifest = readJson(p),
      validator = await import(new URL(spec.validator, import.meta.url));
    validator.validateLocal(manifest, path.resolve(root, spec.directory));
    assert.equal(manifest.fixtures.length, spec.count);
    assert.equal(manifest.labelReviewStatus, "ai_reviewed_human_review_required");
    manifestProof.push({
      corpus: spec.name,
      path: path.relative(root, p),
      sha256: spec.sha256,
      count: spec.count,
    });
    for (const fixture of manifest.fixtures) {
      assert.match(fixture.id, sourceIdPattern);
      assert.match(fixture.sha256, hashPattern);
      assert.ok(!byHash.has(fixture.sha256), "duplicate_source_image");
      const image = file(`${spec.directory}/${fixture.id}.jpg`, work);
      assert.equal(fileHash(image, 1_500_000), fixture.sha256, "image_drift");
      byHash.set(fixture.sha256, { ...fixture, corpus: spec.name, manifestSha256: spec.sha256 });
    }
  }
  assert.equal(byHash.size, 72);
  const rows = [],
    receiptProof = [];
  let common;
  for (const spec of receipts) {
    const p = file(spec.file, work);
    assert.equal(fileHash(p), spec.sha256, "receipt_drift");
    const receipt = readJson(p);
    assert.equal(receipt.phase, spec.name);
    assert.equal(receipt.sourceHashesUnchanged, true);
    assert.equal(receipt.cases.length, spec.count);
    if (common) assert.deepEqual(receipt.hashes, common, "capture_source_parity");
    else common = receipt.hashes;
    receiptProof.push({ path: spec.file, sha256: spec.sha256, count: spec.count });
    for (const captured of receipt.cases) {
      const reference = byHash.get(captured.imageSha256);
      assert.ok(reference, "unmapped_capture");
      assert.equal(reference.expectedKind, captured.expectedKind, "reference_drift");
      const phase = reference.corpus === "robustness" ? reference.split : reference.corpus;
      const prefix =
        reference.corpus === "robustness"
          ? reference.split === "validation"
            ? "validation-"
            : "old-heldout-now-seen-"
          : reference.corpus === "spatial"
            ? "failed-confirmation-now-seen-"
            : "";
      assert.equal(captured.id, `${prefix}${reference.id}`, "receipt_id_drift");
      assert.equal(spec.name, reference.corpus === "foreground" ? "confirmatory" : "development");
      const rawRoot = rawRoots[phase];
      assert.ok(rawRoot, "unknown_capture_phase");
      const rawCenterPath = `${rawRoot}/raw-${reference.id}-center.json`,
        attemptPath = `${rawRoot}/attempt-${reference.id}-center.json`;
      const rawCenterFile = file(rawCenterPath, work),
        attemptFile = file(attemptPath, work);
      const center = validateCapturedCenter(
        readJson(rawCenterFile),
        captured.center,
        readJson(attemptFile),
        reference.sha256,
      );
      assert.equal(
        PackagingScoresSchema.safeParse(center.scores).success,
        true,
        "public_score_contract",
      );
      const rawPrimaryPath = `${rawRoot}/raw-${reference.id}-primary.json`,
        primaryAttemptPath = `${rawRoot}/attempt-${reference.id}-primary.json`;
      const rawPrimaryFile = file(rawPrimaryPath, work),
        primaryAttemptFile = file(primaryAttemptPath, work);
      const primaryAttempt = readJson(primaryAttemptFile),
        rawPrimary = readJson(rawPrimaryFile);
      assert.equal(primaryAttempt.imageSha256, reference.sha256, "primary_input_drift");
      assert.equal(
        primaryAttempt.binarySha256,
        reference.corpus === "foreground"
          ? LINEAR_DATA_PINS.boundedPrimary
          : LINEAR_DATA_PINS.legacyPrimary,
        "primary_binary_drift",
      );
      const primary =
        reference.corpus === "foreground"
          ? decodeBoundedPrimary(rawPrimary, normalizeLocalVisionResult)
          : decodeBaseline(rawPrimary, normalizeLocalVisionResult);
      assert.deepEqual(primary, captured.primary, "captured_primary_drift");
      const baseline = baselineDecision(primary.primary, center, decidePackagingScores),
        operational = operationalState(primary, center, null, "baseline");
      assert.deepEqual(baseline, captured.decisions.baseline, "baseline_drift");
      assert.deepEqual(operational, captured.operational.baseline, "operational_drift");
      const scores = GROUPS.map((group) => center.scores.find((s) => s.group === group));
      rows.push({
        id: reference.sha256,
        label: reference.expectedKind,
        features: scores.map((s) => s.cosine),
        scores,
        baseline,
        operational,
        sourceProof: {
          sourceId: reference.id,
          group: reference.group,
          sourceFamily: reference.sourceFamily ?? reference.group,
          ...classifyLinearReference(reference, reference.corpus),
          corpus: reference.corpus,
          challenge: reference.challenge ?? null,
          contextChallenge: reference.contextChallenge ?? null,
          manifestSha256: reference.manifestSha256,
          receiptSha256: spec.sha256,
          receiptId: captured.id,
          rawCenterPath,
          rawCenterSha256: fileHash(rawCenterFile),
          attemptPath,
          attemptSha256: fileHash(attemptFile),
          rawPrimaryPath,
          rawPrimarySha256: fileHash(rawPrimaryFile),
          primaryAttemptPath,
          primaryAttemptSha256: fileHash(primaryAttemptFile),
          license: reference.license,
          licenseUrl: reference.licenseUrl,
          sourceUrl: reference.pageUrl,
          labelReviewStatus: "ai_reviewed_human_review_required",
        },
      });
    }
  }
  for (const key of ["prototypes", "prompts", "gate", "normalizer", "compiled"])
    assert.equal(common[key], sourceHashes[key], "capture_current_source_parity");
  rows.sort((a, b) => a.id.localeCompare(b.id));
  validateLinearRows(rows);
  assert.equal(rows.length, 72);
  assert.equal(rows.filter((r) => !r.operational.success).length, 2, "original_failure_count");
  return {
    rows,
    proof: {
      schemaVersion: "linear-data-proof-v1",
      featurePolicy: "captured-center18-v1",
      count: 72,
      labelReviewStatus: "ai_reviewed_human_review_required",
      allReferencesPreviouslySeen: true,
      sourcePaths,
      sourceHashes,
      manifests: manifestProof,
      receipts: receiptProof,
      centerVectorsValidated: 72,
      primaryFailuresRetained: 2,
      rawPrimaryCapturesValidated: 72,
      networkCalls: 0,
      modelCalls: 0,
    },
  };
}
