// QA-only pinned MobileCLIP-S0 Core ML observations. No service, image filename,
// expected answer, product/material/bin inference, network or winner threshold.
import Foundation
@preconcurrency import CoreML
import CoreGraphics
import CoreImage
import CoreVideo
import ImageIO
import UniformTypeIdentifiers
import CryptoKit

private let modelId = "apple-mobileclip-s0-coreml-2024"
private let modelRevision = "55c8098c12ba8f928e37e26b2e1dd097777c3f98"
private let imageWeightHash = "87d8f63997bbd2f38ba7defeaaa2c571928bdece56aa9629542198b3ce906ed6"
private let textWeightHash = "34723e51445b2630106e94e1fdbebed80e7676b404fb839f4eb9bec97bdcad68"
private let expectedGroups = ["bottle", "jar", "box", "bag", "cup", "other-battery", "other-phone", "other-book", "other-food", "other-person", "other-animal", "other-leaf", "other-clothes", "other-electronics", "other-tools", "other-plate", "other-aerosol", "other-drink-can"]
private func hash(_ data: Data) -> String { SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined() }

struct PromptGroup: Codable { let identifier: String; let role: String; let prompts: [String] }
struct PromptPolicy: Codable {
  let schemaVersion: String
  let policy: String
  let frozenBeforeImageInference: Bool
  let purpose: String
  let groups: [PromptGroup]
}
struct PrototypeGroup: Codable { let group: String; let role: String; let embedding: [Double] }
struct PrototypePolicy: Codable {
  let schemaVersion: String
  let modelId: String
  let modelRevision: String
  let imageWeightSha256: String
  let textWeightSha256: String
  let promptPolicy: String
  let promptsSha256: String
  let tokenizerPolicy: String
  let preprocessing: String
  let computeUnits: String
  let groups: [PrototypeGroup]
}
struct GroupScore: Codable { let group: String; let cosine: Double }
struct ClipObservation: Encodable {
  let schemaVersion = "mobileclip-s0-scores-v1"
  let modelId: String
  let modelRevision: String
  let imageWeightSha256: String
  let prototypesSha256: String
  let promptPolicy: String
  let promptsSha256: String
  let preprocessing: String
  let computeUnits: String
  let osVersion: String
  let durationMs: Int
  let embeddingNorm: Double
  let scores: [GroupScore]
}

private func workURL(_ value: String, directory: Bool) throws -> URL {
  guard !value.contains("://") else { throw MobileClipFailure.invalidPath }
  let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent("work").resolvingSymlinksInPath().standardizedFileURL
  let url = URL(fileURLWithPath: value, relativeTo: URL(fileURLWithPath: FileManager.default.currentDirectoryPath)).standardizedFileURL
  guard url.path.hasPrefix(root.path + "/"), url.resolvingSymlinksInPath() == url else { throw MobileClipFailure.invalidPath }
  let values = try url.resourceValues(forKeys: [.isDirectoryKey, .isRegularFileKey, .isSymbolicLinkKey])
  guard values.isSymbolicLink != true,
        directory ? values.isDirectory == true : values.isRegularFile == true else { throw MobileClipFailure.invalidPath }
  return url
}
private func newOutput(_ value: String) throws -> URL {
  let url = URL(fileURLWithPath: value, relativeTo: URL(fileURLWithPath: FileManager.default.currentDirectoryPath)).standardizedFileURL
  _ = try workURL(url.deletingLastPathComponent().path, directory: true)
  guard !FileManager.default.fileExists(atPath: url.path), url.pathExtension == "json" else { throw MobileClipFailure.invalidPath }
  return url
}
private func model(_ compiled: URL, text: Bool) throws -> MLModel {
  let expected = text ? "mobileclip_s0_text.mlmodelc" : "mobileclip_s0_image.mlmodelc"
  let url = compiled.lastPathComponent == expected ? compiled : compiled.appendingPathComponent(expected)
  _ = try workURL(url.path, directory: true)
  let config = MLModelConfiguration()
  config.computeUnits = .cpuOnly
  let loaded = try MLModel(contentsOf: url, configuration: config)
  let inputs = loaded.modelDescription.inputDescriptionsByName
  guard inputs.count == 1, inputs[text ? "text" : "image"] != nil,
        loaded.modelDescription.outputDescriptionsByName["final_emb_1"]?.type == .multiArray else { throw MobileClipFailure.invalidModel }
  return loaded
}
private func vector(_ array: MLMultiArray) throws -> [Double] {
  guard array.count == 512, [.float16, .float32, .double].contains(array.dataType) else { throw MobileClipFailure.invalidModel }
  let values = (0..<array.count).map { array[$0].doubleValue }
  guard values.allSatisfy(\.isFinite) else { throw MobileClipFailure.processingFailed }
  return try normalized(values)
}
private func normalized(_ values: [Double]) throws -> [Double] {
  let length = sqrt(values.reduce(0) { $0 + $1 * $1 })
  guard values.count == 512, length.isFinite, length > 0.000_001 else { throw MobileClipFailure.processingFailed }
  return values.map { $0 / length }
}
private func prompts() throws -> (PromptPolicy, Data) {
  let url = URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent("scripts/qa/local-vision/mobileclip-prompts.json")
  let data = try boundedData(url, maximum: 30_000)
  let policy = try JSONDecoder().decode(PromptPolicy.self, from: data)
  guard policy.schemaVersion == "mobileclip-prompts-v1", policy.policy == "packaging-visible-form-v1", policy.frozenBeforeImageInference,
        policy.groups.map(\.identifier) == expectedGroups,
        policy.groups.enumerated().allSatisfy({ index, group in group.role == (index < 5 ? "supported" : "outside") && group.prompts.count == (index < 5 ? 3 : 1) }) else { throw MobileClipFailure.invalidPrompt }
  return (policy, data)
}
private func prepare(assets: URL, compiled: URL, output: URL) throws {
  let imageBytes = try boundedData(assets.appendingPathComponent("mobileclip_s0_image.mlpackage/Data/com.apple.CoreML/weights/weight.bin"), maximum: 23_000_000)
  let textBytes = try boundedData(assets.appendingPathComponent("mobileclip_s0_text.mlpackage/Data/com.apple.CoreML/weights/weight.bin"), maximum: 85_000_000)
  guard hash(imageBytes) == imageWeightHash, hash(textBytes) == textWeightHash else { throw MobileClipFailure.invalidAssets }
  let tokenizer = try MobileClipTokenizer(assets: assets)
  let (policy, raw) = try prompts()
  // Validate all prompts before the first text-model invocation, never discard tokens.
  let encoded = try policy.groups.map { group in try group.prompts.map { try tokenizer.encode($0) } }
  let textModel = try model(compiled, text: true)
  var groups: [PrototypeGroup] = []
  for (index, group) in policy.groups.enumerated() {
    var sum = Array(repeating: 0.0, count: 512)
    for tokens in encoded[index] {
      let input = try MLMultiArray(shape: [1, 77], dataType: .int32)
      for (position, token) in tokens.enumerated() { input[position] = NSNumber(value: token) }
      guard textModel.modelDescription.inputDescriptionsByName["text"]?.isAllowedValue(MLFeatureValue(multiArray: input)) == true else { throw MobileClipFailure.invalidModel }
      let result = try textModel.prediction(from: MLDictionaryFeatureProvider(dictionary: ["text": input]))
      guard let array = result.featureValue(for: "final_emb_1")?.multiArrayValue else { throw MobileClipFailure.invalidModel }
      let embedding = try vector(array)
      for position in 0..<512 { sum[position] += embedding[position] }
    }
    groups.append(PrototypeGroup(group: group.identifier, role: group.role, embedding: try normalized(sum)))
  }
  let result = PrototypePolicy(schemaVersion: "mobileclip-prototypes-v1", modelId: modelId, modelRevision: modelRevision, imageWeightSha256: imageWeightHash, textWeightSha256: textWeightHash, promptPolicy: policy.policy, promptsSha256: hash(raw), tokenizerPolicy: "clip-ascii-bpe-49408-v1", preprocessing: "center-square-256-srgb-v1", computeUnits: "cpuOnly", groups: groups)
  let encoder = JSONEncoder(); encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
  try encoder.encode(result).write(to: output, options: .withoutOverwriting)
  emit(["status": "prepared", "groups": groups.count, "textCalls": 28, "imageCalls": 0])
}
private func pixels(_ base64: String, pixelFormat: OSType) throws -> CVPixelBuffer {
  guard !base64.isEmpty, base64.utf8.count <= 2_000_000,
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
        let cgImage = CGImageSourceCreateImageAtIndex(source, 0, nil) else { throw MobileClipFailure.invalidImage }
  let orientation = (properties[kCGImagePropertyOrientation] as? Int32) ?? 1
  guard (1...8).contains(orientation) else { throw MobileClipFailure.invalidImage }
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
        let buffer else { throw MobileClipFailure.processingFailed }
  let colour = CGColorSpace(name: CGColorSpace.sRGB)!
  CIContext(options: [.workingColorSpace: colour, .outputColorSpace: colour]).render(image, to: buffer, bounds: CGRect(x: 0, y: 0, width: 256, height: 256), colorSpace: colour)
  return buffer
}
private func observe(compiled: URL, prototypeURL: URL) throws {
  let raw = try boundedData(prototypeURL, maximum: 1_000_000)
  let prototype = try JSONDecoder().decode(PrototypePolicy.self, from: raw)
  guard prototype.schemaVersion == "mobileclip-prototypes-v1", prototype.modelId == modelId,
        prototype.modelRevision == modelRevision, prototype.imageWeightSha256 == imageWeightHash,
        prototype.textWeightSha256 == textWeightHash,
        prototype.tokenizerPolicy == "clip-ascii-bpe-49408-v1", prototype.preprocessing == "center-square-256-srgb-v1",
        prototype.computeUnits == "cpuOnly", prototype.promptPolicy == "packaging-visible-form-v1",
        prototype.groups.map(\.group) == expectedGroups else { throw MobileClipFailure.invalidPrototype }
  for (index, group) in prototype.groups.enumerated() {
    let length = sqrt(group.embedding.reduce(0) { $0 + $1 * $1 })
    guard group.role == (index < 5 ? "supported" : "outside"), group.embedding.count == 512,
          group.embedding.allSatisfy(\.isFinite), abs(length - 1) < 0.000_01 else { throw MobileClipFailure.invalidPrototype }
  }
  var input = Data()
  while let chunk = try FileHandle.standardInput.read(upToCount: min(65_536, 2_000_001 - input.count)), !chunk.isEmpty {
    input.append(chunk)
    guard input.count <= 2_000_000 else { throw MobileClipFailure.invalidImage }
  }
  guard let base64 = String(data: input, encoding: .utf8) else { throw MobileClipFailure.invalidImage }
  let start = ProcessInfo.processInfo.systemUptime
  let imageModel = try model(compiled, text: false)
  guard let feature = imageModel.modelDescription.inputDescriptionsByName["image"],
        let constraint = feature.imageConstraint, constraint.pixelsWide == 256,
        constraint.pixelsHigh == 256 else { throw MobileClipFailure.invalidModel }
  let image = try pixels(base64, pixelFormat: constraint.pixelFormatType)
  let value = MLFeatureValue(pixelBuffer: image)
  guard feature.isAllowedValue(value) else { throw MobileClipFailure.invalidImage }
  let result = try imageModel.prediction(from: MLDictionaryFeatureProvider(dictionary: ["image": value]))
  guard let array = result.featureValue(for: "final_emb_1")?.multiArrayValue else { throw MobileClipFailure.invalidModel }
  let embedding = try vector(array)
  let scores = prototype.groups.map { group in GroupScore(group: group.group, cosine: zip(embedding, group.embedding).reduce(0) { $0 + $1.0 * $1.1 }) }
  guard scores.allSatisfy({ $0.cosine.isFinite && $0.cosine >= -1.000_001 && $0.cosine <= 1.000_001 }) else { throw MobileClipFailure.processingFailed }
  let version = ProcessInfo.processInfo.operatingSystemVersion
  let resultValue = ClipObservation(modelId: modelId, modelRevision: modelRevision, imageWeightSha256: imageWeightHash, prototypesSha256: hash(raw), promptPolicy: prototype.promptPolicy, promptsSha256: prototype.promptsSha256, preprocessing: prototype.preprocessing, computeUnits: "cpuOnly", osVersion: "\(version.majorVersion).\(version.minorVersion).\(version.patchVersion)", durationMs: max(0, Int((ProcessInfo.processInfo.systemUptime - start) * 1_000)), embeddingNorm: sqrt(embedding.reduce(0) { $0 + $1 * $1 }), scores: scores)
  FileHandle.standardOutput.write(try JSONEncoder().encode(resultValue)); FileHandle.standardOutput.write(Data([10]))
}
private func emit(_ value: [String: Any]) { if let data = try? JSONSerialization.data(withJSONObject: value, options: [.sortedKeys]) { FileHandle.standardOutput.write(data); FileHandle.standardOutput.write(Data([10])) } }

@main struct MobileClipQA {
  static func main() {
    do {
      let args = Array(CommandLine.arguments.dropFirst())
      if args.count == 4, args[0] == "--prepare" {
        try prepare(assets: workURL(args[1], directory: true), compiled: workURL(args[2], directory: true), output: newOutput(args[3]))
      } else if args.count == 5, args[0] == "--prototypes" {
        let expectedPrompt = URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent("scripts/qa/local-vision/mobileclip-prompts.json").standardizedFileURL
        let suppliedPrompt = URL(fileURLWithPath: args[3], relativeTo: URL(fileURLWithPath: FileManager.default.currentDirectoryPath)).standardizedFileURL
        guard suppliedPrompt == expectedPrompt else { throw MobileClipFailure.invalidPrompt }
        try prepare(assets: workURL(args[2], directory: true), compiled: workURL(args[1], directory: true), output: newOutput(args[4]))
      } else if args.count == 3, ["--image-stdin", "--score"].contains(args[0]) {
        try observe(compiled: workURL(args[1], directory: true), prototypeURL: workURL(args[2], directory: false))
      } else if args.count == 2, args[0] == "--self-test" {
        let tokenizer = try MobileClipTokenizer(assets: workURL(args[1], directory: true))
        let known = try tokenizer.encode("a photo of a bottle")
        guard known.prefix(5) == [49_406, 320, 1125, 539, 320], known.contains(49_407) else { throw MobileClipFailure.invalidAssets }
        let aerosol = try tokenizer.encode("a photo of an aerosol spray can")
        guard aerosol.filter({ $0 != 0 }).count > 8 else { throw MobileClipFailure.invalidAssets }
        for bad in ["", "photo\nsecret", "pulloä", "<|endoftext|>", String(repeating: "a ", count: 80)] {
          do { _ = try tokenizer.encode(bad); throw MobileClipFailure.processingFailed }
          catch MobileClipFailure.invalidPrompt { }
        }
        emit(["status": "passed", "tests": 7, "imageCalls": 0, "textCalls": 0, "aerosolTokens": aerosol.filter { $0 != 0 }])
      } else { throw MobileClipFailure.invalidArguments }
    } catch let error as MobileClipFailure { emit(["status": "unavailable", "reason": error.rawValue]); exit(1) }
      catch { emit(["status": "unavailable", "reason": "processing_failed"]); exit(1) }
  }
}
