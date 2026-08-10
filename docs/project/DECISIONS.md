# Decision log

## D-001 — Accuracy is a domain invariant

- Date: 2026-08-10
- Status: accepted
- Decision: every sorting result must expose provenance, jurisdiction, rule version, checked date, verification status, confidence tier, and an explanation. Unknown and ambiguous are first-class results.
- Reason: sorting guidance is the trust-critical product output; hiding uncertainty creates unacceptable misinformation risk.

## D-002 — Begin from the empty private repository

- Date: 2026-08-10
- Status: accepted
- Decision: initialize `main` locally with the supplied repository as `origin`; preserve `work/` and `outputs/` as ignored Codex workspace directories.
- Reason: the remote has no commits or default branch, so there is no existing code or history to preserve.

## D-003 — Expo SDK 57 with Node 24 LTS

- Date: 2026-08-10
- Status: accepted
- Decision: use Expo 57, React Native 0.86, Expo Router, Continuous Native Generation, `expo-camera`, strict TypeScript, and development builds. Pin Node 24 LTS for production/CI even though local Node 26 can execute the workspace.
- Reason: official Expo setup names SDK 57 and Node LTS; Node 26 remains Current in August 2026.

## D-004 — Framework-independent services composed by Fastify

- Date: 2026-08-10
- Status: accepted
- Decision: use Fastify 5 as a small HTTP composition root around shared Zod contracts and application services. PostgreSQL is the production system of record behind repositories; deterministic in-memory adapters support local tests.
- Reason: it provides validated, observable HTTP boundaries without NestJS ceremony or an early managed-provider/account lock-in.

## D-005 — Isolate provider records and licences

- Date: 2026-08-10
- Status: accepted
- Decision: retain Open Food Facts, future GS1, internal verification, and user observations as attributable layers. Never flatten them into an untraceable database; do not bulk-cache/mix OFF data pending licence review.
- Reason: field-level trust and ODbL/proprietary-data compatibility require explicit provenance and isolation.

## D-006 — Rinki rules with Palpa deposit precedence

- Date: 2026-08-10
- Status: accepted
- Decision: seed only source-reviewed nationwide plastic/carton/glass/metal packaging rules. Known deposit return wins; a bottle/can with unknown deposit status returns an inspection question.
- Reason: material alone cannot establish Finnish return destination, and Palpa coverage is product/system-specific.

## D-007 — Material Ledger design direction

- Date: 2026-08-10
- Status: accepted
- Decision: use a cool mineral canvas, cobalt actions, pine only for verified states, amber for uncertainty, Atkinson Hyperlegible Next, IBM Plex Mono metadata, and a component “sorting seam” signature.
- Reason: it makes component/action/evidence relationships clear, supports large text and screen readers, and avoids generic eco/AI styling.

## D-008 — GTIN lookup uses a POST body

- Date: 2026-08-10
- Status: accepted
- Decision: expose `POST /v1/recycling/lookup` instead of a GTIN path/query endpoint; disable routine Fastify request logs and return `private, no-store`.
- Reason: access logs, proxies and browser history commonly retain URLs. A bounded validated body materially reduces accidental scan-history logging.

## D-009 — No telemetry vendor by default

- Date: 2026-08-10
- Status: accepted
- Decision: ship a no-op typed technical-event boundary whose runtime guard rejects GTIN/barcode/product name/photo/location/free text. Enable a vendor only after consent/processor/retention decisions.
- Reason: operational observability is useful, but raw recycling behavior is not necessary for the product and may become personal profiling.

## D-010 — Time-bound Metro parser risk acceptance

- Date: 2026-08-10
- Status: accepted until 2026-09-10
- Decision: accept only `GHSA-w3rx-r6r6-pgpr` and `GHSA-5p2g-fcmc-qvqq` in the build-tool audit while the declared patched `image-size@2.0.3` is unpublished; all other high/critical findings fail.
- Reason: Metro handles repository-controlled assets, not runtime uploads. A forced unpublished override is impossible; an expiring CI exception preserves visibility and forces re-review.

## Pending decisions

- OCR implementation and whether a cloud AI path is justified.
- Production hosting/database/telemetry providers after owner cost/privacy-region approval.
