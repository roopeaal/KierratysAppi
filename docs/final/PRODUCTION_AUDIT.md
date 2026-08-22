# Adversarial production-readiness audit

Audit date: 2026-08-10

Follow-up physical-iOS run: 2026-08-10 and a 2026-08-22 work unit based on local `aae5fab`, which began three commits ahead of `origin/main`. See `PHYSICAL_IOS_VALIDATION.md`.

Decision: **NO-GO**

Repository: `roopeaal/KierratysAppi`, private `main`

Audited baseline: clean local `536003e`, one commit ahead of `origin/main` (`87404a0`)

This audit did not accept earlier readiness statements as evidence. It inspected source, generated native configuration, dependency resolution, build output, GitHub state, live API behavior, live Open Food Facts behavior, rendered web behavior, and official external requirements independently. Locally executable blocker/high findings were repaired and tested during the audit. Remaining blocker/high findings require devices, accounts, contracts, legal/content approval, production infrastructure, or an upstream advisory fix that does not yet exist.

## Decision basis

The repository is a strong, testable prototype but is not a releasable production system. One short-lived iOS Personal-Team Debug build and a limited physical EAN-13/core-flow subset now pass, but there is no Android build, iOS archive/TestFlight build, complete physical matrix, deployed API, production database, backup drill, monitoring/on-call service, approved privacy/terms/licensing position, store submission package, or store account evidence. Expo compatibility now passes after the supported patches cleared the strict release-age gate.

No locally executable source blocker, critical, or high finding identified in the original repository audit remains open. The newly enabled iPhone manual/native-automation work is now partially executable and in progress; Android, release signing/stores, infrastructure, legal/licensing/content approval and upstream package gates remain external or time-gated. The decision remains NO-GO.

## Evidence lanes

| # | Lane | Independent result | Findings |
| ---: | --- | --- | --- |
| 1 | Product requirements and acceptance criteria | P0 behavior is specified and automated at domain/API/state boundaries; release acceptance remains incomplete | AUD-027, AUD-035 |
| 2 | Android functionality | Source configuration prebuilds; no APK/AAB, install, launch, or Android runtime evidence | AUD-006, AUD-015 |
| 3 | iOS functionality and configuration | Personal-Team Debug compile/sign/install/launch and core permission/network flows pass on one iPhone; archive/TestFlight/release evidence remains absent | AUD-006, AUD-016 |
| 4 | Physical-device-capable barcode flows | One real EAN-13 and permission/recovery path pass; EAN-8/UPC-A/unsupported/adverse/rapid/multiple-code reliability remains unverified | AUD-007, AUD-017 |
| 5 | Product resolution and fallback | OFF-only production composition is conservative; provider fallback is tested but GS1 is unavailable | AUD-002, AUD-003, AUD-020 |
| 6 | Open Food Facts licensing | Combined ODbL/DbCL disclosure and attribution now ship; legal/account/usage approval remains open | AUD-005, AUD-019 |
| 7 | GS1 Data boundary | Synthetic adapter is excluded from the API bundle; 2026 GS1 Data contract/access is absent | AUD-020, AUD-034 |
| 8 | Recycling accuracy/provenance | Effective-dated Rinki/Palpa rules and safe uncertainty exist; independent content approval does not | AUD-012, AUD-021 |
| 9 | Unknown/ambiguous/offline | Distinct states are automated; physical unknown, offline/no-request and restored retry/cache paths now pass on one iPhone | AUD-008 |
| 10 | OCR and AI safety | Photo, OCR, upload, and cloud AI are disabled; threat-model gates exist | AUD-033 |
| 11 | Security | Input/body/redirect/response limits, CORS, no-store, RLS, dependency and secret gates exist; deployment controls are absent | AUD-010, AUD-018, AUD-025, AUD-028 |
| 12 | Privacy/GDPR | Collection is minimized and local deletion exists; controller notice, lawful basis, rights process, and approval are absent | AUD-009, AUD-022, AUD-032 |
| 13 | Accessibility | Web semantics/focus/contrast and code-level reduced motion pass; native VoiceOver/largest-text evidence remains absent despite an installable iPhone build | AUD-014, AUD-026 |
| 14 | Performance/bundle | API is small; physical provider completions of 162/343 ms and an 8 ms cache hit were observed, but end-to-end native budgets remain unmeasured; web entry is 2,528,030 bytes / 571,827 gzip | AUD-026, AUD-030 |
| 15 | Database integrity/migration/recovery | Migration constraints and PGlite tests pass; no production repository or restore drill exists | AUD-011, AUD-024 |
| 16 | API reliability/validation/rate limits | Strict validation, timeouts, body limits, local rate limits and production smoke pass; multi-instance behavior is unresolved | AUD-004, AUD-010, AUD-018 |
| 17 | Observability/incident response | Privacy-safe aggregate hook/runbooks exist; no monitoring, alerting, on-call roster, or SLO evidence exists | AUD-025 |
| 18 | Test layers | 133 application tests plus two repository-policy regressions pass with useful core coverage and a manual iPhone smoke subset; native automation/release E2E and production contract-environment evidence are absent | AUD-027 |
| 19 | Visual design | Desktop/mobile rendered flows are consistent and overflow-free; an owner observed core iPhone screens, but signed-release store/device screenshots and broad visual QA are absent | AUD-031 |
| 20 | Animation/reduced motion/battery | Root transitions honor reduced motion; native frame/battery impact is unmeasured | AUD-014, AUD-026 |
| 21 | Localization | Finnish/English UI and native permission strings exist; device truncation/assistive-tech checks remain | AUD-014, AUD-036 |
| 22 | Dependency/supply chain | Frozen lock, explicit strict 1,440-minute release age, exact CI actions, install check, Doctor and audit policy pass; two high unpatched advisories remain | AUD-013, AUD-028, AUD-029 |
| 23 | CI/CD/reproducibility | Frozen install, validation and Doctor 20/20 pass locally; remote latest pushed commit was green, but the audit commit is not pushed | AUD-013, AUD-029 |
| 24 | App Store/Play requirements | Identifiers/config and Personal-Team signing exist; no Xcode 26/iOS 26 archive/TestFlight, API 36 AAB or console validation exists | AUD-015, AUD-016, AUD-023 |
| 25 | Store assets/descriptions/questionnaires | Source icons exist; screenshots, feature graphic, hosted URLs, forms and signed-binary answers are incomplete | AUD-031 |
| 26 | Legal review markers | Drafts are visibly marked, but publication-grade documents and approval are absent | AUD-022 |
| 27 | Deletion/export/retention | All app-prefixed local data can be deleted; export/controller rights and production retention procedure are unresolved | AUD-009, AUD-032 |
| 28 | Credentials/accounts/manual actions | A local Apple account/Personal Team was used for device testing; required paid store/release, EAS, OFF, hosting, monitoring and GS1 authority remain absent | AUD-015, AUD-016, AUD-018, AUD-019, AUD-020, AUD-023 |
| 29 | Documentation accuracy | Earlier 100-test/Doctor-20-of-20/local-done claims were false after independent verification and are replaced | AUD-035 |
| 30 | Unsupported claims/placeholders/fake data | Production rejects placeholder contacts/URLs; barcode copy now discloses food/community-data scope; mock GS1 is not bundled, but drafts and test-only mock exports remain visible | AUD-008, AUD-019, AUD-022, AUD-034, AUD-037 |

## Findings

### AUD-001 — Unbounded in-process product cache

- Severity: **high**
- Status: **resolved locally**
- Evidence: the original resolution cache had no entry bound; repeated unique GTIN/language keys could grow process memory indefinitely. It now defaults to 5,000 entries, prunes expired data, evicts oldest entries, and rejects invalid bounds.
- Affected files/flows: `packages/application/src/product-resolution-service.ts`; every lookup.
- Reproduction: on the original baseline, inject a `Map`, perform more than 5,000 unique lookups, and observe monotonically increasing size.
- Required remediation: bound and prune the cache and regression-test eviction/option validation.
- Execution boundary: locally executable; completed and covered by application tests.

### AUD-002 — Upstream product identity was not bound to the requested GTIN

- Severity: **high**
- Status: **resolved locally**
- Evidence: OFF normalization previously trusted the requested GTIN even if the response represented another product. The response must now include `product.code`, pass GTIN validation, and equal the request after GTIN-14 zero-padding normalization.
- Affected files/flows: `packages/data-providers/src/open-food-facts.ts`; OFF lookup.
- Reproduction: return HTTP 200 with `product.code=4006381333931` for request `3017620422003`.
- Required remediation: reject missing, invalid, or mismatched product codes as `invalid_response`.
- Execution boundary: locally executable; completed with contract regressions.

### AUD-003 — Unsafe substring taxonomy inference

- Severity: **high**
- Status: **resolved locally**
- Evidence: substring matches could classify values such as `en:non-plastic` or `en:not-a-bottle` as positive evidence. Mapping now uses a conservative exact allowlist; unsupported taxonomy stays unknown.
- Affected files/flows: `packages/data-providers/src/open-food-facts.ts`; packaging normalization and sorting.
- Reproduction: feed the original adapter negated taxonomy identifiers and inspect inferred material/shape.
- Required remediation: exact reviewed mappings and negative regression fixtures.
- Execution boundary: locally executable; completed.

### AUD-004 — Provider quota guard was missing

- Severity: **high**
- Status: **resolved locally; distributed control remains in AUD-018**
- Evidence: OFF documents 15 product reads/minute/IP. The adapter now reserves at most 12/minute per process and returns a retryable rate-limit error; the API route separately permits 20/minute per direct client.
- Affected files/flows: `packages/data-providers/src/open-food-facts.ts`, `apps/api/src/app.ts`.
- Reproduction: issue 13 uncached adapter reads within one minute, or 21 API lookups from one injected IP.
- Required remediation: conservative provider limiter and HTTP 429 behavior with tests.
- Execution boundary: local single-process remediation completed; shared production enforcement requires the selected deployment edge/store.

### AUD-005 — Incomplete OFF licence and attribution representation

- Severity: **high**
- Status: **resolved locally; legal approval remains in AUD-019**
- Evidence: OFF states database ODbL 1.0, contents DbCL, and images CC BY-SA. Product provenance now exposes the combined database/content licence, attribution, source link, community status, and retrieval date; images retain CC BY-SA provenance.
- Affected files/flows: `packages/data-providers/src/open-food-facts.ts`, `apps/mobile/src/app/result.tsx`, `docs/final/DATA_AND_LICENSING.md`.
- Reproduction: resolve `3017620422003` and inspect the disclosure below the product result.
- Required remediation: explicit source/licence/attribution display and field-level provenance.
- Execution boundary: implementation completed locally; legal reuse/share-alike opinion is external.

### AUD-006 — Barcode-only builds requested unrelated camera/audio/storage access

- Severity: **high**
- Status: **resolved locally**
- Evidence: clean prebuild now removes Android record-audio/read-storage/write-storage/system-alert-window permissions, sets `allowBackup=false`, supplies localized Finnish/English iOS camera text, and contains no `NSMicrophoneUsageDescription`. The camera plugin has `microphonePermission:false` and `recordAudioAndroid:false`.
- Affected files/flows: `apps/mobile/app.json`, `apps/mobile/locales/*.json`; native permission prompts/manifests.
- Reproduction: clean prebuild and inspect AndroidManifest/Info.plist/InfoPlist.strings.
- Required remediation: declare only camera/internet/vibration access and make the barcode-only purpose truthful.
- Execution boundary: locally executable configuration completed; final merged signed manifests remain part of AUD-015/AUD-016.

### AUD-007 — UPC-E could be treated as a canonical GTIN-8

- Severity: **high**
- Status: **resolved locally**
- Evidence: the scanner accepted UPC-E output without implementing UPC-E expansion/check rules. Supported formats are now exactly EAN-8, EAN-13, and UPC-A.
- Affected files/flows: `apps/mobile/src/features/scan/barcode-formats.ts`, scanner configuration.
- Reproduction: scan a UPC-E symbol whose eight digits happen to satisfy GTIN-8 validation on the original code.
- Required remediation: disable UPC-E until canonical expansion is implemented and tested.
- Execution boundary: completed locally with a format allowlist regression.

### AUD-008 — Production endpoint and malformed-response states were unsafe

- Severity: **high**
- Status: **resolved locally**
- Evidence: preview/production now require an explicit HTTPS API origin with no credentials/path/query/fragment; loopback/HTTP are development-only. Invalid JSON, wrong GTIN, or HTTP/status mismatches become provider unavailable, while only fetch/abort failures become offline.
- Affected files/flows: `apps/mobile/src/features/scan/api-config.ts`, `lookup-response.ts`, `api.ts`, `.env.example`, `eas.json`.
- Reproduction: configure production with `http://127.0.0.1:3000`, or return a 200 `not_found`/mismatched GTIN payload.
- Required remediation: fail builds/configuration closed and distinguish protocol failure from network absence.
- Execution boundary: local implementation complete; an actual production URL is blocked by AUD-018.

### AUD-009 — Local-data deletion and backup disclosure were incomplete

- Severity: **high**
- Status: **resolved locally**
- Evidence: Legal now offers confirmed deletion of every `@kierratysappi/` key; history clearing is confirmed; Android backup is disabled; copy discloses possible operating-system backup behavior rather than claiming absolute device-only retention.
- Affected files/flows: `apps/mobile/src/features/history/storage.ts`, `legal.tsx`, `history.tsx`, localization, `app.json`.
- Reproduction: create history/pending/feedback/language keys, invoke delete-all, then inspect AsyncStorage.
- Required remediation: scoped deletion, destructive confirmation, truthful backup language, regression on key selection.
- Execution boundary: completed locally; iOS backup behavior of the signed app and rights procedures remain AUD-032.

### AUD-010 — Validation/error/log/build-output hardening gaps

- Severity: **high**
- Status: **resolved locally**
- Evidence: API bodies now reject extra fields, cap size at 2,048 bytes, return generic 400/413/429 bodies, omit sourcemaps, and keep the GS1 mock out of `dist/server.js`. Client validation errors log only status code, not Fastify validation objects; 5xx detail remains server-only.
- Affected files/flows: `apps/api/src/app.ts`, `tsup.config.ts`, API error path and bundle.
- Reproduction: POST an extra field or oversized body, inspect response and production log; search bundle for `.map` and `mock-gs1`.
- Required remediation: strict schemas, generic client errors, sanitized 4xx logs, source-map/mock exclusion, regression tests.
- Execution boundary: completed locally; tests pass.

### AUD-011 — Database accepted invalid checksums and contradictory component facts

- Severity: **high**
- Status: **resolved locally**
- Evidence: migration now uses an immutable SQL GTIN checksum function and a composite material-code/material foreign key. PGlite rejects invalid checksum rows and contradictory component material records.
- Affected files/flows: `database/migrations/0001_initial.sql`, migration tests.
- Reproduction: insert GTIN `3017620422004`, or pair `05-PP` with paper.
- Required remediation: enforce domain invariants in PostgreSQL, not only TypeScript.
- Execution boundary: completed locally with migration regressions.

### AUD-012 — Rule dates and source provenance were decorative/stale

- Severity: **high**
- Status: **resolved locally**
- Evidence: rule references now have effective ranges; the engine evaluates `evaluatedAt` and returns `no_effective_rule` outside the range. Rinki/Palpa URLs and metal copy were corrected to current reviewed pages.
- Affected files/flows: `packages/recycling-engine`, database seed, guide/research docs.
- Reproduction: evaluate a component on 2026-08-09 or inspect the previous stale source URLs.
- Required remediation: executable effective-date checks, current provenance, and regression tests.
- Execution boundary: completed locally; content-owner approval remains AUD-021.

### AUD-013 — Mutable CI/toolchain resolution

- Severity: **high**
- Status: **resolved locally**
- Evidence: workflow actions are pinned to exact commit SHAs; Node is pinned to 24.19.0 in `.nvmrc`, CI, and EAS; pnpm is 11.16.0; frozen install succeeds.
- Affected files/flows: `.github/workflows/*.yml`, `.nvmrc`, `apps/mobile/eas.json`, lockfile.
- Reproduction: inspect prior version tags/floating runtime values.
- Required remediation: immutable action references and one production runtime version.
- Execution boundary: completed locally. Remote audit commit checks have not run because no push was authorized.

### AUD-014 — Accessibility, reduced-motion, safe-area and localization defects

- Severity: **high**
- Status: **resolved locally; physical verification remains AUD-026**
- Evidence: root transitions honor reduced motion, camera overlay uses safe-area insets, arrow-only history control has a full label, light amber contrast increased from approximately 4.15:1 and 16 token pairs now test at 4.5:1+, document/native accessibility language follows the UI language, and exposed metadata/component strings are localized.
- Affected files/flows: mobile layout, scanner, history, result/guide screens, theme, localization.
- Reproduction: enable reduced motion; keyboard-focus the web UI; switch language; calculate text/background contrast.
- Required remediation: code-level semantics/contrast/motion/localization plus regression tests.
- Execution boundary: completed locally; VoiceOver/TalkBack/large text require devices.

### AUD-015 — Android release has no build/install/runtime evidence

- Severity: **blocker**
- Status: **open, externally blocked**
- Evidence: there is no Java runtime, Android SDK/ADB, EAS credential, signed AAB/APK, Play Console artifact, or installed-device log. A source prebuild is not a release build.
- Affected files/flows: whole Android app, merged manifest, camera, networking, signing, Play requirements.
- Reproduction: `java -version` reports no runtime; `adb` and `eas` are absent.
- Required remediation: build with Android API 36-compatible tooling, inspect the signed merged manifest/SBOM, install on the device matrix, execute the checklist, and validate the AAB in Play Console.
- Execution boundary: requires toolchain/device/signing/store authority.

### AUD-016 — iOS release lacks archive/TestFlight/release-matrix evidence

- Severity: **blocker**
- Status: **open; local manual matrix in progress, release path externally blocked**
- Evidence: Xcode 26.6/iOS 26.5 SDK now compiles the Debug app. All 11 embedded frameworks and the app pass strict recursive signature verification; `devicectl` installs/launches it on an iPhone 12 Pro Max/iOS 26.1, and core flows pass. The free Personal-Team profile expired after seven days and required owner renewal/reinstall/trust. No paid-program archive, final archive entitlement/privacy report, TestFlight processing, release-configuration install or representative Apple device matrix exists. Apple uploads require supported Xcode/iOS SDK tooling.
- Affected files/flows: whole iOS app, entitlements, privacy manifest merge, localization, signing, App Store validation.
- Reproduction: inspect `PHYSICAL_IOS_VALIDATION.md`; development rows are partial and archive/TestFlight/release rows have no artifact ID, hash or console output.
- Required remediation: complete the remaining local matrix, then archive with owner-controlled paid-program credentials, inspect final entitlements/privacy report, install through TestFlight/internal distribution and run the release device matrix.
- Execution boundary: remaining manual device work is executable with the owner present; archive/TestFlight still requires owner-controlled paid membership, signing and store authority.

### AUD-017 — Physical barcode reliability is unverified

- Severity: **blocker**
- Status: **open; iPhone subset in progress, representative/Android coverage externally blocked**
- Evidence: code recognizes three formats and one physical EAN-13 plus allow/revoke/settings recovery now pass on iPhone. There is still no physical EAN-8/UPC-A/UPC-E-rejection evidence or camera evidence for glare, curvature, dim light, damage, duplicate scans, multiple symbols, focus range or end-to-end latency.
- Affected files/flows: scanner, permission recovery, haptics, duplicate suppression, camera lifecycle.
- Reproduction: inspect the physical matrix: only the named EAN-13 and permission subset is marked Pass; all adverse-condition and other-format rows remain Not run.
- Required remediation: test EAN-8, EAN-13 and UPC-A on representative Android/iOS hardware and record build/device/OS/pass-fail evidence.
- Execution boundary: continued iPhone work is manually executable; Android and representative device coverage remain externally blocked.

### AUD-018 — No production API/infrastructure or multi-instance reliability design

- Severity: **blocker**
- Status: **open, externally blocked**
- Evidence: EAS preview/production intentionally lack `EXPO_PUBLIC_API_BASE_URL`; no deployed HTTPS API, DNS, database, edge rate limit, secrets store, capacity test, or chosen hosting region exists. Cache/provider/client limits are per process and `trustProxy=false` assumes direct clients.
- Affected files/flows: `apps/api`, EAS configuration, mobile networking, deployment runbook.
- Reproduction: attempt a preview/production mobile config without the API URL; it fails closed.
- Required remediation: owner selects EU-region infrastructure and budget; deploy behind a documented trusted edge; add shared rate/quota coordination, load/failure tests, TLS/domain, and inject the HTTPS origin.
- Execution boundary: requires accounts, cost/privacy-region decision and production authority.

### AUD-019 — OFF production account/contact/licence approval is absent

- Severity: **high**
- Status: **open, externally blocked**
- Evidence: production rejects the `.invalid` default and requires a monitored email, but no owner-controlled OFF account/API usage form/contact mailbox or legal approval is evidenced. OFF also disclaims community-data completeness/accuracy.
- Affected files/flows: API environment, provider use, store/legal disclosures.
- Reproduction: start production without an owner contact; configuration fails.
- Required remediation: register/submit usage as required by OFF, create monitored contact/escalation, approve ODbL/DbCL/CC BY-SA reuse/caching/attribution, and capture approval.
- Execution boundary: owner account and legal action.

### AUD-020 — GS1 Data production boundary is unlicensed and unimplemented

- Severity: **high**
- Status: **open, externally blocked**
- Evidence: GS1 Finland is transitioning Synkka to GS1 Data in 2026. The repository contains only a conspicuously synthetic test adapter; there are no terms, credentials, fields, rate limits, caching/redistribution rights, or API fixtures.
- Affected files/flows: provider fallback and `docs/final/GS1_INTEGRATION_PLAN.md`.
- Reproduction: inspect API composition; only OFF is instantiated, and the production bundle contains no mock string.
- Required remediation: obtain current written GS1 Data terms/access, then implement the provider-neutral contract, licensed fixtures, fallback, termination purge, attribution and conflict tests.
- Execution boundary: contract, cost, credentials and legal rights are external.

### AUD-021 — Recycling rules lack independent editorial/legal approval

- Severity: **high**
- Status: **open, externally blocked**
- Evidence: current Rinki/Palpa pages support the implemented national packaging/deposit logic, but the same autonomous build process both interpreted and implemented them. There is no named content owner approval, reuse opinion, review cadence, or incident contact.
- Affected files/flows: recycling engine, seed data, guide and all sorting results.
- Reproduction: inspect rule history; no human editorial sign-off artifact exists.
- Required remediation: Finnish sorting-content owner independently checks every branch/copy/source/date, legal reviews reuse, signs the version, and owns recurring revalidation/withdrawal.
- Execution boundary: requires accountable human expertise/approval.

### AUD-022 — Privacy, GDPR and terms are publication blockers

- Severity: **blocker**
- Status: **open, externally blocked**
- Evidence: the in-app text is explicitly a draft and lacks an approved controller identity/contact, lawful basis, rights/complaint process, recipient/transfer assessment, final retention table, processor list, breach contact, and hosted privacy/support URLs.
- Affected files/flows: Legal screen, store forms, API operation, incident response.
- Reproduction: open Legal; it displays `DRAFT — REQUIRES LEGAL REVIEW`.
- Required remediation: counsel/controller completes and hosts Finnish/English privacy notice and terms, approves actual data flow/retention/rights/processor position, and maps final signed binaries to both store questionnaires.
- Execution boundary: legal/controller decision and public hosting.

### AUD-023 — Store submission and current platform compliance are unverified

- Severity: **blocker**
- Status: **open, externally blocked**
- Evidence: no Apple/Google developer account, signing identity, EAS project, archive/AAB, TestFlight/Play internal track, console validation, age/content rating, export answer, reviewer notes, DSA/trader status or staged rollout record exists. Google requires API 36 for new apps/updates from 2026-08-31; Apple already requires Xcode 26/iOS 26 SDK.
- Affected files/flows: native builds, `eas.json`, store consoles and release process.
- Reproduction: there are no store artifact IDs or console exports in the repository.
- Required remediation: execute OWNER_ACTIONS store procedures with the final binaries and retain console validation evidence.
- Execution boundary: accounts, agreements, signing, manual questionnaires and publication authority.

### AUD-024 — Database recovery is a plan, not evidence

- Severity: **high**
- Status: **open, externally blocked**
- Evidence: PGlite verifies schema behavior only. There is no production PostgreSQL repository wiring, migration ledger/runner evidence, encrypted backup, point-in-time recovery, restore drill, checksum reconciliation, approved RPO/RTO, or least-privileged role test.
- Affected files/flows: `database`, future product/rule/moderation persistence.
- Reproduction: no production database connection/configuration exists.
- Required remediation: select managed PostgreSQL, add a forward-only migration runner/ledger, roles, backup policy and quarterly isolated restore drill with recorded results.
- Execution boundary: infrastructure/account/operations approval.

### AUD-025 — Observability and incident response are non-operational

- Severity: **high**
- Status: **open, externally blocked**
- Evidence: code emits a privacy-safe aggregate lookup observation and has runbooks, but no vendor/collector, health monitor, SLO, alert rules, dashboard, on-call schedule, or named security/privacy/provider contacts exist.
- Affected files/flows: production API, provider quota/outage, sorting incidents, privacy/security response.
- Reproduction: there is no alert endpoint/account/roster; `INCIDENT_RESPONSE.md` still says OWNER ACTION REQUIRED.
- Required remediation: owner selects EU-compatible monitoring, names primary/backup responders, configures aggregate availability/latency/error/quota alerts, tests an alert and tabletop incident, and records retention/access.
- Execution boundary: vendor/account/privacy/contact decisions.

### AUD-026 — Native accessibility/performance/animation/battery evidence is incomplete

- Severity: **high**
- Status: **open, partially executable with manual device work**
- Evidence: code and web review pass, and functional background/force-quit plus permission/offline/result flows now pass on one iPhone development build. There is still no VoiceOver/TalkBack, largest text, switch/keyboard, color-mode, measured native frame pacing/startup, memory, camera power/battery or reduced-motion device evidence.
- Affected files/flows: all screens, navigation, camera and haptics.
- Reproduction: inspect `PHYSICAL_IOS_VALIDATION.md`; functional rows are partial while all assistive-technology and measured performance/battery rows remain Not run.
- Required remediation: execute and record the manual matrix on representative recent/small/tablet devices against stated performance budgets.
- Execution boundary: the iPhone subset is manually executable now; Android and representative multi-device coverage remain externally blocked.

### AUD-027 — Mandatory native E2E and production contract evidence is missing

- Severity: **high**
- Status: **open, partially executable locally**
- Evidence: 133 application unit/integration/contract/migration/mobile-state tests plus two repository-policy regressions pass, and a manual signed-development-build smoke subset now boots on iPhone. There is still no native UI automation, complete physical camera E2E, release-signed smoke, real database integration, deployed fault/load test or store-installed upgrade test.
- Affected files/flows: cross-system release behavior.
- Reproduction: enumerate automated tests; they do not boot a native binary or deployed environment. Compare the limited manual rows in `PHYSICAL_IOS_VALIDATION.md` with the unrun matrix.
- Required remediation: add Maestro/Detox or equivalent for non-camera flows, physical camera checklist, deployed provider/database contracts, outage/load/upgrade tests, and attach artifacts.
- Execution boundary: a local iOS harness is now technically possible and remains locally executable work; production contracts, store upgrade and Android/release acceptance remain externally blocked.

### AUD-028 — Two high transitive build-tool advisories are unpatched

- Severity: **high**
- Status: **open, externally time-blocked**
- Evidence: `pnpm security:audit` reports `GHSA-w3rx-r6r6-pgpr` and `GHSA-5p2g-fcmc-qvqq` in Metro's `image-size@1.2.1`; the advisory's fixed `2.0.3` is not published. Scope is build-time parsing of repository-controlled assets. Exceptions expire 2026-09-10; two additional moderate/low advisories were reviewed.
- Affected files/flows: developer/CI asset processing, dependency policy.
- Reproduction: run `pnpm security:audit` or inspect the audit JSON/policy script.
- Required remediation: upgrade to a compatible dependency containing `image-size>=2.0.3` immediately when published; otherwise stop at expiry and perform a new explicit risk decision.
- Execution boundary: upstream package release is required; no safe patched version exists now.

### AUD-029 — Expo compatibility and supply-age enforcement

- Severity: **high**
- Status: **resolved locally on 2026-08-22**
- Evidence: the time-sensitive gate was rerun and identified six supported patches. Their registry publication times exceeded the explicit strict 1,440-minute policy, so Expo 57.0.15, camera 57.0.4, constants 57.0.13, linking 57.0.7, router 57.0.15 and splash 57.0.7 were installed without exclusions. `expo install --check` passes, Doctor 1.20.1 passes 20/20, peer checking passes and the lockfile passes supply-chain verification.
- Affected files/flows: mobile dependency resolution and CI's Expo health step.
- Reproduction: run `expo install --check`, Expo Doctor 1.20.1 and `pnpm peers check`; inspect `pnpm-workspace.yaml` for strict age enforcement.
- Required remediation: completed; keep the diagnostics mandatory after dependency changes and never add a broad release-age exclusion to force fresh packages.
- Execution boundary: locally completed; future patch sets remain subject to the same age and diagnostic gates.

### AUD-030 — Web bundle exceeds its warning budget and lacks a supported-distribution decision

- Severity: **medium**
- Status: **open, locally executable after product decision**
- Evidence: entry bundle is 2,528,030 bytes uncompressed and 571,827 bytes gzip, above the documented 2 MiB warning threshold; prior docs claimed about 1.7 MiB. The primary product is native and web support has not been approved.
- Affected files/flows: Expo web initial load and performance docs.
- Reproduction: export web and measure `_expo/static/js/web/entry-*.js`.
- Required remediation: decide whether web is supported; if yes, set compressed budgets, inspect bundle composition, defer camera/native-only code, and measure deployed CWV; if no, remove web release claims.
- Execution boundary: optimization is local, but the distribution decision is owner/product scope.

### AUD-031 — Store assets and metadata are incomplete

- Severity: **high**
- Status: **open, externally blocked**
- Evidence: valid 1024px icon/adaptive/splash PNGs and Finnish/English draft copy exist. Missing are signed-binary phone/tablet screenshots, localized screenshot sets, Google 1024×500 feature graphic, approved descriptions/keywords/category/age answers, hosted privacy/support URLs, reviewer notes and final questionnaire exports.
- Affected files/flows: `apps/mobile/assets`, `docs/product/STORE_METADATA.md`, App Store Connect/Play Console.
- Reproduction: list repository assets; no store screenshot/feature-graphic directories or console exports exist.
- Required remediation: capture real signed builds after device acceptance, create exact required assets per locale/form factor, finalize copy/forms, and validate in both consoles.
- Execution boundary: screenshots/forms depend on signed builds/accounts and owner/legal approval.

### AUD-032 — Export, retention and controller-side rights procedure are incomplete

- Severity: **high**
- Status: **open, externally blocked**
- Evidence: local data can be viewed/deleted and no account exists, but there is no approved access/export request process for any future server/backup/log data, final retention schedule, backup-deletion semantics, requester verification, response SLA, or processor propagation procedure.
- Affected files/flows: privacy notice, local storage, future production infrastructure and support.
- Reproduction: inspect Legal/operations docs; only local deletion is actionable.
- Required remediation: controller/counsel decides applicability and documents exact access/export/deletion/objection/complaint procedure and retention table; implement server endpoints only if final production data makes them necessary.
- Execution boundary: requires final architecture and controller/legal decision.

### AUD-033 — OCR/AI/photo risk is contained by non-implementation

- Severity: **low**
- Status: **accepted for this release scope**
- Evidence: no photo capture/upload, OCR model, AI API, prompt, image storage or image permission exists. Typed material-code input is bounded, deterministic and requires visual confirmation.
- Affected files/flows: material-code flow and future roadmap.
- Reproduction: search runtime code/bundle for upload/OCR/AI clients; none are composed.
- Required remediation: keep disabled until the threat-model, consent, evaluation, deletion, moderation and device gates are satisfied.
- Execution boundary: no current change required.

### AUD-034 — Synthetic GS1 code could be mistaken for a capability

- Severity: **medium**
- Status: **mitigated locally**
- Evidence: `MockGs1DataProvider` is exported by the data-provider package and uses a fixture, but labels all provenance `mock`/synthetic. API composition uses only OFF and the production API bundle contains no mock symbol.
- Affected files/flows: developer imports/tests/documentation; not current production runtime.
- Reproduction: import the package mock and request its fixture GTIN; compare with `apps/api/dist/server.js`.
- Required remediation: retain conspicuous mock labels and bundle test; consider moving it under a test-only export before publishing the package.
- Execution boundary: current runtime mitigation is local and verified; package-layout cleanup is low-risk follow-up.

### AUD-035 — Readiness documentation contained unsupported green claims

- Severity: **high**
- Status: **resolved locally by this audit**
- Evidence: `CURRENT_STATE`, `RELEASE_READINESS`, performance and test evidence claimed locally complete, 100 tests, Expo Doctor 20/20, compatibility pass and about 1.7 MiB web entry. The initial independent check found 133 application tests, Doctor 19/20, compatibility failure and a 2.53 MiB entry. Dated follow-up now records 135 total automated tests and a separately verified dependency update to Doctor 20/20.
- Affected files/flows: project-control/final documentation and release decisions.
- Reproduction: compare prior text with current commands/artifacts.
- Required remediation: replace claims with dated command evidence and explicit failures/blockers; never infer native/store results.
- Execution boundary: completed locally in the audit documentation set.

### AUD-036 — Localization scope is limited to Finnish and English

- Severity: **medium**
- Status: **open, scope decision**
- Evidence: UI and camera permission strings exist for `fi`/`en`, and the web document/native accessibility language follows selection. There is no pseudo-localization, screenshot truncation automation, or third language.
- Affected files/flows: all copy, store listings and native prompts.
- Reproduction: enumerate localization keys/locales and render largest text.
- Required remediation: declare Finnish/English as the supported launch scope, add key-parity/pseudo-localization/truncation checks, and localize store screenshots accordingly.
- Execution boundary: parity is local; final launch-locale decision and device evidence are owner/external.

### AUD-037 — Barcode copy overstated product coverage

- Severity: **high**
- Status: **resolved locally**
- Evidence: production intentionally queries OFF with `product_type=food`, but the home/store copy previously implied arbitrary product identification and component completeness. Copy now states food-product lookup, community-data availability and available components; manual material/code fallback remains general.
- Affected files/flows: Finnish/English home/camera/store/product-overview copy and product expectations.
- Reproduction: compare the provider request's `product_type=food` with the previous “Scan a product barcode” claim.
- Required remediation: align every launch claim with actual provider scope and incomplete community coverage.
- Execution boundary: completed locally; final store copy still requires OA-10 approval.

## Authoritative current requirements checked

- Open Food Facts API usage, limits, identification and licences: <https://openfoodfacts.github.io/openfoodfacts-server/api/> and <https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/tutorials/license-be-on-the-legal-side/>
- Rinki nationwide packaging instructions: <https://rinkiin.fi/lajittelu-kotona/lajitteluohjeet/>
- Palpa deposit guidance: <https://www.palpa.fi/for-consumers/faq/>
- GS1 Finland GS1 Data transition/docs: <https://gs1.fi/en/support/gs1-data-implementation> and <https://gs1.fi/en/customersupport/synkka/documentation>
- Expo SDK 57 and local physical-development requirements: <https://docs.expo.dev/versions/latest/> and <https://docs.expo.dev/develop/development-builds/introduction/>
- Apple Xcode 26.6 compatibility, Personal-Team limits and upload requirement effective 2026-04-28: <https://developer.apple.com/xcode/system-requirements>, <https://developer.apple.com/help/account/basics/about-your-developer-account> and <https://developer.apple.com/news/upcoming-requirements/?id=02032026a>
- Google Play target API requirement effective 2026-08-31: <https://support.google.com/googleplay/android-developer/answer/11926878?hl=en-GB_ALL>
- Apple app privacy and Google Data Safety: <https://developer.apple.com/app-store/app-privacy-details/> and <https://support.google.com/googleplay/android-developer/answer/10787469?hl=en>
- Google Play preview assets: <https://support.google.com/googleplay/android-developer/answer/9866151?hl=en>
