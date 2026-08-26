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

- [~] Complete dark palette, restrained navigation, haptics, original source assets and multi-viewport web visual QA; optimize or de-scope the web bundle after the distribution decision.
- [~] Complete native dark/large-text/accessibility/performance evidence on physical iPhone: the latest Expo 57.0.16 development build/install passes, partial VoiceOver home/scanner/manual-invalid coverage passes after repairing text-field naming and dynamic announcements, and remaining VoiceOver/largest-text/dark/reduced-motion/performance/battery rows remain.

## Phase 6 — Release engineering

- [~] Complete source CI/EAS configuration, icon assets, metadata/legal drafts and release procedures; Expo compatibility now passes behind strict release-age enforcement, while native release and store gates remain.
- [!] Produce signed-binary localized screenshots, Google feature graphic, hosted URLs and final store questionnaires.
- [!] Generate signed Android/iOS production artifacts and submit without owner accounts, terms acceptance, credentials, and approval.

## Phase 7 — Release audit

- [x] Run an adversarial 30-lane local production audit and repair every locally executable blocker/high finding discovered.
- [~] Execute `docs/final/PHYSICAL_IOS_VALIDATION.md`; the local Xcode 26.6/Personal-Team build passes core lifecycle, permission, EAN-13, OFF, offline/retry/cache, provenance and a repaired partial VoiceOver path, while the broader matrix remains open.
- [!] Close the NO-GO gates in `docs/final/OWNER_ACTIONS.md`: physical accessibility/performance/camera, production backup/restore/monitoring, licence/legal/content, signed binaries and stores.
