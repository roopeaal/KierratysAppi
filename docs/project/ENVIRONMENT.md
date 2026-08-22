# Environment and capability matrix

Verified: 2026-08-22. Secret presence was checked without intentionally reading values.

## Local toolchain

| Tool | Verified state |
| --- | --- |
| OS | macOS 26.5.2, Apple Silicon (`arm64`) |
| Node.js | 26.4.0 |
| npm | 11.17.0 |
| pnpm | 11.16.0 |
| Git | 2.50.1 (Apple Git-155) |
| GitHub CLI | 2.89.0; authenticated to `roopeaal`, repository/workflow scopes present |
| Python | 3.9.13 |
| Java/JDK | Missing |
| Android SDK / ADB | Missing |
| Docker | Missing |
| Xcode | 26.6 (`17F113`) with iOS 26.5 SDK; system `xcode-select` remains on Command Line Tools, so native commands set `DEVELOPER_DIR` explicitly |
| Expo/EAS credentials | No `EXPO_TOKEN` or `EAS_TOKEN` present |
| OpenAI/Supabase credentials | No corresponding environment token present |

## Capability and trust matrix

| Capability | Needed? | Existing tool | Candidate | Trust | Permissions | Decision |
| --- | ---: | --- | --- | --- | --- | --- |
| Expo application development | Yes | Node/pnpm, shell | Expo official packages/CLI | High | Repo + network | Use after official compatibility check |
| Official Expo documentation | Yes | Web access | docs.expo.dev | High | Read-only web | Use |
| GitHub operations | Yes | Git, authenticated `gh`, GitHub skill | GitHub App/CLI | High | Private repo write | Use; no publish until coherent validation |
| Browser/UI testing | Yes | In-app browser/computer-use skills available | Browser automation | High | Local page/app interaction | Use for web surfaces; cannot replace physical camera tests |
| Android device testing | Yes | None | Android Studio/ADB or physical device | High | Device/camera | External blocker |
| iOS/TestFlight | Yes | Xcode 26.6, paired iPhone 12 Pro Max, passing Personal-Team development build/install/core flow | Paid signing/TestFlight later | High | Device/signing/account | Continue local matrix; retain release archive/TestFlight as external blocker |
| Original image generation | Optional | Trusted image-generation skill/tool | OpenAI image generation | High | Prompt/reference images | Use only for justified original release assets |
| Figma integration | Optional | Not installed | Figma plugin | Medium/high | External design files | Reject for now; no supplied Figma source |
| Database management | Yes later | No Docker/token | PostgreSQL/Supabase | High | Infrastructure/data | Keep provider-neutral; defer account choice |
| Open Food Facts | Yes | Web/HTTP | OFF API | Medium/high | External product data | Use behind validated adapter after licence/API review |
| Maps/collection points | P1 | Web research | KIVO/Rinki/open data | Varies | Location/network | Defer until licence/API is verified |
| Error monitoring | Yes later | None | Sentry or provider-neutral adapter | High | Telemetry | Define boundary; provider needs owner privacy/cost approval |
| Analytics | Yes later | None | privacy-preserving adapter | Varies | Usage telemetry | Default off until consent/provider decision |
| Accessibility audit | Yes | Accessibility skills, tests and installed iPhone development build | Platform screen readers/device review | High | Local UI/device | Run VoiceOver/largest-text iPhone matrix next; Android remains blocked |
| Vulnerability/secret scanning | Yes | package audit, GitHub CI | OSV/CodeQL/Gitleaks | High | Repo read | Configure trusted CI tools with minimal permissions |
| End-to-end testing | Yes | Browser tooling and manual iPhone runtime; no native automation harness | Maestro/Detox candidate | High | App/device | Continue manual matrix and add automation later; Android/release E2E blocked |
| Store metadata/screenshots | Yes | Local scripts/docs/image tools | Expo/store tooling | High | Local files; later accounts | Prepare locally; do not publish |
| Privacy/legal support | Yes | Authoritative web research | Owner counsel | High for primary law, counsel required | Read-only research | Draft with explicit legal-review mark |

## Rejected or deferred plugins

- Do not install broad SaaS plugins without a concrete task. Figma, Supabase, Sentry, Cloudflare, Vercel, and other external plugins would expand repository/data permissions or imply an account/provider choice not yet justified.
- OpenAI-backed OCR/vision is deferred because no API key is present and on-device/deterministic options must be evaluated first.
