# Incident response

## Severity

- **Critical:** signing/admin/database secret compromise, unauthorized rule publication, confirmed broad personal-data disclosure, malicious production release.
- **High:** exploitable access-control bypass, evidence-image exposure, materially wrong nationwide rule published, active provider/licence violation.
- **Medium:** limited telemetry leak, abuse/rate-limit degradation, stale result beyond policy, non-critical dependency issue.
- **Low:** no-impact probe, minor configuration drift, documentation-only issue.

## Response

1. Triage and preserve timestamps, affected version/rule/provider, logs, and release hashes without copying unnecessary personal data.
2. Contain: disable feature/provider/flag, revoke/rotate affected secret, block malicious release, or roll back rule/app/API as appropriate.
3. Assess affected people, jurisdictions, data categories, scope, source accuracy, and regulatory/contract notification deadlines with owner/legal counsel.
4. Eradicate root cause, add regression/security tests, review adjacent trust boundaries, and rebuild from a trusted clean environment.
5. Recover gradually, monitor explicit indicators, validate sorting/content and data integrity, and communicate accurate status.
6. Complete a blameless post-incident review with action owners/dates and update the threat model/runbooks.

## Sorting-content incident

Immediately unpublish or supersede the affected immutable rule version, make cached clients treat it as revoked, publish a safe unknown/ambiguous fallback, identify affected result events only through privacy-preserving aggregates, and obtain editorial/source review before restoring guidance.

## Contacts and notifications

**OWNER ACTION REQUIRED:** add security lead, privacy lead/DPO if applicable, legal counsel, hosting/database/provider contacts, app-store contacts, and Finnish supervisory/consumer-authority procedures before staging deployment.
