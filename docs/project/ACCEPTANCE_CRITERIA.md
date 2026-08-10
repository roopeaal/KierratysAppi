# Acceptance criteria

## Core vertical slice

1. The user sees why the camera is useful before the OS prompt and can continue with manual entry.
2. A supported barcode is normalized and validated; malformed values never reach a provider.
3. Mobile calls the application API/service rather than Open Food Facts directly.
4. Provider payloads are runtime-validated and normalized with field-level provenance.
5. The sorting engine selects only matching, effective rules and explains the match.
6. Every component result shows destination, preparation, source, checked date, verification, and confidence in text—not color alone.
7. Missing product, missing packaging, ambiguity, offline mode, permission denial, timeout, and provider failure produce distinct recoverable states without fabricated advice.
8. Finnish and English strings render through localization keys; large text and screen-reader labels remain usable.
9. Domain, provider-contract, API-integration, and mobile-state tests pass.

## Release evidence

- `pnpm validate` succeeds from a clean install.
- CI configuration mirrors local validation.
- Native configuration passes Expo diagnostics that do not require signing.
- Physical-device, signed-build, store, and legal-owner gaps are explicitly blocked rather than claimed complete.
