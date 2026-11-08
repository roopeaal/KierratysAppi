// QA-only foreground subjects. A subject is not a verified physical-object count.
// No image path/reference label, network, material, identity or sorting answer.
import Foundation
@preconcurrency import CoreML
import CoreGraphics
import CoreImage
import CoreVideo
import ImageIO
import UniformTypeIdentifiers
import CryptoKit
@preconcurrency import Vision

private enum ForegroundFailure: String, Error {
  case invalidArguments = "invalid_arguments", invalidPath = "invalid_path"
  case invalidAssets = "invalid_assets", invalidModel = "invalid_model"
  case invalidPrototype = "invalid_prototype", invalidImage = "invalid_image"
  case unsupportedPlatform = "unsupported_platform", maskUnavailable = "mask_unavailable"
  case tooManyInstances = "too_many_instances", invalidMask = "invalid_mask"
  case processingFailed = "processing_failed", timeout
}
private let modelId = "apple-mobileclip-s0-coreml-2024"
private let modelRevision = "55c8098c12ba8f928e37e26b2e1dd097777c3f98"
private let imageWeightHash = "87d8f63997bbd2f38ba7defeaaa2c571928bdece56aa9629542198b3ce906ed6"
private let textWeightHash = "34723e51445b2630106e94e1fdbebed80e7676b404fb839f4eb9bec97bdcad68"
private let graphHash = "858f2fc75c7d7b2fd182c1a13ae099a3f66c16ba1d0ea72375a0cdf6fe97b984"
private let prototypesHash = "0dfe73569d1b2177629d95c4bc21c1392be9228aff6809cab0ed1c3358893c81"
private let promptsHash = "aa726197e10fc1911b88bb6d6da099220339133c6e39e500f112b9077316e610"
private let preprocessing = "foreground-instance-aspect-fit-256-srgb-gray127-v1"
private let cropPolicy = "apple-selected-instance-crop-alpha-gray127-v1"
private let maskPolicy = "foreground-revision1-max4-logical12s-v1"
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
private struct InstanceObservation: Encodable {
  let instanceIndex: Int; let cropWidth: Int; let cropHeight: Int; let cropPixelFormat: UInt32
  let embeddingNorm: Double; let scores: [GroupScore]
}
private struct Counters: Encodable {
  var maskRequestsAttempted = 0; var maskRequestsCompleted = 0
  var maskedImagesAttempted = 0; var maskedImagesCompleted = 0
  var clipPredictionsAttempted = 0; var clipPredictionsCompleted = 0
}
private struct MaskInfo: Encodable {
  let width: Int; let height: Int; let bytesPerRow: Int; let pixelFormat: UInt32
  let encoding: String; let subjectInstanceIndices: [Int]; let observedMaskLabels: [Int]
}
private struct ForegroundObservation: Encodable {
  let schemaVersion = "mobileclip-foreground-scores-v1"
  let status = "observed"
  let modelId: String; let modelRevision: String; let imageWeightSha256: String
  let prototypesSha256: String; let promptPolicy: String; let promptsSha256: String
  let preprocessing: String; let cropPolicy: String; let maskPolicy: String
  let clipComputeUnits = "cpuOnly"; let maskComputeUnits = "vision_system_default"
  let maskRequestRevision = 1; let logicalDeadlineMs = 12_000
  let osVersion: String; let durationMs: Int; let orientedWidth: Int; let orientedHeight: Int
  let counters: Counters; let mask: MaskInfo; let instances: [InstanceObservation]
}
private struct Loaded {
  let model: MLModel; let imageFeature: MLFeatureDescription
  let constraint: MLImageConstraint; let prototypes: PrototypePolicy
}
/// Vision cancel is safe from the timer; synchronous Core ML is not preemptible.
/// Late model returns are discarded, never declared on-time successful results.
private final class Budget: @unchecked Sendable {
  let started = ProcessInfo.processInfo.systemUptime
  private let seconds: TimeInterval
  private let lock = NSLock()
  private var request: VNRequest?
  private var expired = false
  private let timer: DispatchSourceTimer
  init(seconds: TimeInterval = 12) {
    self.seconds = seconds
    timer = DispatchSource.makeTimerSource(queue: .global(qos: .utility))
    timer.schedule(deadline: .now() + seconds)
    timer.setEventHandler { [weak self] in self?.expire() }
    timer.resume()
  }
  private func expire() {
    lock.lock(); expired = true; let request = request; lock.unlock()
    request?.cancel()
  }
  func attach(_ request: VNRequest) {
    lock.lock(); self.request = request; let cancelled = expired; lock.unlock()
    if cancelled { request.cancel() }
  }
  func check() throws {
    lock.lock(); let expired = expired; lock.unlock()
    guard !expired, ProcessInfo.processInfo.systemUptime - started < seconds else { throw ForegroundFailure.timeout }
  }
  var isExpired: Bool {
    lock.lock(); let value = expired; lock.unlock()
    return value || ProcessInfo.processInfo.systemUptime - started >= seconds
  }
  func finish() {
    timer.setEventHandler {}; timer.cancel()
    lock.lock(); request = nil; lock.unlock()
  }
}
private func workURL(_ value: String, directory: Bool) throws -> URL {
  guard !value.contains("://") else { throw ForegroundFailure.invalidPath }
  let cwd = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
  let root = cwd.appendingPathComponent("work").resolvingSymlinksInPath().standardizedFileURL
  let url = URL(fileURLWithPath: value, relativeTo: cwd).standardizedFileURL
  guard url.path.hasPrefix(root.path + "/"), url.resolvingSymlinksInPath() == url else { throw ForegroundFailure.invalidPath }
  let values = try url.resourceValues(forKeys: [.isDirectoryKey, .isRegularFileKey, .isSymbolicLinkKey])
  guard values.isSymbolicLink != true,
        directory ? values.isDirectory == true : values.isRegularFile == true else { throw ForegroundFailure.invalidPath }
  return url
}
private func bytes(_ url: URL, maximum: Int) throws -> Data {
  _ = try workURL(url.path, directory: false)
  let values = try url.resourceValues(forKeys: [.fileSizeKey])
  guard let count = values.fileSize, count > 0, count <= maximum else { throw ForegroundFailure.invalidAssets }
  let data = try Data(contentsOf: url, options: .mappedIfSafe)
  guard data.count == count else { throw ForegroundFailure.invalidAssets }
  return data
}
private func load(modelURL: URL, prototypeURL: URL) throws -> Loaded {
  guard modelURL.lastPathComponent == "mobileclip_s0_image.mlmodelc" else { throw ForegroundFailure.invalidModel }
  guard sha256(try bytes(modelURL.appendingPathComponent("weights/weight.bin"), maximum: 22_717_696)) == imageWeightHash,
        sha256(try bytes(modelURL.appendingPathComponent("model.mil"), maximum: 500_000)) == graphHash else { throw ForegroundFailure.invalidAssets }
  let raw = try bytes(prototypeURL, maximum: 1_000_000)
  guard sha256(raw) == prototypesHash else { throw ForegroundFailure.invalidPrototype }
  let proto = try JSONDecoder().decode(PrototypePolicy.self, from: raw)
  guard proto.schemaVersion == "mobileclip-prototypes-v1", proto.modelId == modelId,
        proto.modelRevision == modelRevision, proto.imageWeightSha256 == imageWeightHash,
        proto.textWeightSha256 == textWeightHash, proto.promptsSha256 == promptsHash,
        proto.tokenizerPolicy == "clip-ascii-bpe-49408-v1", proto.preprocessing == "center-square-256-srgb-v1",
        proto.computeUnits == "cpuOnly", proto.promptPolicy == "packaging-visible-form-v1",
        proto.groups.map(\.group) == expectedGroups else { throw ForegroundFailure.invalidPrototype }
  for (index, group) in proto.groups.enumerated() {
    let norm = sqrt(group.embedding.reduce(0) { $0 + $1 * $1 })
    guard group.role == (index < 5 ? "supported" : "outside"), group.embedding.count == 512,
          group.embedding.allSatisfy(\.isFinite), abs(norm - 1) < 0.000_01 else { throw ForegroundFailure.invalidPrototype }
  }
  let config = MLModelConfiguration(); config.computeUnits = .cpuOnly
  let model = try MLModel(contentsOf: modelURL, configuration: config)
  guard model.modelDescription.inputDescriptionsByName.count == 1,
        let feature = model.modelDescription.inputDescriptionsByName["image"],
        let constraint = feature.imageConstraint, constraint.pixelsWide == 256, constraint.pixelsHigh == 256,
        [kCVPixelFormatType_32ARGB, kCVPixelFormatType_32BGRA].contains(constraint.pixelFormatType),
        model.modelDescription.outputDescriptionsByName.count == 1,
        model.modelDescription.outputDescriptionsByName["final_emb_1"]?.type == .multiArray else { throw ForegroundFailure.invalidModel }
  return Loaded(model: model, imageFeature: feature, constraint: constraint, prototypes: proto)
}
private func fitGeometry(_ extent: CGRect) throws -> (scale: CGFloat, x: CGFloat, y: CGFloat) {
  guard [extent.minX, extent.minY, extent.width, extent.height].allSatisfy(\.isFinite),
        extent.width > 0, extent.height > 0 else { throw ForegroundFailure.invalidImage }
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
        cgImage.width == width, cgImage.height == height else { throw ForegroundFailure.invalidImage }
  let orientation = (properties[kCGImagePropertyOrientation] as? Int32) ?? 1
  guard (1...8).contains(orientation) else { throw ForegroundFailure.invalidImage }
  let image = CIImage(cgImage: cgImage).oriented(forExifOrientation: orientation)
  return image.transformed(by: CGAffineTransform(translationX: -image.extent.minX, y: -image.extent.minY))
}
private func readInput() throws -> Data {
  var input = Data()
  while let chunk = try FileHandle.standardInput.read(upToCount: min(65_536, 2_000_001 - input.count)), !chunk.isEmpty {
    input.append(chunk); guard input.count <= 2_000_000 else { throw ForegroundFailure.invalidImage }
  }
  return input
}
private func scanMask(_ mask: CVPixelBuffer, indices: IndexSet, budget: Budget, allowEmpty: Bool = false) throws -> MaskInfo {
  guard (allowEmpty || !indices.isEmpty), indices.count <= 4, !indices.contains(0) else { throw ForegroundFailure.invalidMask }
  let width = CVPixelBufferGetWidth(mask), height = CVPixelBufferGetHeight(mask), row = CVPixelBufferGetBytesPerRow(mask)
  let format = CVPixelBufferGetPixelFormatType(mask)
  guard !CVPixelBufferIsPlanar(mask), width > 0, height > 0, width <= 4096, height <= 4096,
        width * height <= 16_000_000 else { throw ForegroundFailure.invalidMask }
  let stride: Int, maximum: Int, encoding: String
  if format == kCVPixelFormatType_OneComponent8 { stride = 1; maximum = 255; encoding = "uint8_instance_labels" }
  else if format == kCVPixelFormatType_OneComponent32Float { stride = 4; maximum = 65_535; encoding = "float32_integer_instance_labels" }
  else { throw ForegroundFailure.invalidMask }
  let dataBytes = CVPixelBufferGetDataSize(mask)
  guard dataBytes > 0, dataBytes <= 70_000_000, row > 0, row <= dataBytes / height,
        indices.allSatisfy({ $0 > 0 && $0 <= maximum }), row >= width * stride,
        CVPixelBufferLockBaseAddress(mask, .readOnly) == kCVReturnSuccess else { throw ForegroundFailure.invalidMask }
  defer { CVPixelBufferUnlockBaseAddress(mask, .readOnly) }
  guard let base = CVPixelBufferGetBaseAddress(mask) else { throw ForegroundFailure.invalidMask }
  var observed = Set<Int>()
  for y in 0..<height {
    try budget.check()
    let pointer = base.advanced(by: y * row)
    for x in 0..<width {
      let label: Int
      if stride == 1 { label = Int(pointer.load(fromByteOffset: x, as: UInt8.self)) }
      else {
        let value = pointer.load(fromByteOffset: x * 4, as: Float.self)
        guard value.isFinite, value >= 0, value <= Float(maximum), value.rounded(.towardZero) == value else { throw ForegroundFailure.invalidMask }
        label = Int(value)
      }
      if label != 0 { guard indices.contains(label) else { throw ForegroundFailure.invalidMask }; observed.insert(label) }
    }
  }
  guard observed == Set(indices) else { throw ForegroundFailure.invalidMask }
  return MaskInfo(width: width, height: height, bytesPerRow: row, pixelFormat: format,
    encoding: encoding, subjectInstanceIndices: Array(indices), observedMaskLabels: observed.sorted())
}
private func predict(_ loaded: Loaded, image: CIImage, context: CIContext, colour: CGColorSpace,
                     background: CIImage, budget: Budget, counters: inout Counters) throws -> (Double, [GroupScore]) {
  try budget.check()
  let rect = image.extent, fit = try fitGeometry(rect)
  let positioned = image.transformed(by: CGAffineTransform(translationX: -rect.minX, y: -rect.minY))
    .transformed(by: CGAffineTransform(scaleX: fit.scale, y: fit.scale))
    .transformed(by: CGAffineTransform(translationX: fit.x, y: fit.y))
  let frame = positioned.composited(over: background).cropped(to: canvas)
  var resultBuffer: CVPixelBuffer?
  guard CVPixelBufferCreate(nil, 256, 256, loaded.constraint.pixelFormatType, nil, &resultBuffer) == kCVReturnSuccess,
        let buffer = resultBuffer else { throw ForegroundFailure.processingFailed }
  context.render(frame, to: buffer, bounds: canvas, colorSpace: colour)
  let feature = MLFeatureValue(pixelBuffer: buffer)
  guard loaded.imageFeature.isAllowedValue(feature) else { throw ForegroundFailure.invalidImage }
  try budget.check(); counters.clipPredictionsAttempted += 1
  let output = try loaded.model.prediction(from: MLDictionaryFeatureProvider(dictionary: ["image": feature]))
  counters.clipPredictionsCompleted += 1; try budget.check()
  guard let array = output.featureValue(for: "final_emb_1")?.multiArrayValue,
        array.count == 512, [.float16, .float32, .double].contains(array.dataType) else { throw ForegroundFailure.invalidModel }
  let raw = (0..<512).map { array[$0].doubleValue }, norm = sqrt(raw.reduce(0) { $0 + $1 * $1 })
  guard raw.allSatisfy(\.isFinite), norm.isFinite, norm > 0.000_001 else { throw ForegroundFailure.processingFailed }
  let embedding = raw.map { $0 / norm }
  let scores = try loaded.prototypes.groups.map { group -> GroupScore in
    let cosine = zip(embedding, group.embedding).reduce(0) { $0 + $1.0 * $1.1 }
    guard cosine.isFinite, cosine >= -1.000_001, cosine <= 1.000_001 else { throw ForegroundFailure.processingFailed }
    return GroupScore(group: group.group, cosine: min(1, max(-1, cosine)))
  }
  return (sqrt(embedding.reduce(0) { $0 + $1 * $1 }), scores)
}
@available(macOS 14.0, *)
private func observe(_ loaded: Loaded, budget: Budget, counters: inout Counters) throws {
  let image = try decode(readInput()); try budget.check()
  guard let colour = CGColorSpace(name: CGColorSpace.sRGB),
        let gray = CGColor(colorSpace: colour, components: [127.0 / 255, 127.0 / 255, 127.0 / 255, 1]) else { throw ForegroundFailure.processingFailed }
  let background = CIImage(color: CIColor(cgColor: gray)).cropped(to: canvas)
  let context = CIContext(options: [.workingColorSpace: colour, .outputColorSpace: colour, .cacheIntermediates: false])
  defer { context.clearCaches() } // Not a cryptographic framework-buffer wipe.
  guard let oriented = context.createCGImage(image, from: image.extent, format: .RGBA8, colorSpace: colour) else { throw ForegroundFailure.processingFailed }
  let handler = VNImageRequestHandler(cgImage: oriented, orientation: .up, options: [:])
  let request = VNGenerateForegroundInstanceMaskRequest(); request.revision = VNGenerateForegroundInstanceMaskRequestRevision1
  guard VNGenerateForegroundInstanceMaskRequest.supportedRevisions.contains(request.revision) else { throw ForegroundFailure.maskUnavailable }
  budget.attach(request); try budget.check(); counters.maskRequestsAttempted += 1
  try handler.perform([request]); counters.maskRequestsCompleted += 1; try budget.check()
  guard let results = request.results, results.count == 1, let result = results.first else { throw ForegroundFailure.maskUnavailable }
  let indices = result.allInstances
  guard !indices.isEmpty else { throw ForegroundFailure.maskUnavailable }
  guard indices.count <= 4 else { throw ForegroundFailure.tooManyInstances }
  let maskInfo = try scanMask(result.instanceMask, indices: indices, budget: budget)
  let observations = try indices.map { index -> InstanceObservation in
    try budget.check(); counters.maskedImagesAttempted += 1
    let crop = try result.generateMaskedImage(ofInstances: IndexSet(integer: index), from: handler, croppedToInstancesExtent: true)
    counters.maskedImagesCompleted += 1; try budget.check()
    let width = CVPixelBufferGetWidth(crop), height = CVPixelBufferGetHeight(crop), format = CVPixelBufferGetPixelFormatType(crop)
    guard !CVPixelBufferIsPlanar(crop), width > 0, height > 0, width <= oriented.width, height <= oriented.height,
          [kCVPixelFormatType_32BGRA, kCVPixelFormatType_32ARGB].contains(format),
          CVPixelBufferGetBytesPerRow(crop) >= width * 4 else { throw ForegroundFailure.invalidMask }
    let (norm, scores) = try predict(loaded, image: CIImage(cvPixelBuffer: crop), context: context,
      colour: colour, background: background, budget: budget, counters: &counters)
    return InstanceObservation(instanceIndex: index, cropWidth: width, cropHeight: height,
      cropPixelFormat: format, embeddingNorm: norm, scores: scores)
  }
  try budget.check()
  let version = ProcessInfo.processInfo.operatingSystemVersion
  let observation = ForegroundObservation(modelId: modelId, modelRevision: modelRevision, imageWeightSha256: imageWeightHash,
    prototypesSha256: prototypesHash, promptPolicy: loaded.prototypes.promptPolicy, promptsSha256: promptsHash,
    preprocessing: preprocessing, cropPolicy: cropPolicy, maskPolicy: maskPolicy,
    osVersion: "\(version.majorVersion).\(version.minorVersion).\(version.patchVersion)",
    durationMs: max(0, Int((ProcessInfo.processInfo.systemUptime - budget.started) * 1_000)),
    orientedWidth: oriented.width, orientedHeight: oriented.height, counters: counters, mask: maskInfo, instances: observations)
  FileHandle.standardOutput.write(try JSONEncoder().encode(observation)); FileHandle.standardOutput.write(Data([10]))
}
private func emit(_ value: [String: Any]) {
  if let data = try? JSONSerialization.data(withJSONObject: value, options: [.sortedKeys]) { FileHandle.standardOutput.write(data); FileHandle.standardOutput.write(Data([10])) }
}
/// One registered owned uniform-image interface probe, not reference/quality data.
@available(macOS 14.0, *)
private func interfaceProbe(budget: Budget, counters: inout Counters) throws {
  guard let colour = CGColorSpace(name: CGColorSpace.sRGB),
        let drawing = CGContext(data: nil, width: 512, height: 512, bitsPerComponent: 8,
          bytesPerRow: 512 * 4, space: colour, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else {
    throw ForegroundFailure.processingFailed
  }
  drawing.setFillColor(red: 127.0 / 255, green: 127.0 / 255, blue: 127.0 / 255, alpha: 1)
  drawing.fill(CGRect(x: 0, y: 0, width: 512, height: 512))
  guard let image = drawing.makeImage() else { throw ForegroundFailure.processingFailed }
  let handler = VNImageRequestHandler(cgImage: image, orientation: .up, options: [:])
  let request = VNGenerateForegroundInstanceMaskRequest()
  request.revision = VNGenerateForegroundInstanceMaskRequestRevision1
  guard VNGenerateForegroundInstanceMaskRequest.supportedRevisions.contains(request.revision) else {
    throw ForegroundFailure.maskUnavailable
  }
  budget.attach(request); try budget.check(); counters.maskRequestsAttempted += 1
  try handler.perform([request]); counters.maskRequestsCompleted += 1; try budget.check()
  let results = request.results ?? []
  guard results.count <= 1 else { throw ForegroundFailure.invalidMask }
  var mask: Any = NSNull()
  var count = 0
  if let result = results.first {
    let info = try scanMask(result.instanceMask, indices: result.allInstances, budget: budget, allowEmpty: true)
    count = result.allInstances.count
    mask = try JSONSerialization.jsonObject(with: JSONEncoder().encode(info))
  }
  try budget.check()
  emit(["schemaVersion": "foreground-interface-probe-v1", "status": "completed",
    "purpose": "owned_uniform_rgb512_interface_only_not_accuracy", "maskRequestRevision": 1,
    "maskComputeUnits": "vision_system_default", "outcome": count == 0 ? "no_subjects" : "subjects_observed",
    "subjectCount": count, "mask": mask, "maskRequestsAttempted": counters.maskRequestsAttempted,
    "maskRequestsCompleted": counters.maskRequestsCompleted, "clipPredictions": 0,
    "durationMs": max(0, Int((ProcessInfo.processInfo.systemUptime - budget.started) * 1_000))])
}
private func selfTest() throws {
  var tests = 0
  for (w, h, scale, x, y) in [(256.0, 256.0, 1.0, 0.0, 0.0), (512, 256, 0.5, 0, 64), (256, 512, 0.5, 64, 0), (100, 400, 0.64, 96, 0)] {
    let fit = try fitGeometry(CGRect(x: 11, y: -7, width: w, height: h))
    guard abs(fit.scale - scale) < 0.000_001, abs(fit.x - x) < 0.000_001, abs(fit.y - y) < 0.000_001 else { throw ForegroundFailure.processingFailed }; tests += 1
  }
  for input in [Data(), Data("not-base64".utf8), Data("AA==\n".utf8), Data("/9j/2Q==".utf8)] {
    do { _ = try decode(input); throw ForegroundFailure.processingFailed } catch ForegroundFailure.invalidImage { tests += 1 }
  }
  let budget = Budget(); defer { budget.finish() }
  var pointer: CVPixelBuffer?
  guard CVPixelBufferCreate(nil, 4, 2, kCVPixelFormatType_OneComponent8, nil, &pointer) == kCVReturnSuccess, let mask = pointer,
        CVPixelBufferLockBaseAddress(mask, []) == kCVReturnSuccess, let base = CVPixelBufferGetBaseAddress(mask) else { throw ForegroundFailure.processingFailed }
  let row = CVPixelBufferGetBytesPerRow(mask)
  for y in 0..<2 { for x in 0..<4 { base.storeBytes(of: UInt8(x == 1 ? 2 : x == 2 ? 4 : 0), toByteOffset: y * row + x, as: UInt8.self) } }
  CVPixelBufferUnlockBaseAddress(mask, [])
  let info = try scanMask(mask, indices: IndexSet([2, 4]), budget: budget)
  guard info.observedMaskLabels == [2, 4], info.subjectInstanceIndices == [2, 4] else { throw ForegroundFailure.processingFailed }; tests += 1
  for indices in [IndexSet(), IndexSet([0, 2]), IndexSet([2]), IndexSet([2, 4, 7]), IndexSet([1, 2, 3, 4, 5])] {
    do { _ = try scanMask(mask, indices: indices, budget: budget); throw ForegroundFailure.processingFailed } catch ForegroundFailure.invalidMask { tests += 1 }
  }
  let expired = Budget(seconds: 0); defer { expired.finish() }
  do { try expired.check(); throw ForegroundFailure.processingFailed } catch ForegroundFailure.timeout { tests += 1 }
  emit(["status": "passed", "tests": tests, "maskRequests": 0, "clipPredictions": 0, "textCalls": 0, "preprocessing": preprocessing])
}
@main private struct ForegroundQA {
  static func main() {
    var counters = Counters()
    let start = ProcessInfo.processInfo.systemUptime
    var activeBudget: Budget?
    let probing = Array(CommandLine.arguments.dropFirst()) == ["--interface-probe"]
    do {
      let args = Array(CommandLine.arguments.dropFirst())
      if args == ["--self-test"] { try selfTest(); return }
      if probing {
        guard #available(macOS 14.0, *) else { throw ForegroundFailure.unsupportedPlatform }
        let budget = Budget(); activeBudget = budget; defer { budget.finish() }
        try interfaceProbe(budget: budget, counters: &counters)
        return
      }
      guard args.count == 3, ["--score-foreground", "--preflight"].contains(args[0]) else { throw ForegroundFailure.invalidArguments }
      guard #available(macOS 14.0, *) else { throw ForegroundFailure.unsupportedPlatform }
      let budget = Budget(); activeBudget = budget; defer { budget.finish() }
      let loaded = try load(modelURL: workURL(args[1], directory: true), prototypeURL: workURL(args[2], directory: false)); try budget.check()
      guard VNGenerateForegroundInstanceMaskRequest.supportedRevisions.contains(1) else { throw ForegroundFailure.maskUnavailable }
      if args[0] == "--preflight" {
        emit(["status": "ready", "modelId": modelId, "modelRevision": modelRevision, "imageWeightSha256": imageWeightHash,
          "compiledGraphSha256": graphHash, "prototypesSha256": prototypesHash, "promptsSha256": promptsHash,
          "preprocessing": preprocessing, "cropPolicy": cropPolicy, "maskPolicy": maskPolicy, "maskRequestRevision": 1,
          "maskComputeUnits": "vision_system_default", "clipComputeUnits": "cpuOnly", "maskRequests": 0, "clipPredictions": 0])
      } else { try observe(loaded, budget: budget, counters: &counters) }
    } catch {
      emit(["schemaVersion": probing ? "foreground-interface-probe-v1" : "mobileclip-foreground-scores-v1", "status": "unavailable",
        "reason": activeBudget?.isExpired == true ? "timeout" : (error as? ForegroundFailure)?.rawValue ?? "processing_failed",
        "durationMs": max(0, Int((ProcessInfo.processInfo.systemUptime - start) * 1_000)),
        "counters": ["maskRequestsAttempted": counters.maskRequestsAttempted, "maskRequestsCompleted": counters.maskRequestsCompleted,
          "maskedImagesAttempted": counters.maskedImagesAttempted, "maskedImagesCompleted": counters.maskedImagesCompleted,
          "clipPredictionsAttempted": counters.clipPredictionsAttempted, "clipPredictionsCompleted": counters.clipPredictionsCompleted]])
      exit(1)
    }
  }
}
