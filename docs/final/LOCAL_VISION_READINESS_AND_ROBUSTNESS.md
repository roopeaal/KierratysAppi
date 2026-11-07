# Local readiness and wider reliability audit — November7,2026

Baseline0af2f44. The no-image readiness feature is implemented, tested and
compiled into unsigned iOS8. The wider image comparison **does not certify
reliability**: both original veto candidates fail, and current V4 wrongly
accepts two multi-kind scenes. The next separate spatial experiment remains QA
work until its own registered gates pass. No failed candidate is deployed.

## Actual application improvement

Before camera permission, inspect the installed module's resource integrity,
Core ML input/output interface and supported primary Vision labels/OCR language.
This checks no image or inference accuracy. Strict shared/native contracts retain
the exact model/prototype/prompt pins. Full, partial model/platform support,
legacy unreported support and unavailable/busy/timeout/failure are distinct.
An older recognize-only module is not falsely labelled as having or lacking the
supplement. No network, image, camera permission or paid fallback is involved.

Native preflight shares the recognition serial worker and single-flight gate.
A12s deadline delivers once but cannot release a still-running synchronous load;
the JS15s watchdog likewise retains its gate until actual settlement. Blur,
background, navigation and cancellation abort the UI generation and cannot open
the camera on a late completion. Partial support remains visible in FI/EN.
Recognize/perform, prediction/load and original recognize bridge bodies remain
byte-identical to baseline; no new gate, prompt or model behavior is deployed.

An adversarial review reproduces two low defensive accessor failures: a throwing
SDK `inspectReadiness` getter and a throwing error `code` getter could escape the
typed client result. Both are now guarded, method binding is captured once, and
two regressions pass. Neither caused unexpected camera activity; the UI had an
outer catch, but it gave an inappropriate generic image error. No raw error text
is surfaced or logged.

## Frozen original comparison, including failures

Protocols: LOCAL_VISION_ROBUSTNESS_PROTOCOL and locked
LOCAL_VISION_ROBUSTNESS_SELECTION. Forty-eight public candidates are downloaded
(7,579,946bytes) and visually reviewed before inference; sixteen privacy,
eligibility or reserve exclusions remain recorded. Thirty-two eligible pictures
are new by byte/source/object-family checks, split16+16 with ten positives and
six outside/mixed controls each. Source/author/licence/group/privacy/hash metadata
is retained; AI labels need independent human review, pretraining membership is
unknown. Reusable cups/jars/bottles can be coarse positives, not packaging truth.

Manifest SHA256:
`b822665aa26031a9f64c16e99fc11b2e12e0c62614c7db7dbd21bb052850ec5f`.

| Registered phase | Correct accepted positives | Wrong control accepts | Other outcome |
| --- | --- | --- | --- |
|Validation baseline |10/10 |1/6 |Five controls safely unknown |
|Validation A, cross-model contradiction veto |10/10 |1/6 |Removes no error; ineligible |
|Validation B, center/full-frame agreement |8/10 |1/6 |Loses two correct positives and removes no error; ineligible |
|Locked held-out, baseline only |7/10 |1/6 |Three positive unknown; five controls safely unknown |

The two wrong controls are mixed bag+boxes and bottle+cup scenes. They expose a
real single-kind limitation despite explicit inferred labels; do not relabel
these cases or lower LV-001. No exact product/material/hazard/bin is emitted.

Validation executes48 processes (primary/center/fit once per case). The null
selection is frozen before held-out; held-out executes32 primary/center processes
only, no fit or candidate search. All80 observations/schema/source/input checks
succeed, no operational failure or retake. This uses the decomposed currentV4
baseline from the frozen unchanged V3 primary stage plus current center gate,
not a new end-to-end phone run. Expected-failure accounting is strict and failures
could not earn a successful veto; the prior accounting amendment is not hidden.

The prospective spatial experiment is separately preregistered after this
failure, develops only on the seen validation16 and cannot reuse original held-out
as a fresh test. Its output is not included as a success in this report.

## Validation and actual artifact

- Full validation at this checkpoint:832 unique cases (310 Node policy+522
  application), boundaries/format/lint/strict types/all builds/17 routes pass.
  Later spatial files require another final full run; this is not their evidence.
  Final mobile446/shared254 overlapping scoped cases also pass.
- New readiness contracts40 and mobile client13, UI source-policy4 and native
  source-policy4; existing native malformed8/cascade6 and readiness lifecycle8
  pass. New corpus37/evaluator23 regressions pass. Cases overlap832.
- Native Swift6 QA and shipping compilation pass. Four actual no-image preflight
  outputs normalize: valid pinned bundle full244ms; empty partial24ms; same-size
  tampered provenance partial25ms; shipping CLI missing bundle partial424ms.
  These Mac timings are not iPhone inference/latency/energy measurements.
- Actual loopback8096 FI/EN web unsupported-native, privacy/attribution, keyboard/
  barcode/manual recovery,44pt/narrow/dark/large-text checks pass. Representative
  screenshots inspected without horizontal clipping; no fake native result.
- Stable Xcode26.6 serial generic-iOS unsigned Debug **BUILD SUCCEEDED**. Actual
  Info8 and linked engine/helper readiness methods verified. Complete prior
  unsigned7/native APFS snapshots retained, copied Info7 and matching locks checked
  before the generated Info8 edit; no prebuild/pod/dependency-version change.
- Actual model bundle23,378,043B/13files retains graph/weight/prototype pins,
  all four complete notices and byte-equal privacy manifest. No text model/
  tokenizer or QA resource/lifecycle override symbols in the app.

Built debug dylib SHA256:
`08fe9fe240aa50a2099d8d6277f84af8c4d98c12ef3f6b442ee8f3a7904244ad`.
Unchanged equal pod/Manifest lock:
`6b0253d9036009436fb87c28a15874edc3e0ffae352deb96be229f971ec44013`.
Receipts: `work/local-reliability-2026-11-07.kbWGyb/` and
`work/native-readiness-2026-11-07.RgZGp9/`.
Data: `work/robustness-corpus-2026-11-07.93wuSo/`.
Fit tooling: `work/mobileclip-robustness-2026-11-07.CwXMfb/`.

Retain initial TypeScript discriminated-fixture error, whitespace-sensitive UI
test failure, corpus formatter failure, fit compiler/selfcheck corrections and
the native-Node TS-import preflight failure; the existing pinned `tsx` loader
fixes module resolution before picture calls, without installing a package.

No user photos, model training, API payment, secret/account read, cleanup,
signing/renewal/install, standalone offline launch or GitHub write occurred.
Current phone state is unqueried; prior verified profile expiry is past.
Representative human-labelled real-camera/unknown/mixed/platform/accessibility/
performance acceptance and public-production NO-GO remain open.
