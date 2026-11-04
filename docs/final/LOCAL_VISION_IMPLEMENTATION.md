# First local image-recognition implementation — November3–4,2026

Status: **iOS-only engineering pilot; not a reliable general product recognizer
or production acceptance**. Requested by Roope after the free-inference research.
No per-image API call, paid fallback, new checkpoint/image download or training
was used. This uses Apple's existing pretrained Vision models, not a model we
trained from scratch. Our own code supplies the application boundary, rejection
logic, OCR validation, lifecycle handling and confirmation flow.

## Implemented boundary

- Identify keeps barcode first and manual barcode second. The third AI choice
  opens `/local-photo`. A supported new iOS client runs classification/OCR locally;
  old clients, Android and web explicitly report unavailable. The existing
  separately consented `/photo` OpenAI flow remains behind a distinctly named,
  paid-API disclosure; local failure never calls it automatically.
- The local Expo module accepts only bounded JPEG base64, not paths/URLs. It
  checks encoding, type, image count and size before pixel decoding; corrupt
  pixel streams also fail decoding. A serial
  native worker/process-wide single-flight gate bounds concurrency. Native12s
  best-effort cancellation and JS15s deadline discard late results; cancellation
  does not release the busy gate while native work is still running.
- Strict `local-vision-v2` contracts return all seven fixed classification labels,
  actual per-class operating-point flags, OCR revision/languages, OS, timestamp
  and elapsed time. Unexpected fields, duplicate/missing labels, invalid scores,
  unsupported revisions and invalid OCR fail closed. No brand, SKU, material,
  hazard, hidden part, deposit or sorting destination is invented.
- Object classes are bottle, jar, box/carton, bag and cup. Apple's classifier is
  hierarchical/multi-label: scores are not compared across labels or displayed
  as probabilities. Its class-specific precision/recall request is a model
  operating point, **not measured90% app precision**. No accepted kind or several
  accepted kinds yields uncertainty. One kind remains an unverified estimate.
- OCR proposes only complete, internally consistent material-code lines. Dates,
  bare digits, GTIN fragments and conflicting codes cannot become a material.
  NFKC width normalization is intentional; cross-script confusables such as
  Cyrillic letters are not rewritten into Latin material codes. A suggestion
  only prefills the existing editable form;
  **Check code**, then independent **I see this code on the packaging** still
  precede the existing source-backed sorting engine.
- Capture, preview and recognition are separate actions. Blur/background clears
  this view's media/results and rejects late work; native temporary capture
  deletion is bounded to a canonical cache JPEG. No image/raw-OCR history,
  analytics, native networking or result persistence is added. FI/EN privacy
  separates local handling from the existing cloud recipient/retention notice.
- The native privacy resource declares no tracking/collected data and
  SystemBootTime reason35F9.1 for elapsed in-app processing/deadline timing only.
  No raw uptime is returned. This is not a completed App Store privacy assessment.

## Actual image results, including failures

Protocol is frozen in `LOCAL_VISION_BASELINE_SPEC.md`. Reuse the eight already
licensed/attributed October15 JPEGs only as **previously seen development data**;
they are not a product-separated held-out set. Inputs are byte/hash checked and
the CLI receives only bytes, not filenames/GTINs/expected labels. No selected best
result, retake, new paid request or model training occurs.

| Run | Observed result | What it does not establish |
| --- | --- | --- |
| V1, eight public pictures | 8 valid executions,8 abstentions | Recognition accuracy or useful coverage |
| V2, same eight | Badoit→tentative bottle; other7 abstain; no material code | Brand/SKU/material recognition, representative precision or production readiness |
| Owned synthetic PET1 JPEG | OCR `PET 1`, valid candidate | Real-camera OCR accuracy |
| Owned synthetic05PP JPEG | OCR emits Cyrillic `РР`, safely rejected; **failed positive** | A passing second positive or complete OCR support |
| Owned synthetic date | No material candidate | Hazard/unknown false-acceptance rate |

V1 incorrectly used global score/margin and unsupported-parent comparisons.
Apple's authoritative multi-label semantics prompted an explicitly versioned V2
correction, frozen before its rerun. V1 evidence is retained unchanged; thresholds
were not tuned to pass these pictures. V2 accepted coverage is **1/8, not an
accuracy estimate**. All11 V2 raw outputs validate. The observed PP miss has a
regression test; we do not rewrite cross-script confusables into material codes.

MacOS26.7.0/classifier2/OCR3 used the supported en-US/de-DE/sv-SE subset. Finnish
specialization is not claimed. Public-image engine times184–470ms and fresh-CLI
wall times201–491ms are diagnostic observations, not controlled cold/warm,
physical-iPhone, memory, energy or battery benchmarks.

Engine SHA256:
`14491f12c8e1345bb1d52538625c706c178779e40e9a704d2d3f30ff7f87e4c9`.
V2 binary SHA256:
`420db3b38b404608976b186c1bada033b52bf297e407659bbfd0161c6702755e`.
Source/binary/schema/spec/input hashes stayed fixed within each recorded run.

## Validation and retained evidence

Ignored receipts are under
`work/local-vision-implementation-2026-11-03.dDAJzz/`:

- V1 `baseline-*`, `raw-*`, `normalized-*`, source snapshots and
  `synthetic-ocr-*`; V2 complete11-case records in `v2-baseline/`.
- Actual shared Swift-engine CLI compilation and eight malformed-input
  self-tests; separate JS evaluator argument/explicit-opt-in tests.
- Shared normalizer69 focused cases, including the observed Cyrillic OCR miss;
  mobile capture URI/availability/cancel/late-result/deadline/single-flight and
  strict-prefill tests; source-policy/privacy/route regressions.
- Fresh full/scoped validation and native/browser outcomes are listed in the
  latest `TEST_EVIDENCE.md` section. Earlier failing runs are retained, not erased.

Before native generation, a strict-signature-verified client4 app and complete
generated iOS tree were independently APFS-cloned into this evidence directory.
Prebuild's incidental npm-script rewrite was reverted. No JS dependency or lock
version changes were needed; the local CocoaPod is the only added pod. Source
iOS build is5, Android stays2. Native compile evidence is **unsigned Debug**,
not signed Release, phone installation, renewed provisioning or offline launch.
Both iOS builds succeed. The final build's actual linked symbols, build5
Info.plist and packaged privacy resource are verified; that resource matches
source bytes exactly. Final full validation passes522 unique cases/all builds/
17 web routes; independent mobile322/shared154 scopes also pass. Exact-current
FI/EN browser checks include separate local/cloud privacy after a disclosed stale
Metro failure and isolated cache restart. These do not replace phone evidence.

## Remaining engineering/owner gates

1. **Engineering — locally executable:** create a licence-traced, independently
   reviewable object-group-separated dataset/label manifest for the five classes
   and unknown/hazard negatives; then evaluate a suitable task-specific model
   under frozen acceptance gates. The present1/8 coverage is not an acceptable
   general replacement. PHOTO-003/004 and public-production NO-GO remain.
2. **Engineering + Roope for real prompts/actions:** build a JS-bundled matching
   iOS client, verify native resource/signature/profile and install/operate it only
   under a phone-update request. Test real camera, denial/restoration, back,
   background, airplane mode, large text/VoiceOver and latency/memory/battery.
   Existing client4 cannot acquire this module through a JS refresh.
3. **Engineering:** implement/evaluate Android separately; its current explicit
   local unavailability is not Android feature completion.
4. **Release owner:** final distribution permissions/privacy/store disclosures
   and independent acceptance. Apple framework use adds no per-image API invoice,
   but development, hardware, maintenance and distribution are not cost-free.

No phone service/installation, signing renewal, private-data inspection, account,
credential read, paid inference, cleanup or GitHub write was performed here.
Development Debug still requires Metro/Mac/LAN for its JS; local engine inference
alone does not prove a fully standalone app launch.
