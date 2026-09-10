# Design refresh evidence

Work dates: 2026-09-08 and 2026-09-10. Source baseline: `657bf17`; repository was clean before this work. This is a visual implementation unit, not a repeated 30-lane release audit.

## Implemented

Home, manual entry, product results, general guide and camera chrome now share a neutral/forest palette, revised type hierarchy, original decorative package/barcode marks and lower container nesting. Full source/uncertainty/licensing content stays present. No sorting rule, product adapter, camera format, permission request or data-retention behavior was changed. No new dependency, lockfile change or native rebuild was required; the existing semibold font asset is 47,956 bytes.

Browser inspection found missing checked-state semantics in the React Native Web radio rendering. Language, material/shape/deposit and feedback radios now carry matching native state and `aria-checked`. Decorative marks have both native accessibility hiding and `aria-hidden`. The unknown icon's rendered DOM has `aria-hidden="true"`; DOM snapshots can still include hidden generic text, so a native VoiceOver claim is not inferred.

## Automated evidence — 2026-09-10

`PATH="$PWD/work/pnpm-check-shims.cqbctz:$PATH" pnpm validate` passed with pinned pnpm 11.16.0:

- Format, lint and strict TypeScript across the workspace.
- 17 Node repository-policy tests and 164 Vitest application tests: **181 total**.
- All package/API builds and the 12-route Expo web export.
- New coverage: 10 additional light/dark contrast pairs and four design policies for checked state, action order/semantics, retained sorting evidence and decorative marks. Policy checks are source checks, not rendered native tests.
- Existing tests continue to cover invalid GTIN, provider/lookup contracts, session/offline behavior, ambiguity, localization and reduced-motion navigation.
- Final entry: `entry-6da4e6bc485f4e6daaaa92a2e916d26b.js`, 2,548,461 bytes / 576,705 gzip. Secondary: 45,171 / 14,791 gzip. Entry remains above the existing 2 MiB warning budget; no performance pass is claimed.

No fresh dependency-audit, frozen-install, Expo Doctor, native release or coverage run is claimed. Dependencies are unchanged.

## Actual browser checks

Screenshots are local ignored evidence under `work/ui-qa/2026-09-08-design/` and `work/ui-qa/2026-09-10-design/`; no competitor assets or camera frames are committed.

| Date / viewport | Flow | Result |
| --- | --- | --- |
| Sep 8 / 390×844 | Finnish and English Home | Scan/manual/guide/history visible, text reflows, selected language visually distinct |
| Sep 8 / 390×844 | Manual empty → invalid → real Nutella lookup | Empty submit disabled; invalid input shows complete recovery text; valid input reaches real API result |
| Sep 8 / 390×844 | Finnish result | All three returned parts retained, including unknown 0% and partial 55%; first known destination is visible without hiding the unknown part |
| Sep 8 / 390×844 | English guide | Four material illustrations, original general guidance, deposit caution and source/date inspected |
| Sep 8 / 320×740 | Finnish Home, invalid manual and real product result | Zero measured horizontal overflow in manual/result; Home screenshot inspected, titles/action labels wrap without clipping |
| Sep 10 / 1280×800 | English Home and real product result | Zero horizontally overflowing elements on each view; constrained reading column and complete source text retained |
| Sep 10 / 390×844 | Controlled unreachable API → offline → guide | Distinct offline result, retry/manual code retained, local general guide opens; zero horizontal overflow in offline view |
| Sep 10 / 390×844 | Local component test: plastic + bottle + unknown deposit | Ambiguous question, both possible destinations, 90% input-confidence score and Palpa/FI/date/version/verification remain visible; zero horizontal overflow |
| Sep 10 / 390×844 | Finnish final Home | Current checked-state DOM verified; final screenshot saved |

Offline reproduction used a **separate development server** on localhost:8082 with `EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:65534` and no listener at that API port. This exercises a genuine fetch failure, not device airplane mode. The main API/Metro processes on 3000/8081 were not stopped or reconfigured. No retry-to-online pass is claimed for this run. The local component selections are isolated QA inputs, not a claim about a physical package.

The camera-permission page and scanner chrome were changed in source, but the revised live-camera/torch visual behavior was not physically tested. No camera image was captured.

## Physical attempt and remaining acceptance

The September 8 attempt to reopen the existing iPhone automation session first encountered an existing-session lock. Reusing that exact session built the Apple test runner but timed out starting XCTest. A subsequent read-only beta `devicectl` inventory showed the phone available/paired. This does **not** establish whether the redesigned app opened, nor prove a new signing, account or app-startup defect. The user was asked to open the app and leave the device unlocked; no confirming reply is recorded in this work unit.

Use the restored Xcode 26.6 artifact for the next physical pass. Do not install an iOS-27-SDK app until the separate UIScene migration is validated. Its last recorded Personal-Team profile expires 2026-09-11 07:01:05 UTC; renewed signing may be needed after that time.

Still open: physical FI/EN, dark mode, largest Dynamic Type, live camera/torch, VoiceOver/TalkBack, frame pacing and battery. Dark-color pairs pass automated contrast; dark appearance was **not visually inspected**. The available in-app browser did not expose color-scheme emulation and the requested Chrome surface was unavailable. No OS appearance or accessibility settings were changed.

Owner: Codex for runner recovery, screenshots, repairs and evidence; Roope for unlocking/trusting the physical device if required. Follow OA-09 in `OWNER_ACTIONS.md`. Release remains **NO-GO**; no gate or severity was lowered by the redesign.
