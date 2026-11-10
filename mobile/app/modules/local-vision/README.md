# Local Apple Vision observations

Local Expo module `KierratysLocalVision`, iOS only. Two native entry points:
`inspectReadiness()` and `recognize(jpegBase64: string)`.
The application adapter validates their untrusted results before use. Readiness
reports full, primary-only or unavailable support; full means resource integrity
and interface availability, **not recognition accuracy**. Older clients without
that entry report readiness unreported rather than claiming a model is absent.
Clients without the module, Android and web report local recognition unavailable;
never silently fall back to a paid/network provider. Linking requires a native build.

This uses Apple's existing pretrained Vision model and a bundled, pinned 2024
MobileCLIP-S0 image supplement, **not an own-trained model**. The supplement runs
only after a successful primary no-match, never to override a match or conflict.
Our separate application mapper treats these results as unverified observations.
No label authorizes material selection, verified product identity or a sorting
answer. The app must retain user material/condition confirmation and rule sources.

## Execution and data boundary

- The caller prepares the JPEG with the shared photo-image codec/metadata remover.
  Native code independently requires canonical base64, at most2,000,000 encoded
  characters/1,500,000 decoded bytes, a single JPEG and4096-axis/16MP pixel bounds.
- No native URL/path input, request, temporary image file, model download,
  application logging, analytics or persistent result/history is implemented.
- The module privacy manifest declares no tracking/collected data and reason
  35F9.1 for `ProcessInfo.systemUptime`: measuring elapsed time inside this
  user-initiated inference and enabling its deadline. Raw boot/uptime values are
  never returned or used for fingerprinting. Only elapsed milliseconds are
  returned. The podspec bundles the manifest; verify the built bundle separately.
- A process-wide gate rejects concurrent requests as busy. A serial user-initiated
  queue handles pixels/Vision, not the main/JS thread.12s best-effort cancellation
  discards late results; busy remains until actual native work settles. JS must
  independently ignore results after cancellation/leave/background.
- Classifier revision2 on iOS17+/macOS14+, else revision1. OCR revision3,
  accurate recognition, explicit `material-code-lexicon-v1` OCR policy: en-US,
  language correction enabled, automatic language detection disabled, fixed
  13-abbreviation dictionary (PET/HDPE/PVC/LDPE/PP/PS/PAP/FE/ALU/FOR/COT/TEX/GL).
  The actual supported language is recorded in `ocrLanguages`; unavailable en-US
  fails closed, never silently changes policy. Apple's dictionary mechanism
  requires language correction. It can still misread text, so output is only a
  candidate for independent confirmation, not material truth or Finnish OCR.
- Output is bounded: the complete seven exact primary classification identifiers with
  finite scores and Apple per-class precision/recall operating-point flags,
  24 distinct OCR lines of at most64 UTF-16 code units, no controls/format chars,
  fixed engine/schema/revisions, OS version, timestamp and elapsed milliseconds.
  A separate supplement reports skipped/unavailable or eighteen ordered finite
  cosine scores with pinned model/prototype/prompt/preprocessing provenance.
  Cosines are not probabilities; primary scores are model confidence, **not
  calibrated packaging-accuracy percentages**.
- Current observation schema is `local-vision-v4`; strict V2/V3 compatibility is
  retained by the application adapter, without inventing supplement metadata.
  Readiness uses `local-vision-readiness-v1`.
  `apple-class-operating-point-v1` fixes minimum
  precision0.9/minimum recall0.01. A flag requires an available precision/recall
  curve and `hasMinimumRecall(0.01, forPrecision: 0.9)`. These are Apple's internal
  class operating points, not a measured90% precision guarantee for this app.
  Scores from different labels are never compared. Generic parent/scene labels
  do not veto children; more than one accepted object kind remains ambiguous.
- Fixed error codes: ERR_LOCAL_VISION_BUSY, ERR_LOCAL_VISION_INVALID_IMAGE,
  ERR_LOCAL_VISION_UNAVAILABLE, ERR_LOCAL_VISION_FAILED, ERR_LOCAL_VISION_TIMEOUT.
  The outer once-only watchdog includes queue/decode/request/prediction time;
  uncancellable work retains the busy gate until settlement. No underlying exception,
  image, OCR content or device path is exposed in an error.

The exact same engine source is compiled by `scripts/qa/local-vision/main.swift`
for controlled macOS baseline testing. Mac output is not physical-iPhone evidence.
The CLI can read one explicitly selected, licence/hash-cleared local fixture;
that file-reading code is not in the native app engine.

The pinned supplement's full four component/weight notices are in
`ios/Resources/Notices/` and bundled by the podspec. See
`docs/final/LOCAL_CLASSIFIER_UPGRADE.md` at the repository root
for acquisition/licensing/evaluation scope. Rejected learned heads and QA-only
exporters are not shipped; current known quality failures remain release gates.

## References (accessed2026-11-03)

- [VNClassifyImageRequest](https://developer.apple.com/documentation/vision/vnclassifyimagerequest)
- [VNRecognizeTextRequest](https://developer.apple.com/documentation/vision/vnrecognizetextrequest)
- [Custom OCR vocabulary and language-correction requirement](https://developer.apple.com/documentation/vision/vnrecognizetextrequest/customwords) (rechecked2026-11-06)
- [VNObservation confidence](https://developer.apple.com/documentation/vision/vnobservation/confidence)
- [Apple multi-label taxonomy and class-specific filtering,10:42–19:52](https://developer.apple.com/videos/play/wwdc2019/222/)
- [Expo local modules](https://docs.expo.dev/modules/get-started/)
- [Apple required-reason system uptime API](https://developer.apple.com/documentation/foundation/processinfo/systemuptime)

The installed Xcode26.6/macOS26.5 SDK headers additionally document classifier
revision2 (same1,303-identifier taxonomy, iOS17+/macOS14+). Algorithm revision is
recorded, not an immutable publicly downloadable model-weight hash; OS updates
and hardware can still change behavior. Evaluate after relevant changes.
