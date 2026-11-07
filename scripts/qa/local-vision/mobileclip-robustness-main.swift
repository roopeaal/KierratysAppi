// QA-only second-view observations for a preregistered reliability comparison.
// The frozen original CLI supplies center-square observations. This tool adds
// exactly one full-frame aspect-fit view, never a winner/material/probability.
import Foundation
@preconcurrency import CoreML
import CoreGraphics
import CoreImage
import CoreVideo
import ImageIO
import UniformTypeIdentifiers
import CryptoKit

private enum FitFailure: String, Error {
  case invalidArguments = "invalid_arguments"
  case invalidPath = "invalid_path"
  case invalidAssets = "invalid_assets"
  case invalidModel = "invalid_model"
  case invalidPrototype = "invalid_prototype"
  case invalidImage = "invalid_image"
  case processingFailed = "processing_failed"
}
private let modelId = "apple-mobileclip-s0-coreml-2024"
private let modelRevision = "55c8098c12ba8f928e37e26b2e1dd097777c3f98"
private let imageWeightHash = "87d8f63997bbd2f38ba7defeaaa2c571928bdece56aa9629542198b3ce906ed6"
private let textWeightHash = "34723e51445b2630106e94e1fdbebed80e7676b404fb839f4eb9bec97bdcad68"
private let graphHash = "858f2fc75c7d7b2fd182c1a13ae099a3f66c16ba1d0ea72375a0cdf6fe97b984"
private let prototypesHash = "0dfe73569d1b2177629d95c4bc21c1392be9228aff6809cab0ed1c3358893c81"
private let promptsHash = "aa726197e10fc1911b88bb6d6da099220339133c6e39e500f112b9077316e610"
private let fitPreprocessing = "aspect-fit-256-srgb-gray127-v1"
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
private struct GroupScore: Encodable { let group: String; let cosine: Double }
private struct FitObservation: Encodable {
  let schemaVersion = "mobileclip-s0-scores-v1"
  let modelId: String; let modelRevision: String; let imageWeightSha256: String
  let prototypesSha256: String; let promptPolicy: String; let promptsSha256: String
  let preprocessing: String; let computeUnits: String; let osVersion: String
  let durationMs: Int; let embeddingNorm: Double; let scores: [GroupScore]
}
private struct Loaded {
  let model: MLModel; let imageFeature: MLFeatureDescription
  let constraint: MLImageConstraint; let prototypes: PrototypePolicy
}

private func workURL(_ value: String, directory: Bool) throws -> URL {
  guard !value.contains("://") else { throw FitFailure.invalidPath }
  let cwd = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
  let root = cwd.appendingPathComponent("work").resolvingSymlinksInPath().standardizedFileURL
  let url = URL(fileURLWithPath: value, relativeTo: cwd).standardizedFileURL
  guard url.path.hasPrefix(root.path + "/"), url.resolvingSymlinksInPath() == url else { throw FitFailure.invalidPath }
  let values = try url.resourceValues(forKeys: [.isDirectoryKey, .isRegularFileKey, .isSymbolicLinkKey])
  guard values.isSymbolicLink != true,
        directory ? values.isDirectory == true : values.isRegularFile == true else { throw FitFailure.invalidPath }
  return url
}
private func bytes(_ url: URL, maximum: Int) throws -> Data {
  _ = try workURL(url.path, directory: false)
  let values = try url.resourceValues(forKeys: [.fileSizeKey])
  guard let count = values.fileSize, count > 0, count <= maximum else { throw FitFailure.invalidAssets }
  let data = try Data(contentsOf: url, options: .mappedIfSafe)
  guard data.count == count else { throw FitFailure.invalidAssets }
  return data
}
private func load(modelURL: URL, prototypeURL: URL) throws -> Loaded {
  guard modelURL.lastPathComponent == "mobileclip_s0_image.mlmodelc" else { throw FitFailure.invalidModel }
  guard sha256(try bytes(modelURL.appendingPathComponent("weights/weight.bin"), maximum: 22_717_696)) == imageWeightHash,
        sha256(try bytes(modelURL.appendingPathComponent("model.mil"), maximum: 500_000)) == graphHash else { throw FitFailure.invalidAssets }
  let raw = try bytes(prototypeURL, maximum: 1_000_000)
  guard sha256(raw) == prototypesHash else { throw FitFailure.invalidPrototype }
  let proto = try JSONDecoder().decode(PrototypePolicy.self, from: raw)
  guard proto.schemaVersion == "mobileclip-prototypes-v1", proto.modelId == modelId,
        proto.modelRevision == modelRevision, proto.imageWeightSha256 == imageWeightHash,
        proto.textWeightSha256 == textWeightHash, proto.promptsSha256 == promptsHash,
        proto.tokenizerPolicy == "clip-ascii-bpe-49408-v1", proto.preprocessing == "center-square-256-srgb-v1",
        proto.computeUnits == "cpuOnly", proto.promptPolicy == "packaging-visible-form-v1",
        proto.groups.map(\.group) == expectedGroups else { throw FitFailure.invalidPrototype }
  for (index, group) in proto.groups.enumerated() {
    let norm = sqrt(group.embedding.reduce(0) { $0 + $1 * $1 })
    guard group.role == (index < 5 ? "supported" : "outside"), group.embedding.count == 512,
          group.embedding.allSatisfy(\.isFinite), abs(norm - 1) < 0.000_01 else { throw FitFailure.invalidPrototype }
  }
  let config = MLModelConfiguration(); config.computeUnits = .cpuOnly
  let model = try MLModel(contentsOf: modelURL, configuration: config)
  guard model.modelDescription.inputDescriptionsByName.count == 1,
        let feature = model.modelDescription.inputDescriptionsByName["image"],
        let constraint = feature.imageConstraint, constraint.pixelsWide == 256, constraint.pixelsHigh == 256,
        [kCVPixelFormatType_32ARGB, kCVPixelFormatType_32BGRA].contains(constraint.pixelFormatType),
        model.modelDescription.outputDescriptionsByName.count == 1,
        model.modelDescription.outputDescriptionsByName["final_emb_1"]?.type == .multiArray else { throw FitFailure.invalidModel }
  return Loaded(model: model, imageFeature: feature, constraint: constraint, prototypes: proto)
}

private func fitGeometry(_ extent: CGRect) throws -> (scale: CGFloat, x: CGFloat, y: CGFloat) {
  guard [extent.minX, extent.minY, extent.width, extent.height].allSatisfy(\.isFinite),
        extent.width > 0, extent.height > 0 else { throw FitFailure.invalidImage }
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
        cgImage.width == width, cgImage.height == height else { throw FitFailure.invalidImage }
  let orientation = (properties[kCGImagePropertyOrientation] as? Int32) ?? 1
  guard (1...8).contains(orientation) else { throw FitFailure.invalidImage }
  return CIImage(cgImage: cgImage).oriented(forExifOrientation: orientation)
}
private func readInput() throws -> Data {
  var input = Data()
  while let chunk = try FileHandle.standardInput.read(upToCount: min(65_536, 2_000_001 - input.count)), !chunk.isEmpty {
    input.append(chunk)
    guard input.count <= 2_000_000 else { throw FitFailure.invalidImage }
  }
  return input
}
private func observe(_ loaded: Loaded, start: TimeInterval) throws {
  let image = try decode(readInput())
  let extent = image.extent
  let fit = try fitGeometry(extent)
  let positioned = image.transformed(by: CGAffineTransform(translationX: -extent.minX, y: -extent.minY))
    .transformed(by: CGAffineTransform(scaleX: fit.scale, y: fit.scale))
    .transformed(by: CGAffineTransform(translationX: fit.x, y: fit.y))
  guard let colour = CGColorSpace(name: CGColorSpace.sRGB),
        let gray = CGColor(colorSpace: colour, components: [127.0 / 255, 127.0 / 255, 127.0 / 255, 1]) else { throw FitFailure.processingFailed }
  let background = CIImage(color: CIColor(cgColor: gray)).cropped(to: canvas)
  let frame = positioned.composited(over: background).cropped(to: canvas)
  let context = CIContext(options: [.workingColorSpace: colour, .outputColorSpace: colour, .cacheIntermediates: false])
  // Transient-cache release is not a cryptographic framework-buffer wipe.
  defer { context.clearCaches() }
  var resultBuffer: CVPixelBuffer?
  guard CVPixelBufferCreate(nil, 256, 256, loaded.constraint.pixelFormatType, nil, &resultBuffer) == kCVReturnSuccess,
        let buffer = resultBuffer else { throw FitFailure.processingFailed }
  context.render(frame, to: buffer, bounds: canvas, colorSpace: colour)
  let featureValue = MLFeatureValue(pixelBuffer: buffer)
  guard loaded.imageFeature.isAllowedValue(featureValue) else { throw FitFailure.invalidImage }
  let result = try loaded.model.prediction(from: MLDictionaryFeatureProvider(dictionary: ["image": featureValue]))
  guard let array = result.featureValue(for: "final_emb_1")?.multiArrayValue,
        array.count == 512, [.float16, .float32, .double].contains(array.dataType) else { throw FitFailure.invalidModel }
  let raw = (0..<512).map { array[$0].doubleValue }
  let norm = sqrt(raw.reduce(0) { $0 + $1 * $1 })
  guard raw.allSatisfy(\.isFinite), norm.isFinite, norm > 0.000_001 else { throw FitFailure.processingFailed }
  let embedding = raw.map { $0 / norm }
  let scores = try loaded.prototypes.groups.map { group -> GroupScore in
    let cosine = zip(embedding, group.embedding).reduce(0) { $0 + $1.0 * $1.1 }
    guard cosine.isFinite, cosine >= -1.000_001, cosine <= 1.000_001 else { throw FitFailure.processingFailed }
    return GroupScore(group: group.group, cosine: min(1, max(-1, cosine)))
  }
  let version = ProcessInfo.processInfo.operatingSystemVersion
  let observation = FitObservation(modelId: modelId, modelRevision: modelRevision, imageWeightSha256: imageWeightHash,
    prototypesSha256: prototypesHash, promptPolicy: loaded.prototypes.promptPolicy, promptsSha256: promptsHash,
    preprocessing: fitPreprocessing, computeUnits: "cpuOnly", osVersion: "\(version.majorVersion).\(version.minorVersion).\(version.patchVersion)",
    durationMs: max(0, Int((ProcessInfo.processInfo.systemUptime - start) * 1_000)),
    embeddingNorm: sqrt(embedding.reduce(0) { $0 + $1 * $1 }), scores: scores)
  FileHandle.standardOutput.write(try JSONEncoder().encode(observation)); FileHandle.standardOutput.write(Data([10]))
}
private func emit(_ value: [String: Any]) {
  if let bytes = try? JSONSerialization.data(withJSONObject: value, options: [.sortedKeys]) {
    FileHandle.standardOutput.write(bytes); FileHandle.standardOutput.write(Data([10]))
  }
}
private func selfTest() throws {
  for (width, height, scale, x, y) in [(256.0, 256.0, 1.0, 0.0, 0.0), (512, 256, 0.5, 0, 64), (256, 512, 0.5, 64, 0), (100, 400, 0.64, 96, 0), (400, 100, 0.64, 0, 96)] {
    let fit = try fitGeometry(CGRect(x: 11, y: -7, width: width, height: height))
    guard abs(fit.scale - scale) < 0.000_001, abs(fit.x - x) < 0.000_001, abs(fit.y - y) < 0.000_001 else { throw FitFailure.processingFailed }
  }
  for extent in [CGRect.zero, CGRect(x: 0, y: 0, width: CGFloat.infinity, height: 2)] {
    do { _ = try fitGeometry(extent); throw FitFailure.processingFailed }
    catch FitFailure.invalidImage { }
  }
  for input in [Data(), Data("not-base64".utf8), Data("AA==\n".utf8), Data("/9j/2Q==".utf8)] {
    do { _ = try decode(input); throw FitFailure.processingFailed }
    catch FitFailure.invalidImage { }
  }
  emit(["status": "passed", "tests": 11, "imageCalls": 0, "textCalls": 0, "preprocessing": fitPreprocessing])
}
@main private struct MobileClipRobustnessQA {
  static func main() {
    do {
      let args = Array(CommandLine.arguments.dropFirst())
      if args == ["--self-test"] { try selfTest(); return }
      guard args.count == 3, ["--score-fit", "--preflight"].contains(args[0]) else { throw FitFailure.invalidArguments }
      let start = ProcessInfo.processInfo.systemUptime
      let loaded = try load(modelURL: workURL(args[1], directory: true), prototypeURL: workURL(args[2], directory: false))
      if args[0] == "--preflight" {
        emit(["status": "ready", "modelId": modelId, "modelRevision": modelRevision,
              "imageWeightSha256": imageWeightHash, "compiledGraphSha256": graphHash,
              "prototypesSha256": prototypesHash, "promptsSha256": promptsHash,
              "preprocessing": fitPreprocessing, "computeUnits": "cpuOnly", "imageCalls": 0, "textCalls": 0])
      } else { try observe(loaded, start: start) }
    } catch let error as FitFailure { emit(["status": "unavailable", "reason": error.rawValue]); exit(1) }
      catch { emit(["status": "unavailable", "reason": "processing_failed"]); exit(1) }
  }
}
