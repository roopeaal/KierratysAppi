# Frozen system-family comparison — November7,2026

QA-only experiment against production source revision `e127052`. No production
module, contract, UI, model weights or confidence gate changed. Protocol and
all source/input hashes were frozen before18 actual engine executions:
current7 labels vs the same7 plus `bag`, `sack`, `mug`. Fixed class operating
point0.9 precision/0.01 minimum recall; zero/multiple accepted kinds abstain.

The exact native engine and CLI are compiled twice. The only source delta is
the static identifier list; decoder/byte/pixel/orientation/OCR/deadline remain
identical. The child receives JPEG base64 bytes only, never file names/reference
labels. Six pure tests cover this delta, explicit opt-in, strict QA response
validation and unchanged family-group abstention.

| Previously seen development case | Baseline7 | Expanded10 |
| --- | --- | --- |
|bottle-water |tentative bottle |tentative bottle |
|jar-museum |unknown |unknown |
|box-decoder |unknown |unknown |
|box-contacts |unknown |unknown |
|bag-wcdonalds |unknown |unknown |
|cup-takeaway |unknown |unknown |
|cup-chashka |unknown |tentative cup via mug |
|control-ball |unknown |unknown |
|control-batteries |unknown |unknown |

Expanded `mug` for cup-chashka scores0.91015625, curve available/pass true.
For bag-wcdonalds, generic bag0.0338137522 and sack0.00634765625 both fail.
All other new-label observations fail. All18 CLI exits and strict base response
projections validate. The baseline grouping also equals the actual application
normalizer's result. Expanded10 is **QA-only**, not falsely labelled accepted by
the application's seven-label native contract. No material/risk/safety/bin is
inferred. Both outside-kind controls remain unknown; no new conflict appears.

Coverage increases1/9→2/9 on **seen development data**, not independent accuracy,
calibrated precision, representative packaging quality or physical-phone evidence.
Reference labels remain AI-reviewed/human-review-required. No threshold or label
tuning, retake, paid call, download, training, phone action or publication.
Generic bag/sack additions do not improve this set; only mug helps one case.

Evidence: `work/system-family-2026-11-07.50fgVf/summary.json`, every raw score/
curve/pass flag, attempt marker, compile/self-test and result is retained.
Engine/CLI/normalizer/protocol/manifest/all9 input and binary hashes remain
unchanged throughout18 calls. Both arm self-tests pass8 malformed inputs with
zero image requests.

- Baseline engine SHA256:
  `d77d287a1aa241abdadfb4b0fce8244cc0f4d53e9917fef68f6425dccb7ba904`.
- Expanded engine SHA256:
  `19c93eb23ef15cdc7fd4c2b4224fd2fb045a63e6efbdc9ef1929b62aeb84c545`.
- Baseline binary SHA256:
  `04e056c0a11f31ca2d26584621b6e7990b43518304ddf00cf24ddd427f0b9d7b`.
- Expanded binary SHA256:
  `a321dadeebf43ec5421e0a010ce034f62b4086c6b70c6bd79740b27c53ffaa79`.

Post-run cosmetic lint fixes (explicit regex-space count/import ordering) do
not rerun or rewrite the experiment. Original evaluator is preserved as
`evaluator-at-inference.mjs`, SHA256
`6b02038071882afd2db02bee663604efca51f33fe32da2ad055f96e3f09c8b62`.
The unit-test source-transform fixture is synthetic, not a native accuracy test.
To reproduce this protocol after production evolves, use its recorded source
revision; the tool deliberately rejects an unfrozen production identifier list.

Example explicit execution (fresh empty evidence directory, installed `tsx`):

```sh
node_modules/.bin/tsx scripts/qa/local-vision/system-family-evaluate.mjs --run \
  --fixture-dir work/APPROVED_NINE_FIXTURES \
  --evidence-root work/FRESH_EMPTY_EVIDENCE_DIRECTORY
```

No image pixels are committed. Existing source/author/licence/byte records are
in `independent-manifest.json`; the excluded three images never reach this run.
