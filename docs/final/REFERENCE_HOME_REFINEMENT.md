# Reference Home refinement — 2026-10-28

Roope asked to follow the supplied KeepItGreen Home screenshot more closely.
This continues local `codex/illustrated-functional-integration` after `b0d3c02`,
not a GitHub publication, full private-history merge or second demo app.

## Implemented composition

Taller illustrated header/leaf/wordmark, overlapping rounded local search with
barcode shortcut, main blue-camera photo card with bottle cutout, compact
nearby/guide tiles, pastel material shortcuts, nearby section, real recent
history and four bottom tabs. Home/tab typography uses platform sans-serif;
subpages keep their existing accessible font system. Large native text removes
overlaid art/arrow, stacks tiles/history and expands chip columns. No animation,
library, font download, backend/shared/native or dependency change.

The reference's example Rinki/K-Supermarket photos, Helsinki addresses, distances
and “open now” are not shipped data. Home never automatically starts GPS or
provider lookup. The current sourced five-point/material/map flow remains behind
explicit location search. Settings is not relabeled as a nonexistent Profile.

The four shortcuts and bounded FI/EN search select existing editorial material
guides, not verified product identities, materials or bins. Unknown/unsupported,
overlong/control-character/malformed/repeated query input has no fabricated match
and offers reset. Source/date/deposit caveat remains unchanged. “Browse materials”
does not imply measured popularity. No new battery/electronics rule was invented.

History shows at most two distinct, valid, actual opt-in records. GTIN/status/date
are validated and names bounded. It displays lookup status, never an inferred
destination/image. Disabled/empty/read-error states are explicit. Clear previous
names before asynchronous refresh and ignore blurred results; only explicit
reopen repeats the lookup. Manual entry and factual Privacy remain available.

Existing photo consent, separate send, unselected per-part material correction,
conditions confirmation, unknown/risky recovery and full rule/source evidence
remain unchanged. The redesign does not improve or certify AI material accuracy.

## Validation and observed repairs

Eight new pure cases (five search, three history) and two new policy cases;
existing accessibility/presentation policies updated to the intentional hierarchy.
Independent review identified large-text photo-arrow overlap, fixed-column chips
and transient stale-history previews. Those code paths were repaired.

Visual QA found a utility-heading word splitting at synthetic 130% text; reducing
decorative icon width and reallocating text space repairs it without font caps.
Earlier runner failures (obsolete result ID, prior-route heading wait, repeated
icon selector and intermittent reload wait) are retained in ignored evidence,
not reported as passed or native app defects. Final observed receipts are in
`TEST_EVIDENCE.md`, with logs/screenshots in `work/reference-home-2026-10-28/`.
Fixtures never become runtime product/place/history data.

No new physical capture/GPS/address collection or paid app recognition call.
Current local Metro 8093 and API 3003 health/photo-enabled checks pass, not a
real-model/camera or native-all-flow acceptance. Installed build remains 3;
profile expiry remains November 4 at 20:28:39 Helsinki. JS/art changes do not
renew a profile or prove standalone operation. Production remains NO-GO.

## Decorative asset and exact prompt

Saved project asset: `mobile/app/assets/backgrounds/photo-bottle-v1.png`.
Built-in image-generation tool, following imagegen; no API key/CLI fallback.
1087×1447 PNG with verified alpha, 916,816 bytes. SHA-256:
`758d97337078e36687e98e3d177a4c35d6dc42ea61b70e940c1321e635e4b6f5`.

Image 1 edit target: existing `scan-illustration.png`.
Image 2 layout/style reference only: owner's
`codex-clipboard-f3683725-d269-44b3-8253-872cf3eed572.png`.
The original three approved assets remain unchanged. Generated art was visually
inspected: one bottle/hand, four corners, no phone/text/UI; alpha verified.
Decorative illustration is not real packaging, test input or a recycling claim.
Prior brand/asset/store-rights review limits are unchanged.

Exact built-in prompt:

> Use case: precise-object-edit. Asset type: decorative cutout illustration for the right half of a mobile recycling app camera card. Image 1 is the edit target: preserve its polished soft illustrated style, blue-capped clear plastic bottle, green sleeve and warm natural skin. Image 2 is the layout/style reference ONLY: match the isolated hand-holding-bottle illustration in its 'Skannaa tuote' card, NOT the whole screen. Remove the phone entirely. Show one anatomically plausible hand in a green sleeve holding just one clear slightly tilted blue-capped empty bottle, with four small green camera framing corners around the bottle and two subtle green accent strokes near its upper left. Hand enters from bottom, bottle cap points upper right, compact vertical cutout with no broad empty margins. No barcode, no text, no logo, no UI, no card, no people, no landscape. Genuinely transparent background, retain clean anti-aliased alpha. Preserve the original illustration's lighting and visual style.
