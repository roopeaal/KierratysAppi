# Analytics event dictionary

No analytics vendor is enabled. This dictionary defines the allowlisted, aggregate technical contract for a future consented implementation. Raw GTINs, product names, photos, free text, precise time/location, device advertising identifiers, and local history are prohibited properties.

| Event | Allowed properties | Privacy class | Purpose |
| --- | --- | --- | --- |
| `scan_initiated` | app version, OS family, permission state | Technical | funnel/recovery |
| `scan_decoded` | barcode format, duration bucket | Technical | decode quality |
| `lookup_completed` | provider ID, status, latency bucket, cache hit | Technical | coverage/reliability |
| `packaging_coverage` | component-count bucket, completeness | Technical | source-data gap |
| `sorting_result` | confidence tier, resolved/ambiguous/unknown, rule version | Technical | actionable/verified rate |
| `offline_queued` | count bucket | Device-only by default | resilience |
| `correction_draft_saved` | category only | Device-only by default | correction UX |
| `ocr_started` | on-device/cloud-with-consent | Consent-required for cloud | later OCR funnel |
| `ocr_completed` | outcome, confidence bucket, duration bucket | Consent-required for cloud | later OCR quality |
| `app_crash` | app/build, OS, stack fingerprint with review | Sensitive technical | reliability |

## KPI derivation

- Decode success = decoded / initiated.
- Product found = resolved or packaging-missing product / completed lookup.
- Packaging coverage = lookups with ≥1 component / found products.
- Actionable result = resolved component results / evaluated components.
- Verified result = `verified` confidence / resolved results.
- Camera-to-answer completion = result viewed / scan initiated.
- Incorrect-answer report rate = submitted verified complaints / viewed answers; local drafts do not count.
- AI overconfidence = incorrect confirmed AI results above high threshold / confirmed AI results; unavailable until AI exists.

Before enabling a vendor, approve lawful basis/consent, processor terms, EU region, retention, deletion, sampling, property enforcement, and store disclosures. Add a test that rejects prohibited keys and document opt-out behavior.
