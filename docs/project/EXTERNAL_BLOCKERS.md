# External blockers

These do not block local architecture, implementation, automated tests, documentation, or unsigned configuration work.

| Blocker | Why owner/external action is required | Exact next action |
| --- | --- | --- |
| Physical camera validation | No Android/iOS test device is attached | Install an internal build on representative devices and execute the documented camera checklist |
| Android native build | Java, Android SDK, and ADB are unavailable locally | Install the documented JDK/Android toolchain or authorize an EAS build after configuration passes |
| iOS native build | Full Xcode and Apple signing identity are unavailable | Install/select supported Xcode and provide owner-controlled Apple/EAS credentials |
| Store builds/submission | Expo/EAS, Google Play, and App Store credentials/terms/signing are owner-controlled | Review terms/costs, provide credentials via secret storage, approve build/submission |
| GS1/Synkka data | Contract, licence, credentials, cost, and redistribution rights are unknown | Owner obtains written commercial terms and credentials before enabling the production adapter |
| Legal publication | Product owner/legal counsel must approve privacy, terms, licensing, claims, and age-rating answers | Review marked drafts and sign off before public release |
| Production infrastructure | Hosting/database/monitoring accounts and recurring cost choices require owner approval | Select providers and approve cost/privacy regions before deployment |
| Photo/OCR upload workflow | A production upload service, privacy region, retention schedule, consent text, moderation capacity, and abuse controls are not approved | Select the storage/processing region and approve the data-protection workflow before enabling upload or cloud OCR |
| CodeQL upload on private GitHub repository | GitHub Code Security is not enabled and may require a paid Team/Enterprise security entitlement | Approve any plan/security cost, enable Code Security, then set repository variable `CODEQL_ENABLED=true`; until then the prepared CodeQL job skips while Gitleaks and dependency gates remain active |
| Metro `image-size` advisories | The advisory names `2.0.3` as patched, but npm currently publishes only `2.0.2` | Upgrade immediately when `2.0.3` or an Expo/Metro release containing it is available; temporary CI exception expires 2026-09-10 |
