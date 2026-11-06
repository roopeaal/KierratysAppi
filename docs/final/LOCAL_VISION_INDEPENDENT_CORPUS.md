# New public-image diagnostic corpus — November6,2026

Protocol and visible-object reference labels frozen before any inference. This
is a small engineering diagnostic, not representative product accuracy, human
accepted ground truth, real-camera acceptance or model training. Pretraining
membership is unknown. The prior eight October15 images are known development
data and are explicitly excluded by SHA256, never counted as held-out here.

## Data acquisition and pre-inference review

- Twelve new Commons JPEGs downloaded once, total1,724,811bytes, from declared
  CC0/CCBY4 file licences. Original metadata/source SHA1, author/credit, file-page
  URL, exact thumbnail URL, licence URL, changes, bytes and downloaded SHA256
  are retained. No crop/retouch or new image after looking at inference output.
- Actual visual review precedes inference. Three unsuitable source-title-based
  candidates are excluded: `bottle-empty` includes a handwritten notebook in
  the background (privacy precaution, no transcription); `jar-ball` is extreme
  texture/embossing rather than a whole jar; `bag-lawn` is a tight logo crop
  lacking enough whole-object boundary. All originals are retained unchanged
  in ignored evidence; excluded images must never reach the recognition process.
- Nine eligible cases: seven visible-object positives, two outside-kind controls,
  **three validation/six policy-held-out**, no training split. Five validation
  and two-per-class coverage was the original goal, **not achieved** after review.
  No replacement downloads or invented labels hide that incompleteness.
- Museum jar and reusable cup cases are domain-shift stress cases, not modern
  packaging labels. Battery control tests refusal of unsupported object kinds,
  not whether the model can determine actual hazardous contents from a shape.
  No case authorizes material, empty/clean/safety, brand/SKU, deposit or bin truth.
- Labels are AI visual/source reviewed with **human review required**, not an
  independent human accuracy certificate. Object groups and source bytes never
  overlap splits. The selected recognizer policy must be frozen before the call;
  these pictures may not be used to tune that policy after the result.

## Frozen inputs and reproducibility

- Specification: `scripts/qa/local-vision/independent-cases.json`.
- Explicit eligibility/exclusions: `independent-review.json` in that directory.
- Nine-case source/licence/hash manifest: `independent-manifest.json`.
- Actual evaluation directory:
  `work/local-vision-independent-2026-11-06.otSaGF/final-reviewed/`.
- Frozen nine-case manifest SHA256:
  `53e90ac5d08595a8b396db4e363707111965e070cf6407439d337cc5f906e094`.
- The committed JSON is content-equivalent but adds its required final newline:
  SHA256`df55b75cf4d53e9444e885bf4d82f78b08e261480ec026ee772874174235f59e`.
  JSON equality is checked separately from each file's immutable byte hash.
- Original twelve-case manifest SHA256:
  `376c91c47960d09e9e507331180a9ac061429a9ae55ce044edc0be5ef13a679b`.
- The original pre-format specification/review snapshots are retained alongside
  the download; source formatting changed bytes before final review freezing,
  not images, expected labels, splits or any model output.

The explicit downloader uses the fixed Commons metadata origin and bounded
credential-free Wikimedia JPEG URLs only, no redirects/retries/arbitrary URL,
at most12images/1.5MB each. Offline validation checks hashes, rights metadata,
group leakage, historical-data exclusion and exact review accounting. The
evaluator receives only validated JPEG bytes, never filenames/reference labels.
Fresh output markers preserve every result/failure; no selected best retake.

Example local commands (substitute a fresh work directory, never overwrite):

```sh
node scripts/qa/local-vision/independent-corpus.mjs --download work/FRESH/candidates
node scripts/qa/local-vision/independent-corpus.mjs --review work/FRESH/candidates work/FRESH/reviewed
node scripts/qa/local-vision/independent-corpus.mjs --validate work/FRESH/reviewed
```

Downloading fresh source bytes is not a reproduction of these exact hashes;
the source may change. Use retained/pinned fixtures and check the committed
manifest before any new evaluation. No automatic image/label licence claim can
replace final rights review; other rights/trademarks/endorsement are not granted.

## Primary rights sources, accessed2026-11-06

- [Commons reuse rules](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia):
  inspect each file's licence and credit, not the site's general footer licence.
- [CC0](https://creativecommons.org/publicdomain/zero/1.0/) and
  [CCBY4](https://creativecommons.org/licenses/by/4.0/): preserve applicable
  attribution/source/licence and note resizing; imply no endorsement or
  guarantee about other rights. Metadata is not a blanket warranty of ownership.
- Each exact Commons file-page/author/licence reference is in the committed
  manifest. No image pixels are committed or bundled into the app.

No inference had been performed at protocol freeze. The exact pre-results
protocol snapshot is retained as `protocol-at-inference.md` in the evidence
directory, SHA256`84150c71a85943596de427791a97e43a0469f08e5d3b5c9be6041c275176fca1`.

## Actual V3 run — all outcomes retained

Root froze the V3 native/normalizer policy before these images were processed.
One native CLI execution per eligible image; no retakes/tuning, API calls,
additional downloads or training. All9 CLI exits and strict raw schemas pass.
Source, binary, normalizer, manifests, eligibility review, protocol, validator
and runner hashes are unchanged throughout the run. The three excluded images
never reached the recognition process.

| Case | Split | Visible-form reference | Actual estimate | Material code |
| --- | --- | --- | --- | --- |
| bottle-water | heldout | bottle | tentative bottle | none |
| jar-museum | heldout | jar | unknown | none |
| box-decoder | validation | box | unknown | none |
| box-contacts | heldout | box | unknown | none |
| bag-wcdonalds | validation | bag | unknown | none |
| cup-takeaway | validation | cup | unknown | none |
| cup-chashka | heldout | cup | unknown | none |
| control-ball | heldout | outside supported kinds | unknown | none |
| control-batteries | heldout | outside supported kinds | unknown | none |

Accepted coverage is **1/9 overall**, or1of7 positive visible-form references.
All3 validation cases abstain; heldout has1tentative bottle/five unknown results.
Both outside-kind controls abstain. **These counts are not representative
accuracy/precision or a comparison against the eight old images**. The tiny,
AI-reviewed, domain-shift corpus and incomplete class coverage do not close
LV-001. No normalized result contains brand/SKU/material/risk/safety/parts/bin/
sorting fields. Current strict contracts, not the reference title, control that.

Exact evidence under `work/local-vision-independent-2026-11-06.otSaGF/`:

- `evaluation-summary.json` plus `native-v3-results/` retain every raw/normalized
  result, byte hash, class/source metadata and fresh-process time.
- Native engine SHA256:
  `d77d287a1aa241abdadfb4b0fce8244cc0f4d53e9917fef68f6425dccb7ba904`.
- Native CLI binary SHA256:
  `622a898cf789889d7380d27b80e9fa8837b0b01c456cb2d04a3e524b7fab9e37`.
- Shared normalizer SHA256:
  `f3da222d8b84ca508ac7c2daa5bb764d66a7847ba7a9572bf0182200ead92544`.
- `corpus-tests.log`:24 focused schema/source/rights/duplicate/group-leakage/
  historical-hash/URL/fetch/review/explicit-action cases pass; scoped Biome
  format/lint and actual offline9-image byte validation pass.
- Post-run QA-reader hardening adds explicit regular-file/no-follow/size/JSON
  guards and tests before any further use; it changes no image, expected label,
  native engine, normalizer or recorded inference result. The exact validator
  used during this run remains in `corpus-validator-at-inference.mjs` with its
  recorded hash, separate from the hardened current tooling.
  Initial new file-reader tests expose macOS's `/var`→`/private/var` temporary
  path alias; canonicalize the test-owned temporary directory rather than weaken
  the symlink guard. Failed test log is retained, and the corrected24-case
  suite passes. No model or input changed and no inference was repeated.
- First preflight fails **before any image call** because the committed JSON
  adds a final newline and therefore has a different byte hash. The failed
  `evaluation-run.log` remains. Check equivalent JSON content plus each file's
  separate immutable hash; corrected preflight and single actual inference run
  pass in `evaluation-validated-run.log`. No threshold or expected label changed.

Fresh-process wall observations390–2183ms are not controlled cold/warm timings
or iPhone performance/energy evidence. No new photo quality GO, phone action,
publication, independent human approval or physical-camera acceptance follows.
