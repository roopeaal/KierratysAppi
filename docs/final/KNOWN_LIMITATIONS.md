# Known limitations

- No Android native build was possible locally because JDK/Android SDK/ADB and signing are absent. The 2026-09-04 iOS Personal-Team Debug build compiles, passes signing and installs/opens its launcher, but current device-to-Mac connectivity prevents Home verification. Its profile expires 2026-09-11 07:01:05 UTC; it is not archive/TestFlight/release evidence.
- Barcode product lookup currently composes only the Open Food Facts `food` product type. Non-food barcodes are not covered; internal PostgreSQL and licensed GS1 repositories are modeled but not production-wired.
- API cache is per-process memory; production needs a bounded shared/cache/repository policy that preserves ODbL attribution and deletion/staleness decisions.
- Open Food Facts packaging components are often partial/community data. Confidence is capped; some component names/materials remain unknown.
- Nationwide Finnish packaging rules do not replace hazardous-product instructions or municipality-specific guidance. No collection-point map is included.
- Typed EU material codes cover a conservative official subset; code recognition cannot establish packaging shape, deposit status, hazardous residue, emptiness, or local eligibility. Photo/OCR/image upload, metadata stripping, moderation and cloud AI are disabled.
- Correction reports are local drafts, not submitted; the UI states this. No admin moderation endpoint is exposed without authentication/operations.
- Local history and drafts rely on AsyncStorage, not encrypted high-security storage; they are minimized. Android backup is disabled, but signed iOS/operating-system backup behavior is not verified and the UI discloses that a backup may include local data.
- No analytics/crash vendor is active; telemetry is a no-op privacy boundary until approval.
- One physical EAN-13, permission-recovery, known/unknown/OFF/offline/cache and provenance subset passes on iPhone. The redesigned Home/manual/resolved result and a home/scanner/manual-invalid VoiceOver subset pass; the repaired asynchronous-result announcement and actual torch operation still await device retest. EAN-8/UPC-A and adverse camera conditions, remaining VoiceOver/largest text/dark/reduced-motion and valid native performance/battery evidence remain unmeasured.
- The final 2026-09-04 exported web entry is 2,540,918 bytes uncompressed / 575,233 bytes gzip and exceeds its warning budget; web distribution is undecided.
- Privacy/terms/store metadata are drafts pending external review.
- Six moderate and one low dependency advisories remain monitored in the post-patch snapshot. The new fast-uri high findings were patched; Metro no longer includes image-size and its old high-severity exceptions were removed. The final live audit endpoint times out, so the policy fails closed rather than claiming a fresh security pass.
- Expo 57.0.19 compatibility passes install check and Doctor 20/20 on 2026-09-04 without age exclusions. Every dependency update remains subject to strict release age, full validation and native rebuild where applicable; compatibility alone is not physical runtime evidence.
- GitHub Code Security is not enabled for the private repository, so the prepared CodeQL job is feature-gated; enabling it may require owner-approved paid plan/security access.
- GitHub branch protection is unavailable on the current private-repository plan; GitHub returned `403` and offered a Pro upgrade or public visibility.
