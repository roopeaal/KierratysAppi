# Apple Vision local implementation sources

Accessed2026-11-03; required-reason declaration rechecked2026-11-04. Scope is
the implemented iOS-only pilot, not a general model comparison or training claim.

- [Apple image classification](https://developer.apple.com/documentation/vision/vnclassifyimagerequest)
  and installed SDK declarations: record explicit classification revision2 on
  iOS17+/macOS14+, otherwise1; no immutable distributable checkpoint hash exists
  in this implementation. OS/hardware changes require renewed evaluation.
- [Apple WWDC2019 session222](https://developer.apple.com/videos/play/wwdc2019/222/),
  classification/filtering discussion10:42–19:52: labels are hierarchical and
  multi-label, with per-class precision/recall operating points. Cross-class
  maximum/margin comparisons do not follow the API semantics. This is why V1
  was superseded rather than merely relaxing its thresholds after poor results.
  The nominal operating point is not this app's measured field precision.
- [Apple OCR](https://developer.apple.com/documentation/vision/vnrecognizetextrequest):
  query actual revision/language support; record the actual subset. Mac en-US,
  de-DE and sv-SE support is not Finnish-specialized camera OCR evidence.
- [Expo local modules](https://docs.expo.dev/modules/get-started/) and
  [module API](https://docs.expo.dev/modules/module-api/): a local module needs a
  new native binary. Optional import is necessary for web/Android/old-client
  failure recovery, not a way to provide an absent implementation.
- [Apple system uptime](https://developer.apple.com/documentation/foundation/processinfo/systemuptime)
  and [required API reasons](https://developer.apple.com/documentation/bundleresources/app-privacy-configuration/nsprivacyaccessedapitypes/nsprivacyaccessedapitype):
  SystemBootTime reason35F9.1 covers elapsed in-app event/timer calculations.
  We use elapsed inference/deadline only, with no raw uptime output or tracking.
  The page's Markdown omits Possible Values; its official
  [DocC JSON](https://developer.apple.com/tutorials/data/documentation/bundleresources/app-privacy-configuration/nsprivacyaccessedapitypes/nsprivacyaccessedapitype.json)
  retains `possibleValues` → `NSPrivacyAccessedAPICategorySystemBootTime` and
  the35F9.1 definition. Pod resource packaging is checked separately.

Licensing boundary: Apple's system framework/pretrained model remains supplied
by the installed Apple OS/SDK under applicable Apple developer/platform terms;
no Apple weights are copied, relicensed as open source or downloaded by this app.
This is not a promise that App Store distribution/account obligations disappear.
Existing eight OFF public-image licences/attribution and references remain in
`docs/final/PHOTO_PRODUCT_EVALUATION.md`; no new internet image harvest occurs.
The three synthetic text fixtures are owned diagnostic inputs, not product photos
or real-world quality evidence. No new npm/model runtime dependency is introduced.
