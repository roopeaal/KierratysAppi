# Dependency decisions

No production dependency is accepted solely from memory. Versions will be pinned after checking current official compatibility and package metadata.

| Area | Candidate | Decision | Reason / gate |
| --- | --- | --- | --- |
| Package manager | pnpm 11 workspace | Accepted | Installed locally; deterministic workspace support; pin via `packageManager` and Corepack-compatible CI. |
| Runtime | Node 24 LTS | Accepted | Expo recommends LTS and Node marks v24 LTS; local Node 26 is Current. |
| Mobile | Expo 57.0.11, React Native 0.86.2, React 19.2.3, Expo Router 57.0.11 | Accepted | Versions verified from official SDK 57 template; share Android/iOS codebase with CNG. |
| Camera | expo-camera 57.0.3 | Accepted | Official SDK camera/barcode and permission API; physical behavior remains a device gate. |
| API | Fastify 5.11.x | Accepted | Small, schema-oriented TypeScript boundary; framework-independent domain/services. |
| Validation | Zod 4.4.x | Accepted | Shared runtime schemas for external JSON, API contracts, and mobile; no `any` at provider boundary. |
| Database | PostgreSQL migrations with repository interfaces | Accepted | Preserve production schema without requiring Docker for deterministic vertical-slice tests. |
| Testing | Vitest 4.1.x; RN testing library after Expo-compatible configuration | Accepted | Domain/contract/integration coverage first; use template-compatible TypeScript rather than latest TS 7. |
| OCR | on-device/native option | Deferred | Compare privacy, platform, and Expo compatibility before adding. |

Package patch versions are locked by `pnpm-lock.yaml`; Expo-native package versions are installed with `expo install`/doctor compatibility checks rather than independently upgraded to registry latest.
