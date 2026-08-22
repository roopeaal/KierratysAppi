# Physical iOS validation

Status date: 2026-08-22

Status: **PARTIALLY RUN — development build installed; core iPhone flow passes, full matrix remains open**

This report is deliberately separate from simulator, web and generated-configuration evidence. No physical-device row may become Pass without observing the named build on the recorded iPhone.

## Test identity

| Field | Value |
| --- | --- |
| Repository source | Working tree based on `aae5fab00dd11f5bd451b27ad710432bbddc4fa5`; the 2026-08-22 dependency/evidence work unit is pending its local commit |
| App version/build | `0.1.0` / iOS build `1` |
| Bundle identifier | `fi.roopeaaltonen.kierratysappi` |
| Host | Apple M1, macOS 26.5.2 (`25F84`) |
| Xcode | 26.6 (`17F113`), iOS 26.5 SDK; commands use an explicit `DEVELOPER_DIR` because system `xcode-select` remains on Command Line Tools |
| Selected install method | Local Xcode development build and `devicectl` install using automatic Personal-Team signing |
| Signing scope | Apple Personal Team is sufficient for local testing; seven-day provisioning limits apply |
| iPhone model | iPhone 12 Pro Max |
| iOS version | 26.1 (`23B82`) |
| Tester | Repository owner for manual observations; Codex for build/device/API/Metro logs |
| Physical run date | 2026-08-10 and renewed-profile continuation on 2026-08-22 |
| Screenshots/logs | Interactive observations plus Xcode, `devicectl`, Metro and privacy-safe API logs; no native screenshots captured yet |

## Automated preflight evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Git synchronization | Pass as inspection; not pushed | Clean `main` at test start; local HEAD `aae5fab`, `origin/main` `87404a0`, ahead three. No prior push authorization exists. |
| Host compatibility | Pass | macOS 26.5.2 is in Xcode 26.6’s supported macOS 26.2–26.x range. |
| Full Xcode | Pass | Xcode 26.6 and the iOS 26.5 SDK are installed and usable through explicit `DEVELOPER_DIR`. |
| Expo/iOS compatibility | Pass | SDK 57 requires Xcode 26.4+ and iOS 16.4+. Generated project target is iOS 16.4; supported patches are installed, install check passes and Doctor 1.20.1 is 20/20. |
| Native generation | Pass | A clean ignored-workspace `expo prebuild --clean --platform ios --no-install` completed. |
| Bundle/version | Pass | Generated project has bundle ID `fi.roopeaaltonen.kierratysappi`, marketing version `0.1.0` and build `1`. |
| Camera purpose | Pass configuration | Finnish and English `NSCameraUsageDescription` state barcode-only camera use and no frame upload. |
| Unrelated purpose strings | Pass configuration | No microphone or location usage description is generated. Location is not used by the current product. |
| Development compile | Pass | Xcode Debug build completed for `iphoneos` on 2026-08-22, then passed again after the six Expo-compatible patch updates and refreshed pods. Dependency compiler warnings remain; no build error occurred. |
| Development signature | Pass | All 11 embedded frameworks passed strict signature verification and the app passed recursive `codesign --verify --deep --strict`. This is development evidence, not App Store archive evidence. |
| Development install/launch | Pass/confirmation pending for latest rebuild | The earlier renewed build loaded 1,801 modules and the owner confirmed home. After dependency updates, `devicectl` installed/launched the rebuilt app and Metro 57.0.15 loaded 1,804 modules; owner-side home confirmation is pending. |
| Entitlements | Partial | Development signing/install passes. Final archive entitlements remain unverified. |
| Privacy manifest | Pass configuration | No tracking or collected data types; UserDefaults required-reason API uses `CA92.1`. Final dependency-merged archive remains unverified. |
| Icons/splash | Pass generation | App icon, splash logo at 1x/2x/3x, splash background and storyboard are generated from source assets. |
| Appearance/orientation | Pass configuration | Automatic light/dark style; phone portrait scope. iPad remains configured for portrait and landscape. |
| EAS development profile | Present but not selected | `developmentClient:true`, internal distribution and Node 24.19.0 exist. EAS is a fallback only and was not invoked. |

The current development build is generated under ignored `work/ios-refresh-derived/`. It is a short-lived Personal-Team development artifact, not an archive, TestFlight build or release artifact. The free provisioning profile expired after seven days as expected and was renewed/reinstalled on 2026-08-22.

## Physical test matrix

Rows not exercised remain **Not run**. `Pass` means the named behavior was observed on the recorded iPhone; it does not generalize to other hardware, release configuration or stores.

### Installation and lifecycle

| Scenario | Status | Evidence/notes |
| --- | --- | --- |
| Fresh install and first launch | Pass | Development build installed and launched on 2026-08-10; renewed profile/build installed and launched on 2026-08-22 |
| Cold start | Partial | Force-quit relaunch reached interactive UI; no release-build tap-to-interactive timing captured |
| Warm start | Not run | Measure from icon tap to interactive home |
| Background → foreground | Pass | Owner confirmed return worked |
| Force quit → relaunch | Pass | Owner confirmed force-quit relaunch worked |
| Lock → unlock while open | Partial | App returned, but a transient development-only Expo CLI warning appeared; DevTools showed a temporary CLI connectivity warning |
| Safe areas and Dynamic Island/notch | Not run | Record device form factor |
| Keyboard avoidance/manual entry | Not run | Include largest text |
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

### Product lookup and network state

| Scenario | Status | Evidence/notes |
| --- | --- | --- |
| Known Open Food Facts food product | Pass | Manual `3017620422003` resolved to Nutella through OFF; provider log completed in 343 ms |
| Unknown valid GTIN | Pass | Physical EAN-13 showed `Tuotetta ei löytynyt`; no guessed product or sorting answer |
| Slow network | Not run | Use Network Link Conditioner or equivalent |
| Airplane mode/offline | Pass | Same known GTIN showed `Ei verkkoyhteyttä`; no API request was emitted |
| Restore network and retry | Pass | `Yritä uudelleen` recovered to Nutella without re-entering the code |
| Provider timeout/error | Not run | Requires controlled API/provider fixture |
| Backend unavailable | Not run | Must show provider unavailable, not fabricate result |
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
| Component-level sorting | Pass for known fixture | Owner confirmed component cards on the Nutella result; this is one fixture, not full content acceptance |
| Source/provenance/rule date | Pass for known fixture | Product source, licence, attribution, sorting-rule source and checked date were visible; OFF product, OFF licence and RINKI rule links opened the expected pages |
| Confidence and verification state | Pass for known fixture | Owner confirmed textual confidence/percentage, destination and explanation; uncertainty was not color-only |
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
| VoiceOver focus order | Not run | Home, permission, scanner alternative, result, errors, settings |
| VoiceOver labels/traits/hints | Not run | No unlabeled action controls |
| VoiceOver error recovery | Not run | Invalid/offline/provider states |
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
| Visible frame drops | Not run | Record screen/scenario |
| Memory warnings/leaks | Not run | Xcode memory graph/Instruments if available |
| Unexpected heat | Not run | Record duration and device state |
| Battery impact | Not run | Extended camera session; record duration/percentage/context |
| Excess repeated API requests | Not run | Inspect privacy-safe request counts, not raw GTIN logs |
| Force quit/relaunch recovery | Pass functionally | Development build relaunched after force quit; no performance timing captured |
| Backend/provider failure recovery | Not run | Restore service and retry |
| Very large Dynamic Type under failures | Not run | Offline/provider/ambiguity screens |

## Defects and development-only observations

- The first 2026-08-10 Personal-Team artifact contained unsigned embedded frameworks even though the app wrapper was signed. The artifact was repaired by signing all 11 frameworks and re-signing/verifying the app before install. The clean 2026-08-22 Xcode build produced zero unsigned frameworks and passed strict recursive verification without the repair.
- The Personal-Team profile expired after seven days and iOS correctly refused launch. Renewing the Apple account/profile, rebuilding, reinstalling and trusting the renewed developer profile restored launch. This is an expected limitation of free local provisioning and remains unsuitable for distribution.
- After a lifecycle test, the development build displayed `Open debugger to view warnings`; the in-app button did not respond. Mac DevTools showed only a transient inability to reach Expo CLI. Metro then reconnected and no application warning remained. This does not validate production behavior and should be rechecked in a release build.
- Preflight documentation defect fixed: `docs/quality/MANUAL_TEST_CHECKLIST.md` no longer claims UPC-E is supported and now requires safe rejection.

## Remaining boundary

Continue the remaining physical matrix, starting with VoiceOver and largest Dynamic Type on the home, permission, manual, offline and known-result flows. Release remains blocked until a paid-program release archive/TestFlight build, broader Apple device matrix and all remaining accessibility/performance/camera cases pass.
