# Current state

Last updated: 2026-08-28 after the answer-first mobile UI work unit, development-client repair, browser QA and physical iPhone verification.

## Verified implementation

- Expo SDK 57 Finnish/English app with pre-permission explanation, EAN-8/EAN-13/UPC-A scanner configuration, manual GTIN, distinct invalid/not-found/provider/offline states, component guidance, local material-code parsing, optional bounded history, local feedback drafts and delete-all-local-data.
- The mobile UI now uses centralized semantic colors, typography, controls and interaction tokens. Home places scan/manual actions before supporting content; results place component sorting destinations before product metadata; scanner exposes a localized torch control; internal destination/reason enums no longer reach users.
- Every resolved, ambiguous and unknown sorting presentation retains textual confidence, explanation/recovery, and either full rule source/jurisdiction/checked-date/version/verification evidence or an explicit statement that no verified rule was applied.
- Critical Home, scanner, manual and result controls expose stable `testID` values. Internal navigation/close actions now have button semantics, external sources remain links, and operating-system font scaling is not capped.
- Fastify POST lookup API with strict validation/body limits/CORS, generic client errors, sanitized 4xx logs, response no-store, per-route rate limiting, OpenAPI and health.
- OFF v3.6 adapter with fixed HTTPS origin/manual redirects, response-byte/timeout limits, GTIN response binding, conservative exact taxonomy mapping, 12/minute per-process guard and ODbL/DbCL/CC BY-SA provenance.
- Bounded resolution cache (5,000 default), conservative fallback, and effective-dated Rinki/Palpa sorting rules that preserve unknown/ambiguous states.
- PostgreSQL 26-table migration with checksum/material invariants, RLS on sensitive tables, immutable published rule versions and idempotent seed; currently exercised only through PGlite tests, not runtime production persistence.
- Exact CI action SHAs, Node 24.19.0, pnpm 11.16.0, frozen lockfile, strict one-day dependency-release age, secret/dependency gates, feature-gated CodeQL, EAS profiles and deterministic source assets.

## Current validation truth

- `corepack pnpm install --frozen-lockfile`: pass against the pnpm 11.16.0 project pin. The interactive host also has pnpm 11.19.0; release evidence uses the project-pinned invocation.
- `corepack pnpm validate`: pass; 154 application tests across 22 Vitest files plus eight Node repository-policy regressions (162 automated tests total), all format/lint/strict-type checks, package/API builds and 12-route web export pass.
- `corepack pnpm test:coverage`: pass. Core domain/provider/engine/application/API packages remain approximately 90%+ statement coverage; tested mobile modules are 70.75% and do not cover most rendered native UI.
- `corepack pnpm security:audit`: pass under an explicit policy that temporarily accepts two high Metro `image-size` build-tool advisories until 2026-09-10 because the declared patched version is unpublished.
- `corepack pnpm peers check`: pass.
- Expo Doctor 1.20.1 is currently **19/20**, and `expo install --check` reports eight supported patch mismatches. Expo 57.0.18, constants 57.0.16 and font 57.0.2 were published on 2026-08-28 at 10:47–10:48 UTC; the mandatory strict 1,440-minute supply-chain gate blocks their installation until 2026-08-29 10:49 UTC (13:49 Europe/Helsinki). No exclusion or age bypass was added. Current installed versions remain the previously verified native set.
- API production smoke: pass locally; health/OpenAPI/strict validation verified. No deployed production service exists.
- Web entry: 2,539,834 bytes uncompressed / 575,888 bytes gzip, above the 2 MiB warning budget and 0.4% larger than the prior baseline.
- Browser QA passed at 390×844 and 1280×720 in Finnish and English for Home, manual entry, resolved result, ambiguous result and offline recovery. The measured Home/result desktop views had zero horizontally overflowing DOM elements. Dark mode and true native Dynamic Type were not visually claimed.
- The controlled backend-unavailable state showed provider failure without reclassifying the product; restoring the real API and pressing retry recovered to the known result without code re-entry. Privacy-safe API evidence contained no raw GTIN.
- The EAS development profile previously declared `developmentClient:true` without `expo-dev-client`; this caused the observed `No script URL provided` failure. Adding the native dependency, rebuilding the ignored iOS project/pods, recursively verifying the app plus 11 frameworks, installing and launching the fresh client resolved startup. A repository policy now prevents recurrence.
- Physical iPhone JS verification on 2026-08-28 passed the redesigned Finnish Home, manual entry and known Nutella result. The semantic tree exposed the primary actions as buttons, localized result destination first, localized unknown reason, and scanner close/torch controls. Physical screenshots are in ignored `work/ui-qa/`; live camera frames were not captured. The automation toolbar overlaps the top-right torch control, so the control's physical toggle is not claimed.
- Latest privacy-safe local provider observations included a 249 ms live lookup and 5 ms cache hit. A physical xctrace frame attempt matched no app process and produced zero frames; it is recorded as unavailable, not as a performance pass.
- Earlier partial physical iOS evidence still passes lifecycle, camera allow/revoke/settings recovery, one real EAN-13 `not_found`, known OFF resolution, offline/no-request behavior, restored retry/cache, invalid-manual rejection, provenance and the repaired partial VoiceOver path. Remaining VoiceOver, largest text, dark/reduced-motion, broader barcode conditions and valid performance/battery measurements are open.
- Local `main` contains audited implementation and evidence beyond `origin/main`/`87404a0`. No push occurred because authorization is absent.

## Release state

**NO-GO.** See `docs/final/PRODUCTION_AUDIT.md`, `RELEASE_GO_NO_GO.md`, `OWNER_ACTIONS.md` and `TEST_EVIDENCE.md`.

Open blockers include the fresh Expo patch age gate, signed Android and iOS release/TestFlight builds, the remaining physical camera/accessibility/performance matrix, production API/database/monitoring and restore drill, OFF owner account/licence approval, GS1 Data contract decision, independent Finnish content approval, privacy/terms/GDPR approval, hosted support/privacy URLs, final store assets/forms/console validation and two unpatched high build-tool advisories.

No production deployment, paid build, contract acceptance, submission, push or public publication occurred. Owner-controlled Apple account and free Personal-Team signing were used only for the local development device run. See `docs/final/PHYSICAL_IOS_VALIDATION.md` for exact passed and pending rows.
