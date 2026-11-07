# Store metadata working draft

Status: **incomplete — OWNER/LEGAL/STORE REVIEW REQUIRED; not submission-ready**

Final answers must be regenerated from the accepted signed Android/iOS binaries, dependency inventory, deployed providers and approved privacy documents. This file is a preparation worksheet, not a declaration to Apple or Google.

## Identity

- App name: KeepItGreen (owner-requested rename; name availability and brand rights remain OWNER/LEGAL/STORE REVIEW REQUIRED)
- Finnish subtitle/short description candidate: `Pakkauksesta oikeaan paikkaan`
- English subtitle/short description candidate: `Source-backed sorting guidance`
- Android package / iOS bundle ID: `fi.roopeaaltonen.kierratysappi`
- Source version/build: `0.1.0`, Android `versionCode=2`, iOS `buildNumber=8` (November7 local-readiness source/unsigned Debug, not a signed store submission); release owner must verify final binary values and monotonically increase them.
- Primary category candidate: Utilities; owner/store review required.
- Launch locales candidate: Finnish and English only.

## Finnish description candidate

KeepItGreen hakee tuotteen pakkaustietoa viivakoodilla ja näyttää saatavilla oleville pakkauksen osille lähteisiin perustuvat lajitteluohjeet. Näet minne osa kuuluu, miten se valmistellaan, mihin sääntöön ohje perustuu ja kuinka varmaa tuotetieto on.

Jos tuotetta tai pakkaustietoa ei löydy, sovellus ei arvaa. Voit tarkistaa koodin, tunnistaa materiaalimerkinnän käsin tai käyttää tarkistettua yleisohjetta. Pantillinen juomapakkaus käsitellään erikseen.

Perushaku ei vaadi käyttäjätiliä. Paikallinen hakuhistoria on vapaaehtoinen. Kamerakuvaa ei lähetetä viivakoodin luvussa. Tuotetiedot tulevat Open Food Facts-, Open Beauty Facts-, Open Pet Food Facts- tai Open Products Facts -yhteisötietokannasta ja voivat olla puutteellisia. Vapaaehtoinen sijaintihaku näyttää aineiston lähimmän kierrätyspisteen arvioidun etäisyyden linnuntietä. OpenStreetMap-pisteaineisto ei takaa kattavuutta, aukioloa tai materiaalien vastaanottoa; oma sijainti käsitellään vain laitteella.

## English description candidate

KeepItGreen looks up product packaging by barcode and gives source-backed Finnish sorting guidance for available packaging components. It shows the destination, preparation, rule source, and confidence of the underlying product data.

When product or packaging data is missing, the app does not guess. Users can check the code, confirm a visible material marking manually, or open reviewed general guidance. Deposit containers are handled separately.

Basic lookup needs no account. Local history is optional. Camera frames are not uploaded while scanning a barcode. Product details come from the Open Food Facts, Open Beauty Facts, Open Pet Food Facts or Open Products Facts community databases and may be incomplete. Optional location search estimates straight-line distance to the nearest point in the OpenStreetMap directory. Coverage, opening hours and accepted materials are not guaranteed; your location is processed only on your device.

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
- Camera: barcode decoding locally; iOS-only Apple Vision image/OCR plus pinned2024 MobileCLIP-S0 no-match supplement also local, with no image/OCR history or automatic sorting. The bundled model retains original2024 weight/software/component notices and qualified no-endorsement attribution; similarity is not factual/material confidence. The separately named optional OpenAI path sends a consented image via the app server and retains its distinct provider/privacy/cost disclosure. Do not answer this questionnaire as barcode-only; verify signed final behavior and recipient/retention declarations.
- Accounts: none in current scope.
- Encryption/export: source declares only exempt standard transport (`ITSAppUsesNonExemptEncryption=false`); release owner must validate the final binary and answer.
- Content/age rating, rights, primary/secondary category, DSA/trader status, Korea/China/Vietnam availability, reviewer contact/notes: **not finalized**.
- Privacy manifest/reason APIs: source includes UserDefaults CA92.1 and local module SystemBootTime35F9.1 (elapsed in-app processing/deadline). Local module manifest is packaged in unsigned Debug build8; inspect the final signed archive, every SDK manifest and App Store report before declaring collection/tracking status.

## Google Play questionnaire worksheet

Reconfirm in Play Console from the final AAB:

- Data Safety form is required even if the approved conclusion is no collected/shared user data; a privacy policy URL is still required.
- Barcode/GTIN, IP handling, OFF transfer, optional local history/drafts, diagnostics/monitoring and any backups must be classified by the controller from final behavior.
- Data deletion questions are required. Current app has no account and can delete all app-local data; controller-side rights/retention process remains unresolved.
- Camera purpose, ads, target audience/age, content rating, app access, news/health/financial/government declarations and advertising ID: **not finalized**.
- Target API: validate API 36+ for submissions from 2026-08-31 in the final AAB.
- Feature graphic, phone/tablet screenshots, short/full descriptions and support/privacy contact: **incomplete**.

## Reviewer notes candidate

Camera flows include local barcode decoding and a separate iOS-only local image/OCR estimator, with a bundled MobileCLIP-S0 supplement on supported installations. Estimates do not establish exact product/material identity or automatic sorting; extracted markings require confirmation. Users see a permission explanation and can choose manual entry. The separately named optional OpenAI photo path requires explicit recipient/upload consent and an available configured server; it is not the local path or a silent fallback. There is no account or advertising. Product data is community-sourced from the four named Open Facts databases; Finnish packaging guidance shows sources and uncertainty. Foreground-only location is optional and processed locally against bundled OSM points, without GPS upload/storage/background tracking. Verify final binary behavior, cloud service access/retention and all review paths; current changes have no new phone acceptance. Replace this candidate with final URLs and exact credentials-free steps or approved reviewer access. This draft is not ready for submission.

October 7 questionnaire delta (OWNER/LEGAL/STORE REVIEW REQUIRED): classify all
four potential external barcode recipients, not OFF alone. Evaluate foreground
precise/approximate location processed only on-device, the absence of location
collection/retention, and ordinary IP disclosure on voluntary OSM browser links.
Do not silently mark either console questionnaire complete from source review.

## Completion rule

Store materials become complete only when OA-06, OA-08, OA-09 and OA-10 in `docs/final/OWNER_ACTIONS.md` have signed evidence and both consoles accept the final artifact/material set. Repository copy/assets alone do not satisfy this gate.
