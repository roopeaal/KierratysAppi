# Contemporary packaging/container seed — November6–7,2026

This is a bounded engineering dataset, not human-approved ground truth,
representative accuracy, a material/safety/bin label set or a trained model.
No classifier, training or paid API call was performed in this data lane.
Pretraining membership of these public pictures is unknown.

## Frozen corpus

- Final bytes: `work/packaging-seed-2026-11-06.Jh0o1C/final-reviewed/`.
- Exact committed manifest: `packaging-manifest.json`, SHA256
  `02c5dc8a97162df2a43c1189e8e751eea3fdc803d32a19eb974f54f20da62014`.
  Work and committed bytes are identical, including final newline.
-22 eligible cases:8 TRAIN,7 validation,7 held-out. Each validation/held-out
  partition has one fresh group for each of the five visible kinds plus two
  outside-kind controls. TRAIN reuses four prior seen public pictures, explicitly
  `seenDiagnostic=true`; they never enter validation/held-out.
- Original candidate acquisition:19 new JPEGs plus5 prior public-image copies.
  A second pre-inference source-candidate batch adds7 new JPEGs. Total26 new
  images/5,230,170bytes, below40/25MB budget. All originals and rejected candidates
  remain unchanged in ignored evidence; no image pixels are committed/bundled.
- Actual labels, splits, groups and explicit eligibility are frozen before any
  model receives these images. `trainingExecuted`/`inferenceExecuted` are the
  data-preparation **freeze-state** flags, not a mutable experiment activity log;
  downstream model runs must record their own source/input hashes and outcomes.

| Visible kind | Train groups | Validation groups | Held-out groups |
| --- | --- | --- | --- |
| bottle |2 |1 |1 |
| jar |1 |1 |1 |
| box |2 |1 |1 |
| bag |2 |1 |1 |
| cup |1 |1 |1 |

The requested two-train-groups-per-class goal is **not fully achieved** for jars
and cups. This corpus supports a small same-input zero-shot candidate comparison,
not a sufficient robust classifier-training dataset or a claim that all modern
packaging classes are represented. Human label/rights/privacy acceptance and
real-camera collection remain required.

## Actual visual review, before inference

All31 candidate images are reviewed and accounted for by `packaging-review.json`:
22 eligible,9 excluded. Source-title matches alone are not reference labels.

- Exclude original peanut-jar view with a blurred person. A clean alternate view
  from the same physical/source family is held-out only; no train/validation
  member of that family remains.
- Exclude mixed retail shelf (jars, bottles, boxes), flattened bag stack, bag-logo
  macro, basket labelled as groceries, bowl labelled as noodle cup, lid-only macro
  and mixed food/bowl/jar scene.
- Exclude prior `cup-takeaway`: actual pixels show a reusable travel mug. This
  does not rewrite the old diagnostic or its valid coarse cup-shaped observation;
  it is unsuitable for this intended packaging seed.
- Keep a crushed takeaway cup as an explicitly TRAIN-only litter/shape stress
  case. Shoes are present but no identifiable face/person. A contemporary latch
  food-storage jar is another declared domain-shift TRAIN case, not verified
  retail packaging. Historical artwork on an ordinary paper box is recorded.
- Before any model call, move the sole eligible fresh whole-cup stack group from
  provisional TRAIN to held-out after rejecting the lid-only reference. This is
  a documented eligibility/coverage decision, not output-based tuning.

The fresh held-out kind references are water bottle, clean peanut jar, paper box,
whole food-service bag and whole cup stacks. Multiple same-kind objects can
appear; no composition, emptiness, safety, brand/SKU, deposit or sorting result
is labelled. Outside-kind cases are mouse, batteries/remote, bananas and spoons;
they test unsupported shape recovery, not hazardous-content truth from shape.

## Sources, rights and reproducibility

Each fixture records exact Commons file-page, download URL, source SHA1/timestamp,
author, applicable CC0/CCBY2/CCBY3/CCBY4 URL, change notice, SHA256/bytes, reference
reason, object/source group and split. No share-alike source is added. Reuse
requires preserving applicable credit/licence/change information; metadata is
not a guarantee about other rights or endorsement. Labels are explicitly
AI-reviewed/human-review-required, never silently promoted to independent review.

Primary sources consulted November6–7:

- [Commons reuse requirements](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia)
- [MediaWiki image metadata API](https://www.mediawiki.org/wiki/API:Imageinfo)
- [CC0](https://creativecommons.org/publicdomain/zero/1.0/)
- [CCBY2](https://creativecommons.org/licenses/by/2.0/),
  [CCBY3](https://creativecommons.org/licenses/by/3.0/),
  [CCBY4](https://creativecommons.org/licenses/by/4.0/)

Acquisition uses a fixed Commons metadata origin, explicit approved licence
versions and bounded JPEG fetches with no redirects/retries/arbitrary host.
Local outputs are fresh work-only directories; cache files are regular/hashed,
no symlink images accepted. Known old8/new9 hashes/titles cannot masquerade as
fresh evaluation data; repeated groups cannot cross split/label boundaries.
The helper import reuses public QA functions from the unchanged
`independent-corpus.mjs`, not production/private package internals.

```sh
node scripts/qa/local-vision/packaging-corpus.mjs --acquire work/FRESH/candidates work/PINNED_OLD_PUBLIC_CORPUS
node scripts/qa/local-vision/packaging-corpus.mjs --acquire-supplement work/FRESH/supplement work/PINNED_OLD_PUBLIC_CORPUS
node scripts/qa/local-vision/packaging-corpus.mjs --review work/FRESH/candidates work/FRESH/supplement work/FRESH/reviewed
node --test scripts/__tests__/packaging-corpus.test.mjs
```

These explicit downloads are not automatic reproduction of current hashes:
upstream bytes/licences may change. A fresh source must pass metadata/visual review
again. Retained exact pinned bytes plus the committed manifest are required for
the frozen comparison; the model receives image bytes, never filenames, captions,
GTINs or expected labels. Excluded images must not reach the recognizer.

Evidence: `acquire.log`, `supplement.log`, `freeze.log`, metadata snapshots,
original candidate files, and `tests.log` under the work root. All41 offline
schema/rights/split/history/review/budget tests pass; actual22-image byte/hash
validation passes. No training/inference, model download, phone, secret, deletion,
GitHub or paid action occurred in this lane.
