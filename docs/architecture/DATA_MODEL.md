# Data model

## Core identity and provider records

- `products`, `gtins`, `brands`, `product_images`
- `provider_records` stores provider/source record metadata and bounded raw hashes, not an unattributed merge
- `field_observations` stores entity/field/value, source, retrieval, licence, confidence, verification, last confirmation, and staleness
- `product_resolutions` records resolution policy/version and selected observations

## Packaging and policy

- `packaging_components`, `component_relationships`
- `materials`, `material_codes`
- `regions`, `sorting_destinations`
- `rule_sources`, `sorting_rules`, `sorting_rule_versions`
- `confidence_assessments`

## Privacy-conscious product operations

- `anonymous_installations` only if a backend abuse/feedback need is approved; no advertising identity
- `scans` defaults local-only; server event is aggregate/technical unless user explicitly saves/syncs
- `feedback`, `corrections`, `evidence_images`, `moderation_decisions`
- `feature_flags`, `audit_events`

## Invariants

- GTINs are canonical strings with checksum validation.
- Component fields never lose observation provenance.
- Sorting rules are immutable once published; replacement creates a version with effective dates.
- Evidence-image metadata includes purpose, consent version, retention/deletion timestamps, MIME/dimensions/hash, and storage key—not public URLs.
- Admin/moderation changes are actor-attributed and append to the audit log.
- PostgreSQL row security is enabled/default-deny for user-owned or moderation-sensitive records; privileged API roles remain distinct from migration/owner roles.
