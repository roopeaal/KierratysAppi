# Fresh foreground-instance confirmation data

This separate prospective set was prepared before any prediction on its images.
The earlier foreground development used the explicitly seen52 other cases.
Initial acquisition started 2026-11-07; interrupted acquisition, final visual
review and freeze completed2026-11-08. It contains20 AI-reviewed references:
two per bottle/jar/box/bag/cup form and ten controls, five genuinely mixed
supported-kind scenes plus five outside-kind scenes. No image reaches a model
through this data tool. Root must separately approve inference after protocol,
model, data and tool hashes are frozen.

The set is not representative real-camera sampling or independent human label
acceptance. Pretraining membership is unknown. Historical medicine carton,
butter carton, museum glass display, travelling chest and bowl are explicit
domain limitations. Reusable containers, anonymous pantry and staged coin/plant
context do not establish exact identity, material, contents, packaging, hazards,
deposit eligibility or sorting guidance. Privacy review observed no identifiable
person/private text in eligible pictures; that is limited AI inspection, not
blanket third-party rights or legal approval.

## Acquisition and retained failures

- Excludes123 previously acquired/evaluated/rejected/reserved sources, including
  all48 robustness candidates and29 spatial candidates. Exact source/title/
  object/original-source/hash checks and known source-family patterns are used;
  they cannot detect every alternate view without manual review. The complete
  Meanwell Packaging stock-photo series remains conservatively excluded.
- 31 initial sources and eight reserve sources were planned. Four initial sources
  lack author/credit metadata. One failed after its response was fetched on
  November7 but before the image was retained. It is excluded, never retried;
  three others were skipped before new downloads. No missing credit was invented.
- 36 image fetch attempts overall:35 retained JPEGs plus that failed reserve.
  Known retained responses total **5,181,901bytes**. Its lost response byte count is
  not known, so charge the complete1,500,000byte response cap: **6,681,901byte
  conservative upper bound**, not exact downloaded-byte evidence. This is below
  the fixed40image/25MB budget; no automatic response retry occurred.
- The explicit completion action verifies the original specification hash,
  archived Commons metadata and five already-stored files. It downloads only
  unattempted attributable sources and preserves the original failed receipt.
  General acquisition now excludes missing author/credit before fetching images
  and records attempt markers, avoiding the original missing-receipt failure.
- All35 retained candidates were visually reviewed,20 eligible and15 excluded or
  reserved before predictions. Complete-body/rim/neck macros, unclear mixed
  references and people-containing scenes were rejected without model feedback.
  Actual local20-file hashes and macOS4096-axis/16MP image metadata are verified.
- Source-declared CC0/CC-BY2/3/4, author/credit/timestamp/exact source and licence
  URLs are retained per fixture. Rights metadata was checked at acquisition;
  only Commons thumbnail resizing occurred, no crop or retouch by the data tool.

## Pre-prediction visual reference correction

The provisional source title for `mixed-pantry` said bottles/jars, but the actual
image shows clear whole jars and no confidently different supported kind.
Two AI visual reviews and root engineering approval supported correcting the
reference to `jar`/`form` **before any prospective prediction**. This is not
independent human approval. The original specification bytes/hash
`b05fbf603f8fbe5da3700a968bab63f6050ee4dc857c345b515de75254473535`,
old/new labels, basis, timing and reason remain in the candidate/final manifest.
No previously frozen/evaluated dataset was changed. The id remains unchanged for
acquisition traceability; ids/filenames/labels never become model inputs.

## Evidence and reproduction

Local public-image evidence: `work/foreground-data-2026-11-07.7bsky0/`.
Original partial files/metadata, completion attempts, raw source metadata,
pre-amendment source snapshots, supplemented acquisition, all35 merged candidates,
review and final20 are retained in ignored work. No pictures are committed or
bundled in the app. Manifest `inferenceExecuted:false` describes freeze time,
not a later root-approved run. Later predictions/results are owned separately.

```sh
node scripts/qa/local-vision/foreground-data-corpus.mjs --acquire work/FRESH/candidates
node scripts/qa/local-vision/foreground-data-corpus.mjs --acquire-supplement work/FRESH/reserve
```

Use a fresh existing `work/` parent; outputs refuse overwrite. Exact historical
bytes need the retained receipt. Reacquisition must verify source licence drift,
re-review actual image privacy/eligibility and explicitly combine accounting
without retries. The interrupted run's one-off `complete.mjs` and `merge.mjs`
receipts document that particular continuation; do not silently reuse its old
five-file assumptions on a different acquisition. Freeze with explicit reviewed
inputs only, then run `validateManifest`/`validateLocal`; no network occurs during
ordinary schema/source-policy tests.
