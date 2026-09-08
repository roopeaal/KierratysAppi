# iOS 27 SDK scene-lifecycle requirement

Access date: 2026-09-08. Revalidation reason: a fresh Xcode 27 beta build compiled/installed but physically crashed at startup.

- Apple requires scene-based lifecycle adoption for apps built against the iOS 27 SDK. App delegates that own the initial window without a scene manifest/configuration must migrate: <https://developer.apple.com/documentation/uikit/transitioning-to-the-uikit-scene-based-life-cycle>.
- Apple's framework engineer clarifies that enforcement follows the SDK used to build the app; apps built with previous SDKs continue working under the previous behavior: <https://developer.apple.com/forums/thread/832787>.
- An Expo repository issue reports the same generated-template runtime trap on an earlier SDK 56 project: <https://github.com/expo/expo/issues/46664>. That report is corroborating context, not proof of the current SDK 57 binary's behavior or an approved migration implementation.

Local evidence independently establishes the issue for this project's Expo 57.0.19 generated AppDelegate: no scene lifecycle, a crash in UIKit's no-scene-adoption check when built with Xcode 27 beta 6, and restored operation with the Xcode 26.6 artifact. Exact evidence, recovery and remaining migration scope are in `docs/final/XCODE_27_VALIDATION.md`.
