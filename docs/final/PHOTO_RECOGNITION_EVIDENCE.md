# Photo recognition — 2026-10-15

Status: locally implemented and validated; **live adapter and actual native estimate
rendering observed, post-fix native guidance acceptance incomplete**. This is not production/store readiness
or a finished physical-device feature claim. No GitHub push in this work unit.

## Independent local material review

October 15 follow-up implements PHOTO-003's local mitigation: each eligible part
starts with no material selected. The user checks the physical package/marking,
chooses a material and separately confirms matching shape, empty/non-hazardous/
non-pressurized packaging. Guidance uses that local material, never mutates the
model observation or upgrades the identity. Changing choice/revoking confirmation
clears the old result; unknown gives no bin and navigates to local markings.
Original eligibility/deposit/rule-source/confidence guards are unchanged.

Recorded Nutella plastic-jar→glass-choice regression plus absent/unknown/invalid
and unsafe/non-packaging cases pass; focused photo 11/11, mobile 209 overlapping,
full 354 unique tests and three actual-Metro browser runners pass. FI/EN, part
isolation, source, no preselection, state reset, keyboard checked states and
dark/narrow/computed-130%-text screenshots inspected. Evidence in TEST_EVIDENCE.
No new live request/model/prompt/API/contract/rule/native/signing change. **This
does not fix or remeasure model accuracy: PHOTO-003 remains high/open, PHOTO-004
unchanged and latest native review/VoiceOver/file cleanup acceptance pending.**
The eight-call allowance remains exhausted; no push/publication.

## Real-image baseline: transport passes, material accuracy does not

Owner-approved current-key evaluation uses eight pinned public product photos,
the unchanged model/prompt and the real app endpoint, once each without retries.
All eight HTTP requests complete, but only four include the named product family;
generic responses omit four visible brands. Quaker's FI porridge wording is
imprecise compared with its EN cereal label. Nutella is named correctly but its
jar is inferred plastic, contradicting the glass reference and manufacturer
material description. No accuracy remediation or success claim is inferred from
green transport, schemas, keyword checks or 351 passing software tests.

Full results, protocol, attribution and hashes:
`docs/final/PHOTO_PRODUCT_EVALUATION.md`. PHOTO-003 high and PHOTO-004 medium remain
open; independent material correction/unknown recovery was the next local task
at this baseline and is now implemented as the separately validated mitigation above.
Current inferred status and explicit confirmation are retained, not bypassed.
No product behavior/model/prompt/rule/dependency/native change, private image,
other-app capture or GitHub push. The approved eight live calls are used up;
another capped empirical experiment needs fresh owner approval.

## Direct native inspection and paper confirmation

On the owner's request to test directly, the beta CoreDevice CLI's supported
screenshot command reads the existing app result without the expired XCTest
helper. An inferred result, indicative confidence, pinned model/version/time and
paper-packaging parts are visible. No new photograph or provider request; this
completes result-screen observation, not original-image accuracy or full native
capture/cleanup/confirmation acceptance.

The photo allowlist accidentally excluded paper even though the existing carton
rule already includes paper packaging. Two new shared/mobile tests fail before
and pass after adding paper to the allowlist. Explicit ordinary/empty/non-hazardous
part confirmation remains mandatory. Non-packaging paper, unknown/uncertain and
hazardous outputs remain blocked. No new rule, source review date, model/prompt,
wire fields, dependency or native build. Shared/mobile scopes and the expanded
browser paper-to-sourced-guidance flow pass; native post-fix confirmation remains
pending. The original estimate was not saved or injected as fixture/runtime data.
Full pinned validation passes **344 unique tests (62 policy + 282 application)**
and all checks/builds/14-route export; shared 84/mobile 206 overlap that count.
The browser paper-rule screenshot shows the original Rinki source, August 10
checked date, rule version, jurisdiction, explanation and non-verified 65%
observation confidence, not an AI-verified material or fresh source review.

Only the in-scope initial result screenshot remains ignored. Two later unrelated
app/OS-transition generated screenshots were removed after exact-file checks;
no phone contents changed. Do not capture more while other apps are in use.
Screenshot reading is now available; XCTest control/semantic inspection still
requires the separate helper credentials. No assistant paid request or push.

## Camera-opening defect and owner retry

The owner reported **Ota tuotekuva** did not work. The screen was reading a
removed `Constants.nativeBuildVersion` property; installed Expo Constants instead
exports native iOS `platform.ios.buildNumber`. Its permissive upstream types hid
the invalid property, and prior string-only compatibility tests missed the
actual wiring. Repaired without trusting mutable `expoConfig`, changing native
permissions/signing, installing a package or making an inference request.
Old/unknown builds and Expo Go still fail closed. Current Android native
constants expose no version code, so Android capture remains unavailable until
a trustworthy native version source/build is provided; not verified by iOS work.

New native-shape/wiring regressions and localized busy feedback pass **342 unique
full tests**, 204 overlapping mobile-scope tests and the expanded synthetic
browser flow, including pending-opening status. Opening screenshot inspected.
CoreDevice successfully relaunched existing signed build 2 from current Metro.
The owner then confirmed camera opening, capture and pressing send. The actual
estimate/error and confirmed guidance are still unobserved; no second upload is
needed just to report that outcome. Native file cleanup and broader acceptance
remain pending. No photo in chat, assistant paid call or GitHub push.

## Flow and separation

Home → Tunnista kuvasta → recipient/purpose/retention disclosure → user opens
camera → takes picture → local preview → explicit Send photo to OpenAI action →
tentative product/part estimates → separate confirmation per ordinary packaging
part → existing versioned Finnish sorting engine and its source/explanation.

Mobile owns the camera/UI/temporary state, backend owns the paid provider and
admission boundary, shared owns runtime contracts/JPEG metadata stripping. The
barcode endpoint/attribution/history, OSM directory, published rules and SQL
migration are unchanged. No fake product match or live result is seeded into
the app. Isolated QA estimates never enter runtime/provider data.

## Privacy and safety

- Approval to create an API key and a typed local-destination confirmation were
  obtained after the destination widget did not appear. The helper wrote only
  the ignored `backend/api/.env.local`, permission 0600. No key value is printed,
  committed or used in mobile; no account IDs appear in these docs. The selected
  non-expiring lifetime was not silently changed. Funds were not purchased by
  the agent; the owner later reported completing the billing step.
- JPEG only, 1,500,000 decoded bytes / 2,000,000 base64 characters maximum;
  frame dimensions ≤4096 per side and ≤16 million pixels. Client strips all
  APP/COM metadata, including EXIF/GPS, before upload; backend strips again.
  Marker validation is not a complete pixel decoder. Remote image URLs,
  filenames, arbitrary prompts and extra request fields are not accepted.
- Native capture's own temporary cache file is removed before preview/upload.
  Removal/processing failure stops the upload. No photo or estimate is added to
  local history/feedback/analytics/server storage or saved for an offline retry.
  Blur/background/visibility loss/cancel clear transient image/result state and
  invalidate late responses. OS-permission sheets alone do not upload anything.
- Versioned consent is required in the request. Fixed HTTPS OpenAI origin,
  no redirects/tools/conversations/file uploads/retries, `store:false`, pinned
  model, 1,200 output tokens, 15-second upstream and 20-second client deadlines.
  Upstream responses are bounded to 65,536 bytes. Refusal/malformed/unsafe or
  low-confidence results cannot become ordinary sorting guidance automatically.
- Development-only opt-in `PHOTO_AI_ENABLED=true` plus server key. Production
  and default configurations disable the provider. 3 requests/client/minute,
  2 in flight and 20 admitted calls/process lifetime; process restarts reset
  the count, so this is **not** a durable production billing/auth boundary.
- Model text is untrusted plain text, not rendered HTML, instructions or tools.
  Runtime schemas reject fake bins/sources/verified statuses. Positive hazard
  classification is not accepted as proof of safety: user confirmation is still
  required, with manual recovery for uncertainty. No deposit claim is inferred.
- Photo recipients and generally-30-day provider abuse-retention exceptions are
  disclosed in FI/EN and Privacy; neither ZDR, no training opt-in nor EU-only
  processing is asserted. See the dated research note for official sources.

## Automated evidence

Full pinned `pnpm validate` passes **340 tests (61 policy + 279 application)**,
boundary/format/lint/strict types, all package/API builds and 14-route web export.
This adds 33 tests to the previous 307: metadata/canonical base64/consent/schema
safety, provider refusal/deadline/no retry/credit exhaustion, API defaults/body/
IP/global/concurrent budgets, confirmation/provenance/deposit/unsafe behavior,
native-build compatibility and bilingual disclosures. No disabled tests/gates.

All scoped commands pass: mobile 203 / backend 159 / shared 83 tests, overlapping
dependency counts, not extra unique tests. External package snapshots/integrities
remain unchanged; Expo FileSystem 57.0.6 was already in the lockfile and old native
pods, now declared directly for deletion of this feature's own cache file.

Actual-Metro browser runners pass:

- `scripts/qa/photo-recognition-browser.cjs`: synthetic camera and isolated API
  fixtures; no upload before explicit confirmation, metadata, user-confirmed
  guidance, unsafe/uncertain blocking, cancellation/late response, visibility
  clearing, offline/disabled/quota recovery, FI/EN, dark and width checks.
- `scripts/qa/app-refinement-browser.cjs` and `nearby-ux-browser.cjs`: existing
  lookup/source/unknown/error/local-history/Privacy/nearby/offline/material flows,
  keyboard/touch, dark, narrow widths and synthetic large text still pass.

Inspected photo intro, preview and estimate light/dark screenshots under ignored
`work/photo-qa/`. Browser camera fixtures do not prove physical camera quality,
VoiceOver/Dynamic Type, battery, real-product accuracy or native file deletion.
The photo runner's inherited font-size override is only synthetic web layout,
not a physical text-scaling acceptance test. Earlier harness failures were CORS
fixture and synthetic video-frame/visibility setup, corrected without hiding
application assertions. Incidental import-only formatting was removed.

Ignored logs: `work/photo-validate-final.log`, `photo-mobile.log`,
`photo-backend.log`, `photo-shared.log`, `photo-browser-final.log`,
`photo-existing-app-browser.log`, `photo-existing-nearby-browser.log`.
The later owner-funded recheck also reran full pinned `pnpm validate`: exit 0,
same 340 tests/all validation and build gates; no runtime changes or extra
test cases. Ignored log: `work/photo-credit-restored-validate.log`. The browser
runners were not repeated for these documentation-only status updates.

The final web entry is `entry-a96e6704245fcc177fcaa35efaa0f5a6.js`, 3,850,138 bytes /
733,358 gzip; it remains above the existing warning budget, not a performance
pass. Static bundle inspection finds no server implementation/key-variable/API
endpoint markers; the dependency boundary guard passes. This is not an exhaustive
secret-scanner claim. Lockfile external package/snapshot sections and Git blob
hashes for rules, migration and the OSM directory match the baseline.

## Actual API and native limits

Explicit `scripts/qa/photo-live-smoke.cjs --live` uses a code-drawn illustration,
never a user photo. Two app-level smoke attempts returned 503; isolated provider
diagnostics identified schema rejection then exhausted API credit. A separate
non-billable model-access request returned 200. The live schema was simplified;
the later actual failure is 429 `credit_balance_exhausted` /
`insufficient_quota`. That code/type is now a distinct safe client result and
has adapter/browser regression coverage. These are the initial failed attempts,
not the latest result.

After the owner reported completing funding, the explicitly authorized recheck
ran `node --env-file=.env.local --import tsx ../../work/photo-diagnostic.mts`
from `backend/api`. Exactly **one** real request returned **HTTP 200**; the
unchanged adapter parsed the provider envelope, observation and full result
schemas and returned **`estimated`**. Same pinned model and approved server key;
input was a code-drawn 512×512 JPEG, not a user's photograph. Safe output was
only HTTP status, request count and result status. No estimate text, key,
provider raw body or payment details were logged. Safe summary is in ignored
`work/photo-credit-restored-2026-10-15.json`.

This establishes one live wire-schema/runtime-adapter success and resolves the
observed credit blocker. It does **not** prove the remaining balance, historic
payments, product-recognition accuracy, app HTTP-handler/browser/native flow,
camera quality or a safe sorting answer. No second live request, automatic
retry, agent purchase, billing/recharge change or model substitution occurred.

New camera-purpose text covers barcode/photo and separate upload approval in
app config plus native FI/EN localizations. iOS buildNumber / Android versionCode
advance to 2. Native build 1 and Expo Go are blocked from this new capture flow,
because JavaScript cannot update the old installed permission disclosure.
Barcode/manual paths remain available. The later native preflight generated the
ignored iOS project and restored locked pods. After explicitly approved scoped
cache cleanup, native Debug build 2, app/12-framework signatures, embedded
default/FI/EN camera purpose and profile/device binding pass. Initial install
fails at CoreDevice transport; after an observed restored connection, a second
bounded attempt, actual build-2 inventory and launch/later PID checks pass.
No new physical-camera experiment or native visual inspection passes; the
separate helper needs owner account/provisioning renewal. The existing profile's October 19,
12:49:04 Helsinki expiry is unchanged and not newly renewed.

Next local task: complete the requested owner-operated native photo smoke on
installed build 2, per `PHYSICAL_IOS_VALIDATION.md`, with explicit one-image
upload approval and bounded scope. No automatic capture/request or photograph
in chat. Broader native visual/permission/background/accessibility evidence
remains pending; automation helper renewal is a separate account action.
Public photo release additionally needs durable authenticated billing limits,
hosting/processor/store declarations and adversarial/device evaluation; no new
lawyer-review requirement is imposed on the school-scope development task.
