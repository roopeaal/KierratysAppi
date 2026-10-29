# Patched iPhone client 4 — October 29, 2026

Roope requested updating the phone after SDK58 security maintenance `e815522`.
Same branch/app/version/team; no GitHub sharing, paid inference, new account,
uninstall/reset or production publication.

## Preparation and source validation

- Same intended iPhone is connected, paired, Developer Mode enabled and DDI
  available. Targeted installed-app inventory reports KeepItGreen0.1.0/build3;
  no private app contents/history/location were read.
- Strictly verified client3 and its valid existing profile, then completed an
  APFS clone of the signed app and the entire generated iOS tree **before**
  prebuild. Clone signature and saved native lock match pass. No deletion or
  reuse of earlier cleanup approvals; about11GiB free initially.
- Increase only iOS build3→4, retain0.1.0/app ID/scheme and Android2. Update
  the corresponding policy and add one native-Constants guard case: build4
  works; mutable `expoConfig` cannot replace missing immutable native metadata.
  Initial full check caught an excess-property type error in the new negative
  fixture; structural-variable repair retains strict typing, no cast/suppression.
- Fresh full validation passes **430 unique cases (113 policy+317 application)**,
  all boundaries/format/lint/types/builds/16 routes. Focused mobile typecheck,
  twelve photo cases and four photo-policy cases pass; overlapping counts.
- Expo prebuild from `mobile/app` clears/recreates the ignored iOS tree;
  backup is already complete. Revert only its incidental Android/iOS npm-script
  changes explicitly. Resolve the **new** native dependencies rather than
  restoring the old lock. CocoaPods1.17 installs122 pods/123 Podfile dependencies;
  new Podfile.lock equals Pods/Manifest.lock. Official SDK58 patch pods and
  React-Core0.88.1 match JS dependencies.

## Native build and installation

**BUILD SUCCEEDED / installed and launched.** Stable Xcode26.6/iOS26.5 SDK,
one job/index-store disabled, same existing team and intended device. Reused
the existing DerivedData to bound disk use; independent old-app clone remains
untouched. No ENOSPC or new credential prompt; about6.7GiB remained after build.

- Explicit client4 verifier passes actual/config build4, version0.1.0, unchanged
  app ID/name/scheme, strict app and all **11 embedded framework** signatures,
  default/FI/EN camera/location purpose equality, no microphone/Always/background
  location, signed/profile/team/device/get-task-allow binding and native lock
  equality. Verified12 updated native pod versions, including React-Core0.88.1.
  Framework marketing version1.0 is not used as proof of the RN patch version.
- Actual profile is **reused, not renewed**: created October28 at18:28:39UTC,
  expires November4 at18:28:39UTC / **4.11.2026 klo20.28.39 Helsinki**. A build
  bump is not a new seven-day signing period. Binary/native-lock hashes and
  resolved versions are recorded in ignored native-verification.json.
- Replacement install succeeds without uninstall/reset. Exact-bundle device
  inventory confirms **KeepItGreen0.1.0/build4**. No private history/container
  contents were read; this operation does not independently prove retention.
- Current LAN iOS manifest reports SDK58/build4; its exact launch asset returns
  HTTP200, **12,156,274 bytes**, correct LAN API origin and no credential-like
  or server-key configuration markers. Availability GETs pass, no inference.
- Native dev-client launch succeeds with no new trust prompt; repeated targeted
  queries retain the same launched PID. One actual in-scope Home screenshot
  confirms illustrated layout/current combined action/four tabs. A passive
  native `/identify` deep link and screenshot confirm selected Identify tab,
  barcode-first layout, manual second and AI third with uncertainty copy.
  Return-to-Home link and later same-process query succeed.
- This is actual native startup/two-screen rendering/direct-link evidence,
  **not physical button/keyboard/camera/GPS/large-text/VoiceOver/AI-accuracy or
  all-flow acceptance**. No camera view, image capture/upload, location, real
  barcode/provider lookup or billable request. Wider controlled navigation/
  larger-text acceptance remains next; source/browser proofs remain separate.

## Development services and permission

An initial attempt to bind the API to all interfaces was blocked before
execution. Roope subsequently explicitly approved the current trusted LAN
and reusing the existing server-only OpenAI key. Bind the API only to the
current LAN address, not all interfaces. Health/capability GETs pass; they
perform no image recognition or paid inference. No key value is inspected,
printed, rewritten or included in the phone bundle. No new key was created.

Patched Metro delivery stayed disabled for old client3 until build4 installation
was independently confirmed. Expo binds127.0.0.1:8093; an ignored no-payload-log
TCP forwarder exposes only the explicitly approved current LAN address:8093.
API binds that address:3003. No wildcard/all-interface listener. Runtime
services remain running for the updated phone; loopback web QA8094 is separate.
The credential skill prompted an explicit reuse choice before restoring the
API; no key was created/rewritten/exposed and no paid verification call was made.
This remains a Mac/LAN-dependent Debug installation, not standalone distribution.

## Evidence

Ignored root: `work/ios-patch-2026-10-29.jsZhvk/`. Contains device/targeted
inventory/lock-state receipts, complete rollback app/tree, prebuild/pod/build
logs, first failing `validate.log`, repaired `validate-repaired.log`, API health
and explicit client4 verifier. Profiles/device identifiers/binaries/private
screenshots stay ignored and out of Git. Key receipts: native-verification.json,
install.json, installed-after.json, dev-runtime-verification.json, launch.json,
process-{1,2,3}.json, native-home.png, native-identify.png, return-home.json.
Final post-documentation mobile241 overlapping cases and full430 cases pass;
logs `validate-mobile.log` / `validate-final.log`, with details in TEST_EVIDENCE.
