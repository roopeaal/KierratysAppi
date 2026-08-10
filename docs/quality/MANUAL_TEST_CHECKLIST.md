# Manual release checklist

Record device, OS, build/version, locale, text scale, tester, date, and evidence link for every run.

## Install and launch

- [ ] Fresh install opens without account creation.
- [ ] Finnish default and English switch persist on-device.
- [ ] Purpose and privacy defaults are understandable before camera permission.
- [ ] Upgrade from the previous production build preserves supported local settings.

## Camera and lookup

- [ ] Camera permission is requested only after the scan action.
- [ ] Denial offers settings and manual entry; permanent denial recovers after settings change.
- [ ] EAN-8, EAN-13, UPC-A and manual GTIN variants decode/validate.
- [ ] UPC-E and other unsupported barcode formats do not start a lookup or become a guessed GTIN.
- [ ] Identical rapid callbacks trigger only one lookup.
- [ ] Invalid checksum never reaches the network.
- [ ] Loading, resolved, missing packaging, unknown product, ambiguity, provider outage, timeout and offline states are distinguishable.
- [ ] Offline GTIN is kept on-device and retry succeeds when connectivity returns.

## Accuracy and trust

- [ ] Every resolved component shows destination, preparation, explanation, source, checked date and text confidence.
- [ ] Bottle/can without confirmed deposit status asks the user; it does not default to material collection.
- [ ] Unsupported/non-packaging/hazardous cases do not fabricate a normal bin.
- [ ] Open Food Facts attribution and community status are visible; mock GS1 never appears in production composition.
- [ ] Finnish editorial reviewer signs off all Rinki/Palpa copy and exceptions.

## Privacy, accessibility and resilience

- [ ] Device-only history starts off, opt-in is explicit, clear works, disabling erases it.
- [ ] No raw GTIN/photo/location/user text appears in analytics or routine server URLs/logs.
- [ ] Legal drafts are replaced with approved documents before production.
- [ ] VoiceOver and TalkBack can complete scan-alternative/manual/result/error flows.
- [ ] 200% text remains operable; orientation, dark mode and contrast pass.
- [ ] Reduced-motion setting causes no essential information loss.
- [ ] Airplane mode, slow network, provider 429/5xx, and app background/foreground recover safely.

## Release operations

- [ ] Clean CI/security runs pass on the release commit.
- [ ] Migration backup/restore and rollback drill succeeds in staging.
- [ ] Production environment variables and secret rotation contacts are verified.
- [ ] Android AAB and iOS IPA install and launch from internal tracks.
- [ ] Store privacy/data-safety/accessibility answers match actual binary behavior.
