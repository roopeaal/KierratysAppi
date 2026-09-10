# Acceptance criteria

## Core vertical slice

1. The user sees why the camera is useful before the OS prompt and can continue with manual entry.
2. A supported barcode is normalized and validated; malformed values never reach a provider.
3. Mobile calls the application API/service rather than Open Food Facts directly.
4. Provider payloads are runtime-validated and normalized with field-level provenance.
5. The sorting engine selects only matching, effective rules and explains the match.
6. Every component result shows destination, preparation, source, checked date, verification, and confidence in text—not color alone.
7. Missing product, missing packaging, ambiguity, offline mode, permission denial, timeout, and provider failure produce distinct recoverable states without fabricated advice.
8. Finnish and English strings render through localization keys; large text and screen-reader labels remain usable.
9. Domain, provider-contract, API-integration, and mobile-state tests pass.

## Material-code flow

1. The user enters one bounded visible packaging code; no image is captured or uploaded.
2. A recognized code shows canonical code, material name, jurisdiction, decision version, source, and checked date before guidance.
3. Sorting begins only after the user explicitly confirms that the recognized code appears on the package.
4. Conflicting, multiple, unknown, and undefined codes never produce guessed guidance; composites without a reviewed rule remain safe unknowns.
5. Recognition provenance and confidence remain distinct from user-confirmed observation and the Finnish sorting-rule provenance.

## Release evidence

The owner-selected display name is KeepItGreen in FI/EN visual and accessible UI, default/native locale configuration and current store drafts. The existing technical app identity and local data must survive the update. Source/browser checks do not establish installed launcher naming, renewed signing or cable-disconnected runtime; these need a rebuilt native artifact and device evidence.

The September visual refresh additionally requires scan/manual actions before secondary content, truthful empty-history status, native and web selected-radio semantics, and retention of every component's uncertainty and source evidence. Browser screenshots and source-policy/contrast checks do not satisfy the separate physical dark-mode, largest-text, camera or screen-reader acceptance below. Current results are recorded in `docs/final/design-refresh-evidence.md`.

- `pnpm validate` succeeds from a clean install.
- CI configuration mirrors local validation.
- Expo Doctor and `expo install --check` pass without exclusions or release-age-policy bypasses.
- Signed Android/iOS builds pass the physical camera, accessibility, large-text, reduced-motion, dark-mode, performance, battery and upgrade matrix.
- Production HTTPS API, shared quota controls, PostgreSQL migration/backup/restore, monitoring/alerts and incident contacts have operational evidence.
- Privacy/terms, OFF licensing/account use and Rinki/Palpa rule content have named approvals; store materials/forms are complete and validated.
- Physical-device, signed-build, store, and legal-owner gaps are explicitly blocked rather than claimed complete.
