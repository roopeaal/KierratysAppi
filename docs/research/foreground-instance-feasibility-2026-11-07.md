# Foreground instance regions as a possible next local fallback

Accessed2026-11-07, after the wider audit exposed mixed-kind scene errors. This
is a new implementation question, not a repeated broad free-recognition survey.
Current spatial-crop experiment is separate; no segmentation is integrated,
executed or empirically accepted by this note.

## Primary-source evidence

- [Apple WWDC23: Lift subjects from images in your app](https://developer.apple.com/videos/play/wwdc2023/10176/)
  describes Vision foreground instance masks, per-instance selection/cropping
  and background-worker execution. It explicitly warns that a detected subject
  can combine multiple physical objects; an instance is not an infallible object
  count. Processing is resource-intensive despite hardware optimization.
- [Apple sample: Applying visual effects to foreground subjects](https://developer.apple.com/documentation/vision/applying-visual-effects-to-foreground-subjects)
  demonstrates `VNGenerateForegroundInstanceMaskRequest` and requests an iOS17
  run destination. No third-party package or downloaded checkpoint is required
  in that design; ordinary Apple framework/SDK terms still apply.
- [Apple ML research: Fast Class-Agnostic Salient Object Segmentation](https://machinelearning.apple.com/research/salient-object-segmentation)
  identifies the subject-lifting model as on-device and category-agnostic rather
  than limited to people/pets. That does not prove performance or separation for
  our packaging pictures, or offline availability on every device/OS revision.

The installed stable Xcode26.6 iPhoneOS26.5 SDK independently contains
`VNGenerateForegroundInstanceMaskRequest.h` with iOS17/macOS14 availability and
revision1. `VNObservation.h` exposes `VNInstanceMaskObservation.instanceMask`,
`allInstances`, per-instance masks, masked images and scaled masks. Background
index0 is excluded from allInstances; cropped masked-image output can use the
selected instances' extent. Read actual pixel format/stride and validate index
ranges at runtime, never assume a float/byte layout or dense physical-object IDs.

## Inference from those sources, not tested capability

If fixed spatial regions fail, a bounded QA candidate could run the foreground
request on the existing validated, EXIF-oriented image, reject absent/too-many/
invalid instances conservatively, and classify at most four isolated foreground
regions with the already-pinned MobileCLIP encoder. Any confident different
supported forms would veto a single-kind answer; no kind substitution, materials,
hazards, exact product or sorting truth. Missing/merged/tiny/occluded subjects
remain errors/uncertainty, not proof that an image has only one object.

This would use the existing serial worker, cancellation/deadline and memory/
cleanup boundaries, no app cloud endpoint or service key. Preserve primary/OCR
observations separately; a required segmentation failure cannot count as safe
abstention/error removal. Register model revision, mask/crop/composite policy,
all executed stages and exact source/input hashes before pictures. Develop on
seen cases and use fresh human-reviewed confirmation rather than retaking tests.

Actual support, no-network behavior, mask/model equivalence, latency/peak memory,
battery and accessibility on a matching signed phone binary are unverified.
Framework availability alone cannot close LV-001 or production NO-GO. No model
or image call, new dependency, paid action, account, phone action or publication
was performed for this research.
