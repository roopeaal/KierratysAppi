# Legal, privacy, accessibility, and store research

Accessed: 2026-08-10. **OWNER/LEGAL REVIEW REQUIRED before publication.** This document identifies implementation obligations and risks; it is not legal advice.

## Privacy baseline

The GDPR requires lawfulness/transparency, purpose limitation, data minimization, accuracy, storage limitation, security, and accountability (Article 5), and protection by design/default (Article 25): https://eur-lex.europa.eu/eli/reg/2016/679/oj.

Finland's supplementary Data Protection Act is available at https://finlex.fi/en/legislation/translations/2018/eng/1050.

Implementation position:

- No mandatory account for scanning; local history is app-local and opt-in. Android backup is disabled, but an operating-system backup may include local data and signed iOS behavior still requires verification.
- Camera frames are processed on device for barcodes and never uploaded.
- A photo/OCR cloud path, correction evidence upload, analytics, monitoring, or location request requires a named purpose, lawful basis, clear just-in-time explanation, retention, recipient/region analysis, deletion/export path, and updated store declarations.
- Strip image metadata before any authorized upload, reject unrelated content, and avoid raw photos/OCR text/location/barcodes in analytics or logs.
- Avoid advertising identifiers and third-party behavioral analytics in v1.
- Anonymous installation identifiers, if later necessary for abuse control, must be random, purpose-bound, rotatable, and documented—not treated as non-personal by assumption.
- Do not target children or build profiling/rewards for them in v1. Owner review must determine age positioning and consent handling if accounts/community features are added.

## Accessibility scope

Finland's Act on the Provision of Digital Services defines mobile applications as digital services and implements relevant accessibility requirements for covered services: https://finlex.fi/fi/lainsaadanto/2019/306. Exact statutory coverage depends on the business/service model and microenterprise/sector exceptions; owner counsel must assess it.

Regardless of formal coverage, the product target is WCAG 2.2 AA principles and native-platform accessibility: screen-reader names/state, dynamic text, 44×44 pt preferred targets, non-color confidence/status, logical focus, manual-entry parity, reduced motion, safe-area insets, and accessible error recovery.

## Environmental claims

EU Directive 2024/825 strengthens protection from misleading environmental claims and applies from 27 September 2026: https://commission.europa.eu/topics/consumers/consumer-rights-and-complaints/sustainable-consumption_en.

Consequences:

- Present sourced disposal instructions, not claims that a product or user is “green,” “sustainable,” or producing unmeasured impact.
- Do not publish CO2 savings, recycling success, or partner/verification badges without a documented, auditable method and applicable authorization.
- Distinguish “accepted in this Finnish collection flow” from technically recyclable.

## App-store declarations

- Google Play requires every published app to complete an accurate Data Safety form, including third-party SDK behavior, and a privacy-policy link even when the app collects no data: https://support.google.com/googleplay/android-developer/answer/10787469.
- Apple requires App Privacy answers to reflect collected/linked/tracking data and third-party SDKs: https://developer.apple.com/app-store/app-privacy-details/.
- Expo supports iOS privacy manifests through app configuration; required-reason API declarations must be derived from the actual native dependency graph and verified on a submitted build: https://docs.expo.dev/guides/apple-privacy/.

The release questionnaire drafts must be regenerated from the final binary/dependency inventory; they cannot be safely finalized at scaffold time.

## User content and AI

- Corrections/evidence require contribution terms, ownership/licence consent, moderation, abuse reporting, removal, retention, and privacy controls before public upload is enabled.
- Any multimodal service must be opt-in, server-mediated, provider-neutral, structured, evaluated for overconfidence, and transparent about retention/recipients. OCR/image content is untrusted data, never instructions.
- No cloud AI dependency is justified for the P0 barcode/material-rule vertical slice.
