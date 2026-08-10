# Design system — Material Ledger

## Color tokens

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| Canvas / `frost` | `#F2F6F5` | `#071E23` | Screen background |
| Surface | `#FFFFFF` | `#102B31` | Camera/result surfaces |
| Ink | `#102E34` | `#F4FAF8` | Primary text |
| Muted ink | `#496268` | `#B8C9C6` | Secondary text; verify AA by size |
| Action cobalt | `#2456D3` | `#7FA2FF` | Primary controls/focus |
| Verified pine | `#176B55` | `#65D0AB` | Verified state with text/icon |
| Uncertain amber | `#9A6200` | `#F2BF58` | Partial/ambiguous state with text/icon |
| Error brick | `#A52F35` | `#FF8E92` | Error state with text/icon |
| Divider | `#CAD8D5` | `#315057` | Structure |

Contrast must be checked in implementation; status is never color-only.

## Typography

- Display/heading/body: Atkinson Hyperlegible Next, regular/bold, system font fallback. Dynamic text is never disabled.
- Utility/provenance: IBM Plex Mono, medium; GTINs use tabular presentation and may wrap/copy.
- Scale (base): 32/38 hero, 24/30 title, 20/26 section, 17/24 body, 15/21 support, 13/18 utility. Layout must reflow at platform accessibility sizes rather than clipping.

## Spacing and shape

- 4-point grid: `4, 8, 12, 16, 24, 32, 48`.
- Primary touch targets: minimum 48×48 dp, separated by at least 8 dp.
- Surface radius: 18 for camera/wide surfaces, 12 for controls, 999 only for compact status tags. Component results use dividers/seams, not a stack of floating cards.
- Edge-to-edge background; all controls respect safe/gesture insets.

## Component hierarchy

1. Answer/destination.
2. Component identity and preparation.
3. Status/confidence in plain language.
4. Source, checked date, and explanation.
5. Correction/inspect-next action.

## Motion and haptics

- Barcode decoded: one short success haptic; no continuous scan vibration.
- Result: 160–220 ms opacity/8 px translation; immediate content and fade-only under reduced motion.
- Sorting seam may draw once as result appears, never loop.
- Skeletons preserve final geometry. No animation delays the answer or blocks input.

## Accessibility behaviors

- Result update uses native announcement/live-region behavior without stealing focus unexpectedly.
- Component row reads as: component, destination, status, preparation, source/date.
- Camera controls have visible text in addition to icons; torch state is exposed.
- Permission denial includes “Avaa asetukset” and equally prominent manual entry.
- Confidence labels: `Tarkistettu sääntö`, `Osittaiset pakkaustiedot`, `Tarkista pakkauksesta`, `Ei tietoa`; no percentages in consumer UI until calibrated.
