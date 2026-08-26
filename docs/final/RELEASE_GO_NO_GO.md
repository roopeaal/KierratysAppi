# Release decision

Decision date: 2026-08-26

Decision: **NO-GO for preview, production, TestFlight, Play testing, and public store submission**

The locally testable source tree is valid, but the product is not production-ready. A clean `pnpm validate` passes with 134 application tests plus five repository-policy regressions (139 total) and both API/web builds. An Expo 57.0.16 Xcode 26.6 Personal-Team Debug build compiles, passes strict recursive signing, installs and runs on one iPhone; core lifecycle, permission, EAN-13, OFF, offline/retry/cache, provenance and a repaired manual-invalid VoiceOver subset pass. Asynchronous lookup announcements are also repaired and tested locally after a known-product device failure, but await device retest. This short-lived development subset does not substitute for Android, an iOS archive/TestFlight build, the remaining camera/accessibility/performance matrix, production infrastructure, legal/content/licensing approval or store validation.

## Mandatory gate result

| Gate | Result | Release consequence |
| --- | --- | --- |
| No unresolved locally executable blocker/critical/high | **Not satisfied for GO** | Original source findings were repaired, but the newly enabled iPhone manual/automation portions of blocker/high findings remain incomplete |
| Mandatory local tests | Pass | Format, lint, typecheck, 139 automated tests, API build and 12-route web export pass |
| Expo compatibility | Pass | Expo 57.0.16 patch set installed after the strict 1,440-minute age gate; native duplicate removed, install check clean and Doctor 20/20 |
| Android release build | **No evidence** | No JDK/SDK/ADB/signing/AAB/device run |
| iOS development/release build | **Partial development evidence; no release evidence** | Latest Expo 57.0.16 Personal-Team Debug compile/sign/install/launch passes on one iPhone; archive, final entitlement/privacy inspection, TestFlight processing and release-configuration matrix remain unperformed |
| Physical barcode test | **Partial** | One real EAN-13 and permission/recovery path pass; EAN-8, UPC-A, unsupported UPC-E and adverse/rapid/multiple-code conditions remain |
| Production API/database | **Absent** | Mobile production URL intentionally fails closed; no deployed service or restore drill |
| Privacy/GDPR/terms | **Unapproved draft** | No controller/legal sign-off or hosted URLs |
| OFF licence/account | **Incomplete external gate** | Implementation is attributable; owner account/contact/legal approval absent |
| GS1 Data | **Not licensed or enabled** | Synthetic adapter is excluded from runtime; no fallback claim permitted |
| Recycling content | **No independent owner approval** | Automated rules cannot self-approve trust-critical Finnish guidance |
| Store materials/forms | **Incomplete** | Real screenshots, feature graphic, questionnaires, URLs and console validation absent |
| Observability/incident response | **Non-operational** | No monitoring/alerts/on-call/contacts |
| Backup/recovery | **No operational evidence** | Schema tests pass; production backup/restore does not exist |
| Supply-chain advisories | **Open high** | Two build-tool advisories await an unpublished patched version; exception expires 2026-09-10 |

## Conditions required to reconsider GO

All blocker/high owner actions in `docs/final/OWNER_ACTIONS.md` must have attached evidence. In particular:

1. Keep Expo-supported patches behind the strict 1,440-minute release-age policy and require install check plus Doctor 20/20 after every dependency change.
2. A production-like HTTPS API and PostgreSQL environment pass load/failure, migration, backup/restore, monitoring and incident tests.
3. Signed API-36 Android and Xcode-26/iOS-26 iOS builds pass the device matrix, including real barcodes, permissions, VoiceOver/TalkBack, large text, reduced motion and performance budgets.
4. Privacy/terms, OFF licensing/account use, Rinki/Palpa copy/provenance and store questionnaires receive named approval.
5. Final localized store assets and metadata are validated in App Store Connect and Play Console.
6. The audit commit passes remote CI/security checks and the two high dependency advisories are patched or receive a new accountable decision before expiry.

No deployment, paid build, account creation, contract acceptance, signing, submission, or public publication was performed by this audit.
