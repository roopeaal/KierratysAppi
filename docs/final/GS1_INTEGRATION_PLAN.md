# GS1 integration plan

## Non-negotiable gate

Do not replace `MockGs1DataProvider` until the owner has current written GS1 Data terms, including any 2026 Synkka transition obligations, covering API/product scope, territories, authentication, price/rate limits, caching duration, derived data, display attribution, redistribution/export, deletion/correction, audit and termination. No GS1 partner/verified claim is allowed from the mock.

## Technical path

1. Add `Gs1DataProvider` behind the existing `ProductDataProvider.findByGtin(Gtin, context)` contract; credentials stay in API secret storage.
2. Build runtime schemas from licensed documentation and recorded synthetic/sanitized fixtures; cap time/body/redirects and use a fixed allowlisted origin.
3. Map each returned field independently to `ObservedField` with provider record ID, retrieval/confirmation/stale timestamps, licence snapshot, confidence and `manufacturer`/verified status only when contract semantics support it.
4. Keep provider records isolated. Resolution order becomes verified internal → GS1 → OFF; merge by versioned field policy, never by losing licence/source.
5. Define cache/refresh/deletion behavior from the contract. Ensure API/mobile responses include required attribution while preventing raw licensed payload redistribution.
6. Add provider contract tests shared with OFF: found/not-found/rate-limit/outage/malformed/timeout, field normalization, licence, provenance, stale and fallback behavior.
7. Run a coverage/accuracy pilot against owner-approved GTINs. Reconcile conflicts at field level; sorting destination still comes only from policy and decisive packaging facts.
8. Security/legal review credential scopes, logs, backups, support escalation and termination data purge; enable through a server-side feature flag in preview first.

## Acceptance

The adapter cannot ship until contract tests, conflict/coverage evaluation, attribution screenshots, cache/termination drill, legal sign-off and a safe fallback to OFF/unknown all pass. Mock fixtures remain visually marked and are excluded from production composition.
