# Physical iOS validation

Status date: 2026-08-10

Status: **NOT RUN — waiting for full Xcode and the physical iPhone**

This report is deliberately separate from simulator, web and generated-configuration evidence. No physical-device row may become Pass without observing the named build on the recorded iPhone.

## Test identity

| Field | Value |
| --- | --- |
| Repository commit | `d41d248a321879361e970a6c66b7845c7938882e` at preflight; local `main` was two commits ahead of `origin/main` |
| App version/build | `0.1.0` / iOS build `1` |
| Bundle identifier | `fi.roopeaaltonen.kierratysappi` |
| Host | Apple M1, macOS 26.5.2 (`25F84`) |
| Xcode | Not installed; Command Line Tools only |
| Selected install method | Local Xcode 26.6 development build using `expo run:ios --device` and automatic signing |
| Signing scope | Apple Personal Team is sufficient for local testing; seven-day provisioning limits apply |
| iPhone model | Pending physical-device connection |
| iOS version | Pending physical-device connection |
| Tester | Pending |
| Physical run date | Pending |
| Screenshots/logs | Pending; do not use web screenshots as native evidence |

## Automated preflight evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Git synchronization | Pass as inspection; not pushed | Clean `main`; local HEAD `d41d248`, `origin/main` `87404a0`, ahead two. No prior push authorization exists. |
| Host compatibility | Pass | macOS 26.5.2 is in Xcode 26.6’s supported macOS 26.2–26.x range. |
| Full Xcode | **Blocked** | `/Applications` has no Xcode; `xcode-select -p` selects `/Library/Developer/CommandLineTools`; `xcodebuild -version` and `xcrun devicectl` are unavailable. |
| Expo/iOS compatibility | Configuration pass | SDK 57 requires Xcode 26.4+ and iOS 16.4+. Generated project target is iOS 16.4. |
| Native generation | Pass | A clean ignored-workspace `expo prebuild --clean --platform ios --no-install` completed. |
| Bundle/version | Pass | Generated project has bundle ID `fi.roopeaaltonen.kierratysappi`, marketing version `0.1.0` and build `1`. |
| Camera purpose | Pass configuration | Finnish and English `NSCameraUsageDescription` state barcode-only camera use and no frame upload. |
| Unrelated purpose strings | Pass configuration | No microphone or location usage description is generated. Location is not used by the current product. |
| Entitlements | Pass configuration | Generated app entitlements plist is empty. Final signed entitlements remain unverified. |
| Privacy manifest | Pass configuration | No tracking or collected data types; UserDefaults required-reason API uses `CA92.1`. Final dependency-merged archive remains unverified. |
| Icons/splash | Pass generation | App icon, splash logo at 1x/2x/3x, splash background and storyboard are generated from source assets. |
| Appearance/orientation | Pass configuration | Automatic light/dark style; phone portrait scope. iPad remains configured for portrait and landscape. |
| EAS development profile | Present but not selected | `developmentClient:true`, internal distribution and Node 24.19.0 exist. EAS is a fallback only and was not invoked. |

The generated inspection artifact is under ignored `work/ios-prebuild.YzkNSG/`. It is not a compiled binary and is not release evidence.

## Physical test matrix

Every row is currently **Not run**. Record Pass/Fail, measured value where applicable, and a screenshot/log identifier after the same build is installed.

### Installation and lifecycle

| Scenario | Status | Evidence/notes |
| --- | --- | --- |
| Fresh install and first launch | Not run | Requires device |
| Cold start | Not run | Measure from icon tap to interactive home |
| Warm start | Not run | Measure from icon tap to interactive home |
| Background → foreground | Not run | Requires device |
| Force quit → relaunch | Not run | Requires device |
| Lock → unlock while open | Not run | Requires device |
| Safe areas and Dynamic Island/notch | Not run | Record device form factor |
| Keyboard avoidance/manual entry | Not run | Include largest text |
| Light and dark appearance | Not run | Check all result states |
| Portrait behavior | Not run | Phone is portrait-only by configuration |

### Camera permission

| Scenario | Status | Evidence/notes |
| --- | --- | --- |
| Context screen appears before system prompt | Not run | Fresh permission state |
| Allow camera | Not run | Scanner must open |
| Deny camera | Not run | Manual entry and recovery must remain available |
| Enable later in iOS Settings | Not run | Scanner must recover after returning |
| Revoke while app is backgrounded | Not run | Must return to safe denied state |
| Permission change after force quit | Not run | Requires relaunch |

### Barcode scanner

| Scenario | Status | Evidence/notes |
| --- | --- | --- |
| Valid EAN-13 | Not run | Use physical label and record GTIN separately from routine logs |
| Valid EAN-8 | Not run | Supported format |
| Valid UPC-A | Not run | Supported format |
| UPC-E/unsupported format | Not run | Must not become a guessed GTIN or start a lookup |
| Malformed/invalid checksum manual value | Not run | Must remain local |
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
| Known Open Food Facts food product | Not run | Requires reachable development API and monitored test setup |
| Unknown valid GTIN | Not run | Must show not found |
| Slow network | Not run | Use Network Link Conditioner or equivalent |
| Airplane mode/offline | Not run | Must retain retry context locally |
| Restore network and retry | Not run | Must recover without duplicate request storm |
| Provider timeout/error | Not run | Requires controlled API/provider fixture |
| Backend unavailable | Not run | Must show provider unavailable, not fabricate result |
| Change network during lookup | Not run | Wi-Fi/cellular transition if available |
| Background app during lookup | Not run | Result/retry state must remain coherent |
| Cached result | Not run | Record request count and cache provenance |
| Stale result behavior | Not run | Requires controlled clock/cache fixture; never present stale as current |
| Malformed API response | Not run | Controlled fixture; must become provider unavailable |
| Long product name | Not run | Controlled fixture and largest text |
| Missing image | Not run | No broken layout or implied image requirement |

### Recycling guidance

| Scenario | Status | Evidence/notes |
| --- | --- | --- |
| Component-level sorting | Not run | Every component inspected |
| Source/provenance/rule date | Not run | Must remain visible and readable |
| Confidence and verification state | Not run | Must not be color-only |
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
| Force quit/relaunch recovery | Not run | Local settings/history semantics preserved |
| Backend/provider failure recovery | Not run | Restore service and retry |
| Very large Dynamic Type under failures | Not run | Offline/provider/ambiguity screens |

## Defects

- No physical defect can yet be claimed because the app has not been installed.
- Preflight documentation defect fixed: `docs/quality/MANUAL_TEST_CHECKLIST.md` no longer claims UPC-E is supported and now requires safe rejection.

## Remaining boundary

Install and initialize Xcode 26.6. After that, connect the iPhone and collect its exact model/iOS version before generating, signing or installing the app. Do not use passwords, verification codes, certificates or signing keys in repository files or chat.
