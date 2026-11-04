# Local Apple Vision observations

Local Expo module `KierratysLocalVision`, iOS only. One method:
`recognize(jpegBase64: string): Promise<LocalVisionRaw>`.
Old native clients, Android and web must report unavailable; never silently
fall back to a paid/network provider. A new native build is required to link it.

This uses Apple's existing pretrained Vision model, **not an own-trained model**.
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
  accurate recognition, no language correction/automatic language inference.
  Actual supported subset of en-US/de-DE/sv-SE is recorded in `ocrLanguages`.
  This is not a Finnish-specialized OCR accuracy claim.
- Output is bounded:the complete seven exact classification identifiers with
  finite scores and Apple per-class precision/recall operating-point flags,
  24 distinct OCR lines of at most64 UTF-16 code units, no controls/format chars,
  fixed engine/schema/revisions, OS version, timestamp and elapsed milliseconds.
  Scores are model confidence, **not calibrated packaging-accuracy percentages**.
- Schema is `local-vision-v2`; `apple-class-operating-point-v1` fixes minimum
  precision0.9/minimum recall0.01. A flag requires an available precision/recall
  curve and `hasMinimumRecall(0.01, forPrecision: 0.9)`. These are Apple's internal
  class operating points, not a measured90% precision guarantee for this app.
  Scores from different labels are never compared. Generic parent/scene labels
  do not veto children; more than one accepted object kind remains ambiguous.
- Fixed error codes: ERR_LOCAL_VISION_BUSY, ERR_LOCAL_VISION_INVALID_IMAGE,
  ERR_LOCAL_VISION_UNAVAILABLE, ERR_LOCAL_VISION_FAILED. No underlying exception,
  image, OCR content or device path is exposed in an error.

The exact same engine source is compiled by `scripts/qa/local-vision/main.swift`
for controlled macOS baseline testing. Mac output is not physical-iPhone evidence.
The CLI can read one explicitly selected, licence/hash-cleared local fixture;
that file-reading code is not in the native app engine.

## References (accessed2026-11-03)

- [VNClassifyImageRequest](https://developer.apple.com/documentation/vision/vnclassifyimagerequest)
- [VNRecognizeTextRequest](https://developer.apple.com/documentation/vision/vnrecognizetextrequest)
- [VNObservation confidence](https://developer.apple.com/documentation/vision/vnobservation/confidence)
- [Apple multi-label taxonomy and class-specific filtering,10:42–19:52](https://developer.apple.com/videos/play/wwdc2019/222/)
- [Expo local modules](https://docs.expo.dev/modules/get-started/)
- [Apple required-reason system uptime API](https://developer.apple.com/documentation/foundation/processinfo/systemuptime)

The installed Xcode26.6/macOS26.5 SDK headers additionally document classifier
revision2 (same1,303-identifier taxonomy, iOS17+/macOS14+). Algorithm revision is
recorded, not an immutable publicly downloadable model-weight hash; OS updates
and hardware can still change behavior. Evaluate after relevant changes.
