# Threat model

Last reviewed: 2026-08-10. Scope: mobile barcode flow, public lookup API, external product providers, future evidence uploads, corrections, admin, analytics, and PostgreSQL.

## Assets and trust boundaries

- Trust-critical assets: sorting-rule integrity, provenance, verification status, admin authorization, audit log, provider credentials, deployment/signing secrets, user evidence and location, and release artifacts.
- Untrusted inputs: barcodes, query/body/headers, provider JSON/images/redirects, OCR text, photos/EXIF, URLs, correction content, analytics parameters, database imports, dependencies, and CI artifacts.
- Boundaries: device → public API; API → provider; API → database/object storage/telemetry; moderator → admin API; CI → registries/build/store.

## Threats and controls

| Threat | Abuse/failure | Required controls | Verification |
| --- | --- | --- | --- |
| Malformed GTIN | Oversized/non-digit/checksum-bypass input reaches provider/logs | Length cap, Unicode rejection, canonical checksum validator, schema path constraint | Unit + HTTP tests |
| Lookup abuse / DoS | Automated scans exhaust API/provider quota | Per-route IP limits, cache, request budget, provider timeout/backoff, bounded concurrency, health telemetry | Integration/load tests |
| Provider poisoning | Malformed/hostile JSON or misleading data becomes guidance | Field allow-list, response size cap, runtime schema, normalization, provenance, conservative confidence, policy engine separation | Contract fixtures/fuzz cases |
| SSRF/redirect abuse | Provider-controlled redirect reaches private network | Fixed HTTPS origins, reject/validate redirect destinations or disable arbitrary redirects, no user URLs | Adapter tests/security review |
| Data/licence contamination | OFF/proprietary/user data flattened and redistributed incorrectly | Provider-record isolation, licence metadata, derived-observation provenance, no bulk cache before review | Schema/repository audit |
| Incorrect policy | Material mapped to wrong Finnish destination | Immutable versioned rules, source review, deterministic traces, deposit precedence, ambiguous conflict state | Rule fixtures/editorial sign-off |
| Secret exposure | API/signing/admin secrets enter mobile, logs, commits, or error responses | Server-only environment validation, redacted logging, `.env` ignore, CI secret scan, least-privilege credentials | Secret scan/build inspection |
| Broken admin access | Public user edits rules/moderation | Separate authenticated admin endpoints/role, default-deny database policies, CSRF strategy where browser sessions exist, audit events | Authz integration tests |
| SQL injection | User/provider fields alter query | Parameterized repository queries, no interpolated identifiers, runtime schemas | Static review/integration tests |
| Evidence upload abuse | Huge/polyglot/decompression/EXIF/private-image upload | Signed single-purpose upload, byte/pixel/dimension/MIME/magic checks, decode/re-encode, metadata removal, quarantine, malware/content review, retention | Upload adversarial suite |
| OCR/prompt injection | Package text instructs AI/system or exfiltrates data | Treat OCR as quoted data, fixed structured schema, no tool/URL execution, provider-neutral server call, output validation, user confirmation | AI eval/red-team set before enablement |
| Location privacy | Precise location stored/transmitted unnecessarily | Request only on map action, prefer ephemeral device query, coarse option, no analytics/logging, clear permission recovery | Privacy/data-flow audit |
| Logging/analytics leak | Raw GTIN/history/photo/text/location reaches telemetry | Event allow-list and privacy class; hash/aggregate only where justified; payload tests | Telemetry contract tests |
| Supply-chain compromise | Malicious dependency/action/build artifact | Lockfile, minimal packages, reviewed actions, read-only CI permissions, dependency audits, CodeQL, Gitleaks detection, provenance/SBOM later | CI gates |
| Stale/offline answer | Cached obsolete rule shown as current | Effective dates, cache freshness, visible offline/freshness status, safe stale threshold | Time/offline tests |
| UGC abuse/copyright | Harassment, personal photos, copyrighted uploads | No public UGC in P0; terms/consent/report/remove/moderation before enablement | Product gate |

## Abuse cases that must remain safe

- A syntactically valid but unknown GTIN returns `not_found`, never a guessed product.
- A provider timeout returns `provider_unavailable`, never `not_found`.
- A bottle with unknown deposit status asks the user to inspect the Finnish deposit mark.
- Incomplete packaging never implies the displayed component list is exhaustive.
- A forged provider recycling label cannot override a verified Finnish sorting rule.
- An offline cached answer identifies its cached/rule dates.

## Residual risk / gates

Photo upload, accounts, admin browser UI, analytics, cloud AI, maps/location, and public corrections stay disabled until their implementation-specific controls, data processing terms, deletion/retention paths, and tests exist.
