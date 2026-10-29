# SDK 58 and dependency security maintenance

Accessed: 2026-10-29. Public registry/maintainer evidence, not a production or
physical-device acceptance. No paid API or user data used.

## Compatible mobile set

The [official SDK 58 module map](https://api.expo.dev/v2/sdks/58.0.0/native-modules)
and [Expo versions endpoint](https://exp.host/--/api/v2/versions/latest) agree:

| Package | Selected version |
| --- | --- |
| expo | 58.0.21 |
| expo-camera | 58.0.14 |
| expo-constants | 58.0.14 |
| expo-dev-client | 58.0.17 |
| expo-file-system | 58.0.13 |
| expo-font | 58.0.11 |
| expo-linking | 58.0.15 |
| expo-location | 58.0.20 |
| expo-router | 58.0.28 |
| expo-splash-screen | 58.0.12 |
| expo-system-ui | 58.0.7 |
| react-native | 0.88.1 |

React/React DOM 19.3.0, haptics 58.0.7 and status-bar 58.0.4 remain unchanged.
The existing [Doctor 1.21.5](https://registry.npmjs.org/expo-doctor/1.21.5)
supports both CI Node 24.19.0 and local Node 26.4.0. No diagnostic exclusion,
Doctor-pin change or SDK-major migration is required.

## Security fixes

| Package | Maintainer/advisory evidence | Selected version |
| --- | --- | --- |
| brace-expansion | [nested recursion](https://github.com/advisories/GHSA-qhr7-859c-m2p7), [comma recursion](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p); 5.x floor 5.0.11 | 5.0.12 |
| Fastify | [body collision](https://github.com/advisories/GHSA-667r-xxjv-c9mm), [URL bypass](https://github.com/advisories/GHSA-p68q-wchp-6fh7), [false schemas](https://github.com/advisories/GHSA-hwr6-493r-vm6h), [header validation](https://github.com/advisories/GHSA-9q9j-q6p8-xq58); floor 5.12.2 | 5.12.7 |
| node-forge | [maintainer same-CVE advisory](https://github.com/digitalbazaar/forge/security/advisories/GHSA-2g46-22mc-6gwp), [1.4.2 changelog](https://raw.githubusercontent.com/digitalbazaar/forge/v1.4.2/CHANGELOG.md) | 1.4.2 |
| source-map-js | [indexed-map denial of service](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) | 1.2.2 |
| compression | [premature-close leak](https://github.com/advisories/GHSA-vc2v-76pw-4v95) | 1.8.2 |
| shell-quote | [critical command injection](https://github.com/advisories/GHSA-pqg4-j6r4-53mv); floor 1.11.0 | 1.12.0 |
| bundled launch-editor in Vite | [Windows existence bypass](https://github.com/advisories/GHSA-587h-7wmj-h5pm); Vite 8.3 floor 8.3.3 | Vite 8.3.5 |
| Zod | [oversized collection allocation](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5); affected range includes 3.x as well as old 4.x | 4.6.7 |

The global forge advisory still says no patch, but its affected range ends at
1.4.0. The maintainer explicitly fixes the same CVE in 1.4.1; 1.4.2 additionally
repairs a Buffer-input regression. This is not inferred safe from a larger
version number alone. Registry publication of 1.4.2 is October 27 at
14:09:15.471 UTC, beyond the unchanged 1,440-minute age gate. Fastify 5.12.7
and Zod 4.6.7 were published October 13 and October 12 respectively.

Vitest and coverage remain aligned on same-major 4.1.12. Vite 8.3.5 is declared
as their supported development peer at root so the old auto-installed 8.2.1
cannot remain selected. It is not a mobile runtime dependency. Compatible
transitive source-map resolution is refreshed within the existing parent ranges.

## Explicit CLI migration boundary

[Expo CLI 58.1.17](https://registry.npmjs.org/@expo%2fcli/58.1.17) still requests
Zod ^3.25.76. Keeping it would leave a high advisory. The only override is
`@expo/cli>zod: 4.6.7`, not a blanket Zod replacement or a `/v3` alias.
Its two actual Zod consumers are the devtools-plugin and MCP-extension schemas.
Seven tests load these installed modules through Expo's own resolution and
exercise valid/invalid descriptors, readonly arrays, optional typed command
arguments, strict extra-field refusal, readable issues, output types and Draft7
conversion. Tests never execute a plugin or command. Full config/export/Metro,
Doctor and browser checks complement these tests. Review/remove the override
when the supported upstream CLI itself adopts a safe Zod range.

## Native consequence

[Expo development-build guidance](https://docs.expo.dev/develop/development-builds/introduction/)
requires rebuilding after native-library updates. The existing build-3 binary
contains RN 0.88.0 and the older module set. Its historical Home evidence does
not establish compatibility with RN 0.88.1 JS. Regenerate/pod-install/build,
verify signatures/profile and replace-install/smoke before updating the phone's
runtime. No EAS/OTA publication or automatic delivery to old binaries is allowed.

Results and remaining monitored advisories: `docs/final/SDK58_SECURITY_MAINTENANCE.md`
and `docs/security/DEPENDENCY_RISK_ACCEPTANCE.md`.
