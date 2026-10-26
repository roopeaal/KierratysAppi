Expo SDK 58 compatibility sources, checked 2026-10-26:

- [Official upgrade guide](https://raw.githubusercontent.com/expo/expo/sdk-58/docs/pages/workflow/upgrading-expo-sdk-walkthrough.mdx): upgrade Expo, align dependencies with `expo install --fix`, then run Expo Doctor.
- [Official bundled module versions](https://raw.githubusercontent.com/expo/expo/sdk-58/packages/expo/bundledNativeModules.json): React 19.3.0, React Native 0.88.0, Reanimated 4.7.1 and Worklets 0.13.0. Installed Expo 58.0.19 supplies the corresponding version map.
- [Expo package metadata](https://registry.npmjs.org/expo/58.0.19): Node 24.19.0 satisfies the engine requirements. Release time 2026-10-23T23:27:17.387Z satisfies the repository's one-day release-age gate.
- Camera, location, file-system and router SDK 58 changelogs were checked against current API usage; no application-code migration was required. Expo Go compatibility does not replace native camera/GPS/device acceptance. Photo capture continues to require the existing compatible development build.
