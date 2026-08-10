# External blockers

These are release blockers or high-risk gates that cannot be completed without external authority, assets, accounts, contracts, devices, infrastructure or an upstream release. Exact procedures and evidence owners are in `docs/final/OWNER_ACTIONS.md`.

| Blocker | Severity | Why external | Owner action |
| --- | --- | --- | --- |
| Android signed build/device/Play validation | blocker | No Java runtime, SDK/ADB, device, signing, EAS/Play authority | OA-08 |
| iOS physical development run and Xcode-26 archive/TestFlight validation | blocker | Host is compatible with Xcode 26.6, but only Command Line Tools are installed; physical iPhone details/pairing, signing and release authority remain absent | `docs/final/PHYSICAL_IOS_VALIDATION.md`, OA-09 |
| Physical barcode/accessibility/performance/battery evidence | blocker/high | Requires installable signed builds and representative devices | OA-08, OA-09 |
| Production HTTPS API/shared quota/database | blocker | Provider/region/cost/accounts/domain approval absent | OA-01 |
| PostgreSQL backup/restore/RPO/RTO | high | No managed production database or operations owner | OA-02 |
| OFF account/contact/licence approval | high | Owner account/mailbox and legal decision required | OA-03 |
| Rinki/Palpa content/reuse approval | high | Trust-critical human editorial/legal approval required | OA-04 |
| GS1 Data terms/access/decision | high | Commercial contract, cost, rights and credentials absent | OA-05 |
| Privacy/GDPR/terms/hosted URLs | blocker | Controller/legal decisions and publication required | OA-06 |
| Monitoring, alerts, contacts and incident drills | high | Vendor/account/privacy/on-call decisions absent | OA-07 |
| Store screenshots/feature graphic/forms/validation | blocker/high | Depends on signed builds, accounts and approvals | OA-10 |
| Four fresh Expo patches | high/time-gated | Minimum-release-age policy; current Doctor 19/20 | OA-11 |
| Two high Metro `image-size` advisories | high/time-gated | Patched `2.0.3` is unpublished; exception expires 2026-09-10 | OA-11 |
| Private branch protection/CodeQL | high governance | GitHub plan/Code Security approval; API currently returns 403 and no variable exists | OA-12 |

Photo/OCR/cloud AI remains disabled and is not a launch blocker. Enabling it would create a new privacy, safety, moderation, device-evaluation and legal workstream requiring separate approval.
