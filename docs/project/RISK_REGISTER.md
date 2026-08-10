# Risk register

| Risk | Likelihood | Impact | Mitigation | Status |
| --- | --- | --- | --- | --- |
| Incomplete or stale packaging data | High | High | Per-field provenance, freshness, safe missing flow, corrections | Open |
| Incorrect sorting rule or jurisdiction | Medium | High | Authoritative sources, versioned rules, deterministic tests, editorial review | Open |
| Open Food Facts licence/attribution misuse | Medium | High | Document licence, isolate adapter/cache, show attribution, legal review | Implemented; legal sign-off open |
| Device camera behaves differently from simulator | Medium | High | Physical Android/iOS test matrix before release | External evidence required |
| User photo exposes personal/location data | Medium | High | Contextual consent, metadata stripping, minimization, retention controls | Open |
| Provider outage/rate limit | High | Medium | Identified client, bounded cache, timeout, offline queue, distinct provider status | Implemented baseline |
| Malicious image/OCR/provider content | Medium | High | Size/MIME/decode checks, sanitized parsing, no instruction execution | Open |
| Sorting guidance creates misleading environmental claim | Medium | High | Factual wording, no impact claims, named source and status | Open |
| Toolchain incompatibility with installed Node 26 | Medium | Medium | CI and `.nvmrc` pin Node 24 LTS; local Node 26 also validated | Mitigated |
| Accessibility regression in camera-first flow | Medium | High | Semantic UI, manual-entry parity, viewport QA, physical VoiceOver/TalkBack checklist | Device evidence required |
| `image-size` parser denial of service in Metro build tooling | Low | Medium | Trusted repository assets only, CI resource limits, expiring advisory allowlist, weekly Dependabot | Accepted until 2026-09-10 or patch publication |
