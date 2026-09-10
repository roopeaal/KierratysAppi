# Mobile design reference study — 2026-09-08

Research accessed 2026-09-08; implementation and final checks completed 2026-09-10. Scope: the owner's request for a distinctive, clean, polished existing app, not a new product or an SDK migration. Earlier recycling/licensing research was not repeated.

## Published references and evidence limits

| Reference | What was inspected | Useful lesson for KierrätysAppi |
| --- | --- | --- |
| [Yuka](https://yuka.io/en/app/) | Official app page and its food-result screenshot, visually opened in the browser. Compact product identity, thin row separators, small secondary text and persistent scan access. | Use explicit type hierarchy and task priority. Do not import health ratings, their methodology, or a green certainty signal into recycling inference. |
| [Too Good To Go](https://www.toogoodtogo.com/en-gb/how-does-the-app-work) | Official workflow and a published promotional app composition, visually inspected: restrained dark green, neutral surfaces and content-led imagery. This is marketing artwork, not a hands-on verification of the current installed app. | Give the primary action a recognizable brand treatment and supporting information quiet space. Do not copy merchant cards, rewards, impact figures or proprietary assets. |
| [Bower](https://getbower.com/for-users) | Official scan → sort → reward workflow. The image request was unavailable and the App Store page returned an error in the browser, so no current screenshot-quality claim is made. | Keep scan-to-answer short. Rewards, tracking and gamification are not needed for this anonymous sorting utility. |
| [Scrapp](https://www.scrappzero.com/products/mobile-app) | Official description of barcode/manual lookup, local rules and component separation. The image CDN was blocked by browser security; no alternate route was attempted. Accessibility claims are the vendor's, not independently verified here. | Keep packaging parts separate and communicate the applicable jurisdiction. Do not borrow environmental-offset or verification claims. |

These are interface/workflow references, not independent certifications of the competitors' production readiness. No competitor imagery, text passages, product scores or commercial relationships were imported.

## Chosen direction: a quiet packaging utility

Neutral off-white, deep forest actions, white reading surfaces and original small package line drawings. A single prominent scan control makes the app recognizable without a marketing-style hero. Atkinson Hyperlegible Next stays for legibility and identity; its existing semibold asset adds hierarchy between regular body and bold titles. Status colors retain their meaning and are never the sole signal.

The result preserves every component, including unknown ones, in source order. Compact product identity supplies context; provider/licence details stay below the sorting guidance. Full rule evidence is not put behind a disclosure or removed to make screenshots shorter.

## Audit and implementation review

| Before | After | Why |
| --- | --- | --- |
| 40/43 headline and a long introductory paragraph | 34/38 question, concise task explanation and food-only scope on the scan control | Exposes the actual task earlier without broadening product coverage |
| Green/cobalt split brand mark, cream borders and many all-caps labels | Monochrome package mark, neutral canvas, forest action/link colors and sentence-case guidance labels | Creates one visual language |
| Two equal, stacked primary-looking actions | One distinctive scan panel, then a 60-point manual-entry row | Makes the main path obvious while keeping the alternative immediate |
| Large empty history section before the guide | Compact guide and history rows, with truthful saving-on/off text | Useful navigation without fabricated recent activity |
| Heading, nested card and tinted destination panel for each component | One reading surface per part, clear part identity, compact destination and preserved uncertainty/provenance | Reduces container nesting without concealing evidence |
| Oversized unknown-state heading | Normal-sized recovery instruction plus explicit no-rule statement | Unknown data remains prominent without consuming the whole result screen |
| Weak input boundary and no distinct focus treatment | Strong boundary, active focus color, inline error and helper text | Makes empty/focused/invalid input states identifiable |
| Radio selection depended only on native accessibilityState | Matching aria-checked plus native state | Browser DOM inspection found the selected state was not exposed |
| Generic camera hash and full-width scan line | Original barcode linework and a quiet stationary target | No decorative progress simulation or repeating animation |

## Tools and trade-offs

- Existing Expo / React Native / StyleSheet components: no framework migration or native-module dependency.
- Existing font package: one additional bundled 600 weight, no remote font request.
- Original native View-based linework: scales cleanly, no downloaded artwork or AI-generated product photos, and no claim that a generic drawing is the observed package shape.
- CUA browser inspection: actual routes, Finnish/English, screenshots, DOM/overflow and input interactions.
- Pinned pnpm, TypeScript, Vitest and repository-policy tests: behavior, contrast and evidence-retention checks.
- No new paid tool, plugin/account setup or Figma dependency was required. A future Figma library could support multi-designer collaboration but would not substitute for testing the real native UI.
- The redesign-existing-projects and emil-design-eng skills informed the audit-first, existing-stack approach and the decision to omit decorative motion. Existing reduced-motion navigation remains; barcode art has no timers, animated scanning sweep, parallax or loop.

## Acceptance boundary

This work is implemented and browser-validated, not approved for release. Native dark mode, largest Dynamic Type, the revised live camera/torch surface, full VoiceOver/TalkBack, and battery/performance still need physical evidence. See `docs/final/design-refresh-evidence.md`.
