// ASCII-only CLIP BPE, adapted from the algorithms in OpenAI CLIP (MIT) and
// Hugging Face swift-coreml-transformers (Apache-2.0, copyright2019–2023 HF),
// as used by Apple's2024 MobileCLIP release. Full notices are pinned/fetched
// under the QA asset licences directory; no third-party tokenizer is bundled.
import Foundation

enum MobileClipFailure: String, Error {
  case invalidArguments = "invalid_arguments"
  case invalidPath = "invalid_path"
  case invalidAssets = "invalid_assets"
  case invalidPrompt = "invalid_prompt"
  case invalidPrototype = "invalid_prototype"
  case invalidImage = "invalid_image"
  case invalidModel = "invalid_model"
  case processingFailed = "processing_failed"
}

struct ClipPair: Hashable {
  let first: String
  let second: String
}

struct MobileClipTokenizer {
  private let encoder: [String: Int]
  private let ranks: [ClipPair: Int]

  init(assets: URL) throws {
    let vocabulary = try boundedData(assets.appendingPathComponent("clip-vocab.json"), maximum: 1_300_000)
    encoder = try JSONDecoder().decode([String: Int].self, from: vocabulary)
    guard encoder.count == 49_408,
          encoder["<|startoftext|>"] == 49_406,
          encoder["<|endoftext|>"] == 49_407,
          Set(encoder.values).count == 49_408,
          encoder.values.allSatisfy({ $0 >= 0 && $0 < 49_408 }) else {
      throw MobileClipFailure.invalidAssets
    }
    let merges = try boundedData(assets.appendingPathComponent("clip-merges.txt"), maximum: 3_300_000)
    guard let mergeText = String(data: merges, encoding: .utf8) else { throw MobileClipFailure.invalidAssets }
    let lines = mergeText.split(separator: "\n")
    // CLIP training uses49,408 vocab entries:512 byte tokens+48,894 merges+2 special.
    // The official demo resource additionally has unrelated later merges. Unlike
    // compactMap, this implementation must never silently discard missing tokens.
    guard lines.count >= 48_895, lines[0] == "#version: 0.2" else { throw MobileClipFailure.invalidAssets }
    var result: [ClipPair: Int] = [:]
    for (rank, line) in lines.dropFirst().prefix(48_894).enumerated() {
      let pair = line.split(separator: " ").map(String.init)
      guard pair.count == 2, encoder[pair[0] + pair[1]] == rank + 512 else {
        throw MobileClipFailure.invalidAssets
      }
      let key = ClipPair(first: pair[0], second: pair[1])
      guard result[key] == nil else { throw MobileClipFailure.invalidAssets }
      result[key] = rank
    }
    ranks = result
  }

  func encode(_ input: String) throws -> [Int] {
    guard !input.isEmpty, input.utf8.count <= 240,
          input.unicodeScalars.allSatisfy({ $0.value >= 32 && $0.value <= 126 }),
          !input.contains("<|"), !input.contains("|>") else { throw MobileClipFailure.invalidPrompt }
    let text = input.lowercased()
    let regex = try NSRegularExpression(pattern: "'s|'t|'re|'ve|'m|'ll|'d|[a-z]+|[0-9]|[^\\sa-z0-9]+")
    var tokens: [Int] = []
    for match in regex.matches(in: text, range: NSRange(text.startIndex..., in: text)) {
      guard let range = Range(match.range, in: text) else { throw MobileClipFailure.invalidPrompt }
      var word = text[range].map(String.init)
      guard !word.isEmpty else { throw MobileClipFailure.invalidPrompt }
      word[word.count - 1] += "</w>"
      while word.count > 1 {
        var bestPair: ClipPair?
        var bestRank = Int.max
        for index in 0..<(word.count - 1) {
          let pair = ClipPair(first: word[index], second: word[index + 1])
          if let rank = ranks[pair], rank < bestRank { bestRank = rank; bestPair = pair }
        }
        guard let pair = bestPair else { break }
        var merged: [String] = []
        var index = 0
        while index < word.count {
          if index + 1 < word.count, word[index] == pair.first, word[index + 1] == pair.second {
            merged.append(word[index] + word[index + 1]); index += 2
          } else { merged.append(word[index]); index += 1 }
        }
        word = merged
      }
      for token in word {
        guard let id = encoder[token] else { throw MobileClipFailure.invalidPrompt }
        tokens.append(id)
      }
    }
    guard !tokens.isEmpty, tokens.count <= 75 else { throw MobileClipFailure.invalidPrompt }
    let result = [49_406] + tokens + [49_407]
    return result + Array(repeating: 0, count: 77 - result.count)
  }
}

func boundedData(_ url: URL, maximum: Int) throws -> Data {
  let values = try url.resourceValues(forKeys: [.isRegularFileKey, .isSymbolicLinkKey, .fileSizeKey])
  guard values.isRegularFile == true, values.isSymbolicLink != true,
        let size = values.fileSize, size > 0, size <= maximum,
        url.resolvingSymlinksInPath().standardizedFileURL == url.standardizedFileURL else {
    throw MobileClipFailure.invalidPath
  }
  let file = try FileHandle(forReadingFrom: url)
  defer { try? file.close() }
  let bytes = try file.read(upToCount: maximum + 1) ?? Data()
  guard bytes.count == size, bytes.count <= maximum else { throw MobileClipFailure.invalidPath }
  return bytes
}
