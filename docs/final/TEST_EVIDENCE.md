# Test evidence

Evidence date: 2026-08-22. Host: macOS, local Node 26.4.0 and pnpm 11.16.0; production/CI/EAS Node is pinned to 24.19.0.

## Physical iOS preflight

| Command/evidence | Result |
| --- | --- |
| `sw_vers` / host inspection | Apple M1 on macOS 26.5.2 (`25F84`), compatible with current Xcode 26.6 |
| `xcode-select -p` | System selection remains `/Library/Developer/CommandLineTools`; all native commands explicitly set `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer` |
| `xcodebuild -version` | Pass: Xcode 26.6 (`17F113`), iOS 26.5 SDK |
| `xcrun devicectl list devices` | Pass: paired, connected iPhone 12 Pro Max running iOS 26.1; device identifiers are intentionally omitted |
| `pnpm --filter @kierratysappi/mobile exec expo config --type public` | Pass: evaluated bundle/version, permission, locale, privacy and plugin configuration |
| Clean iOS prebuild in ignored `work/` | Pass: native project generated without installing pods |
| Generated deployment/bundle | iOS 16.4; `fi.roopeaaltonen.kierratysappi`; version `0.1.0`, build `1` |
| Generated purpose strings | Finnish/English camera-only text; no microphone or location usage string |
| Generated privacy/entitlements | Empty app entitlements; no tracking/collected types; UserDefaults reason `CA92.1` |
| Debug native compile | Pass on 2026-08-22 for generic `iphoneos`, including a second build after Expo/pod patch updates; dependency warnings were emitted, no build error |
| Recursive signature | Pass: 11/11 embedded frameworks valid; `codesign --verify --deep --strict` passed for the app |
| Physical install/runtime matrix | Partial pass: the earlier development install covers launch, lifecycle, EAN-13, permissions, known/unknown/OFF/offline/retry/cache/provenance; the post-patch build is installed/launched with owner-side home confirmation pending; see `docs/final/PHYSICAL_IOS_VALIDATION.md` |

Official Expo and Apple requirements were rechecked on 2026-08-10. Expo SDK 57 requires Xcode 26.4+ and iOS 16.4+; Xcode 26.6 supports this host. Apple permits local Personal-Team testing with seven-day provisioning limits. The observed profile did expire after seven days; a renewed build/install on 2026-08-22 restored the development run. This is not release/TestFlight evidence.

## Passing evidence

| Command/evidence | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Pass from the locked dependency graph |
| `pnpm validate` | Pass: format, lint, strict typecheck, 133 application tests plus two repository-policy regressions, package/API builds and 12-route Expo web export |
| Domain | 48 tests, 3 files |
| PostgreSQL migration/seed | 5 tests, 1 file; full 26-table PGlite execution |
| Data providers | 14 tests, 2 files |
| Recycling engine | 8 tests, 1 file |
| Localization | 3 tests, 1 file |
| Application resolution/cache | 8 tests, 1 file |
| API | 12 tests, 2 files |
| Mobile state/config/storage/contrast | 35 tests, 9 files |
| **Application subtotal** | **133 tests, 20 Vitest files** |
| Repository policy | 2 Node tests proving generated native trees stay outside Biome and the strict dependency-age policy cannot silently disappear |
| **Automated total** | **135 tests** |
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
- On the physical iPhone, the same known GTIN resolved through OFF in 343 ms and the owner confirmed the Nutella screen, component guidance, textual confidence/percentage, explanation, product-source/licence/attribution disclosures and rule source/date. OFF product, OFF licence and RINKI rule links opened their expected pages.
- A physical EAN-13 package decoded and produced a single safe `not_found` result; the privacy-safe server observation completed in 162 ms without raw-GTIN logging.
- Airplane mode produced the offline screen with no API request. Restoring network and retrying recovered without re-entry and returned a cache hit in 8 ms.
- Camera pre-permission explanation, allow, permission revocation while backgrounded, denied recovery UI, deep-link to app settings and permission restoration all worked on-device. Initial system-prompt denial remains unrun.
- Manual `123` produced `Tarkista koodi` and generated no API request.

## Bundle/performance evidence

- Expo export: 12 static routes, 62 files, about 5.4 MiB total.
- Main web entry: 2,528,030 bytes uncompressed; 571,827 bytes gzip.
- Secondary web chunk: 45,171 bytes uncompressed; 14,833 bytes gzip.
- The entry exceeds the documented 2 MiB warning threshold. No native startup, memory, frame pacing, camera latency or battery claim is made.

## Compatibility evidence

| Check | Result |
| --- | --- |
| Explicit supply-chain age policy | `minimumReleaseAge: 1440` and strict enforcement in `pnpm-workspace.yaml`; lockfile verification passes |
| `expo install --check` | Pass after six SDK-supported patch updates |
| Expo Doctor 1.20.1 | **20/20** |
| `pnpm peers check` | Pass: no peer dependency issues |

## Unavailable mandatory evidence

| Check | Actual result | Classification |
| --- | --- | --- |
| Android compile/sign/install | Unavailable: no Java runtime, Android SDK/ADB/EAS credentials | External blocker |
| iOS release archive/TestFlight | Development compile/sign/install passes, but no paid-program archive, TestFlight processing or release-configuration install exists | External account/signing/store blocker |
| Physical barcode matrix | Partial: one EAN-13 and permission/recovery paths pass; EAN-8, UPC-A, UPC-E rejection, glare/distance/damage/multiple/rapid cases remain | Physical/manual blocker |
| VoiceOver/TalkBack/large text | Not run | Physical/manual blocker; iPhone is now available, Android is not |
| Production API/database/monitoring | Does not exist | External infrastructure blocker |
| Backup/restore/load/failover | Not run | External infrastructure blocker |
| Store console/binary validation | Not run | External account/signing blocker |
| Audit-commit remote CI | Not run; audit was not pushed | Publication not authorized |

No unavailable test is recorded as passed by simulation or documentation.
