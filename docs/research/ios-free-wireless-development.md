# Free wireless iPhone development

Checked: 2026-09-10. Scope: the owner's KeepItGreen development installation, not store distribution or a new hosting authorization.

## Verified platform limits

- Apple's free Personal Team provisioning expires seven days after issuance. Continued use requires renewed provisioning and rebuilding/reinstalling; a single free profile cannot cover the rest of 2026. Source: [Apple developer account overview](https://developer.apple.com/help/account/basics/about-your-developer-account/), accessed 2026-09-10.
- Xcode supports wireless device development after pairing/trust. Apple's procedure uses an initial USB connection, Window → Devices and Simulators → device → Connect via network, then disconnecting USB. Keep the device and Mac on a reachable shared network; exact controls may differ in the installed Xcode. Source: [Apple wireless pairing](https://help.apple.com/xcode/mac/current/en.lproj/devbc48d1bad.html), accessed 2026-09-10.
- Expo's normal local Debug workflow runs Metro to serve JavaScript. Its local build tooling also supports Release configuration. This distinction is separate from Apple signing lifetime. Source: [Expo local development](https://docs.expo.dev/guides/local-app-development/), accessed 2026-09-10.

## Application-specific state and procedure

The restored Xcode 26.6 Debug client currently relies on Mac-hosted Metro and the local API. Wireless use therefore still needs those services and network access to the Mac. The last recorded native profile expires **2026-09-11 07:01:05 UTC (10:01:05 Europe/Helsinki)**; no profile renewal or new native installation was performed during the rename.

1. **Codex + Roope:** rebuild the renamed client using explicit Xcode 26.6 (`DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer`), the existing Personal Team and unchanged bundle ID. Roope handles any account/trust prompt; do not print credentials. Inspect only expiry/identity/signature metadata and install over the existing app, without uninstalling or deleting its local data.
2. **Codex + Roope:** verify the paired device is reachable wirelessly, current API/Metro LAN origins are healthy, then remove USB and test Home → manual known-product lookup → background return → force-quit/relaunch. Record actual phone evidence; configuration and browser tests do not prove this path.
3. **Roope, with Codex assistance:** renew provisioning and reinstall before each seven-day expiry for continued free use. No recurring job has been created. Wireless renewal is conditional on working pairing; it has not been accepted on this setup.

To also work while the Mac is off, a separate embedded-JavaScript test build and a reachable backend are required. Codex can implement/test the build, but hosting/account/region/cost/publication decisions belong to Roope under OA-01. Neither step extends Personal Team signing beyond seven days. Do not promise a free hosting service or a maintenance-free native installation through December 31.

Keep Xcode 27 out of application builds until the separately documented UIScene startup defect is repaired. Renaming or upgrading macOS does not repair that defect or extend a provisioning profile.
