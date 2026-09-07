# Physical iOS validation

Status date: 2026-09-07

Status: **PARTIALLY RUN — the current Expo 57 client launches through Metro and its Home, manual-entry and known-product result/provenance smoke passes; camera, VoiceOver, release and the wider physical matrix remain unverified on this binary**

This report is deliberately separate from simulator, web and generated-configuration evidence. No physical-device row may become Pass without observing the named build on the recorded iPhone.

## Test identity

| Field | Value |
| --- | --- |
| Repository source | Local `main` at `77ad397`; ahead of `origin/main` by nine commits before this run. No push/publication was performed. |
| App version/build | `0.1.0` / iOS build `1` |
| Bundle identifier | `fi.roopeaaltonen.kierratysappi` |
| Host | Apple M1, macOS Tahoe 26.7 (`25G227`) for the 2026-09-07 run; the 2026-09-04 rebuild used 26.7 (`25G220`) and earlier August evidence used 26.5.2 |
| Xcode | 26.6 (`17F113`), iOS 26.5 SDK; commands use an explicit `DEVELOPER_DIR` because system `xcode-select` remains on Command Line Tools |
| Selected install method | Local Xcode development build and `devicectl` install using automatic Personal-Team signing |
| Signing scope | Apple Personal Team is sufficient for local testing; seven-day provisioning limits apply |
| iPhone model | iPhone 12 Pro Max |
| iOS version | 27.0 (`24A5424a`) for the 2026-09-07 current-client smoke; historical August evidence used 26.1 (`23B82`) |
| Tester | Repository owner for manual observations; Codex for build/device/API/Metro logs |
| Physical run date | 2026-09-07 current-client Home/manual/result smoke; 2026-09-04 fresh signed install/launcher and failed Metro connection; 2026-08-10/22/26/28 earlier-client evidence |
| Screenshots/logs | 2026-09-07 semantic trees, API/Metro/device connection observations and ignored screenshots: `work/ui-qa/2026-09-07-home-fi-ios.png`, `work/ui-qa/2026-09-07-known-product-result-top-fi-ios.png` and `work/ui-qa/2026-09-07-known-product-provenance-fi-ios.png`. Ignored `work/ui-qa/after-home-fi-ios-physical.png` and `after-result-fi-ios-physical.png` are historical 2026-08-28 captures. No live camera frame was captured. |

## Automated preflight evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Git synchronization | Pass as inspection; not pushed | Before the 2026-09-07 run, local `main` HEAD was `77ad397`, ahead of `origin/main` by nine commits. No push authorization exists and no publication was performed. |
| Host compatibility | Pass | macOS Tahoe 26.7 is in Xcode 26.6's supported macOS 26.2–26.x range; local tool invocation and native build pass. |
| Full Xcode | Pass | Xcode 26.6 and the iOS 26.5 SDK are installed and usable through explicit `DEVELOPER_DIR`. |
| Expo/iOS compatibility | Pass for checked source/build/runtime scope | 2026-09-04 Expo 57.0.19 / RN 0.86.3 / dev-client 57.0.18 passes frozen install, peers, Expo install check and Doctor 20/20 without exclusions; native pod manifest/lock and versions agree. On 2026-09-07 this installed client also reached Home, manual entry and a known-product result through the current Metro bundle. This is not broader native or release acceptance. |
| Native generation | Pass | A clean ignored-workspace `expo prebuild --clean --platform ios --no-install` completed. |
| Bundle/version | Pass | Generated project has bundle ID `fi.roopeaaltonen.kierratysappi`, marketing version `0.1.0` and build `1`. |
| Camera purpose | Pass configuration | Finnish and English `NSCameraUsageDescription` state barcode-only camera use and no frame upload. |
| Unrelated purpose strings | Pass configuration | No microphone or location usage description is generated. Location is not used by the current product. |
| Development compile | Pass | Fresh 2026-09-04 live-workspace generation, 111-pod installation and Xcode Debug `iphoneos` build pass with Expo 57.0.19 / RN 0.86.3 / dev-client 57.0.18. Dependency build-script warnings remain; no build error occurred. |
| Development signature | Pass | All 11 embedded frameworks passed strict signature verification and the app passed recursive `codesign --verify --deep --strict`. This is development evidence, not App Store archive evidence. |
| Development install/launch | Pass for current development smoke | The 2026-09-04 fresh install and launcher/onboarding pass. On 2026-09-07 the same current Expo 57 client launched through Metro at `192.168.10.43`, requested the bundle over multiple phone-to-Mac TCP connections, and passed Home/manual/known-result smoke. The profile is valid until 2026-09-11 07:01:05 UTC. This is development evidence only. |
| Entitlements | Partial | Development signing/install passes. Final archive entitlements remain unverified. |
| Privacy manifest | Pass configuration | No tracking or collected data types; UserDefaults required-reason API uses `CA92.1`. Final dependency-merged archive remains unverified. |
| Icons/splash | Pass generation | App icon, splash logo at 1x/2x/3x, splash background and storyboard are generated from source assets. |
| Appearance/orientation | Pass configuration | Automatic light/dark style; phone portrait scope. iPad remains configured for portrait and landscape. |
| EAS development profile | Source invariant repaired | `developmentClient:true`, internal distribution and Node 24.19.0 exist; the matching `expo-dev-client` dependency and a repository-policy regression now exist. EAS itself was not invoked. |

The current development build is under ignored `work/ios-dev-client-2026-09-04-derived/`, generated from live `apps/mobile/ios`, not stale copied staging. It is a short-lived Personal-Team development artifact, not an archive, TestFlight build or release artifact. The previous profile expired on 2026-08-29; the new profile expires 2026-09-11 07:01:05 UTC. On 2026-09-07 API and Metro health passed on localhost and the current Mac LAN address, and the phone established multiple TCP connections to Metro. The first known-product attempt still displayed offline because the running client had loaded a stale 2026-09-04 Metro bundle containing that day's API address. Metro was safely restarted with the current `EXPO_PUBLIC_API_BASE_URL`, the app was relaunched, and the same flow resolved normally. The prior 2026-09-04 connection failure remains historical evidence in ignored `work/ui-qa/2026-09-04-ios-dev-client-connection-error.png`.

## Physical test matrix

Rows not exercised remain **Not run**. `Pass` means the named behavior was observed on the recorded iPhone; it does not generalize to other hardware, release configuration or stores. The current-client evidence is enumerated immediately below. Unless a later row explicitly says **2026-09-07 current client**, its Pass/Partial observation is historical evidence from the 2026-08-10–28 clients and must not be treated as retested on the current Expo 57 binary.

### Current-client smoke — 2026-09-07

| Scenario | Status | Evidence/notes |
| --- | --- | --- |
| Development launch through current Metro | Pass | API and Metro responded on localhost and LAN address `192.168.10.43`; the phone established multiple TCP connections and rendered the app bundle. |
| Finnish Home | Pass | Interactive semantic tree exposed the expected Home content and actions; screenshot: `work/ui-qa/2026-09-07-home-fi-ios.png`. |
| Manual-entry flow | Pass | The interactive semantic flow reached manual entry and accepted the known valid product lookup. This does not validate VoiceOver reading order or Dynamic Type. |
| Stale development bundle handling | Pass after service correction | The first lookup correctly rendered offline because the already loaded 2026-09-04 Metro bundle contained an old API address. Metro was safely restarted with the current API base and the client was relaunched; no application-data or device-setting mutation was required. |
| Known-product result, answer first | Pass | The repeated lookup resolved and placed component sorting guidance before product identity. The top result preserved one unknown material at 0% and showed plastic collection at 55% partial confidence; screenshot: `work/ui-qa/2026-09-07-known-product-result-top-fi-ios.png`. |
| Known-product provenance | Pass | The lower result retained Rinki/FI source, checked date `2026-08-10`, rule version and verified status alongside Nutella identity; screenshot: `work/ui-qa/2026-09-07-known-product-provenance-fi-ios.png`. |

All camera, lifecycle, VoiceOver, appearance, performance, battery and wider barcode-matrix observations below remain historical or Not run for the 2026-09-07 client.

### Installation and lifecycle

| Scenario | Status | Evidence/notes |
| --- | --- | --- |
| Fresh install and first launch | Pass | Development build installed and launched on 2026-08-10; renewed builds installed/launched on 2026-08-22 and 2026-08-26 |
| Cold start | Partial | Force-quit relaunch reached interactive UI; no release-build tap-to-interactive timing captured |
| Warm start | Not run | Measure from icon tap to interactive home |
| Background → foreground | Pass | Owner confirmed return worked |
| Force quit → relaunch | Pass | Owner confirmed force-quit relaunch worked |
| Lock → unlock while open | Partial | App returned, but a transient development-only Expo CLI warning appeared; DevTools showed a temporary CLI connectivity warning |
| Safe areas and Dynamic Island/notch | Not run | Record device form factor |
| Keyboard avoidance/manual entry | Partial | Standard-size manual input and numeric Search submission worked with VoiceOver; largest text remains unrun |
| Light and dark appearance | Not run | Check all result states |
| Portrait behavior | Not run | Phone is portrait-only by configuration |

### Camera permission

| Scenario | Status | Evidence/notes |
| --- | --- | --- |
| Context screen appears before system prompt | Pass | Barcode-specific explanation appeared before the iOS prompt |
| Allow camera | Pass | iOS prompt appeared and allowing it opened the live scanner |
| Deny camera | Not run | Manual entry and recovery must remain available |
| Enable later in iOS Settings | Pass | `Avaa asetukset` opened the app settings; re-enabling Camera restored the scanner without a second prompt |
| Revoke while app is backgrounded | Pass | Revoking Camera in Settings changed the scan route to the denied/recovery UI |
| Permission change after force quit | Not run | Requires relaunch |

### Barcode scanner

| Scenario | Status | Evidence/notes |
| --- | --- | --- |
| Valid EAN-13 | Pass | Physical package decoded and produced the safe `not_found` flow; API recorded one successful `not_found` completion in 162 ms without logging the raw GTIN |
| Valid EAN-8 | Not run | Supported format |
| Valid UPC-A | Not run | Supported format |
| UPC-E/unsupported format | Not run | Must not become a guessed GTIN or start a lookup |
| Malformed/invalid checksum manual value | Pass | Manual `123` showed `Tarkista koodi`; API log remained empty |
| Duplicate callback suppression | Not run | One lookup for rapid identical callbacks |
| Close range | Not run | Record approximate distance |
| Farther range | Not run | Record approximate distance |
| Oblique angles | Not run | Multiple angles |
| Low light | Not run | Record conditions |
| Glare | Not run | Record conditions |
| Partially obscured barcode | Not run | Must not guess |
| Multiple visible barcodes | Not run | Record selected behavior |
| Rapid repeated scans | Not run | Observe haptics and request count |
| Torch control | Partial | The redesigned physical scanner semantic tree exposed localized `Sytytä valo`; the development automation toolbar overlaps the top-right target, so an actual on/off toggle is not claimed |

### Product lookup and network state

| Scenario | Status | Evidence/notes |
| --- | --- | --- |
| Known Open Food Facts food product | Pass | **2026-09-07 current client:** manual lookup resolved to Nutella after Metro was restarted with the current API base. **Historical 2026-08 client:** the same product resolved through OFF and the provider log completed in 343 ms. |
| Unknown valid GTIN | Pass | Physical EAN-13 showed `Tuotetta ei löytynyt`; no guessed product or sorting answer |
| Slow network | Not run | Use Network Link Conditioner or equivalent |
| Airplane mode/offline | Pass | Same known GTIN showed `Ei verkkoyhteyttä`; no API request was emitted |
| Restore network and retry | Pass | `Yritä uudelleen` recovered to Nutella without re-entering the code |
| Provider timeout/error | Pass for controlled unavailable fixture | Fixture produced provider-unavailable rather than unknown/offline; provider-specific timeout timing remains unrun |
| Backend unavailable | Pass | `Tietolähde ei vastaa` appeared with source-unavailable status; restoring the real backend and pressing Retry recovered to Nutella without code re-entry |
| Change network during lookup | Not run | Wi-Fi/cellular transition if available |
| Background app during lookup | Not run | Result/retry state must remain coherent |
| Cached result | Pass | Restored retry returned a cache hit in 8 ms; result retained cache/source disclosure |
| Stale result behavior | Not run | Requires controlled clock/cache fixture; never present stale as current |
| Malformed API response | Not run | Controlled fixture; must become provider unavailable |
| Long product name | Not run | Controlled fixture and largest text |
| Missing image | Not run | No broken layout or implied image requirement |

### Recycling guidance

| Scenario | Status | Evidence/notes |
| --- | --- | --- |
| Component-level sorting | Pass for known fixture and redesigned presentation | **2026-09-07 current client:** the top result showed answer-first component guidance, preserved one unknown material at 0%, and showed plastic collection at 55% partial confidence. This remains one product fixture, not full content acceptance. |
| Source/provenance/rule date | Pass for known fixture | **2026-09-07 current client:** the lower result showed Rinki as source, FI jurisdiction, checked date `2026-08-10`, rule version and verified status, with Nutella identity. **Historical 2026-08 client:** product licence/attribution and source links were also exercised. |
| Confidence and verification state | Pass for known fixture | **2026-09-07 current client:** partial confidence was exposed as 55% and the unresolved material remained unknown at 0% rather than receiving a guessed destination. Historical no-source cases also explicitly stated that no verified rule was applied. |
| Ambiguous packaging | Not run | Must ask/retain uncertainty |
| Missing packaging information | Not run | Must remain unknown |
| Confirmed material code | Not run | User confirms visible code |
| Unsupported/composite material code | Not run | Must not guess a destination |
| Deposit status uncertainty | Not run | Must not default to material collection |
| Correction/feedback draft | Not run | Warn against personal data; remain local |

### Accessibility and motion

| Scenario | Status | Evidence/notes |
| --- | --- | --- |
| Dynamic Type through largest accessibility size | Not run | All core flows operable |
| VoiceOver focus order | Partial | Direct-touch navigation passed from home scan action to scanner title/close and back to manual entry. Full sequential swipe order, permission recovery, results and settings remain unverified. |
| VoiceOver labels/traits/hints | Partial | Home scan action announced `Skannaa pakkaus`, button trait and privacy/purpose hint; scanner title and close link were named; manual action and corrected EAN/GTIN text-field name/hint/trait were announced. Remaining screens are unrun. |
| VoiceOver error recovery | Partial | Initial manual-invalid alert was visible but silent, then its first explicit announcement was interrupted by button focus. The locally repaired high-priority iOS announcement was physically confirmed to read the full `Tarkista koodin numerot...` message. Offline/provider states remain unrun. |
| VoiceOver asynchronous lookup result | Failed, repaired locally; retest deferred | Nutella rendered during a known-product run, but VoiceOver remained on `Hae tuote`. Loading and all terminal lookup states now use a pure tested announcement mapping; the device retest is deferred until after functional and visual work. |
| Increase Contrast | Not run | Information remains legible |
| Reduce Motion | Not run | No essential information loss; transitions suppressed |
| Button Shapes/related options | Not run | Actions remain distinguishable |
| Touch targets | Not run | Minimum 44×44 pt |
| Non-color communication | Not run | Confidence/errors/status include text or icon semantics |

### Performance and resilience

| Scenario/metric | Status | Evidence/notes |
| --- | --- | --- |
| Cold-start time | Not run | Xcode release/debug context must be named |
| Camera-open latency | Not run | Measure tap to usable preview |
| Barcode-decode latency | Not run | Physical label, repeated samples |
| Scan-to-result latency | Not run | Separate API/provider latency |
| Visible frame drops | Measurement unavailable | 2026-08-28 xctrace Animation Hitches attempt matched no app process and captured zero frames; its reported zero dropped frames is invalid and not accepted as a pass |
| Memory warnings/leaks | Not run | Xcode memory graph/Instruments if available |
| Unexpected heat | Not run | Record duration and device state |
| Battery impact | Not run | Extended camera session; record duration/percentage/context |
| Excess repeated API requests | Not run | Inspect privacy-safe request counts, not raw GTIN logs |
| Force quit/relaunch recovery | Pass functionally | Development build relaunched after force quit; no performance timing captured |
| Backend/provider failure recovery | Pass functionally | Controlled unavailable response rendered correctly; restoring the API and retrying recovered without re-entry. Current privacy-safe live/cache observations were 249 ms / 5 ms |
| Very large Dynamic Type under failures | Not run | Offline/provider/ambiguity screens |

## Defects and development-only observations

- The first 2026-08-10 Personal-Team artifact contained unsigned embedded frameworks even though the app wrapper was signed. The artifact was repaired by signing all 11 frameworks and re-signing/verifying the app before install. The clean 2026-08-22 Xcode build produced zero unsigned frameworks and passed strict recursive verification without the repair.
- The Personal-Team profile expired after seven days and iOS correctly refused launch. Renewing the Apple account/profile, rebuilding, reinstalling and trusting the renewed developer profile restored launch. This is an expected limitation of free local provisioning and remains unsuitable for distribution.
- After a lifecycle test, the development build displayed `Open debugger to view warnings`; the in-app button did not respond. Mac DevTools showed only a transient inability to reach Expo CLI. Metro then reconnected and no application warning remained. This does not validate production behavior and should be rechecked in a release build.
- On 2026-08-26, the stopped Metro service produced the development-client-only `No script URL provided` screen. Restarting the local API/Metro services and launching with the explicit LAN payload restored the app. This is expected for the development artifact and is not evidence about a self-contained release build.
- Independent inspection then found that `developmentClient:true` had no `expo-dev-client` dependency, so the installed shell was not actually a recoverable development client. A fresh prebuild/pod/Xcode artifact containing dev-client/dev-launcher/dev-menu fixed the null script URL failure; recursive app/framework signature verification, install, launch and Home/manual/result runtime checks passed. The policy test now fails any future mismatched profile.
- Physical VoiceOver testing found that `accessibilityLabelledBy` alone did not name the manual field on iOS: VoiceOver used the placeholder. Explicit localized `accessibilityLabel` values were added to all three text inputs; the manual field then announced `EAN- tai GTIN-koodi`, its text-field trait and hint.
- Physical VoiceOver testing found that a React Native `accessibilityRole="alert"` did not automatically announce the manual validation error on iOS. A centralized iOS announcement path now covers manual validation, material-code/component results, feedback save and local-data deletion. The manual error uses high priority because a queued/default announcement was physically observed to be interrupted; the repaired full announcement passed on the device.
- The later known-product VoiceOver run exposed an equivalent asynchronous state-change gap: Nutella rendered while speech remained on the earlier search button. The result route now explicitly announces loading, offline, invalid, not-found, provider-unavailable, resolved and packaging-missing states through a pure mapping with regression coverage. This source repair has not yet been physically reconfirmed.
- Preflight documentation defect fixed: `docs/quality/MANUAL_TEST_CHECKLIST.md` no longer claims UPC-E is supported and now requires safe rejection.

## Remaining boundary

Device-to-Mac connectivity plus Home/manual/known-result smoke now pass on the installed Expo 57 development client. The current binary still needs the wider camera/barcode matrix, VoiceOver, largest Dynamic Type, dark/reduced-motion, lifecycle and valid performance/battery tests. Release remains blocked until a paid-program release archive/TestFlight build, broader Apple device matrix and all remaining acceptance gates pass.
