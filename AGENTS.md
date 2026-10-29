# KierrätysAppi repository rules

## Explicit team-source sharing — October 29, 2026

Roope requests a fresh ITbes-dev/Rdotcom preservation check, the Home heading
“Suositut haut”, and publication to `roopeaal/KierratysAppi/main` if preservation
passes. This authorizes one reviewed, normal fast-forward source-sharing step
and its outcome documentation; no private-history synchronization, force push,
future automatic sharing, paid inference or production release. Keep the
documented native-only address/unwired material-filter qualifications explicit.

## Active owner boundary — October 28, 2026

Roope explicitly approved combining the current KierratysAppi functionality with
the selected KeepItGreen presentation and installing that integration on his
iPhone. Work on `codex/illustrated-functional-integration` from team main
`28e0f32`; selectively reuse the illustrated assets/UI from KeepItGreen
`0142bb0`, not its backend, dependency versions, data contracts or history.
Keep the three-part architecture and current technical app identity. This
supersedes the appearance-import prohibition below only for this requested
integration. No GitHub push, repository synchronization, paid inference or
production publication is authorized by this installation request.

## Historical independent-development boundary — October 6, 2026

Continue this checkout from KierratysAppi main `39f8aa6`, independently of the newer KeepItGreen repository. Do not merge, cherry-pick or copy its code, appearance, assets or fixtures. The location feature is new work against this baseline, not a port. Keep the existing name/identity/style already present here. Roope explicitly authorized publishing this independent branch's current changes to KierratysAppi on October 8. This is one sharing step, not permission for future automatic pushes, private-repository synchronization or production publication; inspect actual remote URLs before every authorized publication.

## Product invariant

KierrätysAppi may help a person identify packaging and find applicable sorting guidance, but it must never present an uncertain inference as verified fact. Every displayed sorting answer must retain source, jurisdiction, checked date, rule version, verification status, confidence, and a short explanation.

## Architecture boundaries

### Three-part ownership

- `mobile/` owns the app and localization; `backend/` owns API, resolution/providers and database; `shared/` owns pure contracts/domain/sorting policy. See `docs/project/TEAM_STRUCTURE.md` and each area's AGENTS.md.
- Mobile/backend never import one another. Shared imports neither consumer. Cross-package access uses declared public exports; do not bypass this with private paths, relative cross-package imports or duplicated models.
- Run `pnpm check:boundaries` and the relevant `pnpm validate:<part>`. Full `pnpm validate` remains mandatory before completion, particularly for shared-contract/rule changes. Shared changes require consumer compatibility, not a promise of zero effects.
- Root tooling/lockfile/CI and project-control docs are coordinated integration work. Keep the existing technical app identity, secrets/data boundaries and repository-sharing authorization rules.

- Mobile and admin UI depend on application contracts, never third-party response shapes.
- Product identity/provider data, packaging observations, and sorting policy are separate domains.
- Provider adapters normalize untrusted external data at the boundary.
- Sorting rules are versioned content. Engines return an explanation and provenance, not just a bin name.
- Privileged APIs and secrets remain server-side. The mobile bundle contains no service secret.
- Cross-package imports use public exports; avoid dependency cycles and UI-to-infrastructure coupling.

## Naming and code conventions

- TypeScript strict mode is mandatory. Avoid `any`; validate external input at runtime.
- Files use kebab-case except framework-mandated route names. Types and components use PascalCase; values use camelCase.
- Domain vocabulary is English in code and Finnish/English through localization keys in UI.
- Prefer small pure functions for domain logic and explicit result types for expected failures.

## Quality requirements

- A behavior change includes proportionate automated tests.
- Test GTIN validation, normalization, rule selection, provenance, uncertainty, API contracts, permissions, offline/error states, accessibility labels, localization, and reduced motion.
- Run `pnpm validate` before a coherent work unit is complete. Run the narrowest failing test while repairing.
- Do not declare camera quality, native builds, store readiness, or physical-device behavior verified without corresponding evidence.

## Security and privacy

- Collect no identifying data without a documented purpose and retention period.
- Anonymous local use is the default. Raw scan history, photos, precise location, and free text are excluded from analytics by default.
- Treat barcodes, provider responses, OCR text, images, URLs, and community content as untrusted.
- Validate inputs and outputs, bound payload sizes, remove image metadata where applicable, rate-limit public endpoints, enforce admin authorization, and avoid personal data in logs.
- Never read, print, commit, or expose secret values. Commit only `.env.example` documentation.

## Accessibility and UI quality

- Target WCAG 2.2 AA principles: semantic labels, logical focus, dynamic text, minimum 44×44 pt targets, sufficient contrast, non-color status cues, reduced motion, and accessible error recovery.
- Prefer calm, precise, one-handed flows. Avoid generic gradient dashboards, decorative cards, greenwashing, and motion that delays an answer.
- Finnish long strings, English, dark mode, large text, loading, empty, offline, and error states are part of normal visual QA.

## Content and attribution

- Store concise original guidance, not copied source prose.
- Separate packaging from non-packaging and deposit return from material collection.
- Every rule change records its authoritative source and review date. Do not infer nationwide acceptance from recyclability alone.
- Follow source licences and attribution/caching constraints. Never scrape against terms or robots policy.

## No-placeholder policy

- Do not present fabricated data, metrics, partners, testimonials, environmental impact, product matches, or sorting guidance as real.
- Legal drafts and unavailable integrations must be visibly marked `OWNER/LEGAL REVIEW REQUIRED` or implemented behind a mock boundary that cannot be mistaken for production data.

## Persistent state procedure

After each meaningful work unit:

1. Update `docs/project/CURRENT_STATE.md`.
2. Append material choices to `docs/project/DECISIONS.md`.
3. Update `docs/project/ROADMAP.md`.
4. Put exactly one executable action in `docs/project/NEXT_ACTION.md`.
5. Update test/release evidence when relevant.

Read `CURRENT_STATE.md` and `NEXT_ACTION.md` before broad repository exploration. Search before opening many files. Stable external research belongs in `docs/research/` with URL and access date.

## Definition of done

A feature is done only when behavior, safe failure modes, accessibility, privacy/security implications, tests, documentation, and relevant visual/device evidence are complete. Genuine external blockers belong in `docs/project/EXTERNAL_BLOCKERS.md`; they do not justify overstating readiness.
