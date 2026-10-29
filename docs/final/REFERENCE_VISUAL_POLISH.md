# Reference visual polish — 2026-10-29

Continuation of Roope's “vielä lähemmäs (+tekoälytunnistus)” request and later
“jatka”, on local `codex/illustrated-functional-integration` after `fbde496`.
No GitHub sharing, new installation, paid app inference or model change.

## Visual changes

Compared the supplied Home reference against the actual previous Home rather
than declaring the first port identical. The prior right-heavy/broad wordmark,
flat card, small outline symbols, heavy section headings and green body copy
were visible differences. Updated:

- Smaller, more central leaf/wordmark; caption without the earlier pill.
  Slight render-only artwork crop adjustment and independent large-text fallback.
- Leafy primary photo card using the already-approved Home artwork's decorative
  panel. The crop fits actual measured card height independently of width, so
  adjacent baked blank-card borders do not leak into a taller card.
- Larger blue camera and green location/recycling symbols, white-highlighted
  discs, smaller utility cards and softer chevrons. Four native-compatible tab
  symbols preserve actual Home/Identify/Points/Settings, not a fake Profile.
- Home-only navy ink/slate-blue secondary text and links, smaller section type,
  tighter vertical rhythm. All eight added text-token pairs meet 4.5:1.
  Result/status colors and subpage typography remain unchanged.
- Primary title “Skannaa tuote” and body explicitly describe photo AI; existing
  `/photo` consent/preview/send/inferred-result/material-correction/conditions/
  unknown/unsafe behavior remains. No seconds-to-result or verified-ID claim.

The reference's nearby photos/names/addresses/opening status/distances, “popular”
analytics and coffee/bottle-to-bin examples are still not fabricated. Local
material search, real opt-in history and explicit location intent remain. No
photo, provider request or GPS acquisition occurs just by opening Home.

## Native-safe original symbols

Seven original 64×64 SVG sources and 192×192 RGBA PNG exports live in
`mobile/app/assets/symbols/`. They are code-native drawings, not downloaded
paths, emoji or new generated bitmaps. PNG exports total **33,901 bytes**;
source/export aggregate stays below the automatic 64 KiB cap. Existing source
artwork and the prior bottle illustration remain unchanged.

The renderer is `scripts/render-home-symbols.mjs`, using installed build-time
sharp **0.35.5** / libvips **8.18.7** through explicit SHARP_MODULE_PATH. No app
library or dependency/lockfile change. The current same-toolchain `--check`
recompiles in memory and compares exact PNG bytes. Sources have descriptive
titles; runtime Image content is decorative/hidden with localized parent controls.

The first recycling geometry overlapped; it was redrawn as three separate bent
arrows. Regression decoding verifies bounded PNG chunks/inflation/filtering,
RGBA/alpha, transparent corners and a transparent central square with exactly
three disconnected substantial arrow components. No runtime SVG/network/script/
embedded-photo/text or animation is introduced.

## Validation

- Full pinned `pnpm validate`: **396 unique cases (80 policy + 316 application)**,
  all required boundary/format/lint/strict-type/package/API/web-build gates,
  **16 web routes**. Scoped mobile: **240 overlapping cases**.
- **14 added cases**: four asset/PNG/topology/wiring, eight AA contrast pairs and
  two responsive decorative-crop guards. Existing photo/GPS/history/source/
  uncertainty/accessibility tests stay in place.
- All five actual-Metro browser runners pass: reference Home, whole-app
  refinement, integrated navigation, nearby and photo. FI/EN, keyboard/44-point
  controls, dark switching, 320/390/1280 and synthetic 130% text, direct-URL no
  GPS, opt-in history and explicit re-query, local search/unknown/reset, photo
  consent/correction/unsafe/unknown/cancellation remain covered.
- Initial unsupported font-weight 750 was repaired to supported 700. First full
  scope failed SVG a11y lint because source titles were missing; added all seven
  titles rather than bypassing lint. Old source-policy assumptions (artwork
  count, old tile height/outline symbol) were updated to meaningful new guards.
  No failure was waived as “just design”.
- Browser source snapshots and actual final native Home were visually inspected.
  Token contrast is not an entire screenshot contrast/VoiceOver certification.

## Existing physical client and limitations

Current intended phone is available without a passcode prompt. Fresh exact-app
activation from the verified LAN Metro succeeds. Targeted app inventory confirms
KeepItGreen **0.1.0/build 3**; a later process query retains the launch PID.
One in-scope screenshot confirms this latest Home, leafy AI card, filled symbols,
material shortcuts and all four tabs. No private history entry or unrelated app
content appears; development gear and OS status/back-app label remain, so this is
not a store screenshot. No uninstall/reinstall or account/trust/profile change.

No native camera entry, capture/send, paid recognition, GPS/address, native
navigation/large-text/VoiceOver, retention, performance/battery or standalone
acceptance is claimed. Current host Metro/API health and photo-enabled capability
checks pass without a model request. The existing profile expiry stays
**November 4, 2026 at 20:28:39 Helsinki**; Debug still needs Mac services/LAN.
Existing security/SDK-patch/photo-accuracy/infrastructure/store production NO-GO
gates remain; there is no new external blocker.

Ignored evidence: `work/reference-polish-2026-10-29/` includes final full/scoped
logs, symbol byte check, five browser logs, isolated screenshots and bounded
native lock/launch/capture/inventory/process receipts. Current browser screenshot:
`browser-final/fi-home-top.png`; physical screenshot: `native-home.png`.
Navigation/nearby/photo runners also use their established ignored screenshot
folders. Neither generated/native data nor screenshots are committed.
