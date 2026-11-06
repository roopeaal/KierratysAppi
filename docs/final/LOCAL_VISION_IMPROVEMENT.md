# Local recognition testing and improvement — November6,2026

Source baseline447c853. Scope: improve the free iOS-local pilot, not replace it
with a paid provider, certify generic recognition, install a phone app or publish.

## Measured OCR change

Apple's `customWords` only affects recognition when language correction is on.
Before new calls, freeze three arms: A=current multilingual/no correction;
B=en-US/no correction; C=en-US/correction plus the13 existing material-code
abbreviations. Neither the class-specific classification operating point nor
object-abstention logic changes. No cross-script replacement, arbitrary string
repair, brand dictionary or automatic material/bin inference is added.

| Frozen diagnostic | A | B | C / final |
| --- | --- | --- | --- |
|24 owned synthetic cases, including3 known controls |22 expected statuses |22 |24 |
|18 separately frozen near-code adversarial cases |17 expected statuses |not run |17; no new unambiguous false-code status |
|Exact final production engine, combined42cases |not rerun |not run |42 valid outputs/exits;41 expected statuses,14/14 complete-code positives |

The retained failure is `PP 0` read as `PP O`, producing none rather than the
expected ambiguity in both A/C. It does not produce a valid code. All28 negative,
mismatch and conflict controls avoid an unambiguous candidate status; multi-code
ambiguity is not called a valid material. First24 and subsequent18 were frozen
before their calls, once per arm/case, with hashes and all failures retained.
C improves the two PP positive misses without a measured control regression.
This is **synthetic engineering evidence**, not packaging/real-camera accuracy,
a calibration result or proof against all lexical hallucinations. Cases are
now seen development data, never a held-out training set.

Raw schema is now `local-vision-v3`, with explicit OCR policy
`material-code-lexicon-v1`, OCR3 and exactly en-US. Strict V2 native inputs still
normalize, but their missing OCR policy is labelled `legacy-unspecified-v2`, not
invented. Normalizer isv3; class policy and abstention remain unchanged atv1/v2.
Dictionary contents are pinned by a regression. Markings still only prefill an
editable form, then require Check and independent physical-code confirmation.

## New public-image diagnostic: generic recognition is still weak

Twelve licensed Commons images are downloaded once; pre-inference visual review
excludes three unsuitable/privacy-caution candidates without replacement. Only
the nine eligible frozen images reach the unchanged object recognizer. All nine
execute/validate; one water bottle gets a tentative bottle estimate, eight abstain
(including both outside-kind controls). Validation3/3 abstain; six policy-held-out
cases give one estimate/five abstentions. No material-code candidate is returned.

**1/9 coverage is not accuracy and not an improvement over the old1/8 set**.
This is a different tiny corpus, with AI-reviewed labels awaiting human review,
unknown pretraining membership and museum/reusable-object domain shift. The
two-per-class/modern-packaging data goal is not met. See
`LOCAL_VISION_INDEPENDENT_CORPUS.md` for source/author/licence/group/hash manifests,
excluded cases and every outcome. LV-001/PHOTO-003/004 remain open; thresholds
were not lowered and these results were not used to tune the recognizer.

## Camera/recovery improvements

The web-design-guidelines review identified missing capture guidance, a misleading
two-step retake and duplicate permanent-denial messaging. Implemented:

- FI/EN one-package, full material-code close-up and reflection guidance before
  capture and on preview, without clipping or disabling dynamic text.
- Explicit Retake on preview/results clears prior media/generation then opens
  a fresh camera; no shutter/inference/upload runs automatically.
- Unavailable/result states have a direct barcode recovery, clearing transient
  state before entering the existing scanner-permission flow.
- One permanent-denial/settings explanation rather than duplicate error text;
  unrelated errors remain visible. Late mount/ready/size callbacks cannot update
  a newer request generation. Eleven pure presentation tests and five source
  guards supplement actual web recovery checks, not native-camera acceptance.

## Reproducible evidence and native boundary

- Frozen ablation72 OCR requests:
  `work/local-ocr-ablation-2026-11-06.mf32q8/`.
- Frozen adversarial36 OCR requests:
  `work/local-ocr-adversarial-2026-11-06.XKfnXt/`.
- Final42 combined classifier/OCR requests:
  ablation directory `production-verification/summary.json`.
- Nine new image runs/manifests:
  `work/local-vision-independent-2026-11-06.otSaGF/`.
- Browser/recovery screenshots:
  `work/local-vision-improvement-2026-11-04.Es0SaQ/browser-2026-11-06/`.
- Root validation/native receipts:
  `work/local-vision-improvement-2026-11-06.7YOrWW/`.
- Reproduction driver/protocols are committed under `scripts/qa/local-vision/`;
  image pixels, generated native tree/binaries and private receipts stay ignored.

Across the experiment there are108 isolated OCR-arm calls plus42 actual-engine
synthetic calls and9 public-image calls, all local: **zero paid API calls**.
No model download, training, user-photo reuse, credential read or phone action.

Final engine SHA256:
`d77d287a1aa241abdadfb4b0fce8244cc0f4d53e9917fef68f6425dccb7ba904`.
CLI SHA256:
`622a898cf789889d7380d27b80e9fa8837b0b01c456cb2d04a3e524b7fab9e37`.
Normalizer SHA256:
`f3da222d8b84ca508ac7c2daa5bb764d66a7847ba7a9572bf0182200ead92544`.
Each recorded run checks before/after source/binary/input hashes; subsequent QA
tool hardening has its own source version, not a rewritten historic run.

Source iOS build6/Android2, unchanged JS dependency versions. Preserve unsigned
build5 and its Info.plist snapshot; align only generated CFBundleVersion with
source6, leaving matching pod locks and native graph unchanged. Stable Xcode26.6
serial generic-iOS **unsigned Debug BUILD SUCCEEDED**. Actual build6 metadata,
linked OCR-policy/lexicon symbols and byte-identical packaged privacy resource
pass; signing/Release/profile/install/standalone offline launch are not claimed.
Final debug dylib SHA256:
`cb91a8ba3b016ad03b3358b55af67888b45d79106807417109ce9d9014aa4e69`.

Latest full/scoped counts and initial failures are in TEST_EVIDENCE. FI/EN actual
browser checks pass for recovery/keyboard/privacy/narrow/dark/large states,
with no fake native inference. Real capture/retake/permissions/VoiceOver/energy,
Android and representative accuracy remain pending. Last verified client4
profile's November4 expiry is now past; no current device/signing state was read
or renewed here. No cleanup or GitHub write. Public production remains NO-GO.

## Primary references

AccessedNovember4,2026; stable behavior used for the November6 experiment:

- [Apple customWords](https://developer.apple.com/documentation/vision/vnrecognizetextrequest/customwords):
  language-correction dependency and lexicon precedence motivate testing rather
  than assuming safer recognition. It is not a material-truth API.
- [Apple topCandidates](https://developer.apple.com/documentation/vision/vnrecognizedtextobservation/topcandidates(_:)):
  bounded ordered OCR alternatives; this implementation retains top1, not an
  opportunistic lower-ranked code search.
- [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines):
  actionable errors, explicit controls, accessible updates and readable recovery.
- Commons/CC0/CCBY4 primary file-page and licence URLs are recorded per image in
  the independent corpus manifest; no blanket ownership/other-rights warranty.
