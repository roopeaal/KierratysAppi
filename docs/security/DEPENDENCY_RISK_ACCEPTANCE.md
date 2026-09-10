# Dependency risk acceptance

Reviewed: 2026-09-10
Owner: engineering; product owner must review remaining risks before release

## Current live high/critical gate: pass, no exceptions

On September 10 the registry recovered. Its initial audit returned 20 high, zero critical, ten moderate and one low records. SDK-compatible Expo 57.0.21/Router 57.0.20 repairs the remote Doctor failure; a separate narrow transitive update repairs xmldom 0.8.13 → 0.8.15, xmldom 0.9.10 → 0.9.12, and js-yaml 4.3.1 → 4.3.2. Parent ranges allow these patches; no parser was added as a direct dependency and no override/exclusion was introduced. All releases exceed the strict 1,440-minute age gate.

The **final live `pnpm security:audit` passes**, with zero high/critical, six moderate and one low records. Full 188-test validation, frozen install, peers, Expo install check and Doctor 20/20 pass. Parser-floor and mandatory-Doctor regressions prevent reintroducing these versions or silencing the gate. The former external endpoint-timeout blocker is closed for this run; no risk acceptance was used to make it green. Primary sources and exact publication dates: `docs/research/dependency-security-2026-09-10.md` (AUD-043).

## Historical September 4 gate evidence

The first post-update raw lockfile audit reports **zero high and zero critical records**. `scripts/audit-policy.mjs` now fails every high/critical advisory, including the two formerly excepted `image-size` IDs. Failed commands, malformed/incomplete reports and advisory/count inconsistencies also fail closed instead of being treated as an empty audit. Lower-severity records remain visible in command output; passing this gate does not mean that all dependency risks or release requirements are resolved.

**Historical live gate unavailable:** later September 4 registry requests, including the final post-native-build retry, stalled and `security:audit` failed closed at its 60-second timeout. A direct audit diagnostic returned `ETIMEDOUT`, `SIGTERM`, null exit status and zero output bytes. An empty POST to npm's official audit bulk endpoint also timed out after 20 seconds with no response, while a package-metadata GET returned HTTP 200 in 0.112 seconds. That earlier report was a snapshot, not a passing final live gate. September 10's actual live pass above supersedes this timeout; no severity exception or timeout bypass was added.

The Expo-supported patch update brings Metro 0.84.5, which no longer depends on `image-size`. Neither the lockfile nor `corepack pnpm why image-size --recursive` contains that dependency. The historical exceptions for `GHSA-w3rx-r6r6-pgpr` and `GHSA-5p2g-fcmc-qvqq`, previously expiring 2026-09-10, have been removed rather than extended. This is dependency-path removal, not evidence that `image-size@1.2.1` itself is safe.

## API transitive remediation

The initial 2026-09-04 audit independently found eight high records: four advisories affecting each of `fast-uri@3.1.5` and `fast-uri@4.1.2` through the API's Ajv/schema-resolution/serialization dependencies:

- [GHSA-5jgf-p345-68v8](https://github.com/fastify/fast-uri/security/advisories/GHSA-5jgf-p345-68v8): scheme-relative IDN host confusion.
- [GHSA-f65p-4m7j-42xc](https://github.com/fastify/fast-uri/security/advisories/GHSA-f65p-4m7j-42xc): malformed IPv6 normalization.
- [GHSA-fph4-wmhf-6fwf](https://github.com/fastify/fast-uri/security/advisories/GHSA-fph4-wmhf-6fwf): repeated hostname percent-decoding.
- [GHSA-jqff-g426-hqxp](https://github.com/fastify/fast-uri/security/advisories/GHSA-jqff-g426-hqxp): percent-encoded scheme normalization.

The compatible security floors are 3.1.6 and 4.1.3, published on 2026-08-23. The narrow update selected 3.1.7 and 4.1.4, published on 2026-09-02 at 11:06:41.962 UTC and 11:07:44.919 UTC. Both satisfy the unchanged strict 1,440-minute release-age gate. Existing parent ranges (`^3.0.1`, `^3.0.5`, `^4.0.0`) permit these patches; no override, exclusion, direct dependency addition, or mobile/native version change was required for this API repair.

Reproduce the update and installed-graph verification:

```sh
corepack pnpm --filter @kierratysappi/api update fast-uri --depth Infinity --no-save
corepack pnpm install --frozen-lockfile
corepack pnpm why fast-uri --recursive
node --test scripts/__tests__/dependency-policy.test.mjs
corepack pnpm --filter @kierratysappi/api test
corepack pnpm security:audit
```

The frozen install is important: the filtered update changed the lockfile before the full workspace's installed graph was reconciled. The final `why` output confirms only 3.1.7 and 4.1.4. Regression tests enforce the patched lockfile floors, reject every high/critical fixture (including former exception IDs), and retain lower-severity reporting.

## Remaining lower-severity findings

The September 10 successful live audit reports **six moderate and one low records** (seven records, six unique advisory IDs). These are tracked risks, not a claim of exploitability or non-exploitability in this application.

| Dependency / installed version | Severity | Advisory | Declared patched version | Affected path |
| --- | --- | --- | --- | --- |
| `uuid@7.0.3` | moderate | `GHSA-w5hq-g745-h8pq` | `>=11.1.1` | Expo configuration / Xcode tooling |
| `esbuild@0.27.7` | low | `GHSA-g7r4-m6w7-qqqr` | `>=0.28.1` | Vitest / Vite tooling |
| `decode-uri-component@0.2.2` | moderate | `GHSA-vcc3-ghjq-m6fr` | `>=0.4.3` | Expo Router / query-string |
| `fastify@5.11.3` | moderate | `GHSA-w2qp-rph6-63g4` | `>=5.12.1` | API runtime |
| `fastify@5.11.3` | moderate | `GHSA-3m5p-2c4r-xxw2` | `>=5.12.1` | API runtime |
| `vitest@4.1.10` and `@vitest/mocker@4.1.10` | moderate, two records | `GHSA-82fw-gwwq-j7x9` | `>=4.1.11` | Vitest development/test tooling |

Engineering owns follow-up: recheck each package's publication age and supported parent range, update compatible patches, then run frozen install, API contracts, Expo compatibility/Doctor when the mobile graph changes, full validation and the security audit. Evaluate incompatible upgrades separately instead of forcing cross-major transitive overrides. Dependabot and the weekly security workflow remain update signals; this local audit is not evidence that remote workflows executed.
