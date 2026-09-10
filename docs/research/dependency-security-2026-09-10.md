# September 10 dependency repair sources

Accessed: 2026-09-10. This is a scoped compatibility/security revalidation prompted by real CI and newly available live audit data, not repeated product research.

- Expo Doctor 1.20.1 on GitHub run `34455323779` required Expo ~57.0.21 and Router ~57.0.20. Official package registry metadata (`pnpm view <package> time --json`) records publication at **2026-09-08 13:50:37.144 UTC** and **13:48:35.933 UTC**, respectively. Both were over 42 hours old at selection. Package sources: [Expo](https://www.npmjs.com/package/expo/v/57.0.21) and [Expo Router](https://www.npmjs.com/package/expo-router/v/57.0.20).
- [xmldom upstream releases](https://github.com/xmldom/xmldom/releases) describe XML serialization-validation and parser resource-consumption repairs in **0.8.15 / 0.9.12**. Registry publication: **2026-08-21 22:20:29.920 / 22:32:42.389 UTC**. Matching live advisory ranges require these patches for the installed 0.8/0.9 lines; keep both lines instead of forcing a compatibility change.
- js-yaml **4.3.2** patches `GHSA-2883-xcg3-v3hh` according to the live registry advisory. Registry publication: **2026-08-26 20:42:48.747 UTC**. [Upstream repository/releases](https://github.com/nodeca/js-yaml/releases) and [advisory](https://github.com/advisories/GHSA-2883-xcg3-v3hh).

Execution: explicit direct Expo pins plus lockfile resolution; narrow `pnpm -r update @xmldom/xmldom js-yaml --depth Infinity` retains supported parent ranges. No age bypass, exception, override or new direct parser dependency. Final live audit: zero high/critical, six moderate/one low. This is not a native runtime or all-severity-security pass.
