import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers
@preconcurrency import Vision

enum LocalVisionFailure: String, Error {
  case busy
  case invalidImage = "invalid_image"
  case unavailable
  case failed
}

struct LocalVisionClassification: Encodable, Sendable {
  let identifier: String
  let score: Double
  let hasPrecisionRecallCurve: Bool
  let passesOperatingPoint: Bool
}

enum LocalVisionSupplementSkipReason: String, Encodable, Sendable {
  case primaryMatch = "primary_match"
  case primaryConflict = "primary_conflict"
}

enum LocalVisionSupplementFailureReason: String, Encodable, Sendable {
  case modelUnavailable = "model_unavailable"
  case processingFailed = "processing_failed"
}

enum LocalVisionSupplement: Encodable, Sendable {
  case skipped(LocalVisionSupplementSkipReason)
  case unavailable(LocalVisionSupplementFailureReason)
  case observed([LocalMobileClipScore])

  private enum CodingKeys: String, CodingKey {
    case status, reason, modelId, modelRevision, imageWeightSha256
    case prototypesSha256, promptsSha256, promptPolicy, preprocessing, computeUnits, scores
  }

  func encode(to encoder: Encoder) throws {
    var values = encoder.container(keyedBy: CodingKeys.self)
    switch self {
    case .skipped(let reason):
      try values.encode("skipped", forKey: .status)
      try values.encode(reason, forKey: .reason)
    case .unavailable(let reason):
      try values.encode("unavailable", forKey: .status)
      try values.encode(reason, forKey: .reason)
    case .observed(let scores):
      try values.encode("observed", forKey: .status)
      try values.encode(LocalMobileClipPredictor.modelId, forKey: .modelId)
      try values.encode(LocalMobileClipPredictor.modelRevision, forKey: .modelRevision)
      try values.encode(LocalMobileClipPredictor.imageWeightSha256, forKey: .imageWeightSha256)
      try values.encode(LocalMobileClipPredictor.prototypesSha256, forKey: .prototypesSha256)
      try values.encode(LocalMobileClipPredictor.promptsSha256, forKey: .promptsSha256)
      try values.encode(LocalMobileClipPredictor.promptPolicy, forKey: .promptPolicy)
      try values.encode(LocalMobileClipPredictor.preprocessing, forKey: .preprocessing)
      try values.encode(LocalMobileClipPredictor.computeUnitsName, forKey: .computeUnits)
      try values.encode(scores, forKey: .scores)
    }
  }
}

struct LocalVisionResult: Encodable, Sendable {
  let schemaVersion = "local-vision-v4"
  let engine = "apple-vision"
  let classificationPolicy = "apple-class-operating-point-v1"
  let minimumPrecision = 0.9
  let minimumRecall = 0.01
  let classificationRevision: Int
  let ocrRevision = 3
  let ocrPolicy = "material-code-lexicon-v1"
  let ocrLanguages: [String]
  let osVersion: String
  let observedAt: String
  let classifications: [LocalVisionClassification]
  let textLines: [String]
  let supplement: LocalVisionSupplement
  let durationMs: Int

  func bridgeValue() throws -> [String: Any] {
    let data = try JSONEncoder().encode(self)
    guard let value = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
      throw LocalVisionFailure.failed
    }
    return value
  }
}

enum LocalVisionReadinessPartialReason: String, Encodable, Sendable {
  case unsupportedModelPlatform = "unsupported_model_platform"
  case modelUnavailable = "model_unavailable"
}

enum LocalVisionReadinessFailureReason: String, Encodable, Sendable {
  case primaryUnavailable = "primary_unavailable"
  case busy, timeout
  case processingFailed = "processing_failed"
}

/// A no-image capability snapshot. This must never be described as an accuracy test.
enum LocalVisionReadiness: Encodable, Sendable {
  case full
  case primaryOnly(LocalVisionReadinessPartialReason)
  case unavailable(LocalVisionReadinessFailureReason)

  private enum CodingKeys: String, CodingKey {
    case schemaVersion, status, reason, evidence, modelId, modelRevision
    case imageWeightSha256, prototypesSha256, promptsSha256, promptPolicy, preprocessing, computeUnits
  }

  func encode(to encoder: Encoder) throws {
    var values = encoder.container(keyedBy: CodingKeys.self)
    try values.encode("local-vision-readiness-v1", forKey: .schemaVersion)
    switch self {
    case .full:
      try values.encode("full", forKey: .status)
      try values.encode("integrity_and_interface_only", forKey: .evidence)
      try values.encode(LocalMobileClipPredictor.modelId, forKey: .modelId)
      try values.encode(LocalMobileClipPredictor.modelRevision, forKey: .modelRevision)
      try values.encode(LocalMobileClipPredictor.imageWeightSha256, forKey: .imageWeightSha256)
      try values.encode(LocalMobileClipPredictor.prototypesSha256, forKey: .prototypesSha256)
      try values.encode(LocalMobileClipPredictor.promptsSha256, forKey: .promptsSha256)
      try values.encode(LocalMobileClipPredictor.promptPolicy, forKey: .promptPolicy)
      try values.encode(LocalMobileClipPredictor.preprocessing, forKey: .preprocessing)
      try values.encode(LocalMobileClipPredictor.computeUnitsName, forKey: .computeUnits)
    case .primaryOnly(let reason):
      try values.encode("primary_only", forKey: .status)
      try values.encode(reason, forKey: .reason)
      try values.encode("integrity_and_interface_only", forKey: .evidence)
    case .unavailable(let reason):
      try values.encode("unavailable", forKey: .status)
      try values.encode(reason, forKey: .reason)
    }
  }

  func bridgeValue() throws -> [String: Any] {
    let data = try JSONEncoder().encode(self)
    guard let value = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
      throw LocalVisionFailure.failed
    }
    return value
  }
}

/// Timeout resolves the caller once, but cannot release a still-running model load.
private final class LocalVisionReadinessDelivery: @unchecked Sendable {
  private let lock = NSLock()
  private var completion: (@Sendable (LocalVisionReadiness) -> Void)?

  init(_ completion: @escaping @Sendable (LocalVisionReadiness) -> Void) {
    self.completion = completion
  }

  func resolve(_ result: LocalVisionReadiness) {
    lock.lock()
    let callback = completion
    completion = nil
    lock.unlock()
    callback?(result)
  }
}

#if LOCAL_VISION_QA
private final class LocalVisionReadinessQARecorder: @unchecked Sendable {
  private let lock = NSLock()
  private var results: [LocalVisionReadiness] = []
  let signal = DispatchSemaphore(value: 0)

  func record(_ result: LocalVisionReadiness) {
    lock.lock()
    results.append(result)
    lock.unlock()
    signal.signal()
  }

  func snapshot() -> [LocalVisionReadiness] {
    lock.lock()
    defer { lock.unlock() }
    return results
  }
}
#endif

// VNRequest.cancel() is the only operation performed by the deadline queue.
// Request setup, perform and result reads remain on the serial worker.
private struct CancellableVisionRequests: @unchecked Sendable {
  let classifier: VNClassifyImageRequest
  let text: VNRecognizeTextRequest

  func cancel() {
    classifier.cancel()
    text.cancel()
  }
}

/// No networking, URLs, file writes, image history or model download.
/// Mutable state is protected by stateLock; inference runs off the JS/main thread.
final class LocalVisionEngine: @unchecked Sendable {
  static let shared = LocalVisionEngine()
  static let maxBytes = 1_500_000
  static let maxBase64Length = 2_000_000
  static let deadlineSeconds: TimeInterval = 12
  static let classificationIdentifiers = [
    "bottle", "wine_bottle", "jar", "carton", "cardboard_box", "paper_bag", "cup",
  ]
  // The finite material-code lexicon is not a brand/product dictionary. Outputs
  // remain untrusted OCR candidates and require independent user confirmation.
  static let materialCodeAbbreviations = [
    "PET", "HDPE", "PVC", "LDPE", "PP", "PS", "PAP", "FE", "ALU", "FOR", "COT", "TEX", "GL",
  ]

  private let stateLock = NSLock()
  private var inFlight = false
  private var supplementalPredictor = LocalMobileClipPredictor.shared
  private let worker = DispatchQueue(label: "fi.roopeaaltonen.kierratysappi.local-vision", qos: .userInitiated)

  private init() {}

  #if LOCAL_VISION_QA
  // CLI-only model-resource configuration; this API does not exist in the app build.
  func configureQAResources(_ url: URL) throws {
    stateLock.lock()
    defer { stateLock.unlock() }
    guard !inFlight else { throw LocalVisionFailure.busy }
    supplementalPredictor = LocalMobileClipPredictor(resourcesURL: url)
  }

  /// Tests the real worker/gate/deadline with a controlled no-image/no-model job.
  /// This hook and its alternate duration do not exist in shipping builds.
  static func readinessLifecycleSelfTest() -> [String]? {
    let engine = LocalVisionEngine()
    let entered = DispatchSemaphore(value: 0)
    let release = DispatchSemaphore(value: 0)
    defer { release.signal() }
    let slow = LocalVisionReadinessQARecorder()
    engine.enqueueReadiness(deadlineSeconds: 0.03, inspection: { _ in
      entered.signal()
      release.wait()
      return .full
    }, completion: slow.record)
    guard entered.wait(timeout: .now() + 2) == .success else { return nil }

    let busy = LocalVisionReadinessQARecorder()
    engine.inspectReadiness(completion: busy.record)
    guard case .unavailable(.busy)? = busy.snapshot().first else { return nil }
    let imageBusy = LocalVisionReadinessQARecorder()
    engine.recognize(jpegBase64: "YWJjZA==") { outcome in
      if case .failure(.busy) = outcome { imageBusy.record(.unavailable(.busy)) }
      else { imageBusy.record(.unavailable(.processingFailed)) }
    }
    guard case .unavailable(.busy)? = imageBusy.snapshot().first else { return nil }
    guard slow.signal.wait(timeout: .now() + 2) == .success,
          case .unavailable(.timeout)? = slow.snapshot().first else { return nil }

    let afterTimeout = LocalVisionReadinessQARecorder()
    engine.inspectReadiness(completion: afterTimeout.record)
    guard case .unavailable(.busy)? = afterTimeout.snapshot().first else { return nil }
    do {
      try engine.configureQAResources(URL(fileURLWithPath: "/unused-qa-only"))
      return nil
    } catch LocalVisionFailure.busy {} catch { return nil }
    release.signal()
    // Barrier waits for the original synchronous job, not merely its UI timeout.
    engine.worker.sync {}
    guard slow.snapshot().count == 1,
          case .unavailable(.timeout)? = slow.snapshot().first else { return nil }

    let retry = LocalVisionReadinessQARecorder()
    engine.enqueueReadiness(deadlineSeconds: 1, inspection: { _ in
      .primaryOnly(.modelUnavailable)
    }, completion: retry.record)
    guard retry.signal.wait(timeout: .now() + 2) == .success,
          case .primaryOnly(.modelUnavailable)? = retry.snapshot().first else { return nil }

    let once = LocalVisionReadinessQARecorder()
    let delivery = LocalVisionReadinessDelivery(once.record)
    delivery.resolve(.full)
    delivery.resolve(.unavailable(.timeout))
    guard once.snapshot().count == 1, case .full? = once.snapshot().first else { return nil }
    return [
      "pending_readiness_busy", "recognition_busy_before_deadline", "bounded_timeout",
      "gate_retained_after_timeout", "configuration_busy_after_timeout", "late_result_suppressed_once",
      "gate_released_after_actual_settle", "completion_delivered_once",
    ]
  }
  #endif

  func inspectReadiness(completion: @escaping @Sendable (LocalVisionReadiness) -> Void) {
    // Capture the predictor only while owning the shared gate. No work is done
    // on the caller/JS thread and no image request is created or performed.
    enqueueReadiness(deadlineSeconds: Self.deadlineSeconds, inspection: Self.inspectCapabilities,
                     completion: completion)
  }

  private func enqueueReadiness(
    deadlineSeconds: TimeInterval,
    inspection: @escaping @Sendable (LocalMobileClipPredictor) -> LocalVisionReadiness,
    completion: @escaping @Sendable (LocalVisionReadiness) -> Void
  ) {
    let started = ProcessInfo.processInfo.systemUptime
    stateLock.lock()
    guard !inFlight else {
      stateLock.unlock()
      completion(.unavailable(.busy))
      return
    }
    inFlight = true
    let predictor = supplementalPredictor
    stateLock.unlock()
    let delivery = LocalVisionReadinessDelivery(completion)
    let deadline = DispatchSource.makeTimerSource(queue: .global(qos: .utility))
    deadline.schedule(deadline: .now() + deadlineSeconds)
    deadline.setEventHandler { delivery.resolve(.unavailable(.timeout)) }
    deadline.resume()
    worker.async { [self] in
      let outcome = autoreleasepool { inspection(predictor) }
      let onTime = ProcessInfo.processInfo.systemUptime - started < deadlineSeconds
      deadline.setEventHandler {}
      deadline.cancel()
      // A timed-out synchronous Core ML load is not cancellable. Only its real
      // settlement releases the gate shared by readiness and image recognition.
      stateLock.lock()
      inFlight = false
      stateLock.unlock()
      delivery.resolve(onTime ? outcome : .unavailable(.timeout))
    }
  }

  private static func inspectCapabilities(predictor: LocalMobileClipPredictor) -> LocalVisionReadiness {
    do {
      let classifier = VNClassifyImageRequest()
      if #available(iOS 17.0, macOS 14.0, *) {
        classifier.revision = VNClassifyImageRequestRevision2
      } else {
        classifier.revision = VNClassifyImageRequestRevision1
      }
      let text = VNRecognizeTextRequest()
      text.revision = VNRecognizeTextRequestRevision3
      text.recognitionLevel = .accurate
      text.usesLanguageCorrection = true
      text.customWords = materialCodeAbbreviations
      text.automaticallyDetectsLanguage = false
      guard VNClassifyImageRequest.supportedRevisions.contains(classifier.revision),
            VNRecognizeTextRequest.supportedRevisions.contains(text.revision) else {
        return .unavailable(.primaryUnavailable)
      }
      let identifiers = Set(try classifier.supportedIdentifiers())
      guard classificationIdentifiers.allSatisfy({ identifiers.contains($0) }),
            try text.supportedRecognitionLanguages().contains("en-US") else {
        return .unavailable(.primaryUnavailable)
      }
    } catch {
      return .unavailable(.primaryUnavailable)
    }
    do {
      try predictor.inspectReadiness()
      return .full
    } catch LocalMobileClipFailure.unsupportedPlatform {
      return .primaryOnly(.unsupportedModelPlatform)
    } catch {
      return .primaryOnly(.modelUnavailable)
    }
  }

  func recognize(
    jpegBase64: String,
    completion: @escaping @Sendable (Result<LocalVisionResult, LocalVisionFailure>) -> Void
  ) {
    // Reject excessive input before retaining it in the worker queue.
    guard !jpegBase64.isEmpty, jpegBase64.utf8.count <= Self.maxBase64Length else {
      completion(.failure(.invalidImage))
      return
    }
    stateLock.lock()
    guard !inFlight else {
      stateLock.unlock()
      completion(.failure(.busy))
      return
    }
    inFlight = true
    let predictor = supplementalPredictor
    stateLock.unlock()

    worker.async { [self] in
      let outcome: Result<LocalVisionResult, LocalVisionFailure> = autoreleasepool {
        do {
          return .success(try Self.perform(jpegBase64: jpegBase64, predictor: predictor))
        } catch let failure as LocalVisionFailure {
          return .failure(failure)
        } catch {
          // Never forward library diagnostics, OCR, image data or device paths as errors.
          return .failure(.failed)
        }
      }
      stateLock.lock()
      inFlight = false
      stateLock.unlock()
      completion(outcome)
    }
  }

  private static func perform(jpegBase64: String, predictor: LocalMobileClipPredictor) throws -> LocalVisionResult {
    let start = ProcessInfo.processInfo.systemUptime
    let image = try decodeJPEG(jpegBase64: jpegBase64)
    let classifier = VNClassifyImageRequest()
    if #available(iOS 17.0, macOS 14.0, *) {
      classifier.revision = VNClassifyImageRequestRevision2
    } else {
      classifier.revision = VNClassifyImageRequestRevision1
    }
    let text = VNRecognizeTextRequest()
    text.revision = VNRecognizeTextRequestRevision3
    text.recognitionLevel = .accurate
    text.usesLanguageCorrection = true
    text.customWords = materialCodeAbbreviations
    text.automaticallyDetectsLanguage = false
    guard VNClassifyImageRequest.supportedRevisions.contains(classifier.revision),
          VNRecognizeTextRequest.supportedRevisions.contains(text.revision) else {
      throw LocalVisionFailure.unavailable
    }
    let supportedIdentifiers = Set(try classifier.supportedIdentifiers())
    guard classificationIdentifiers.allSatisfy({ supportedIdentifiers.contains($0) }) else {
      throw LocalVisionFailure.unavailable
    }
    let supportedLanguages = try text.supportedRecognitionLanguages()
    let languages = ["en-US"].filter { supportedLanguages.contains($0) }
    guard !languages.isEmpty else { throw LocalVisionFailure.unavailable }
    text.recognitionLanguages = languages

    let requests = CancellableVisionRequests(classifier: classifier, text: text)
    let deadline = DispatchSource.makeTimerSource(queue: .global(qos: .utility))
    deadline.schedule(deadline: .now() + deadlineSeconds)
    deadline.setEventHandler { requests.cancel() }
    deadline.resume()
    defer {
      deadline.setEventHandler {}
      deadline.cancel()
    }
    let handler = VNImageRequestHandler(cgImage: image.pixels, orientation: image.orientation, options: [:])
    try handler.perform([classifier, text])
    // cancel is best effort; the single-flight gate stays locked until perform really settles.
    guard ProcessInfo.processInfo.systemUptime - start < deadlineSeconds else {
      throw LocalVisionFailure.failed
    }

    // Vision is multi-label with a hierarchical taxonomy. Its independent scores
    // must not be ranked against different labels or treated as a softmax.
    // Apply Apple's per-class operating point, including every allowlisted label.
    var observations: [String: VNClassificationObservation] = [:]
    for observation in classifier.results ?? [] where classificationIdentifiers.contains(observation.identifier) {
      guard observations[observation.identifier] == nil else { throw LocalVisionFailure.failed }
      observations[observation.identifier] = observation
    }
    let classifications = try classificationIdentifiers.map { identifier -> LocalVisionClassification in
      guard let observation = observations[identifier] else {
        return LocalVisionClassification(identifier: identifier, score: 0, hasPrecisionRecallCurve: false, passesOperatingPoint: false)
      }
      let score = Double(observation.confidence)
      guard score.isFinite, score >= 0, score <= 1 else { throw LocalVisionFailure.failed }
      let hasCurve = observation.hasPrecisionRecallCurve
      return LocalVisionClassification(
        identifier: identifier,
        score: score,
        hasPrecisionRecallCurve: hasCurve,
        passesOperatingPoint: hasCurve && observation.hasMinimumRecall(0.01, forPrecision: 0.9)
      )
    }
    var seen = Set<String>()
    let lines = (text.results ?? []).compactMap { observation -> String? in
      guard let candidate = observation.topCandidates(1).first else { return nil }
      let line = candidate.string.trimmingCharacters(in: .whitespacesAndNewlines)
      guard !line.isEmpty, line.utf16.count <= 64,
            !line.unicodeScalars.contains(where: { $0.properties.generalCategory == .control || $0.properties.generalCategory == .format }),
            seen.insert(line).inserted else { return nil }
      return line
    }
    // A failed primary never reaches this point. Preserve a match or a conflict;
    // only a genuine no-match may ask the separate visible-form estimator.
    let supplement: LocalVisionSupplement
    if let reason = supplementalSkipReason(classifications) {
      supplement = .skipped(reason)
    } else {
      guard ProcessInfo.processInfo.systemUptime - start < deadlineSeconds else {
        throw LocalVisionFailure.failed
      }
      do {
        let scores = try predictor.predict(image: image.pixels, orientation: image.orientation)
        let groups = ["bottle", "jar", "box", "bag", "cup", "other-battery", "other-phone", "other-book", "other-food", "other-person", "other-animal", "other-leaf", "other-clothes", "other-electronics", "other-tools", "other-plate", "other-aerosol", "other-drink-can"]
        if scores.map(\.group) == groups,
           scores.allSatisfy({ $0.cosine.isFinite && $0.cosine >= -1 && $0.cosine <= 1 }) {
          supplement = .observed(scores)
        } else {
          supplement = .unavailable(.processingFailed)
        }
      } catch LocalMobileClipFailure.unsupportedPlatform {
        supplement = .unavailable(.modelUnavailable)
      } catch LocalMobileClipFailure.unavailable {
        supplement = .unavailable(.modelUnavailable)
      } catch LocalMobileClipFailure.invalidModel {
        supplement = .unavailable(.modelUnavailable)
      } catch {
        supplement = .unavailable(.processingFailed)
      }
    }
    let elapsed = ProcessInfo.processInfo.systemUptime - start
    // Core ML prediction is not cancellable; never release the single-flight
    // gate or return its late output merely because the UI deadline elapsed.
    guard elapsed < deadlineSeconds else { throw LocalVisionFailure.failed }
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    let version = ProcessInfo.processInfo.operatingSystemVersion
    return LocalVisionResult(
      classificationRevision: classifier.revision,
      ocrLanguages: languages,
      osVersion: "\(version.majorVersion).\(version.minorVersion).\(version.patchVersion)",
      observedAt: formatter.string(from: Date()),
      classifications: Array(classifications),
      // Too much text must not hide a conflicting code outside the output bound.
      textLines: lines.count <= 24 ? lines : [],
      supplement: supplement,
      durationMs: max(0, Int((elapsed * 1_000).rounded()))
    )
  }

  static func supplementalSkipReason(_ classifications: [LocalVisionClassification]) -> LocalVisionSupplementSkipReason? {
    let kinds = Set(classifications.compactMap { value -> String? in
      guard value.hasPrecisionRecallCurve && value.passesOperatingPoint else { return nil }
      switch value.identifier {
      case "bottle", "wine_bottle": return "bottle"
      case "jar": return "jar"
      case "carton", "cardboard_box": return "box"
      case "paper_bag": return "bag"
      case "cup": return "cup"
      default: return nil
      }
    })
    if kinds.count == 1 { return .primaryMatch }
    if kinds.count > 1 { return .primaryConflict }
    return nil
  }

  private static func decodeJPEG(jpegBase64: String) throws -> (pixels: CGImage, orientation: CGImagePropertyOrientation) {
    guard jpegBase64.utf8.count <= maxBase64Length,
          jpegBase64.utf8.count % 4 == 0,
          let data = Data(base64Encoded: jpegBase64),
          data.count >= 12, data.count <= maxBytes,
          data.base64EncodedString() == jpegBase64,
          data[data.startIndex] == 0xff, data[data.startIndex + 1] == 0xd8,
          data[data.endIndex - 2] == 0xff, data[data.endIndex - 1] == 0xd9,
          let source = CGImageSourceCreateWithData(data as CFData, [kCGImageSourceShouldCache: false] as CFDictionary),
          CGImageSourceGetCount(source) == 1,
          let type = CGImageSourceGetType(source), type as String == UTType.jpeg.identifier,
          let properties = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any],
          let width = properties[kCGImagePropertyPixelWidth] as? Int,
          let height = properties[kCGImagePropertyPixelHeight] as? Int,
          width > 0, height > 0, width <= 4096, height <= 4096,
          width * height <= 16_000_000,
          let image = CGImageSourceCreateImageAtIndex(source, 0, [kCGImageSourceShouldCacheImmediately: true] as CFDictionary),
          image.width == width, image.height == height else {
      throw LocalVisionFailure.invalidImage
    }
    let orientationValue = (properties[kCGImagePropertyOrientation] as? UInt32) ?? 1
    guard let orientation = CGImagePropertyOrientation(rawValue: orientationValue) else {
      throw LocalVisionFailure.invalidImage
    }
    return (image, orientation)
  }
}
