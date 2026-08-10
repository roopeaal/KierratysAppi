# KierrätysAppi

KierrätysAppi is a Finnish-first, source-backed packaging sorting app. A user scans or enters an EAN/GTIN, the private backend normalizes product and packaging observations, and a versioned rule engine explains where each packaging component belongs. Missing and ambiguous data stay explicit—material, shape, and deposit status are never silently guessed.

## What works

- Expo SDK 57 app for Finnish and English, camera permission, barcode scanning, manual entry, offline recovery, opt-in device-only history, manual component confirmation, and correction drafts.
- Fastify API with runtime validation, rate limits, secure headers, explicit CORS allowlist, OpenAPI output, privacy-conscious logging, and a POST lookup boundary.
- Open Food Facts API v3.6 adapter with timeout, size limit, attribution/licence, selected fields, and defensive packaging normalization.
- Deterministic Finnish packaging rules sourced from Rinki and Palpa, with component-level provenance, confidence, explanations, and exceptions.
- PostgreSQL migration covering 26 production entities, forced row security for sensitive records, and immutable published rule versions.
- Automated unit, contract, integration, migration, API, mobile-state, build, audit, CodeQL, dependency-review, and secret-scanning gates.

## Local development

Requirements: Node 24 LTS and pnpm 11.16.

```bash
pnpm install --frozen-lockfile
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
pnpm --filter @kierratysappi/api dev
pnpm --filter @kierratysappi/mobile start
```

For an Android emulator, set `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000`. A physical device needs an HTTPS development endpoint or the workstation's reachable LAN address. Do not put provider secrets in `EXPO_PUBLIC_*` variables.

Run all local quality gates with:

```bash
pnpm validate
pnpm security:audit
pnpm --filter @kierratysappi/mobile exec expo install --check
```

The generated API contract is available at `GET /v1/openapi.json`; product lookup is `POST /v1/recycling/lookup` with `{ "gtin": "…", "language": "fi" }`.

## Release boundary

No paid EAS build, store submission, database deployment, analytics/crash vendor, map provider, GS1 data feed, or photo upload is activated. Those require the accounts, credentials, contracts, legal decisions, and approvals tracked in `docs/project/EXTERNAL_BLOCKERS.md` and `docs/project/RELEASE_READINESS.md`.

The privacy notice and terms shown in the app are clearly marked drafts and must receive Finnish legal review before publication.
