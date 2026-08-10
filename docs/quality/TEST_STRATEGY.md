# Test strategy

## Automated pyramid

- Domain unit tests: GTIN-8/12/13/14 normalization/checksum, confidence tiers, and provenance caps.
- Policy unit tests: packaging status, hazard/pressure, deposit precedence, glass shape, supported and unsupported materials.
- Provider contract tests: fixed food-product URL/header contract, returned-GTIN binding, exact conservative taxonomy mapping, normalization, unsafe image filtering, partial packaging, local quota, timeout, 404, 429, 5xx, redirects, malformed and oversized bodies, combined OFF licence provenance, and explicit GS1 mock status.
- Application integration tests: provider fallback, cache/freshness, missing packaging, component rule evaluation, not-found versus outage.
- HTTP integration tests: health/OpenAPI, strict body validation, response status mapping, size/rate limits, configured CORS origins, aggregate lookup observation and generic security response behavior.
- Migration tests: execute SQL in PGlite PostgreSQL, assert all 26 entities, row security, GTIN/material integrity, idempotent seeds and rule-version immutability.
- Mobile tests: duplicate scan window, offline/protocol recovery states, production API URL validation, supported barcode formats, scoped local deletion, reduced-motion transition selection and token contrast.
- Build checks: declaration/package builds, bundled API, Expo static export, Expo compatibility and peer checks.

The root `pnpm validate` command is the local source-validation gate. CI runs it from a frozen lockfile and adds Expo Doctor and the dependency-audit policy. A passing local gate is not release acceptance while Doctor/native/device/infrastructure/legal/store evidence is missing.

## Required device/E2E evidence

The camera itself must be tested on physical devices; emulator/web evidence is insufficient. Before public release, record pass/fail, device/OS/app build, tester, and screenshot/video references for:

- first launch in Finnish and English;
- permission granted, denied, denied permanently, and later enabled in settings;
- EAN-8, EAN-13, UPC-A, dim light, glare, curved label, damaged label, and rapid duplicate scans;
- valid, invalid checksum, unknown product, packaging missing, ambiguity, outage, offline retry, local history, correction draft, and deep links;
- small Android, common Android, recent iPhone, tablet, dark mode, largest practical text, VoiceOver, and TalkBack.

Do not record a test as passed if a required real account, signed binary, camera, or network condition was simulated.
