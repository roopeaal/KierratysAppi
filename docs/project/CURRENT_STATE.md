# Current state

Last updated: 2026-08-26 after partial VoiceOver testing, accessibility repair and Expo 57.0.16 native rebuild.

## Verified implementation

- Expo SDK 57 Finnish/English app with pre-permission explanation, EAN-8/EAN-13/UPC-A scanner configuration, manual GTIN, distinct invalid/not-found/provider/offline states, component guidance, local material-code parsing, optional bounded history, local feedback drafts and delete-all-local-data.
- Fastify POST lookup API with strict validation/body limits/CORS, generic client errors, sanitized 4xx logs, response no-store, per-route rate limiting, OpenAPI and health.
- OFF v3.6 adapter with fixed HTTPS origin/manual redirects, response-byte/timeout limits, GTIN response binding, conservative exact taxonomy mapping, 12/minute per-process guard and ODbL/DbCL/CC BY-SA provenance.
- Bounded resolution cache (5,000 default), conservative fallback, and effective-dated Rinki/Palpa sorting rules that preserve unknown/ambiguous states.
- PostgreSQL 26-table migration with checksum/material invariants, RLS on sensitive tables, immutable published rule versions and idempotent seed; currently exercised only through PGlite tests, not runtime production persistence.
- Exact CI action SHAs, Node 24.19.0, pnpm 11.16.0, frozen lockfile, secret/dependency gates, feature-gated CodeQL, EAS profiles and deterministic source assets.

## Current validation truth

- `pnpm install --frozen-lockfile`: pass.
- `pnpm validate`: pass; 133 application tests across 20 Vitest files plus five Node repository-policy regressions (138 automated tests total), all type/lint/format checks, package/API builds and 12-route web export.
- `pnpm test:coverage`: pass; core domain/provider/engine/application/API packages have approximately 90%+ statement coverage, while tested mobile modules are 62.02% and do not cover native UI behavior.
- `pnpm security:audit`: pass under an explicit policy that temporarily accepts two high Metro `image-size` build-tool advisories until 2026-09-10 because the declared patched version is unpublished.
- Expo Doctor 1.20.1: **20/20**. `expo install --check` passes after the four 2026-08-24 SDK-supported patches exceeded the explicit strict 1,440-minute release-age gate; `pnpm dedupe` removed the stale nested constants version and peer-dependency checking is clean. Current direct versions include Expo 57.0.16, constants 57.0.14, router 57.0.16 and splash 57.0.8.
- API production smoke: pass locally; health/OpenAPI/strict validation verified. No deployed production service exists.
- Web entry: 2,529,592 bytes uncompressed / 572,284 bytes gzip, above the 2 MiB warning budget.
- Clean Android prebuild configuration inspection passes the intended permission/privacy source configuration; no Android binary was compiled.
- Live browser/manual/API→OFF lookup and mobile/desktop visual inspection passed. This is not physical-camera/native evidence.
- Xcode 26.6 with the iOS 26.5 SDK is installed. A Debug `iphoneos` build passed on 2026-08-26 after Expo 57.0.16 and refreshed pods; all 11 embedded frameworks and the app passed strict recursive code-sign verification, and `devicectl` installed/launched it on the paired iPhone 12 Pro Max running iOS 26.1. Metro bundled 1,805 modules and the owner confirmed the normal home screen with VoiceOver enabled. The system `xcode-select` still points to Command Line Tools, so native commands explicitly set `DEVELOPER_DIR`.
- Partial physical iOS validation now passes interactive home launch, background/foreground, force-quit relaunch, barcode-specific pre-permission copy, camera allow/revoke/settings recovery, one real EAN-13 `not_found` flow, known OFF resolution, offline/no-request behavior, restored retry/cache hit, invalid-manual local rejection, visible/openable product/licence/rule provenance and a partial VoiceOver home/scanner/manual-invalid path. Physical VoiceOver found and verified fixes for iOS text-input naming and an interrupted/silent validation alert; all text inputs now have explicit localized labels and current dynamic status screens have explicit iOS announcements. Remaining VoiceOver flows, largest text, dark/reduced-motion, broader barcode conditions and performance/battery remain unrun.
- The free Personal-Team artifact expired after seven days as expected. The owner re-added the Apple account, a new profile/build was installed on 2026-08-22, the renewed developer profile was trusted, and launch recovered. This development artifact is not archive/TestFlight/release evidence.
- This work unit began from clean local `main`/`7e77d0a`, five audited commits ahead of `origin/main`/`87404a0`. Its accessibility, dependency, validation and physical-evidence changes are intended for one local commit; no push occurred because authorization is absent.

## Release state

**NO-GO.** See `docs/final/PRODUCTION_AUDIT.md`, `RELEASE_GO_NO_GO.md`, `OWNER_ACTIONS.md` and `TEST_EVIDENCE.md`.

Open blockers include signed Android and iOS release/TestFlight builds, the remaining physical camera/accessibility/performance matrix, production API/database/monitoring and restore drill, OFF owner account/licence approval, GS1 Data contract decision, independent Finnish content approval, privacy/terms/GDPR approval, hosted support/privacy URLs, final store assets/forms/console validation and two unpatched high build-tool advisories.

No production deployment, paid build, contract acceptance, submission, push or public publication occurred. Owner-controlled Apple account and free Personal-Team signing were used only for the local development device run. See `docs/final/PHYSICAL_IOS_VALIDATION.md` for exact passed and pending rows.
