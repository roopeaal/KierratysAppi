# Risk register

| Risk | Likelihood | Impact | Mitigation | Status |
| --- | --- | --- | --- | --- |
| Incomplete or stale packaging data | High | High | Per-field provenance, freshness, safe missing flow, corrections | Open |
| Incorrect sorting rule or jurisdiction | Medium | High | Authoritative sources, versioned rules, deterministic tests, editorial review | Open |
| Open Food Facts licence/attribution misuse | Medium | High | Document licence, isolate adapter/cache, show attribution, legal review | Implemented; legal sign-off open |
| Device camera behaves differently from simulator | Medium | High | Physical Android/iOS test matrix before release | External evidence required |
| User photo exposes personal/location data | Medium | High | Contextual consent, metadata stripping, minimization, retention controls | Open |
| Provider outage/rate limit | High | Medium | Identified client, bounded cache, timeout, offline queue, distinct provider status | Implemented baseline |
| Multi-instance quota/rate-limit drift | Medium | High | Trusted edge and shared quota coordination; deployment/load tests | Production infrastructure blocker |
| Malicious image/OCR/provider content | Medium | High | Photo/OCR remains disabled; typed codes use a 64-character deterministic allowlist parser; future images require size/MIME/decode checks and no instruction execution | Typed path mitigated; image path open |
| Material code mistaken for complete sorting evidence | Medium | High | Explicit package confirmation, separate provenance, conservative mappings, existing shape/deposit/hazard questions, composites safe unknown | Mitigated baseline |
| Sorting guidance creates misleading environmental claim | Medium | High | Factual wording, no impact claims, named source and status | Open |
| Toolchain incompatibility with installed Node 26 | Medium | Medium | CI and `.nvmrc` pin Node 24 LTS; local Node 26 also validated | Mitigated |
| Fresh package supply-chain risk | Medium | High | Strict 1,440-minute release age, frozen lockfile, no broad exclusion, Expo install check and Doctor after changes | Enforced; Expo 57.0.19 set passes install check and Doctor 20/20 on 2026-09-04 |
| Accessibility regression in camera-first flow | Medium | High | Semantic UI, manual-entry parity, viewport QA, physical VoiceOver/TalkBack checklist | Device evidence required |
| Dependency denial of service and incorrect URI parsing | Medium | High | Weekly audit, fail-closed report validation, bounded audit process, no high/critical exceptions, patched fast-uri lock floors | 2026-09-04: fast-uri updated to 3.1.7/4.1.4; Metro no longer includes image-size and its old exceptions are removed; lower findings remain monitored |
| Production outage/incident undetected | High | High | Aggregate telemetry boundary, SLO/alerts/on-call/tabletop required | External operations blocker |
| Backup cannot be restored | Medium | High | Managed PITR, least-privilege migration and isolated quarterly restore/reconciliation | External database blocker |
| Store/privacy declarations mismatch final binary | Medium | High | Generate from final signed binaries/SDK inventory; legal/store approval and console exports | External release blocker |
| Web load regression | High if web ships | Medium | Decide web scope; entry exceeds 2 MiB warning; optimize and measure deployed CWV | Product decision open |
