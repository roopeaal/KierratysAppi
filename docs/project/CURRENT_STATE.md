# Current state

Last updated: 2026-08-10

## Completed

- Read the complete master build directive.
- Confirmed the linked private GitHub repository is empty and has no default branch.
- Initialized a local `main` branch and configured `origin`.
- Recorded the initial environment and durable repository rules.
- Completed an authoritative research pass for Expo/React Native, backend choices, Open Food Facts, GS1, Rinki, Palpa, Kierrätys.info, privacy, accessibility, store declarations, and environmental claims.
- Recorded the data-source/licence matrix, competitor gap analysis, user hypotheses, selected architecture, provider/sorting contracts, data model, and three compared visual directions.
- Selected the Material Ledger design system and safe nationwide Finnish seed-rule scope.
- Implemented the pnpm monorepo, strict shared domain schemas, GTIN validation, confidence model, Finnish sorting engine, localization, Open Food Facts v3.6 adapter, GS1-labelled synthetic adapter, resolution/cache service, and Fastify API.
- Implemented and executed the 26-table PostgreSQL migration with row security and immutable published rule versions.
- Implemented the Expo SDK 57 mobile vertical slice: contextual camera permission, scanner, duplicate suppression, manual entry, loading/result/error/offline states, manual component confirmation, opt-in local history, local correction drafts, legal placeholders, dark palette, and Finnish/English UI.
- Added deterministic brand/store assets, EAS profiles, CI, feature-gated CodeQL, dependency review, Dependabot, secret scanning, and time-bounded dependency-audit policy.
- Verified a live end-to-end Nutella lookup through the backend/Open Food Facts and inspected rendered screens at 360×640, 390×844, and 412×915 with no browser console errors.
- Published the coherent product foundation to the private GitHub repository and confirmed `main` as its default branch.

## Locally achievable definition of done

- Complete. The clean validation suite, dependency/security audit, peer-dependency check, Expo compatibility check, Expo Doctor, API production smoke test, and multi-viewport browser QA all pass.
- The initial remote validation exposed one Gitleaks false positive caused by threat-model prose; the wording is corrected without weakening or allowlisting the credential-scanning rule. No deployment, paid build, signed artifact, or public release has been triggered.

## Not yet verified

- Android/iOS native compilation, physical-device camera quality, large-text OS screenshots, screen-reader passes on device, signed EAS builds, production infrastructure, and store submission.

## Known constraints

- Android SDK/ADB, Java, Docker, full Xcode, Expo/EAS credentials, and store signing identities are not available in this environment.
- Open Food Facts licence/attribution still requires owner/legal review before publication; GS1 and commercial Kierrätys.info use require external written terms/access.
- GitHub Code Security is not enabled for this private repository. CodeQL remains disabled unless the owner approves any required plan/security entitlement, enables the repository feature, and sets `CODEQL_ENABLED=true`.
