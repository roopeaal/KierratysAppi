# Test evidence

Evidence date: 2026-08-10. Local macOS host, Node 26; CI is pinned to Node 24 LTS.

## Passing automated evidence

| Area | Files | Tests |
| --- | ---: | ---: |
| Domain | 3 | 48 |
| Localization | 1 | 3 |
| Recycling engine | 1 | 7 |
| Data providers | 2 | 11 |
| Application resolution | 1 | 6 |
| API | 2 | 10 |
| PostgreSQL migration/seed | 1 | 4 |
| Mobile state/telemetry/material code | 3 | 11 |
| **Total** | **14** | **100** |

`pnpm validate` covers format, lint, strict TypeScript, tests and builds. It passed after the material-code work unit. PGlite executes the complete migration and idempotent seed. The API production bundle was started on port 3001 and returned expected health/OpenAPI contracts. Expo exported all 12 static routes, including `/material-code`; Doctor passed 20/20, Expo dependency compatibility passed, and pnpm peer checks reported none.

The dependency policy reviewed four advisories. Two exact `image-size` build-tool exceptions are documented/expiring; no other high/critical advisory is accepted.

## Live integration and visual evidence

A real GTIN `3017620422003` resolved through the local bundled path to Open Food Facts “Nutella,” four normalized packaging components, and Rinki component guidance. Missing cap material remained unknown. Rendered UI was inspected at 390×844, 360×640 and 412×915 in Finnish/English across home, manual, permission, offline, resolved and ambiguous states.

The local material-code screen was inspected at 360×640 and 390×844. `05 PP` required confirmation before resolving; conflicting `PET 41` and unknown `99 XYZ` produced no guidance; confirmed composite `C/PAP 84` remained a safe unsupported-material result. The new domain/mobile tests cover exact mappings, normalization, conflicts, multiple codes, missing numbers, composites, length bounds, provenance, resolved plastic, ambiguous glass shape, and unsupported composite behavior. No page console warnings/errors were present.

## Explicitly missing evidence

Android/iOS compilation, signed build installation, physical camera accuracy/latency, haptics, native dark screenshots, OS 200% text, VoiceOver/TalkBack, memory/cold start, and store screenshots are blocked by absent toolchains/devices/signing. The manual checklist is the required acceptance record; none is reported as passed by inference.
