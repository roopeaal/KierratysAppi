# Current state

Last updated: 2026-09-10 after owner-authorized GitHub synchronization and repairing its Expo/security gates. Full pinned-pnpm validation passes: 188 tests; Expo Doctor 20/20 and the live high/critical audit gate pass. Native rebuild, launcher relabeling and physical acceptance remain open.

## Post-push CI repairs — 2026-09-10

- GitHub's initial `dd48a62` run passed `pnpm validate` but failed Expo Doctor 19/20: upstream now requires Expo 57.0.21 / Router 57.0.20. Updated only those direct packages within SDK 57; both were over 42 hours old. Added a regression preventing removal/bypass of the Expo CI check.
- The live npm audit service recovered and found 20 high records in the XML/YAML toolchain. Narrow compatible transitive updates resolve `@xmldom/xmldom` 0.8.15 / 0.9.12 and `js-yaml` 4.3.2; all exceed the unchanged 24-hour age gate. Security-floor regressions cover both parsers. No override, exclusion, cross-major upgrade or high-severity exception was added.
- Frozen install, peers, Expo install check, Doctor 20/20, all 188 tests (23 policy + 165 application), strict types/lint/format, API/package builds and 12 web routes pass. **Live `pnpm security:audit` passes** with zero high/critical, six moderate and one low records retained for follow-up. See AUD-043 and `docs/security/DEPENDENCY_RISK_ACCEPTANCE.md`.
- The restored phone binary still uses the September 4 native set; this dependency update has **not** been prebuilt, signed or physically installed. The next action must regenerate native files/pods before building. No new camera, wireless, visual, performance or store acceptance is claimed.

## GitHub synchronization — 2026-09-10

- The owner explicitly requested updating the KierratysAppi repository. Fetched `origin`, verified no divergence (0 remote-only / 13 local-only commits), then fast-forward pushed `87404a0..dd48a62` to the existing private `roopeaal/KierratysAppi` `main`. `git ls-remote` confirmed the exact implementation HEAD `dd48a626f19dcd9cc53fea597df678159aa9e67a` on GitHub.
- Re-ran full pinned `pnpm validate`: 185 tests, formatting/lint/strict types, package/API builds and 12 web routes pass. Only `.env.example` files occur among the changed environment/credential-artifact filename patterns; ignored native builds, local screenshots and work directories were not pushed. This filename check is not a secret-scanner pass.
- GitHub CI and Security started for this push; their results are tracked separately from local validation in `docs/final/TEST_EVIDENCE.md`. This follow-up control-file commit records the synchronization; repository visibility/name, settings and Dependabot branches were not changed.
- The authorization covers source synchronization only, not production deployment, store submission, account creation, payments or release readiness. The app remains KeepItGreen; the repository remains KierratysAppi. Existing NO-GO gates and the next native/wireless validation task remain.

## KeepItGreen rename — 2026-09-10

- Updated Expo/default and FI/EN native display names, localized wordmark and privacy/deletion copy, API documentation title, source-asset titles and store draft. The visible and accessible wordmark now use the same localization key.
- Preserved bundle/package ID, scheme, slug, package names and storage namespace. Historical evidence and native artifact paths retain the old name. No native rebuild/install or profile renewal occurred: the existing phone launcher may still say KierrätysAppi.
- Full `pnpm validate` passes: 20 policy + 165 application tests (185 total), format/lint/strict types, package/API builds and 12 web routes. Added name/localization/technical-identity regressions. FI/EN Home at 390×844 and Finnish privacy text were inspected in the browser; details in `docs/final/TEST_EVIDENCE.md`.
- Apple's current free Personal Team limit remains seven days per profile. Wireless pairing does not extend it; the current Debug app also relies on Mac-hosted Metro/API. Practical prerequisites, owners and renewal procedure: `docs/research/ios-free-wireless-development.md`. No unattended year-end runtime is claimed.
- Store-name availability/brand rights still require OA-10 owner/legal/store review. Existing NO-GO gates are unchanged; no payment, new account, deployment, push or publication occurred.

## Visual refresh — 2026-09-08 to 2026-09-10

- Implemented a neutral/forest visual system with semibold typography, original decorative packaging marks, a prominent scan control, compact guide/history rows, a focused manual form and simpler component-result surfaces. Unknown/partial data, preparation/explanation, rule provenance and OFF attribution remain present. No provider, sorting, retention or native dependency changes.
- Compared published Yuka and Too Good To Go visuals and Bower/Scrapp workflows, with unavailable-image and marketing-evidence limits explicitly recorded in `docs/research/mobile-design-reference-study.md`. Corrected the stale design-system document to actual tokens and confidence behavior.
- Browser QA passes for the recorded FI/EN Home/manual/result/guide, 320/390/1280-width layouts, controlled unreachable-API recovery-to-guide and local ambiguous-component presentation. Corrected web radio checked-state semantics in language/material/feedback controls. Full `pnpm validate`: 17 policy + 164 application tests, format/lint/strict types, API/package builds and 12 web routes.
- The physical automation reopen attempt timed out at XCTest startup; it is not a new-UI phone pass or proof of a new app defect. Dark/largest-text/camera/VoiceOver/performance remain open. Use the working Xcode 26.6 binary, not the rejected Xcode 27 build. The previous profile expires September 11 07:01:05 UTC.
- Exact screenshots, test procedures, sizes and limitations: `docs/final/design-refresh-evidence.md`. Release remains NO-GO; no push/publication occurred.

## Xcode 27 evaluation and recovery — 2026-09-08

- Xcode 27 beta 6 (`27A5252f`) is installed alongside Xcode 26.6 on Tahoe 26.7. A fresh iOS 27 SDK Debug build, app/11-framework signatures and physical installation pass, but the app **fails at startup** with UIKit's `UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption` enforcement. The generated Expo AppDelegate still uses the legacy window lifecycle. This beta app build is rejected; compilation is not runtime acceptance.
- Reinstalled the existing Xcode 26.6 (`17F113`)/iOS 26.5 artifact without deleting app data. Home, manual Nutella lookup, unknown/partial confidence, Rinki provenance and OFF attribution pass again. Beta device/automation tools work against this restored binary. Both API and Metro are running at the current LAN origin. Profile expiry remains September 11 at 07:01:05 UTC.
- Continue application builds with explicit `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer`. The system default remains Command Line Tools. UIScene adoption is a local migration required before switching SDKs, not an external account blocker or a reason to upgrade macOS.
- `pnpm validate` passes with pnpm 11.16.0: 13 policy plus 154 application tests, format/lint/strict types and all package/API/web builds. No application dependency/source changes or new live security-audit claims. Detailed evidence and reproduction: `docs/final/XCODE_27_VALIDATION.md`.

## Latest iPhone recovery — 2026-09-07

- Completed the current Expo 57.0.19 / React Native 0.86.3 / development-client 57.0.18 patch set without release-age exclusions. The fresh live-workspace iOS pod lock matches its manifest and JavaScript versions; stale copied native staging was not reused.
- After the owner upgraded the Mac to Tahoe 26.7 and freed disk space, Xcode 26.6 built a new Debug `iphoneos` client. Recursive app signing and all 11 embedded framework signatures pass. The installed new profile expires **2026-09-11 07:01:05 UTC**, replacing the fixture whose profile expired on 2026-08-29.
- Installation, native development-client launch and product-screen runtime now pass on the connected iPhone. On 2026-09-07 API `/v1/health` and Metro `/status` passed from localhost and the Mac LAN address, the phone established multiple live TCP connections to Metro, and the fresh Expo 57 client exposed the Finnish Home semantic tree and rendered the expected 1284×2778 Home screenshot.
- The current Home → manual entry → known-product smoke passes. The answer-first result retained a genuinely unknown component at 0%, rendered the known plastic component with partial-confidence disclosure, and exposed Rinki source, FI jurisdiction, checked date, rule version, verification and the resolved product identity. Privacy-safe screenshots are retained under ignored `work/ui-qa/2026-09-07-*.png`; no camera frame was captured.
- The first lookup correctly entered the offline state because the Metro process had survived from 2026-09-04 with the former Mac address embedded as the development API origin. After validating the exact listener/process, Metro was restarted with the current `EXPO_PUBLIC_API_BASE_URL`, the app was relaunched against the current LAN origin and the same known-product path passed. This was a development-runtime configuration issue, not a product/API, signing or Local Network permission failure.
- The 2026-09-07 post-evidence full validation passes with the pinned pnpm 11.16.0: format, lint, strict type checks, 13 policy tests, 154 application tests, all package/API builds and the 12-route web export. A post-patch raw dependency audit snapshot reports zero high/critical findings, but the final live security-policy rerun fails closed because the registry audit endpoint times out. This is an external validation gate, not a security-policy pass or production GO.

## Verified implementation

- Expo SDK 57 Finnish/English app with pre-permission explanation, EAN-8/EAN-13/UPC-A scanner configuration, manual GTIN, distinct invalid/not-found/provider/offline states, component guidance, local material-code parsing, optional bounded history, local feedback drafts and delete-all-local-data.
- The mobile UI now uses centralized semantic colors, typography, controls and interaction tokens. Home places scan/manual actions before supporting content; results place component sorting destinations before product metadata; scanner exposes a localized torch control; internal destination/reason enums no longer reach users.
- Every resolved, ambiguous and unknown sorting presentation retains textual confidence, explanation/recovery, and either full rule source/jurisdiction/checked-date/version/verification evidence or an explicit statement that no verified rule was applied.
- Critical Home, scanner, manual and result controls expose stable `testID` values. Internal navigation/close actions now have button semantics, external sources remain links, and operating-system font scaling is not capped.
- Fastify POST lookup API with strict validation/body limits/CORS, generic client errors, sanitized 4xx logs, response no-store, per-route rate limiting, OpenAPI and health.
- OFF v3.6 adapter with fixed HTTPS origin/manual redirects, response-byte/timeout limits, GTIN response binding, conservative exact taxonomy mapping, 12/minute per-process guard and ODbL/DbCL/CC BY-SA provenance.
- Bounded resolution cache (5,000 default), conservative fallback, and effective-dated Rinki/Palpa sorting rules that preserve unknown/ambiguous states.
- PostgreSQL 26-table migration with checksum/material invariants, RLS on sensitive tables, immutable published rule versions and idempotent seed; currently exercised only through PGlite tests, not runtime production persistence.
- Exact CI action SHAs, Node 24.19.0, pnpm 11.16.0, frozen lockfile, strict one-day dependency-release age, secret/dependency gates, feature-gated CodeQL, EAS profiles and deterministic source assets.

## Current validation truth

- `corepack pnpm install --frozen-lockfile`: pass against the pnpm 11.16.0 project pin. Final validation used isolated Corepack shims so nested `pnpm` also resolves to 11.16.0; no global tool configuration changed.
- `pnpm validate` on 2026-09-10 after CI repair: pass; 165 application tests across 22 Vitest files plus 23 Node repository-policy regressions (188 total), all format/lint/strict-type checks, package/API builds and 12-route web export pass with pinned pnpm 11.16.0. Earlier database-contention failures remain separately dated historical evidence.
- Historical September 4 `corepack pnpm test:coverage`: pass. Core domain/provider/engine/application/API packages were approximately 90%+ statement coverage; tested mobile modules were 70.75% and did not cover most rendered native UI. Coverage was not remeasured for the visual refresh.
- `pnpm security:audit` on 2026-09-10: **live pass**, zero high/critical, six moderate and one low records. The former endpoint-timeout blocker is resolved for this run. XML/YAML toolchain patches close 20 newly observed high records; fast-uri floors and no-exception/fail-closed policy remain enforced. Lower-severity risks are listed in `docs/security/DEPENDENCY_RISK_ACCEPTANCE.md`.
- `corepack pnpm peers check`: pass.
- Expo Doctor 1.20.1 is **20/20** and `expo install --check` passes for the current supported set. The strict 1,440-minute supply-chain gate remains enforced; no exclusion or bypass was added.
- API production smoke: pass locally; health/OpenAPI/strict validation verified. No deployed production service exists.
- September 10 post-rename web entry: 2,548,479 bytes uncompressed / 576,724 bytes gzip, above the 2 MiB warning budget. This is bundle evidence, not measured browser or device performance.
- Browser QA passed at 390×844 and 1280×720 in Finnish and English for Home, manual entry, resolved result, ambiguous result and offline recovery. The measured Home/result desktop views had zero horizontally overflowing DOM elements. Dark mode and true native Dynamic Type were not visually claimed.
- The controlled backend-unavailable state showed provider failure without reclassifying the product; restoring the real API and pressing retry recovered to the known result without code re-entry. Privacy-safe API evidence contained no raw GTIN.
- The EAS development profile previously declared `developmentClient:true` without `expo-dev-client`; this caused the observed `No script URL provided` failure. Adding the native dependency, rebuilding the ignored iOS project/pods, recursively verifying the app plus 11 frameworks, installing and launching the fresh client resolved startup. A repository policy now prevents recurrence.
- Physical iPhone JS verification now includes the current Expo 57 client on 2026-09-07: Finnish Home, manual entry and the known-product answer-first result pass through semantic inspection and screenshots. The result preserved unknown/partial confidence and complete sorting-rule provenance. Historical 2026-08-28 scanner and result evidence remains separately dated; no live camera frame was captured and the automation toolbar's scanner overlap means the torch toggle is still not claimed.
- Latest privacy-safe local provider observations included a 249 ms live lookup and 5 ms cache hit. A physical xctrace frame attempt matched no app process and produced zero frames; it is recorded as unavailable, not as a performance pass.
- Earlier partial physical iOS evidence still passes lifecycle, camera allow/revoke/settings recovery, one real EAN-13 `not_found`, known OFF resolution, offline/no-request behavior, restored retry/cache, invalid-manual rejection, provenance and the repaired partial VoiceOver path. Remaining VoiceOver, largest text, dark/reduced-motion, broader barcode conditions and valid performance/battery measurements are open.
- The owner-authorized September 10 push synchronized implementation through `dd48a62` to private `origin/main`, replacing the former unpushed state. Remote CI is separate from the passing local check; see the synchronization evidence above.

## Release state

**NO-GO.** See `docs/final/PRODUCTION_AUDIT.md`, `RELEASE_GO_NO_GO.md`, `OWNER_ACTIONS.md` and `TEST_EVIDENCE.md`.

Open blockers include signed Android and iOS release/TestFlight builds, the remaining physical camera/accessibility/performance matrix, production API/database/monitoring and restore drill, OFF owner account/licence approval, GS1 Data contract decision, independent Finnish content approval, privacy/terms/GDPR approval, hosted support/privacy URLs and final store assets/forms/console validation. The latest SDK patch set also requires local native regeneration/build/install and smoke testing; historical phone evidence does not cover it.

No production deployment, paid build, contract acceptance, store submission or public publication occurred. The owner authorized the private GitHub source push on September 10. Owner-controlled Apple account and free Personal-Team signing were used only for the local development device run. See `docs/final/PHYSICAL_IOS_VALIDATION.md` for exact passed and pending rows.
