# External blockers

These are release blockers or high-risk gates that cannot be completed without external authority, assets, accounts, contracts, devices, infrastructure or an upstream release. Exact procedures and evidence owners are in `docs/final/OWNER_ACTIONS.md`.

| Blocker | Severity | Why external | Owner action |
| --- | --- | --- | --- |
| Android signed build/device/Play validation | blocker | No Java runtime, SDK/ADB, device, signing, EAS/Play authority | OA-08 |
| iOS release archive/TestFlight validation | blocker | Local Personal-Team compile/sign/install/core-device flow passes, but paid-program archive, final entitlements/privacy report, TestFlight processing and release authority remain absent | `docs/final/PHYSICAL_IOS_VALIDATION.md`, OA-09 |
| Remaining physical barcode/accessibility/performance/battery evidence | blocker/high | One iPhone development build, EAN-13/core-flow subset and repaired partial VoiceOver path pass; broader iOS matrix and all Android device evidence require continued manual device work | OA-08, OA-09 |
| Production HTTPS API/shared quota/database | blocker | Provider/region/cost/accounts/domain approval absent | OA-01 |
| PostgreSQL backup/restore/RPO/RTO | high | No managed production database or operations owner | OA-02 |
| OFF account/contact/licence approval | high | Owner account/mailbox and legal decision required | OA-03 |
| Rinki/Palpa content/reuse approval | high | Trust-critical human editorial/legal approval required | OA-04 |
| GS1 Data terms/access/decision | high | Commercial contract, cost, rights and credentials absent | OA-05 |
| Privacy/GDPR/terms/hosted URLs | blocker | Controller/legal decisions and publication required | OA-06 |
| Monitoring, alerts, contacts and incident drills | high | Vendor/account/privacy/on-call decisions absent | OA-07 |
| Store screenshots/feature graphic/forms/validation | blocker/high | Depends on signed builds, accounts and approvals | OA-10 |
| Private branch protection/CodeQL | high governance | GitHub plan/Code Security approval; API currently returns 403 and no variable exists | OA-12 |

Photo/OCR/cloud AI remains disabled and is not a launch blocker. Enabling it would create a new privacy, safety, moderation, device-evaluation and legal workstream requiring separate approval.

Resolved 2026-09-10: the npm audit endpoint responds again. It exposed 20 high XML/YAML records, repaired locally through compatible patches; the final live `pnpm security:audit` passes with zero high/critical and six moderate/one low. OA-11 remains a recurring dependency-review gate, not an active external timeout blocker. The new Expo/Router patch set requires a local native rebuild and physical smoke; no new account or paid service is needed merely for these source repairs.

The September 8 Xcode 27 startup failure is **not an external blocker**: UIScene migration is locally executable and tracked in `ROADMAP.md`/D-021. Xcode 26.6's working development artifact has been restored; profile expiry remains September 11. No additional Apple account, payment or macOS upgrade is needed for this recovery. Existing release-account and physical-matrix gates remain unchanged.

September 10 design update: no new account/tool/paid-action blocker was introduced. Physical acceptance of the refreshed UI is pending after an XCTest-session timeout, not passed by historical phone evidence. Codex owns runner recovery and UI repairs; Roope owns any required unlock/trust/profile authorization under OA-09. Browser dark-scheme emulation was unavailable, so only automated dark contrast is recorded. Do not mislabel those evidence gaps as app failures or newly proven external defects.

## Local development recovery — 2026-09-04

September 10 KeepItGreen rename: no new paid/account blocker for changing the display name. Native rebuild and wireless verification are local work, with Roope responsible for any actual unlock/trust/account prompt. Free Personal Team profiles cannot be extended through year-end without seven-day renewals; this is a platform limit, not an app defect. Mac-independent use additionally depends on the existing OA-01 hosting decision. KeepItGreen name availability/brand-rights approval remains under OA-10; neither is claimed verified by this rename. See `docs/research/ios-free-wireless-development.md`.

The old release-age, disk-space, expired-fixture and iPhone-to-Mac connectivity prerequisites are resolved. The owner updated the Mac to Tahoe 26.7 and freed space; Codex installed compatible patches, passed Doctor 20/20 and 167-test validation, rebuilt/signed all 11 frameworks plus app, and installed/launched the new client. On 2026-09-07 the phone connected to the current Metro origin and Home/manual/known-product runtime passed after the stale development API origin was refreshed. Its profile expires 2026-09-11 at 07:01:05 UTC. No user data was deleted. The old image-size dependency and exceptions are gone; newly found fast-uri highs were patched within the existing major ranges. See `NEXT_ACTION.md` and OA-09/OA-11 for the remaining named procedures.
