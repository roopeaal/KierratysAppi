# SDK 58 maintenance — October 29, 2026

Authority: Roope approved repairing the dependency gates after the contributor
audit. Continued from `ceedb6a` on `codex/illustrated-functional-integration`.
No GitHub sharing, paid inference or production publication.

## Repairs

- Apply all twelve official Expo/RN patch expectations within SDK 58; retain
  React 19.3, technical app identity, permissions and three-part architecture.
- Fastify 5.11.3 → 5.12.7; all six direct workspace Zod consumers 4.4.3 →
  4.6.7. Refresh brace-expansion, forge, compression, shell-quote and source-map
  within compatible parent ranges. Vite 8.3.5 is an explicit supported test
  peer, with aligned Vitest/coverage 4.1.12, not a new app feature.
- Narrowly migrate only Expo CLI's Zod dependency to 4.6.7, with seven tests
  against its actual installed schemas. No v3 alias, advisory exception,
  severity downgrade, exclusion or release-age-policy bypass.
- Twelve additional policy/parser/SDK-generation/security-floor regressions
  fail on the vulnerable lockfile and pass after repair. Existing fail-closed
  audit and CI gates remain unchanged.
- Ignore generated `.pnpm-store/` and allow photo/nearby QA evidence directories
  through the existing environment convention, preserving older evidence.

Application source, localization, assets, sorting rules, provider/model/prompt,
data, SQL migrations, app identity/configuration and CI/audit policy remain
unchanged from `ceedb6a`. Teammates' histories and implemented behavior remain.
The earlier preservation report is a dated baseline, not a claim that dependency
blobs remain byte-identical after this intentional maintenance.

Primary sources and the CLI migration rationale:
`docs/research/dependency-security-2026-10-29.md`.

## Fresh evidence

Local Node 26.4.0; pinned pnpm 11.16.0; no global configuration change. Keep
`minimumReleaseAge: 1440` and strict mode. Logs under ignored
`work/sdk58-security-maintenance-2026-10-29/`:

| Check | Result | Log |
| --- | --- | --- |
| Frozen install / supply-chain policy | PASS | frozen-install.log |
| Peer compatibility | PASS | peers.log |
| Fresh online Expo install check, API cache disabled | PASS | expo-check.log |
| CI-pinned Expo Doctor 1.21.5 | 20/20 PASS | expo-doctor.log |
| Live no-exceptions high/critical security policy | PASS: zero high/critical | security-audit.log |
| Raw registry audit | 12 moderate, 6 low retained; raw command exits 1 as expected | audit-after.json |
| Full validation / all builds / 16 web routes | 429 unique cases: 113 policy + 316 application, PASS | validate.log |
| Independent focused policies/CLI schema suite | 29/29 PASS; overlaps full total | two new test files + existing dependency/client tests |
| Shared/backend/mobile independent scopes | PASS; overlapping tests | validate-{shared,backend,mobile}.log |
| Built API on loopback, AI explicitly disabled | health/OpenAPI/capabilities 200, synthetic invalid input 400 | api-smoke.log |
| All five fixture browser suites | PASS; exact responsive assertions retained | navigation-final/reference/refinement/photo/nearby.log |

The first install attempt stopped on a store-location mismatch; using the
existing explicit store fixed it without deleting or relinking the project.
Initial Expo checks failed on cache write permissions, not compatibility;
final checks use `EXPO_NO_CACHE=1` to fetch current official data. An initial
Doctor invocation had an unsupported store-dir option; the actual unchanged
CI command above subsequently passed. These failures are not app passes.

Browser results are recorded in TEST_EVIDENCE. Fixtures intercept product/photo
calls and use synthetic GPS/camera only. No real image, address, location,
recognition call or provider lookup is needed. A diagnosed navigation-runner
race mixed old/new rectangles during responsive resize; the repair waits for
the actual narrow branch and reads geometry/fonts in one browser evaluation.
Exact order, prominence, reading-width and no-implicit-effect assertions remain.
The first selector repair matched a hidden Home icon as well; scoped it to
the Identify action before the final pass. No application UI change was needed.
Final documentation-inclusive full validation is `validate-final.log`.

## Decision and next boundary

The two local dependency gates that held the source-sharing recommendation are
repaired. Eighteen lower-severity records remain visible with engineering-owned
procedures in DEPENDENCY_RISK_ACCEPTANCE; passing the threshold is not zero risk.
No fresh GitHub CI result exists because no push occurred. Production remains
NO-GO, including PHOTO-003 and the existing platform/infrastructure/store gates.

**The iPhone is not updated or reaccepted by this work.** Native patches require
a fresh build/install. The verified old Metro 8093 and API 3003 were stopped
before installation so old client 3 could not auto-load mismatched native JS.
Isolated web QA runs on loopback 8094; local smoke API 3004 disables photo AI.
No native regeneration, signing, phone installation, renewal or device read was
performed. Old profile expiry remains November 4 at 20:28:39 Helsinki, not renewed.

Next: engineering builds a new patched development client, preserving the
verified prior binary and local data; Roope handles any actual unlock/trust/
account prompt. Verify matching native/JS versions, signatures/profile and
replacement installation, then Home → Identify → each entry/back at normal/
larger native text, without capture/upload/real GPS/paid inference. No automatic
GitHub publication or account change is part of that procedure.
