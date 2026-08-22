# Known limitations

- No Android native build was possible locally because JDK/Android SDK/ADB and signing are absent. An iOS Personal-Team Debug build now compiles, installs and runs on one iPhone, but it expires after seven days and is not archive/TestFlight/release evidence.
- Barcode product lookup currently composes only the Open Food Facts `food` product type. Non-food barcodes are not covered; internal PostgreSQL and licensed GS1 repositories are modeled but not production-wired.
- API cache is per-process memory; production needs a bounded shared/cache/repository policy that preserves ODbL attribution and deletion/staleness decisions.
- Open Food Facts packaging components are often partial/community data. Confidence is capped; some component names/materials remain unknown.
- Nationwide Finnish packaging rules do not replace hazardous-product instructions or municipality-specific guidance. No collection-point map is included.
- Typed EU material codes cover a conservative official subset; code recognition cannot establish packaging shape, deposit status, hazardous residue, emptiness, or local eligibility. Photo/OCR/image upload, metadata stripping, moderation and cloud AI are disabled.
- Correction reports are local drafts, not submitted; the UI states this. No admin moderation endpoint is exposed without authentication/operations.
- Local history and drafts rely on AsyncStorage, not encrypted high-security storage; they are minimized. Android backup is disabled, but signed iOS/operating-system backup behavior is not verified and the UI discloses that a backup may include local data.
- No analytics/crash vendor is active; telemetry is a no-op privacy boundary until approval.
- One physical EAN-13, permission-recovery, known/unknown/OFF/offline/cache and provenance subset passes on iPhone. EAN-8/UPC-A and adverse camera conditions, VoiceOver/largest text/dark/reduced-motion, native performance/battery and device screenshots remain unmeasured.
- The exported web entry is 2,528,030 bytes uncompressed / 571,827 bytes gzip and exceeds its warning budget; web distribution is undecided.
- Privacy/terms/store metadata are drafts pending external review.
- Two Metro `image-size` build-tool DoS advisories have time-limited exceptions because the declared patched release is unavailable.
- Expo compatibility passes, but every future dependency update remains subject to the strict 1,440-minute age gate, install check, Doctor and full validation.
- GitHub Code Security is not enabled for the private repository, so the prepared CodeQL job is feature-gated; enabling it may require owner-approved paid plan/security access.
- GitHub branch protection is unavailable on the current private-repository plan; GitHub returned `403` and offered a Pro upgrade or public visibility.
