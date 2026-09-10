# Owner actions

These are the exact owner-controlled release actions and recurring engineering gates required to move the NO-GO decision. Latest dependency/startup review: 2026-09-07. “Owner” names an accountable role; the product owner must assign a real person before execution.

## OA-01 — Production infrastructure

- Owner: **Backend/SRE owner**; approver: **Product owner + privacy lead**
- Procedure:
  1. Select EU-region API/PostgreSQL/monitoring providers and approve recurring cost, subprocessors and regions.
  2. Create development/preview/production isolation, least-privilege identities and secret storage.
  3. Deploy the immutable API artifact behind HTTPS with a documented trusted proxy/edge and shared per-client/provider quota enforcement.
  4. Configure `OFF_USER_AGENT` with a monitored owner mailbox, exact CORS origins and no request-body/GTIN logs.
  5. Run health/OpenAPI/lookup/outage/load tests; record p50/p95/p99/error/quota evidence.
  6. Inject the resulting origin as `EXPO_PUBLIC_API_BASE_URL` in EAS preview/production.
- Success evidence: deployment/artifact ID, domains/regions, config inventory without secrets, test report, dashboards and cost/privacy approval.

## OA-02 — Database migration and recovery

- Owner: **Database/SRE owner**
- Procedure:
  1. Add/approve a forward-only migration ledger and least-privileged migration/runtime roles.
  2. Apply the migration to an empty staging PostgreSQL instance; seed and reconcile counts/checksums.
  3. Configure encrypted backups and point-in-time recovery in the approved region.
  4. Restore to an isolated instance, reconcile table/row/checksum evidence and measure recovery time.
  5. Approve RPO/RTO and schedule quarterly restore drills.
- Success evidence: migration log, role test, backup policy, restore report, reconciliation and named RPO/RTO approval.

## OA-03 — Open Food Facts production use

- Owner: **Data partnerships owner**; approver: **Legal counsel**
- Procedure:
  1. Create/confirm the required OFF account and submit the API usage form if requested by current OFF instructions.
  2. Create a monitored production contact mailbox and escalation owner.
  3. Review ODbL 1.0 database, DbCL contents, CC BY-SA images, attribution, caching and share-alike boundaries against the product/database design.
  4. Approve the exact in-app/store/privacy language and retain a dated licence memo.
- Success evidence: account/form confirmation, monitored-mailbox test, approved legal memo and attribution screenshot.

## OA-04 — Finnish sorting content

- Owner: **Finnish sorting-content owner**; approver: **Legal counsel**
- Procedure:
  1. Independently review every rule branch, exception, preparation sentence, source URL, checked/effective date and Finnish/English translation against current Rinki/Palpa material.
  2. Decide and document text/database reuse rights.
  3. Sign rule version `fi-rinki-2026-08-10.1` / Palpa counterpart or publish a corrected replacement; never edit a published version.
  4. Establish quarterly/source-change review and an emergency withdrawal contact/procedure.
- Success evidence: signed rule matrix, legal note, named review calendar and completed content incident drill.

## OA-05 — GS1 Data decision

- Owner: **Data partnerships owner**; approver: **Product owner + legal counsel**
- Procedure:
  1. Ask GS1 Finland for current GS1 Data/Synkka transition documentation, receiver eligibility, API scope, pricing and credentials.
  2. Obtain written terms for fields, territories, display, caching, derived data, redistribution/export, correction, audit and termination purge.
  3. If approved, authorize implementation of `docs/final/GS1_INTEGRATION_PLAN.md`; otherwise formally exclude GS1 from launch claims.
- Success evidence: signed terms/decision, credential scope (not the secret), approved mapping and completed contract/fallback/termination tests.

## OA-06 — Privacy, GDPR and legal publication

- Owner: **Controller/privacy lead**; approver: **Finnish legal counsel**
- Procedure:
  1. Name the controller and privacy/security contacts.
  2. Map final binary/API/provider/hosting/monitoring data flows and decide lawful bases, processors/transfers, retention, backup deletion and security measures.
  3. Define access/export/deletion/objection/complaint/request-verification procedures and response ownership; document why any right is inapplicable.
  4. Approve Finnish/English privacy notice and terms and host stable public privacy/support/user-choice URLs.
  5. Reconcile Apple privacy details and Google Data Safety against final signed binaries/SDK inventory.
- Success evidence: signed documents, live URLs, processor/retention/rights tables, completed request drill and exported store-form answers.

## OA-07 — Monitoring and incident readiness

- Owner: **SRE/security owner**; approver: **Privacy lead**
- Procedure:
  1. Choose a privacy-compatible monitoring/alerting service and approve retention/access.
  2. Connect only aggregate status/provider/cache-hit/duration data; prohibit raw GTIN, product, photo, free text and location.
  3. Configure availability, latency, 5xx, provider-unavailable and quota alerts plus dashboards/SLOs.
  4. Name primary/backup on-call, privacy/legal, sorting, hosting, OFF/GS1 and store contacts.
  5. Trigger a test alert and run one sorting-error and one data/security tabletop.
- Success evidence: redacted config, dashboards, alert delivery, contact roster and drill reports.

## OA-08 — Android signed build and device acceptance

- Owner: **Android release engineer**; approver: **Product owner**
- Procedure:
  1. After Expo Doctor is 20/20, build an API-36-compatible signed internal AAB/APK with owner-controlled credentials.
  2. Inspect the final merged manifest/SBOM: camera/internet/vibrate only as justified; no audio/storage; backup behavior matches policy.
  3. Install on small/current/tablet devices and execute every Android item in `docs/quality/MANUAL_TEST_CHECKLIST.md` using EAN-8/EAN-13/UPC-A physical labels.
  4. Record TalkBack, largest text, reduced motion, dark mode, offline/outage, performance/memory/battery and upgrade behavior.
  5. Upload to Play internal testing and retain pre-launch/console validation output.
- Success evidence: artifact hash/build ID, signing provenance, manifest/SBOM, device matrix and Play validation.

## OA-09 — iOS signed build and device acceptance

- Owner: **iOS release engineer**; approver: **Product owner**
- September 8 toolchain restriction: compile the current app with explicit Xcode 26.6 `DEVELOPER_DIR`. Xcode 27's SDK-linked app crashes on missing UIScene adoption despite successful compilation/signing/installation. The Xcode 26.6 artifact has been restored and retested. **iOS engineer/Codex** owns the local prebuild/lifecycle migration and startup/deep-link/relaunch regression evidence before switching SDKs; no new account, payment or macOS upgrade is needed. Detailed procedure: `XCODE_27_VALIDATION.md`.
- Current evidence: development startup steps 1–2 are complete for the current dependency set. September 4's fresh Personal-Team Debug build, strict recursive signature verification (all 11 embedded frameworks), physical install and native development-client launch pass. On September 7, current LAN/API/Metro health passed, the phone established Metro TCP connectivity, and Home, manual entry and a known-product result with uncertainty plus Rinki provenance rendered on the physical iPhone. The first product lookup correctly rendered offline because the running Metro bundle still contained the previous API LAN address; restarting Metro with the current `EXPO_PUBLIC_API_BASE_URL` restored lookup. The profile expires 2026-09-11 07:01:05 UTC. Historical iPhone evidence covers broader core flows; the remaining device matrix and every release step stay open.
- Procedure:
  1. **Completed for development:** Xcode 26.6 and the iOS 26.5 SDK are installed; the host is now macOS Tahoe 26.7.
  2. **Completed for current development startup:** the device owner kept the iPhone and Mac on a reachable network; the iOS engineer verified LAN/API/Metro health, phone-to-Metro TCP, Home, manual entry and a known-product result after restarting Metro with the current API LAN address. For future runs, print and verify both current LAN origins before launching, and renew/reinstall before profile expiry when needed.
  3. After Expo Doctor is 20/20, archive with owner-controlled paid-program credentials and the supported iOS SDK.
  4. Inspect final entitlements, privacy manifest/reasons and localized Info.plist strings; verify no microphone or unused location declaration.
  5. Install on current/small iPhone and supported iPad; run physical barcode, VoiceOver, largest text, reduced motion, dark mode, offline/outage, performance/memory/battery and upgrade checks.
  6. Upload to TestFlight and retain App Store processing/privacy warnings.
- September 10 visual acceptance, separate from release: **Codex** owns recovery of the existing XCTest session, verification of the current LAN API/Metro origins and screenshots of the refreshed Home → manual → known-product flow in FI/EN, light/dark and largest Dynamic Type. **Roope** opens the app and leaves the phone unlocked if requested, and supplies owner-controlled trust/signing approval only if actually required. Use the restored Xcode 26.6 client; verify its profile date before installing anything. Record pass/fail rows and repair defects in `design-refresh-evidence.md`; do not substitute older screenshots. The September 8 attempt timed out at runner startup, so it is not a pass.
- Success evidence: archive/TestFlight build IDs and hashes, inspection output, device matrix and processing report.

## OA-10 — Store package and submission readiness

- Owner: **Store/release owner**; approvers: **Product, brand, privacy and legal owners**
- Procedure:
  1. Capture real Finnish/English phone and tablet screenshots from the accepted signed builds; no simulated camera/product claims.
  2. Produce Google Play's 1024×500 JPEG/24-bit PNG feature graphic and validate icon/monochrome assets in console tooling.
  3. Verify the owner-selected KeepItGreen name's availability in both store consoles and obtain documented brand/legal rights approval; then finalize descriptions, category/keywords, support/privacy URLs, reviewer notes, content/age rating, encryption/export, DSA/trader and data-deletion answers. The source rename is not name reservation or rights clearance.
  4. Complete Apple privacy and Google Data Safety from the final SDK/runtime data flow.
  5. Obtain written final approval, configure staged rollout/rollback/support monitoring, and stop before publication unless separately authorized.
- Success evidence: console exports/screenshots, asset inventory, approvals and staged rollout plan.

## OA-11 — Supply-chain gates

- Owner: **Dependency/security owner**
- Current evidence: on 2026-09-04, the August age gate is no longer an obstacle. Expo 57.0.19, constants 57.0.17, dev-client 57.0.18, font 57.0.3, haptics 57.0.2, linking 57.0.9, router 57.0.18, system-ui 57.0.3 and React Native 0.86.3 pass frozen install, peer check, Expo install check and Doctor 1.20.1 20/20 without exclusions. The obsolete Metro `image-size` path and its two exceptions are removed; newly found `fast-uri` highs are addressed by 3.1.7/4.1.4 and policy regressions.
- External validation blocker: the captured post-update raw audit has zero high/critical records, but the final live `security:audit` fails closed after 60 seconds because the npm audit endpoint is unresponsive. The dependency/security owner must rerun the project-pinned `corepack pnpm security:audit` when the endpoint recovers, retain the complete result and resolve every returned high/critical finding; ordinary registry GET success or the older snapshot does not satisfy this live gate.
- Procedure:
  1. Preserve the strict 1,440-minute release-age rule for every future direct/transitive update. Do not add `minimumReleaseAgeExclude`, `expo.install.exclude` or any diagnostic bypass.
  2. Install the complete SDK-compatible patch set identified by a fresh `expo install --check`; preserve an SDK-compatible `expo-dev-client` dependency and record exact resolved versions/publication-age evidence.
  3. Require `corepack pnpm install --frozen-lockfile`, `corepack pnpm peers check`, `expo install --check`, Expo Doctor 1.20.1 20/20, `corepack pnpm validate`, security audit and coverage. Re-prebuild pods, rebuild/sign/install the iOS development client and repeat Home/manual/result startup smoke because native versions changed.
  4. Run the high/critical-fail audit policy after every lockfile change and monitor lower-severity advisories. The previous `image-size` exceptions are closed and must not silently return.
  5. Retain regression checks for strict release age, patched `fast-uri` floors and failure on every high/critical advisory, including the formerly excepted advisory IDs.
  6. Push the audit commit only when authorized and require remote CI/Security success.
- Success evidence: dependency diff, lockfile, green command/remote logs, advisory closure or signed re-review.

## OA-12 — GitHub controls

- Owner: **Repository owner**
- Procedure:
  1. Decide whether to purchase GitHub Pro/Code Security for this private repository.
  2. If approved, enable branch protection requiring PRs and CI/Security, enable Code Security and set `CODEQL_ENABLED=true`.
  3. Keep the repository private; do not publish it merely to unlock controls.
- Success evidence: settings export/API response and a test PR showing required checks.
