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

## Pending decisions

- OCR implementation and whether a cloud AI path is justified after the typed-code flow is evaluated.
- Production hosting/database/telemetry providers after owner cost/privacy-region approval.
- Whether a distributable web build is in launch scope; if yes, the current 2.55 MB entry requires optimization and deployed performance evidence.
