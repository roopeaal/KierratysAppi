# Contributor preservation audit — October 29, 2026

## Fresh pre-push recheck after maintenance and client4

Roope now explicitly requests the Home heading change and a conditional push to
**roopeaal/KierratysAppi/main**. Fresh fetch, independently listed remote heads,
paginated account-associated main commits and PR queries still find team main
`28e0f3228e2754aae5c9b91ce42bf9ab60935549`, ITbes-dev's one SDK commit and
Rdotcom's eight commits plus merged #37, with no additional human team head.
At `efbf28b` the branch is **0 behind / 7 ahead**. All ten contributor IDs
remain ancestors; the private visual-source commit is not an ancestor.

Independent source rechecks find **no new contributor-function regression**.
Core backend/shared logic, camera/photo/result/storage/nearby adapters/cards,
nearby translations and postal/subregion normalization/tests remain identical
to team main. Home catch/ignore-after-blur protection, native address input,
five-point/material/map results and sorting-result heading remain reachable.
The SDK generation/status-bar/Doctor/QA-readiness changes remain; later compatible
dependency security patches and build4 are intentional, not byte-identical pins.
The two platform/UI qualifications below still apply: original public browser
address lookup was replaced on already-published main, and the exact-material
helper remains unwired. No claim of literal historical platform equivalence.

Full validation now passes **431 unique tests (113 policy + 318 application)**,
all builds and 16 routes. Fresh online Expo compatibility, Doctor **20/20** and
the unchanged live high/critical security policy pass; **12 moderate + 6 low**
records remain. The earlier dependency HOLD below is dated/superseded, not a
current gate failure. Installed native client4 startup/render evidence is in
IOS_PATCH_CLIENT4; controlled button/back/larger-text and address/provider/map
acceptance remain pending and are not inferred from source or browser checks.

Aggregate review covers all seven commit patches plus the owner-selected heading
change, with no tracked work/native/profile/key/device artifact or private-history
merge found. A limited redacted-pattern patch scan finds zero candidates, not a
full Gitleaks certification. Source sharing is permitted by the current owner
request; public production remains **NO-GO**. Actual push/remote CI outcomes and
the new heading's browser evidence are recorded in TEST_EVIDENCE, not assumed.

## Earlier audit baseline (ceedb6a)

Maintenance follow-up: this is the dated audit of `ceedb6a` before the approved
dependency repair. SDK58_SECURITY_MAINTENANCE records intentional package/lock
updates, fresh passing gates and unchanged implementation/history. Current
package blobs are no longer described as identical to team main. Original
findings/qualifications below retain their audit date; no new remote CI, phone
acceptance or sharing authority is inferred.

## Decision

**Contributor-preservation check: PASS with the qualifications below.**
No teammate-function regression introduced by the five current UI/integration
commits was found. This is not a claim that every historical implementation or
platform capability is unchanged.

**Recommendation for an immediate team-main push: HOLD.** Fresh validation
passes, but the existing dependency-security gate fails and online Expo
compatibility expects 12 patch updates. Repair/revalidate those gates and accept
the latest device navigation before sharing. This audit does not authorize
a push, merge, package update, native install or paid inference.

## Scope and identity verification

- Actual inspected app: `ceedb6ab0b4df9cf6c83ee27bbad6f6da683468e`,
  `codex/illustrated-functional-integration`.
- Fresh remote main:
  `28e0f3228e2754aae5c9b91ce42bf9ab60935549`; verified with
  `git ls-remote` and GitHub API. It is the exact merge base: **0 remote-only,
  5 local-only commits**.
- GitHub account-filtered commit queries identify **ITbes-dev: 1 commit** and
  **Rdotcom: 8 nonmerge commits plus PR #37's merge commit**. The eight
  nonmerge commits have Git author name `unknown`, but GitHub associates them
  with Rdotcom; no authorship is inferred just from a display name.
- All ten identifiers below are ancestors of the current app. GitHub's PR
  listing finds Rdotcom's merged #37 and no additional authored PR for these
  two accounts in the team repository at inspection time. Current team heads
  other than main are dependency-bot branches; no omitted human feature head
  was found. This does not audit unpublished changes in personal forks.
- Primary sources:
  [ITbes-dev SDK commit](https://github.com/roopeaal/KierratysAppi/commit/28e0f3228e2754aae5c9b91ce42bf9ab60935549),
  [Rdotcom PR #37](https://github.com/roopeaal/KierratysAppi/pull/37).

## Commit-by-commit trace

| Contributor / commit | Actual substantive change | Current trace / status |
| --- | --- | --- |
| ITbes-dev `28e0f32` | SDK 58, React 19.3/RN 0.88 dependency set, status-bar plugin, CI Doctor pin and QA readiness fixes | Package manifest, lockfile, workflows and SDK policy tests are byte-identical; status-bar plugin retained. App config differs only iOS build 2→3. QA readiness/held loading assertions remain with later route tests. |
| Rdotcom `0ece716` | FI/EN nearby manual-input placeholder | `mobile/localization/src/nearby.ts`; retained with subsequent Museokatu wording. |
| Rdotcom `fedaeab` | Contemporary project-state/roadmap/decision/next-action records | Historical state/roadmap entries retained; duplicate decision ID namespaced to D-UPSTREAM-2026-10-13. NEXT_ACTION correctly superseded by later work, not an app feature deletion. |
| Rdotcom `d42d865` | Address/postcode origin for nearby search, originally public Nominatim and an older one-point screen | Native address/postcode flow remains in `nearby.tsx`, `manual-location.ts` and `device-location.ts`. Provider/platform and one-point implementation were already reconciled on published main; see qualifications. |
| Rdotcom `63fa93f` | Safe asynchronous Home history-setting load, rejection handling and ignore-after-blur | `index.tsx:63` retains cancellation/catch and extends it to validated previews/stale clearing. Commit title describes more than its actual patch. |
| Rdotcom `a534f2c` | Sorting destination text variant title→heading | `components/sorting-result.tsx:39` still uses heading. Not a new recycling-point feature despite the broad commit title. |
| Rdotcom `fd90b2c` | Museokatu manual-address example | Exact final FI/EN placeholder retained. |
| Rdotcom `aee50db` | Postal code/subregion normalization and tests; exact-material helper | `point-address.ts:8`, tests and `shared/contracts/src/collection-points.ts:124` retained. The helper is not a user-facing filter; see below. |
| Rdotcom `bafacf2` | Finnish map-hint grammar plus formatting/comment cleanup | Correct karttamerkki wording retained; no extra behavior in that patch is missing. |
| Rdotcom `44cc1b2` | Merge of PR #37 | Original merge and eight parents remain in history via published integration `7ff234e`; no history rewrite. |

ITbes-dev's 15 changed paths: **7 byte-identical, 8 modified**. Modified
paths are five project/evidence documents (four append-only, NEXT_ACTION
superseded), app.json's build number and two QA runners retaining the contributed
fixes. No removed SDK/dependency/configuration implementation was found.

## What changed, and what did not

The five new commits change **83 paths with no deletions**: 52 app, 3
localization, 11 scripts/tests, 16 docs and AGENTS. Backend, shared, dependency
manifests, pnpm lockfile and workflows are byte-identical to current team main.
Private KeepItGreen `0142bb0` is not an ancestor: selected visual assets were
imported under explicit owner authority, not the private history/services.

Current main and inspected app have byte-identical scan/photo/result/storage/
data implementation, nearby adapters, point card, nearby localization,
postal/subregion tests and shared material helper. Nearby page changes are only
back fallback and field font/border/radius. Intended newer behavior is Home's
Identify gateway, three-method navigation, local guide search and validated
opt-in history previews; original services remain reachable.

### Qualifications that prevent “everything is literally unchanged”

1. **Original browser address lookup is absent.** PR #37 directly called public
   Nominatim on web/native. Already-published `7ff234e` replaced that before
   these five UI commits with bounded native OS geocoding. Current web displays
   a native-only explanation instead of collecting an unusable address.
   Native address/postcode controls remain; one-result ambiguity refusal,
   five-second UI deadline, cancellation/late-result protection and single-flight
   work are tested. This is a prior provider/platform change, not loss caused by
   the current appearance work. It is not full web/native equivalence.
2. **Exact-material filtering is code, not an available UI filter.**
   `nearestCollectionPointsAccepting` remains exported/tested, but there is no
   mobile/backend caller. It was already unconnected when introduced. Current
   point cards still show affirmative/excluded materials; do not present a
   selectable filter as implemented.
3. **Latest physical acceptance is not established here.** Code/fixture tests
   do not prove native address/postcode/provider/map handoff or the latest
   Identify navigation at native large text/VoiceOver. The existing profile's
   November 4, 20:28:39 Helsinki expiry concerns phone testing, not Git's
   ability to accept source.

## Fresh evidence and source-sharing gates

- Full `pnpm validate`: **410 unique cases (94 policy + 316 application)**,
  boundaries, format/lint/strict types, all builds and 16 web routes pass.
- Independent fresh mobile **148**, contracts **25**, location privacy **10**
  and SDK/development-client policy **10** cases pass. These overlap with full
  validation, not additional unique tests. Test wrappers ran the full mobile/
  contracts packages, not falsely narrow subsets.
- Online Expo `install --check` exits **1**, expecting 12 patch updates:
  Expo 58.0.21, camera 58.0.14, constants 58.0.14, dev-client 58.0.17,
  file-system 58.0.13, font 58.0.11, linking 58.0.15, location 58.0.20,
  router 58.0.28, splash 58.0.12, system-ui 58.0.7 and RN 0.88.1.
  Current contributed pins are unchanged; this is upstream expectation drift,
  not a visual-branch downgrade. An offline fallback is not counted as a pass.
- Fresh `pnpm security:audit` exits **1** with **12 high/critical advisory
  records**. The unchanged lockfile means they are not new dependencies added
  by the visual branch. No exception, severity downgrade or audit bypass.
- GitHub's actual current-main
  [CI run 40403403764](https://github.com/roopeaal/KierratysAppi/actions/runs/40403403764)
  failed **Dependency security policy** on October 26; its three part jobs
  succeeded. Separate Security run 40403403577 succeeded. Do not confuse that
  workflow with the failed dependency gate, or repeat an older Gitleaks
  annotation as a newly demonstrated current secret leak.

Full/audit logs remain ignored in
`work/contributor-audit-2026-10-29/{validate,security-audit}.log`.
The final documentation-inclusive rerun also passes in
`validate-post-audit-docs.log`; no tracked application files changed.
Pinned pnpm 11.16.0 was used; automatic pre-command dependency installation was
disabled for these diagnostic commands so the audit would not install/update
packages. Mandatory validation/security commands themselves were unchanged.
No fresh Doctor download or package/source correction was performed.

This run changed only audit/control/evidence documentation. No app/test/config/
dependency change, commit, merge, push, PR, settings change, native action,
real barcode/address/location/photo collection or paid inference. GitHub account
and run queries were GET-only; fetching tracking metadata did not merge source.
