# Team-main integration and client10 — November10,2026

## Scope and source

Roope requests checking teammates' GitHub additions and adding them to the
current app, then explicitly requests installation on his phone. He separately
approves a barcode-lookup server on the current trusted LAN with cloud photo
recognition disabled. No GitHub push, paid inference, new key/account, cleanup,
uninstall/data reset or production publication is authorized.

Start from clean `aaabcdb` on `codex/illustrated-functional-integration` in the
integration worktree. Actual `origin` is `roopeaal/KierratysAppi`, default main;
`keepitgreen` is the separate private repository and is not fetched/imported.
Fresh fetch/ls-remote finds main `0eae2cf03f3b33d1918d4d6b06403dd37e008543`,
nine local-only and three remote-only commits, common base `0293ce5`. A later
fresh ls-remote still matches that target. GitHub's commit API independently
identifies the Overview author as **ITbes-dev / Besart Gashi**.

Incoming history, preserved as original ancestors by a normal local merge:

- [`7eb61d9`](https://github.com/roopeaal/KierratysAppi/commit/7eb61d9): one
  historical threat-model prose false-positive fingerprint in `.gitleaksignore`.
- [`24f4422`](https://github.com/roopeaal/KierratysAppi/commit/24f442217545126c7d42ad33503128e9813699a4),
  November5 at09:39UTC: persistent Overview, explicit recycling records,
  material-count percentages, recent entries, deletion/recovery and FI/EN.
- [`0eae2cf`](https://github.com/roopeaal/KierratysAppi/commit/0eae2cf03f3b33d1918d4d6b06403dd37e008543),
  November5 at10:27UTC: matching Expo58.0.23 patch set/lock/actual CLI schemas.

No other unmerged human feature branch is advertised by origin at this check;
open Dependabot branches are not automatically imported. This is not a claim
about inaccessible forks or proof that all future main changes are integrated.
No merge/public review/push is performed on GitHub.

## Preserved behavior and deliberate repairs

The real three-way code merge keeps illustrated Home/four tabs/Identify order,
local Vision/MobileCLIP/readiness/deadline/privacy, editable material-code query
hydration and separate Check+physical confirmation. Add Overview links in Home/
Settings, explicit mark+confirmation only on resolved sorting results, local
piece counts/material percentages/latest100 entries, and coordinated global
deletion. It neither uploads these records nor fabricates automatic recycling,
weights, environmental impact or verified material. Duplicate suppression is
bounded to retained100 recent IDs, not permanent deduplication.

Five project-control/evidence files conflict because both histories prepend
entries. Retain both histories; the latest current-state/decision/NEXT_ACTION
supersede old instructions without deleting prior failed experiments. No
backend/shared provider/rule/model decision is replaced by older mobile code.

Locally repair an incoming **medium acknowledgement-loss gap**: a storage write
may commit and then reject its acknowledgement. The old form allowed editing,
discarding that intent and counting it twice. New `save-intent.ts` reconciles
the exact ID/material/quantity/label/time by read after one explicit write;
unconfirmed state preserves the intent and locks editing until retry or explicit
confirmed clear. Clear resets the form/pending intent; read absence is not proof
of failed commit because recent history is bounded. Ten regressions and actual
browser commit→reject/blocked-read/edit-lock/retry/clear cases cover it.

Repair incoming CLI-test provenance: new CLI58.1.19 uses JSON Schema and accepts
caller-injected Zod. It does not declare Zod. Resolve the injected library from
the contracts package that declares it, test the actual schema/factory and
missing-argument failure. Do not rely on incidental pnpm hoisting or claim the
CLI owns Zod4. Retain the old narrowly scoped override/lock values as inert
historical compatibility; change comments, not resolution/security policy.

The exact immutable Gitleaks fingerprint refers to ordinary historical prose,
not a credential. Scanner workflow/rules are unchanged. Prior incoming scanner/
canary evidence is historical; no fresh full-history/canary pass is invented.

## Separate evidence lanes

Private receipt root: `work/team-main-integration-2026-11-09.mazlz9/`.

- Frozen installation passes the existing supply-chain/age policy for761 lock
  entries, no lock regeneration or unrequested dependency upgrade. Native
  versions match the published
  [Expo58.0.23 compatibility manifest](https://unpkg.com/expo@58.0.23/bundledNativeModules.json).
  [Expo's upgrade procedure](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)
  requires synchronizing native dependencies, not serving new JS to an old client.
- First full check passes **1158 unique tests (583 Node+575 application)**,
  all boundaries/format/lint/types/builds/**18 routes**. Mobile scope499
  overlaps, not added to1158. Existing environment: pinned pnpm11.16, Node26.4,
  CI/no-dotenv/no-telemetry, stable Xcode26.6 for Apple tools. Native-permission
  refinement adds one test; final full **1159 (584 Node+575 application)** and
  mobile499/18 routes also pass, exit0, without a failed validation/retry.
  Final logs `validate-final-2026-11-10.log` /
  `validate-mobile-final-2026-11-10.log`, SHA256
  `2069e5eefde2c7dcdb380380875b1a3f597dca31320ee21569259e39c808b1fe` /
  `f768257f694bc6da7d14a9a5e58fa4cf123a5c8db27a14eb84d296534ec14590`.
- Live `security:audit` passes zero high/critical; **14 moderate+5 low advisory
  records remain**. `expo install --check` says dependencies up to date.
  No new Doctor/remote-CI/secret-scanner/device acceptance is inferred.
- Overview and app-refinement browser suites pass first attempt; the extended
  local-vision suite first fails because a new assertion expects raw `05 PP`
  rather than the existing canonical `PP 5`. Domain implementation/test proves
  that canonical value; repair only the strict expected label, not the parser or
  assertion strength, then a fresh run passes. Original failure/screens remain.
  FI/EN Check→physical confirmation→separate record confirmation/cancel→exactly
  one record, persistence, acknowledgement loss, corruption, deletion, corrected
  cloud-photo materials, all shared styles and narrow/dark/large layouts pass.
  32 policy cases and six inspected screenshots supplement browser evidence.
  Receipt `browser-2026-11-10/browser-results.json` SHA256
  `7f60a066c8d56f649a5d8ace079c53e7e5eeef3017811ab5f49e64c2396fd854`.
- Root separately inspects the actual in-app-browser Overview: genuine zero
  records, no fake metrics, shared mint/navy typography and Settings selection.
  These are browser/mock evidence, not native camera/OCR/VoiceOver or accuracy.
  After all browser checks, stop only the owned loopback8111 Metro, retaining
  the approved LAN API; standalone native startup must not rely on that server.

## Matching native delivery — installed and owner-confirmed opening

Targeted phone inventory before update confirms0.1.0/build4. Preserve complete
generated iOS tree and unsigned9 app by APFS clones before native changes; native
lock copies match. Source/app ID/version/Android2 remain; iOS source becomes10.
Use incremental pod synchronization, not destructive clean prebuild, preserving
the existing scene lifecycle. Initial pod invocation from workspace root cannot
resolve Expo; retain its log, then run from actual iOS directory. Installed lock
equals Manifest, with Expo23/core30/router30/screens4.30.1/React-Core0.88.1.

Build **Release configuration with developer signing**, embedded JS and current
explicit LAN API origin, stable Xcode26.6/single job/index store disabled. This
is an owner development installation, not production/App Store distribution.
No server key is present/read; `.env` loading is disabled. Source/default/FI/EN
local-network purpose now describes the actual development product server,
not Expo's old launcher-discovery text. Camera/foreground-only location and
independent material confirmation remain unchanged.

Actual **BUILD SUCCEEDED**, same version0.1.0/build10 and unchanged bundle ID.
Strict app/all11 embedded-framework signatures,17 native pins/equal locks,
default/FI/EN camera/location/LAN purposes, app/local privacy and all13 model
resources/four complete notices under the precise metadata comparison pass.
Embedded JavaScript is5,428,413bytes;
whole bundle75,468,195bytes, model resources23,378,043bytes. No QA hooks or
rejected learned heads are present. Independent public-certificate comparison
also binds the signing leaf to the embedded profile, without private-key access.

Two overly literal checker assumptions fail first and are retained: Release V4
uses ARM64 SmallString instructions; timeout spelling is assembled at runtime.
All3 source/object/linkage and8 symbol checks plus scoped instruction decoding
prove current code. The CoreML compiler also permutes3 informational map records
and JSON key order; root independently proves all other bytes/values identical
before install. The later aggregate checker passes the same artifact with33
synthetic proof cases, not a changed model or arbitrary replacement hash.
See `docs/research/coreml-release-artifact-2026-11-10.md` for the precise proof
and primary schema. Optional certificate extraction initially uses the wrong
argument spelling; corrected standard syntax passes, no signing/app mutation.

Actual profile is newly created November10 at10:06:45UTC, expires **November17
at10:06:45UTC /17.11.2026 klo12.06.45 Helsinki**. This is a seven-day developer
profile, not year-end availability or App Store signing. Replacement install
and targeted inventory confirm0.1.0/build10 without uninstall/reset. Initial
launch is refused by iOS security; Roope personally trusts/verifies the developer
and explicitly confirms the app opens. A later actual terminate/relaunch with
Overview payload succeeds, and a subsequent exact-PID query still finds that
process. Metro8111 is stopped; startup uses the embedded bundle, not packager.

The UI-render confirmation is owner's report; a successful payload/retained PID
alone is not an independent screenshot/Overview interaction/persistence/camera/
airplane-mode/VoiceOver/energy pass. An optional automation tool initially cannot
resolve its supplied device selector; do not turn that into an app/device failure.
No fake phone record, history/container inspection, data wipe, photo or location
capture/upload is used. No cleanup or GitHub publication.

Key private receipts: `client10-artifact-verification-final.json` /
`metadata-permutation-root-proof.json` / `signing-certificate-binding-repaired.json`
and `install-client10.json` / `installed-after-client10.json` /
`launch-client10-trusted-overview.json` / `native-process-client10.json`.
Actual binary SHA256:
`3f680110d3cb272b06b8f7e1be80ad440f4da9271fcc73e8117dc6c26a99c2cd`;
embedded JS:
`7407c3ecaf467d63997bdde92cfab19b805785bbe29b16f68074c3daff1db726`.

The approved API listens only on the current LAN address:3003, logger silent,
cloud recognition false and server key explicitly absent from its environment.
Correct `/v1/health` and `/v1/recycling/photo-capabilities` return ok/disabled;
two initial guessed paths return404, not a provider outage. One later free real
public-GTIN lookup returns200/resolved, correct GTIN binding, Open Food Facts
provenance and2 packaging components; this does not independently test the
phone's LAN permission/reachability. No GPS/photo upload or paid call. Local recognition,
guide and Overview do not require that server; remote product lookup does.

LV-001/PHOTO-003/004, independent human references, physical camera/permissions/
offline/latency/energy/Android and operations/store/privacy/content release gates
remain. No failed learned head is bundled or retrained in this integration.
