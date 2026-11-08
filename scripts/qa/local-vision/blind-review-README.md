# Independent human reference review

This offline tool prepares existing licensed references for two independent humans.
It never trains or runs a model, reads predictions, fetches images, or accepts a
release. The initial references remain **AI-reviewed, human review required**.
Generating a packet does not validate their labels or establish model reliability.

## Prepare the current 72 cases

Run from the repository root after installing the repository's locked dependencies.
The existing scoped `tsx` 4.21.0 loader accesses the public photo-sanitizer export;
the tool installs nothing. All three corpus directories must already exist.
The hashes below pin their exact `fixtures.json` bytes: 32 already-seen robustness
cases, 20 already-seen spatial cases, and the latest 20 foreground cases.

```sh
node scripts/qa/local-vision/blind-review-packet.mjs --prepare \
  --corpus work/robustness-corpus-2026-11-07.93wuSo/final-reviewed b822665aa26031a9f64c16e99fc11b2e12e0c62614c7db7dbd21bb052850ec5f \
  --corpus work/spatial-data-2026-11-07.P8gFzP/final-reviewed e6567b3d7ba522e59787fc9ff0419950c36755ee789a36b673728ab598401220 \
  --corpus work/foreground-data-2026-11-07.7bsky0/final-reviewed 877442b5f0ca80023367475019d08213e1e55d4a23586aec1a92e950085487af \
  --seed 8e27141bca1c9d4ae4e541438f925bc304a04f2bdb05f270b16eb3733c8f0a61 \
  --output work/blind-human-review-72-2026-11-08-r2
```

The seed is an ordering nonce, not a credential. Keep this recipe with the owner
receipt; a different seed changes opaque IDs and ordering. Do not give the source
recipe or seed to reviewers. Pseudonyms depend on source image hashes, never labels
or source IDs. An existing output, changed manifest/image, duplicate ID/hash/object
group, unknown licence, malformed/oversized JPEG, hard link, symbolic link, or path
outside ignored `work/` fails closed. A partial failed output is preserved; inspect
it and choose a new explicit output rather than overwriting it.

Registered corpus validators check source, rights, local bytes and review metadata.
The packet additionally bounds each image to 1.5 MB, 100 cases and 150 MB total.
The public contract strips APP/COM metadata, including titles, GPS and ICC profiles.
Only a newly constructed numeric EXIF orientation may remain. Encoded image scans
are not re-encoded, but removing ICC profiles can change rendered colours. These
checks do not replace pixel-decoder validation, source legal review, or human review.

The first generation attempt exposed a malformed source EXIF Orientation tag and
failed before creating an output. The generic review-copy policy now admits only
the exact TIFF LONG/type 4, count 1, numeric value 0 as **invalid/unset**, not a valid
direction. It removes that tag and leaves the scan unrotated; it never guesses a
rotation or flip. `orientationCheckRequired=true` is visible in the reviewer packet,
with the original type/count/value recorded only in the owner key and a mandatory
adjudication flag even when reviewers agree. A human compares the intended display
against the original source **after both initial blind submissions** before accepting
that reference. Nonzero LONG, wrong count, SHORT outside 1–8, contradictory values
and multiple invalid tags still fail. No frozen source image or AI reference changes.

## Private packet layout and handling

- `reviewer/`: opaque image names, image-copy SHA-256 values, neutral vocabulary,
  instructions, and blank reviewer A/B JSON/CSV forms. There are no source titles,
  filenames, old expected labels, object IDs, or model predictions in this view.
- `attribution/LICENCES.csv`: source titles, authors, credits, licences, links and
  modification notices. Keep this sidecar with the private review files, outside
  the initial view because source titles can unblind labels. Reviewers retain access
  to it and must record early access. Do not strip attribution when transferring files.
- `owner-only/`: the private AI-reference/source key, blank adjudication template,
  and generation receipt with original/copy hashes, manifest hashes, tool/validator/
  public-sanitizer source hashes and runtime versions. Do not give this folder to
  reviewers before their independent submissions.

Do not commit photographs or completed forms, publish this packet automatically,
or assume private generation authorizes public redistribution. The licensed images
can contain natural brand/product text; blinding removes software-provided reference
labels, not information naturally visible in pixels. Anyone who previously saw an
image or opened attribution early records that exposure. Keep packets only for this
reference-review purpose and remove them under the owner's retention procedure.

## Two independent humans, then adjudication

Two different humans separately fill `reviewer-A.json` and `reviewer-B.json` without
predictions, the owner key, prior AI labels, or discussion. Enter distinct random
16–64 lowercase-hex anonymous reviewer codes, the actual completed UTC date
(`YYYY-MM-DDTHH:mm:ss.sssZ`), both explicit attestations and every case field.
Do not enter names or other personal information. The CSV copies are convenience
forms only; completed answers must be transcribed into the matching JSON for checking.

Use `bottle`, `jar`, `box`, `bag`, `cup`, `outside`, `mixed` or `unclear`. Several
objects of the same supported form may share that label. `mixed` requires different
supported forms. Do not guess exact product, material, hazards, packaging/deposit
status or sorting destination. Rationale must be brief and nonpersonal. Mark privacy,
whole-form ambiguity and prior exposure honestly; agreement does not erase concerns.

After both independent forms have been submitted, the owner runs:

```sh
node scripts/qa/local-vision/blind-review-packet.mjs --reconcile \
  --key work/blind-human-review-72-2026-11-08-r2/owner-only/answer-source-key.json \
  --a work/blind-human-review-72-2026-11-08-r2/reviewer/reviewer-A.json \
  --b work/blind-human-review-72-2026-11-08-r2/reviewer/reviewer-B.json \
  --output work/blind-human-review-72-comparison-2026-11-08
```

The comparison rejects incomplete/duplicate/malformed forms or reused reviewer codes,
records input hashes, and flags disagreements, exposure and eligibility concerns.
It never fills an adjudicated label or automatically marks human acceptance true.
A separate human adjudicator documents a decision/rationale for every flagged case;
the owner explicitly accepts or excludes references before any later evaluation.
Do not tune thresholds or relabel references from model predictions. These already
seen cases cannot become a new unseen model test merely through human relabelling.

## Narrow checks

```sh
node --test scripts/__tests__/blind-review-packet.test.mjs
pnpm exec biome check scripts/qa/local-vision/blind-review-packet.mjs scripts/__tests__/blind-review-packet.test.mjs
```

Tests use bounded synthetic JPEG marker streams for metadata/workflow attacks, not
camera quality or recognition accuracy. No real corpus generation is part of tests.
