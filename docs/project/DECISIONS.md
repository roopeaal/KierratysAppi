# Decision log

## D-001 — Accuracy is a domain invariant

- Date: 2026-08-10
- Status: accepted
- Decision: every sorting result must expose provenance, jurisdiction, rule version, checked date, verification status, confidence tier, and an explanation. Unknown and ambiguous are first-class results.
- Reason: sorting guidance is the trust-critical product output; hiding uncertainty creates unacceptable misinformation risk.

## D-002 — Begin from the empty private repository

- Date: 2026-08-10
- Status: accepted
- Decision: initialize `main` locally with the supplied repository as `origin`; preserve `work/` and `outputs/` as ignored Codex workspace directories.
- Reason: the remote has no commits or default branch, so there is no existing code or history to preserve.

## D-003 — Expo SDK 57 with Node 24 LTS

- Date: 2026-08-10
- Status: accepted
- Decision: use Expo 57, React Native 0.86, Expo Router, Continuous Native Generation, `expo-camera`, strict TypeScript, and development builds. Pin Node 24 LTS for production/CI even though local Node 26 can execute the workspace.
- Reason: official Expo setup names SDK 57 and Node LTS; Node 26 remains Current in August 2026.

## D-004 — Framework-independent services composed by Fastify

- Date: 2026-08-10
- Status: accepted
- Decision: use Fastify 5 as a small HTTP composition root around shared Zod contracts and application services. PostgreSQL is the production system of record behind repositories; deterministic in-memory adapters support local tests.
- Reason: it provides validated, observable HTTP boundaries without NestJS ceremony or an early managed-provider/account lock-in.

## D-005 — Isolate provider records and licences

- Date: 2026-08-10
- Status: accepted
- Decision: retain Open Food Facts, future GS1, internal verification, and user observations as attributable layers. Never flatten them into an untraceable database; do not bulk-cache/mix OFF data pending licence review.
- Reason: field-level trust and ODbL/proprietary-data compatibility require explicit provenance and isolation.

## D-006 — Rinki rules with Palpa deposit precedence

- Date: 2026-08-10
- Status: accepted
- Decision: seed only source-reviewed nationwide plastic/carton/glass/metal packaging rules. Known deposit return wins; a bottle/can with unknown deposit status returns an inspection question.
- Reason: material alone cannot establish Finnish return destination, and Palpa coverage is product/system-specific.

## D-007 — Material Ledger design direction

- Date: 2026-08-10
- Status: accepted
- Decision: use a cool mineral canvas, cobalt actions, pine only for verified states, amber for uncertainty, Atkinson Hyperlegible Next, IBM Plex Mono metadata, and a component “sorting seam” signature.
- Reason: it makes component/action/evidence relationships clear, supports large text and screen readers, and avoids generic eco/AI styling.

## D-008 — GTIN lookup uses a POST body

- Date: 2026-08-10
- Status: accepted
- Decision: expose `POST /v1/recycling/lookup` instead of a GTIN path/query endpoint; disable routine Fastify request logs and return `private, no-store`.
- Reason: access logs, proxies and browser history commonly retain URLs. A bounded validated body materially reduces accidental scan-history logging.

## D-009 — No telemetry vendor by default

- Date: 2026-08-10
- Status: accepted
- Decision: ship a no-op typed technical-event boundary whose runtime guard rejects GTIN/barcode/product name/photo/location/free text. Enable a vendor only after consent/processor/retention decisions.
- Reason: operational observability is useful, but raw recycling behavior is not necessary for the product and may become personal profiling.

## D-010 — Time-bound Metro parser risk acceptance

- Date: 2026-08-10
- Status: accepted until 2026-09-10
- Decision: accept only `GHSA-w3rx-r6r6-pgpr` and `GHSA-5p2g-fcmc-qvqq` in the build-tool audit while the declared patched `image-size@2.0.3` is unpublished; all other high/critical findings fail.
- Reason: Metro handles repository-controlled assets, not runtime uploads. A forced unpublished override is impossible; an expiring CI exception preserves visibility and forces re-review.

## D-011 — Typed material-code recognition precedes OCR

- Date: 2026-08-10
- Status: accepted
- Decision: parse a conservative Decision 97/129/EC identifier subset locally, require the user to confirm the visible mark, and retain the official scheme plus local-observation provenance. Conflicts, multiple codes, undefined values, and composites that lack a reviewed rule do not receive guessed guidance.
- Reason: this delivers the deterministic value of label recognition without collecting an image or binding the product to an unapproved OCR/cloud workflow; a material mark also cannot establish shape, deposit, or collection eligibility by itself.

## D-012 — Fresh Expo patches do not bypass the release-age gate

- Date: 2026-08-10
- Status: superseded after the gate passed on 2026-08-22
- Decision: retain the aged Expo 57.0.11, constants 57.0.9, router 57.0.11, splash 57.0.5 and compatible transitive pins until the four newer SDK patches pass the repository's minimum-release-age policy. Do not use Expo dependency exclusions or an age-policy bypass merely to make Doctor green.
- Reason: the compatible patches were published only hours before the audit. A deliberate 19/20 diagnostic is safer and more truthful than consuming unaged supply-chain inputs or hiding the mismatch.

## D-013 — Adversarial audit result is NO-GO

- Date: 2026-08-10
- Status: accepted
- Decision: the repository is not production-ready despite passing local validation. Native binaries/devices, infrastructure/recovery/monitoring, accountable content/legal/licensing approval and complete store evidence are release gates, not post-release follow-ups.
- Reason: source-level checks cannot establish camera reliability, signed-binary behavior, production operations, lawful publication or store acceptance.

## D-014 — Start iPhone validation with a local Personal-Team build

- Date: 2026-08-10
- Status: accepted for physical development validation
- Decision: install Xcode 26.6 and use `expo run:ios --device` with automatic local signing. A free Apple Personal Team is sufficient for this device-only stage; do not invoke EAS or a paid Apple Developer operation unless local compilation is proven incompatible.
- Reason: Expo SDK 57 requires Xcode 26.4+ and supports iOS 16.4+. Apple and Expo document local device builds as the only development-build route that can use free Personal-Team provisioning; it produces stronger native evidence at lower cost than a cloud build.

## D-015 — Treat Personal-Team builds as expiring test fixtures

- Date: 2026-08-22
- Status: accepted for local device validation
- Decision: record free Personal-Team artifacts as seven-day development fixtures that require an owner-controlled account, renewed provisioning, reinstallation and device trust after expiry. They may establish named physical behaviors but never archive, TestFlight, distribution or unattended-runtime readiness. Keep the local Metro/API dependency explicit in every development-run claim.
- Reason: the first installed artifact expired after seven days and iOS correctly rejected it. A renewed Xcode build passed strict recursive signing, installed and launched after the owner restored account/trust state. The observed lifecycle makes any durable/release claim from this artifact misleading.

## D-016 — Enforce a strict one-day dependency release age

- Date: 2026-08-22
- Status: accepted
- Decision: configure pnpm with `minimumReleaseAge: 1440` and strict mode for all direct and transitive dependencies, without a broad exclusion. Once a supported Expo patch set clears that age, require lockfile supply-chain verification, peer checking, `expo install --check`, Doctor 20/20 and full validation.
- Reason: the earlier policy named an age gate but did not encode its duration. Pnpm 11 documents 1,440 minutes as its supply-chain delay default; explicit strict configuration makes failure deterministic. The six current Expo patches were more than one day old and passed the complete compatibility gate.

## D-017 — Use explicit iOS announcements for dynamic native status changes

- Date: 2026-08-26
- Status: accepted
- Decision: retain visible React Native alert/live-region semantics, but also provide every current dynamic status screen an explicit iOS accessibility announcement. Every text input has its own localized `accessibilityLabel` even when associated visible label metadata exists. Loading is queued at default priority; terminal results and recovery errors use high priority so stale focused-control speech cannot suppress the state change.
- Reason: physical VoiceOver testing showed that `accessibilityLabelledBy` did not name the manual field on iOS, `accessibilityRole="alert"` did not announce its new validation message and a known-product completion left VoiceOver speaking the earlier submit button. A default explicit announcement was also interrupted by button focus, while the high-priority manual repair read the complete recovery instruction. The implementation and regression policy reflect observed behavior rather than assumed cross-platform parity.

## D-018 — Development-client profiles require the native client dependency

- Date: 2026-08-28
- Status: accepted
- Decision: every EAS profile with `developmentClient:true` must have an SDK-compatible `expo-dev-client` runtime dependency, and a repository-policy test enforces the relationship. Local physical validation uses a freshly prebuilt/pod-installed client whose app and embedded frameworks pass strict signature verification.
- Reason: the profile previously promised a development client but built a plain Debug shell. It initially launched only while a script URL happened to be available, then failed with `No script URL provided` and could not recover reliably after Metro/lifecycle changes. The missing native runtime was a source defect, not an Apple-account or device-trust issue.

## D-019 — Mobile guidance is answer-first and evidence-complete

- Date: 2026-08-28
- Status: accepted
- Decision: Home shows scan and manual entry before history/guide/supporting content. Product results show component sorting guidance before product identity/provider metadata. Resolved destinations precede confidence and explanation; ambiguous/unknown results localize every destination/reason and show full rule evidence or explicitly state that no verified rule was applied. Product/provider/licence data remains visible below the action and is not removed.
- Reason: the prior decorative Home mark delayed the primary task, and the result hero required users to parse Nutella metadata before seeing where the package belongs. Raw enum labels and incomplete ambiguous/unknown rule disclosure also weakened localization and the trust invariant. Browser plus physical iPhone comparison showed the revised hierarchy surfaces the actionable destination in the first result viewport without hiding uncertainty or provenance.

## D-020 — Close obsolete security exceptions and fail closed on audit errors

- Date: 2026-09-04
- Status: accepted
- Decision: use compatible transitive fast-uri patches within the existing 3.x and 4.x parent ranges, with regression-tested security floors. Remove the old image-size advisory exceptions because the updated Metro graph no longer contains that dependency. Reject every high/critical finding and reject missing, malformed, inconsistent or failed registry responses; bound the audit subprocess to 60 seconds.
- Reason: the new lockfile audit found four high advisories affecting both installed fast-uri majors. Eligible upstream patches existed, so no exception or compatibility-breaking override was justified. The previous audit parser could treat an error-shaped JSON response without advisories as an empty successful audit.

## D-021 — Gate Xcode 27 adoption on actual scene-lifecycle compatibility

- Date: 2026-09-08
- Status: accepted for development recovery; UIScene migration pending
- Decision: compile the current app with Xcode 26.6 through explicit `DEVELOPER_DIR`; retain Xcode 27 beta alongside for tested device tooling. Do not adopt the iOS 27 SDK until Expo prebuild reproducibly configures a complete scene lifecycle, deep links and startup/relaunch tests pass. No system Xcode default changed.
- Reason: beta compilation, signatures and installation all passed, but the physical app immediately trapped in UIKit's no-scene-lifecycle enforcement before Metro connection. Reinstalling the older SDK artifact restored Home and known-product lookup. This is a locally reproducible compatibility defect, not signing expiry or a need to upgrade macOS. See `docs/final/XCODE_27_VALIDATION.md`.

## D-022 — Prioritize a distinctive, evidence-preserving visual refresh

- Date: 2026-09-10 (research/implementation started September 8)
- Status: implemented and browser-validated; physical acceptance pending
- Decision: follow the owner's explicit visual priority before the separate UIScene migration. Use neutral/forest semantic tokens, the existing Atkinson semibold asset, original native linework and compact task-first Home navigation. Keep every packaging part, textual confidence, explanation and source visible; no evidence accordion, fake imagery, scores, rewards or impact metrics. Add only compact product identity ahead of the component list; full provider/licence metadata still follows guidance, refining D-019 rather than reverting to a product-metadata hero.
- Reason: direct 390-point inspection showed that a long 40-point headline, duplicate labels and nested boxes delayed the action. Yuka/Too Good To Go reference visuals informed hierarchy/restraint, while Bower/Scrapp workflows informed scan/component emphasis. No new library/plugin/account was needed. Browser inspection also justified explicit web checked-state attributes on all current radios. The 181-test pass is not native visual or release acceptance.

## D-023 — Rename the product without changing installation identity

- Date: 2026-09-10
- Status: owner-requested; source/browser complete, native launcher acceptance pending
- Decision: use KeepItGreen for default/localized display names, accessible and visual wordmarks, current privacy copy and store drafts. Retain the repository slug, technical package/bundle IDs, URL scheme and local-storage namespace. Historical evidence is not retroactively renamed. Brand availability/rights remain a separate OA-10 approval.
- Reason: this fulfills the owner's name choice while avoiding a second app identity or stranded local data. Launcher labels require a fresh native build; a JS update is not sufficient. Free Personal-Team seven-day renewal and the current Mac-hosted Metro/API dependencies remain explicit; no year-end unattended-runtime claim or paid/public action is implied.

## D-024 — Synchronize the existing private repository on owner request

- Date: 2026-09-10
- Status: implementation push verified
- Decision: interpret the explicit request to bring the KierratysAppi repository up to date as authorization to fast-forward the existing private GitHub `main` with the validated local commits and current control files. Preserve the repository name/visibility, history and technical app identity; do not merge unrelated dependency branches, force-push or deploy the app.
- Reason: fresh fetch showed 13 local commits and no remote-only commits. Local validation passed again and the normal push was verified against GitHub's branch SHA. Source synchronization does not close native, legal, infrastructure, security or store release gates.

## D-025 — Repair live CI with compatible patches, not diagnostic exclusions

- Date: 2026-09-10
- Status: locally validated; native rebuild pending
- Decision: follow the actual GitHub Doctor result by updating Expo to 57.0.21 and Router to 57.0.20. Resolve newly returned high XML/YAML advisories with compatible transitive patches (xmldom 0.8.15/0.9.12, js-yaml 4.3.2). Preserve the 1,440-minute strict release age, all diagnostic gates and fail-closed/no-high-exception policy. Add regression floors and a guard against disabling Expo checks.
- Reason: the upstream compatibility response changed and the previously unavailable npm audit service resumed. All five selected releases are older than 24 hours; no major/SDK migration or new dependency capability is needed. Full 188-test validation, Doctor 20/20 and a real live security-policy pass replace the stale local evidence, but do not establish native runtime or release readiness.

## D-026 — Keep team-baseline work isolated from private experiments

- Date: 2026-10-06
- Status: owner-requested
- Decision: branch from KierratysAppi main `39f8aa6` and retain its existing UI/identity. Do not import newer KeepItGreen code/assets/history or publish to either repository without a separate push request.
- Reason: Roope explicitly selected the older team app as the development base.

## D-027 — Bundle a separately licensed point directory and keep location on-device

- Date: 2026-10-06
- Status: source implemented; native acceptance pending
- Decision: use an occasional bounded nationwide OSM import, distribute the complete normalized ODbL directory with attribution/transformation, and compute straight-line distance locally after a foreground-only action. Reject restricted/closed source tags; missing access, hours, accepted materials and coverage remain unverified. Warn on age of the older upstream/retrieval timestamp.
- Reason: this supplies real point coordinates without KIVO credentials, paid infrastructure, user-coordinate transmission or consumer load on public Overpass.

## D-028 — Free universal product routing without a bulk or proprietary database

- Date: 2026-10-07
- Status: source and contract implementation complete; release review remains
- Decision: use the official `product_type=all` lookup with at most one allowlisted sibling hop and a shared 12-read/minute quota/4.5-second deadline. Rebuild requests at fixed origins, bind GTIN/type, retain source-specific ODbL metadata, omit unreviewed sibling images and preserve unknown packaging/hazards. Keep existing memory-cache retention; do not install an unused database server or mix source datasets.
- Reason: food-only lookup excluded freely available beauty, pet-food and other product records. Publisher licensing/API documentation and a live official other-products example support this integration, not a universal coverage or production-ready claim.

## D-029 — Separate development installation from runtime acceptance

- Date: 2026-10-07
- Status: build/sign/install verified; runtime acceptance pending
- Decision: keep the team baseline on Xcode 26.6, use Xcode 27 beta only for device tooling, and update the existing bundle without uninstalling. Record profile expiry and integrity separately from iOS launch, permission/GPS behavior and retained local content. Do not replace this build with newer private-repository code or bypass a device trust prompt.
- Reason: source `487af03` compiles, verifies and installs, but iOS rejects its first launch with a generic security/trust error. A new profile and successful installation cannot justify a physical pass; the owner must check actual trust/verification, followed by a fresh runtime test.
- October 7 follow-up: owner confirmation followed by successful launch and persistent app process clears the trust gate without changing/reinstalling the app. Repair the separately expired XCTest helper rather than blaming/rebuilding the product; if UI transport remains unavailable, retain explicit unrun GUI/GPS rows and collect scoped owner observations without coordinates. No helper or private-repository implementation is added to the app.
- October 7 retry: a fresh session now verifies native Home/nearby introduction without another repair. Capture only pre-location screenshots and use result-presence checks rather than copying location-derived text. A subsequent system-modal accessibility timeout does not prove permission denial, missing results or an app defect; request the owner's actual prompt/result observation before assigning those outcomes.

## D-030 — A modest utility, not a marketing dashboard

- Date: 2026-10-08
- Status: implemented locally; latest native visual acceptance pending
- Decision: honor the owner's whole-app request through consistent back navigation, a single functional barcode signature, readable flat sections, restrained geometry and plain FI/EN copy. Retain the baseline palette/fonts and actual early-stage functionality. Do not add demo badges or fabricated maturity signals, hide legal/uncertainty notices, import private experiments, change dependencies or push without fresh authorization.
- Reason: the previous repeated brand headers, large decorative marks, uppercase captions and card stacks obscured the task. Short material labels and flexible radio layouts avoid Finnish compound-word clipping under synthetic large text. History's product-found status must not imply verified packaging guidance. Sources, rule metadata and local-only feedback limitations remain explicit.

## D-031 — Put disclosures at the decision, not in a Home slogan

- Date: 2026-10-08
- Status: implemented and browser-validated locally; native copy/layout acceptance pending
- Decision: remove the owner's identified blanket privacy sentence from Home/history without replacing it. Keep specific camera/barcode and location transfer purposes at their actions, complete legal/retention disclosures in legal, and source/uncertainty evidence with answers. Use direct FI/EN recovery instructions, not repeated status captions or internal storage/cache terms. No new design system, private import or GitHub push.
- Reason: factual statements become promotional filler when repeated outside the relevant decision. A loading message must not imply freshly verified policy; a locally saved feedback draft must not look sent. Inspection of storage also confirms disabling history clears it, so that existing destructive effect must be explicit in the action label/style.

## D-032 — Recognizable actions without visual clutter

- Date: 2026-10-08
- Status: implemented and browser-validated locally; native visual acceptance pending
- Decision: improve Home with one original package-label scan signature, consistent native line icons and two actual nearby/guide navigation tiles. Keep manual entry immediately after scan and history quieter beneath the alternatives. Retain the existing palette/fonts, short localized copy, sources and legal/uncertainty disclosures. No private artwork, package, animation, mock preview or GitHub push.
- Reason: removing decoration alone left a text list resembling settings. Functional icons and a limited hierarchy add recognition without slogans or fabricated maturity. Tiles must wrap for narrow screens, widen with system font scale and keep full labels; the observed Finnish large-text orphan-letter defect receives both arithmetic and rendered-word-wrap regressions. Browser checks remain distinct from native Dynamic Type/VoiceOver acceptance.

## D-033 — One nearby action, explicit material reports and school-scope privacy

- Date: 2026-10-11
- Status: implemented locally; native acceptance remains separate
- Decision: Home's nearby press is the explicit purpose-labelled location action. A short-lived consume-once in-memory intent starts the focused screen; direct/deep links and background returns alone never acquire location. Rank up to five real records within 100 km by distance, without name/material preference. Normalize exact OSM affirmative/excluded material reports and reported operator into a v2 contract; missing/unsupported information stays unknown. Preserve genuine October 6 source dates when enriching the cached database after the live import fails. Never infer general-material acceptance as packaging/deposit eligibility or a sorting rule.
- School scope: Roope explicitly says there will be no legal review. Remove the runtime review banner and draft-contract presentation; keep factual recipients, retention, local deletion and guidance limitations. Internal future-production drafts/gates remain unapproved, not requirements for continuing this classroom UI task.
- UI engineering: repair the browser-observed scheme-change/loading race in the existing single theme provider using React's external-store subscription/recheck. Keep native Appearance, existing palette and source/material uncertainty; no private import, new package, motion, signing/install or GitHub push.

## D-034 — Renew the exact development installation, not the product scope

- Date: 2026-10-12
- Status: renewed native build/install/Home verified
- Decision: honor Roope's explicit renewal using the existing Personal Team, bundle ID, matched pods and Xcode 26.6 SDK. Preserve a verified rollback app and move only the validated old app-specific cached profile into a recoverable backup; automatic provisioning obtains a genuinely new October 19 expiry. Keep Xcode beta scoped to device/automation tooling. Install over the existing app, without uninstall/reset, dependency/private-code import, global configuration change, account purchase or GitHub push.
- Evidence boundary: verify the embedded profile, 12 frameworks, entitlements/device binding and actual Home separately from future GPS/map/permission/dark/large-text acceptance. Restore local Metro/API because this is a Debug client; do not promise Mac-independent operation or a renewed profile from installation success alone. Changed container paths do not prove data retention/loss. No recurring renewal is scheduled; Roope requests the next before the recorded expiry.

## D-035 — Three ownership roots with real contracts, not isolated-looking copies

- Date: 2026-10-12
- Status: implemented and locally validated; no push/remote settings change
- Decision: use mobile/app+localization, backend/API+application+providers+database, and shared/contracts+domain+sorting policy. Extract contract schemas from application; mobile/API use public shared exports and preserve the v1 wire endpoint/method/body/results. Derive backend request JSON schema from the same contract, do not duplicate model logic. Enforce lane dependencies, declared public imports, cycles and compiler/symlink escape checks; run independent part/dependency validations plus mandatory whole integration and CI part jobs.
- Limits: folders do not create three pinned independent releases or prevent intended shared policy/contract effects. Breaking v1 changes require coordinated versioning; use separate branches/worktrees for people rather than editing one checkout concurrently. Root tools/lockfile/CI/docs are shared integration ownership. Pushes/settings require separate authorization; no CODEOWNERS identities or branch-protection enforcement were configured.
- Continuity: move existing code/assets without private imports or dependency-version changes. Preserve data/rule/migration bytes and native app identity; keep an ignored local compatibility link for existing generated Xcode paths, while clean source/CI uses the new paths. Restore local services and verify browser/host bundle/current phone Home separately from fresh native builds and remaining GPS/camera/accessibility acceptance.

## D-036 — Describe implementation responsibilities, not personal assignments

- Date: 2026-10-12
- Status: documentation clarification; implementation unchanged
- Decision: remove personal role-assignment instructions and describe the complete technical scope of mobile, backend and the shared sorting core. Document actual independent development/test paths and the shared-contract/live-service requirements. Existing boundaries and CI gates already enforce the architectural division.
- Limits: parallel implementation requires agreed inputs/outputs; folders do not remove runtime or shared-library dependencies. Do not invent who wrote an area, alter commit authors or rewrite actual evidence. No new native acceptance, remote CI result or GitHub publication is implied by the wording change.

## D-037 — Publish current independent team work only on explicit request

- Date: 2026-10-12
- Status: source main push succeeded and remote SHA verified
- Decision: the owner's new push request authorizes this branch's current independent KierratysAppi history and outcome documentation to the verified existing `origin` main. Fresh fetch has zero remote-only commits; non-force fast-forward preserves existing history. Keep local feature branch and KeepItGreen untouched; do not mirror, alter authors/history, create remote experiment branches, change settings or publish a production release.
- Evidence: fresh 307-test full local validation; source push `b9c3ac7..7e6d5bd` and matching remote `7e6d5bd919e7a0cb0cf2095797575e751c3a1ac5`. Remote runs are only an in-progress snapshot, not a green claim. Future publication needs separate explicit authorization; native acceptance and production gates remain unchanged.

## D-038 — Consented AI observations never replace sorting policy

- Date: 2026-10-15
- Status: locally implemented/tested; one real adapter estimate passes after owner funding; native acceptance pending
- Decision: a separate photo route obtains purpose/recipient/retention consent, strips JPEG metadata before upload, previews locally and sends only through a server-side OpenAI adapter. Use the documented GPT-4.1 mini snapshot and a conservative supported structured-output wire schema; full runtime contracts retain strict bounds/Unicode validation. No tool execution, remote image URLs, arbitrary prompts, verified identity or model-supplied collection destination.
- Sorting: only clear ordinary packaging parts can be explicitly user-confirmed; then the existing engine supplies source/jurisdiction/date/version/confidence/explanation. Deposit is never visually asserted. Risky/non-packaging/uncertain cases require manual/local guidance rather than fabricated waste advice. No photo/estimate persistence or analytics.
- Deployment/privacy: server default/production stay disabled. Local dev opt-in has three/client/minute, two concurrent and twenty/process caps, not durable production billing protection. `store:false` is not zero retention or EU-only processing. API credit initially blocked validation; the owner later reported funding and one authorized request succeeded. Do not purchase funds or silently switch models. A key name is not evidence of account funding.
- Native continuity: purpose text/localizations and build numbers move to 2; old installed build 1/Expo Go cannot capture for this feature. A future correct native build/install is required before physical acceptance. Preserve actual prior evidence, storage identity, unchanged rules/migration/OSM and repository-sharing boundary; no push in this feature unit.

## D-039 — Funded recheck is one bounded request, not device acceptance

- Date: 2026-10-15
- Decision: reuse the previously approved server key and pinned vision model for exactly one synthetic-image request after the owner reports completing funding. Do not purchase credit, change billing/recharge, rotate keys, switch models, send personal photos or make automatic retries.
- Evidence: HTTP 200 and runtime-validated `estimated` from the real adapter. This resolves EB-AI-01 for the observed check only; it does not reveal balance/payment history, prove real-product accuracy, exercise the app's HTTP/mobile flow or replace native client 2 acceptance. Continue with the native build without another live request in that work unit; no push.

## D-040 — Preserve locked native recovery and require scoped cache-cleanup approval

- Date: 2026-10-15
- Decision: regenerate client 2 from `mobile/app` with stable Xcode 26.6, preserve the saved Podfile.lock and restore pods in deployment/no-repo-update mode. The first ENOSPC extraction recovered on one retry after temporary files were released; native lock bytes and installed manifest match. Revert Expo's incidental tracked package-script edits, not the intended generated permission/build metadata.
- Boundary: with about 977 MiB free, do not start the native compile or claim build/sign/install success. Request permission before deleting ten newly created CocoaPods cache-copy directories, individually enumerated in physical evidence. No broad caches, programs, existing app products, source, personal files or phone data are included. Validate exact targets and symlinks afresh after approval; never follow links or retry a failed deletion with a stronger/broader operation.
- Evidence: connected/paired iPhone still has build 1, purpose-matched generated Info.plist has build 2, scoped mobile and full 340-test validation pass. Native compilation, install and physical photo acceptance remain pending. No extra paid inference, account change, signing renewal, SDK switch or push.

## Remaining pending decisions (historical / production, continued)

- October 8 publication outcome: explicit non-force push succeeds to existing public KierratysAppi main, verified remotely. Do not change visibility/settings or KeepItGreen; source sharing does not publish a running production service or certify stores/native pending flows.

- October 8 sharing authorization: Roope explicitly requested current changes in KierratysAppi, so use an explicit `HEAD:refs/heads/main` push to the verified team remote only if it remains a fast-forward. Keep local feature branch and KeepItGreen remote untouched. This does not revoke the prohibition on future automatic sharing or authorize production release.

- October 8 UX: use progressive disclosure for technical metadata, not for essential uncertainty or optional lookup consent. Keep public-source/date/licence visible; map is the single primary result action and refresh is secondary. Preserve baseline Atkinson typography/palette and shared components; no private-repository imports, decorative animation or fabricated map preview.
- October 8 theme: one AppThemeProvider owns the color-scheme subscription and publishes a shared palette. Browser reproduction showed inconsistent per-component colors on a live scheme change; shared context repairs the observed defect. Keep native accessibilityState and explicit web ARIA semantics together because RN Web did not expose expanded state from accessibilityState alone.

- October 8: prefer installed OS geocoding over integrating public Nominatim. Its current policy requires a deliberate responsible developer decision, app-wide rate/caching and switchability; no bulk enrichment or generic public endpoint added (https://operations.osmfoundation.org/policies/nominatim/, accessed 2026-10-08). Optional user-triggered OS lookup sends public point coordinates only, once per result; five-second UI deadline does not cancel native provider work. Area estimate must never replace source-provided point name or pretend to be a verified official address.

- October 8 whereabouts: provide an explicit OpenStreetMap marker action rather than fabricate missing addresses or send the user's location to reverse-geocoding/routing services. Use existing source coordinates (area centroid caution retained); no turn-by-turn or entrance accuracy claim. Marker URL format checked against https://wiki.openstreetmap.org/wiki/Homepage on 2026-10-08.

- October 8 point identification: keep the existing licensed directory rather than guessing an operator or making location-bearing reverse-geocoding requests. Expose reported kind and source identifier; explicitly label absent names/types. Owner postponed push, and target repository remains to be confirmed.

- October 8 physical permission cycle: record owner actions separately from native observations. Denied explanation/settings button and restored ready-control visibility establish recovery, not fresh consent, on-site distance accuracy or complete result-text accessibility. Continue next with public-example native provider attribution.

- October 8: recover stopped local API/Metro before another installation or signing change. Verify native ready-state and same-process background clearing using non-sensitive controls; inconclusive text selectors do not establish a source-text pass. Keep denial recovery as the next physical action and preserve all earlier dated evidence.

- OCR implementation and whether a cloud AI path is justified after the typed-code flow is evaluated.
- Production hosting/database/telemetry providers after owner cost/privacy-region approval.
- Whether a distributable web build is in launch scope; if yes, the current 2.55 MB entry requires optimization and deployed performance evidence.
