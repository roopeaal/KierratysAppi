# Performance budgets

These are release budgets to measure on representative physical devices and deployed staging infrastructure.

| Metric | Budget | Measurement |
| --- | --- | --- |
| Warm camera open to preview | p95 ≤ 800 ms | device trace from tap to first preview frame |
| Barcode decode after stable frame | p95 ≤ 500 ms | on-device technical timing, no raw GTIN |
| Decode to cached result | p95 ≤ 300 ms | client timing |
| Decode to network result | p95 ≤ 2.5 s, timeout 8 s | client and API aggregate timing |
| API lookup excluding provider | p95 ≤ 150 ms | server histogram |
| API payload | ≤ 200 KiB | response `Content-Length`/encoded bytes |
| Product image | ≤ 500 KiB after approved proxy exists | image pipeline metrics |
| Web entry bundle | warning ≥ 2 MiB uncompressed | Expo export artifact check |
| Crash-free sessions | ≥ 99.8% | consented aggregate crash telemetry after vendor approval |

The current static web entry is approximately 1.7 MiB uncompressed. Native startup, memory and animation frame stability are unmeasured because Android/iOS toolchains/devices are unavailable. CI must not claim those budgets until a reproducible measurement script and representative runner exist.
