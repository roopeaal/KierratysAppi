# Test evidence

## Owner-authorized GitHub synchronization — 2026-09-10

- Fresh fetch: no remote-only changes, 13 local-only commits, clean worktree. Default branch `main`, private `roopeaal/KierratysAppi`; no name/visibility/settings changes. Normal fast-forward push succeeded for `87404a0..dd48a62`; `git ls-remote origin refs/heads/main` exactly matched local implementation HEAD `dd48a626f19dcd9cc53fea597df678159aa9e67a`.
- Full pinned `PATH="$PWD/work/pnpm-check-shims.cqbctz:$PATH" pnpm validate` rerun passed: 20 repository policy + 165 application tests (**185 total**), formatting/lint/strict types, package/API builds and 12-route web export. `git diff --check origin/main..HEAD` passed before the push.
- Changed-path inspection found only `.env.example` among environment/credential-artifact filename patterns. Native projects/builds, local work/screenshots and dependency folders remain ignored. No local Gitleaks executable was available; this path check is not a substitute for GitHub's actual secret scan.
- For implementation HEAD `dd48a62`, [Security](https://github.com/roopeaal/KierratysAppi/actions/runs/34455323825) completed successfully: the Gitleaks secrets job passed; CodeQL was explicitly skipped by the existing private-repository gate, not passed. [CI](https://github.com/roopeaal/KierratysAppi/actions/runs/34455323779) was still running `pnpm validate` after checkout/tool setup/frozen installation passed. The follow-up documentation push starts its own checks; inspect the workflow for the exact final HEAD before claiming remote acceptance. No new live dependency-audit, physical/native-build, legal or store pass is implied.

## KeepItGreen display-name change — 2026-09-10

- Baseline: clean `44ca955`. Changed display/localized names and current brand copy only; application identifiers, provider/sorting behavior, storage keys and dependency graph are unchanged.
- Narrow regressions: `node --test scripts/__tests__/app-brand-policy.test.mjs` **3/3** and `corepack pnpm --filter @kierratysappi/localization test` **4/4** pass. The first test draft used two nonexistent localization keys; corrected to the actual `privacyDraft`/`deleteLocalDataBody` keys, then narrow and strict-type/full runs passed.
- Full `PATH="$PWD/work/pnpm-check-shims.cqbctz:$PATH" pnpm validate` with pinned pnpm 11.16.0: **pass**, 20 Node policy + 165 application tests in 22 Vitest files (**185 total**), formatting/lint/strict types, package/API builds and 12 static web routes. No new dependency or live security-audit pass is claimed.
- Browser reproduction: open local Metro web Home, set 390×844 viewport, inspect FI, select English, inspect again, restore FI and open Privacy and terms. Both Home wordmarks and accessible labels read KeepItGreen without clipping; the Finnish page has no document horizontal overflow. Privacy/deletion copy reads KeepItGreenin and the legal-review marker remains visible. No data-deletion action was triggered. Restore Home/FI and reset viewport after QA.
- Ignored local screenshots: `work/ui-qa/2026-09-10-design/keepitgreen-home-fi-390.png` and `keepitgreen-home-en-390.png`. This is browser evidence, not native launcher/VoiceOver/dark-mode acceptance.
- Export entry `entry-653e028d04f09527ac6625cb6a5be84d.js`: **2,548,479 bytes / 576,724 gzip**. The existing bundle warning remains; no performance improvement is claimed.
- Not run: native regeneration/build/install, signing renewal, cable-disconnected device flow or embedded-JS standalone runtime. The previous phone binary/profile is unchanged. Free/wireless procedure and current official sources: `docs/research/ios-free-wireless-development.md`. Release remains **NO-GO**; name rights/store availability need OA-10 approval.

## Visual refresh — 2026-09-10

- Full pinned `pnpm validate` passes: **181 tests** (17 policy + 164 application), format/lint/strict types, package/API builds and 12 exported web routes. No dependency or native-build change.
- Actual browser evidence covers scoped FI/EN Home/manual/result/guide, 320/390/1280 widths, invalid input, real OFF product resolution, controlled unreachable-API offline → local guide and ambiguous local-component guidance. Source/date/version/verification/confidence and OFF attribution remain present. Explicit web radio checked-state regressions were repaired and inspected.
- Screenshots, exact sizes, reproduction and limits: `design-refresh-evidence.md`. The new UI is **not physically accepted**: September 8 XCTest reopen timed out. Dark/largest native text/camera/VoiceOver/performance remain pending. Prior iPhone screenshots below describe the earlier design.

## Xcode 27 evaluation and restored-app smoke — 2026-09-08

- Source baseline `a6af06c`, clean before documentation changes. Xcode 27 beta 6 (`27A5252f`)/iOS 27 SDK fresh Debug compile passes; recursive app and 11 framework signatures pass; physical installation passes. **Runtime fails** immediately with `SIGTRAP` in UIKit's no-scene-lifecycle enforcement. An initial successful launch/PID return is not a startup pass.
- The generated Expo AppDelegate still owns its window through the old app lifecycle. Apple requires UIScene when linking against iOS 27. Xcode 27 app compilation is therefore rejected for this configuration pending migration; see `XCODE_27_VALIDATION.md` for crash evidence, exact sanitized build procedure and official sources.
- Restored the signed Xcode 26.6/iOS 26.5 artifact over the failing app without deleting app data. Finnish Home → manual known-product lookup → Nutella result, unknown 0%/partial 55% confidence, Rinki/FI/checked-date/version/verification and OFF licence/attribution passed through the beta-built automation runner. Terminate/relaunch returned interactive Home.
- Privacy-safe screenshots: ignored `work/ui-qa/2026-09-08-restored-home-ios.png`, `2026-09-08-restored-result-ios.png`, `2026-09-08-restored-provenance-ios.png`. A capture of an unrelated foreground surface was removed immediately and is not evidence.
- Full pinned `pnpm validate` passes: 13 policy + 154 application tests (167 total), format/lint/strict types, package/API builds and 12 web routes. Logs/artifacts: ignored `work/xcode27-device.2T1Y9A/`. No new dependency/live-security-audit pass is claimed.
- Beta device tooling works; app builds continue with explicit Xcode 26.6. System default remains Command Line Tools. Profile expiration remains **2026-09-11 07:01:05 UTC** and the Debug client still needs Metro/API. Camera, VoiceOver, Release/TestFlight, performance and wider matrix were not tested in this run.

## Physical iPhone current-client smoke — 2026-09-07

- Post-evidence repository validation: full `pnpm validate` passed through the isolated Corepack shim at the repository pin, pnpm 11.16.0. Format, lint and strict type checks passed; 13 repository-policy tests plus 154 application tests passed; all package/API builds and the 12-route web export passed.
- Repository identity before this run: local `main` at `77ad397`, nine commits ahead of `origin/main`; no push or publication was performed.
- Host/device identity: Apple M1 on macOS Tahoe 26.7 (`25G227`), Xcode 26.6 (`17F113`), and a connected iPhone 12 Pro Max on iOS 27.0 (`24A5424a`) as reported by `xcdevice`/XCTest.
- Runtime connectivity: the Mac API and Metro health endpoints passed on localhost and LAN address `192.168.10.43`. The installed Expo 57 development client launched through that Metro origin, and the phone established multiple TCP connections to Metro.
- Home: the Finnish Home interactive semantic tree and screenshot passed on the physical iPhone. Evidence: ignored `work/ui-qa/2026-09-07-home-fi-ios.png`.
- Manual entry: the interactive semantic flow reached the manual product-code form and submitted the known valid product lookup. This is functional semantic evidence, not a VoiceOver reading-order or Dynamic Type pass.
- The first known lookup correctly rendered the offline state because the client had loaded a stale 2026-09-04 Metro bundle containing that day's API address. Metro was safely restarted with the current `EXPO_PUBLIC_API_BASE_URL`, the client was relaunched, and the same manual flow then resolved normally.
- Answer-first result: the current client preserved one unknown material at **0%** rather than guessing, and showed plastic collection at **55% partial confidence**. Evidence: ignored `work/ui-qa/2026-09-07-known-product-result-top-fi-ios.png`.
- Provenance/result continuation: the lower page showed Rinki source, FI jurisdiction, checked date **2026-08-10**, rule version and verified status, plus Nutella identity. Evidence: ignored `work/ui-qa/2026-09-07-known-product-provenance-fi-ios.png`.
- Scope: this run does **not** pass camera scanning, VoiceOver, release configuration, performance, battery, dark mode, reduced motion, broader barcode cases or other physical-device lanes.

## Historical final rebuild and initial connection failure — 2026-09-04

- Host: macOS Tahoe 26.7 (`25G220`), Xcode 26.6 (`17F113`), local Node 26.4.0. The owner freed disk space; no user data cleanup was performed by Codex.
- Final frozen install, peer check, Expo install check and Doctor 1.20.1 **20/20** pass with the strict release-age policy intact. Expo 57.0.19 / RN 0.86.3 / dev-client 57.0.18 are installed. Isolated Corepack shims under ignored `work/pnpm-check-shims.cqbctz` verified nested pnpm **11.16.0**, avoiding the host's different global pnpm.
- Final `corepack pnpm validate`: **pass, 167 tests** (154 Vitest tests in 22 files plus 13 Node policy tests), formatting, lint, strict types, package/API builds and 12 web routes. Narrow API 12/12 and database 5/5 pass. Earlier concurrent runs exceeded the unchanged 5-second database test timeout while Xcode was compiling; the narrow and complete reruns passed after compilation without relaxing the test.
- Final coverage: **pass**, all 154 application tests. Core statement coverage is unchanged from the table below; mobile is 70.75% statements / 79.51% branches / 57.14% functions / 73.40% lines. SQL migration execution is tested; the JS coverage tool's 0/0 database output is not SQL coverage.
- Final bundle: entry **2,540,918 bytes / 575,233 gzip**; secondary **45,171 / 14,789 gzip**. No device performance claim follows from these sizes.
- Security: fast-uri 3.1.5/4.1.2 upgraded within their allowed major ranges to **3.1.7/4.1.4**. The post-update raw snapshot reports **0 high, 0 critical, 6 moderate, 1 low**. The final live `security:audit` retry **fails closed at 60 seconds**: the official audit POST endpoint also times out independently, while registry metadata GET returns 200. The live gate is externally blocked, not passed. No high/critical exceptions remain; five added regressions cover floors, severity enforcement and valid/invalid report handling.
- Native: live-workspace `expo prebuild --platform ios --no-install` regenerated ignored native files; incidental package-script changes were reverted. `pod install` completed with 111 pods; manifest/lock and JS/native versions agree. Fresh Xcode Debug `iphoneos` build **passes**, recursive app signature and **11/11 framework signatures pass**. Artifact: `work/ios-dev-client-2026-09-04-derived/Build/Products/Debug-iphoneos/KierrtysAppi.app`; ignored build log is alongside it. Profile expiration: **2026-09-11 07:01:05 UTC**.
- At the time of this 2026-09-04 run, physical install and development-launcher opening **passed**, but the explicit Metro origin showed `Error loading app` / connection refused, so Home/manual/result were not then reverified. Actual historical failure screenshot: `work/ui-qa/2026-09-04-ios-dev-client-connection-error.png`; no camera frame was captured. The later 2026-09-07 section above records the successful current-client connection and smoke.
- On 2026-09-04, API `/v1/health` and Metro `/status` responded correctly on localhost and that day's Mac LAN address, both bound all interfaces, and the macOS firewall permitted the actual Node executable with block-all disabled. No network/firewall setting was changed. The connectivity blocker documented that day was resolved for the 2026-09-07 current-client smoke.

## Earlier startup-only attempt — 2026-09-04

- `corepack pnpm install --frozen-lockfile`: pass with pnpm 11.16.0 after the interrupted eight-package Expo patch update. This is not full update acceptance.
- Local API `GET /v1/health`: pass, `{"status":"ok","version":"0.1.0"}`. Metro `GET /status`: pass, `packager-status:running`. Services were left running.
- Physical launch: **fail**, iOS refused the existing app with a signing/entitlement/trust security error. Extraction of only `ExpirationDate` from the last installed artifact's provisioning profile showed `2026-08-29T13:03:31Z`; `codesign --verify --deep --strict` still passed local artifact integrity. No device identifier, account identifier or signing secret is recorded here.
- Native compatibility remains unverified: installed fixture Expo 57.0.16 / RN 0.86.2 versus current JS Expo 57.0.18 / RN 0.86.3. About 2.3 GiB free disk space was observed; no new native build/install, physical Home pass or complete test suite was run in this startup-only request. No commit was made.

The remainder records the historical 2026-08-28 validation baseline, not a current pass for the updated dependencies.

Evidence date: 2026-08-28. Host: macOS and local Node 26.4.0. The host-global pnpm is 11.19.0, while all final validation commands used `corepack pnpm` at the project pin 11.16.0; production/CI/EAS Node remains pinned to 24.19.0.

## Physical iOS preflight — historical 2026-08-28 baseline

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

## Passing evidence — historical 2026-08-28 baseline

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

## Coverage evidence — historical 2026-08-28 baseline

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

## Live and visual evidence — historical through 2026-08-28

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

## Bundle/performance evidence — historical 2026-08-28 baseline

- Expo export: 12 static routes.
- Main web entry: 2,539,834 bytes uncompressed; 575,888 bytes gzip. This is 10,242 bytes / 3,604 gzip larger than the prior baseline and remains above budget.
- Secondary web chunk: 45,171 bytes uncompressed; 14,831 bytes gzip.
- The entry exceeds the documented 2 MiB warning threshold. An `agent-device perf frames` attempt returned no matched app process and zero captured frames, so it is invalid evidence; no native startup, memory, frame pacing, camera latency or battery claim is made.

## Compatibility evidence — historical 2026-08-28 baseline

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
| Audit-commit remote CI | September 10 `dd48a62` Gitleaks job passes, CodeQL skips; CI is running and final workflow outcome must be checked for the exact HEAD | Remote validation pending, not blocked by missing push authorization |

No unavailable test is recorded as passed by simulation or documentation.
