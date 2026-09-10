# Release decision

Decision date: 2026-09-10

Decision: **NO-GO for preview, production, TestFlight, Play testing, and public store submission**

September 10 post-push update: the owner-authorized source synchronization exposed a remote Expo compatibility failure. Expo 57.0.21/Router 57.0.20 now pass Doctor 20/20, and compatible XML/YAML patches close 20 high advisory records found when the npm audit endpoint recovered. Full **188-test** local validation and the **live high/critical security policy pass** (six moderate/one low remain). The new native dependency set still requires regeneration/build/install/runtime smoke; this is not a production GO.

September 10 scope update: the visual refresh passes 181 tests and scoped FI/EN multi-width/error/ambiguous browser inspection. The revised UI has no new physical acceptance, dark/largest-text/camera evidence or release build. No release gate is closed by appearance alone; see `design-refresh-evidence.md`. All older evidence below remains date-scoped.

September 8 toolchain evaluation: Xcode 27 beta compile/sign/install passes, but its app fails immediately on UIKit's required UIScene lifecycle. The SDK upgrade is rejected. The working Xcode 26.6 artifact was restored and Home/manual/Nutella/provenance/terminate-relaunch passed; full `pnpm validate` passes 167 tests. This recovery does not close release gates or complete the local UIScene migration needed before adopting Xcode 27. See `XCODE_27_VALIDATION.md` and AUD-042.

The product is not production-ready. The current September 10 dependency set passes frozen install, peer checking, Expo install check, Doctor 1.20.1 20/20 and 188-test validation under the unchanged strict one-day release-age policy. High `fast-uri` and XML/YAML advisories are patched; no high exception exists. The live audit now passes rather than timing out. On September 7, the older Expo 57 development client established Metro connectivity on the physical iPhone and passed Home, manual entry and a known-product result showing uncertainty plus Rinki rule provenance. Historical August iPhone evidence additionally covers core lifecycle, permission, EAN-13, OFF, offline/retry/cache, controlled backend-unavailable recovery and a repaired manual-invalid VoiceOver subset. These short-lived development subsets do not validate today's patched native set or substitute for Android, an iOS archive/TestFlight build, the remaining camera/accessibility/performance matrix, production infrastructure, legal/content/licensing approval or store validation.

## Mandatory gate result

| Gate | Result | Release consequence |
| --- | --- | --- |
| No unresolved locally executable blocker/critical/high | **Not satisfied for GO** | Source-level high findings found in this run were repaired, but manually executable iPhone camera/accessibility/performance rows and native E2E remain incomplete |
| Mandatory local tests | **Pass on 2026-09-10** | Format, lint, typecheck, 165 application/23 policy tests (188 total), API/package builds and 12-route web export pass with nested pnpm 11.16.0. No timeout was relaxed |
| Expo compatibility | **Pass on 2026-09-10** | Expo 57.0.21/Router 57.0.20/RN 0.86.3, frozen install, peers, install check and Doctor 1.20.1 20/20 pass; no age or diagnostic bypass. New native rebuild is pending |
| Android release build | **No evidence** | No JDK/SDK/ADB/signing/AAB/device run |
| iOS development/release build | **Compile/signatures/install and current development runtime smoke pass; no release evidence** | September 4's current Expo/RN client build and signatures pass. On September 7 the phone established Metro TCP connectivity; Home, manual entry and a known-product result with uncertainty and Rinki provenance passed. The first lookup correctly rendered offline because Metro still held the prior API LAN address; restarting Metro with the current `EXPO_PUBLIC_API_BASE_URL` fixed the lookup. Profile expires September 11 07:01:05 UTC; archive/TestFlight and the remaining device/release matrix remain unperformed |
| Physical barcode test | **Partial** | One real EAN-13, permission/recovery and scanner-control semantics pass; EAN-8, UPC-A, unsupported UPC-E, actual torch toggle and adverse/rapid/multiple-code conditions remain |
| Production API/database | **Absent** | Mobile production URL intentionally fails closed; no deployed service or restore drill |
| Privacy/GDPR/terms | **Unapproved draft** | No controller/legal sign-off or hosted URLs |
| OFF licence/account | **Incomplete external gate** | Implementation is attributable; owner account/contact/legal approval absent |
| GS1 Data | **Not licensed or enabled** | Synthetic adapter is excluded from runtime; no fallback claim permitted |
| Recycling content | **No independent owner approval** | Automated rules cannot self-approve trust-critical Finnish guidance |
| Store materials/forms | **Incomplete** | Real screenshots, feature graphic, questionnaires, URLs and console validation absent |
| Observability/incident response | **Non-operational** | No monitoring/alerts/on-call/contacts |
| Backup/recovery | **No operational evidence** | Schema tests pass; production backup/restore does not exist |
| Supply-chain advisories | **Live high/critical policy passes on 2026-09-10** | Zero high/critical; six moderate/one low remain tracked. Compatible XML/YAML patches close 20 high records, fast-uri floors remain enforced, no exception/bypass. This is not all-severity risk clearance |

## Conditions required to reconsider GO

All blocker/high owner actions in `docs/final/OWNER_ACTIONS.md` must have attached evidence. In particular:

1. Keep Expo-supported patches behind the strict 1,440-minute release-age policy and require install check plus Doctor 20/20 after every dependency change.
2. A production-like HTTPS API and PostgreSQL environment pass load/failure, migration, backup/restore, monitoring and incident tests.
3. Signed API-36 Android and Xcode-26/iOS-26 iOS builds pass the device matrix, including real barcodes, permissions, VoiceOver/TalkBack, large text, reduced motion and performance budgets.
4. Privacy/terms, OFF licensing/account use, Rinki/Palpa copy/provenance and store questionnaires receive named approval.
5. Final localized store assets and metadata are validated in App Store Connect and Play Console.
6. The audit commit passes remote CI/security checks; dependency policy continues to fail every high/critical advisory and invalid registry report, and lower-severity findings receive compatible follow-up updates or a documented accountable risk decision.

The owner authorized a private source push to the existing GitHub `main` on 2026-09-10; implementation through `dd48a62` is synchronized and local 185-test validation passes. This is not production release approval or a remote CI pass. No deployment, paid build, account creation, contract acceptance, store submission or public publication was performed. Owner-controlled Personal-Team signing is authorized only for the local development-device workflow, not production release.
