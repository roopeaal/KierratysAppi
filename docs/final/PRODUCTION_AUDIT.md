# Adversarial production-readiness audit

Audit date: 2026-09-08 (Xcode 27 startup evaluation and recovery; broader physical and source-review evidence retains its recorded date)

Follow-up physical-iOS runs: 2026-08-10, 2026-08-22, 2026-08-26, the 2026-08-28 development-client/answer-first UI work unit, the 2026-09-04 signed-client refresh and the 2026-09-07 current-client runtime smoke on local `main`; audited commits remain unpushed to `origin/main`. See `PHYSICAL_IOS_VALIDATION.md`.

Decision: **NO-GO**

September 10 visual-work-unit update (not a new 30-lane audit): the refreshed Home/manual/result/guide and scanner chrome are implemented, 181 tests plus API/web builds pass, and scoped FI/EN multi-width/invalid/offline/ambiguous browser evidence is in `design-refresh-evidence.md`. Web checked-state semantics found during inspection were fixed. The new UI has no physical acceptance yet; no finding severity or release gate is lowered. Earlier device screenshots describe the previous design.

September 8 follow-up at source baseline `a6af06c`: Xcode 27 beta's Debug build/sign/install passed but physical startup failed on required UIScene adoption (AUD-042). The accepted Xcode 26.6 binary was restored; Home/manual/known-product/provenance and terminate/relaunch passed. Full pinned-pnpm validation passes 167 tests. No beta runtime acceptance or new live security-audit pass is claimed.

Repository: `roopeaal/KierratysAppi`, private `main`

Continuation baseline: local `77ad397` (`Refresh signed iOS client and harden dependency audit`), nine commits ahead of `origin/main` (`87404a0`); the September 7 physical evidence/documentation continuation was uncommitted while this report was updated.

This audit did not accept earlier readiness statements as evidence. It inspected source, generated native configuration, dependency resolution, build output, GitHub state, live API behavior, live Open Food Facts behavior, rendered web behavior, and official external requirements independently. Remaining blocker/high release findings require device/matrix evidence, accounts, contracts, legal/content approval or production infrastructure. The historical Expo age gate and Metro advisory exceptions are no longer current blockers.

## Decision basis

The repository is a testable prototype but is not a releasable production system. The August short-lived iOS Personal-Team client and a limited physical EAN-13/core-flow subset passed. On September 7, the current Expo 57 client established phone-to-Metro TCP and passed Home, manual entry and a known-product result retaining uncertainty and Rinki rule provenance. There is still no Android build, iOS archive/TestFlight build, complete physical matrix, deployed API, production database, backup drill, monitoring/on-call service, approved privacy/terms/licensing position, store submission package, or store account evidence. On 2026-09-04 the current Expo patch set passes frozen install, peer check, `expo install --check` and Doctor 1.20.1 20/20. The strict 1,440-minute release-age policy remains intact without exclusions.

The September refresh aligns the supported native dependency set, removes an obsolete Metro vulnerability path/exception and repairs newly detected high `fast-uri` advisories. The August development-client and answer-first UI repairs remain in place. The asynchronous VoiceOver device retest, actual torch operation, broad camera/native automation, dark/largest-text/reduced-motion and valid native performance/battery evidence remain open. Android, release signing/stores, infrastructure and legal/licensing/content approval also remain open. The decision remains NO-GO; dependency health alone does not close release or physical-device evidence gates.

## Evidence lanes

| # | Lane | Independent result | Findings |
| ---: | --- | --- | --- |
| 1 | Product requirements and acceptance criteria | P0 behavior is specified and automated at domain/API/state boundaries; release acceptance remains incomplete | AUD-027, AUD-035 |
| 2 | Android functionality | Source configuration prebuilds; no APK/AAB, install, launch, or Android runtime evidence | AUD-006, AUD-015 |
| 3 | iOS functionality and configuration | September current-dependency Debug build, strict app/11-framework signatures, physical install and native-client launch pass; profile expires September 11. On September 7 current LAN/API/Metro health, phone-to-Metro TCP, Home, manual entry and a known-product result with uncertainty/Rinki provenance passed. Archive/TestFlight/release evidence remains absent | AUD-006, AUD-016, AUD-039 |
| 4 | Physical-device-capable barcode flows | One real EAN-13 and permission/recovery path pass; EAN-8/UPC-A/unsupported/adverse/rapid/multiple-code reliability remains unverified | AUD-007, AUD-017 |
| 5 | Product resolution and fallback | OFF-only production composition is conservative; provider fallback is tested but GS1 is unavailable | AUD-002, AUD-003, AUD-020 |
| 6 | Open Food Facts licensing | Combined ODbL/DbCL disclosure and attribution now ship; legal/account/usage approval remains open | AUD-005, AUD-019 |
| 7 | GS1 Data boundary | Synthetic adapter is excluded from the API bundle; 2026 GS1 Data contract/access is absent | AUD-020, AUD-034 |
| 8 | Recycling accuracy/provenance | Effective-dated Rinki/Palpa rules and safe uncertainty exist; independent content approval does not | AUD-012, AUD-021 |
| 9 | Unknown/ambiguous/offline | Distinct states are automated and use localized user-facing reasons with evidence; physical unknown, offline/no-request and restored retry/cache paths pass on one iPhone, and ambiguous web rendering was inspected. The September 7 first lookup correctly showed offline when Metro held the previous API LAN address, then recovered after restart with the current address | AUD-008, AUD-040 |
| 10 | OCR and AI safety | Photo, OCR, upload, and cloud AI are disabled; threat-model gates exist | AUD-033 |
| 11 | Security | Input/body/redirect/response limits, CORS, no-store, RLS, dependency and secret gates exist; new high `fast-uri` paths are patched and obsolete Metro exceptions are removed; deployment controls are absent | AUD-010, AUD-018, AUD-025, AUD-028, AUD-041 |
| 12 | Privacy/GDPR | Collection is minimized and local deletion exists; controller notice, lawful basis, rights process, and approval are absent | AUD-009, AUD-022, AUD-032 |
| 13 | Accessibility | Web semantics/focus/contrast and code-level reduced motion pass; stable critical IDs, uncapped font scaling and internal-button semantics are policy-tested. Partial iPhone VoiceOver testing found and verified a high text-field/manual-status repair, then found an async-result gap now repaired locally but awaiting device retest; remaining VoiceOver/TalkBack/largest-text evidence is open | AUD-014, AUD-026, AUD-038, AUD-040 |
| 14 | Performance/bundle | API is small; historical privacy-safe physical observations included 162/249/343 ms live completions and 5/8 ms cache hits, but end-to-end native budgets remain unmeasured; September web entry is 2,540,918 bytes / 575,233 gzip | AUD-026, AUD-030 |
| 15 | Database integrity/migration/recovery | Migration constraints and PGlite tests pass; no production repository or restore drill exists | AUD-011, AUD-024 |
| 16 | API reliability/validation/rate limits | Strict validation, timeouts, body limits, local rate limits and production smoke pass; multi-instance behavior is unresolved | AUD-004, AUD-010, AUD-018 |
| 17 | Observability/incident response | Privacy-safe aggregate hook/runbooks exist; no monitoring, alerting, on-call roster, or SLO evidence exists | AUD-025 |
| 18 | Test layers | September pinned-pnpm full validation passes 154 application tests plus 13 repository policies (167 total), API/package builds and 12-route web export. Unchanged database tests passed after the CPU-contention rerun. Native automation/release E2E and production contracts remain absent | AUD-027 |
| 19 | Visual design | Answer-first Finnish/English Home, manual, resolved, ambiguous and offline flows were rendered at phone width; Home/result were also inspected at desktop width with zero measured horizontal overflow. Home/manual/resolved-result passed again on September 7 with the fresh Expo 57 iPhone client, but signed-release store/device screenshots and broad visual QA are absent | AUD-031, AUD-040 |
| 20 | Animation/reduced motion/battery | Root transitions honor reduced motion; native frame/battery impact is unmeasured | AUD-014, AUD-026 |
| 21 | Localization | Finnish/English UI, native permission strings, all destination labels and all uncertainty reasons exist; physical truncation/assistive-tech and pseudo-localization checks remain | AUD-014, AUD-036, AUD-040 |
| 22 | Dependency/supply chain | Current supported Expo patches pass frozen install, peers, install check and Doctor 20/20 with strict age/no exclusions; patched `fast-uri` yields a captured raw audit with zero high/critical. Final live policy fails closed after the external npm audit endpoint's 60-second timeout | AUD-013, AUD-028, AUD-029, AUD-041 |
| 23 | CI/CD/reproducibility | Frozen install, peers, Doctor 20/20 and full validation pass locally on September 4 with nested pnpm pinned to 11.16.0. The audit work remains unpushed; historical remote green checks do not validate these changes | AUD-013, AUD-029 |
| 24 | App Store/Play requirements | Identifiers/config and Personal-Team signing exist; no Xcode 26/iOS 26 archive/TestFlight, API 36 AAB or console validation exists | AUD-015, AUD-016, AUD-023 |
| 25 | Store assets/descriptions/questionnaires | Source icons exist; screenshots, feature graphic, hosted URLs, forms and signed-binary answers are incomplete | AUD-031 |
| 26 | Legal review markers | Drafts are visibly marked, but publication-grade documents and approval are absent | AUD-022 |
| 27 | Deletion/export/retention | All app-prefixed local data can be deleted; export/controller rights and production retention procedure are unresolved | AUD-009, AUD-032 |
| 28 | Credentials/accounts/manual actions | A local Apple account/Personal Team was used for device testing; required paid store/release, EAS, OFF, hosting, monitoring and GS1 authority remain absent | AUD-015, AUD-016, AUD-018, AUD-019, AUD-020, AUD-023 |
| 29 | Documentation accuracy | Historical test/native evidence is distinguished from September compatibility and current-client runtime evidence; the resolved Metro connectivity issue, expired age gate and obsolete advisory exceptions are no longer presented as current blockers | AUD-035 |
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
- Evidence: root transitions honor reduced motion, camera overlay uses safe-area insets, arrow-only history control has a full label, light amber contrast increased from approximately 4.15:1 and 16 token pairs now test at 4.5:1+, document/native accessibility language follows the UI language, exposed metadata/component strings are localized, and the later physical iOS finding is tracked separately as AUD-038.
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
- Evidence: on September 4, Xcode 26.6/iOS 26.5 SDK compiles the current-dependency Debug app from freshly generated `apps/mobile/ios` into `work/ios-dev-client-2026-09-04-derived/`. All 11 embedded frameworks and the app pass strict recursive signature verification. The renewed Personal-Team profile expires 2026-09-11 07:01:05 UTC. Physical installation and native development-client launch pass. On September 7 the API and Metro were healthy on the current LAN origins, the phone established Metro TCP connectivity, and the fresh Expo 57 client rendered Home, manual entry and a known-product result retaining uncertainty and Rinki provenance. The first lookup correctly rendered offline because the running Metro bundle contained the previous API LAN address; restarting Metro with the current `EXPO_PUBLIC_API_BASE_URL` restored lookup. August broader core-flow results remain historical. No paid-program archive, final archive entitlement/privacy report, TestFlight processing, release-configuration install or representative Apple device matrix exists.
- Affected files/flows: whole iOS app, entitlements, privacy manifest merge, localization, signing, App Store validation.
- Reproduction: inspect `PHYSICAL_IOS_VALIDATION.md`; the current development startup smoke is limited, the wider device matrix remains partial/not run, and archive/TestFlight/release rows have no artifact ID, hash or console output.
- Required remediation: complete the remaining local matrix, then archive with owner-controlled paid-program credentials, inspect final entitlements/privacy report, install through TestFlight/internal distribution and run the release device matrix.
- Execution boundary: the current development-client startup subset is complete and no network or firewall setting was changed. Remaining matrix work needs the owner/device; archive/TestFlight still requires owner-controlled paid membership, signing and store authority.

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
- Evidence: a local owner-controlled Apple account/Personal-Team development identity exists, but paid Apple/Google store authority, an EAS project, archive/AAB, TestFlight/Play internal track, console validation, age/content rating, export answer, reviewer notes, DSA/trader status and staged rollout are not evidenced. The platform requirements last rechecked August 28 include Google's API 36 requirement effective August 31 and Apple's Xcode 26/iOS 26 SDK requirement; final console acceptance remains unverified.
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
- Evidence: code and phone/desktop web review pass; functional background/force-quit plus permission/offline/result flows and the redesigned Home/manual/resolved-result subset pass on one iPhone development client. Partial VoiceOver home/scanner/manual-invalid coverage passes after AUD-038 repair. The known-product VoiceOver run exposed an additional async-result gap that is repaired locally but awaits device retest. Scanner semantics expose localized close/torch buttons, but the development toolbar overlays the torch hit target, so actual toggling is not claimed. A frame-trace attempt matched no app process and captured zero frames, so it is invalid evidence. Offline/provider announcements, full sequential focus order, TalkBack, largest text, switch/keyboard, color modes, measured native frame pacing/startup, memory, camera power/battery and reduced-motion device evidence remain open.
- Affected files/flows: all screens, navigation, camera and haptics.
- Reproduction: inspect `PHYSICAL_IOS_VALIDATION.md`; VoiceOver rows are partial while largest-text and measured performance/battery rows remain Not run.
- Required remediation: execute and record the manual matrix on representative recent/small/tablet devices against stated performance budgets; retest async VoiceOver announcements and the actual torch without the development overlay before treating either as passed.
- Execution boundary: the iPhone subset is manually executable now; Android and representative multi-device coverage remain externally blocked.

### AUD-027 — Mandatory native E2E and production contract evidence is missing

- Severity: **high**
- Status: **open, partially executable locally**
- Evidence: on September 4, 154 application unit/integration/contract/migration/mobile-state/accessibility/presentation tests plus 13 repository-policy regressions pass (167 total), with all format/lint/type/build checks and the 12-route web export. The initial concurrent-native-build run timed out existing database tests; their unchanged narrow five-test and full-suite reruns passed after the native compile finished. No test timeout was relaxed. A historical manual development-client smoke/VoiceOver subset exists. Stable critical `testID` values make a native harness practical, but no checked-in native UI automation boots the binary. Complete physical camera E2E, release-signed smoke, real database integration, deployed fault/load test and store-installed upgrade tests are still absent.
- Affected files/flows: cross-system release behavior.
- Reproduction: enumerate automated tests; they do not boot a native binary or deployed environment. Compare the limited manual rows in `PHYSICAL_IOS_VALIDATION.md` with the unrun matrix.
- Required remediation: add Maestro/Detox or equivalent for deterministic non-camera flows using the stable IDs, complete the physical camera checklist, add deployed provider/database contracts and outage/load/upgrade tests, and attach artifacts.
- Execution boundary: a local iOS harness is now technically possible and remains locally executable work; production contracts, store upgrade and Android/release acceptance remain externally blocked.

### AUD-028 — Two high transitive build-tool advisories required temporary acceptance

- Severity: **high**
- Status: **resolved locally on 2026-09-04; obsolete exceptions removed**
- Evidence: the August lockfile exposed `GHSA-w3rx-r6r6-pgpr` and `GHSA-5p2g-fcmc-qvqq` through Metro's `image-size@1.2.1`, with exact temporary exceptions expiring September 10. The supported September refresh resolves Metro 0.84.5 without an `image-size` dependency path. Neither a forced incompatible override nor an exception extension is needed. Both old allowances are removed; a regression requires those IDs to fail like every other high/critical advisory if reintroduced.
- Affected files/flows: developer/CI asset processing, dependency policy.
- Reproduction: compare the August lockfile/audit with the current `pnpm-lock.yaml`, run `pnpm why image-size`, and inspect/run `scripts/__tests__/dependency-policy.test.mjs`.
- Required remediation: keep the unsupported path absent and enforce the no-high/critical-exception policy; investigate any future reintroduction as a new finding.
- Execution boundary: local dependency and policy repair completed; no current upstream wait or owner risk acceptance is required for these two IDs.

### AUD-029 — Expo compatibility and supply-age enforcement

- Severity: **high**
- Status: **dependency compatibility resolved locally on 2026-09-04; native refresh tracked separately**
- Evidence: the August eight-package mismatch was legitimately age-gated until August 29. Revalidation on September 4 accepts Expo 57.0.19, constants 57.0.17, dev-client 57.0.18, font 57.0.3, haptics 57.0.2, linking 57.0.9, router 57.0.18, system-ui 57.0.3 and React Native 0.86.3. Frozen install, peer check, `expo install --check` and Expo Doctor 1.20.1 20/20 pass. Strict `minimumReleaseAge: 1440` and `minimumReleaseAgeStrict: true` remain configured; no age or Expo-check exclusion was added. These JavaScript checks do not establish native binary compatibility: the old installed client was Expo 57.0.16/RN 0.86.2 and its profile expired August 29.
- Affected files/flows: mobile dependency resolution and CI's Expo health step.
- Reproduction: run `expo install --check`, Expo Doctor 1.20.1 and `pnpm peers check`; inspect `pnpm-workspace.yaml` for strict age enforcement.
- Required remediation: preserve the complete supported set and strict age policy; require security/full validation and a fresh prebuild/pods/build/sign/install/runtime smoke after native dependency changes.
- Execution boundary: the dated package gate is closed locally. The current signed-client refresh must be evidenced separately in `PHYSICAL_IOS_VALIDATION.md` and does not close AUD-016 release acceptance.

### AUD-030 — Web bundle exceeds its warning budget and lacks a supported-distribution decision

- Severity: **medium**
- Status: **open, locally executable after product decision**
- Evidence: the September 4 entry bundle is 2,540,918 bytes uncompressed and 575,233 bytes gzip: 1,084 raw bytes larger and 655 gzip bytes smaller than August 28, still above the documented 2 MiB warning threshold. The secondary chunk is 45,171 bytes / 14,789 gzip. The primary product is native and web support has not been approved.
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
- Evidence: `CURRENT_STATE`, `RELEASE_READINESS`, performance and test evidence previously claimed locally complete, 100 tests, Expo Doctor 20/20, compatibility pass and about 1.7 MiB web entry. Independent checks contradicted these claims. The August 28 baseline then recorded 162 tests, Doctor 19/20 behind an exact age gate and a measured 2,539,834-byte entry. September 4 revalidation records 167 tests, Doctor 20/20 and a 2,540,918-byte entry, removes obsolete dependency exceptions, and dates historical physical/visual evidence rather than promoting it to the current build.
- Affected files/flows: project-control/final documentation and release decisions.
- Reproduction: compare prior text with current commands/artifacts.
- Required remediation: replace claims with dated command evidence and explicit failures/blockers; keep time-sensitive compatibility statements dated and never infer native/store results.
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

### AUD-038 — iOS VoiceOver did not reliably name inputs or announce dynamic state changes

- Severity: **high**
- Status: **resolved locally; physically verified for input naming/manual-invalid, async-result retest deferred**
- Evidence: on the 2026-08-26 iPhone run, the manual GTIN input announced its placeholder instead of its visible field label because `accessibilityLabelledBy` was insufficient on iOS. After adding explicit localized labels to every text input, VoiceOver announced `EAN- tai GTIN-koodi`, the text-field trait and the length hint. The visible `accessibilityRole="alert"` validation message was initially silent; its first explicit default/queued announcement was interrupted by button focus. A centralized high-priority iOS path then read the complete validation instruction automatically. A later known-product run rendered Nutella while VoiceOver stayed on `Hae tuote`; the result route now maps loading and every terminal lookup state to an explicit answer-first announcement. Resolved, ambiguous and unknown mapping tests plus repository-policy regressions cover the repaired boundaries.
- Affected files/flows: manual GTIN, lookup loading/completion/failure states, material-code input/result, manual component result, feedback draft, local-data deletion and any future dynamic status message.
- Reproduction: (1) with VoiceOver enabled, enter `123` in manual GTIN and submit; before repair, the field name came from `3017 6204 22003` and the visible error was not announced, then a default explicit announcement was cut off by the focused search button. (2) submit known GTIN `3017620422003`; before the async repair, Nutella rendered but VoiceOver continued to announce the prior search button.
- Required remediation: provide explicit localized `accessibilityLabel` on every React Native text input and explicitly announce iOS dynamic status/error changes. Queue loading at default priority; use high priority for terminal state changes so stale focus speech cannot suppress them. Retain visible alert/live-region semantics for other platforms and add every new dynamic screen to the regression policy.
- Execution boundary: source repair, regression tests and manual-invalid physical verification are complete locally. The owner chose to resume the async result and broader VoiceOver device matrix after functional and visual stabilization; those evidence rows remain part of AUD-026 and are not claimed as passed.

### AUD-039 — The EAS development profile did not contain a development-client runtime

- Severity: **high**
- Status: **resolved locally**
- Evidence: `eas.json` declared `developmentClient: true`, but the mobile package did not depend on `expo-dev-client`. After Metro was unavailable, the physical app displayed `No script URL provided` with a null script URL and could not select/reconnect to a development server. The SDK-compatible dependency is now locked; the September fresh ignored iOS prebuild/pod install contains dev-client 57.0.18, dev-launcher 57.0.19 and dev-menu 57.0.18. Xcode Debug `iphoneos` compilation passed, the app and all 11 embedded frameworks passed strict recursive signature verification, and the rebuilt client installed and launched. On September 7 it established Metro TCP and passed Home/manual/known-product runtime on the iPhone. A repository-policy test now requires profile/runtime parity.
- Affected files/flows: `apps/mobile/package.json`, `pnpm-lock.yaml`, `apps/mobile/eas.json`, development build startup and physical-device QA.
- Reproduction: build the prior `development` profile, stop or lose Metro, then relaunch; the binary has no development-client launcher and reports a null script URL.
- Required remediation: keep `expo-dev-client` aligned with the Expo SDK whenever any EAS profile requests a development client; rebuild native binaries after changing it and retain the policy regression.
- Execution boundary: locally executable; completed. This is development tooling evidence, not an iOS archive/TestFlight claim.

### AUD-040 — Sorting guidance was visually delayed and uncertainty evidence was not presentation-complete

- Severity: **high**
- Status: **resolved locally**
- Evidence: the previous Home spent primary viewport space on a decorative sorting mark and duplicate first-use/privacy treatment. The result route presented product/provider metadata before the actionable sorting answer. Ambiguous/unknown result rendering exposed internal enum-like reasons and did not consistently present the full rule-evidence set or an explicit no-verified-rule statement. The redesigned Finnish/English flow now puts scan/manual actions first, then puts component destinations, confidence, preparation and explanation before product metadata. Exhaustive typed maps localize every destination and unknown reason. Resolved, ambiguous and unknown presentations retain source, jurisdiction, checked date, rule version and verification, or explicitly state that no verified rule was applied. Browser QA covered Finnish/English phone widths, resolved/ambiguous/offline states and desktop overflow; the Finnish Home/manual/resolved subset rendered again on September 7 with the fresh Expo 57 physical-iPhone client. The known-product result retained uncertainty and Rinki provenance.
- Affected files/flows: mobile Home, scanner, manual/result flow, sorting result, result announcements, localization, theme tokens and test automation boundaries.
- Reproduction: compare the prior Home/result hierarchy and render an ambiguous component or a `missing_material` unknown result; the action/evidence was delayed and the raw reason could reach the user.
- Required remediation: use semantic presentation mappings, answer-first hierarchy, localized uncertainty copy, complete provenance and stable accessibility/test identifiers; regression-test every destination/reason and answer-first announcement branch.
- Execution boundary: locally executable source repair and current web/iPhone subset completed. Broad dark/largest-text/VoiceOver/reduced-motion/native-performance evidence remains AUD-026 rather than being overstated here.

### AUD-041 — High URI-normalization advisories reached the API dependency graph

- Severity: **high**
- Status: **resolved locally on 2026-09-04**
- Evidence: the independent September audit found eight high records: `GHSA-5jgf-p345-68v8`, `GHSA-f65p-4m7j-42xc`, `GHSA-fph4-wmhf-6fwf` and `GHSA-jqff-g426-hqxp`, each affecting `fast-uri@3.1.5` and `fast-uri@4.1.2`. Ajv/schema-resolution/serialization dependencies reached these versions. The advisories concern scheme-relative IDN host confusion, malformed IPv6 normalization, repeated hostname percent-decoding and percent-encoded scheme normalization. Existing parent ranges permit patched releases; the lockfile and frozen-installed graph now resolve only 3.1.7/4.1.4. Their September 2 publication dates satisfy the unchanged one-day release-age policy. A captured post-update raw audit has zero high/critical records, six moderate and one low. The final live policy command instead fails closed at its 60-second timeout while the npm audit endpoint is unresponsive; this is an external validation blocker, not a security-gate pass.
- Affected files/flows: `pnpm-lock.yaml`, API schema-resolution/serialization dependencies, `scripts/audit-policy.mjs`, `scripts/__tests__/dependency-policy.test.mjs` and dependency release gates.
- Reproduction: audit the pre-repair lockfile with `corepack pnpm audit --json` and run `corepack pnpm why fast-uri --recursive`; the two affected versions yield four high advisories each. After repair, repeat the graph/audit checks and run the dependency policy and API contract tests.
- Required remediation: retain compatible patched versions and regression-check the 3.1.6/4.1.3 security floors. Reject every high/critical advisory, including formerly accepted IDs; malformed, incomplete, failed or inconsistent registry reports must also fail closed. Do not force cross-major overrides or hide lower-severity findings.
- Execution boundary: locally executable dependency/policy repair completed without exclusions, overrides, direct dependency additions or an additional native-version change. Exact IDs, publication timestamps, parent ranges and reproduction commands are recorded in `docs/security/DEPENDENCY_RISK_ACCEPTANCE.md`.

### AUD-042 — Xcode 27 SDK build immediately crashes without UIScene

- Severity: **high**
- Status: **installed-app regression recovered by rollback; SDK adoption remains blocked on local migration**
- Evidence: fresh Xcode 27 beta 6 (`27A5252f`) compilation, recursive signatures and installation pass, but the physical process terminates with `EXC_BREAKPOINT`/`SIGTRAP` in `UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`. Current generated `AppDelegate.swift` creates a window during app launch and has no scene configuration. Apple requires scene adoption for apps linked against iOS 27. The restored Xcode 26.6 artifact passes the same phone's Home/manual/Nutella/provenance and terminate/relaunch flow.
- Affected files/flows: Expo-generated `apps/mobile/ios/KierrtysAppi/AppDelegate.swift`, generated Info.plist, future native prebuild configuration, cold start and development-client deep links when switching to iOS 27 SDK.
- Reproduction: use the sanitized beta build command in `XCODE_27_VALIDATION.md`, verify/install, then launch on iOS 27; the native process traps before connecting to Metro. A successful PID response must not be treated as runtime success.
- Required remediation: keep the restored, accepted Xcode 26.6 build for current testing; implement a reproducible scene-lifecycle migration covering launch URLs, continuing activities and background/foreground behavior, add regressions and verify the beta-built artifact physically before changing the application toolchain.
- Execution boundary: local iOS engineering/Codex; no credential, account or OS-upgrade dependency. Recovery is complete; migration is the concrete next work unit. Severity is retained and production remains NO-GO.

## Authoritative current requirements checked

The time-sensitive source set below was revalidated on 2026-08-28. The existing app rule version remains dated to its actual content review; source availability alone is not independent editorial/legal approval.

- Open Food Facts API usage, limits, identification and licences: <https://openfoodfacts.github.io/openfoodfacts-server/api/> and <https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/tutorials/license-be-on-the-legal-side/>
- Rinki nationwide packaging instructions: <https://rinkiin.fi/lajittelu-kotona/lajitteluohjeet/>
- Palpa deposit guidance: <https://www.palpa.fi/for-consumers/faq/>
- GS1 Finland GS1 Data transition/docs: <https://gs1.fi/en/support/gs1-data-implementation> and <https://gs1.fi/en/customersupport/synkka/documentation>
- Expo SDK 57 and local physical-development requirements: <https://docs.expo.dev/versions/latest/> and <https://docs.expo.dev/develop/development-builds/introduction/>
- Apple Xcode 26.6 compatibility, Personal-Team limits and upload requirement effective 2026-04-28: <https://developer.apple.com/xcode/system-requirements>, <https://developer.apple.com/help/account/basics/about-your-developer-account> and <https://developer.apple.com/news/upcoming-requirements/?id=02032026a>
- Google Play target API requirement effective 2026-08-31: <https://support.google.com/googleplay/android-developer/answer/11926878?hl=en-GB_ALL>
- Apple app privacy and Google Data Safety: <https://developer.apple.com/app-store/app-privacy-details/> and <https://support.google.com/googleplay/android-developer/answer/10787469?hl=en>
- Google Play preview assets: <https://support.google.com/googleplay/android-developer/answer/9866151?hl=en>
