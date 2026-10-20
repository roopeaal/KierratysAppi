# Physical iOS validation

Status date: 2026-10-20

## Trust completed; actual same-app startup verified — 2026-10-20

Source `419f572`, application source unchanged since `fc433bc`. No further build,
install, reset, security bypass, account/dependency/native change or cleanup.

| Check | Actual result |
| --- | --- |
| Changed owner prerequisite | Roope reports **luotettu** after the requested iPhone Trust/Verify step |
| Fresh physical launch | Beta CoreDevice `device process launch --activate --payload-url` of the same installed bundle with current Metro URL exits 0, JSON outcome success |
| Process persistence | Two subsequent targeted process queries each find the exact PID returned by launch, not just a successful install/host response |
| Rendered Home | One native screenshot visually shows current FI Home: scan/manual/photo, plural nearby, guide/history and Privacy controls. Unrelated OS picture-in-picture partly occludes header; not complete visual/interaction acceptance |
| Screen-data minimization | Removed only that newly generated mixed-content PNG after exact regular-file/realpath checks. No original phone content touched, no mixed screenshot retained, no further capture. Capture-command metadata and bounded observation receipt remain ignored |
| Profile | Unchanged new actual expiry **October 27 15:27:13 UTC / 17:27:13 Helsinki (UTC+2)**. No recurring renewal |
| Source validation | Fresh pinned full `pnpm validate` exits 0, 354 unique tests (69 policy + 285 application), boundaries/format/lint/strict types/package/API builds and 14 routes. No behavior change or new test cases |
| Not established | Retained history, current material-review interaction/camera/VoiceOver/dark/large-text/performance, cable-disconnected/Mac-independent use or production readiness. No photo/GPS acquisition or paid inference. Debug needs Mac Metro/API/LAN |

EB-IOS-TRUST-01 / OA-IOS-TRUST-01 are resolved for this startup only; earlier
rejection remains below. Evidence: ignored `work/ios-renewal-2026-10-20.xwM2qA/`
`launch-after-trust.{json,log}`, `processes-after-trust.json`,
`processes-trusted-later.json`, `screenshot-after-trust.json`,
`trusted-launch-verification.json`, `validate-trusted-launch.log` and
post-documentation `validate-trusted-final.log`.
No helper renewal, GitHub push or production GO. Product provisioning works;
the older helper account failure is historical, not newly reproduced.

## New profile and installation verified; first launch rejected — 2026-10-20

Source `f31c476` (application source unchanged since `fc433bc`), same app ID/
version 0.1.0/build 2/Personal Team, unchanged generated native permissions/locks.

| Check | Actual result |
| --- | --- |
| Approved cleanup | Exactly the three obsolete DeviceSupport roots, 13,744 files/12,558 directories/zero links, removed after fresh path/type/open-file checks. No traversal/force/retry. Current 24A5430a support/source/app/live build/rollback/simulator/phone data excluded. Receipt has 26,302 removed objects; immediate available bytes 213,450,752 → 19,452,891,136. Removed copies are not in Trash; old debug support may need reacquisition |
| Account/device | Existing Apple Account now available; same previously provisioned phone connected/DDI-ready/Developer Mode enabled. Generic build reaches Apple but reports no device. Stable-Xcode destinations independently lists this phone as eligible |
| Actual native build | Same stable Xcode 26.6/iOS 26.5, verified physical destination, allowProvisioningUpdates + documented allowProvisioningDeviceRegistration, same ID/team/locked pods/two jobs. Exit 0 / BUILD SUCCEEDED |
| Actual profile | Created **2026-10-20 15:27:13 UTC**, expires **2026-10-27 15:27:13 UTC / 17:27:13 Europe/Helsinki**. Expiry is UTC+2 after DST change; no year-end/distribution or recurring-renewal claim |
| Signature/binding/purpose | Strict recursive app and all 12 frameworks pass. App/profile team and application entitlements match; expected phone is included; version/build/SDK match; default and compiled FI/EN camera purpose match config. Foreground location only, no Always/background location |
| Replacement install/inventory | CoreDevice outcome success; targeted exact bundle ID shows KeepItGreen 0.1.0/build 2, developer-built. No uninstall/reset/private-data inspection or retention guarantee |
| First launch | **Rejected**: CoreDevice 10002 → FBS Security names signature/entitlement/profile-not-trusted alternatives. Local integrity/binding pass does not establish the exact phone-side cause. Owner Trust/Verify check requested; no unchanged retry or bypass |
| Host runtime | Correct-worktree API/Metro listener working directories; localhost/LAN health/capabilities/iOS manifest and its exact 11,744,969-byte asset pass. Expected API origin/current material-review keys present. This is not phone startup or performance evidence |
| Repository | After cleanup scoped mobile 209 overlapping/full 354 unique tests and all gates/builds/14 web routes pass. Earlier ENOSPC and generic/No Accounts failures remain separately recorded |
| Not established | Rendered Home/retained history/current camera/material-review/VoiceOver/dark/large-text/performance/untethered or Mac-independent use. No new photo/GPS/paid inference, helper renewal or GitHub push |

Ignored evidence under `work/ios-renewal-2026-10-20.xwM2qA/`:
`device-support-{inventory,cleanup}.json`, `build-device{.log,-result.json}`,
`renewed-native-verification.json`, `renewed-profile.plist`, `install.json`,
`installed-app.json`, `launch.{json,log}`, `runtime-verification.json`,
`mobile-after-cleanup.log`, `validate-after-cleanup.log` and old signed recovery.
No raw profile/device ID/app binary enters Git. EB-IOS-TRUST-01 and OWNER_ACTIONS
define the exact owner and engineering resume steps.

## Renewal requested — not yet signed or installed, 2026-10-20

Source `fc433bc`, unchanged ID/version 0.1.0/build 2, matched Podfile.lock/Pods
manifest. Actual old profile confirms October 19 09:49:04 UTC / 12:49:04 Helsinki
expiry. Strict old-app signature and APFS recovery copy pass; embedded profile
stays byte-identical after the failed build. Expired recovery is not a launch pass.

Stable Xcode 26.6/iOS 26.5, generic iOS destination, current team, two jobs and
automatic provisioning fail exit 65: No Accounts/no matching development profile,
zero compile/sign steps. GUI independently initially has no account; its existing
Apple login sheet is opened, with credentials/verification left to Roope. Follow-up
GUI now shows the existing account and Personal Team; CoreDevice observes the
owner-connected iPhone, iOS 27.0/24A5430a. This is changed prerequisite evidence,
not proof that provisioning succeeds; no new build retry until storage is sufficient.

Full pinned 354-test validation passes first. Later mobile-scope validation fails
ENOSPC creating Vitest temp output; available space is only about 140–202 MiB.
Owner asks for a storage inventory, not deletion. Three obsolete DeviceSupport
versions total about 17.8 GiB measured; exact-target removal approval is pending.
Current 24A5430a support, source/live build, rollback, simulators and phone data
are excluded. No profile/cache deletion or new profile/expiry/install/launch/UI/
retention pass; no additional paid inference, SDK/account purchase or GitHub push.
Logs/backup/inspection helper: ignored `work/ios-renewal-2026-10-20.xwM2qA/`.
Resume procedure/owners: EB-IOS-RENEW-01 and OWNER_ACTIONS.

## Latest material-choice controls — native acceptance pending

JS-only follow-up adds independent unselected per-part material, separate
conditions confirmation and unknown-to-local-markings recovery. Focused/unit,
354-test full validation and three browser runners pass, not a new native UI
pass. No new screenshot, capture/upload, paid inference, native build/signing/
installation or profile renewal in this unit. Existing build 2/October 19 expiry
remains. Material-choice/unknown/safety-reset/source-guidance, native large text,
VoiceOver and file cleanup still need actual device evidence. Roope operates
physical-package confirmation; engineering may inspect only stable in-scope app
screens. A new assistant inference needs separate capped approval; do not replay
synthetic product responses into the phone or claim inferred material verified.

## Existing native estimate screen inspected — 2026-10-15

Beta CoreDevice help exposes the supported `device capture screenshot` command.
It succeeds without the expired XCTest helper. The actual result screenshot
shows an OpenAI-inferred estimate, indicative confidence, expected pinned model/
photo version/time and two paper-packaging parts. Combined with the owner's
earlier capture/send report, this observes response rendering on the real device;
original-photo accuracy, native file cleanup and full native guidance are not
verified. No assistant photograph/upload/inference or new native installation.

The screen reveals a local paper-confirmation omission; existing carton policy
already covers paper packaging. Repaired with two red-before/green-after tests
and browser explicit-confirmation/source/non-packaging/unsafe checks. Native
post-fix confirmation remains pending: subsequent captures were another-app/
OS-transition views, not stable app evidence. Removed only those two generated
copies after exact file validation. Activation succeeds with the same PID, but
transition imagery is not proof of background clearing or updated native layout.
No further captures while the owner uses other apps. No original phone data
changed; in-scope screenshot stays ignored in
`work/photo-native-test-2026-10-15.W1gGnB/current-screen.png`.

EB-IOS-UI-01 remains for XCTest interactions/semantic trees only, not all screen
reading. Native signing/profile/build are unchanged; no credential/account action,
security bypass, new source date or GitHub push. Repository/browser test evidence
is recorded in `TEST_EVIDENCE.md`, separately from this physical observation.

## Camera-opening guard repair and owner-reported retry — 2026-10-15

Owner reports **Ota tuotekuva** fails before capture. Source inspection finds
removed `Constants.nativeBuildVersion` access falsely blocking installed build 2;
the current iOS service provides immutable `platform.ios.buildNumber` instead.
Repaired the JS guard, retaining old/unknown/Expo Go denial and avoiding mutable
manifest fallback. No native rebuild, reinstall, signing renewal or permission
change; current profile still expires October 19 at 12:49:04 Helsinki.

Full 342-test validation, 204-test mobile scope and expanded synthetic photo
browser runner pass. CoreDevice relaunch of the existing app with the current
Metro URL succeeds. **Owner confirms camera opens, photo taken and send pressed.**
This is reported physical progress, not an independently observed recognition
result, native image cleanup or sorting-guidance pass. Actual result/error is
awaiting the owner's text; no additional image/upload requested. Native helper
remains unavailable as below; a read-only Metro debugger connection also rejects
with HTTP 401 and was not bypassed. No native screen/semantic tree obtained,
photo in chat, assistant billable request or GitHub push.

Ignored evidence: `work/photo-camera-entry-native-launch.{json,log}`, validation
and browser logs referenced in `TEST_EVIDENCE.md`.

## Client 2 build/signatures/install/launch pass; photo acceptance pending — 2026-10-15

Source `6b855f6`, unchanged application source/dependencies and independent team
branch. Owner explicitly approved the exact cache-copy cleanup and had already
authorized the updated installation. **Build/signatures, installed build 2 and
launch are verified; rendered UI/camera and local-data retention are not.**

| Check | Observed result |
| --- | --- |
| Scoped cleanup | Fresh exact path/type/child/creation-date inventory: ten previously listed cache directories, 8,826 files, nine internal symlinks not followed, 1,000,746,369 logical bytes. Foreground postorder unlink/rmdir without force/retries succeeds; installed pod lock and manifest unchanged. No program/source/app-product/phone data removal |
| Immediate space measurement | Available bytes 1,035,653,120 → 2,064,412,672. Later free-space readings vary and are not all credited to this cleanup. Removed cache copies can be downloaded again, not recovered from Trash |
| Rollback preservation | APFS-cloned current cached build 1 to ignored `rollback-build-1.app`; strict recursive signature and expected team/app entitlements pass before compiling |
| Native build | Xcode 26.6 `17F113`, iOS 26.5 SDK, same app/team, matched locked pods, Debug generic iOS destination, cached DerivedData, `-jobs 2`, `COMPILER_INDEX_STORE_ENABLE=NO`, automatic existing-team signing: exit 0 and `BUILD SUCCEEDED` |
| Built identity/purpose | Actual Info.plist version 0.1.0/build 2, unchanged bundle ID. Default and compiled FI/EN camera-purpose resources match source. Foreground location purpose retained; no Always purpose/background location |
| Signing/binding | Strict recursive app plus all 12 embedded frameworks pass. Embedded profile and app team/application entitlements match; intended physical device is included |
| Profile lifetime | Existing profile reused: created 2026-10-12 09:49:04 UTC; expires **2026-10-19 09:49:04 UTC / 12:49:04 Helsinki**. Not a renewal/distribution or year-end profile |
| Replacement install | Initial bounded beta CoreDevice attempt fails: 4000 → invalidated connection → network 54/reset. A later fresh query observes connected/DDI-ready state; second bounded attempt succeeds. Targeted app inventory confirms version 0.1.0/build 2. No uninstall/reset; private contents/retention not inspected |
| Physical launch/process | Explicit current Metro dev-client launch succeeds; later exact-PID query finds the app. Failed helper sessions were closed and the installed app relaunched; final launch/another PID-specific query pass. This is not rendered Home/camera proof |
| Host runtime | LAN API health/photo capabilities/Metro status, iOS manifest and exact 11,734,094-byte launch asset return 200; current API origin/photo contract present. No photo inference request; host checks are not physical startup |
| Repository checks | Fresh scoped mobile validation passes 203 overlapping tests; full pinned validation passes **340 unique tests (61 policy + 279 application)**, format/lint/types/boundaries, API/package builds, 14 web routes |

Cleanup helper/dry run/receipt, native build log, native verification summary,
profile/rollback metadata, both install attempts, targeted build-2 inventory,
launch/process and post-build validation logs remain ignored under
`work/ios-photo-2026-10-15.CmF8TO/`. The build-only verification receipt retains
`physicalInstallVerified:false`; the separate `install-verification.json` proves
installation/launch/process, with UI/camera flags still false. No raw secret, device ID/profile/binary,
photo or private app contents are committed. No extra billable AI request,
billing/account change, global Xcode switch, GitHub push or production release.

### Native inspection limitation and next acceptance

The first current agent-device session fails on default helper provisioning
(`No Accounts`/missing profiles). The owner-specific helper ID was discovered
from existing installed/cache metadata, not invented. A scoped session reuses
an expired September 4 helper profile and cannot install the runner. Other
cached owner profiles are also expired, including the newer October 14 fixture.
An explicit stable-Xcode build-for-testing with existing team/helper IDs fails
`No Accounts`/missing profiles; log: `helper-rebuild.log`. No tool source/global
Xcode setting/account was changed, no authentication bypass or broader cache
removal. This is separate from the verified product app and its October 19
profile. Failed automation sessions were closed; no actual native screenshot
or readable semantic tree was obtained, so no visual/VoiceOver/camera pass.

Roope can reauthorize the existing Apple Account in Xcode Settings → Accounts
for helper renewal if automated inspection is needed. Manual native testing
does not depend on that helper. One owner-operated test was requested: open
photo identification, capture an empty ordinary carton without people/personal
details, explicitly approve one upload, and report the actual estimate/error.
Do not send photos into chat or upload automatically. Source-backed guidance
still needs per-part confirmation. Background/file deletion/permission recovery,
accessibility, real-product accuracy and broader matrix remain separate.

## Earlier client 2 generation and storage preflight — 2026-10-15

Source `93d3149`, independent team branch; owner authorized the new installation.
**No new native compile/sign/install or camera/visual acceptance yet.** Existing
phone and cached app remain version 0.1.0/build 1. Nothing pushed to GitHub.

- Xcode 26.6 `17F113`, iOS 26.5 SDK; no global Xcode selection change. Beta
  CoreDevice confirms the owner's paired wired iPhone with Developer Mode and
  DDI available after the owner connected/unlocked it. A targeted app inventory
  confirms the unchanged bundle ID and build 1; no app data was read or deleted.
- `pnpm exec expo prebuild --platform ios --no-install` from `mobile/app`
  regenerated the ignored iOS tree, clearing its old generated pods even without
  explicit `--clean`. No source/phone contents were removed. Reverted its two
  incidental tracked package-script edits. Generated Info.plist has version
  0.1.0/build 2 and the new camera purpose; generated FI/EN InfoPlist.strings
  match the explicitly approved upload purpose. SDK/build-settings inspection
  resolves the same app target/ID and cached product directory, not a build pass.
- Saved Podfile.lock was restored. First `pod install --deployment
  --no-repo-update` failed with `No space left on device` while extracting
  Hermes. After installer temporary files were released, one retry succeeded:
  113 declared dependencies/112 installed pods, native lock byte-identical to
  the saved file and equal to Pods/Manifest.lock. No version/repository update.
  The existing app and older rollback artifact still pass strict recursive
  signature checks; this does not establish an unexpired rollback profile.
- Host free space remained about **977 MiB**. Do not start a large native build
  or claim signing/install passed. API health/photo capabilities and Metro
  status return 200; no photo request was made in this build-preflight unit.
- Fresh scoped `pnpm validate:mobile` passes 203 overlapping dependency tests;
  full pinned `pnpm validate` exits 0 with 340 unique tests (61 policy + 279
  application), boundaries/format/lint/strict types, package/API builds and 14
  web routes. No new runtime changes/test cases/browser/native visual claims.

### Pending cleanup approval and exact limits

At this earlier preflight, owner approval was pending. It was later explicitly
received and the scoped cleanup completed, as recorded above.
Only the following ten newly created directory targets were enumerated under
`/Users/roopeaaltonen/Library/Caches/CocoaPods/Pods/External/`:

- `ExpoCamera`
- `ExpoCameraBarcodeScanning`
- `ExpoFileSystem`
- `ExpoFont`
- `ExpoLocation`
- `ExpoModulesCore`
- `ExpoModulesWorklets`
- `React-Core-prebuilt`
- `ReactNativeDependencies`
- `hermes-engine`

These are this attempt's reloadable cache copies, not `mobile/app/ios/Pods`,
source, installed applications or cached signed app products. Creation metadata
matches this run. Dry run: ten directory targets, 8,826 regular files, about
1,000,746,369 logical bytes; nine internal framework symlinks were detected and
not traversed. All nine lexical link destinations remain within this cache
root. At that initial preflight no cleanup had occurred. Metadata can change: revalidate exact paths,
types, count, children and links in the same foreground process after approval;
do not follow symlinks. Stop on any mismatch/locked-file/deletion failure, with
no stronger or broader retry. Cache contents can be downloaded again using the
locked dependencies. Free-space gain must be measured; it may not alone cover
the eventual native build. The owner can instead free space independently.

Ignored evidence: `work/ios-photo-2026-10-15.CmF8TO/` contains prebuild, failed and
successful pod logs; saved original lock/project/plist; filtered device/app
metadata; build settings; and scoped/full validation logs. Device identifiers,
profiles, binaries and local metadata are not committed. No production release,
signing renewal, physical photo upload or extra billable request is inferred.

## Source partition smoke — 2026-10-12

After relocation into mobile/backend/shared, restarted owned API/Metro from the
new paths. Existing installed client accepts dev-client launch/reload and shows
actual current Finnish Home; exact **Lähimmät pisteet** visible-button assertion
and ignored 1284×2778 `work/three-part-iphone-home.png` visual inspection pass.
No GPS/camera request or result capture. API/iOS manifest/exact JS asset HTTP 200;
bundle 11,605,710 bytes with current LAN API/nearby code. No new native build,
sign/install/uninstall or wider flow acceptance is inferred. Profile remains
October 19, 12:49:04 Helsinki. New generation/build commands use `mobile/app`;
the ignored local legacy-path symlink is not required by clean checkout/CI.
Complete local tests/scoping: `PROJECT_PARTITION_EVIDENCE.md`. No push.

## Current owner-requested renewal — 2026-10-12

Source `4e79895` on the independent team-baseline branch. This renewal does not
import newer KeepItGreen code/assets or authorize a push/release. Preserved the
existing ID, Personal Team, version 0.1.0/build 1 and native dependencies.

| Check | Result and scope |
| --- | --- |
| Native consistency/build | Pass: Podfile.lock equals Pods/Manifest.lock; Xcode 26.6 `17F113`, iOS 26.5 SDK, Debug generic iOS destination, two build jobs, cached DerivedData and automatic existing-team provisioning produce `BUILD SUCCEEDED` |
| Actual profile renewal | Pass: created 2026-10-12 09:49:04 UTC; expires **2026-10-19 09:49:04 UTC / 12:49:04 Europe/Helsinki**. This is seven-day development provisioning, not a distribution or year-end profile |
| App/framework signatures | Pass: strict recursive app plus all 12 embedded-framework checks; expected device is included; app/profile/team entitlements match |
| Native privacy configuration | Pass: foreground location purpose present, no Always purpose or background modes |
| Replacement installation | Pass: beta CoreDevice install outcome success for the unchanged bundle; no uninstall/reset. Strictly verified previous app retained as rollback, exactly one validated old cached profile moved to a recoverable backup; no revocation or broad cache deletion |
| Physical startup | Pass: CoreDevice accepts launch using current dev-client URL; later exact-PID query still finds the app; no owner trust/account prompt was needed |
| Actual latest Finnish Home | Pass: live XCTest-assisted tree shows scan/manual/plural nearby/guide/history/Privacy; named visible nearby-button assertion passes. Screenshot at 1284×2778 inspected: current baseline icons/tiles/material subtitle render, with development/tool overlays still visible |
| Local-content retention | Not verified: data-container path changes; no private contents inspected or explicitly deleted. Path comparison alone proves neither retention nor loss |
| Runtime host | Pass: restarted API 3003/Metro 8093; LAN health/status/iOS manifest/exact launch asset are healthy. JS bundle HTTP 200, 11,602,981 bytes, latest nearby keys present. This is still a Metro/API-dependent Debug client |
| Latest nearby/material/map/Privacy contents, dark/large text | Not run in this renewal. No GPS or camera acquisition. Home/control presence does not establish these flows, native VoiceOver, accuracy, battery, cable-disconnected or Mac-independent operation |
| Local validation | Pass: pinned `pnpm validate`, 293 tests (47 policy + 246 application), formatting/lint/types, package/API builds and 13-route web export; no new release/Doctor/security-audit/remote-CI claim |

Ignored local evidence under `work/ios-renewal-2026-10-12/`: build/validation logs,
install/inventory/launch/PID metadata, `iphone-home.png`, rollback app and old
profile. Device identifiers/profiles/binaries/screenshots are not committed.
Temporary bootstrap inventory is local OS-temp diagnostics, not analytics.
Keep recovery artifacts through the next successful renewal; remove only exact
validated targets during separately authorized cleanup. No secrets were printed.

Tooling corrections: profile dates/data prevent whole-plist JSON conversion, so
extract selected metadata; parse entitlement JSON rather than dotted-key paths.
CoreDevice executable is a URL, not a string for `CONTAINS`, so use the exact
launched PID predicate. Agent-device resolves the physical device by its observed
name and rejects simulator-only runtime-hint flags; plain physical `open` succeeds
after CoreDevice has launched the dev-client URL. These were diagnostic/tooling
errors, not app failures or reasons to reinstall again.

Next manual renewal must occur before October 19 at 12:49 Helsinki; no recurring
automation has been created. Earlier October 13 and September profile statements
below are historical, not the current installed expiry. Remaining native flow
acceptance and public production gates remain separate.

## Earlier physical evidence — October 8 and before

Latest permission-cycle delta: **DENIAL AND RESTORATION PASS**. Roope changes app-specific permission to Never; native search exposes the complete Finnish denial explanation and settings control. Closing returns to Home. After the owner restores While Using, search reaches the ready-only refresh button with wait exit 0 and explicit visibility pass. No fresh consent-dialog, exact result-text or physical accuracy claim. Earlier pending-denial statements below are historical.

Status: **HOME, NEARBY INTRODUCTION, REPEATED LOCATION READY STATE AND SAME-PROCESS BACKGROUND CLEARING PASS. Exact result text, fresh consent, denial/retry, physical accuracy and native product-source acceptance remain pending. Historical September runtime passes do not certify those flows.**

## Latest recovery — 2026-10-08

Restored stopped Mac API/Metro and relaunched the unchanged installed application.
Two searches reach the ready-only refresh control (exact button selector, wait exit 0).
Home/background then ordinary foreground launch restores the search control while
application PID 7054 remains unchanged. This verifies ready-state clearing, not
a fresh consent-dialog or location accuracy test. Exact explanatory-text selectors
were ambiguous or unmatched and therefore are not recorded as passed. No location
result screenshot, coordinates, nearest-point address or exact distance retained.
Earlier dated failures below remain historical evidence. No product reinstall or push.

This report is deliberately separate from simulator, web and generated-configuration evidence. No physical-device row may become Pass without observing the named build on the recorded iPhone.

## Owner-requested retry — 2026-10-07, 22:07 Finland time

No app/helper rebuild or reinstall in this retry. Existing helper signature,
device-unlocked state and API/Metro health pass. A fresh named session reaches
`AGENT_DEVICE_RUNNER_LISTENER_READY` and returns Home in about 14 seconds. This
resolves the earlier startup-transport failure for this attempt; its intermittent
cause is not proven to be fixed generally.

| Physical scenario | Result | Evidence/limit |
| --- | --- | --- |
| Current Finnish Home | Pass | Live tree exposes scan/manual/nearby/guide/history/privacy controls; screenshot visibly renders the team-baseline design |
| Home → nearby introduction | Pass | Semantic tap changes route; one-shot local-only explanation, search button, coverage/material/access/hours caution, 6.10.2026 data date and OSM/ODbL attribution are present |
| Default-size visual layout | Scoped pass | Home and intro screenshots inspected at 1284×2778; no visible text clipping. Development gear overlay remains, so these are not store assets or a full visual/large-text/dark-mode pass |
| Start foreground location | Action performed, result unverified | Tapped the observed search control without taking a result screenshot. Alert query found none; safe result/refresh selectors did not match, then the helper reported `system_modal_probe_timeout` and `RUNNER_BUSY` |
| Permission / distance result | Pending | Busy/failed captures do not prove denial, absent result, app crash or successful GPS. Roope was asked to handle any visible prompt (Allow Once) and report result/error without sensitive details |
| Background clearing / denied retry / product-source UI | Not run | Must be independently observed after resolving the pending screen; unit/browser evidence is not a native pass |

Privacy-safe local screenshots under ignored `work/location-2026-10-06/`:
`iphone-home-retry-2026-10-07.png` and
`iphone-nearby-intro-retry-2026-10-07.png`. Both precede the location request.
No permission-map/result screenshot, coordinate, point address or exact distance
was captured. Session diagnostics are under the tool's local
`sessions/team-location-retry-2026-10-07/runner.log`; they record the listener
recovery and later system-modal probe failure, not a passing GPS result.

Full pinned `pnpm validate` passes after recording this retry: 240 tests,
format/lint/strict types, package/API builds and 13 routes; log:
`work/location-2026-10-06/iphone-retry-validate-2026-10-07.log`. Closed only the
automation helper/session, verified no runner xcodebuild remains and confirmed
the product still has the same running PID. No product reinstall/reset/termination.

## Earlier post-trust follow-up — 2026-10-07

- Roope reported the trust/verification step complete. Without an app reinstall,
  the explicit development-client deep-link launch returned success, and a
  subsequent filtered process query found KeepItGreen running. The prior iOS
  Security rejection is resolved for this launch; GUI content is not inferred.
- API health and Metro status still pass at the current LAN origins.
- UI automation initially failed because the **separate** cached
  AgentDeviceRunnerUITests runner profile had expired. Rebuilt the existing
  helper with Xcode 27 beta, existing team/IDs and automatic provisioning;
  `TEST BUILD SUCCEEDED`. The renewed helper profile expires October 14 at
  18:51:50 UTC; **the product app still expires October 13 at 18:21:19 UTC**.
- The incremental helper build left the outer runner's resource seal stale
  after changing its embedded profile/test artifacts. Re-signed that exact
  generated runner, preserving its validated identity/entitlements; recursive
  strict signature verification then passed. No app source, bundle, user data,
  global signing configuration or private-repository implementation changed.
- Subsequent fresh-session XCTest startup still timed out without a readable
  app tree. Tool diagnostics reported cancellation/termination of timed-out
  runner processes. The later close attempt found no active automation session.
  This is a tooling failure, **not evidence of an app crash or a GPS failure**.
- Roope was asked whether the phone displays normal Home, an error or a
  permission prompt. Home/location/source UI remain **Not run / awaiting owner
  observation**. No GPS request was automated and no coordinates, nearest-point
  result or camera frame were captured. Use the owner-assisted procedure below
  instead of repeatedly rebuilding the app for a resolved trust problem.
- Full pinned `pnpm validate` again passes: 240 tests, formatting/lint/types,
  package/API builds and 13 routes. Ignored evidence:
  `work/location-2026-10-06/iphone-post-trust-validate-2026-10-07.log`,
  `iphone-launch-after-trust-2026-10-07.json` and
  `runner-renewal-2026-10-07.log`. No release/Doctor/security-audit/GitHub claim.

Owner-assisted procedure: confirm normal Home; open **Lähin kierrätyspaikka** →
**Etsi sijainnillani**, choose foreground permission, and report only whether a
point and distance labelled **Arvio linnuntietä** appear (not the name/address,
coordinates or actual distance). Background and return: the old result should
clear and a new search should be possible. Record observations separately;
denial/retry and product-source UI require their own tests, not an inferred pass.

## Team-baseline development installation — 2026-10-07

Source: local `487af03` on `codex/kierratysappi-nearest-location`, based on team
main `39f8aa6`. No newer KeepItGreen code/assets were imported or pushed. Version
`0.1.0` / build `1`, bundle ID `fi.roopeaaltonen.kierratysappi`, iPhone 12 Pro Max.

| Check | Result and limits |
| --- | --- |
| Native dependency consistency | Pass: iOS Podfile.lock equals Pods/Manifest.lock; Expo 57.0.21 and ExpoLocation 57.0.16 included |
| Xcode 26.6 Debug compile | Pass: `17F113`, generic iOS destination, `-jobs 2`, automatic existing-team provisioning; build exit 0 and `BUILD SUCCEEDED` |
| Signature/profile | Pass: strict recursive app check and all 12 embedded frameworks; app/team entitlements and expected device match embedded development profile |
| Profile expiry | **2026-10-13 18:21:19 UTC / 21:21:19 Europe/Helsinki**; this is not a year-long or distribution profile |
| Location declaration | Foreground purpose present; no Always location purpose or background modes in built Info.plist |
| Installation | Pass: beta `devicectl device install app` over the existing bundle, no uninstall/reset; retained rollback untouched |
| Local content retention | **Not verified**: pre/post app inventory shows a changed data-container path. Path replacement alone proves neither data loss nor retention; no private app contents were inspected |
| Host runtime transport | API health, Metro status, iOS manifest and exact manifest launch asset pass; JavaScript response HTTP 200, 10,956,460 bytes. These are host checks, not phone startup evidence |
| First physical launch | **Rejected**: CoreDevice 10002 → FBS Security reports invalid signature, inadequate entitlements or profile not explicitly trusted. Local integrity/profile checks pass; the specific device cause is not yet confirmed |
| Owner action | Roope: Settings → General → VPN & Device Management → developer profile; trust/verify if offered, then open KeepItGreen and report the result. Codex: relaunch through verified Metro and diagnose further if rejection persists |
| Home/location/product flow | **Not run on this binary** pending launch: allow/deny/retry, distance, background clearing and actual source/unknown UI remain mandatory; do not retain user coordinates/nearby results in logs/screenshots |
| Full repository validation | Pass: 240 tests (32 policy + 208 application), format/lint/strict types, package/API builds and 13 web routes |

Retained ignored evidence is under `work/location-2026-10-06/`: build log
`build-2026-10-07.log`, validation `iphone-validate-2026-10-07.log`, and the
`iphone-{before-install,install,after-install,launch}-2026-10-07.json` metadata.
The native artifact is `DerivedData/Build/Products/Debug-iphoneos/KeepItGreen.app`.
No signing secrets or user location are included in committed evidence.

SHA-256 of main executable:
`0a258884715cb99d4cd4826ba2e6bf1d929f79dd1cbc78ea87976a223ff9c0ef`.
SHA-256 of development dylib:
`c994df1a6dd66044e61f745bcda14314a98be87bd68a3c919146578e39a99bd8`.
JavaScript remains served by Metro; these native hashes are not a standalone
release-bundle identity. Mac-hosted Metro/API are still required.

The sections below are dated historical evidence, including their old
profile expiries, camera-only configuration and runtime passes.

## Latest toolchain comparison — 2026-09-08

Baseline source: `a6af06c`. Xcode 27 beta 6 (`27A5252f`)/iOS 27 SDK compiled, signed and installed successfully, but its app immediately failed with `SIGTRAP` in UIKit's missing-UIScene enforcement. The new SDK is **not accepted** for current app builds. See `XCODE_27_VALIDATION.md` for the crash report, source and reproduction.

The existing Xcode 26.6 artifact was restored without deleting app data and tested again: Home, manual Nutella lookup, unknown/partial confidence, full Rinki provenance, OFF attribution and terminate/relaunch to Home all pass on September 8. The beta-built XCTest runner could inspect and operate this restored binary. Screenshots: ignored `work/ui-qa/2026-09-08-restored-{home,result,provenance}-ios.png`. Camera, VoiceOver and the broader matrix remain historical/unrun. Profile expiration is still September 11 at 07:01:05 UTC; Metro/API remain required.

The following identity/preflight tables retain the September 7 comparison baseline; they do not certify the rejected beta artifact.

## Test identity

| Field | Value |
| --- | --- |
| Repository source | Local `main` at `77ad397`; ahead of `origin/main` by nine commits before this run. No push/publication was performed. |
| App version/build | `0.1.0` / iOS build `1` |
| Bundle identifier | `fi.roopeaaltonen.kierratysappi` |
| Host | Apple M1, macOS Tahoe 26.7 (`25G227`) for the 2026-09-07 run; the 2026-09-04 rebuild used 26.7 (`25G220`) and earlier August evidence used 26.5.2 |
| Xcode | 26.6 (`17F113`), iOS 26.5 SDK; commands use an explicit `DEVELOPER_DIR` because system `xcode-select` remains on Command Line Tools |
| Selected install method | Local Xcode development build and `devicectl` install using automatic Personal-Team signing |
| Signing scope | Apple Personal Team is sufficient for local testing; seven-day provisioning limits apply |
| iPhone model | iPhone 12 Pro Max |
| iOS version | 27.0 (`24A5424a`) for the 2026-09-07 current-client smoke; historical August evidence used 26.1 (`23B82`) |
| Tester | Repository owner for manual observations; Codex for build/device/API/Metro logs |
| Physical run date | 2026-09-07 current-client Home/manual/result smoke; 2026-09-04 fresh signed install/launcher and failed Metro connection; 2026-08-10/22/26/28 earlier-client evidence |
| Screenshots/logs | 2026-09-07 semantic trees, API/Metro/device connection observations and ignored screenshots: `work/ui-qa/2026-09-07-home-fi-ios.png`, `work/ui-qa/2026-09-07-known-product-result-top-fi-ios.png` and `work/ui-qa/2026-09-07-known-product-provenance-fi-ios.png`. Ignored `work/ui-qa/after-home-fi-ios-physical.png` and `after-result-fi-ios-physical.png` are historical 2026-08-28 captures. No live camera frame was captured. |

## Automated preflight evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Git synchronization | Pass as inspection; not pushed | Before the 2026-09-07 run, local `main` HEAD was `77ad397`, ahead of `origin/main` by nine commits. No push authorization exists and no publication was performed. |
| Host compatibility | Pass | macOS Tahoe 26.7 is in Xcode 26.6's supported macOS 26.2–26.x range; local tool invocation and native build pass. |
| Full Xcode | Pass | Xcode 26.6 and the iOS 26.5 SDK are installed and usable through explicit `DEVELOPER_DIR`. |
| Expo/iOS compatibility | Pass for checked source/build/runtime scope | 2026-09-04 Expo 57.0.19 / RN 0.86.3 / dev-client 57.0.18 passes frozen install, peers, Expo install check and Doctor 20/20 without exclusions; native pod manifest/lock and versions agree. On 2026-09-07 this installed client also reached Home, manual entry and a known-product result through the current Metro bundle. This is not broader native or release acceptance. |
| Native generation | Pass | A clean ignored-workspace `expo prebuild --clean --platform ios --no-install` completed. |
| Bundle/version | Pass | Generated project has bundle ID `fi.roopeaaltonen.kierratysappi`, marketing version `0.1.0` and build `1`. |
| Camera purpose | Pass configuration | Finnish and English `NSCameraUsageDescription` state barcode-only camera use and no frame upload. |
| Unrelated purpose strings | Pass configuration | No microphone or location usage description is generated. Location is not used by the current product. |
| Development compile | Pass | Fresh 2026-09-04 live-workspace generation, 111-pod installation and Xcode Debug `iphoneos` build pass with Expo 57.0.19 / RN 0.86.3 / dev-client 57.0.18. Dependency build-script warnings remain; no build error occurred. |
| Development signature | Pass | All 11 embedded frameworks passed strict signature verification and the app passed recursive `codesign --verify --deep --strict`. This is development evidence, not App Store archive evidence. |
| Development install/launch | Pass for current development smoke | The 2026-09-04 fresh install and launcher/onboarding pass. On 2026-09-07 the same current Expo 57 client launched through Metro at `192.168.10.43`, requested the bundle over multiple phone-to-Mac TCP connections, and passed Home/manual/known-result smoke. The profile is valid until 2026-09-11 07:01:05 UTC. This is development evidence only. |
| Entitlements | Partial | Development signing/install passes. Final archive entitlements remain unverified. |
| Privacy manifest | Pass configuration | No tracking or collected data types; UserDefaults required-reason API uses `CA92.1`. Final dependency-merged archive remains unverified. |
| Icons/splash | Pass generation | App icon, splash logo at 1x/2x/3x, splash background and storyboard are generated from source assets. |
| Appearance/orientation | Pass configuration | Automatic light/dark style; phone portrait scope. iPad remains configured for portrait and landscape. |
| EAS development profile | Source invariant repaired | `developmentClient:true`, internal distribution and Node 24.19.0 exist; the matching `expo-dev-client` dependency and a repository-policy regression now exist. EAS itself was not invoked. |

The current development build is under ignored `work/ios-dev-client-2026-09-04-derived/`, generated from live `apps/mobile/ios`, not stale copied staging. It is a short-lived Personal-Team development artifact, not an archive, TestFlight build or release artifact. The previous profile expired on 2026-08-29; the new profile expires 2026-09-11 07:01:05 UTC. On 2026-09-07 API and Metro health passed on localhost and the current Mac LAN address, and the phone established multiple TCP connections to Metro. The first known-product attempt still displayed offline because the running client had loaded a stale 2026-09-04 Metro bundle containing that day's API address. Metro was safely restarted with the current `EXPO_PUBLIC_API_BASE_URL`, the app was relaunched, and the same flow resolved normally. The prior 2026-09-04 connection failure remains historical evidence in ignored `work/ui-qa/2026-09-04-ios-dev-client-connection-error.png`.

## Physical test matrix

Rows not exercised remain **Not run**. `Pass` means the named behavior was observed on the recorded iPhone; it does not generalize to other hardware, release configuration or stores. The current-client evidence is enumerated immediately below. Unless a later row explicitly says **2026-09-07 current client**, its Pass/Partial observation is historical evidence from the 2026-08-10–28 clients and must not be treated as retested on the current Expo 57 binary.

### Current-client smoke — 2026-09-07

| Scenario | Status | Evidence/notes |
| --- | --- | --- |
| Development launch through current Metro | Pass | API and Metro responded on localhost and LAN address `192.168.10.43`; the phone established multiple TCP connections and rendered the app bundle. |
| Finnish Home | Pass | Interactive semantic tree exposed the expected Home content and actions; screenshot: `work/ui-qa/2026-09-07-home-fi-ios.png`. |
| Manual-entry flow | Pass | The interactive semantic flow reached manual entry and accepted the known valid product lookup. This does not validate VoiceOver reading order or Dynamic Type. |
| Stale development bundle handling | Pass after service correction | The first lookup correctly rendered offline because the already loaded 2026-09-04 Metro bundle contained an old API address. Metro was safely restarted with the current API base and the client was relaunched; no application-data or device-setting mutation was required. |
| Known-product result, answer first | Pass | The repeated lookup resolved and placed component sorting guidance before product identity. The top result preserved one unknown material at 0% and showed plastic collection at 55% partial confidence; screenshot: `work/ui-qa/2026-09-07-known-product-result-top-fi-ios.png`. |
| Known-product provenance | Pass | The lower result retained Rinki/FI source, checked date `2026-08-10`, rule version and verified status alongside Nutella identity; screenshot: `work/ui-qa/2026-09-07-known-product-provenance-fi-ios.png`. |

All camera, lifecycle, VoiceOver, appearance, performance, battery and wider barcode-matrix observations below remain historical or Not run for the 2026-09-07 client.

### Installation and lifecycle

| Scenario | Status | Evidence/notes |
| --- | --- | --- |
| Fresh install and first launch | Pass | Development build installed and launched on 2026-08-10; renewed builds installed/launched on 2026-08-22 and 2026-08-26 |
| Cold start | Partial | Force-quit relaunch reached interactive UI; no release-build tap-to-interactive timing captured |
| Warm start | Not run | Measure from icon tap to interactive home |
| Background → foreground | Pass | Owner confirmed return worked |
| Force quit → relaunch | Pass | Owner confirmed force-quit relaunch worked |
| Lock → unlock while open | Partial | App returned, but a transient development-only Expo CLI warning appeared; DevTools showed a temporary CLI connectivity warning |
| Safe areas and Dynamic Island/notch | Not run | Record device form factor |
| Keyboard avoidance/manual entry | Partial | Standard-size manual input and numeric Search submission worked with VoiceOver; largest text remains unrun |
| Light and dark appearance | Not run | Check all result states |
| Portrait behavior | Not run | Phone is portrait-only by configuration |

### Camera permission

| Scenario | Status | Evidence/notes |
| --- | --- | --- |
| Context screen appears before system prompt | Pass | Barcode-specific explanation appeared before the iOS prompt |
| Allow camera | Pass | iOS prompt appeared and allowing it opened the live scanner |
| Deny camera | Not run | Manual entry and recovery must remain available |
| Enable later in iOS Settings | Pass | `Avaa asetukset` opened the app settings; re-enabling Camera restored the scanner without a second prompt |
| Revoke while app is backgrounded | Pass | Revoking Camera in Settings changed the scan route to the denied/recovery UI |
| Permission change after force quit | Not run | Requires relaunch |

### Barcode scanner

| Scenario | Status | Evidence/notes |
| --- | --- | --- |
| Valid EAN-13 | Pass | Physical package decoded and produced the safe `not_found` flow; API recorded one successful `not_found` completion in 162 ms without logging the raw GTIN |
| Valid EAN-8 | Not run | Supported format |
| Valid UPC-A | Not run | Supported format |
| UPC-E/unsupported format | Not run | Must not become a guessed GTIN or start a lookup |
| Malformed/invalid checksum manual value | Pass | Manual `123` showed `Tarkista koodi`; API log remained empty |
| Duplicate callback suppression | Not run | One lookup for rapid identical callbacks |
| Close range | Not run | Record approximate distance |
| Farther range | Not run | Record approximate distance |
| Oblique angles | Not run | Multiple angles |
| Low light | Not run | Record conditions |
| Glare | Not run | Record conditions |
| Partially obscured barcode | Not run | Must not guess |
| Multiple visible barcodes | Not run | Record selected behavior |
| Rapid repeated scans | Not run | Observe haptics and request count |
| Torch control | Partial | The redesigned physical scanner semantic tree exposed localized `Sytytä valo`; the development automation toolbar overlaps the top-right target, so an actual on/off toggle is not claimed |

### Product lookup and network state

| Scenario | Status | Evidence/notes |
| --- | --- | --- |
| Known Open Food Facts food product | Pass | **2026-09-07 current client:** manual lookup resolved to Nutella after Metro was restarted with the current API base. **Historical 2026-08 client:** the same product resolved through OFF and the provider log completed in 343 ms. |
| Unknown valid GTIN | Pass | Physical EAN-13 showed `Tuotetta ei löytynyt`; no guessed product or sorting answer |
| Slow network | Not run | Use Network Link Conditioner or equivalent |
| Airplane mode/offline | Pass | Same known GTIN showed `Ei verkkoyhteyttä`; no API request was emitted |
| Restore network and retry | Pass | `Yritä uudelleen` recovered to Nutella without re-entering the code |
| Provider timeout/error | Pass for controlled unavailable fixture | Fixture produced provider-unavailable rather than unknown/offline; provider-specific timeout timing remains unrun |
| Backend unavailable | Pass | `Tietolähde ei vastaa` appeared with source-unavailable status; restoring the real backend and pressing Retry recovered to Nutella without code re-entry |
| Change network during lookup | Not run | Wi-Fi/cellular transition if available |
| Background app during lookup | Not run | Result/retry state must remain coherent |
| Cached result | Pass | Restored retry returned a cache hit in 8 ms; result retained cache/source disclosure |
| Stale result behavior | Not run | Requires controlled clock/cache fixture; never present stale as current |
| Malformed API response | Not run | Controlled fixture; must become provider unavailable |
| Long product name | Not run | Controlled fixture and largest text |
| Missing image | Not run | No broken layout or implied image requirement |

### Recycling guidance

| Scenario | Status | Evidence/notes |
| --- | --- | --- |
| Component-level sorting | Pass for known fixture and redesigned presentation | **2026-09-07 current client:** the top result showed answer-first component guidance, preserved one unknown material at 0%, and showed plastic collection at 55% partial confidence. This remains one product fixture, not full content acceptance. |
| Source/provenance/rule date | Pass for known fixture | **2026-09-07 current client:** the lower result showed Rinki as source, FI jurisdiction, checked date `2026-08-10`, rule version and verified status, with Nutella identity. **Historical 2026-08 client:** product licence/attribution and source links were also exercised. |
| Confidence and verification state | Pass for known fixture | **2026-09-07 current client:** partial confidence was exposed as 55% and the unresolved material remained unknown at 0% rather than receiving a guessed destination. Historical no-source cases also explicitly stated that no verified rule was applied. |
| Ambiguous packaging | Not run | Must ask/retain uncertainty |
| Missing packaging information | Not run | Must remain unknown |
| Confirmed material code | Not run | User confirms visible code |
| Unsupported/composite material code | Not run | Must not guess a destination |
| Deposit status uncertainty | Not run | Must not default to material collection |
| Correction/feedback draft | Not run | Warn against personal data; remain local |

### Accessibility and motion

| Scenario | Status | Evidence/notes |
| --- | --- | --- |
| Dynamic Type through largest accessibility size | Not run | All core flows operable |
| VoiceOver focus order | Partial | Direct-touch navigation passed from home scan action to scanner title/close and back to manual entry. Full sequential swipe order, permission recovery, results and settings remain unverified. |
| VoiceOver labels/traits/hints | Partial | Home scan action announced `Skannaa pakkaus`, button trait and privacy/purpose hint; scanner title and close link were named; manual action and corrected EAN/GTIN text-field name/hint/trait were announced. Remaining screens are unrun. |
| VoiceOver error recovery | Partial | Initial manual-invalid alert was visible but silent, then its first explicit announcement was interrupted by button focus. The locally repaired high-priority iOS announcement was physically confirmed to read the full `Tarkista koodin numerot...` message. Offline/provider states remain unrun. |
| VoiceOver asynchronous lookup result | Failed, repaired locally; retest deferred | Nutella rendered during a known-product run, but VoiceOver remained on `Hae tuote`. Loading and all terminal lookup states now use a pure tested announcement mapping; the device retest is deferred until after functional and visual work. |
| Increase Contrast | Not run | Information remains legible |
| Reduce Motion | Not run | No essential information loss; transitions suppressed |
| Button Shapes/related options | Not run | Actions remain distinguishable |
| Touch targets | Not run | Minimum 44×44 pt |
| Non-color communication | Not run | Confidence/errors/status include text or icon semantics |

### Performance and resilience

| Scenario/metric | Status | Evidence/notes |
| --- | --- | --- |
| Cold-start time | Not run | Xcode release/debug context must be named |
| Camera-open latency | Not run | Measure tap to usable preview |
| Barcode-decode latency | Not run | Physical label, repeated samples |
| Scan-to-result latency | Not run | Separate API/provider latency |
| Visible frame drops | Measurement unavailable | 2026-08-28 xctrace Animation Hitches attempt matched no app process and captured zero frames; its reported zero dropped frames is invalid and not accepted as a pass |
| Memory warnings/leaks | Not run | Xcode memory graph/Instruments if available |
| Unexpected heat | Not run | Record duration and device state |
| Battery impact | Not run | Extended camera session; record duration/percentage/context |
| Excess repeated API requests | Not run | Inspect privacy-safe request counts, not raw GTIN logs |
| Force quit/relaunch recovery | Pass functionally | Development build relaunched after force quit; no performance timing captured |
| Backend/provider failure recovery | Pass functionally | Controlled unavailable response rendered correctly; restoring the API and retrying recovered without re-entry. Current privacy-safe live/cache observations were 249 ms / 5 ms |
| Very large Dynamic Type under failures | Not run | Offline/provider/ambiguity screens |

## Defects and development-only observations

- The first 2026-08-10 Personal-Team artifact contained unsigned embedded frameworks even though the app wrapper was signed. The artifact was repaired by signing all 11 frameworks and re-signing/verifying the app before install. The clean 2026-08-22 Xcode build produced zero unsigned frameworks and passed strict recursive verification without the repair.
- The Personal-Team profile expired after seven days and iOS correctly refused launch. Renewing the Apple account/profile, rebuilding, reinstalling and trusting the renewed developer profile restored launch. This is an expected limitation of free local provisioning and remains unsuitable for distribution.
- After a lifecycle test, the development build displayed `Open debugger to view warnings`; the in-app button did not respond. Mac DevTools showed only a transient inability to reach Expo CLI. Metro then reconnected and no application warning remained. This does not validate production behavior and should be rechecked in a release build.
- On 2026-08-26, the stopped Metro service produced the development-client-only `No script URL provided` screen. Restarting the local API/Metro services and launching with the explicit LAN payload restored the app. This is expected for the development artifact and is not evidence about a self-contained release build.
- Independent inspection then found that `developmentClient:true` had no `expo-dev-client` dependency, so the installed shell was not actually a recoverable development client. A fresh prebuild/pod/Xcode artifact containing dev-client/dev-launcher/dev-menu fixed the null script URL failure; recursive app/framework signature verification, install, launch and Home/manual/result runtime checks passed. The policy test now fails any future mismatched profile.
- Physical VoiceOver testing found that `accessibilityLabelledBy` alone did not name the manual field on iOS: VoiceOver used the placeholder. Explicit localized `accessibilityLabel` values were added to all three text inputs; the manual field then announced `EAN- tai GTIN-koodi`, its text-field trait and hint.
- Physical VoiceOver testing found that a React Native `accessibilityRole="alert"` did not automatically announce the manual validation error on iOS. A centralized iOS announcement path now covers manual validation, material-code/component results, feedback save and local-data deletion. The manual error uses high priority because a queued/default announcement was physically observed to be interrupted; the repaired full announcement passed on the device.
- The later known-product VoiceOver run exposed an equivalent asynchronous state-change gap: Nutella rendered while speech remained on the earlier search button. The result route now explicitly announces loading, offline, invalid, not-found, provider-unavailable, resolved and packaging-missing states through a pure mapping with regression coverage. This source repair has not yet been physically reconfirmed.
- Preflight documentation defect fixed: `docs/quality/MANUAL_TEST_CHECKLIST.md` no longer claims UPC-E is supported and now requires safe rejection.

## Remaining boundary

Device-to-Mac connectivity plus Home/manual/known-result smoke now pass on the installed Expo 57 development client. The current binary still needs the wider camera/barcode matrix, VoiceOver, largest Dynamic Type, dark/reduced-motion, lifecycle and valid performance/battery tests. Release remains blocked until a paid-program release archive/TestFlight build, broader Apple device matrix and all remaining acceptance gates pass.
