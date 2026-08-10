# Architecture overview

## Selected shape

```text
Expo mobile
  -> versioned HTTP contract
Fastify API / application service
  -> product-resolution pipeline
      -> verified internal repository
      -> GS1 contract (mock until licensed)
      -> Open Food Facts adapter
  -> packaging observations + field provenance
  -> versioned Finnish sorting engine
  -> result envelope with explanation/confidence
PostgreSQL repositories (production) / in-memory adapters (local tests)
```

## Initial workspace

```text
apps/mobile                    Expo Router application
apps/api                       Fastify composition root and HTTP routes
packages/domain                Runtime schemas, GTIN, provenance, confidence
packages/data-providers        Provider contracts, OFF adapter, GS1 mock
packages/recycling-engine      Versioned deterministic Finnish rule engine
packages/localization          Finnish/English messages and typed keys
packages/config                Shared TypeScript/test/lint configuration
database/migrations            PostgreSQL source of truth
docs                           Decisions, research, security, release evidence
```

An admin UI is not created until an administrative workflow exists. This avoids an unused package while retaining a secure admin API/content-import boundary in the data model.

## Resolution order

1. Verified internal record.
2. Licensed GS1 provider when available.
3. Open Food Facts provider.
4. Consented OCR/material observation in later phase.
5. User confirmation.
6. Unknown.

Records from different licences are not flattened into an unattributed master record. Resolution merges field observations by policy while retaining source record, retrieval time, licence, confidence, verification, and last-confirmed date.

## API boundary

- `GET /v1/health`
- `POST /v1/recycling/lookup` with GTIN in the body so routine URL logs do not contain scan history
- `GET /v1/openapi.json`
- `POST /v1/feedback` (local contract initially; persistence/admin workflow required before public enablement)

Responses are runtime-validated discriminated unions: `resolved`, `packaging_missing`, `ambiguous`, `not_found`, and bounded operational errors. A provider outage is not encoded as `not_found`.

## Deployment neutrality

The API is a standard Node process, database is PostgreSQL, images use an object-storage interface, telemetry uses application ports, and secrets use environment injection. Supabase, container hosting, or serverless adapters can be selected later without changing mobile/domain contracts.
