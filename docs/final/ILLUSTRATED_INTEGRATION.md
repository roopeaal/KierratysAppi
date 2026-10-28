# Illustrated functionality integration — October 28, 2026

## Scope and authority

Roope approved implementing the proposed first Home/navigation unit and installing
it on his iPhone. The local branch is `codex/illustrated-functional-integration`,
from KierratysAppi main `28e0f3228e2754aae5c9b91ce42bf9ab60935549`.
KeepItGreen main `0142bb0371d0794ffe8d30df5037b40329efb512` supplies only selected
presentation references and unchanged local PNGs. No private-history merge,
GitHub push, paid inference, production deployment or app-store release.

## Implemented

- Illustrated Home with the existing leaf/scanner artwork, mint canvas, shared
  rounded controls and current barcode/manual/photo/nearby/guide/history actions.
- Four localized tabs: Home, Identify, Points and Settings. Identify opens the
  existing three identification paths; Settings reads real local-history state,
  selects the existing persistent language and links to guide/history/privacy.
  It creates no account, score or new collection of user data.
- Existing SDK 58, current API/contracts, data-provider routing, OSM dataset,
  photo consent/material correction, local-history deletion, rule provenance and
  mobile/backend/shared boundaries are preserved. No backend/shared source diff.
- Tabs disappear in capture/preview/result/material review. Explicit Points
  presses use the existing single-use intent. Render/deep links/selected-tab
  presses do not acquire GPS. Current permission/timeout/cancellation/background
  behavior and the honest web-only address limitation remain.
- Actual SDK `dismissTo` avoids duplicate Home routes; root page back actions
  safely fall back to Home. This was added after a browser reproduction found
  duplicate retained Home routes using ordinary `navigate`.
- Decorative images are local, noninteractive and hidden from accessibility.
  The hero's original aspect ratio is retained with a top-aligned crop. A first
  browser image exposed unintended centering; explicit top/left and a shorter
  header repair it. Text/buttons remain native components, not image text.
- Native font scaling above 1.2 replaces the overlaid hero with an independent
  heading. Narrow or very large navigation uses two rows, with no label cap or
  decorative motion. Shared dark-mode subscriptions and reduced-motion logic
  remain intact. Synthetic browser scaling is not a native accessibility pass.

The older welcome screen, profile/activity scores, guide-text search, extra item
guides and municipality-provider implementation were **not** imported in this
first pilot. The new Points tab is the current nearby flow, not an embedded map
or a hard-coded Helsinki list. Missing point metadata and inferred materials are
still explicitly uncertain.

## Automated and browser evidence

- Pinned pnpm 11.16.0 frozen install passes without lockfile changes or release-age
  exceptions. Expo/RN versions remain 58.0.19/0.88.0 from the chosen team main.
- Full `pnpm validate`: **372 unique tests**, 74 repository policies plus 298
  application cases; boundaries, formatting/lint, strict types, all package/API
  builds and **16 web routes** pass. Mobile scope passes **222 overlapping tests**.
- Four pure navigation regressions cover real routes, immersive paths, explicit
  location intent/no repeated acquisition and large-text navigation. Four new
  policy cases cover retained actions, source artwork, provider/context wiring,
  local settings and duplicate-stack prevention. Existing pixel-specific visual
  assertions are updated for the approved illustration, not removed.
- `illustrated-integration-browser.cjs`: four real tabs and keyboard activation,
  invalid GTIN without a request, capture-route tab hiding, route-language
  persistence, direct-URL no GPS, one explicit synthetic location acquisition,
  five genuine directory records and no repeat acquisition, live dark mode,
  local image loading, 44-point controls and 320/390/1280/130% layout pass.
  The resize check waits for the actual React Native canvas resize rather than
  reading the previous frame. It still rejects overflowing controls.
- Existing `app-refinement-browser.cjs`, `nearby-ux-browser.cjs` and
  `photo-recognition-browser.cjs` all pass against the real current UI. They retain
  uncertainty/source/licence, offline/error/manual/rule/history/privacy, explicit
  photo consent, separate material choices, correction/unknown/unsafe cases and
  cancellation/cleanup assertions. A source-ID ambiguity from the repeated
  decorative icon is repaired by scoping the existing assertion to Home.
- Browser screenshots inspected: FI/EN Home and Settings, Identify, dark Home,
  narrow/large Home and synthetic nearby. No real image, GPS or live paid AI
  request is made. Browser fixtures are isolated, never shipped product data.

Ignored evidence root: `work/illustrated-ios-2026-10-28.lqILo2/` contains
`validate.log`, `validate-mobile.log`, `browser-navigation.log`,
`browser-refinement.log`, `browser-nearby.log`, `browser-photo.log`,
`expo-check.log`, `pods.log`, `build.log`, `build-serial.log`, and cleanup receipts.
Screenshots: `work/illustrated-integration-qa/` plus the existing nearby/photo QA
directories. An initial concurrent export/source-update photo run timed out;
the later unchanged complete fixture run passes, not a claim of zero flakiness.

## Native generation and storage recovery

- Same app `fi.roopeaaltonen.kierratysappi`, name KeepItGreen, version 0.1.0;
  iOS build **3** distinguishes SDK 58 from the old SDK 57 build 2. Android's
  unchanged versionCode 2 is not a fresh Android native build claim.
- Ignored iOS tree regenerated from `mobile/app`, SDK 58 / 122 pods installed.
  Expo's incidental package-script changes were repaired explicitly; tracked
  dependency scripts/lockfile are unchanged. An attempted old generated-tree
  copy overlapped regeneration and is incomplete; it is not a valid rollback.
  The separately preserved build-2 signed app verifies strictly before cleanup.
- Stable Xcode 26.6 / iOS 26.5, intended existing phone/team, automatic existing
  provisioning, no account/security bypass. First two-job build exits 65 after
  LLVM/Swift module output fails **No space left on device**. Subsequent module
  errors are not misreported as independent SDK/framework defects.
- Roope explicitly approves only the old team `work/location-2026-10-06/DerivedData`
  and original-private `work/ios-scene-2026-09-27.KYLHaN/DerivedData` roots.
  Preflight checks exact real paths/types, both complete build-root markers,
  all 44,852 objects, no symlinks or open files. Postorder identity-checked removal
  succeeds without force/retries/traversal. Allocated inventory is about 5.5 GiB;
  actual free bytes fluctuate with active compilation/system work. No other
  cache, source, rollback, Xcode, simulator or phone data is removed. These
  generated artifacts can be rebuilt, not restored from Trash.
- A single-job native build exits 0 / **BUILD SUCCEEDED** with recovered space.
  Strict recursive app and all **11 embedded frameworks** pass; actual signed
  entitlements/profile app/team/device binding match. Default/FI/EN camera and
  foreground-only location purposes match the source; no always/background
  location is introduced. The metadata verifier was repaired for the nested
  localized JSON shape, dotted entitlement keys and codesign's required XML
  output option before its final passing receipt; these were verifier defects,
  not native permission or signature fixes.

## Installed build 3 and native Home acceptance

- Actual profile: created **2026-10-28T18:28:39Z**, expires
  **2026-11-04T18:28:39Z**, which is **November 4 at 20:28:39 Helsinki**.
  Old October 27 expiry no longer governs this installed binary. No unattended
  renewal, year-end runtime, paid membership or Mac-independent use is implied.
- Exact-bundle replacement installation succeeds; targeted phone inventory reports
  KeepItGreen **0.1.0/build 3**. No uninstall/reset, data-container reading or
  automatic migration/reset. Source history and independent rollback remain.
- First launch is actually denied: CoreDevice 10002 → FBS Security, despite
  passing local integrity checks. Roope then explicitly reports **luotettu**.
  Fresh same-app activation with the current LAN development-client URL succeeds;
  two subsequent process queries retain PID 3621. No security/trust bypass.
- Inspected one in-scope physical screenshot: illustrated Home, leaf and scanner
  imagery, current barcode/manual/photo/nearby/guide/history actions and all four
  bottom tabs render on the iPhone. Existing development gear is visible; no
  unrelated content/photo/location is captured. History-enabled state remains
  visible, but saved private entries/complete retention are not inspected.
- Exact LAN manifest reports SDK 58 and HTTP 200; its actual 11,794,758-byte
  launch bundle is HTTP 200. LAN API health and photo-capability availability
  pass without making a recognition request. Mac Metro/API remain active.
- Evidence: `native-verification.json`, `ios-bundle-check.json`, `install.json`,
  `installed-app.json`, `launch.json` (initial refusal), `launch-trusted.json`,
  `process-1.json`, `process-2.json`, `native-home-capture.json` and
  `native-home.png` under the ignored evidence root above. Final software/browser
  reruns all exit 0 in `validate-final.log` and `browser-*-final.log`.

This completes the requested first visual pilot and installation/startup, not
the remaining full native navigation/camera/permission/VoiceOver/large-text/
performance/Android/release matrix. The single next action is scoped native
navigation acceptance without capturing/transmitting private photo/location.

## Remaining limits

Fresh `expo install --check` fails for **11 newer SDK 58 patch expectations**
(Expo 58.0.21 and companions versus the pinned tested main). This is an explicit
maintenance gate, not a fresh compatibility/Doctor pass. No dependency-security
exception is added; the previously documented high/critical audit baseline and
PHOTO-003/004 remain open. This local UI/build request is not production GO.
Current Debug execution still uses Mac-hosted Metro/API and LAN; cable-disconnected,
Mac-independent, all-camera/GPS, VoiceOver/Dynamic Type/performance, Android and
release/store acceptance require their own evidence.
