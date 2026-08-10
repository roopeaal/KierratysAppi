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

- [x] Add bounded cache, opt-in local history, local correction drafts, localization, no-op privacy-safe observability boundary, offline behavior, and database moderation boundary.
- [x] Complete unit, contract, integration, migration and mobile-state tests.
- [!] Wire production PostgreSQL repositories and authenticated moderation API after hosting/auth/operations providers are selected.

## Phase 4 — Camera intelligence

- [x] Implement deterministic, local EU packaging material-code parsing with explicit user confirmation and safe unknown/ambiguous states.
- [!] Implement consented recycling-label photo capture and on-device OCR after device evidence and the privacy/product workflow are approved.
- [ ] Add a provider-neutral AI boundary only if evaluation shows a justified need.

## Phase 5 — Polish

- [x] Complete dark palette, restrained native navigation, haptics, original assets, performance budgets, and multi-viewport web visual QA.
- [!] Complete native dark/large-text/accessibility/performance evidence on physical devices.

## Phase 6 — Release engineering

- [x] Complete CI, EAS configuration, store assets/metadata drafts, legal drafts, and release procedures.
- [!] Generate signed Android/iOS production artifacts and submit without owner accounts, terms acceptance, credentials, and approval.

## Phase 7 — Release audit

- [x] Run locally available security, privacy, web accessibility, data-licence, content, dependency and recovery-plan audits.
- [!] Complete physical accessibility/performance, production backup restore, licence/legal, signed-binary and store audits with owner/external evidence.
