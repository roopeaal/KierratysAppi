# Design system — Packaging utility

Updated 2026-09-10. The implementation in `apps/mobile/src/theme/` is authoritative; this replaces the stale Material Ledger token description.

## Color

| Role | Light | Dark |
| --- | --- | --- |
| Canvas | #F5F7F2 | #14221B |
| Reading surface | #FFFFFF | #1D2E24 |
| Primary text | #20352D | #F1F5ED |
| Secondary text | #59665E | #C3CDC5 |
| Primary action | #244D3C | #63D1A2 |
| Action label | #FFFFFF | #101713 |
| Link | #244D3C | #A8D8B5 |
| Quiet package illustration surface | #E5EDE2 | #2A4433 |
| Divider | #DCE2DA | #465149 |
| Strong input boundary | #6E756F | #AFA799 |

Green/amber/brick/blue status pairs remain separate semantic tokens, tested for normal-text contrast in both palettes. A green button means an action, not a verified recycling answer. Unknown and partial data use explicit words and confidence.

## Type and layout

Atkinson Hyperlegible Next: regular 400 for body, semibold 600 for controls/section headings, bold 700 for display/titles. IBM Plex Mono 600 is reserved for identifiers and confidence values.

Base scale: display 34/38, title 28/34, heading 20/26, body 17/24, small 14/20, label 16/20, mono 12/17. No font-scaling cap. Do not add fixed text heights or line-count clipping.

The reading column is at most 560 points with 20-point side gutters. Main spacing is 4/8/12/16/24/32/48; reading surfaces use 20-point inset. Surface radius 22, controls 14, small status labels 8. Minimum targets 44, normal buttons 56 high and manual-entry row 60 high. Safe areas remain native.

## Hierarchy

Home: compact brand/language → task introduction → prominent scan → manual entry → privacy → guide/history → legal/jurisdiction.

Result: task title and compact product name/community qualification → part identity → destination or safe recovery → confidence → preparation/explanation/exceptions → complete source, jurisdiction, checked date, rule version and verification. No part is hidden or dropped. Provider identity, retrieved date, OFF attribution and licence links follow.

General material drawings are decorative. Unknown material uses a question mark, not an invented material. They are hidden from native and web accessibility trees via platform-appropriate properties.

## Interaction and accessibility

Immediate pressed opacity; visible input focus and error boundaries. Native navigation keeps the tested reduced-motion branch. No new decorative animation, continuous camera sweep, timer, blur or looping artwork. No claim of measured frame rate or battery improvement.

Language radios expose both native checked state and aria-checked. Internal routes are buttons; external sources are links. Manual inputs retain explicit labels, numeric keyboard, validation and high-priority iOS error announcements.

Existing numerical engine confidence remains visible alongside its textual tier; it is not a calibrated probability. The earlier document's claim that percentages were absent did not match code and is corrected here. A confidence-policy change is outside this visual work unit.

## Visual QA

Browser evidence spans Finnish/English and 320/390/1280-wide viewports, with exact flow/date limitations recorded in `docs/final/design-refresh-evidence.md`. Dark-palette contrast is automated; native dark/large-text and camera appearance are not yet visually accepted. Follow that evidence file rather than inferring native readiness from a web screenshot.
