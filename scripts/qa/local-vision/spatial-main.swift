// QA-only fixed spatial observations. Not a product/material/sorting classifier.
// Public JPEG bytes alone enter this CLI; reference labels never do.
import Foundation
@preconcurrency import CoreML
import CoreGraphics
import CoreImage
import CoreVideo
import ImageIO
import UniformTypeIdentifiers
import CryptoKit

private enum SpatialFailure: String, Error {
  case invalidArguments = "invalid_arguments", invalidPath = "invalid_path"
  case invalidAssets = "invalid_assets", invalidModel = "invalid_model"
  case invalidPrototype = "invalid_prototype", invalidImage = "invalid_image"
  case processingFailed = "processing_failed"
}
private let modelId = "apple-mobileclip-s0-coreml-2024"
private let modelRevision = "55c8098c12ba8f928e37e26b2e1dd097777c3f98"
private let imageWeightHash = "87d8f63997bbd2f38ba7defeaaa2c571928bdece56aa9629542198b3ce906ed6"
private let textWeightHash = "34723e51445b2630106e94e1fdbebed80e7676b404fb839f4eb9bec97bdcad68"
private let graphHash = "858f2fc75c7d7b2fd182c1a13ae099a3f66c16ba1d0ea72375a0cdf6fe97b984"
private let prototypesHash = "0dfe73569d1b2177629d95c4bc21c1392be9228aff6809cab0ed1c3358893c81"
private let promptsHash = "aa726197e10fc1911b88bb6d6da099220339133c6e39e500f112b9077316e610"
private let preprocessing = "four-sides-60pct-aspect-fit-256-srgb-gray127-v1"
private let cropPolicy = "horizontal-vertical-overlap-20pct-v1"
private let expectedGroups = ["bottle", "jar", "box", "bag", "cup", "other-battery", "other-phone", "other-book", "other-food", "other-person", "other-animal", "other-leaf", "other-clothes", "other-electronics", "other-tools", "other-plate", "other-aerosol", "other-drink-can"]
private let canvas = CGRect(x: 0, y: 0, width: 256, height: 256)
private func sha256(_ data: Data) -> String { SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined() }

private struct PrototypeGroup: Decodable { let group: String; let role: String; let embedding: [Double] }
private struct PrototypePolicy: Decodable {
  let schemaVersion: String; let modelId: String; let modelRevision: String
  let imageWeightSha256: String; let textWeightSha256: String
  let promptPolicy: String; let promptsSha256: String; let tokenizerPolicy: String
  let preprocessing: String; let computeUnits: String; let groups: [PrototypeGroup]
}
private enum Side: String, CaseIterable, Encodable { case left, right, bottom, top }
private struct Rectangle: Encodable {
  let x: Double; let y: Double; let width: Double; let height: Double
  init(_ rect: CGRect) { x = rect.minX; y = rect.minY; width = rect.width; height = rect.height }
}
private struct GroupScore: Encodable { let group: String; let cosine: Double }
private struct ViewObservation: Encodable {
  let side: Side; let normalizedRect: Rectangle; let pixelRect: Rectangle
  let embeddingNorm: Double; let scores: [GroupScore]
}
private struct SpatialObservation: Encodable {
  let schemaVersion = "mobileclip-spatial-scores-v1"
  let status = "observed"
  let modelId: String; let modelRevision: String; let imageWeightSha256: String
  let prototypesSha256: String; let promptPolicy: String; let promptsSha256: String
  let preprocessing: String; let cropPolicy: String; let computeUnits: String
  let osVersion: String; let durationMs: Int; let orientedWidth: Int; let orientedHeight: Int
  let predictionsAttempted: Int; let predictionsCompleted: Int; let views: [ViewObservation]
}
private struct PredictionCounter { var attempted = 0; var completed = 0 }
private struct Loaded {
  let model: MLModel; let imageFeature: MLFeatureDescription
  let constraint: MLImageConstraint; let prototypes: PrototypePolicy
}
private func workURL(_ value: String, directory: Bool) throws -> URL {
  guard !value.contains("://") else { throw SpatialFailure.invalidPath }
  let cwd = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
  let root = cwd.appendingPathComponent("work").resolvingSymlinksInPath().standardizedFileURL
  let url = URL(fileURLWithPath: value, relativeTo: cwd).standardizedFileURL
  guard url.path.hasPrefix(root.path + "/"), url.resolvingSymlinksInPath() == url else { throw SpatialFailure.invalidPath }
  let values = try url.resourceValues(forKeys: [.isDirectoryKey, .isRegularFileKey, .isSymbolicLinkKey])
  guard values.isSymbolicLink != true,
        directory ? values.isDirectory == true : values.isRegularFile == true else { throw SpatialFailure.invalidPath }
  return url
}
private func bytes(_ url: URL, maximum: Int) throws -> Data {
  _ = try workURL(url.path, directory: false)
  let values = try url.resourceValues(forKeys: [.fileSizeKey])
  guard let count = values.fileSize, count > 0, count <= maximum else { throw SpatialFailure.invalidAssets }
  let data = try Data(contentsOf: url, options: .mappedIfSafe)
  guard data.count == count else { throw SpatialFailure.invalidAssets }
  return data
}
private func load(modelURL: URL, prototypeURL: URL) throws -> Loaded {
  guard modelURL.lastPathComponent == "mobileclip_s0_image.mlmodelc" else { throw SpatialFailure.invalidModel }
  guard sha256(try bytes(modelURL.appendingPathComponent("weights/weight.bin"), maximum: 22_717_696)) == imageWeightHash,
        sha256(try bytes(modelURL.appendingPathComponent("model.mil"), maximum: 500_000)) == graphHash else { throw SpatialFailure.invalidAssets }
  let raw = try bytes(prototypeURL, maximum: 1_000_000)
  guard sha256(raw) == prototypesHash else { throw SpatialFailure.invalidPrototype }
  let proto = try JSONDecoder().decode(PrototypePolicy.self, from: raw)
  guard proto.schemaVersion == "mobileclip-prototypes-v1", proto.modelId == modelId,
        proto.modelRevision == modelRevision, proto.imageWeightSha256 == imageWeightHash,
        proto.textWeightSha256 == textWeightHash, proto.promptsSha256 == promptsHash,
        proto.tokenizerPolicy == "clip-ascii-bpe-49408-v1", proto.preprocessing == "center-square-256-srgb-v1",
        proto.computeUnits == "cpuOnly", proto.promptPolicy == "packaging-visible-form-v1",
        proto.groups.map(\.group) == expectedGroups else { throw SpatialFailure.invalidPrototype }
  for (index, group) in proto.groups.enumerated() {
    let norm = sqrt(group.embedding.reduce(0) { $0 + $1 * $1 })
    guard group.role == (index < 5 ? "supported" : "outside"), group.embedding.count == 512,
          group.embedding.allSatisfy(\.isFinite), abs(norm - 1) < 0.000_01 else { throw SpatialFailure.invalidPrototype }
  }
  let config = MLModelConfiguration(); config.computeUnits = .cpuOnly
  let model = try MLModel(contentsOf: modelURL, configuration: config)
  guard model.modelDescription.inputDescriptionsByName.count == 1,
        let feature = model.modelDescription.inputDescriptionsByName["image"],
        let constraint = feature.imageConstraint, constraint.pixelsWide == 256, constraint.pixelsHigh == 256,
        [kCVPixelFormatType_32ARGB, kCVPixelFormatType_32BGRA].contains(constraint.pixelFormatType),
        model.modelDescription.outputDescriptionsByName.count == 1,
        model.modelDescription.outputDescriptionsByName["final_emb_1"]?.type == .multiArray else { throw SpatialFailure.invalidModel }
  return Loaded(model: model, imageFeature: feature, constraint: constraint, prototypes: proto)
}
private func normalizedRect(_ side: Side) -> CGRect {
  switch side {
  case .left: return CGRect(x: 0, y: 0, width: 0.6, height: 1)
  case .right: return CGRect(x: 0.4, y: 0, width: 0.6, height: 1)
  case .bottom: return CGRect(x: 0, y: 0, width: 1, height: 0.6)
  case .top: return CGRect(x: 0, y: 0.4, width: 1, height: 0.6)
  }
}
private func cropRectangle(width: CGFloat, height: CGFloat, side: Side) throws -> CGRect {
  guard width.isFinite, height.isFinite, width > 0, height > 0,
        width <= 4096, height <= 4096, width * height <= 16_000_000 else { throw SpatialFailure.invalidImage }
  let rect = normalizedRect(side)
  return CGRect(x: rect.minX * width, y: rect.minY * height, width: rect.width * width, height: rect.height * height)
}
private func fitGeometry(_ extent: CGRect) throws -> (scale: CGFloat, x: CGFloat, y: CGFloat) {
  guard [extent.minX, extent.minY, extent.width, extent.height].allSatisfy(\.isFinite),
        extent.width > 0, extent.height > 0 else { throw SpatialFailure.invalidImage }
  let scale = 256 / max(extent.width, extent.height)
  return (scale, (256 - extent.width * scale) / 2, (256 - extent.height * scale) / 2)
}
private func decode(_ input: Data) throws -> CIImage {
  guard input.count > 0, input.count <= 2_000_000,
        let base64 = String(data: input, encoding: .utf8), base64.utf8.count % 4 == 0,
        let data = Data(base64Encoded: base64), data.count >= 12, data.count <= 1_500_000,
        data.base64EncodedString() == base64,
        data[0] == 0xff, data[1] == 0xd8, data[data.count - 2] == 0xff, data[data.count - 1] == 0xd9,
        let source = CGImageSourceCreateWithData(data as CFData, [kCGImageSourceShouldCache: false] as CFDictionary),
        CGImageSourceGetCount(source) == 1,
        CGImageSourceGetType(source) as String? == UTType.jpeg.identifier,
        let properties = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any],
        let width = properties[kCGImagePropertyPixelWidth] as? Int,
        let height = properties[kCGImagePropertyPixelHeight] as? Int,
        width > 0, height > 0, width <= 4096, height <= 4096, width * height <= 16_000_000,
        let cgImage = CGImageSourceCreateImageAtIndex(source, 0, [kCGImageSourceShouldCacheImmediately: true] as CFDictionary),
        cgImage.width == width, cgImage.height == height else { throw SpatialFailure.invalidImage }
  let orientation = (properties[kCGImagePropertyOrientation] as? Int32) ?? 1
  guard (1...8).contains(orientation) else { throw SpatialFailure.invalidImage }
  let image = CIImage(cgImage: cgImage).oriented(forExifOrientation: orientation)
  return image.transformed(by: CGAffineTransform(translationX: -image.extent.minX, y: -image.extent.minY))
}
private func readInput() throws -> Data {
  var input = Data()
  while let chunk = try FileHandle.standardInput.read(upToCount: min(65_536, 2_000_001 - input.count)), !chunk.isEmpty {
    input.append(chunk)
    guard input.count <= 2_000_000 else { throw SpatialFailure.invalidImage }
  }
  return input
}
private func predict(_ loaded: Loaded, image: CIImage, rect: CGRect, context: CIContext,
                     colour: CGColorSpace, background: CIImage, counter: inout PredictionCounter) throws -> (Double, [GroupScore]) {
  let fit = try fitGeometry(rect)
  let positioned = image.cropped(to: rect)
    .transformed(by: CGAffineTransform(translationX: -rect.minX, y: -rect.minY))
    .transformed(by: CGAffineTransform(scaleX: fit.scale, y: fit.scale))
    .transformed(by: CGAffineTransform(translationX: fit.x, y: fit.y))
  let frame = positioned.composited(over: background).cropped(to: canvas)
  var resultBuffer: CVPixelBuffer?
  guard CVPixelBufferCreate(nil, 256, 256, loaded.constraint.pixelFormatType, nil, &resultBuffer) == kCVReturnSuccess,
        let buffer = resultBuffer else { throw SpatialFailure.processingFailed }
  context.render(frame, to: buffer, bounds: canvas, colorSpace: colour)
  let featureValue = MLFeatureValue(pixelBuffer: buffer)
  guard loaded.imageFeature.isAllowedValue(featureValue) else { throw SpatialFailure.invalidImage }
  counter.attempted += 1
  let result = try loaded.model.prediction(from: MLDictionaryFeatureProvider(dictionary: ["image": featureValue]))
  counter.completed += 1
  guard let array = result.featureValue(for: "final_emb_1")?.multiArrayValue,
        array.count == 512, [.float16, .float32, .double].contains(array.dataType) else { throw SpatialFailure.invalidModel }
  let raw = (0..<512).map { array[$0].doubleValue }
  let norm = sqrt(raw.reduce(0) { $0 + $1 * $1 })
  guard raw.allSatisfy(\.isFinite), norm.isFinite, norm > 0.000_001 else { throw SpatialFailure.processingFailed }
  let embedding = raw.map { $0 / norm }
  let scores = try loaded.prototypes.groups.map { group -> GroupScore in
    let cosine = zip(embedding, group.embedding).reduce(0) { $0 + $1.0 * $1.1 }
    guard cosine.isFinite, cosine >= -1.000_001, cosine <= 1.000_001 else { throw SpatialFailure.processingFailed }
    return GroupScore(group: group.group, cosine: min(1, max(-1, cosine)))
  }
  return (sqrt(embedding.reduce(0) { $0 + $1 * $1 }), scores)
}
private func observe(_ loaded: Loaded, start: TimeInterval, counter: inout PredictionCounter) throws {
  let image = try decode(readInput())
  guard let colour = CGColorSpace(name: CGColorSpace.sRGB),
        let gray = CGColor(colorSpace: colour, components: [127.0 / 255, 127.0 / 255, 127.0 / 255, 1]) else { throw SpatialFailure.processingFailed }
  let background = CIImage(color: CIColor(cgColor: gray)).cropped(to: canvas)
  let context = CIContext(options: [.workingColorSpace: colour, .outputColorSpace: colour, .cacheIntermediates: false])
  defer { context.clearCaches() } // No cryptographic framework-buffer wipe claim.
  let views = try Side.allCases.map { side -> ViewObservation in
    let rect = try cropRectangle(width: image.extent.width, height: image.extent.height, side: side)
    let (norm, scores) = try predict(loaded, image: image, rect: rect, context: context, colour: colour, background: background, counter: &counter)
    return ViewObservation(side: side, normalizedRect: Rectangle(normalizedRect(side)), pixelRect: Rectangle(rect), embeddingNorm: norm, scores: scores)
  }
  let version = ProcessInfo.processInfo.operatingSystemVersion
  let observation = SpatialObservation(modelId: modelId, modelRevision: modelRevision,
    imageWeightSha256: imageWeightHash, prototypesSha256: prototypesHash,
    promptPolicy: loaded.prototypes.promptPolicy, promptsSha256: promptsHash,
    preprocessing: preprocessing, cropPolicy: cropPolicy, computeUnits: "cpuOnly",
    osVersion: "\(version.majorVersion).\(version.minorVersion).\(version.patchVersion)",
    durationMs: max(0, Int((ProcessInfo.processInfo.systemUptime - start) * 1_000)),
    orientedWidth: Int(image.extent.width), orientedHeight: Int(image.extent.height),
    predictionsAttempted: counter.attempted, predictionsCompleted: counter.completed, views: views)
  FileHandle.standardOutput.write(try JSONEncoder().encode(observation)); FileHandle.standardOutput.write(Data([10]))
}
private func emit(_ value: [String: Any]) {
  if let bytes = try? JSONSerialization.data(withJSONObject: value, options: [.sortedKeys]) {
    FileHandle.standardOutput.write(bytes); FileHandle.standardOutput.write(Data([10]))
  }
}
private func selfTest() throws {
  var count = 0
  for (width, height) in [(1000.0, 400.0), (400, 1000), (256, 256), (333, 777)] {
    for side in Side.allCases {
      let rect = try cropRectangle(width: width, height: height, side: side)
      let expected = normalizedRect(side)
      guard abs(rect.minX / width - expected.minX) < 0.000_001,
            abs(rect.minY / height - expected.minY) < 0.000_001,
            abs(rect.width / width - expected.width) < 0.000_001,
            abs(rect.height / height - expected.height) < 0.000_001 else { throw SpatialFailure.processingFailed }
      let fit = try fitGeometry(rect)
      guard fit.scale.isFinite, fit.scale > 0, fit.x >= 0, fit.y >= 0 else { throw SpatialFailure.processingFailed }
      count += 1
    }
  }
  for (width, height) in [(0.0, 40.0), (40, 0), (Double.infinity, 40), (4097, 40), (4096, 4096)] {
    do { _ = try cropRectangle(width: width, height: height, side: .left); throw SpatialFailure.processingFailed }
    catch SpatialFailure.invalidImage { count += 1 }
  }
  for input in [Data(), Data("not-base64".utf8), Data("AA==\n".utf8), Data("/9j/2Q==".utf8)] {
    do { _ = try decode(input); throw SpatialFailure.processingFailed }
    catch SpatialFailure.invalidImage { count += 1 }
  }
  emit(["status": "passed", "tests": count, "modelPredictions": 0, "textCalls": 0,
        "preprocessing": preprocessing, "cropPolicy": cropPolicy])
}
@main private struct MobileClipSpatialQA {
  static func main() {
    var counter = PredictionCounter()
    do {
      let args = Array(CommandLine.arguments.dropFirst())
      if args == ["--self-test"] { try selfTest(); return }
      guard args.count == 3, ["--score-spatial", "--preflight"].contains(args[0]) else { throw SpatialFailure.invalidArguments }
      let start = ProcessInfo.processInfo.systemUptime
      let loaded = try load(modelURL: workURL(args[1], directory: true), prototypeURL: workURL(args[2], directory: false))
      if args[0] == "--preflight" {
        emit(["status": "ready", "modelId": modelId, "modelRevision": modelRevision,
              "imageWeightSha256": imageWeightHash, "compiledGraphSha256": graphHash,
              "prototypesSha256": prototypesHash, "promptsSha256": promptsHash,
              "preprocessing": preprocessing, "cropPolicy": cropPolicy, "computeUnits": "cpuOnly",
              "modelPredictions": 0, "textCalls": 0])
      } else { try observe(loaded, start: start, counter: &counter) }
    } catch {
      emit(["schemaVersion": "mobileclip-spatial-scores-v1", "status": "unavailable",
            "reason": (error as? SpatialFailure)?.rawValue ?? "processing_failed",
            "predictionsAttempted": counter.attempted, "predictionsCompleted": counter.completed])
      exit(1)
    }
  }
}
