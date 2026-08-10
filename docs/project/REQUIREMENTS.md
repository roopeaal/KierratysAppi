# Requirements

## P0 functional requirements

- Contextual camera-permission explanation and barcode permission recovery.
- EAN-8, EAN-13, UPC-A-compatible GTIN normalization, duplicate suppression, and manual entry.
- Product lookup through a KierrätysAppi-owned application boundary and normalized provider model.
- Component-specific Finnish guidance through a jurisdictional, versioned sorting engine.
- Visible source, checked date, verification, confidence, and explanation.
- Honest product-not-found, packaging-missing, ambiguous, provider-failure, and offline flows.
- Correction/feedback flow, privacy-conscious local history, Finnish UI, and English architecture.
- Accessible interaction and resilient loading/error states.
- Automated validation and Android/iOS production configuration.

## P1 requirements

- Consented package/recycling-label photo flow, on-device OCR where viable, deterministic code parsing, collection-point boundary, favorites, rule administration, feature flags, remote configuration, and privacy-preserving analytics.

## Excluded from initial release

- Generalized waste recognition, GS1 production integration without a licence, community verification at scale, multi-country rules, rewards, white-label features, and unsupported environmental-impact claims.

## Non-functional requirements

- Type-safe/runtime-validated boundaries, least privilege, bounded inputs, no client secrets, accessible UI, reduced motion, source-licence compliance, observable provider failure, deterministic domain tests, and documented performance budgets.
