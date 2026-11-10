// QA EXPERIMENT ONLY. Two explicit predictions, never an app/product/bin answer.
// Original JPEG bytes enter through bounded stdin; filenames/labels are not model inputs.
import Foundation
@preconcurrency import CoreML
import CoreGraphics
import CoreImage
import CoreVideo
import ImageIO
import UniformTypeIdentifiers
import CryptoKit

private enum ExportFailure: String, Error {
  case invalidArguments = "invalid_arguments", invalidPath = "invalid_path"
  case invalidAssets = "invalid_assets", invalidModel = "invalid_model"
  case invalidPrototype = "invalid_prototype", invalidImage = "invalid_image"
  case processingFailed = "processing_failed", timeout
}
private let modelId = "apple-mobileclip-s0-coreml-2024"
private let modelRevision = "55c8098c12ba8f928e37e26b2e1dd097777c3f98"
private let imageWeightHash = "87d8f63997bbd2f38ba7defeaaa2c571928bdece56aa9629542198b3ce906ed6"
private let textWeightHash = "34723e51445b2630106e94e1fdbebed80e7676b404fb839f4eb9bec97bdcad68"
private let graphHash = "858f2fc75c7d7b2fd182c1a13ae099a3f66c16ba1d0ea72375a0cdf6fe97b984"
private let compiledTreeHash = "8d6437b7a6add34c1a198e98b58c2059bc36573074cce49bfca82338a2f1d12b"
private let prototypesHash = "0dfe73569d1b2177629d95c4bc21c1392be9228aff6809cab0ed1c3358893c81"
private let promptsHash = "aa726197e10fc1911b88bb6d6da099220339133c6e39e500f112b9077316e610"
private let centerPreprocessing = "center-square-256-srgb-v1"
private let fitPreprocessing = "aspect-fit-256-srgb-gray127-v1"
private let expectedGroups = ["bottle", "jar", "box", "bag", "cup", "other-battery", "other-phone", "other-book", "other-food", "other-person", "other-animal", "other-leaf", "other-clothes", "other-electronics", "other-tools", "other-plate", "other-aerosol", "other-drink-can"]
private let canvas = CGRect(x: 0, y: 0, width: 256, height: 256)
private func hash(_ data: Data) -> String { SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined() }

private struct PrototypeGroup: Decodable { let group: String; let role: String; let embedding: [Double] }
private struct PrototypePolicy: Decodable {
  let schemaVersion: String; let modelId: String; let modelRevision: String
  let imageWeightSha256: String; let textWeightSha256: String
  let promptPolicy: String; let promptsSha256: String; let tokenizerPolicy: String
  let preprocessing: String; let computeUnits: String; let groups: [PrototypeGroup]
}
private struct GroupScore: Encodable { let group: String; let cosine: Double }
private struct ViewObservation: Encodable {
  let view: String; let preprocessing: String; let scorePolicy: String
  let embeddingDimension = 512
  let normalization = "l2-double-reduction-order-v1"
  let outputFeature = "final_emb_1"
  let outputShape = [1, 512]
  let outputDataType = "Float32"
  let embedding: [Double]; let embeddingNorm: Double; let scores: [GroupScore]
}
private struct Counters: Encodable {
  var modelLoadsAttempted = 0, modelLoadsCompleted = 0
  var imageDecodesAttempted = 0, imageDecodesCompleted = 0
  var imagePredictionsAttempted = 0, imagePredictionsCompleted = 0
  var centerPredictionsAttempted = 0, centerPredictionsCompleted = 0
  var fitPredictionsAttempted = 0, fitPredictionsCompleted = 0
  let textPredictionsAttempted = 0, textPredictionsCompleted = 0
}
private struct Loaded {
  let model: MLModel; let imageFeature: MLFeatureDescription
  let constraint: MLImageConstraint; let prototypes: PrototypePolicy
}
private struct Decoded { let image: CGImage; let orientation: Int32; let imageSha256: String }
private struct Budget {
  let started: TimeInterval
  func check() throws {
    guard ProcessInfo.processInfo.systemUptime - started < 12 else { throw ExportFailure.timeout }
  }
  var durationMs: Int { max(0, Int((ProcessInfo.processInfo.systemUptime - started) * 1_000)) }
}
private struct Observation: Encodable {
  let schemaVersion = "mobileclip-s0-two-view-embeddings-v1"
  let status = "observed"
  let modelId: String; let modelRevision: String; let imageWeightSha256: String
  let compiledGraphSha256: String; let compiledTreeSha256: String
  let prototypesSha256: String; let promptsSha256: String; let promptPolicy: String
  let computeUnits = "cpuOnly"
  let inputPolicy = "original-frozen-jpeg-base64-stdin-v1"
  let inputImageSha256: String; let osVersion: String; let durationMs: Int
  let views: [ViewObservation]; let counters: Counters
}
private struct FailureObservation: Encodable {
  let schemaVersion = "mobileclip-s0-two-view-embeddings-v1"
  let status = "unavailable"
  let reason: String; let durationMs: Int; let counters: Counters; let completedViews: [String]
}
private struct Progress: Encodable {
  let schemaVersion = "mobileclip-s0-two-view-progress-v1"
  let stage: String; let durationMs: Int; let counters: Counters
}
private func encode<T: Encodable>(_ value: T, to file: FileHandle = .standardOutput) {
  if let data = try? JSONEncoder().encode(value) { file.write(data); file.write(Data([10])) }
}
private func progress(_ stage: String, _ counters: Counters, _ budget: Budget) {
  encode(Progress(stage: stage, durationMs: budget.durationMs, counters: counters), to: .standardError)
}
private func emit(_ value: [String: Any]) {
  if let data = try? JSONSerialization.data(withJSONObject: value, options: [.sortedKeys, .withoutEscapingSlashes]) {
    FileHandle.standardOutput.write(data); FileHandle.standardOutput.write(Data([10]))
  }
}
private func workURL(_ value: String, directory: Bool) throws -> URL {
  guard !value.contains("://") else { throw ExportFailure.invalidPath }
  let cwd = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
  let root = cwd.appendingPathComponent("work").resolvingSymlinksInPath().standardizedFileURL
  let url = URL(fileURLWithPath: value, relativeTo: cwd).standardizedFileURL
  guard url.path.hasPrefix(root.path + "/"), url.resolvingSymlinksInPath() == url else { throw ExportFailure.invalidPath }
  let values = try url.resourceValues(forKeys: [.isDirectoryKey, .isRegularFileKey, .isSymbolicLinkKey])
  guard values.isSymbolicLink != true,
        directory ? values.isDirectory == true : values.isRegularFile == true else { throw ExportFailure.invalidPath }
  return url
}
private func boundedData(_ url: URL, maximum: Int) throws -> Data {
  _ = try workURL(url.path, directory: false)
  let values = try url.resourceValues(forKeys: [.fileSizeKey])
  guard let size = values.fileSize, size > 0, size <= maximum else { throw ExportFailure.invalidAssets }
  let file = try FileHandle(forReadingFrom: url)
  defer { try? file.close() }
  let bytes = try file.read(upToCount: maximum + 1) ?? Data()
  guard bytes.count == size, bytes.count <= maximum else { throw ExportFailure.invalidAssets }
  return bytes
}
private func treeHash(_ directory: URL) throws -> String {
  var files: [[String]] = [], total = 0
  func visit(_ root: URL) throws {
    for url in try FileManager.default.contentsOfDirectory(at: root, includingPropertiesForKeys: [.isDirectoryKey, .isSymbolicLinkKey], options: []).sorted(by: { $0.lastPathComponent < $1.lastPathComponent }) {
      let values = try url.resourceValues(forKeys: [.isDirectoryKey, .isSymbolicLinkKey])
      guard values.isSymbolicLink != true else { throw ExportFailure.invalidPath }
      if values.isDirectory == true { _ = try workURL(url.path, directory: true); try visit(url) }
      else {
        let data = try boundedData(url, maximum: 40_000_000)
        total += data.count
        guard total <= 40_000_000, files.count < 200 else { throw ExportFailure.invalidAssets }
        files.append([String(url.path.dropFirst(directory.path.count + 1)), hash(data)])
      }
    }
  }
  try visit(directory)
  return hash(try JSONSerialization.data(withJSONObject: files, options: [.withoutEscapingSlashes]))
}
private func load(modelURL: URL, prototypeURL: URL, counters: inout Counters, budget: Budget) throws -> Loaded {
  try budget.check()
  guard modelURL.lastPathComponent == "mobileclip_s0_image.mlmodelc" else { throw ExportFailure.invalidModel }
  guard hash(try boundedData(modelURL.appendingPathComponent("weights/weight.bin"), maximum: 22_717_696)) == imageWeightHash,
        hash(try boundedData(modelURL.appendingPathComponent("model.mil"), maximum: 500_000)) == graphHash,
        try treeHash(modelURL) == compiledTreeHash else { throw ExportFailure.invalidAssets }
  let raw = try boundedData(prototypeURL, maximum: 1_000_000)
  guard hash(raw) == prototypesHash else { throw ExportFailure.invalidPrototype }
  let proto = try JSONDecoder().decode(PrototypePolicy.self, from: raw)
  guard proto.schemaVersion == "mobileclip-prototypes-v1", proto.modelId == modelId,
        proto.modelRevision == modelRevision, proto.imageWeightSha256 == imageWeightHash,
        proto.textWeightSha256 == textWeightHash, proto.promptsSha256 == promptsHash,
        proto.tokenizerPolicy == "clip-ascii-bpe-49408-v1", proto.preprocessing == centerPreprocessing,
        proto.computeUnits == "cpuOnly", proto.promptPolicy == "packaging-visible-form-v1",
        proto.groups.map(\.group) == expectedGroups else { throw ExportFailure.invalidPrototype }
  for (index, group) in proto.groups.enumerated() {
    let norm = sqrt(group.embedding.reduce(0) { $0 + $1 * $1 })
    guard group.role == (index < 5 ? "supported" : "outside"), group.embedding.count == 512,
          group.embedding.allSatisfy(\.isFinite), abs(norm - 1) < 0.000_01 else { throw ExportFailure.invalidPrototype }
  }
  try budget.check()
  let config = MLModelConfiguration(); config.computeUnits = .cpuOnly
  counters.modelLoadsAttempted += 1; progress("model_load_started", counters, budget)
  let model = try MLModel(contentsOf: modelURL, configuration: config)
  counters.modelLoadsCompleted += 1; progress("model_load_completed", counters, budget)
  try budget.check()
  guard model.modelDescription.inputDescriptionsByName.count == 1,
        let feature = model.modelDescription.inputDescriptionsByName["image"],
        let constraint = feature.imageConstraint, constraint.pixelsWide == 256, constraint.pixelsHigh == 256,
        [kCVPixelFormatType_32ARGB, kCVPixelFormatType_32BGRA].contains(constraint.pixelFormatType),
        model.modelDescription.outputDescriptionsByName.count == 1,
        let output = model.modelDescription.outputDescriptionsByName["final_emb_1"], output.type == .multiArray,
        let arrayConstraint = output.multiArrayConstraint,
        arrayConstraint.shape.map(\.intValue) == [1, 512], arrayConstraint.dataType == .float32 else { throw ExportFailure.invalidModel }
  return Loaded(model: model, imageFeature: feature, constraint: constraint, prototypes: proto)
}

// The following normalization/reduction functions retain the original center CLI arithmetic.
private func vector(_ array: MLMultiArray) throws -> [Double] {
  guard array.count == 512, [.float16, .float32, .double].contains(array.dataType) else { throw ExportFailure.invalidModel }
  let values = (0..<array.count).map { array[$0].doubleValue }
  guard values.allSatisfy(\.isFinite) else { throw ExportFailure.processingFailed }
  return try normalized(values)
}
private func normalized(_ values: [Double]) throws -> [Double] {
  let length = sqrt(values.reduce(0) { $0 + $1 * $1 })
  guard values.count == 512, length.isFinite, length > 0.000_001 else { throw ExportFailure.processingFailed }
  return values.map { $0 / length }
}
private func readInput(_ budget: Budget) throws -> Data {
  var input = Data()
  while let chunk = try FileHandle.standardInput.read(upToCount: min(65_536, 2_000_001 - input.count)), !chunk.isEmpty {
    input.append(chunk)
    guard input.count <= 2_000_000 else { throw ExportFailure.invalidImage }
    try budget.check()
  }
  return input
}
private func decode(_ input: Data) throws -> Decoded {
  guard !input.isEmpty, input.count <= 2_000_000,
        let base64 = String(data: input, encoding: .utf8),
        let bytes = Data(base64Encoded: base64), bytes.count >= 12, bytes.count <= 1_500_000,
        bytes.base64EncodedString() == base64,
        bytes.first == 0xff, bytes[1] == 0xd8,
        bytes[bytes.count - 2] == 0xff, bytes.last == 0xd9,
        let source = CGImageSourceCreateWithData(bytes as CFData, [kCGImageSourceShouldCache: false] as CFDictionary),
        CGImageSourceGetCount(source) == 1,
        CGImageSourceGetType(source) as String? == UTType.jpeg.identifier,
        let properties = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any],
        let width = properties[kCGImagePropertyPixelWidth] as? Int,
        let height = properties[kCGImagePropertyPixelHeight] as? Int,
        width > 0, height > 0, width <= 4096, height <= 4096, width * height <= 16_000_000,
        let cgImage = CGImageSourceCreateImageAtIndex(source, 0, nil) else { throw ExportFailure.invalidImage }
  let orientation = (properties[kCGImagePropertyOrientation] as? Int32) ?? 1
  guard (1...8).contains(orientation) else { throw ExportFailure.invalidImage }
  return Decoded(image: cgImage, orientation: orientation, imageSha256: hash(bytes))
}
private func centerPixels(_ decoded: Decoded, pixelFormat: OSType) throws -> CVPixelBuffer {
  let cgImage = decoded.image, orientation = decoded.orientation
  var image = CIImage(cgImage: cgImage).oriented(forExifOrientation: orientation)
  let extent = image.extent
  let side = min(extent.width, extent.height)
  let x = round((extent.width - side) / 2) + extent.origin.x
  let y = round((extent.height - side) / 2) + extent.origin.y
  image = image.cropped(to: CGRect(x: x, y: y, width: side, height: side)).transformed(by: CGAffineTransform(translationX: -x, y: -y))
  image = image.transformed(by: CGAffineTransform(scaleX: 256 / side, y: 256 / side))
  var buffer: CVPixelBuffer?
  guard [kCVPixelFormatType_32ARGB, kCVPixelFormatType_32BGRA].contains(pixelFormat),
        CVPixelBufferCreate(nil, 256, 256, pixelFormat, nil, &buffer) == kCVReturnSuccess,
        let buffer else { throw ExportFailure.processingFailed }
  let colour = CGColorSpace(name: CGColorSpace.sRGB)!
  CIContext(options: [.workingColorSpace: colour, .outputColorSpace: colour]).render(image, to: buffer, bounds: CGRect(x: 0, y: 0, width: 256, height: 256), colorSpace: colour)
  return buffer
}
private func fitGeometry(_ extent: CGRect) throws -> (scale: CGFloat, x: CGFloat, y: CGFloat) {
  guard [extent.minX, extent.minY, extent.width, extent.height].allSatisfy(\.isFinite),
        extent.width > 0, extent.height > 0 else { throw ExportFailure.invalidImage }
  let scale = 256 / max(extent.width, extent.height)
  return (scale, (256 - extent.width * scale) / 2, (256 - extent.height * scale) / 2)
}
private func fitPixels(_ decoded: Decoded, pixelFormat: OSType) throws -> CVPixelBuffer {
  let image = CIImage(cgImage: decoded.image).oriented(forExifOrientation: decoded.orientation)
  let extent = image.extent
  let fit = try fitGeometry(extent)
  let positioned = image.transformed(by: CGAffineTransform(translationX: -extent.minX, y: -extent.minY))
    .transformed(by: CGAffineTransform(scaleX: fit.scale, y: fit.scale))
    .transformed(by: CGAffineTransform(translationX: fit.x, y: fit.y))
  guard let colour = CGColorSpace(name: CGColorSpace.sRGB),
        let gray = CGColor(colorSpace: colour, components: [127.0 / 255, 127.0 / 255, 127.0 / 255, 1]) else { throw ExportFailure.processingFailed }
  let background = CIImage(color: CIColor(cgColor: gray)).cropped(to: canvas)
  let frame = positioned.composited(over: background).cropped(to: canvas)
  let context = CIContext(options: [.workingColorSpace: colour, .outputColorSpace: colour, .cacheIntermediates: false])
  // Transient-cache release is not a cryptographic framework-buffer wipe.
  defer { context.clearCaches() }
  var resultBuffer: CVPixelBuffer?
  guard CVPixelBufferCreate(nil, 256, 256, pixelFormat, nil, &resultBuffer) == kCVReturnSuccess,
        let buffer = resultBuffer else { throw ExportFailure.processingFailed }
  context.render(frame, to: buffer, bounds: canvas, colorSpace: colour)
  return buffer
}
private func checkedArray(_ array: MLMultiArray) throws {
  guard array.shape.map(\.intValue) == [1, 512], array.dataType == .float32 else { throw ExportFailure.invalidModel }
}
private func observeView(_ loaded: Loaded, decoded: Decoded, center: Bool, counters: inout Counters, budget: Budget) throws -> ViewObservation {
  try budget.check()
  let image = try center ? centerPixels(decoded, pixelFormat: loaded.constraint.pixelFormatType) : fitPixels(decoded, pixelFormat: loaded.constraint.pixelFormatType)
  try budget.check()
  let value = MLFeatureValue(pixelBuffer: image)
  guard loaded.imageFeature.isAllowedValue(value) else { throw ExportFailure.invalidImage }
  counters.imagePredictionsAttempted += 1
  if center { counters.centerPredictionsAttempted += 1 } else { counters.fitPredictionsAttempted += 1 }
  progress(center ? "center_prediction_started" : "fit_prediction_started", counters, budget)
  let result = try loaded.model.prediction(from: MLDictionaryFeatureProvider(dictionary: ["image": value]))
  counters.imagePredictionsCompleted += 1
  if center { counters.centerPredictionsCompleted += 1 } else { counters.fitPredictionsCompleted += 1 }
  progress(center ? "center_prediction_completed" : "fit_prediction_completed", counters, budget)
  try budget.check()
  guard let array = result.featureValue(for: "final_emb_1")?.multiArrayValue else { throw ExportFailure.invalidModel }
  try checkedArray(array)
  let embedding = try vector(array)
  let scores: [GroupScore]
  if center {
    // Same arithmetic and no rounding clamp as the original center-only CLI.
    scores = loaded.prototypes.groups.map { group in GroupScore(group: group.group, cosine: zip(embedding, group.embedding).reduce(0) { $0 + $1.0 * $1.1 }) }
    guard scores.allSatisfy({ $0.cosine.isFinite && $0.cosine >= -1.000_001 && $0.cosine <= 1.000_001 }) else { throw ExportFailure.processingFailed }
  } else {
    // Same arithmetic and rounding-only clamp as the original full-frame-fit CLI.
    scores = try loaded.prototypes.groups.map { group -> GroupScore in
      let cosine = zip(embedding, group.embedding).reduce(0) { $0 + $1.0 * $1.1 }
      guard cosine.isFinite, cosine >= -1.000_001, cosine <= 1.000_001 else { throw ExportFailure.processingFailed }
      return GroupScore(group: group.group, cosine: min(1, max(-1, cosine)))
    }
  }
  let norm = sqrt(embedding.reduce(0) { $0 + $1 * $1 })
  guard embedding.count == 512, embedding.allSatisfy({ $0.isFinite && abs($0) <= 1.000_001 }), abs(norm - 1) <= 0.000_001 else { throw ExportFailure.processingFailed }
  try budget.check()
  return ViewObservation(view: center ? "center" : "full-frame-aspect-fit", preprocessing: center ? centerPreprocessing : fitPreprocessing,
                         scorePolicy: center ? "legacy-center-unclamped-dot-v1" : "legacy-fit-roundoff-clamped-dot-v1",
                         embedding: embedding, embeddingNorm: norm, scores: scores)
}
private func selfTest() throws {
  var tests = 0
  let ones = try normalized(Array(repeating: 1, count: 512))
  guard ones.count == 512, ones.allSatisfy({ abs($0 - 1 / sqrt(512.0)) < 1e-15 }) else { throw ExportFailure.processingFailed }; tests += 1
  for values in [Array(repeating: 0.0, count: 512), Array(repeating: Double.nan, count: 512), Array(repeating: Double.infinity, count: 512), Array(repeating: 1.0, count: 511)] {
    do { _ = try normalized(values); throw ExportFailure.invalidArguments }
    catch ExportFailure.processingFailed { tests += 1 }
  }
  let array = try MLMultiArray(shape: [1, 512], dataType: .float32)
  for i in 0..<512 { array[i] = NSNumber(value: i == 0 ? 1.0 : 0.0) }
  try checkedArray(array); let unit = try vector(array)
  guard unit[0] == 1, unit.dropFirst().allSatisfy({ $0 == 0 }) else { throw ExportFailure.processingFailed }; tests += 1
  for bad in [try MLMultiArray(shape: [512, 1], dataType: .float32), try MLMultiArray(shape: [1, 512], dataType: .double)] {
    do { try checkedArray(bad); throw ExportFailure.invalidArguments }
    catch ExportFailure.invalidModel { tests += 1 }
  }
  for (width, height, scale, x, y) in [(256.0, 256.0, 1.0, 0.0, 0.0), (512, 256, 0.5, 0, 64), (256, 512, 0.5, 64, 0), (100, 400, 0.64, 96, 0), (400, 100, 0.64, 0, 96)] {
    let fit = try fitGeometry(CGRect(x: 11, y: -7, width: width, height: height))
    guard abs(fit.scale - scale) < 0.000_001, abs(fit.x - x) < 0.000_001, abs(fit.y - y) < 0.000_001 else { throw ExportFailure.processingFailed }; tests += 1
  }
  for extent in [CGRect.zero, CGRect(x: 0, y: 0, width: CGFloat.infinity, height: 2)] {
    do { _ = try fitGeometry(extent); throw ExportFailure.invalidArguments }
    catch ExportFailure.invalidImage { tests += 1 }
  }
  for input in [Data(), Data("not-base64".utf8), Data("AA==\n".utf8), Data("/9j/2Q==".utf8)] {
    do { _ = try decode(input); throw ExportFailure.invalidArguments }
    catch ExportFailure.invalidImage { tests += 1 }
  }
  do { try Budget(started: ProcessInfo.processInfo.systemUptime - 13).check(); throw ExportFailure.invalidArguments }
  catch ExportFailure.timeout { tests += 1 }
  let encoded = try JSONEncoder().encode(Counters())
  guard let counters = try JSONSerialization.jsonObject(with: encoded) as? [String: Int], counters.values.allSatisfy({ $0 == 0 }) else { throw ExportFailure.processingFailed }; tests += 1
  emit(["status": "passed", "tests": tests, "imageCalls": 0, "textCalls": 0, "modelLoads": 0, "validImageDecodes": 0])
}
@main private struct TwoViewEmbeddingQA {
  static func main() {
    var counters = Counters(), completed: [String] = []
    let budget = Budget(started: ProcessInfo.processInfo.systemUptime)
    do {
      let args = Array(CommandLine.arguments.dropFirst())
      if args == ["--self-test"] { try selfTest(); return }
      guard args.count == 3, ["--export-views", "--preflight"].contains(args[0]) else { throw ExportFailure.invalidArguments }
      let loaded = try load(modelURL: workURL(args[1], directory: true), prototypeURL: workURL(args[2], directory: false), counters: &counters, budget: budget)
      if args[0] == "--preflight" {
        emit(["status": "ready", "modelId": modelId, "modelRevision": modelRevision, "imageWeightSha256": imageWeightHash,
              "compiledGraphSha256": graphHash, "compiledTreeSha256": compiledTreeHash, "prototypesSha256": prototypesHash,
              "promptsSha256": promptsHash, "views": [centerPreprocessing, fitPreprocessing], "outputFeature": "final_emb_1",
              "outputShape": [1, 512], "outputDataType": "Float32", "computeUnits": "cpuOnly", "imageCalls": 0, "textCalls": 0,
              "modelLoadsAttempted": counters.modelLoadsAttempted, "modelLoadsCompleted": counters.modelLoadsCompleted]); return
      }
      let input = try readInput(budget)
      counters.imageDecodesAttempted += 1; progress("decode_started", counters, budget)
      let decoded = try decode(input)
      counters.imageDecodesCompleted += 1; progress("decode_completed", counters, budget)
      try budget.check()
      let center = try observeView(loaded, decoded: decoded, center: true, counters: &counters, budget: budget); completed.append(center.view)
      let fit = try observeView(loaded, decoded: decoded, center: false, counters: &counters, budget: budget); completed.append(fit.view)
      try budget.check()
      let version = ProcessInfo.processInfo.operatingSystemVersion
      let observation = Observation(modelId: modelId, modelRevision: modelRevision, imageWeightSha256: imageWeightHash,
        compiledGraphSha256: graphHash, compiledTreeSha256: compiledTreeHash, prototypesSha256: prototypesHash,
        promptsSha256: promptsHash, promptPolicy: loaded.prototypes.promptPolicy, inputImageSha256: decoded.imageSha256,
        osVersion: "\(version.majorVersion).\(version.minorVersion).\(version.patchVersion)", durationMs: budget.durationMs,
        views: [center, fit], counters: counters)
      encode(observation)
    } catch let error as ExportFailure {
      encode(FailureObservation(reason: error.rawValue, durationMs: budget.durationMs, counters: counters, completedViews: completed)); exit(1)
    } catch {
      encode(FailureObservation(reason: "processing_failed", durationMs: budget.durationMs, counters: counters, completedViews: completed)); exit(1)
    }
  }
}
