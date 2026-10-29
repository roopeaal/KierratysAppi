# App-wide design consistency — October 29, 2026

## Scope and outcome

Roope approved making the other screens consistent with the illustrated Home.
Work starts at `bd0d7a0` on the existing local
`codex/illustrated-functional-integration` branch. No GitHub publication.

The same design language now covers Home and all thirteen functional routes:
Identify, Settings, manual, scan, result, guide, material-code, component,
nearby, history, feedback, legal and photo. These are real current flows, not
a second demo application or an import of the private repository's services.

## Design choices

- One scalable platform sans family for every text role and ordinary field;
  IBM Plex Mono remains intentional for codes/identifiers. Home's font alias
  points to the shared export. Unused Atkinson startup loading and visible
  overrides are removed; package versions and lockfile are unchanged.
- Shared light mint `#F5FCFA`, navy `#142C39`, secondary slate `#59688A`
  and link `#435D95`; dark counterparts remain separately contrast-tested.
  Home derives these aliases from the shared palettes. Semantic warning/error/
  information colors are not replaced with decorative green.
- Compact leaf/back headers, 22-point reading surfaces, rounded action controls
  and the same original camera/location/recycling symbols. No new image,
  animation, runtime library or remote font. Existing local leaf artwork remains
  decorative.
- Identify has a prominent mint photo entry and separate barcode/manual
  alternatives; Settings groups actual language/history/guidance/privacy
  controls. The manual form has a focused white surface. Guide/legal/history
  remain readable sections/lists; result/source content and camera overlays
  are not converted into illustrated marketing cards.
- Header/row/button/link keyboard focus has a canvas gap and an outer ring,
  rather than only changing the edge of an already dark filled button. Native
  text remains uncapped, labels wrap, disabled/busy states and minimum targets
  remain. Identify stacks its feature content at narrow/native-large text.
- Independent screenshot review found white corners outside dark rounded
  navigation. The theme now paints its root surface too; source and computed
  browser regressions guard the repair.

The redesign-existing-projects and frontend-design skills informed the
audit-first, existing-stack approach: unify the strongest visual seams and keep
the illustrated signature on Home, rather than decorating every answer.

## Preserved behavior and safety

No backend/shared/public contract, rule, directory, model, prompt, consent,
data-retention, dependency, native configuration or technical identity change.
Every rule/provider field, uncertainty and recovery remains. AI results stay
inferred, sending remains explicit and each eligible part still needs an
independent material choice and conditions confirmation. Unknown/unsafe parts
do not become verified guidance. No automatic GPS, real photo/address/history
inspection, paid recognition call or upload was used.

## Validation

Pinned pnpm 11.16.0, existing host Node 26.4.0; CI runtime pins unchanged.

- `pnpm validate:mobile`: **240 overlapping cases**, scoped boundaries,
  format/lint/types and build pass.
- `pnpm validate`: **405 unique cases (89 repository policy + 316
  application)**, boundaries, format/lint/strict types, package/API builds and
  **16 exported web routes** pass.
- **Nine new source-policy cases** cover shared font/mono distinction, derived
  palettes, thirteen pages, decorative leaf/back labels, original icons,
  semantic warnings/errors, photo/camera safeguards, separated focus ring and
  theme-painted navigation root. These are not render tests.
- All **five actual-Metro browser suites** pass: whole-app refinement, reference
  Home, integrated navigation, photo recognition and nearby UX. Fixtures are
  isolated; no paid/live image provider or user coordinates.
- Expanded whole-app suite compares actual computed Home/subpage sans family,
  heading ink and canvas; guide/feedback fields use the same sans. It asserts
  the separated primary-action focus ring and dark navigation-root background.
  Reading/form/Identify/Settings/Nearby pages are checked at 320/390/1280 widths,
  plus FI/EN, live dark mode and synthetic 130% text. Existing invalid/no-request,
  offline/provider/missing/unknown/ambiguous, provenance, history/draft/deletion,
  local search and photo-material corrections remain.

Ignored evidence root: `work/app-design-consistency-2026-10-29/`.
Final full/scoped logs: `validate-complete.log`, `validate-mobile-final.log`.
The prior final-source `validate-final.log` also passes; the complete rerun
includes the later browser-failure diagnostics. Final format check passes in
`format-final.log`.
Browser logs: `refinement-verified.log`, `reference-accepted.log`,
`navigation-accepted.log`, `photo-accepted.log`, `nearby-accepted.log`.
Latest whole-app screenshots: `accepted/refinement/`.
Reference Home screenshots: `final/reference/`; the other three existing
runners retain their documented `work/illustrated-integration-qa/navigation/`,
`work/photo-qa/` and `work/nearby-ux-qa/` snapshot directories. Screenshots,
logs and QA data are not shipped or committed.

Earlier scoped formatting/import-order checks failed and were repaired with the
existing formatter, without suppressions. Initial visual review's dark corner
defect is retained as a documented finding and regression. Earlier 403-case and
browser passes predate the final focus/root refinements; they are not substituted
for the final evidence above. One concurrent final browser attempt times out
waiting for the manual field after offline recovery; its failing
`refinement-final-pass.log` is retained. Added bounded route/ready-state/heading
diagnostics and a failure screenshot without retry or weaker assertions, then
ran the suite separately after builds/other browser jobs completed. No precise
root cause or flake-free CI is claimed. Green fixtures are not model-accuracy
evidence. The two existing literal-source-pattern lint warnings in
`location-privacy-policy.test.mjs` are unchanged; lint still exits successfully.

## Not established

No fresh native all-page interaction, Dynamic Type, VoiceOver, camera/torch,
permission/GPS/geocoding/map handoff, semantic material accuracy, battery or
performance acceptance. The previous physical Home pass does not certify these
new detail-page layouts. No new binary/signature/install was necessary for JS,
but no claim that an unobserved phone has already loaded it is made.

Existing installed client 3's profile expires **November 4, 2026 at 20:28:39
Helsinki**; this work does not renew it. Debug still needs Mac/LAN Metro/API.
SDK patch expectations, dependency security findings, PHOTO-003 and all existing
public-production NO-GO gates remain open. No fresh security audit, paid
evaluation, release build, store submission or GitHub write.

Next: the single bounded physical visual/navigation smoke in NEXT_ACTION.
