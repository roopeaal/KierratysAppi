# Design system — Illustrated packaging utility

Updated 2026-10-29. The implementation in `mobile/app/src/theme/` is authoritative. The approved Home language now extends to every functional page; evidence is in `../final/APP_DESIGN_CONSISTENCY.md`. The original selective-import scope remains in `../final/ILLUSTRATED_INTEGRATION.md`; earlier designs in `APP_REFINEMENT.md` are historical.

## Color

| Role | Light | Dark |
| --- | --- | --- |
| Canvas | #F5FCFA | #14221B |
| Reading surface | #FFFFFF | #1D2E24 |
| Primary text | #142C39 | #F1F5ED |
| Secondary text | #59688A | #C3CDC5 |
| Primary action | #244D3C | #63D1A2 |
| Action label | #FFFFFF | #101713 |
| Link | #435D95 | #B4C9F3 |
| Quiet package illustration surface | #E4F4E9 | #2A4433 |
| Divider | #DCE2DA | #465149 |
| Strong input boundary | #6E756F | #AFA799 |

Green/amber/brick/blue status pairs remain separate semantic tokens, tested for normal-text contrast in both palettes. A green button means an action, not a verified recycling answer. Unknown and partial data use explicit words and confidence.

## Type and layout

Home's navy/slate/mint colors are shared across all thirteen functional pages;
`homeColors` derives aliases from the same palettes, not a duplicate set of
literals. Semantic sorting/status tokens are unchanged. Shaded original SVG
symbols export to native alpha PNGs, without a runtime library. Camera, location
and recycling actions reuse these symbols on detail pages. Main camera disc
64 pt, utility discs 48 pt, compact 86 pt minimum Home utility cards and 17 pt
Home section headings retain 44-point controls and native scaling. The leafy
Home card background is a render-only source-panel crop adapted to its measured
card, not a screenshot UI.

Platform sans-serif now covers Home, bottom tabs, detail text and text fields,
retaining native scaling. One `appFontFamily` selects System on native and the
platform browser sans stack on web. Home follows
header → local search → combined identification gateway → compact nearby/guide → four material
chips → explicit nearby search → real recent history. Reference example data and
greenwashing slogans are omitted. Large native text stacks cards/chips and hides
decorative header/photo overlay/arrow. See `../final/REFERENCE_HOME_REFINEMENT.md`.

System sans uses regular 400 for body, semibold 600 for controls/section headings, bold 700 for display/titles. IBM Plex Mono 600 remains for codes/identifiers. Atkinson overrides and startup loading are removed; its dependency is left pinned rather than changing the native dependency set during a presentation task.

Base scale: display 32/36, title 26/32, heading 19/25, body 16/24, small 14/20, label 15/22, mono 13/18. No font-scaling cap. Do not add fixed text heights or line-count clipping. Plain utility captions use the shared sans rather than decorative uppercase mono.

The reading column is at most 560 points with 20-point side gutters. Main spacing is 4/8/12/16/24/32/48; reading surfaces use 20-point inset. Surface radius 22, fields 18–22, primary/secondary action capsules and small status labels 8. Minimum targets 44, normal buttons 56 high and secondary rows 60 high. The bottom shell owns its bottom safe area; screens with visible tabs own only the top inset, while immersive screens retain both. Safe areas and scrolling remain native.

## Hierarchy

Home: decorative illustrated brand/question → local guide search with barcode shortcut → Skannaa tuote gateway to Identify → nearby/guide tiles → material chips → explicit nearby action → real recent history → manual/language/privacy/jurisdiction. The gateway describes barcode and AI choices and never activates either by itself. Source artwork is local and hidden from accessibility, while all labels/actions remain real components. Native large text uses an independent heading instead of overlaying the image. No unrequested welcome/profile/impact content is imported.

The four persistent tabs are Home/Identify/Points/Settings; they are absent during capture/result/material-review flows. A Points press is an explicit one-shot location intent, never a rendering side effect. Narrow/large text uses two rows without capped labels. Supported dismiss-to navigation prevents duplicate Home stacks; direct root pages have a Home fallback.

Subpages use one compact labelled back action with a small decorative leaf/app name, not a repeated hero. Page titles and short purposes precede forms. Identify offers the largest barcode action first (176-point minimum, 22/28 title), then grouped manual-barcode and AI alternatives, preserving AI uncertainty text. Narrow/native-large layout stacks the primary content and omits redundant secondary icon columns, not labels. Settings groups actual language/history/guide/privacy controls. Guide/legal content and history remain reading/list sections. Material/shape radios have visible indicators and flexible two-column layouts with short material names.

Result: product name/community qualification → part identity → prominent destination or safe recovery → confidence → preparation/explanation/exceptions → complete source, jurisdiction, checked date, rule version and verification. No part is hidden or dropped. Provider identity, retrieved date, actual database attribution and licence links follow.

General material drawings are decorative. Unknown material uses a question mark, not an invented material. They are hidden from native and web accessibility trees via platform-appropriate properties.

## Interaction and accessibility

Immediate pressed opacity; visible input focus and error boundaries. Shared keyboard actions use a 2-point canvas gap and 4-point outer link-colored ring, visible beside dark filled buttons as well as quiet surfaces. Native navigation keeps the tested reduced-motion branch. No new decorative animation, continuous camera sweep, timer, blur or looping artwork. No claim of measured frame rate or battery improvement.

Language radios expose both native checked state and aria-checked. Internal routes are buttons; external sources are links. Manual inputs retain explicit labels, numeric keyboard, validation and high-priority iOS error announcements.

Existing numerical engine confidence remains visible alongside its textual tier; it is not a calibrated probability. The earlier document's claim that percentages were absent did not match code and is corrected here. A confidence-policy change is outside this visual work unit.

## Visual QA

Latest browser evidence spans Finnish/English whole-app/navigation flows, reading/form/Identify/Settings/Nearby pages at 320/390/1280, shared computed typography/palette, live dark switching and 130% synthetic text. Photo/nearby suites retain isolated fixtures and safety checks. Exact outcomes/screenshots: `../final/APP_DESIGN_CONSISTENCY.md`. Light/dark token contrast remains tested; latest native all-page/dark/large-text/camera appearance remains unaccepted. Historical Home-native evidence is separately date-scoped.
