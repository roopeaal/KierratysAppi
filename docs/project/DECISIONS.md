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

## D-011 — Typed material-code recognition precedes OCR

- Date: 2026-08-10
- Status: accepted
- Decision: parse a conservative Decision 97/129/EC identifier subset locally, require the user to confirm the visible mark, and retain the official scheme plus local-observation provenance. Conflicts, multiple codes, undefined values, and composites that lack a reviewed rule do not receive guessed guidance.
- Reason: this delivers the deterministic value of label recognition without collecting an image or binding the product to an unapproved OCR/cloud workflow; a material mark also cannot establish shape, deposit, or collection eligibility by itself.

## D-012 — Fresh Expo patches do not bypass the release-age gate

- Date: 2026-08-10
- Status: accepted; time-limited compatibility NO-GO
- Decision: retain the aged Expo 57.0.11, constants 57.0.9, router 57.0.11, splash 57.0.5 and compatible transitive pins until the four newer SDK patches pass the repository's minimum-release-age policy. Do not use Expo dependency exclusions or an age-policy bypass merely to make Doctor green.
- Reason: the compatible patches were published only hours before the audit. A deliberate 19/20 diagnostic is safer and more truthful than consuming unaged supply-chain inputs or hiding the mismatch.

## D-013 — Adversarial audit result is NO-GO

- Date: 2026-08-10
- Status: accepted
- Decision: the repository is not production-ready despite passing local validation. Native binaries/devices, infrastructure/recovery/monitoring, accountable content/legal/licensing approval and complete store evidence are release gates, not post-release follow-ups.
- Reason: source-level checks cannot establish camera reliability, signed-binary behavior, production operations, lawful publication or store acceptance.

## D-014 — Start iPhone validation with a local Personal-Team build

- Date: 2026-08-10
- Status: accepted for physical development validation
- Decision: install Xcode 26.6 and use `expo run:ios --device` with automatic local signing. A free Apple Personal Team is sufficient for this device-only stage; do not invoke EAS or a paid Apple Developer operation unless local compilation is proven incompatible.
- Reason: Expo SDK 57 requires Xcode 26.4+ and supports iOS 16.4+. Apple and Expo document local device builds as the only development-build route that can use free Personal-Team provisioning; it produces stronger native evidence at lower cost than a cloud build.

## Pending decisions

- OCR implementation and whether a cloud AI path is justified after the typed-code flow is evaluated.
- Production hosting/database/telemetry providers after owner cost/privacy-region approval.
- Whether a distributable web build is in launch scope; if yes, the current 2.53 MiB entry requires optimization and deployed performance evidence.
