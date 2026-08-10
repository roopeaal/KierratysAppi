# Security architecture

## Public lookup path

1. Reverse proxy/platform terminates TLS and applies coarse abuse limits.
2. Fastify applies security headers, strict route schemas, narrow payload limits, and route-specific rate limits.
3. GTIN domain validation occurs before cache/provider access.
4. Product provider uses fixed origin, identified server-side user agent, abort timeout, selected fields, response-size/status checks, and runtime validation.
5. Normalized observations and the rule engine produce a runtime-validated response; logs contain correlation/technical status, not raw provider bodies or scan history.

## Secrets and configuration

- `.env.example` documents names only. Startup fails closed when required production configuration is missing.
- Mobile configuration contains only the public API base URL and feature flags safe for disclosure.
- Provider contacts, database URLs, telemetry tokens, signing credentials, and admin secrets are stored in environment/CI secret managers with separate development/staging/production values.
- Never put OFF write credentials, storage signing secrets, service-role database keys, or AI keys in Expo public variables.

## Database roles

- Migration owner: schema change only, not application runtime.
- API runtime: required CRUD functions/tables only; not table owner; no `BYPASSRLS`.
- Moderation/admin runtime: separate authenticated role/connection with audited functions.
- Backup role: read for backup with an explicit row-security completeness check; encrypted backups and restore tests.
- Anonymous/direct database access is not used by mobile. If a managed PostgREST surface is later exposed, relevant tables use RLS + default deny and separately tested policies.

## Images

The future upload pipeline is request metadata → authenticated/anonymous-abuse policy → one-use signed upload → quarantine → header/magic/size/pixel validation → safe decoder re-encode and EXIF removal → isolated object key → moderation/OCR access → retention deletion. Original objects are private and never served from user-provided URLs.

## Telemetry

Structured logs allow-list request ID, route pattern, status class, duration, provider ID/status, app version, and rule version. Analytics allow-list contains event names and coarse enumerations. Raw GTINs, product names, images, OCR/free text, precise location, IP-derived profiles, and stable cross-app identifiers are excluded.

## Release controls

- Lockfile and clean install.
- Formatting/lint/type/test/build/Expo doctor.
- Dependency audit, CodeQL/static analysis, and secret scan.
- Minimum GitHub Actions permissions; pinned major actions initially and commit pinning before protected release.
- Native binary permission/dependency/privacy-manifest inspection before store questionnaire approval.
