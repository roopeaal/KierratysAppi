# Photo recognition — 2026-10-15

Status: locally implemented and validated; **one live adapter estimate passes,
physical acceptance remains incomplete**. This is not production/store readiness
or a finished physical-device feature claim. No GitHub push in this work unit.

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
ignored iOS project and restored locked pods, but native compilation/sign/install
is paused for host storage/owner cleanup approval. No new physical-camera
experiment was run; the existing profile's October 19,
12:49:04 Helsinki expiry is unchanged and not newly renewed.

Next local task: resolve the exact cache-cleanup approval/capacity in
`PHYSICAL_IOS_VALIDATION.md`, then build the purpose-matched client 2 without
more live requests during that build-only unit. Then obtain device acceptance with
the device user's explicit image-upload approval and bounded test scope.
Public photo release additionally needs durable authenticated billing limits,
hosting/processor/store declarations and adversarial/device evaluation; no new
lawyer-review requirement is imposed on the school-scope development task.
