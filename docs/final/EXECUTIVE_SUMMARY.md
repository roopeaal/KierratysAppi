# Executive summary

KierrätysAppi now has a runnable, tested production-capable foundation from an empty repository. The core path is implemented: contextual camera permission → EAN/GTIN scan or manual entry → private Fastify API → defensive Open Food Facts v3.6 normalization → component-level Finnish Rinki/Palpa rules → source, date, confidence, preparation, exceptions, ambiguity and safe unknown states. Missing product packaging can also use a deterministic, local EU material-code flow with explicit user confirmation and no image capture.

The product is intentionally honest. Open Food Facts fields retain community provenance and licence; bottles/cans with unknown deposit status ask the user; missing packaging does not become an invented bin. The basic flow needs no account, scan URLs are not logged, optional history stays on-device, and no camera frame/AI/location/advertising identity is sent.

Local evidence is strong: 100 automated tests, executable PostgreSQL migration/seed, all strict TypeScript/build/format/lint gates, a bundled API smoke test, Expo Doctor 20/20, clean peer dependencies, 12-route web export, live source-backed lookup, and rendered visual review at three mobile viewport sizes plus the new code flow at two sizes.

This is not approved for public release. Remaining gates require external action: signed Android/iOS builds and physical-device camera/accessibility evidence; Finnish legal and data-licence review; production hosting/database/monitoring and backup choices; store accounts/submission; and removal or owner acceptance of two expiring Metro build-tool advisory exceptions when a published patch becomes available. No paid build or external release was triggered.
