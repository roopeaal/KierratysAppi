# Pinned MobileCLIP-S0 comparison tooling

QA only; not an app model switch, material classifier or accurate product/SKU
recognizer. Parent protocol owns threshold selection using validation only, then
freezes before held-out calls. This tool emits **all18 cosine scores**, never a
winner/bin/material/probability. No model training, Python, package install,
service secret or paid inference is required.

## Exact source and licence boundary

`mobileclip-assets.json` pins Apple's original Core ML V1 upload
`55c8098c12ba8f928e37e26b2e1dd097777c3f98` (2024-10-21), including both image and
text model specification/weight hashes. They match the official current Core ML
repository's original S0 bytes. Use **that pinned artifact**, not an unversioned
MobileCLIP2 checkpoint. Official model card names `apple-ascl`; the corresponding
2024 weight licence is pinned at Git commit
`341ef058802f0e4e5ab13c02f0cb32a3a94e367b/LICENSE_weights_data`.

This original ASCL permits use/modification/redistribution subject to its notice,
disclaimers and no-endorsement conditions. It is not MIT merely because the
software is MIT. The current2025 `LICENSE_MODELS` is research-only and is **not**
the basis for reusing a newer/different checkpoint. Preserve the fetched original
weight licence and relevant software/component notices in any distribution;
other rights/patents/brand approval are not implied. No production approval is
created by this local experiment.

Sources accessed2026-11-06/07:

- [Official Core ML model repository](https://huggingface.co/apple/coreml-mobileclip/tree/55c8098c12ba8f928e37e26b2e1dd097777c3f98)
- [Original2024 weights licence](https://github.com/apple-aiml-research/ml-mobileclip/blob/341ef058802f0e4e5ab13c02f0cb32a3a94e367b/LICENSE_weights_data)
- [Apple2024 Swift demo](https://github.com/apple-aiml-research/ml-mobileclip/tree/1140b8d197e4ed7d56b3a92216ded98bb1c2ac87/ios_app)
- [Actual original training tokenizer wrapper](https://github.com/apple-aiml-research/ml-mobileclip/blob/1140b8d197e4ed7d56b3a92216ded98bb1c2ac87/mobileclip/modules/text/tokenizer.py)
- [CLIP reference BPE](https://github.com/openai/CLIP/blob/main/clip/simple_tokenizer.py)
- [Hugging Face tokenizer licence](https://github.com/huggingface/swift-coreml-transformers/blob/47cb600b46f89f966907f999556cfd1335b4ad25/LICENSE)

## Asset preparation

Use a fresh checked directory under ignored `work/`, never overwrite an existing
model/corpus. The explicit fetch validates fixed origins, redirect hosts, decoded
bytes, exact SHA256 and a150MB total budget. Assets total112,232,614bytes: image
package~22.9MB; text~84.9MB; vocabulary/merges/notices~4.4MB. Model compilation
adds generated files; this experiment stays below1GB. The QA fetcher writes
assets under ignored `work/` and does not stage or publish them. App integration
separately vendors only the pinned image package, prototypes, provenance and
notices under the local iOS module. The text encoder, tokenizer vocabulary and
image corpus remain ignored and are never bundled in the app.

```sh
node scripts/qa/local-vision/mobileclip-fetch.mjs --download --run work/FRESH/assets
node scripts/qa/local-vision/mobileclip-fetch.mjs --validate --run work/FRESH/assets
env DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer xcrun coremlcompiler compile \
  work/FRESH/assets/mobileclip_s0_image.mlpackage work/FRESH/compiled
env DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer xcrun coremlcompiler compile \
  work/FRESH/assets/mobileclip_s0_text.mlpackage work/FRESH/compiled
env DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer xcrun swiftc -swift-version 6 \
  -module-cache-path work/FRESH/module-cache \
  scripts/qa/local-vision/mobileclip-tokenizer.swift \
  scripts/qa/local-vision/mobileclip-main.swift -o work/FRESH/mobileclip-qa
work/FRESH/mobileclip-qa --self-test work/FRESH/assets
work/FRESH/mobileclip-qa --prototypes \
  work/FRESH/compiled/mobileclip_s0_text.mlmodelc work/FRESH/assets \
  scripts/qa/local-vision/mobileclip-prompts.json work/FRESH/prototypes.json
```

`--complete --run` is an **explicit partial acquisition action**, not a hidden
retry: verifies every existing pinned file and the unchanged started manifest,
fetches missing files only and never overwrites. Retain original failed receipts.
Initial actual acquisition exposed an official new CDN redirect hostname and
gzip wire Content-Length versus decoded-byte semantics; hashes/decoded bounds
were not waived and model weights were not redownloaded. Both failures preceded
all text/image inference. The final complete receipt validates all12 assets.

## Tokenization, prototypes and image input

Frozen root-approved ASCII prompts are in `mobileclip-prompts.json`: three
descriptions per supported object kind, thirteen separate outside-kind groups.
Each text embedding is L2 normalized, grouped vectors summed/renormalized (equal
to mean then renormalize). Output contains18 unit512-vectors plus exact prompt/
model/source hashes. Text model runs28 times at prototype preparation; final
image-only deployment could retain only the image model/prototypes after separate
native/package/quality acceptance. No runtime text model is necessary for these
fixed prompts.

The original Swift demo reads all262,144 BPE merges although CLIP vocabulary has
49,408 entries, then `compactMap` can silently drop an unknown token such as
`aerosol`. The training path uses OpenCLIP's49,408 vocabulary. Our ASCII-only BPE
uses the corresponding48,894 merge prefix and checks every concatenated token's
expected vocabulary ID. Unsupported Unicode/control/special/overlong prompts
fail; no word is dropped or truncation silently applied. Seven no-inference
self-tests include known CLIP token IDs and an aerosol segmentation regression.

Image input is canonical JPEG base64 on stdin only (not URL/path/name/reference):
1.5MB,4096-axis/16MP, single image/type/markers/orientation checked. Apply EXIF
orientation, center-square crop, resize256² in sRGB and use the actual Core ML
constraint's allowed ARGB/BGRA pixel layout. `isAllowedValue` is checked for text
and image features. Output finite512-unit image embedding/all18 cosine values;
scores are **not calibrated probabilities**. CPU-only is fixed for this Mac
comparison, not iPhone latency/energy acceptance.

```sh
work/FRESH/mobileclip-qa --score \
  work/FRESH/compiled/mobileclip_s0_image.mlmodelc work/FRESH/prototypes.json
# Supply exactly one previously cleared JPEG as base64 stdin through the parent
# evaluator, which validates every input/source hash before its first case.
```

Before real images, one approved owned uniform-RGB JPEG interface probe confirms
feature compatibility/18 finite scores/unit vector; it is **not** accuracy data.
No prompt, winner gate or preprocessing choice is tuned from that probe.
Real cases belong in the parent frozen validation/held-out protocol, with all
failures/unknown controls and before/after hashes retained. This CLI is not a
physical camera, runtime app integration, signed build or production GO.
