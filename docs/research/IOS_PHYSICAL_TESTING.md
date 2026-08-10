# iOS physical-testing requirements

Access date: 2026-08-10

## Supported local path

- Expo SDK 57 supports iOS 16.4+ and requires Xcode 26.4+ according to the current [Expo SDK reference](https://docs.expo.dev/versions/latest/).
- Expo documents `npx expo run:ios --device` as the local physical-iPhone path. It generates the native project when absent, compiles and installs the debug binary, then starts Metro. A development build can run without `expo-dev-client`; the CLI must target the development build. See [Introduction to development builds](https://docs.expo.dev/develop/development-builds/introduction/) and [Create a debug build locally](https://docs.expo.dev/guides/local-app-development/).
- Apple permits a free Personal Team to install and test an app on personally owned devices. Personal-Team App IDs, device registrations and provisioning profiles expire after seven days; limits are 10 App IDs, three devices and three installed apps per device. It cannot submit to the App Store. See [Developer account overview](https://developer.apple.com/help/account/basics/about-your-developer-account).
- Xcode 26.6 supports macOS Tahoe 26.2–26.x, includes the iOS 26.5 SDK and supports device installation on iOS 15+. The current host, macOS 26.5.2 on Apple silicon, is compatible. See [Xcode SDK and system requirements](https://developer.apple.com/xcode/system-requirements).
- iOS 16+ requires Developer Mode for local development-signed apps. Pairing through Xcode makes the setting available; enabling it requires an iPhone restart and device-passcode confirmation. See Apple’s [Developer Mode instructions](https://developer.apple.com/documentation/Xcode/enabling-developer-mode-on-a-device) and Expo’s [iOS Developer Mode guide](https://docs.expo.dev/guides/ios-developer-mode/).
- Apple requires Xcode 26+ and the iOS 26 SDK for App Store Connect uploads from 2026-04-28. This is a release-upload requirement, not proof that a local Personal-Team build is store-ready. See [Apple upcoming requirements](https://developer.apple.com/news/upcoming-requirements/?id=02032026a).

## Path decision

Use a local Xcode 26.6 development build first. It is compatible with Expo SDK 57, avoids an EAS cloud build and paid Apple Developer membership, and produces the physical native evidence required here. Use EAS only if local compilation is proven incompatible; EAS device distribution requires account, device registration, signing and potentially paid Apple membership.

Do not use Expo Go as acceptance evidence. During the SDK 57 transition Expo directs physical Expo Go users to SDK 54, and Expo describes Expo Go as a limited playground rather than the production-project development-build path.
