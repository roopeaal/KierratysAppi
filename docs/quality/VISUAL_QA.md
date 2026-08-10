# Visual QA evidence

Run: 2026-08-10, Expo web development build in the Codex in-app browser.

## Inspected

| Viewport | State | Language | Result |
| --- | --- | --- | --- |
| 390×844 | Home, first-visit privacy, manual entry | Finnish and English | Pass; no clipping, readable hierarchy and actions |
| 360×640 | Contextual camera permission, offline recovery | English | Pass; all recovery actions visible and 48dp+ |
| 360×640 | Live Nutella result from OFF/Rinki | English | Pass; product/source/confidence/component hierarchy readable; page scrolls |
| 412×915 | Manual plastic bottle with unknown deposit | English | Pass; radio groups, focus outline, ambiguity question and candidates visible |
| 360×640 | Material code `05 PP`, pre- and post-confirmation | English | Pass; bounded input, explicit confirmation and source metadata remain readable; guidance scrolls cleanly |
| 390×844 | Conflicting, unknown and composite material codes | English | Pass; conflicts/unknowns never show guidance; confirmed composite remains an unsupported-material result |

No error/warning entries were present in the page console after these flows. The live lookup returned four packaging components and kept a missing cap material explicitly unknown. Material-code QA covered `05 PP`, conflicting `PET 41`, unknown `99 XYZ`, and `C/PAP 84`.

## Changes caused by inspection

- Added an explicit API CORS origin allowlist after web lookup was blocked.
- Localized the brand tagline instead of leaving Finnish copy in English mode.
- Added the queued GTIN to the offline state.
- Improved unnamed component fallback from a generic heading to its observed material.
- Kept material recognition behind a second, explicit package-confirmation action and used a code-plate visual that distinguishes exact identifiers from composite groups.

## Not claimable in this environment

- Dark-mode screenshot forcing and OS large-text scaling were not exposed by the selected browser capability.
- VoiceOver/TalkBack, native safe areas, camera preview/decoding, haptics, and keyboard behavior require signed physical-device builds.
- Native store screenshot sets remain blocked on toolchains/signing.

These items are explicit release blockers, not inferred passes from the web build.
