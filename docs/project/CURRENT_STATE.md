# Current state

Last updated: 2026-08-10 after the physical-iOS preflight.

## Verified implementation

- Expo SDK 57 Finnish/English app with pre-permission explanation, EAN-8/EAN-13/UPC-A scanner configuration, manual GTIN, distinct invalid/not-found/provider/offline states, component guidance, local material-code parsing, optional bounded history, local feedback drafts and delete-all-local-data.
- Fastify POST lookup API with strict validation/body limits/CORS, generic client errors, sanitized 4xx logs, response no-store, per-route rate limiting, OpenAPI and health.
- OFF v3.6 adapter with fixed HTTPS origin/manual redirects, response-byte/timeout limits, GTIN response binding, conservative exact taxonomy mapping, 12/minute per-process guard and ODbL/DbCL/CC BY-SA provenance.
- Bounded resolution cache (5,000 default), conservative fallback, and effective-dated Rinki/Palpa sorting rules that preserve unknown/ambiguous states.
- PostgreSQL 26-table migration with checksum/material invariants, RLS on sensitive tables, immutable published rule versions and idempotent seed; currently exercised only through PGlite tests, not runtime production persistence.
- Exact CI action SHAs, Node 24.19.0, pnpm 11.16.0, frozen lockfile, secret/dependency gates, feature-gated CodeQL, EAS profiles and deterministic source assets.

## Current validation truth

- `pnpm install --frozen-lockfile`: pass.
- `pnpm validate`: pass; 133 tests across 20 files, all type/lint/format checks, package/API builds and 12-route web export.
- `pnpm test:coverage`: pass; core domain/provider/engine/application/API packages have approximately 90%+ statement coverage, while tested mobile modules are 62.02% and do not cover native UI behavior.
- `pnpm security:audit`: pass under an explicit policy that temporarily accepts two high Metro `image-size` build-tool advisories until 2026-09-10 because the declared patched version is unpublished.
- Expo Doctor 1.20.1: **19/20, not green**. Four patches released hours before the audit are deliberately not installed until the minimum-release-age gate passes. `expo install --check` fails for the same versions.
- API production smoke: pass locally; health/OpenAPI/strict validation verified. No deployed production service exists.
- Web entry: 2,525,687 bytes uncompressed / 572,183 bytes gzip, above the 2 MiB warning budget.
- Clean iOS/Android prebuild configuration inspection passes the intended permission/privacy source configuration; no native binary was compiled.
- Live browser/manual/API→OFF lookup and mobile/desktop visual inspection passed. This is not physical-camera/native evidence.
- Physical-iOS preflight independently confirmed that the Apple M1 host runs macOS 26.5.2 and is compatible with Xcode 26.6, but only Command Line Tools are installed. A fresh generated iOS project has deployment target 16.4, bundle ID `fi.roopeaaltonen.kierratysappi`, localized Finnish/English camera purpose strings, no microphone/location purpose string, empty entitlements, the expected privacy manifest, and generated icon/splash assets. No binary was compiled or installed.
- The selected first device path is a local Xcode 26.6 development build through `expo run:ios --device`, using a free Apple Personal Team if necessary. This avoids paid EAS/Apple membership for local testing; Personal-Team provisioning expires after seven days.
- Git remained clean at preflight start. Local `main`/`d41d248` is two audited commits ahead of `origin/main`/`87404a0`; no push occurred because prior authorization is absent.

## Release state

**NO-GO.** See `docs/final/PRODUCTION_AUDIT.md`, `RELEASE_GO_NO_GO.md`, `OWNER_ACTIONS.md` and `TEST_EVIDENCE.md`.

Open blockers include full Xcode installation and physical iPhone pairing before the local iOS run, signed Android/iOS release builds, physical camera/accessibility/performance testing, production API/database/monitoring and restore drill, OFF owner account/licence approval, GS1 Data contract decision, independent Finnish content approval, privacy/terms/GDPR approval, hosted support/privacy URLs, final store assets/forms/console validation, two unpatched high build-tool advisories and the time-gated Expo compatibility patches.

No production deployment, paid build, account action, contract acceptance, signing, submission, push or public publication occurred. See `docs/final/PHYSICAL_IOS_VALIDATION.md` for the pending physical matrix.
