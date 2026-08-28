# Test evidence

Evidence date: 2026-08-28. Host: macOS and local Node 26.4.0. The host-global pnpm is 11.19.0, while all final validation commands used `corepack pnpm` at the project pin 11.16.0; production/CI/EAS Node remains pinned to 24.19.0.

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
| Debug native compile | Pass on 2026-08-22 and 2026-08-26 for generic `iphoneos`; a fresh 2026-08-28 build also contains `expo-dev-client`/dev-launcher/dev-menu 57.0.16. Dependency build-script warnings were emitted, no build error |
| Recursive signature | Pass: 11/11 embedded frameworks valid; `codesign --verify --deep --strict` passed for the app |
| Physical install/runtime matrix | Partial pass: development installs cover lifecycle, EAN-13, permissions, known/unknown/OFF/offline/retry/cache/provenance and controlled backend-unavailable recovery. The rebuilt development client launches without the earlier null script URL and physically rendered the redesigned Home/manual/answer-first result; see `docs/final/PHYSICAL_IOS_VALIDATION.md` |

Official Expo and Apple requirements were rechecked on 2026-08-28. Expo's current development-build guidance requires an SDK-compatible `expo-dev-client` for the launcher/tooling expected by this profile and requires a rebuild after native dependency changes. Apple requires Xcode 26/iOS 26 SDK uploads and permits local Personal-Team testing with seven-day provisioning limits. The observed profile did expire after seven days; a renewed build/install on 2026-08-22 restored the development run. This is not release/TestFlight evidence.

## Passing evidence

| Command/evidence | Result |
| --- | --- |
| `corepack pnpm install --frozen-lockfile` | Pass from the locked dependency graph with pnpm 11.16.0 |
| `corepack pnpm validate` | Pass: format, lint, strict typecheck, 154 application tests plus eight repository-policy regressions, package/API builds and 12-route Expo web export |
| Domain | 48 tests, 3 files |
| PostgreSQL migration/seed | 5 tests, 1 file; full 26-table PGlite execution |
| Data providers | 14 tests, 2 files |
| Recycling engine | 8 tests, 1 file |
| Localization | 3 tests, 1 file |
| Application resolution/cache | 8 tests, 1 file |
| API | 12 tests, 2 files |
| Mobile state/config/storage/contrast/accessibility/presentation | 56 tests, 11 files |
| **Application subtotal** | **154 tests, 22 Vitest files** |
| Repository policy | 8 Node tests covering generated-tree exclusion, strict dependency age, development-client profile/runtime parity, text-input names, dynamic iOS announcements, critical automation IDs and uncapped font scaling |
| **Automated total** | **162 tests** |
| `corepack pnpm test:coverage` | Pass; all 154 application tests reran with coverage |
| `corepack pnpm security:audit` | Pass policy: two exact high build-tool advisories reviewed and accepted only until 2026-09-10 |
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
| API | 95.58% | 91.48% | 93.33% | 97.01% |
| Mobile tested modules | 70.75% | 79.51% | 57.14% | 73.40% |
| Localization | 100% | 100% | 100% | 100% |
| Database SQL | Not meaningfully represented by V8 | PGlite behavior tests are the evidence |

Mobile coverage excludes most rendered route/component code; it must not be interpreted as native UI acceptance.

## Live and visual evidence

- Real GTIN `3017620422003` resolved through local API → OFF to Nutella with four packaging components. Missing cap material remained unknown. Source, community status, combined ODbL/DbCL, attribution and retrieval date were visible.
- A controlled provider-unavailable fixture produced `Tietolähde ei vastaa` without classifying the product as unknown. After restoring the real API, the same Retry action recovered to Nutella without code re-entry; the API observation remained free of raw GTIN.
- Manual invalid GTIN produced a visible web alert. On physical iOS, VoiceOver exposed two defects: the placeholder became the field name and the alert was silent/interrupted. Explicit localized text-input labels and a high-priority iOS announcement path were added; VoiceOver then announced the correct EAN/GTIN field name/hint/trait and read the full validation instruction automatically.
- A later known-product run rendered Nutella but VoiceOver stayed on `Hae tuote`. The result screen now maps and announces loading plus every terminal lookup state. Six state expectations and repository policy pass; physical confirmation of this repair is deferred while functional and visual testing takes priority.
- Redesigned Home, manual, resolved result, ambiguous result and offline recovery were inspected at 390×844 in Finnish; Home and result also passed English wrapping. Home/result at 1280×720 each measured zero horizontally overflowing DOM elements. Close/internal actions exposed button semantics, external rule/licence/provider sources remained links, and document language followed the UI language.
- Physical iPhone semantic inspection and 1284×2778 screenshots passed the redesigned Finnish Home, manual lookup and answer-first Nutella result. Scanner exposed localized Close and torch buttons; no live-camera screenshot was captured. The development automation toolbar overlaps the torch's top-right hit target, so the actual physical toggle is not claimed.
- Legal showed confirmed all-local-data deletion.
- Web browser state was restored and audit tabs finalized after inspection.
- On the physical iPhone, the same known GTIN resolved through OFF in earlier 343 ms evidence and in the updated UI run; current privacy-safe local observations included a 249 ms live lookup and 5 ms cache hit. The result placed destination/preparation/explanation before product metadata while retaining source/licence/attribution and full rule evidence.
- A physical EAN-13 package decoded and produced a single safe `not_found` result; the privacy-safe server observation completed in 162 ms without raw-GTIN logging.
- Airplane mode produced the offline screen with no API request. Restoring network and retrying recovered without re-entry and returned a cache hit in 8 ms.
- Camera pre-permission explanation, allow, permission revocation while backgrounded, denied recovery UI, deep-link to app settings and permission restoration all worked on-device. Initial system-prompt denial remains unrun.
- Manual `123` produced `Tarkista koodi`, generated no API request and, after repair, announced the complete validation instruction through VoiceOver without requiring focus on the error.

## Bundle/performance evidence

- Expo export: 12 static routes.
- Main web entry: 2,539,834 bytes uncompressed; 575,888 bytes gzip. This is 10,242 bytes / 3,604 gzip larger than the prior baseline and remains above budget.
- Secondary web chunk: 45,171 bytes uncompressed; 14,831 bytes gzip.
- The entry exceeds the documented 2 MiB warning threshold. An `agent-device perf frames` attempt returned no matched app process and zero captured frames, so it is invalid evidence; no native startup, memory, frame pacing, camera latency or battery claim is made.

## Compatibility evidence

| Check | Result |
| --- | --- |
| Explicit supply-chain age policy | `minimumReleaseAge: 1440` and strict enforcement in `pnpm-workspace.yaml`; lockfile verification passes |
| `expo install --check` | **Fail as of 2026-08-28:** eight supported patch mismatches. The newest required Expo/constants/font patches are blocked by the strict age gate until 2026-08-29 10:49 UTC; no exclusion/bypass was used |
| Expo Doctor 1.20.1 | **19/20** for the same eight patch mismatches; the other 19 checks pass |
| `corepack pnpm peers check` | Pass: no peer dependency issues |

## Unavailable mandatory evidence

| Check | Actual result | Classification |
| --- | --- | --- |
| Android compile/sign/install | Unavailable: no Java runtime, Android SDK/ADB/EAS credentials | External blocker |
| iOS release archive/TestFlight | Development compile/sign/install passes, but no paid-program archive, TestFlight processing or release-configuration install exists | External account/signing/store blocker |
| Physical barcode matrix | Partial: one EAN-13 and permission/recovery paths pass; EAN-8, UPC-A, UPC-E rejection, glare/distance/damage/multiple/rapid cases remain | Physical/manual blocker |
| VoiceOver/TalkBack/large text | Partial iPhone VoiceOver pass: home/scanner/manual-invalid subset; async result repair passes locally but awaits device retest; TalkBack, largest text and remaining recovery flows are unrun | Physical/manual blocker; broader accessibility follows functional/visual work, Android is unavailable |
| Production API/database/monitoring | Does not exist | External infrastructure blocker |
| Backup/restore/load/failover | Not run | External infrastructure blocker |
| Store console/binary validation | Not run | External account/signing blocker |
| Audit-commit remote CI | Not run; audit was not pushed | Publication not authorized |

No unavailable test is recorded as passed by simulation or documentation.
