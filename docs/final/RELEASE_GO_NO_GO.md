# Release decision

Decision date: 2026-08-10

Decision: **NO-GO for preview, production, TestFlight, Play testing, and public store submission**

The locally testable source tree is valid, but the product is not production-ready. A clean `pnpm validate` passes with 133 tests and both API/web builds. Physical-iOS preflight confirms a compatible macOS host and correct generated configuration, but full Xcode is not installed and no app has run on the iPhone. Configuration evidence does not substitute for native binaries, physical camera/accessibility/performance tests, production infrastructure, legal/content/licensing approval, or store validation.

## Mandatory gate result

| Gate | Result | Release consequence |
| --- | --- | --- |
| No unresolved locally executable blocker/critical/high | Pass after audit repairs | All such findings found in source were fixed and regression-tested |
| Mandatory local tests | Pass | Format, lint, typecheck, 133 tests, API build and 12-route web export pass |
| Expo compatibility | **Fail** | Doctor 19/20; four just-published patches are held until the supply-chain age window passes |
| Android release build | **No evidence** | No JDK/SDK/ADB/signing/AAB/device run |
| iOS development/release build | **No runtime evidence** | Xcode 26.6 is compatible with the host but absent; generated config passes, while compile/sign/install/archive/TestFlight/device run remain unperformed |
| Physical barcode test | **No evidence** | Camera flow cannot be accepted from web/manual simulation |
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

1. Expo-supported patches age past policy, are reviewed/installed, and Doctor passes 20/20.
2. A production-like HTTPS API and PostgreSQL environment pass load/failure, migration, backup/restore, monitoring and incident tests.
3. Signed API-36 Android and Xcode-26/iOS-26 iOS builds pass the device matrix, including real barcodes, permissions, VoiceOver/TalkBack, large text, reduced motion and performance budgets.
4. Privacy/terms, OFF licensing/account use, Rinki/Palpa copy/provenance and store questionnaires receive named approval.
5. Final localized store assets and metadata are validated in App Store Connect and Play Console.
6. The audit commit passes remote CI/security checks and the two high dependency advisories are patched or receive a new accountable decision before expiry.

No deployment, paid build, account creation, contract acceptance, signing, submission, or public publication was performed by this audit.
