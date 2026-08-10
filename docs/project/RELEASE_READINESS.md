# Release readiness

Status: **production-capable foundation; not approved for public release**.

| Gate | Status | Evidence / next requirement |
| --- | --- | --- |
| Core mobile/API flow | Implemented | Scanner/manual → API → OFF normalization → component rules → result; live web E2E verified |
| Sorting accuracy/content review | Automated baseline passes | Rinki/Palpa sources and deterministic branch tests; owner/editorial review still required |
| Security/privacy | Implemented baseline | Threat model, POST boundary, validation, response limits, CORS allowlist, RLS, Gitleaks/dependency gates; CodeQL and private-branch protection are externally plan-gated |
| Accessibility | Code/web review complete; device blocked | Semantic roles, 48dp+ targets, dynamic text, non-color states; VoiceOver/TalkBack and OS large-text evidence required |
| Automated validation | Passing | `pnpm validate` (65 tests and all builds), PGlite migration execution, Expo Doctor 20/20, compatibility and peer checks, dependency audit policy, CI/security workflows |
| Native builds | Blocked | Android/iOS toolchains or approved EAS credentials |
| Store content/assets | Drafted | App/adaptive/monochrome icons, splash, bundle IDs, EAS profiles, metadata draft; screenshots and legal approval remain |
| Legal/owner approval | Blocked | Review of marked drafts |
