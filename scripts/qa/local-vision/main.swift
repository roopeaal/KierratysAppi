import Foundation

// Compile with the exact local-vision-engine.swift used by the native module.
// File reads exist only in this explicit development CLI, never in the app bridge.
func run(_ base64: String) -> Result<LocalVisionResult, LocalVisionFailure> {
  let signal = DispatchSemaphore(value: 0)
  let resultLock = NSLock()
  nonisolated(unsafe) var outcome: Result<LocalVisionResult, LocalVisionFailure>?
  LocalVisionEngine.shared.recognize(jpegBase64: base64) { result in
    resultLock.lock()
    outcome = result
    resultLock.unlock()
    signal.signal()
  }
  signal.wait()
  resultLock.lock()
  defer { resultLock.unlock() }
  return outcome ?? .failure(.failed)
}

func emit(_ data: Data) {
  FileHandle.standardOutput.write(data)
  FileHandle.standardOutput.write(Data([10]))
}

func fail(_ reason: String) -> Never {
  emit(try! JSONSerialization.data(withJSONObject: ["status": "unavailable", "reason": reason], options: [.sortedKeys]))
  exit(1)
}

func emitOutcome(_ base64: String) throws {
  switch run(base64) {
  case .success(let result): emit(try JSONEncoder().encode(result))
  case .failure(let failure): fail(failure.rawValue)
  }
}

let args = Array(CommandLine.arguments.dropFirst())
if args == ["--self-test"] {
  let invalid: [String] = [
    "",
    "data:image/jpeg;base64,/9j/2Q==",
    "file:///tmp/not-an-image.jpg",
    "https://example.invalid/image.jpg",
    "YWJjZA==\n",
    "YWJjZB==", // Noncanonical padding bits.
    Data(repeating: 1, count: LocalVisionEngine.maxBytes + 1).base64EncodedString(),
    Data("not a JPEG image".utf8).base64EncodedString(),
  ]
  for value in invalid {
    guard case .failure(.invalidImage) = run(value) else { fail("self_test_failed") }
  }
  emit(try JSONSerialization.data(withJSONObject: ["passed": invalid.count, "imageRequestsPerformed": 0], options: [.sortedKeys]))
} else if args == ["--base64-stdin"] {
  var input = Data()
  while let chunk = try FileHandle.standardInput.read(upToCount: min(65_536, LocalVisionEngine.maxBase64Length + 1 - input.count)), !chunk.isEmpty {
    input.append(chunk)
    guard input.count <= LocalVisionEngine.maxBase64Length else { fail("invalid_image") }
  }
  guard let value = String(data: input, encoding: .utf8) else { fail("invalid_image") }
  try emitOutcome(value)
} else if args.count == 2, args[0] == "--jpeg" {
  let path = args[1]
  guard !path.hasPrefix("http:"), !path.hasPrefix("https:"), !path.hasPrefix("file:"),
        let attributes = try? FileManager.default.attributesOfItem(atPath: path),
        let size = attributes[.size] as? NSNumber,
        size.intValue > 0, size.intValue <= LocalVisionEngine.maxBytes,
        let handle = FileHandle(forReadingAtPath: path) else { fail("invalid_image") }
  defer { try? handle.close() }
  guard let bytes = try? handle.read(upToCount: LocalVisionEngine.maxBytes + 1),
        !bytes.isEmpty, bytes.count <= LocalVisionEngine.maxBytes,
        bytes.count == size.intValue else { fail("invalid_image") }
  try emitOutcome(bytes.base64EncodedString())
} else {
  fail("usage: --self-test, --base64-stdin or --jpeg <cleared-local-fixture>")
}
