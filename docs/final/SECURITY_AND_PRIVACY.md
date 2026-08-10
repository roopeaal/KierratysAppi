# Security and privacy

The threat model covers malformed barcodes, untrusted provider data, SSRF, oversized/decompression/image attacks, prompt injection, credential exposure, authorization, scraping/DoS, supply chain, logs, analytics, location, deletion and backups.

Implemented controls include strict GTIN checksum/length/character validation; fixed provider origin; HTTPS image filtering; response timeout/size/redirect controls; API request cap/rate limits/headers/CORS; no mobile secrets; runtime schemas; generic error envelopes; POST lookup boundary; no routine request logging; dependency lock/policy; dependency review/Dependabot/Gitleaks; PostgreSQL constraints, immutable rules, audit model and forced RLS for sensitive records. CodeQL is prepared but feature-gated because GitHub Code Security is not enabled for this private repository; enabling it may require an owner-approved paid entitlement.

Basic use requires no account. Camera frames are decoded locally and not uploaded. Optional history and correction drafts use AsyncStorage and start local-only; disabling history clears it. Technical telemetry is no-op until a vendor/consent decision and has a tested forbidden-property boundary for GTIN/barcode/product name/photo/location/free text. Location is not requested.

The displayed privacy notice and terms are drafts. Before release, counsel must approve lawful basis, processor/data-transfer terms, retention/deletion, OFF licence/share-alike handling, store declarations and incident contacts. Photo/cloud OCR stays disabled until metadata stripping, consent, signed upload, validation, abuse moderation and lifecycle deletion are implemented.

Two high `image-size` Metro build-tool DoS advisories have no published patched version. The narrowly scoped exceptions expire 2026-09-10, accept only repository-controlled build assets, and do not apply to runtime uploads. Any other high/critical advisory fails CI.
