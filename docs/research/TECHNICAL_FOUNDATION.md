# Technical foundation research

Accessed: 2026-08-10. Sources are official project documentation or package metadata.

## Current mobile toolchain

- Expo's current setup guide names SDK 57 and recommends Node.js LTS: https://docs.expo.dev/get-started/create-a-project/
- The SDK 57 template resolves Expo 57.0.11, React Native 0.86.2, React 19.2.3, Expo Router 57.0.11, and TypeScript 6.0.3. These were verified by generating the official template locally.
- Expo Router is the supported file-based routing/deep-linking layer and its SDK 57 bundled version is documented at https://docs.expo.dev/versions/latest/sdk/router/.
- `expo-camera` 57.0.3 provides `CameraView`, camera-permission hooks, and barcode detection. Only one preview should be mounted; Android/iOS scanning requires a device: https://docs.expo.dev/versions/latest/sdk/camera/.
- Expo recommends development builds for production applications rather than treating Expo Go as the whole development environment: https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/.
- EAS's SDK 57 Android image currently uses Node 22.23.1, pnpm 11.9.0, Java 17, and Maestro 2.6.1. The build image can be pinned by SDK alias: https://docs.expo.dev/build-reference/infrastructure/.
- Node 26 is still `Current` in August 2026; Node says production applications should use an LTS line. Node 24 is LTS: https://nodejs.org/en/about/previous-releases.

### Decision

Pin Node 24 LTS for development and CI while permitting the compatible EAS SDK image. Use Expo SDK 57, Continuous Native Generation, Expo Router, `expo-camera`, strict TypeScript, and development builds. Do not commit generated native directories; configuration is source-of-truth.

## Backend comparison

| Option | Strengths | Costs/risks | Decision |
| --- | --- | --- | --- |
| Supabase | Managed PostgreSQL, storage, auth, APIs, RLS | Early provider/account/cost/region choice; client-generated APIs tempt UI-to-database coupling | Compatible future deployment target, not required for the vertical slice |
| NestJS | Strong conventions, dependency injection, large ecosystem | More framework surface and ceremony than the first service requires | Rejected for initial API |
| Fastify 5 | Small TypeScript HTTP boundary; compiled request/response schemas; plugins for limits and headers | Team must maintain its own module boundaries | Selected |
| Raw serverless/edge functions | Low operations for isolated endpoints | Runtime/provider limits and fragmented local testing | Later deployment adapter only |

Fastify's official documentation recommends schema-based validation/serialization and warns that schemas are application code rather than user input: https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/. PostgreSQL remains the durable system of record; current row-security behavior and default-deny semantics are documented at https://www.postgresql.org/docs/17/ddl-rowsecurity.html.

### Decision

Use a small Fastify 5 application that composes framework-independent application services. Share Zod 4 runtime schemas between domain, API, providers, and mobile. Keep persistence behind repositories; ship PostgreSQL migrations and a deterministic in-memory adapter for local tests. A future Supabase deployment can use the same PostgreSQL schema without making Supabase client APIs the domain boundary.

## Mobile interaction and accessibility

- React Native exposes native accessibility roles, labels, state, live-region behavior, and screen-reader APIs: https://reactnative.dev/docs/accessibility.
- Apple advises purposeful, brief, optional motion that never blocks interaction and complements rather than replaces other feedback: https://developer.apple.com/design/human-interface-guidelines/motion.
- Android edge-to-edge guidance requires critical controls to respect system and gesture insets: https://developer.android.com/design/ui/mobile/guides/layout-and-content/edge-to-edge.
- Apple camera-scanning guidance requires capability and authorization checks before presenting the scanning interface: https://developer.apple.com/documentation/visionkit/scanning-data-with-the-camera.

### Consequence

The camera is an enhancement, not a gate: manual GTIN entry remains equally reachable. The app shows a contextual explanation before the OS permission prompt, unmounts inactive previews, avoids continuous scan animation, announces dynamic results, respects reduced motion, and uses safe-area insets.
