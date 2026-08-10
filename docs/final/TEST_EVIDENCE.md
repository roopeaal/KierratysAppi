# Test evidence

Evidence date: 2026-08-10. Host: macOS, local Node 26.4.0 and pnpm 11.16.0; production/CI/EAS Node is pinned to 24.19.0.

## Passing evidence

| Command/evidence | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Pass from the locked dependency graph |
| `pnpm validate` | Pass: format, lint, strict typecheck, 133 tests, package/API builds and 12-route Expo web export |
| Domain | 48 tests, 3 files |
| PostgreSQL migration/seed | 5 tests, 1 file; full 26-table PGlite execution |
| Data providers | 14 tests, 2 files |
| Recycling engine | 8 tests, 1 file |
| Localization | 3 tests, 1 file |
| Application resolution/cache | 8 tests, 1 file |
| API | 12 tests, 2 files |
| Mobile state/config/storage/contrast | 35 tests, 9 files |
| **Total** | **133 tests, 20 test files** |
| `pnpm test:coverage` | Pass; all 133 tests rerun with coverage |
| `pnpm security:audit` | Pass policy: 4 advisories reviewed; two exact high build-tool exceptions expire 2026-09-10 |
| API production smoke | Pass on `127.0.0.1:3107`: health, OpenAPI 429 schema, strict extra-field 400; rejected request log contained only request ID/status/message, not the submitted field/value |
| API bundle inspection | Pass: one 52,431-byte JS file, no sourcemap, no GS1 mock symbol |
| iOS clean prebuild inspection | Pass configuration: localized fi/en camera text, no microphone purpose string, privacy manifest says no tracking/collected types and UserDefaults reason CA92.1 |
| Android clean prebuild inspection | Pass source config: audio/storage/system-alert-window marked remove, `allowBackup=false`; final signed merged manifest remains unverified |
| Store asset source inspection | Pass dimensions/formats: icon/adaptive/splash 1024×1024 PNG; favicon 64×64 PNG |
| GitHub read-only inspection | Private default `main`; latest pushed CI/Security at `87404a0` succeeded; branch protection returns plan-gated 403; no repo variables |

## Coverage evidence

Coverage is useful but not a release gate substitute. V8 summaries:

| Package | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: |
| Domain | 91.12% | 84.41% | 94.44% | 90.90% |
| Data providers | 94.07% | 90.82% | 95.83% | 95.07% |
| Recycling engine | 92.42% | 77.55% | 100% | 91.93% |
| Application | 90.54% | 83.33% | 100% | 92.95% |
| API | 96.92% | 93.33% | 92.85% | 98.43% |
| Mobile tested modules | 62.02% | 73.77% | 52% | 64.28% |
| Localization | 100% | 100% | 100% | 100% |
| Database SQL | Not meaningfully represented by V8 | PGlite behavior tests are the evidence |

Mobile coverage excludes most rendered route/component code; it must not be interpreted as native UI acceptance.

## Live and visual evidence

- Real GTIN `3017620422003` resolved through local API → OFF to Nutella with four packaging components. Missing cap material remained unknown. Source, community status, combined ODbL/DbCL, attribution and retrieval date were visible.
- Manual invalid GTIN produced an accessible alert.
- Home/result/legal screens were inspected at 1280×720 and 390×844 with no horizontal overflow. Keyboard focus outline was visible; document language followed selected UI language.
- Legal showed confirmed all-local-data deletion.
- Web browser state was restored and audit tabs finalized after inspection.

## Bundle/performance evidence

- Expo export: 12 static routes, 62 files, about 5.4 MiB total.
- Main web entry: 2,525,687 bytes uncompressed; 572,183 bytes gzip.
- Secondary web chunk: 45,171 bytes uncompressed; 14,833 bytes gzip.
- The entry exceeds the documented 2 MiB warning threshold. No native startup, memory, frame pacing, camera latency or battery claim is made.

## Failing or unavailable mandatory evidence

| Check | Actual result | Classification |
| --- | --- | --- |
| Expo Doctor 1.20.1 | **19/20**; four just-published Expo patches differ | Externally time-gated by minimum release age; release NO-GO |
| `expo install --check` | **Fail** for the same four patches | Externally time-gated; no exclusion used |
| Android compile/sign/install | Unavailable: no Java runtime, Android SDK/ADB/EAS credentials | External blocker |
| iOS archive/sign/install | Unavailable: only Command Line Tools, no full Xcode/signing/EAS credentials | External blocker |
| Physical barcode/VoiceOver/TalkBack/large text | Not run | External device/build blocker |
| Production API/database/monitoring | Does not exist | External infrastructure blocker |
| Backup/restore/load/failover | Not run | External infrastructure blocker |
| Store console/binary validation | Not run | External account/signing blocker |
| Audit-commit remote CI | Not run; audit was not pushed | Publication not authorized |

No unavailable test is recorded as passed by simulation or documentation.
