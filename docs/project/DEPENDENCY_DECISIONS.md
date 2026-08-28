# Dependency decisions

No production dependency is accepted solely from memory. Versions will be pinned after checking current official compatibility and package metadata.

| Area | Candidate | Decision | Reason / gate |
| --- | --- | --- | --- |
| Package manager | pnpm 11 workspace | Accepted | Installed locally; deterministic workspace support; pin via `packageManager` and Corepack-compatible CI. |
| Runtime | Node 24 LTS | Accepted | Expo recommends LTS and Node marks v24 LTS; local Node 26 is Current. |
| Mobile | Installed: Expo 57.0.16, React Native 0.86.2, React 19.2.3, Expo Router 57.0.16 | Temporarily behind supported patches | The installed set and new `expo-dev-client` 57.0.16 build/launch on iPhone, but a 2026-08-28 recheck found eight supported patches. Doctor is 19/20 until the newest packages clear the strict age gate on 2026-08-29 10:49 UTC; do not bypass it. |
| Camera | expo-camera 57.0.3 | Accepted | Official SDK camera/barcode and permission API; physical behavior remains a device gate. |
| API | Fastify 5.11.x | Accepted | Small, schema-oriented TypeScript boundary; framework-independent domain/services. |
| Validation | Zod 4.4.x | Accepted | Shared runtime schemas for external JSON, API contracts, and mobile; no `any` at provider boundary. |
| Database | PostgreSQL migrations with repository interfaces | Accepted | Preserve production schema without requiring Docker for deterministic vertical-slice tests. |
| Testing | Vitest 4.1.x; RN testing library after Expo-compatible configuration | Accepted | Domain/contract/integration coverage first; use template-compatible TypeScript rather than latest TS 7. |
| OCR | on-device/native option | Deferred | Compare privacy, platform, and Expo compatibility before adding. |

Package patch versions are locked by `pnpm-lock.yaml`. The workspace explicitly enforces `minimumReleaseAge: 1440` with strict mode for direct and transitive resolution. Expo-native versions are installed with `expo install`, then checked with frozen install, Expo dependency validation, Doctor and full validation; no broad age exclusion is configured. The next exact update/rebuild procedure is OWNER_ACTIONS OA-11 and `NEXT_ACTION.md`.
