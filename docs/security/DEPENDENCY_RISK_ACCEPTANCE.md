# Dependency risk acceptance

Reviewed: 2026-08-10
Owner: engineering; product owner must acknowledge before release

`pnpm audit` currently reports two high-severity denial-of-service advisories in `image-size@1.2.1`, reached through Expo/Metro development and build tooling:

- `GHSA-w3rx-r6r6-pgpr` — ICNS parser infinite loop
- `GHSA-5p2g-fcmc-qvqq` — JXL/HEIF parser infinite loops

The advisory declares `>=2.0.3` patched, but npm publishes no `2.0.3` release as of the review date. A forced override therefore cannot be installed. The vulnerable parser is not used to process user uploads at runtime; Metro sees repository-controlled build assets. CI uses bounded hosted runners and contributors must not add untrusted binary assets without review.

`scripts/audit-policy.mjs` allows only these exact advisory IDs and expires the exception on 2026-09-10. Any other high/critical advisory fails immediately. Dependabot and the weekly security workflow provide update signals. Remove both exceptions as soon as a compatible patched release exists.

The audit also reports lower-severity transitive issues in `uuid` and `esbuild`; both are monitored through the same weekly process and do not justify compatibility-breaking overrides without an upstream-supported version.
