# Roadmap

Status markers: `[ ]` pending, `[~]` active, `[x]` complete, `[!]` externally blocked.

## Phase 0 — Discovery

- [x] Inspect repository and local environment.
- [x] Create persistent project-control files.
- [x] Research official technical, data, Finnish guidance, privacy/legal, and competitor sources.
- [x] Complete capability and trust matrix.

## Phase 1 — Product and design foundation

- [x] Finalize requirements and acceptance criteria for the P0 vertical slice.
- [x] Record architecture, data model, threat model, provider contracts, and sorting-engine specification.
- [x] Compare three design directions and establish tokens.

## Phase 2 — Vertical slice

- [x] Implement Expo mobile camera explanation, permission, GTIN scan/manual entry, and result states.
- [x] Implement application API, Open Food Facts adapter, normalized domain model, and sorting engine.
- [x] Display component/source/confidence and safe unknown/missing/ambiguous states.
- [!] Verify camera behavior on a physical Android device.

## Phase 3 — Production core

- [x] Add bounded cache, opt-in local history, local correction drafts, localization, privacy-safe aggregate observability boundary, offline behavior, and database moderation boundary.
- [x] Complete unit, contract, integration, migration and mobile-state tests.
- [!] Deploy the API and wire production PostgreSQL repositories only after hosting/auth/operations providers, privacy region, shared rate limits and recovery design are approved.

## Phase 4 — Camera intelligence

- [x] Implement deterministic, local EU packaging material-code parsing with explicit user confirmation and safe unknown/ambiguous states.
- [!] Implement consented recycling-label photo capture and on-device OCR after device evidence and the privacy/product workflow are approved.
- [ ] Add a provider-neutral AI boundary only if evaluation shows a justified need.

## Phase 5 — Polish

- [x] Apply the owner's KeepItGreen display-name change across native configuration, FI/EN UI/privacy copy and current store drafts; preserve technical installation/storage identity. 185-test full validation and scoped browser name checks pass.
- [ ] Rebuild/install the renamed Xcode 26.6 client and verify launcher naming, profile expiry and wireless runtime; a source rename does not update an already installed binary.
- [x] Implement the owner's September visual-refresh work unit: current reference study, neutral/forest tokens, original linework, concise Home, form focus, lighter result/guide composition, explicit web radio state, 181-test validation and scoped multi-width FI/EN/error/ambiguous browser evidence.
- [~] Accept this refreshed UI on the physical iPhone, including dark mode/largest Dynamic Type and camera/torch. The September 8 automation reopen timed out; prior phone screenshots are not evidence for the new visual design. See `docs/final/design-refresh-evidence.md`.

- [~] The answer-first Home/result redesign, semantic token layer, scanner torch control, localized safe uncertainty, stable automation identifiers and FI/EN multi-viewport browser QA pass. Dark/native-large-text visual evidence and the web distribution/2.55 MB entry-bundle decision remain open.
- [~] Physical iPhone QA now includes 2026-09-07 screenshots and semantic inspection of the current Expo 57 client's redesigned Finnish Home, manual entry and answer-first known-product result with unknown/partial confidence and rule provenance. Historical scanner controls and partial VoiceOver home/scanner/manual-invalid coverage pass; async-result VoiceOver, dark/largest-text/reduced-motion, valid performance/battery measurements and broader camera conditions remain open.

## Phase 6 — Release engineering

- [x] Evaluate Xcode 27 beta on the physical iOS 27 phone: compile/sign/install passed, runtime failed on mandatory UIScene adoption; restore and verify the working Xcode 26.6 artifact. Record the failed result rather than accepting the new SDK.
- [ ] Migrate generated native startup to UIScene with reproducible prebuild, deep-link/lifecycle regression coverage and physical Xcode 27 startup/relaunch validation before changing the build toolchain.

- [~] Source CI/EAS configuration, development-client dependency policy, icon assets, metadata/legal drafts and release procedures exist. The unchanged Expo set has the recorded Doctor 20/20 pass and now passes 181-test validation; fresh Debug native compile/sign/install passes, and the 2026-09-07 physical Home/manual/known-product smoke passes after refreshing the development API origin. The live registry audit endpoint still times out; native release and store gates remain.
- [!] Produce signed-binary localized screenshots, Google feature graphic, hosted URLs and final store questionnaires.
- [!] Generate signed Android/iOS production artifacts and submit without owner accounts, terms acceptance, credentials, and approval.

## Phase 7 — Release audit

- [x] Run an adversarial 30-lane local production audit and repair every locally executable blocker/high finding discovered.
- [~] Execute `docs/final/PHYSICAL_IOS_VALIDATION.md`; the 2026-09-04 rebuilt/signed/installed client now passes current Home/manual/known-product runtime on 2026-09-07, while historical evidence covers core lifecycle, permission, EAN-13, offline/retry/cache, controlled backend-unavailable recovery, scanner controls and a repaired partial VoiceOver path. Broader accessibility, camera conditions and performance remain.
- [!] Close the NO-GO gates in `docs/final/OWNER_ACTIONS.md`: physical accessibility/performance/camera, production backup/restore/monitoring, licence/legal/content, signed binaries and stores.
