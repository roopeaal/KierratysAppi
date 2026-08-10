# Architecture

```text
Expo SDK 57 app
  local Decision 97/129/EC material-code parser → explicit user confirmation
  POST /v1/recycling/lookup
Fastify 5 API
  ProductResolutionService + bounded in-memory cache
  provider order (future internal → licensed GS1 → Open Food Facts)
  normalized ProductObservation with field provenance
  deterministic Finnish Recycling Engine
  discriminated result contract
PostgreSQL 26-table schema for durable product/policy/moderation operations
```

The mobile client imports only the stable lookup schema, never Open Food Facts response shapes. Product observations and sorting policy are separate packages. Provider errors are distinct from not-found. Resolution evaluates each packaging component and caps confidence at the least certain decisive observation even though the rule source is verified.

The typed material-code path never calls the API. A bounded domain parser maps only reviewed official identifiers, then the mobile bridge creates separate user-confirmed and scheme-derived provenance before invoking the same deterministic recycling engine. Recognition can still yield an engine ambiguity or unknown; composites are not promoted to a dominant material.

Open Food Facts requests use a fixed HTTPS origin, v3.6 selected fields, country/language hints, identified User-Agent, manual redirects, 4.5-second timeout and one-megabyte streamed response cap. Results carry source record, URL, retrieval time, verification, confidence and licence snapshot.

The database migration includes identity, providers/observations, packaging/materials, regions/destinations/versioned rules, resolutions/confidence, opt-in scans, feedback/corrections/evidence/moderation, flags and audit events. Published rule versions reject update/delete; sensitive tables force row security and default to no policy.

The API uses POST to keep GTINs out of routine URLs, runtime input/output parsing, 2 KiB request cap, rate limits, secure headers, exact web-origin allowlist, no request access logs, OpenAPI, and bundled workspace code. Deployment remains vendor-neutral.
