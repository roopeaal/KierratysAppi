// Source guards and no-image contracts, not pixel/score or phone-quality evidence.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (file) => readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");
const candidate = source("scripts/qa/local-vision/embedding-main.swift");
const original = source("scripts/qa/local-vision/mobileclip-main.swift");
const fit = source("scripts/qa/local-vision/mobileclip-robustness-main.swift");
const digest = (text) => createHash("sha256").update(text).digest("hex");
function range(text, start, end) {
  const first = text.indexOf(start);
  assert.ok(first >= 0, `Missing start: ${start}`);
  const last = text.indexOf(end, first);
  assert.ok(last >= first, `Missing end: ${end}`);
  return text.slice(first, last + end.length);
}
const mapped = (text) =>
  text.replaceAll("MobileClipFailure", "ExportFailure").replaceAll("FitFailure", "ExportFailure");
const compact = (text) => mapped(text).replace(/\s+/gu, " ");

test("center and fit legacy source references retain their frozen hashes", () => {
  assert.equal(
    digest(original),
    "34b86bded0603048ed558bd831c4aad4aa9e5d8d83d9f4d99b1a0f8a5265c6a3",
  );
  assert.equal(digest(fit), "a3f7933b66ff08e3ea8ae932599f1a2a1fd1923fc9ec412e21948227569cba0e");
});

for (const [name, start, end] of [
  [
    "vector conversion preserves the legacy Double reduction order",
    "private func vector(_ array:",
    "return try normalized(values)\n}",
  ],
  [
    "normalization preserves the legacy L2 arithmetic",
    "private func normalized(_ values:",
    "return values.map { $0 / length }\n}",
  ],
  [
    "center render core preserves original orientation, crop and sRGB pixel math",
    "  var image = CIImage(cgImage: cgImage)",
    "  return buffer\n}",
  ],
]) {
  test(name, () => {
    assert.equal(mapped(range(original, start, end)), range(candidate, start, end));
  });
}

test("full-frame fit preserves its separate frozen geometry", () => {
  const start = "private func fitGeometry(",
    end = "return (scale, (256 - extent.width * scale) / 2, (256 - extent.height * scale) / 2)\n}";
  assert.equal(mapped(range(fit, start, end)), range(candidate, start, end));
});

test("full-frame render preserves legacy extent, gray127, fit and cache behavior", () => {
  const start = "  let extent = image.extent",
    end = "  context.render(frame, to: buffer, bounds: canvas, colorSpace: colour)";
  const legacy = range(fit.slice(fit.indexOf("private func observe(")), start, end).replaceAll(
    "loaded.constraint.pixelFormatType",
    "pixelFormat",
  );
  const current = range(candidate.slice(candidate.indexOf("private func fitPixels(")), start, end);
  assert.equal(compact(legacy), compact(current));
  assert.match(candidate, /"aspect-fit-256-srgb-gray127-v1"/u);
  assert.match(candidate, /"center-square-256-srgb-v1"/u);
});

test("original bounded JPEG bytes are decoded once and hash the actual model input", () => {
  const decode = range(candidate, "private func decode(", "private func centerPixels(");
  for (const required of [
    "input.count <= 2_000_000",
    "bytes.count <= 1_500_000",
    "bytes.base64EncodedString() == base64",
    "CGImageSourceGetCount(source) == 1",
    "UTType.jpeg.identifier",
    "width <= 4096",
    "height <= 4096",
    "width * height <= 16_000_000",
    "(1...8).contains(orientation)",
    "imageSha256: hash(bytes)",
  ])
    assert.ok(decode.includes(required), required);
  assert.match(decode, /CGImageSourceCreateImageAtIndex\(source, 0, nil\)/u);
  assert.equal((candidate.match(/CGImageSourceCreateImageAtIndex\(/gu) ?? []).length, 1);
  assert.match(candidate, /let decoded = try decode\(input\)/u);
  assert.doesNotMatch(
    candidate,
    /stripPhotoMetadata|orientationCheckRequired|sourceCaseId|expectedKind|\.jpg"/u,
  );
});

test("model graph, whole compiled tree, weights, prototypes and prompts stay pinned", () => {
  for (const hash of [
    "87d8f63997bbd2f38ba7defeaaa2c571928bdece56aa9629542198b3ce906ed6",
    "858f2fc75c7d7b2fd182c1a13ae099a3f66c16ba1d0ea72375a0cdf6fe97b984",
    "8d6437b7a6add34c1a198e98b58c2059bc36573074cce49bfca82338a2f1d12b",
    "0dfe73569d1b2177629d95c4bc21c1392be9228aff6809cab0ed1c3358893c81",
    "aa726197e10fc1911b88bb6d6da099220339133c6e39e500f112b9077316e610",
  ])
    assert.ok(candidate.includes(hash), hash);
  assert.match(candidate, /try treeHash\(modelURL\) == compiledTreeHash/u);
  assert.match(candidate, /hash\(raw\) == prototypesHash/u);
  assert.match(candidate, /proto\.promptsSha256 == promptsHash/u);
  assert.match(candidate, /proto\.groups\.map\(\\\.group\) == expectedGroups/u);
  assert.match(candidate, /modelRevision = "55c8098c12ba8f928e37e26b2e1dd097777c3f98"/u);
  assert.match(candidate, /config\.computeUnits = \.cpuOnly/u);
});

test("one model load and two explicit sequential view predictions have stage counters", () => {
  assert.equal((candidate.match(/MLModel\(contentsOf:/gu) ?? []).length, 1);
  assert.equal((candidate.match(/loaded\.model\.prediction\(/gu) ?? []).length, 1);
  const main = candidate.slice(candidate.indexOf("@main private struct"));
  assert.equal((main.match(/let loaded = try load\(/gu) ?? []).length, 1);
  assert.equal((main.match(/let decoded = try decode\(/gu) ?? []).length, 1);
  assert.match(main, /let center = try observeView\(loaded, decoded: decoded, center: true/u);
  assert.match(main, /let fit = try observeView\(loaded, decoded: decoded, center: false/u);
  assert.ok(main.indexOf("let center =") < main.indexOf("let fit ="));
  assert.match(main, /views: \[center, fit\], counters: counters/u);
  const operation = range(candidate, "private func observeView(", "private func selfTest(");
  assert.ok(
    operation.indexOf("imagePredictionsAttempted += 1") <
      operation.indexOf("loaded.model.prediction("),
  );
  assert.ok(
    operation.indexOf("imagePredictionsCompleted += 1") >
      operation.indexOf("loaded.model.prediction("),
  );
  assert.match(operation, /centerPredictionsAttempted \+= 1/u);
  assert.match(operation, /fitPredictionsCompleted \+= 1/u);
});

test("a single total12s budget rejects late results rather than restarting per view", () => {
  assert.match(candidate, /guard ProcessInfo\.processInfo\.systemUptime - started < 12/u);
  assert.equal(
    (
      candidate.match(/let budget = Budget\(started: ProcessInfo\.processInfo\.systemUptime\)/gu) ??
      []
    ).length,
    1,
  );
  assert.ok((candidate.match(/try budget\.check\(\)/gu) ?? []).length >= 8);
  const operation = range(candidate, "private func observeView(", "private func selfTest(");
  assert.ok(
    operation.indexOf("try budget.check()") < operation.indexOf("loaded.model.prediction("),
  );
  assert.ok(
    operation.indexOf("try budget.check()", operation.indexOf("loaded.model.prediction(")) >
      operation.indexOf("loaded.model.prediction("),
  );
  assert.match(operation, /try budget\.check\(\)\s*return ViewObservation/u);
});

test("failure and stderr progress retain partial counters without forwarding private diagnostics", () => {
  const failure = range(
    candidate,
    "private struct FailureObservation:",
    "private struct Progress:",
  );
  assert.match(failure, /status = "unavailable"/u);
  assert.match(
    failure,
    /reason: String; let durationMs: Int; let counters: Counters; let completedViews: \[String\]/u,
  );
  assert.match(candidate, /schemaVersion = "mobileclip-s0-two-view-progress-v1"/u);
  assert.match(candidate, /to: \.standardError/u);
  for (const stage of [
    "model_load_started",
    "model_load_completed",
    "decode_started",
    "decode_completed",
    "center_prediction_started",
    "center_prediction_completed",
    "fit_prediction_started",
    "fit_prediction_completed",
  ])
    assert.ok(candidate.includes(`"${stage}"`));
  const main = candidate.slice(candidate.indexOf("@main private struct"));
  assert.equal((main.match(/FailureObservation\(/gu) ?? []).length, 2);
  assert.match(
    main,
    /reason: error\.rawValue, durationMs: budget\.durationMs, counters: counters, completedViews: completed/u,
  );
  assert.match(
    main,
    /reason: "processing_failed", durationMs: budget\.durationMs, counters: counters, completedViews: completed/u,
  );
  assert.doesNotMatch(main, /localizedDescription|String\(describing: error\)|print\(error/u);
});

test("preflight returns before stdin/decode and performs no image or text prediction", () => {
  const main = candidate.slice(candidate.indexOf("@main private struct"));
  const preflight = range(main, 'if args[0] == "--preflight"', "let input = try readInput(budget)");
  assert.match(preflight, /"imageCalls": 0, "textCalls": 0/u);
  assert.match(preflight, /\]\); return/u);
  assert.doesNotMatch(preflight, /prediction\(|observeView\(|decode\(/u);
  assert.match(candidate, /textPredictionsAttempted = 0, textPredictionsCompleted = 0/u);
});

test("both actual512 outputs are shape/type/finite/unit-checked with explicit provenance", () => {
  assert.match(
    candidate,
    /array\.shape\.map\(\\\.intValue\) == \[1, 512\], array\.dataType == \.float32/u,
  );
  assert.match(
    candidate,
    /arrayConstraint\.shape\.map\(\\\.intValue\) == \[1, 512\], arrayConstraint\.dataType == \.float32/u,
  );
  assert.match(
    candidate,
    /embedding\.count == 512, embedding\.allSatisfy\(\{ \$0\.isFinite && abs\(\$0\) <= 1\.000_001 \}\), abs\(norm - 1\) <= 0\.000_001/u,
  );
  for (const required of [
    "embeddingDimension = 512",
    'outputFeature = "final_emb_1"',
    "outputShape = [1, 512]",
    'outputDataType = "Float32"',
    "inputImageSha256: decoded.imageSha256",
    "compiledTreeSha256: compiledTreeHash",
    "osVersion:",
    "durationMs: budget.durationMs",
  ])
    assert.ok(candidate.includes(required));
  assert.match(candidate, /"legacy-center-unclamped-dot-v1"/u);
  assert.match(candidate, /"legacy-fit-roundoff-clamped-dot-v1"/u);
});

test("the exporter has no network, photo-storage, text preparation, training or app privileges", () => {
  assert.match(candidate, /guard !value\.contains\(":\/\/"\)/u);
  assert.match(candidate, /url\.resolvingSymlinksInPath\(\) == url/u);
  assert.match(candidate, /total <= 40_000_000, files\.count < 200/u);
  assert.doesNotMatch(
    candidate,
    /URLSession|URLRequest|NSURLConnection|MobileClipTokenizer|--prepare|--prototypes|write\(to:|createFile|createDirectory|ExpoModulesCore|AVFoundation|PhotosUI|UIKit/u,
  );
});

test("self-tests use only numeric/geometry/invalid-byte fixtures and report zero valid image work", () => {
  const body = range(candidate, "private func selfTest(", "@main private struct");
  assert.doesNotMatch(
    body,
    /loaded\.model|MLModel\(contentsOf:|observeView\(|centerPixels\(|fitPixels\(/u,
  );
  assert.match(body, /"imageCalls": 0, "textCalls": 0, "modelLoads": 0, "validImageDecodes": 0/u);
  assert.match(body, /MLMultiArray\(shape: \[1, 512\], dataType: \.float32\)/u);
  assert.match(body, /for input in \[Data\(\), Data\("not-base64"\.utf8\)/u);
});
