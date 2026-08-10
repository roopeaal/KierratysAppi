# KierrätysAppi repository rules

## Product invariant

KierrätysAppi may help a person identify packaging and find applicable sorting guidance, but it must never present an uncertain inference as verified fact. Every displayed sorting answer must retain source, jurisdiction, checked date, rule version, verification status, confidence, and a short explanation.

## Architecture boundaries

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
