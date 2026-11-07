# Local object-type classifier upgrade — November7,2026

Source baselinee127052. Implemented a **local supplemental MobileCLIP-S0
visible-form estimator**, not a newly trained foundation model, exact product/SKU
or true-material recognizer. In the frozen fresh held-out set, accepted correct
packaging-form estimates improve **2/5→4/5**; both outside-kind controls stay
unknown and no baseline-correct estimate is lost. This tiny AI-reviewed set is
engineering evidence, **not representative accuracy or production acceptance**.

## What actually changed

Apple Vision still performs the unchanged seven-label class-specific operating
point and material-code OCR first. A single accepted primary kind stays intact;
conflicting primary kinds and top-level processing failures are never overridden.
Only a real primary no-match invokes the bundled MobileCLIP image encoder.

Our fixed18 text prototypes represent five visible-form kinds plus13 outside-kind
groups. They were created offline from28 fixed ASCII prompts with the pinned
text encoder; the app contains **only the image model and prototype vectors**,
not the85MB text model/tokenizer and no runtime text prompt or service call.
Cosine minimum0.20/lead0.020 is the preregistered validation-selected rejection
gate, **not20% confidence** or a calibrated factual probability. Weak, close or
outside-kind winners remain unknown. All answers stay inferred and material
confirmation/source-backed sorting remain separate and unchanged.

Native wire/normalizer are nowV4; prior V2/V3 native responses remain readable
with honest legacy/no-supplement metadata. The supplemental model, artifact,
prototype/prompt hashes, preprocessing and gate are explicit. UI attributes an
actually executed supplement to both Apple Vision and MobileCLIP; missing model
resources have a specific recovery notice. It never claims the new model ran on
an old binary. No new backend/provider/rule/dependency version or app identity.

## Frozen comparison, including the consequential accounting amendment

Protocol: PACKAGING_CLASSIFIER_PROTOCOL. Three candidate gates/prompts/cascade
were fixed before picture calls. Data has22 eligible images:8 training-only
development references,7 validation,7 held-out. Each evaluation split has five
visible-kind positives/two outside-kind controls. Four seen references are
TRAIN-only, never rebranded as fresh held-out; no model weights were trained.
All labels remain AI-reviewed/human-review-required, pretraining membership
unknown.26 fresh JPEGs/5,230,170bytes were acquired, nine unsuitable candidates
excluded before calls; jar/cup training coverage remains limited. Exact sources,
licences, groups, exclusions and byte hashes: `scripts/qa/local-vision/packaging-seed.md`.

| Phase | Baseline correct accepted positives | Supplemental cascade | Outside-kind controls / operational failures |
| --- | --- | --- | --- |
|Validation, five positives/two controls |0/5 |3/5 |Both controls unknown; baseline observed6/7, one defined processing failure retained at15491ms |
|Held-out, five positives/two controls |2/5 |4/5 |Both controls unknown; all baseline/candidate outputs observed; no new wrong acceptance or lost correct result |

Validation selects the first eligible gate in strict→medium→loose order. Strict
adds0, medium1, loose3, so loose wins. Held-out tests **that one locked policy**,
not a new threshold search. Held-out bottle/jar retain their primary estimates;
bag/cup gain estimates; flat Xerox box remains unknown. No score/prompt/data
tuning, retakes, replacement labels or image-model retry follows these results.

The first validation evaluator incorrectly treated the pre-existing native CLI
failure envelope as malformed. Its null-selection run and raw outputs remain.
Before held-out calls, a reviewed **QA accounting amendment** recognizes only
exact known exit1/no-process-error failures as well-formed failures, not successful
observations. The failed bottle stays unknown and cannot use its matching
MobileCLIP score. Offline-only recalculation makes **zero model calls** and
asserts every decision/metric unchanged; only well-formedness/eligibility changes.
This is a **disclosed amended validation pass**, not an unamended preregistration
pass. Details: PACKAGING_ACCOUNTING_AMENDMENT and PACKAGING_GATE_SELECTION.

Separate prior family-whitelist experiment: adding bag/sack/mug without changing
Apple's gate only gives1/9→2/9 on seen pictures (mug). That QA-only experiment is
retained, not confused with this new model comparison or deployed as a second
unvalidated primary change.

## Native integration and privacy

- Same JPEG byte/pixel/orientation bounds, no image URLs/paths in the native API,
  one serial worker/single-flight gate and one total12s deadline. Late or
  uncancellable prediction cannot release busy early or repopulate a cleared UI.
- Lazy CPU-only image model/prototype cache. Strict source spec/manifest,
  compiled graph, weights and prototypes are hash-checked before use; missing/
  corrupt/unsupported resources retain primary/OCR observations with an explicit
  unavailable supplement. iOS17.2+ for the helper; old/native/web recovery stays.
- Core Image intermediate caching is disabled and context caches are cleared on
  success/error exits. This strengthens transient handling, **not a cryptographic
  wipe guarantee for every OS/framework buffer**. No photo/embedding history,
  analytics, disk image write, model download or paid/cloud fallback is added.
- QA resource override is compiled only with LOCAL_VISION_QA, absent from the
  shipping-flags/native app symbols. The one JS method still accepts JPEG base64.
- Full licence notices and descriptive no-endorsement attribution are included.
  Runtime model+prototypes/provenance/notices stay below24MB. Biome excludes only
  the immutable vendor.mlpackage, not surrounding Swift/TS/QA/security checks.

## Actual validation evidence

- Candidate interface: seven tokenizer checks, one owned uniform-RGB interface
  probe and28 offline text embeddings before real picture calls. The training
  tokenizer's48,894-merge prefix prevents the old Swift demo's unknown-token drop
  for `aerosol`; fixed prompt tokens are validated, never silently truncated.
- Comparison:7+7 cases×baseline/candidate=28 local picture calls, once each;
  every source/binary/prototype/input hash fixed within each phase. One baseline
  processing failure retained; all14 supplemental model outputs validate.
- Production engine:14 zero-image self-checks, five frozen functional calls,
  one separately approved post-cache-change equivalence regression and two
  valid-model text-only regressions. All pass strictV4 normalization. All18 bag
  cosine scores are **bit-exact** with the original candidate; PET1 stays an
  unconfirmed code candidate/object unknown, numeric date remains no-code/unknown.
  These eight calls are integration regressions, not additional accuracy samples.
- Source and browser: exact FI/EN attribution/limitations, privacy, keyboard/
  barcode/manual recovery,44pt/narrow/dark/large-text checks pass, screenshots
  inspected. Browser unsupported-native states are not fake native inference.
- Mandatory/scoped counts and retained initial type/format failures:
  latest TEST_EVIDENCE. No remote CI or signed-release pass is inferred.

## iOS artifact

Source iOS build7/Android2; preserve the prior unsigned6 app/native snapshots,
verify copied build6/old matching pod locks, then align generated Info.plist7 and
refresh only the local pod's checksum/resource graph. JS/native dependency versions
are unchanged. Stable Xcode26.6 generic-iOS **unsigned Debug BUILD SUCCEEDED**.
Actual app Info.plist7, linked predictor, matching pod locks, privacy byte equality,
and model graph/weight/prototype hashes pass. The built model bundle is about22MiB
and retains all four notices; the text encoder is absent.

Artifact: `work/illustrated-ios-2026-10-28.lqILo2/DerivedData/Build/Products/Debug-iphoneos/KeepItGreen.app`.
Debug dylib SHA256:
`63312602aa95dc0e601c179fae5a571133b716424cde68113278bc3c4d9a2b33`.
Pod lock SHA256:
`6b0253d9036009436fb87c28a15874edc3e0ffae352deb96be229f971ec44013`.
Native engine:
`72436d9a0b72e9d9d26dc70ab12b69e870e32fba2a0e590eaa681ed940fe22fe`.
Final helper:
`910f53d7225d91731bf6af3d241ff6b8198198c3a2c718926ce97a25206e8754`.
Compiled graph:
`858f2fc75c7d7b2fd182c1a13ae099a3f66c16ba1d0ea72375a0cdf6fe97b984`.
Weights:
`87d8f63997bbd2f38ba7defeaaa2c571928bdece56aa9629542198b3ce906ed6`.
Prototypes:
`0dfe73569d1b2177629d95c4bc21c1392be9228aff6809cab0ed1c3358893c81`.

## Rights and remaining gates

Pin Apple's original2024 Core ML upload55c8098c and its original ASCL weight
notice, rather than using current research-only MobileCLIP2 weights. Software
MIT is not the weight licence; preserve source notices/no endorsement/patent
limitations. Exact artifacts/licences/reproduction: `mobileclip-README.md` under
`scripts/qa/local-vision/`. No claim of blanket IP/production legal approval.

The improvement is a bounded zero-shot prototype, not a universally reliable
recognizer. LV-001/PHOTO-003/004 and public-production NO-GO stay open for
representative/human-labelled, real-camera/unknown/hazard/latency/memory/battery/
accessibility validation. Android is separate. No signed Release, renewal,
phone install, standalone offline launch, user-photo use, paid API call, cleanup
or GitHub publication occurred. Last verified profile expiry November4 is past;
current phone state unqueried. Next local task: truthful pre-camera model
readiness/integrity preflight; physical acceptance follows a separately requested
matching signed/bundled installation with Roope operating actual prompts.

## Retained receipts

- Root protocol/validation/amended selection/held-out/source snapshots/native
  build/full checks: `work/packaging-classifier-2026-11-06.VMqCIE/`.
- Model acquisition/prototypes/tokenizer/interface probe: `work/mobileclip-candidate-2026-11-06.M305AS/`.
- Data manifest/review: `work/packaging-seed-2026-11-06.Jh0o1C/`.
- Native5+1+2 regressions/symbol checks: `work/native-cascade-2026-11-07.4uGrPr/`.
- Browser: `work/native-cascade-browser-2026-11-07.GgN2iM/`.
- Family-only comparison: `work/system-family-2026-11-07.50fgVf/`.

Original failed acquisition CDN/gzip checks, first null selection, source-accounting
snapshots and initial TypeScript/format failures remain; none are overwritten
or hidden by a retake. No threshold or factual-sorting safety rule was waived.
