# Known limitations

- No Android/iOS native build was possible locally: JDK/Android SDK/ADB/full Xcode/signing are absent. Camera quality and native accessibility are unverified.
- Barcode product lookup currently composes only the Open Food Facts `food` product type. Non-food barcodes are not covered; internal PostgreSQL and licensed GS1 repositories are modeled but not production-wired.
- API cache is per-process memory; production needs a bounded shared/cache/repository policy that preserves ODbL attribution and deletion/staleness decisions.
- Open Food Facts packaging components are often partial/community data. Confidence is capped; some component names/materials remain unknown.
- Nationwide Finnish packaging rules do not replace hazardous-product instructions or municipality-specific guidance. No collection-point map is included.
- Typed EU material codes cover a conservative official subset; code recognition cannot establish packaging shape, deposit status, hazardous residue, emptiness, or local eligibility. Photo/OCR/image upload, metadata stripping, moderation and cloud AI are disabled.
- Correction reports are local drafts, not submitted; the UI states this. No admin moderation endpoint is exposed without authentication/operations.
- Local history and drafts rely on AsyncStorage, not encrypted high-security storage; they are minimized. Android backup is disabled, but signed iOS/operating-system backup behavior is not verified and the UI discloses that a backup may include local data.
- No analytics/crash vendor is active; telemetry is a no-op privacy boundary until approval.
- Native performance budgets and OS large-text/dark/device screenshots are unmeasured.
- The exported web entry is 2,525,687 bytes uncompressed / 572,183 bytes gzip and exceeds its warning budget; web distribution is undecided.
- Privacy/terms/store metadata are drafts pending external review.
- Two Metro `image-size` build-tool DoS advisories have time-limited exceptions because the declared patched release is unavailable.
- Expo Doctor is 19/20 and Expo compatibility check fails for four patches released too recently to satisfy the minimum-release-age policy.
- GitHub Code Security is not enabled for the private repository, so the prepared CodeQL job is feature-gated; enabling it may require owner-approved paid plan/security access.
- GitHub branch protection is unavailable on the current private-repository plan; GitHub returned `403` and offered a Pro upgrade or public visibility.
