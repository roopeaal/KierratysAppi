# Capability and tool matrix

Reviewed: 2026-08-10

| Capability | Available | Used / decision |
| --- | --- | --- |
| Git/GitHub CLI and connected GitHub context | Yes | Repository discovery, origin/auth verification; no secrets printed |
| Node/npm/pnpm | Yes | Node 26 local discovery; Node 24 LTS pinned for CI; pnpm 11 workspace |
| Expo/React Native | Yes | SDK 57, Router, Camera, web export, Doctor |
| Browser/UI inspection | Yes | Rendered local Expo UI and live backend flow at three viewports |
| PostgreSQL execution | PGlite only | Real PostgreSQL WASM migration/seed contract tests; Docker/local service unavailable |
| Android SDK/JDK/ADB | No | Native build and physical camera explicitly blocked |
| Full Xcode/signing | No | iOS native build/submission explicitly blocked |
| EAS credentials | No | Config prepared; paid/signed builds not triggered |
| Open Food Facts | Public API | Implemented v3.6 adapter with identified client contract |
| GS1 Synkka | No contract/credentials | Synthetic, visibly mock adapter only; plan documented |
| Kierrätys.info | API key/commercial agreement required | Not integrated; no plugin or scraping workaround |
| Figma/Canva/image generation | Optional | Not required; deterministic geometric asset system is more reproducible |
| Supabase/hosting/monitoring vendor | Not selected | Deployment-neutral PostgreSQL/API; owner decision required |
| OpenAI API/AI vision | No key or justified need | Not used; deterministic ladder stops before cloud AI |

Plugins not installed were not requested merely for appearance. Figma/Supabase/Slack and similar connectors would not remove the material blockers: device/signing access, data contracts, legal decisions, or infrastructure ownership.
