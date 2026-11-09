# Two-view local learned-head result — November9,2026

**FAIL; not integrated. LV-001 remains high/open.** More visual information
removes more seen errors, but the frozen validation loses four correct answers
and still accepts one mixed scene. Do not deploy, refit or lower the gate.
This is our original small ridge head on a pinned pretrained image encoder,
not a new foundation model, reliable product/material recognition or independent
human/native-camera evidence.

## Source and data before any new image call

Protocol: `LOCAL_VISION_TWO_VIEW_PROTOCOL.md`; closed machine specification:
`scripts/qa/local-vision/embedding-learning-spec.json`; executable procedure:
`scripts/qa/local-vision/embedding-learning-README.md`.

Keep exactly72 previously seen/AI-reviewed licensed original JPEGs,40 coarse-form
positives and32 unknown/ambiguous controls, including both old primary failures.
Same family-bound45/27 allocation as v1,71 connected components; five training
and three validation positives per kind. No reference, family, image or label
is dropped/replaced/retaken. Both human-review forms remain blank.

Freeze109 source files, runtime, prior raw receipts, data and exact allocation
before calls. New exporter uses the same pinned original2024 MobileCLIP-S0
encoder/model graph/weights/prototypes/licences, one decode/load and two explicit
predictions: existing center-square256 and full-frame aspect-fit256 gray127.
Both512-dimensional normalized vectors are required; concatenate/divide by√2
to1024 unit features, checking both half norms. No source ID/label/filename is
passed as model input. Eighteen companion center cosines match all72 old captures
exactly; all18 fit cosines match all16 available old fit captures exactly.

This changes representation, normalization and solver regularization together:
it is informed development, not a feature-only causal ablation or an independent
confirmation. Unknown references include mixed scenes and ambiguous food, not
only genuine out-of-distribution pictures. Model pretraining membership is unknown.

## Actual bounded execution

- Freeze completes14:55:17UTC. Acquisition completes14:55:44UTC:72 processes,
  72 model loads/decodes,144 attempted/completed image predictions,72 complete
  paired observations, zero failed/not-attempted/unknown-execution cases. No text
  prediction, network, paid API, download, user photo, hidden probe or retry.
- One45-row fit completes14:56:01UTC, using only training IDs. Internal45 plus
  independent45 numerical-sanity row evaluations are recorded separately from
  72 learned decisions. Strict model serialization/membership/counts and an
  independent plain-primal residual check pass; no further head/image calls.
- Actual objective1.6068603994857047, residual loss0.7041706392302164, squared
  slope norm9.026897602554882; maximum weighted bias/primal normal residual
  5.204170427930421e-16. Registered raw-unit SUM class-weighted dual ridge,
  joint free intercept, λ0.1 and rawmargin0.10 are unchanged. Responses are not
  probabilities. Only an already-accepted matching baseline form can survive.
- All109 frozen source hashes, data/input bindings and worker pins remain stable
  through the experiment and immediate independent read-only recheck. Canonical
  separate image/fit ledgers bind both stages; no second freeze/acquisition/fit.

Mac-only timings over72 processes: native min139/median144/nearest-rank p95172/
max448ms; process wall147/151/179/463ms. These measure this CPU-only standalone
exporter and cache state, **not iPhone latency, cold-start, battery or the full
app Vision/OCR cascade**. No phone/Android/native-release test is inferred.

## Frozen quality gate

| Seen phase | Baseline correct positive / wrong | Two-view veto correct / wrong | Interpretation |
| --- | --- | --- | --- |
| Train45:25 positive/20 control |17 /5 |17 /0 |All five old wrongs removed; training/resubstitution only |
| Validation27:15 positive/12 control |12 /2 |8 /1 |Four correct lost and one wrong remains: **FAIL** |
| Combined72:40 positive/32 control |29 /7 |25 /1 |Six wrongs removed, four correct lost; not general accuracy |

Validation per-kind correct baseline→candidate: bottle3→1, jar2→2, box1→1,
bag3→2, cup3→2. Minimum coverage/every-kind/error-removal conditions pass;
zero-wrong and zero-correct-loss conditions fail. No new wrong/required failure/
invalid output; the original two primary failures, including one invalid output,
remain in train/combined denominators, not successful abstentions.

Lost cases: `bottle-metal`, `bottle-blue` (unknown-class winner), `bag-white`
(box leads but rawmargin0.05841624070384205), `cup-mug` (rawmargin
0.0072269085375880615). Remaining wrong: `control-mixed-takeaway`, classified
box despite its mixed reference. Removed validation wrong: `mixed-rostov`;
removed training wrongs: `mixed-antique`, `mixed-bagcontainers`, `mixed-birch`,
`mixed-lagavulin`, `control-mixed-beach`. Do not add source-specific exceptions,
combine v1/v2 after seeing results, relabel or tune a threshold to these cases.

Perfect removal on training but failed family-disjoint validation is evidence
against deploying this fit. Five positive training examples per kind and only
AI-reviewed references are inadequate evidence of generalization. More feature
dimensions alone do not repair reference/training breadth. This does not prove
a particular larger training set will succeed, or certify human labels.

## Receipts and repaired QA findings

Ignored private root: `work/two-view-learning-2026-11-09.d0J4kb/`.

- `freeze/lock.json`:6718e2f951c823f194ffde1715726d61cf5a780beabdc45c8469b3239378bd4d
- `acquisition/summary.json`:dc42e458fb366b6cef48faa93d963bf147b59cb253d04f6a7e49879e77abfd1c
- `acquisition/features.json`:660a82becef2b629829600474efb6e4d5b05433d0200baf547da73b345766d50
- `result/model.json`:58e4970b1d4bfea0e51ab4c080c338b46a78564c48a047f76dc4fa823e975c1a
- `result/summary.json`:b803503c3f19a225f79bf231b903ca5363b865112aa7150a8f21af00be12e49d
- Frozen source bundle:2616645e2763bbd07f196085f3191546119cc781070f10485648170a5ee40282
- Basis:e987fee81069351230e6e0117810c432dc3aafa168805d7f786d2924a37952d0
- Canonical image/fit claims are under `work/embedding-learning-attempts/`;
  SHA9cd7e493ff04edf017d0ebe175c202268f3d5e7e8daf13a06cda54f7d534e306 /
  b5e67bc0d408054cbe667ef828c5363d28c2d779fd2b83bfcc5f61fff127b2ef.

**QA-006/high, repaired before freeze/calls:** initial runner rechecked the new
binary only at stage start, stamped a constant SHA and omitted it from final
stability. A changed executable could receive stale provenance. Now actual bytes
and frozen source snapshot are checked before every pair, the observed binary
SHA enters its attempt, and final stability rehashes it. Mutation regression and
read-only source review pass. This is not tamper-proof against intentional owner
replacement between check and OS execution or deleting ledgers/using another host.

**QA-007/medium, repaired before freeze/calls:** a missing PID/status with an
unclassified launch error was falsely counted as definite prelaunch refusal.
Use positive process evidence, explicit known prelaunch refusal, or unknown;
retain unknown launch/completion instead of certifying zero work. EINTR synthetic
regression passes. No actual failure/retake was used to repair either finding.

## Software versus acceptance

Eighty new no-image synthetic/read-only tests pass:15 math,17 data/parity,
15 native-source policy,12 decision/independent numerical checks,9 workflow
controls and12 runner/counter cases. Exporter has21 separately evidenced actual
no-image checks, standalone Swift6 compile and one model-load-only preflight,
zero image calls before freeze. Early compile/import/format issues and fixes are
recorded in native/prototype receipts; Node26's existing tsx loader emits a
deprecation warning, not a failed image call. No dependency/runtime upgrade.
Default staged diff whitespace checking additionally flags the one deliberately
preserved terminal blank line in the frozen Swift source; this is documented,
not a green diff check or a reason to rewrite the source/pins after the fit.

Full `pnpm validate` passes1101 unique tests (576 Node+525 application), all
builds/17 exported routes; detailed logs and limits are in TEST_EVIDENCE. These
establish software consistency, not recognition acceptance. App/native9/Android2,
classification/OCR/rules/material Check+Confirm/provenance remain unchanged.
No new UI, signed build, installation, phone state, camera, energy, Android,
remote CI, live advisory, store or production pass is claimed.

Next local work is final adjudication/owner-acceptance validation for the already
prepared independent-review packet, before expanding/training another model.
Humans must actually review; original AI labels, generated blank forms or our
own saved predictions cannot stand in for that. No API credit/account blocker,
no failed candidate bundled/published, no secret/cleanup/device/GitHub action.
