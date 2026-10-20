# Acceptance criteria

## Consented photo recognition

1. Capture/preview never uploads automatically; recipient/retention/purpose are disclosed in FI/EN, followed by an explicit send action with versioned server-validated consent.
2. Only bounded JPEG data is accepted. Strip APP/COM metadata before device upload and again before the provider; remove the native camera's own temporary file. No remote URLs, arbitrary prompts, photo/estimate history, analytics, server persistence or offline upload queue.
3. AI identity is tentative; output contains observations only, bounded runtime schemas and inferred source/model/version/time. No model-supplied bins, source claims or verified status. Risky/non-packaging/uncertain cases cannot get ordinary packaging instructions.
4. Each eligible ordinary packaging part has an independent material choice with no default; raw AI material alone cannot authorize sorting. Require a separate unchecked shape/empty/non-hazardous/non-pressurized confirmation. Changing material or unchecking conditions clears old guidance; other parts remain independent. “I don't know” produces no sorting answer and offers local marking inspection. Unsupported/unknown raw observations cannot bypass existing eligibility via a manual choice. Original AI identity/material stays inferred and unchanged; the selected material is a local user observation. The existing rule engine supplies sourced/explained guidance; deposit remains unknown for bottles/cans and rule provenance/confidence are preserved.
5. Server-only credential and explicit development opt-in; production disabled. Enforce payload/response/token/deadline/IP/concurrency/process limits, safe cancellation/late-result/credit errors, no automatic retry or raw provider/request logging.
6. Purpose-matched native build 2 is required; old build 1/Expo Go cannot capture. Source/browser tests do not prove native capture, metadata/file cleanup, permissions/background recovery, accessibility, battery or real-product accuracy. One owner-authorized real adapter estimate now passes after funding; neither this synthetic-image request, a key nor local green tests establishes a working physical feature.

## Real-image recognition evidence

1. Record/inspect public test images, source/licence/attribution, hashes and expected identity before live calls; never pass reference answers, source record codes or image URLs as recognition hints.
2. Report transport/schema completion, named product family, generic type, bilingual wording and material correctness separately. A matching keyword or an HTTP 200 is not semantic/material accuracy or verified SKU/GTIN identity.
3. Retain wrong/partial outputs, manually inspect FI/EN disagreements and disclose sample size/selection, one-shot variability and missing physical material checks. Do not tune silently on the test set or generalize eight clean front images to real camera accuracy.
4. Use only explicitly authorized paid-call counts, no automatic retry/new model/account/budget reset, no private image or secret disclosure, and no paid inference in ordinary CI. Later live rechecks need their own bounded approval. The October 15 baseline does not satisfy material-readiness acceptance; PHOTO-003 remains high/open.

## Three-part source ownership

1. Tracked implementation has exactly three ownership roots: mobile, backend and shared; public entry points, responsibilities and commands are documented. Root integration tooling/docs remain common.
2. Mobile/backend do not import each other's code. Shared depends on neither consumer nor UI/server runtime; only declared public exports cross packages. Cycles, computed/private/cross-relative imports and compiler/symlink escapes fail the mandatory guard.
3. Each part has a scoped validation and CI job. Mobile scope excludes the server/database, backend scope excludes the mobile consumer, shared scope excludes both consumers. Full integration remains mandatory, especially for shared changes.
4. Existing POST v1 request/defaults/results, source/uncertainty, local-device data/identity, rules, migration and point data survive relocation; frozen contract plus existing consumer regressions pass. Do not promise mathematical zero side effects or hide intended shared coupling.
5. Source relocation does not imply GitHub publication/settings, fresh native signing/build/store readiness, a deployed database or a completed wider physical matrix. Separate worktrees/branches and implementation responsibilities are documented; approvals/settings require separate evidence.

## Core vertical slice

1. The user sees why the camera is useful before the OS prompt and can continue with manual entry.
2. A supported barcode is normalized and validated; malformed values never reach a provider.
3. Mobile calls the application API/service rather than Open Food Facts directly.
4. Provider payloads are runtime-validated and normalized with field-level provenance.
5. The sorting engine selects only matching, effective rules and explains the match.
6. Every component result shows destination, preparation, source, checked date, verification, and confidence in text—not color alone.
7. Missing product, missing packaging, ambiguity, offline mode, permission denial, timeout, and provider failure produce distinct recoverable states without fabricated advice.
8. Finnish and English strings render through localization keys; large text and screen-reader labels remain usable.
9. Domain, provider-contract, API-integration, and mobile-state tests pass.

## Material-code flow

1. The user enters one bounded visible packaging code; no image is captured or uploaded.
2. A recognized code shows canonical code, material name, jurisdiction, decision version, source, and checked date before guidance.
3. Sorting begins only after the user explicitly confirms that the recognized code appears on the package.
4. Conflicting, multiple, unknown, and undefined codes never produce guessed guidance; composites without a reviewed rule remain safe unknowns.
5. Recognition provenance and confidence remain distinct from user-confirmed observation and the Finnish sorting-rule provenance.

## Free-data and nearest-point addition

October 20 address-search integration additionally requires an explicit native
OS-map-service disclosure before submitting an address/postcode, with no direct
public-geocoder request or address cache/history/log. Bounds, ambiguity refusal,
single-flight native work, timeout/cancel/background cleanup and late-permission
protection must pass. Native geocoding cannot be forcibly cancelled after dispatch;
ignore late output and do not start another request until settlement. Manual
distances use a labelled estimated address origin, not GPS/±1 m precision. Retain
the five-point/material/source/map UI; web clearly says address search is native-only
and collects no address. Unit/browser evidence does not certify actual native OS
geocoding, Android permissions or map handoff.

October 11 school-scope addition supersedes the earlier runtime legal-banner
retention requirements below: Privacy contains factual recipients, retention,
local deletion and guidance limits, not unapproved terms or a review notice.
This is not a production-document approval.

The Home nearby action starts the search in one press, subject to OS permission;
a recent in-memory action is consumed once and cannot be replayed by a URL,
remount or background return. Direct URLs require a new manual action. Show up
to five real nearest records within 100 km with reported reception/exclusions
visible per record; missing/broad material tags never become specific packaging
or deposit acceptance. Preserve source IDs, v2 runtime validation, source/licence,
original dates, uncertainty and source-address/map destination. Filter neither
names nor material metadata to misrepresent distance order. Cached enrichment
must not advance the source retrieval date. Scheme changes during loading and
after hydration must update the existing shared theme without leaving stale
surfaces. Native permission/list/layout/map acceptance remains separate.

UX refinement acceptance: the map action is primary and fits the standard-size
390×844 browser viewport; technical metadata is expandable with announced state,
while uncertainty, source/licence/date and essential access/material cautions
remain visible. Optional native address lookup discloses public-point transfer
before the action and distinguishes an area estimate from a verified address.
Live theme changes must update text and surfaces together. Browser scaling and
synthetic GPS do not certify native Dynamic Type, VoiceOver or real geocoding.

1. The actual product database name, source link, licence, retrieval date and community uncertainty survive normal lookup, missing-packaging results and cache hits.
2. Universal routing may use only the fixed supported Open Facts origins with one sibling hop, bounded response/deadline and shared quota. Wrong GTIN/type, arbitrary redirect, timeout and quota failure never become a verified product or a false successful miss.
3. The entire bundled OSM database validates at the application boundary and retains licence, source IDs and timestamps. Old upstream data must not look fresh after a new download.
4. Location is requested only after an explicit action, never in the background; allow/deny/services-off/timeout/cancel/retry are recoverable. The watcher is removed and results clear on leaving/backgrounding. No GPS logging, persistence, analytics or API transmission.
5. The UI calls distance a straight-line estimate and discloses approximate fixes, incomplete coverage and unverified access/materials/hours. It never invents coordinates, open status or material suitability.
6. Source/unit/browser evidence is distinct from actual iPhone GPS/permission acceptance. The October 7 build and October 8 basic ready/denial/restoration checks do not establish latest native source/address/map-handoff UI acceptance or on-site distance accuracy; those remain pending.

## Release evidence

October 8 Home-recognition polish requires real labelled navigation controls,
decorative icons excluded from screen-reader focus, visible keyboard focus and
full FI/EN labels without font-scaling caps. Tiles wrap at narrow widths and
adapt to system font scale; wrapping must not orphan a letter at the tested
130% browser size. Scan/manual remain first, followed by nearby/guide/history.
No new slogan, fabricated preview or hidden contextual disclosure. Arithmetic
and browser checks do not establish physical Dynamic Type or VoiceOver.

October 8 copy cleanup requires no blanket privacy slogan on Home/history,
one clear loading/error explanation with actionable recovery, ordinary FI/EN
wording and explicit naming of history's disable-and-clear effect. Camera and
location purposes stay before their actions; material-code confirmation,
uncertainty, source metadata, unsent-feedback status, retention disclosures and
legal review markers must not be removed as cosmetic clutter. Browser copy
checks do not establish latest native text/layout acceptance.

The October 8 whole-app refinement requires consistent labelled back navigation,
a primary scan/manual path before secondary actions, explicit radio selections,
readable FI/EN fields without font-scaling caps, recoverable errors and localized
history dates/statuses. Product identity must not imply verified sorting. All
component/rule/provider attribution and legal-review markers remain. Isolated
browser fixtures must never enter runtime data; no demo labels or fabricated
points, metrics or maturity claims are added. Browser acceptance is separate
from latest native appearance, camera, Dynamic Type and VoiceOver checks.

The owner-selected display name is KeepItGreen in FI/EN visual and accessible UI, default/native locale configuration and current store drafts. The existing technical app identity and local data must survive the update. Source/browser checks do not establish installed launcher naming, renewed signing or cable-disconnected runtime; these need a rebuilt native artifact and device evidence.

The September visual refresh additionally requires scan/manual actions before secondary content, truthful empty-history status, native and web selected-radio semantics, and retention of every component's uncertainty and source evidence. Browser screenshots and source-policy/contrast checks do not satisfy the separate physical dark-mode, largest-text, camera or screen-reader acceptance below. Current results are recorded in `docs/final/design-refresh-evidence.md`.

- `pnpm validate` succeeds from a clean install.
- CI configuration mirrors local validation.
- Expo Doctor and `expo install --check` pass without exclusions or release-age-policy bypasses.
- Signed Android/iOS builds pass the physical camera, accessibility, large-text, reduced-motion, dark-mode, performance, battery and upgrade matrix.
- Production HTTPS API, shared quota controls, PostgreSQL migration/backup/restore, monitoring/alerts and incident contacts have operational evidence.
- Privacy/terms, OFF licensing/account use and Rinki/Palpa rule content have named approvals; store materials/forms are complete and validated.
- Physical-device, signed-build, store, and legal-owner gaps are explicitly blocked rather than claimed complete.
