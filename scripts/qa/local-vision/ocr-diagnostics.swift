import Foundation
import CoreText
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers
import Vision

// Explicit developer-only OCR ablation. Never linked into the app. Freeze a
// protocol and image rights/references first; this is not accuracy acceptance.
struct Arm: Decodable {
  let id: String
  let languages: [String]
  let languageCorrection: Bool
  let customWords: [String]
}
struct Fixture: Decodable {
  let id: String
  let lines: [String]?
  let fontSize: Double?
  let path: String?
  let expectedStatus: String
  let expectedCode: String?
}
struct ProtocolSpec: Decodable {
  let arms: [Arm]
  let cases: [Fixture]
  let knownDevelopmentInputs: [Fixture]
}
struct Observation: Encodable {
  let id: String
  let arm: String
  let textLines: [String]
  let durationMs: Int
}
let args = Array(CommandLine.arguments.dropFirst())
guard args.count == 2 else { fatalError("usage: generate|run <evidence-root>") }
let root = URL(fileURLWithPath: args[1], isDirectory: true).standardizedFileURL
let workRoot = URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent("work", isDirectory: true).resolvingSymlinksInPath().standardizedFileURL
guard root.path == root.resolvingSymlinksInPath().path,
      root.path.hasPrefix(workRoot.path + "/") else { fatalError("outside_work") }
let protocolFile = root.appendingPathComponent("protocol.json")
let protocolAttributes = try FileManager.default.attributesOfItem(atPath: protocolFile.path)
guard (protocolAttributes[.size] as? NSNumber)?.intValue ?? Int.max <= 65_536 else { fatalError("protocol_too_large") }
let spec = try JSONDecoder().decode(ProtocolSpec.self, from: Data(contentsOf: protocolFile))
let allFixtures = spec.cases + spec.knownDevelopmentInputs
let materialWords = Set(["PET", "HDPE", "PVC", "LDPE", "PP", "PS", "PAP", "FE", "ALU", "FOR", "COT", "TEX", "GL"])
guard !spec.cases.isEmpty, allFixtures.count <= 64,
      Set(allFixtures.map(\.id)).count == allFixtures.count,
      (1...3).contains(spec.arms.count),
      Set(spec.arms.map(\.id)).count == spec.arms.count,
      spec.arms.allSatisfy({ arm in
        arm.id.range(of: "^[a-z][a-z0-9-]{1,40}$", options: .regularExpression) != nil &&
        (arm.languages == ["en-US"] || arm.languages == ["en-US", "de-DE", "sv-SE"]) &&
        arm.customWords.count <= 13 && Set(arm.customWords).isSubset(of: materialWords)
      }),
      allFixtures.allSatisfy({ fixture in
        fixture.id.range(of: "^[a-z][a-z0-9-]{1,40}$", options: .regularExpression) != nil &&
        (24...120).contains(fixture.fontSize ?? 96) &&
        (fixture.lines?.allSatisfy({ !$0.isEmpty && $0.utf16.count <= 64 }) ?? true)
      }) else { fatalError("invalid_protocol") }
if args[0] == "generate" {
  for fixture in spec.cases {
    let file = root.appendingPathComponent("\(fixture.id).jpg")
    guard !FileManager.default.fileExists(atPath: file.path) else { fatalError("fixture_exists") }
    guard let lines = fixture.lines, (1...2).contains(lines.count) else { fatalError("invalid_fixture") }
    let context = CGContext(data: nil, width: 1200, height: 600, bitsPerComponent: 8, bytesPerRow: 0, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
    context.setFillColor(CGColor(gray: 1, alpha: 1))
    context.fill(CGRect(x: 0, y: 0, width: 1200, height: 600))
    for (index, text) in lines.enumerated() {
      let attributes: [NSAttributedString.Key: Any] = [
        NSAttributedString.Key(kCTFontAttributeName as String): CTFontCreateWithName("Helvetica-Bold" as CFString, fixture.fontSize ?? 96, nil),
        NSAttributedString.Key(kCTForegroundColorAttributeName as String): CGColor(gray: 0, alpha: 1),
      ]
      let line = CTLineCreateWithAttributedString(NSAttributedString(string: text, attributes: attributes))
      context.textMatrix = .identity
      context.textPosition = CGPoint(x: 80, y: lines.count == 1 ? 265 : 370 - index * 170)
      CTLineDraw(line, context)
    }
    let destination = CGImageDestinationCreateWithURL(file as CFURL, UTType.jpeg.identifier as CFString, 1, nil)!
    CGImageDestinationAddImage(destination, context.makeImage()!, [kCGImageDestinationLossyCompressionQuality: 0.9] as CFDictionary)
    guard CGImageDestinationFinalize(destination) else { fatalError("jpeg_generation_failed") }
  }
  print("Generated \(spec.cases.count) owned text-only JPEGs; zero image inference.")
} else if args[0] == "run" {
  guard VNRecognizeTextRequest.supportedRevisions.contains(3) else { fatalError("unsupported_ocr") }
  for fixture in allFixtures {
    let file = fixture.path.map { URL(fileURLWithPath: $0) } ?? root.appendingPathComponent("\(fixture.id).jpg")
    let attributes = try FileManager.default.attributesOfItem(atPath: file.path)
    guard file.path == file.resolvingSymlinksInPath().standardizedFileURL.path,
          file.path.hasPrefix(workRoot.path + "/"),
          attributes[.type] as? FileAttributeType == .typeRegular,
          let size = attributes[.size] as? NSNumber,
          (12...1_500_000).contains(size.intValue) else { fatalError("invalid_fixture") }
    let data = try Data(contentsOf: file)
    guard data.count <= 1_500_000,
          let source = CGImageSourceCreateWithData(data as CFData, nil),
          let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else { fatalError("invalid_image") }
    for arm in spec.arms {
      let request = VNRecognizeTextRequest()
      request.revision = 3
      request.recognitionLevel = .accurate
      request.usesLanguageCorrection = arm.languageCorrection
      request.automaticallyDetectsLanguage = false
      request.customWords = arm.customWords
      let supported = try request.supportedRecognitionLanguages()
      guard arm.languages.allSatisfy({ supported.contains($0) }) else { fatalError("unsupported_language") }
      request.recognitionLanguages = arm.languages
      let start = ProcessInfo.processInfo.systemUptime
      try VNImageRequestHandler(cgImage: image, orientation: .up, options: [:]).perform([request])
      var seen = Set<String>()
      let lines = (request.results ?? []).compactMap { observation -> String? in
        guard let candidate = observation.topCandidates(1).first else { return nil }
        let line = candidate.string.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !line.isEmpty, line.utf16.count <= 64,
              !line.unicodeScalars.contains(where: { $0.properties.generalCategory == .control || $0.properties.generalCategory == .format }),
              seen.insert(line).inserted else { return nil }
        return line
      }
      let output = Observation(id: fixture.id, arm: arm.id, textLines: lines.count <= 24 ? lines : [], durationMs: max(0, Int(((ProcessInfo.processInfo.systemUptime - start) * 1000).rounded())))
      FileHandle.standardOutput.write(try JSONEncoder().encode(output))
      FileHandle.standardOutput.write(Data([10]))
    }
  }
} else { fatalError("invalid_command") }
