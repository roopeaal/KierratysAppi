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

The audited static web entry is 2,525,687 bytes uncompressed and 572,183 bytes gzip, so it exceeds the 2 MiB warning threshold. Web distribution must be either explicitly de-scoped or optimized and measured after deployment. Native startup, memory, animation frame stability, camera latency and battery impact are unmeasured because signed builds/devices are unavailable. CI must not claim those budgets until a reproducible measurement script and representative runner exist.
