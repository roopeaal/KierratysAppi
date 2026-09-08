# Xcode 27 beta development validation

Evidence date: 2026-09-08. Source: local `main` at `a6af06c` before documentation changes. Scope: the existing Expo 57 development client on the owner's iPhone; no dependency or application-source change.

Decision: **Xcode 27 SDK build rejected for current runtime. Xcode 26.6 development artifact restored.**

## Toolchain and artifact

- Host: Apple M1, macOS Tahoe 26.7 (`25G227`).
- Tested Xcode: 27 beta 6 (`27A5252f`) at `/Applications/Xcode-beta.app`, iOS 27 SDK. `xcodebuild -checkFirstLaunchStatus` passes.
- Retained toolchain: Xcode 26.6 (`17F113`) at `/Applications/Xcode.app`. System `xcode-select` remains `/Library/Developer/CommandLineTools`; commands select beta with `DEVELOPER_DIR`.
- Device: paired iPhone 12 Pro Max on iOS 27.0; Developer Mode enabled, DDI services available and CoreDevice tunnel connected.
- Native dependency input: live `apps/mobile/ios`; `Podfile.lock` equals `Pods/Manifest.lock`. Expo 57.0.19, React Native 0.86.3, dev-client 57.0.18, dev-launcher 57.0.19 and dev-menu 57.0.18.
- Artifact: `work/xcode27-device.2T1Y9A/DerivedData/Build/Products/Debug-iphoneos/KierrtysAppi.app`, version 0.1.0/build 1. Embedded metadata confirms `DTXcodeBuild=27A5252f`, `DTSDKName=iphoneos27.0`.
- Executable SHA-256: `bf2c4831cdecf1b89dbfc8ffd346a8259c9a3d7afc35434fbeda67c54c6784d7`.
- Personal-Team profile expiration: **2026-09-11 07:01:05 UTC**. The beta build reused the existing profile; changing Xcode did not extend its lifetime.

## Evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Fresh Debug device compilation | Pass | Separate DerivedData; `build.log` ends `BUILD SUCCEEDED`, command exits 0 |
| Signature integrity | Pass | App `codesign --verify --deep --strict`; all 11 embedded frameworks individually pass `codesign --verify --strict` |
| Physical installation | Pass | Beta `devicectl` install exits 0; `install.json` records success for the application's bundle identifier |
| Beta-built app startup | **Fail** | Initial launch request returned a PID, but the process immediately terminated with signal 5. Owner reported the app would not open. Crash stack identifies UIKit's `___UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption_block_invoke` |
| API/Metro | Pass | `/v1/health` and `/status` answer on the current LAN origin `192.168.10.43`; Metro starts with that API origin |
| Repository validation | Pass | Pinned pnpm 11.16.0; format/lint/strict types, 13 policy and 154 application tests, package/API builds and 12 web routes; `validate.log` |
| Beta XCTest automation runner | Pass for restored-app smoke | `TEST BUILD SUCCEEDED`; runner starts and inspects/interacts with the restored Xcode 26.6 binary. Initial capture failed because the beta-built target had terminated |
| Restored Xcode 26.6 binary | Install and runtime pass | `restore-install.json`; Finnish Home, manual lookup, Nutella result, 0% unknown/55% partial confidence, Rinki/FI/date/version/verification and OFF attribution were observed through semantic interaction and screenshots |
| Restored app terminate/relaunch | Pass | `agent-device open` with `--relaunch --foreground` returned the interactive Finnish Home; Metro/API remained available |

Ignored raw evidence is under `work/xcode27-device.2T1Y9A/`. Logs may contain local paths and signing/device identifiers and must not be published unreviewed. A capture that encountered another foreground application was immediately removed and is excluded from evidence.

Compilation emits dependency deprecation/nullability and run-script-output warnings, plus precompiled Expo-module context warnings for Apple framework types. No compile error occurred. This does not establish that every beta SDK API works.

## Root cause and recovery

The generated `AppDelegate.swift` creates `UIWindow` in `didFinishLaunchingWithOptions`; it has no scene delegate or scene manifest. UIKit enforces scene adoption for apps linked against the iOS 27 SDK. `startup-crash.ips` records `EXC_BREAKPOINT`/`SIGTRAP` in that exact enforcement function. This occurs before JavaScript connects to Metro and is not an expired profile or a Metro failure.

The existing strictly signed Xcode 26.6/iOS 26.5 artifact was reinstalled over the rejected beta build without uninstalling or deleting application data. It rendered Home and passed the manual known-product flow through the same API/Metro and the new Xcode 27 automation runner. Retained screenshots: `work/ui-qa/2026-09-08-restored-home-ios.png`, `2026-09-08-restored-result-ios.png` and `2026-09-08-restored-provenance-ios.png`.

Continue compiling this Expo configuration with explicit `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer`. Beta may be used for the tested device tools, but must not become the app build default until a reproducible UIScene migration and lifecycle/deep-link regressions pass. That migration is locally executable engineering work, not an account or macOS-update blocker.

Official sources checked 2026-09-08:

- Apple requirement and migration: <https://developer.apple.com/documentation/uikit/transitioning-to-the-uikit-scene-based-life-cycle>.
- Apple engineer confirms the requirement is tied to the new SDK and older SDK builds continue working: <https://developer.apple.com/forums/thread/832787>.
- Related Expo-generated template report, corroborating rather than replacing our physical crash evidence: <https://github.com/expo/expo/issues/46664>.

## Reproduction

Resolve the existing owner's signing team from the already signed development artifact without printing account identifiers. Use a fresh ignored DerivedData path and the live workspace:

```sh
DEVELOPER_DIR=/Applications/Xcode-beta.app/Contents/Developer \
xcodebuild \
  -workspace apps/mobile/ios/KierrtysAppi.xcworkspace \
  -scheme KierrtysAppi -configuration Debug -sdk iphoneos \
  -destination 'generic/platform=iOS' \
  -derivedDataPath '<fresh ignored DerivedData path>' -jobs 4 \
  -allowProvisioningUpdates CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM='<existing owner team>' build
```

Verify the app and embedded frameworks, then install with beta `xcrun devicectl device install app`. Launch with the current LAN development-client payload after checking both API and Metro health. For physical devices, the installed agent-device 0.20.10 rejects simulator/Android-only runtime-hint flags; use `devicectl --payload-url` and then plain agent-device app opening. Close the exact prior automation session before opening a new toolchain-specific session.

This Debug target sets `SKIP_BUNDLING=1`: it still requires Metro and the locally running API. No standalone Release/Ad Hoc/archive/TestFlight, profile extension, camera quality, VoiceOver, performance or store-readiness claim is made. Production remains **NO-GO**.
