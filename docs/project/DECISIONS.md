# Decisions

- Admit the licensed 93-code OFF part catalogue to assessment as partial, unverified community observations after reviewed data and previously resolved cache entries. Preserve exact GTIN, source revision, part-level attribution and Finnish policy; unknown parts never get an invented destination.

- On 2026-11-21 the owner authorized a single reviewed snapshot of the tested
  build 29 source for the team’s `main`, without local experiment history.
  Keep build 28 as the local rollback and leave KeepItGreen unchanged.

- The shared tactile button exposes the common `pressed` style field.
  The browser receives its original state; no type cast, native hover
  simulation or CI exception.

- Keep one light palette across Home, utility pages and app chrome. Do not
  change the system preference or reduced-motion behaviour. Use the same
  canvas at native startup and in static HTML. The Overview action is copy,
  not a change to the seven-day reporting window.

- Use bounded, structured Open Food Facts observations in direct barcode
  lookup. Identity-only records are offline backups, not a reason to skip
  online packaging lookup. Keep manually checked exact-GTIN Finnish packaging
  facts separate from the ODbL snapshot; never infer deposits from brand,
  shape or a foreign recycling tag. Keep the existing Finnish rule engine.

- Install signed standalone build 28 over 27 to test the Overview heading
  on the paired iPhone. Preserve 27 for rollback; do not push.

- Use the shared Home section heading for Overview and label its card
  Last 7 days, without adding a redundant header action.

- Install signed standalone build 27 over 26 on the paired iPhone to test
  the unified Home cards and attribution. Retain 26 as rollback; no push.

- Keep attribution visible beside nearby results, in the existing section
  heading, with a 44-point touch target. Share card edges and arrow alignment
  without changing the hero art or relocating the full source disclosure.

- Move the existing Overview entry to a full-width Home card after popular
  searches. Keep barcode entry under Identify and leave direct scan on Home.

- Install standalone development-signed build 26 over build 25 on the paired
  iPhone for owner testing. Preserve build 25 as rollback; no GitHub push.

- Use short, interruptible pointer feedback and one material stamp for a
  successful save. Keep text immediate and motion-free for keyboard and
  reduced motion. Show real logged activity without streaks, reminders or
  invented impact; retain the existing local-only data model.

- Deploy build 25 to the paired iPhone as a signed standalone update with
  embedded JavaScript. Keep build 24 as rollback; do not publish to GitHub.

- Save only an optional allowlisted artwork ID in opt-in history. Choose it
  from normalized packaging observations, never the product name or a
  picture URL. Missing or conflicting evidence uses a neutral scan tile.

- Estimate a missing address only for displayed Location results using public
  point coordinates and one native map request at a time. Keep published
  addresses exact to source, label estimates, and use the map as fallback.
- Use shared opt-in location across native and browser/Go photo results. Do not
  prompt automatically, override manual selection, or guess a region when unclear.

- Keep visible OpenStreetMap credit beside Home's nearby results. Link directly
  to the licence and show the retrieval date and freshness warning on Location.
  [OSMF attribution guidance](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines#Attribution_text)

- Deliver source `eb66bcc` to the paired iPhone as build 24, with embedded
  JavaScript and production transport policy, not a Metro-dependent client.
  Preserve build 23 as a rollback and keep the existing development signing.

- Use Rinki colours for illustrative packaging labels, traditional HSY green
  for paper, and neutral generic bins. Explicitly warn that colours can differ
  from local or Nordic markings. Never classify a material by colour.

- Persist only the automatic-location preference. Reuse a permission-checked
  one-shot fix in memory for at most one minute, never in the background.
  A manual municipality selection overrides automatic location. Choose a
  labelled example photo only from reported materials and point type.

- Extend the original four packaging drawings with original two-tone object
  icons. Use typed material/destination IDs and stable HSY waste type IDs, never
  model guesses or icon colours as rules. Bundle PNGs without new dependencies.

- Use labelled local illustrations for recycling-point thumbnails, not invented
  site photos or third-party image requests. Use the battery photo only for an
  exact batteries-only report; no thumbnail for points with no materials reported.

- Approved Home style is shared via theme tokens, PageIntro, Button and GuidanceHeading.
  A highlighted destination is not a verification badge; no decorative motion was added.
- Home review: reuse the supplied landscape and bottle art; lead with the sorting question, then search, identification and material shortcuts. No new dependencies or decorative motion.
- 2026-11-18 security: model phone/app/backend/build trust boundaries against MASVS
  and primary Apple/Android/Expo guidance; do not promise absolute safety.
  Require reviewed HTTPS external destinations, bounded runtime-validated data,
  explicit private-HTTP lab opt-in and production native transport restrictions.
  Keep CORS/Host defences separate from authentication; public image service stays
  disabled. Use CSP hashes and Zod jitless, not unsafe-eval. Disable unused OTA.
  Serialize privacy deletion and invalidate/cancel pre-deletion lookups. Correct
  actual vulnerable dependencies without audit exceptions; schedule unchanged audit.
  Export web JS/headers from identical explicit env, without implicit dotenv reads.
  Native binaries, TLS hosting, Python transitive chain and independent testing
  remain separate evidence gates. No publication/install authority inferred.
- 2026-11-18: owner requests one object suggestion, alternatives only after No,
  except unclear inference. Use a versioned UI heuristic (cosine >= 0.12 and
  lead >= 0.04 over every runner-up); this is NOT calibrated accuracy/confidence.
  Keep user confirmation, material questions and all provenance. Retain four
  supported ranks internally; show at most three alternatives without repeating
  a rejected primary. Unknown/multiple do not force a sorting choice. Accept-based
  v2 representation is opt-in; application/json v1 remains unchanged. Rejection
  is transient UI state, not training/analytics. No push/install authorized here.
- Maintain three source boundaries: mobile, backend and shared, using public exports.
- Treat image output as unverified suggestions; the user confirms object/material.
  Native inference is local; Go/browser uses explicit own-server photo consent.
- Preserve source licences, uncertainty and regional scope, including missing data.
- Replace picomatch/Micromatch through real source/import/manifest migrations,
  never by advisory suppression or fictitious upstream versions.
- 2026-11-17: owner authorizes archive/cleanup of KierratysAppi for a clear source
  repository. KeepItGreen/main `21e27aa` archives 533 original tracked docs/scripts/root
  notes from `2148d4e`, SHA-256
  `6718b94a7c6914fcd46e7be57c71f9a092bb0102b85dd5ff32b4cb1685a1ffdc`.
  Archive verified before removal; KeepItGreen app source unchanged. Preserve
  runtime/tests/licences and test-input bytes; do not rewrite Git history.
- 2026-11-17: owner authorizes codex/minimatch-migration publication and GitHub
  CI/Windows tests only, not a main merge. Original bounded adapter uses
  Minimatch 11; eight source patches and a version-scoped manifest hook remove
  obsolete implementation dependencies. Keep audit policy byte-identical.
  Vite retains its authoritative asset and fs.deny predicates without a regexp
  prefilter. Explicit noextglob/noglobstar switches do not retain old regexp
  fast-path exceptions; actual app configuration and default-contract parity pass.
- Validate the public-parent-only test source before any main decision; GitHub
  CI/Security/Windows evidence is recorded without changing the audit policy.
- 2026-11-17: owner explicitly authorizes pushing the tested corrections to
  KierratysAppi/main. Fast-forward the verified public-parent-only migration;
  do not force-push, change KeepItGreen or infer device-installation authority.
- 2026-11-17: owner requests removal of the separate paid OpenAI recognition
  feature and publication to KierratysAppi. Remove executable provider/routes,
  environment switches, obsolete contracts/copy and billable QA commands.
  Preserve /photo as a redirect, not a second recognition implementation.
  Native/Go/browser free paths, consent, image bounds, camera guards, stored
  records and required third-party notices remain. Do not read/revoke stored keys.
- 2026-11-19: object silhouettes are material examples, not predictions or official bin symbols. Unmapped packaging never falls back to a carton. One optional settle follows a successful local save. Research and alternatives: mobile/README.md.
- 2026-11-19: reuse the original Home landscape at full width; keep the title as live text and use the unobstructed text-only header for large system text. No asset changes.
- 2026-11-19: Home starts sorting only. Remove duplicate utility links and the history preview; do not read stored scan data on Home. History itself checks opt-in before reading and discards stale responses. Keep scrolling available for short viewports and large text.
- 2026-11-19: restore the original FI/EN heading. Use measured inset-adjusted space to size the existing scan card, gaps and material shortcuts; keep the normal scroll flow for enlarged text.
- 2026-11-19: restore four useful Home destinations as compact buttons, not previews. Only the explicit nearby tap can request location; no scan history is read on Home.
- 2026-11-19: restore the headline from the supplied mockup as localized text; do not show mock point photos, opening times, distances or recent items as real data.
- 2026-11-19: use the reference artwork crop for the pale scan panel. Home previews use only explicit, in-memory location and enabled local history; no external images, fabricated openings, or fabricated shopping locations.
