# Combined identification hub — October 29, 2026

## Delivered scope

Owner request: group barcode and AI under Home's Skannaa tuote card, leading
to the Identify tab, with barcode scanning first/largest, manual barcode next
and AI recognition third. Continued locally from `b2fc482` on
`codex/illustrated-functional-integration`; no GitHub publication.

- Home title **Skannaa tuote** and detail **Lue viivakoodi tai käytä
  tekoälytunnistusta** are real localized UI/accessibility strings. Equivalent
  EN: Scan an item / Read a barcode or use AI recognition. The card now opens
  `/identify`, with the real Identify tab selected, not `/photo`.
- Neutral scan-frame symbol and unchanged decorative leaf/bottle artwork.
  Existing small direct barcode shortcut and manual footer link are retained.
- Identify offers **Skannaa viivakoodi**, **Syötä viivakoodi käsin** and
  **Tunnista tuote tekoälyllä**, in reading, keyboard and vertical visual order.
  First is a 176-point-minimum mint action with 22/28 bold title; next two are
  clear white grouped rows. All three lead to their existing routes and return
  to Identify with its selected tab.
- At widths below 360 or native font scale above 1.2, primary contents stack
  and secondary decorative icon columns are omitted. Words/controls/AI
  uncertainty are not hidden or truncated. Actual 320-pixel browser assertions check
  the absent columns and at least 150-pixel label width; no native Dynamic Type
  acceptance is inferred.

The redesign-existing-projects/frontend-design approach keeps the current
visual system while improving hierarchy and plain action copy; no new design
library, artwork, animation or framework. This supersedes the previous
photo-first discovery order, not the existing feature/safety implementations.

## Preserved boundaries

Hub rendering, direct URL and tab selection are passive navigation. No camera
or GPS permission, media/location acquisition, lookup/capabilities request,
upload or paid inference is initiated. Barcode/manual still use current GTIN
validation/application services. AI wording stays estimated, materials need
independent review, and the existing photo route keeps separate capture/send
consent, unsafe/unknown refusal and sourced confirmed guidance.

No provider/model/prompt, shared contract, backend, rule, point dataset, storage,
native configuration, dependency, lockfile, signature or installed app changes.
No actual photo/barcode/GPS/address was collected. No new account, funding,
database or external blocker. Existing security/PHOTO-003/production NO-GO
findings remain. Installed client 3 expiry stays November 4 at 20:28:39 Helsinki;
the Mac/LAN Debug dependency is unchanged.

## Validation

- Full pinned `pnpm validate`: **410 unique cases (94 source policy + 316
  application)**, all mandatory boundaries, format/lint/strict types,
  package/API builds and **16 exported routes** pass.
- Scoped `pnpm validate:mobile`: **240 overlapping cases** and scoped checks/
  build pass. Standalone mobile typecheck and 7 localization cases also pass.
- Five new source-policy cases cover Home gateway, retained shortcuts,
  three-method order/routes, passive/scalable/back/tab semantics and FI/EN
  action/uncertainty strings. Tests inspect bounded source literals without
  importing private package internals or executing them.
- Actual integrated-navigation browser suite passes FI/EN Home→Identify,
  selected tab, DOM/visual order, relative height/type/surface prominence,
  all three entry/back paths, direct-URL/tab reentry, no implicit camera/GPS/API,
  44-point controls, dark 320-pixel layout and synthetic 130% text. Screenshot review passes;
  narrow secondary columns were improved after first visual inspection.
- All **five actual-Metro browser suites pass** on final source: integrated
  navigation, reference Home, whole-app refinement, photo recognition and nearby.
  Existing local search/history, invalid/no-request, unknown/ambiguous/offline/
  provider errors, attribution/provenance, explicit consent/material correction
  and one-shot location intent remain covered. Fixtures are isolated; no real
  photo/GPS or paid request. FI/EN light/dark, 320/390/1280 and synthetic 130%
  text are separately browser evidence, not native acceptance.

Ignored receipts in `work/identify-hub-2026-10-29/`:
`validate-mobile.log`, `validate.log`, final `validate-final.log`,
`navigation-first.log` and final
`navigation.log`, `reference.log`, `refinement.log`, `photo.log`,
`nearby.log`. Snapshots: `navigation/`, `reference/`, `refinement/`;
the unchanged photo/nearby runners retain `work/photo-qa/` and
`work/nearby-ux-qa/`. These QA receipts/images are ignored, not application data.
Earlier policy failures occurred before implementation (expected missing
feature route/labels); no safety assertion, timeout or quality gate was skipped.

## Acceptance limits and next action

Browser fixtures do not establish native Dynamic Type/VoiceOver/camera/torch,
permission lifecycle, barcode conditions, model/material accuracy, performance/
battery or release/store readiness. No native reinstall or fresh phone pass is
claimed. Next is exactly the bounded installed-client-3 navigation smoke in
NEXT_ACTION, without a real scan, photo upload, GPS or paid call.
