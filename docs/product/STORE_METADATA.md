# Store metadata working draft

Status: **incomplete — OWNER/LEGAL/STORE REVIEW REQUIRED; not submission-ready**

Final answers must be regenerated from the accepted signed Android/iOS binaries, dependency inventory, deployed providers and approved privacy documents. This file is a preparation worksheet, not a declaration to Apple or Google.

## Identity

- App name: KeepItGreen (owner-requested rename; name availability and brand rights remain OWNER/LEGAL/STORE REVIEW REQUIRED)
- Finnish subtitle/short description candidate: `Pakkauksesta oikeaan paikkaan`
- English subtitle/short description candidate: `Source-backed sorting guidance`
- Android package / iOS bundle ID: `fi.roopeaaltonen.kierratysappi`
- Source version/build: `0.1.0`, Android `versionCode=1`, iOS `buildNumber=1`; release owner must use monotonically increasing final store values.
- Primary category candidate: Utilities; owner/store review required.
- Launch locales candidate: Finnish and English only.

## Finnish description candidate

KeepItGreen hakee elintarvikkeen pakkaustietoa viivakoodilla ja näyttää saatavilla oleville pakkauksen osille lähteisiin perustuvat lajitteluohjeet. Näet minne osa kuuluu, miten se valmistellaan, mihin sääntöön ohje perustuu ja kuinka varmaa tuotetieto on.

Jos tuotetta tai pakkaustietoa ei löydy, sovellus ei arvaa. Voit tarkistaa koodin, tunnistaa materiaalimerkinnän käsin tai käyttää tarkistettua yleisohjetta. Pantillinen juomapakkaus käsitellään erikseen.

Perushaku ei vaadi käyttäjätiliä. Paikallinen hakuhistoria on vapaaehtoinen. Kamerakuvaa ei lähetetä viivakoodin luvussa. Tuotetiedot tulevat Open Food Facts -yhteisötietokannasta ja voivat olla puutteellisia.

## English description candidate

KeepItGreen looks up food-product packaging by barcode and gives source-backed Finnish sorting guidance for available packaging components. It shows the destination, preparation, rule source, and confidence of the underlying product data.

When product or packaging data is missing, the app does not guess. Users can check the code, confirm a visible material marking manually, or open reviewed general guidance. Deposit containers are handled separately.

Basic lookup needs no account. Local history is optional. Camera frames are not uploaded while scanning a barcode. Product details come from the Open Food Facts community database and may be incomplete.

## Existing source assets

| Asset | Evidence | Store status |
| --- | --- | --- |
| Main icon | 1024×1024 PNG | Source exists; validate in both consoles |
| Android adaptive foreground | 1024×1024 PNG | Source exists; launcher/store tooling validation pending |
| Android monochrome | 1024×1024 PNG | Source exists; themed-icon device validation pending |
| Splash | 1024×1024 PNG | Source exists; signed-device validation pending |
| Favicon | 64×64 PNG | Web only; web release undecided |

## Missing mandatory/release assets

- Finnish and English phone screenshots captured from accepted signed binaries.
- iPad/tablet screenshots because iOS currently declares tablet support; owner may instead make a justified product/config decision before release.
- Google Play feature graphic: exactly 1024×500 JPEG or 24-bit PNG without alpha.
- Any additional current console-requested device/form-factor images.
- Asset rights/brand approval and console preview validation.

Text in screenshots must have locale-specific sets. Screenshots may not show simulated camera success, unsupported GS1/OCR/AI capability, rankings, environmental benefit claims, or product accuracy guarantees.

## URL/contact blockers

- Public approved Privacy Policy URL: **missing**.
- Public Support URL/contact: **missing**.
- Optional Apple User Privacy Choices URL / rights/deletion page: decision **missing**.
- Monitored OFF/API operations contact: **missing owner mailbox**.
- Security contact and safe-harbor publication: **missing approval**.

## Apple questionnaire worksheet

Reconfirm in App Store Connect from the final binary:

- App Privacy: barcode/GTIN is transmitted to KeepItGreen API and OFF for app functionality; IP is necessarily processed by network/rate-limiting infrastructure. Exact Apple data-type/linkability/collection treatment requires controller/legal assessment and final vendor configuration.
- Tracking/advertising: source implements none; verify all final SDKs and manifests.
- Camera: barcode decoding only; frames not uploaded; verify signed behavior.
- Accounts: none in current scope.
- Encryption/export: source declares only exempt standard transport (`ITSAppUsesNonExemptEncryption=false`); release owner must validate the final binary and answer.
- Content/age rating, rights, primary/secondary category, DSA/trader status, Korea/China/Vietnam availability, reviewer contact/notes: **not finalized**.
- Privacy manifest/reason APIs: clean source prebuild declares UserDefaults CA92.1 and no tracking/collected types; inspect final archive merge and App Store report.

## Google Play questionnaire worksheet

Reconfirm in Play Console from the final AAB:

- Data Safety form is required even if the approved conclusion is no collected/shared user data; a privacy policy URL is still required.
- Barcode/GTIN, IP handling, OFF transfer, optional local history/drafts, diagnostics/monitoring and any backups must be classified by the controller from final behavior.
- Data deletion questions are required. Current app has no account and can delete all app-local data; controller-side rights/retention process remains unresolved.
- Camera purpose, ads, target audience/age, content rating, app access, news/health/financial/government declarations and advertising ID: **not finalized**.
- Target API: validate API 36+ for submissions from 2026-08-31 in the final AAB.
- Feature graphic, phone/tablet screenshots, short/full descriptions and support/privacy contact: **incomplete**.

## Reviewer notes candidate

The camera is used only for local barcode decoding. Users see an explanation before the operating-system permission prompt and can use manual entry instead. No account, photo upload, OCR, cloud AI, public correction submission, location or advertising is present. Product data is community-sourced from Open Food Facts; Finnish packaging guidance shows sources and uncertainty. Replace this candidate with exact final URLs/build behavior and credentials-free review steps.

## Completion rule

Store materials become complete only when OA-06, OA-08, OA-09 and OA-10 in `docs/final/OWNER_ACTIONS.md` have signed evidence and both consoles accept the final artifact/material set. Repository copy/assets alone do not satisfy this gate.
