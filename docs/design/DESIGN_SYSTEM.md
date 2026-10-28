# Design system — Illustrated packaging utility

Updated 2026-10-28. The implementation in `mobile/app/src/theme/` is authoritative. The owner-approved illustrated Home/navigation pilot is documented in `../final/ILLUSTRATED_INTEGRATION.md`; earlier whole-app rationale remains in `APP_REFINEMENT.md`.

## Color

| Role | Light | Dark |
| --- | --- | --- |
| Canvas | #F2FAF5 | #14221B |
| Reading surface | #FFFFFF | #1D2E24 |
| Primary text | #20352D | #F1F5ED |
| Secondary text | #59665E | #C3CDC5 |
| Primary action | #244D3C | #63D1A2 |
| Action label | #FFFFFF | #101713 |
| Link | #244D3C | #A8D8B5 |
| Quiet package illustration surface | #E4F4E9 | #2A4433 |
| Divider | #DCE2DA | #465149 |
| Strong input boundary | #6E756F | #AFA799 |

Green/amber/brick/blue status pairs remain separate semantic tokens, tested for normal-text contrast in both palettes. A green button means an action, not a verified recycling answer. Unknown and partial data use explicit words and confidence.

## Type and layout

Atkinson Hyperlegible Next: regular 400 for body, semibold 600 for controls/section headings, bold 700 for display/titles. IBM Plex Mono 600 is reserved for identifiers and confidence values.

Base scale: display 32/36, title 26/32, heading 19/25, body 17/25, small 14/20, label 16/22, mono 13/18. No font-scaling cap. Do not add fixed text heights or line-count clipping. Plain utility captions use Atkinson rather than decorative uppercase mono.

The reading column is at most 560 points with 20-point side gutters. Main spacing is 4/8/12/16/24/32/48; reading surfaces use 20-point inset. Surface radius 26, controls 18, small status labels 8. Minimum targets 44, normal buttons 56 high and secondary rows 60 high. The bottom shell owns its bottom safe area; screens with visible tabs own only the top inset, while immersive screens retain both. Safe areas and scrolling remain native.

## Hierarchy

Home: decorative illustrated brand/question → barcode scan action → manual entry/coverage limit → photo identification → nearby/guide tiles → local history/language/privacy/jurisdiction. Source artwork is local and hidden from accessibility, while all labels/actions remain real components. Native large text uses an independent heading instead of overlaying the image. No unrequested welcome/profile/impact content is imported.

The four persistent tabs are Home/Identify/Points/Settings; they are absent during capture/result/material-review flows. A Points press is an explicit one-shot location intent, never a rendering side effect. Narrow/large text uses two rows without capped labels. Supported dismiss-to navigation prevents duplicate Home stacks; direct root pages have a Home fallback.

Subpages use one compact labelled back row with a quiet app name, not repeated brand lockups. Page titles and short purposes precede forms. Guide/legal content and history are separated reading/list sections, not decorative card stacks. Material/shape radios have visible indicators and flexible two-column layouts with short material names.

Result: product name/community qualification → part identity → prominent destination or safe recovery → confidence → preparation/explanation/exceptions → complete source, jurisdiction, checked date, rule version and verification. No part is hidden or dropped. Provider identity, retrieved date, actual database attribution and licence links follow.

General material drawings are decorative. Unknown material uses a question mark, not an invented material. They are hidden from native and web accessibility trees via platform-appropriate properties.

## Interaction and accessibility

Immediate pressed opacity; visible input focus and error boundaries. Native navigation keeps the tested reduced-motion branch. No new decorative animation, continuous camera sweep, timer, blur or looping artwork. No claim of measured frame rate or battery improvement.

Language radios expose both native checked state and aria-checked. Internal routes are buttons; external sources are links. Manual inputs retain explicit labels, numeric keyboard, validation and high-priority iOS error announcements.

Existing numerical engine confidence remains visible alongside its textual tier; it is not a calibrated probability. The earlier document's claim that percentages were absent did not match code and is corrected here. A confidence-policy change is outside this visual work unit.

## Visual QA

Latest browser evidence spans Finnish/English whole-app and new navigation flows at 390 points, Home at 320/1280, live dark switching and 130% synthetic text. Exact scope, fixtures, failures/repairs and screenshots: `docs/final/ILLUSTRATED_INTEGRATION.md`. Existing light/dark palette contrast tests pass; latest native dark/large-text/camera appearance remains unaccepted. Historical evidence remains separately date-scoped.
