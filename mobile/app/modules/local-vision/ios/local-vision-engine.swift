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

struct LocalVisionResult: Encodable, Sendable {
  let schemaVersion = "local-vision-v3"
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
  let durationMs: Int

  func bridgeValue() throws -> [String: Any] {
    let data = try JSONEncoder().encode(self)
    guard let value = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
      throw LocalVisionFailure.failed
    }
    return value
  }
}

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
/// The sole mutable field is protected by stateLock; Vision runs off the JS/main thread.
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
  private let worker = DispatchQueue(label: "fi.roopeaaltonen.kierratysappi.local-vision", qos: .userInitiated)

  private init() {}

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
    stateLock.unlock()

    worker.async { [self] in
      let outcome: Result<LocalVisionResult, LocalVisionFailure> = autoreleasepool {
        do {
          return .success(try Self.perform(jpegBase64: jpegBase64))
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

  private static func perform(jpegBase64: String) throws -> LocalVisionResult {
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
    let elapsed = ProcessInfo.processInfo.systemUptime - start
    // cancel is best effort; the single-flight gate stays locked until perform really settles.
    guard elapsed < deadlineSeconds else { throw LocalVisionFailure.failed }

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
      durationMs: max(0, Int((elapsed * 1_000).rounded()))
    )
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
