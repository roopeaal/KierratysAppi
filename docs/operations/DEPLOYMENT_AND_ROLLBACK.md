# Deployment, backup and rollback

## Environments

- Development: local API/PGlite or approved disposable PostgreSQL; Expo development build; no production data.
- Preview: internal EAS distribution and isolated EU-region staging database; test provider contact and non-production secrets.
- Production: signed store binaries, managed PostgreSQL with point-in-time recovery, monitored API, owner-approved domains and policies.

Environment values are injected by the hosting/EAS secret stores. `EXPO_PUBLIC_*` is public binary configuration and must never contain secrets. The API runtime requires a monitored Open Food Facts User-Agent contact in production and rejects localhost web origins.

## Release sequence

1. Tag an owner-approved commit after frozen install, validation, security, Expo diagnostics and signed-device checklist pass.
2. Back up the production database and record restore point/version.
3. Apply migrations with a least-privileged migration identity; execute smoke reads before application rollout.
4. Deploy API canary, verify health, lookup status/latency/error rates without raw GTIN logs, then expand.
5. Promote internal mobile builds to staged store rollout. Use EAS Update only within the same `appVersion` runtime and never to bypass native/store review.
6. Record release notes, rule version, migration version, binary build numbers and approver.

Paid EAS builds, infrastructure changes, or store submission require explicit owner approval.

## Rollback

- API: redeploy the previous immutable artifact/config. Stop rollout when error/latency/privacy/accuracy guardrails breach.
- Rules: publish a replacement version or switch the active resolution pointer; published rule-version rows are immutable.
- Database: prefer forward-compatible corrective migrations. Restore from the verified pre-release point only during an incident with data-owner approval; never run an ad hoc destructive down migration.
- Mobile: halt staged rollout and submit the previous compatible native version when possible. EAS Update may roll back JS only when runtime compatibility and policy allow it.

## Backup/restore evidence required

- Automated encrypted daily backups and point-in-time recovery in an approved EU region.
- Quarterly restore drill to isolated infrastructure, with duration, row-count/checksum checks and access audit.
- Separate object-storage lifecycle/deletion verification before evidence images are enabled.
- Documented RPO/RTO approved by owner; proposed baseline is RPO ≤ 24 h and RTO ≤ 8 h.
