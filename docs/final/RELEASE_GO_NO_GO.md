# Release decision

Decision date: 2026-09-07

Decision: **NO-GO for preview, production, TestFlight, Play testing, and public store submission**

The product is not production-ready. The September dependency set passes frozen install, peer checking, Expo install check and Doctor 1.20.1 20/20 under the unchanged strict one-day release-age policy. Full pinned-pnpm validation passes 167 tests and API/web builds. High `fast-uri` advisories are patched, and the old Metro `image-size` path and its exceptions are removed. A captured post-update raw audit reports zero high/critical records, six moderate and one low; the final live security-policy rerun fails closed because the npm audit endpoint times out, so it is not a green gate. On September 7, the fresh Expo 57 development client established Metro connectivity on the physical iPhone and passed Home, manual entry and a known-product result showing uncertainty plus Rinki rule provenance. Historical August iPhone evidence additionally covers core lifecycle, permission, EAN-13, OFF, offline/retry/cache, controlled backend-unavailable recovery and a repaired manual-invalid VoiceOver subset. These short-lived development subsets do not substitute for Android, an iOS archive/TestFlight build, the remaining camera/accessibility/performance matrix, production infrastructure, legal/content/licensing approval or store validation.

## Mandatory gate result

| Gate | Result | Release consequence |
| --- | --- | --- |
| No unresolved locally executable blocker/critical/high | **Not satisfied for GO** | Source-level high findings found in this run were repaired, but manually executable iPhone camera/accessibility/performance rows and native E2E remain incomplete |
| Mandatory local tests | **Pass on 2026-09-07** | Post-evidence format, lint, typecheck, 154 application/13 policy tests (167 total), API/package builds and 12-route web export pass with nested pnpm 11.16.0. Initial September 4 CPU-contention database timeouts passed unchanged narrow/full reruns after native compile; no timeout was relaxed |
| Expo compatibility | **Pass on 2026-09-04** | Supported Expo 57.0.19/RN 0.86.3 patch set, frozen install, peers, install check and Doctor 1.20.1 20/20 pass; no age or diagnostic bypass |
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
| Supply-chain advisories | **Final live policy gate fails closed: external endpoint timeout** | Captured post-update raw audit has zero high/critical and six moderate/one low. `fast-uri` 3.1.7/4.1.4 repair eight high records; Metro has no `image-size` path/exception. The final live command failed after 60 seconds; rerun successfully when the npm audit endpoint responds |

## Conditions required to reconsider GO

All blocker/high owner actions in `docs/final/OWNER_ACTIONS.md` must have attached evidence. In particular:

1. Keep Expo-supported patches behind the strict 1,440-minute release-age policy and require install check plus Doctor 20/20 after every dependency change.
2. A production-like HTTPS API and PostgreSQL environment pass load/failure, migration, backup/restore, monitoring and incident tests.
3. Signed API-36 Android and Xcode-26/iOS-26 iOS builds pass the device matrix, including real barcodes, permissions, VoiceOver/TalkBack, large text, reduced motion and performance budgets.
4. Privacy/terms, OFF licensing/account use, Rinki/Palpa copy/provenance and store questionnaires receive named approval.
5. Final localized store assets and metadata are validated in App Store Connect and Play Console.
6. The audit commit passes remote CI/security checks; dependency policy continues to fail every high/critical advisory and invalid registry report, and lower-severity findings receive compatible follow-up updates or a documented accountable risk decision.

No deployment, paid build, account creation, contract acceptance, store submission, push or public publication was performed. Owner-controlled Personal-Team signing is authorized only for the local development-device workflow, not production release.
