# Release guide

## Preflight

1. Use Node 24 and pnpm 11.16; install with frozen lockfile.
2. Replace every legal/store/support placeholder and obtain product/content/licence approvals.
3. Configure monitored `OFF_USER_AGENT`, production API URL, exact web origins, database/object storage and secret stores. Never place secrets in `EXPO_PUBLIC_*`.
4. Run `pnpm validate`, `pnpm security:audit`, Expo Doctor, peer/compatibility checks, CI/security workflows and the full physical-device checklist.
5. Verify no audit exception has expired and production dependencies/rules were reviewed.

## Infrastructure

Provision an EU-region managed PostgreSQL with encrypted PITR. Apply `database/migrations/0001_initial.sql`, then the reviewed seed, using a separate migration identity. Create least-privileged API/moderation roles and explicit RLS policies before any sensitive feature is enabled. Deploy the bundled Fastify artifact behind TLS with bounded instances/rate limiting and privacy-safe aggregate monitoring.

## Mobile

EAS profiles exist for development, internal preview and production. Configure the owner’s Expo project and secret environments; verify `fi.roopeaaltonen.kierratysappi`, icon/splash/privacy manifest/camera wording and monotonically increasing build numbers. Create signed AAB/IPA only after owner approval, install internally, complete device evidence, then stage store rollout.

EAS Update uses `appVersion` runtime policy. Publish only JS/assets compatible with the installed native runtime; do not use updates to bypass native/privacy/store review.

## Rollout and rollback

Back up before migration, canary the API, verify aggregate status/latency/provider failure, then stage mobile rollout. Halt on accuracy, privacy, crash or latency guardrails. Roll back API artifact/config; replace rules with a new immutable version; prefer forward corrective migrations; halt/revert mobile staged release. Full procedure is in `docs/operations/DEPLOYMENT_AND_ROLLBACK.md`.
