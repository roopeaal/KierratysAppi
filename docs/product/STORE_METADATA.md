# Store metadata draft

Status: **draft; legal, brand and store-owner review required**

## Identity

- Name: KierrätysAppi
- Subtitle / short description: Pakkauksesta oikeaan paikkaan
- Android package and iOS bundle ID: `fi.roopeaaltonen.kierratysappi`
- Version: semver product version; Android `versionCode`, iOS `buildNumber`, and EAS remote build number increase monotonically.

## Finnish description

KierrätysAppi auttaa tunnistamaan tuotepakkauksen viivakoodista ja näyttää pakkauksen osille lähteisiin perustuvat lajitteluohjeet. Näet minne osa kuuluu, miten se valmistellaan, mihin sääntöön ohje perustuu ja kuinka varmaa tuotetieto on.

Jos tuotetta tai pakkaustietoa ei löydy, sovellus ei arvaa. Voit tarkistaa koodin, tunnistaa materiaalin käsin tai käyttää valtakunnallista yleisohjetta. Pantillinen juomapakkaus käsitellään erikseen.

Perushaku ei vaadi käyttäjätiliä. Paikallinen hakuhistoria on vapaaehtoinen ja säilyy laitteella. Kamerakuvaa ei lähetetä viivakoodin luvussa.

## English description

KierrätysAppi identifies product packaging from a barcode and gives source-backed Finnish sorting guidance for each packaging component. It shows the destination, preparation, rule source, and confidence of the underlying product data.

When product or packaging data is missing, the app does not guess. Users can check the code, confirm a material manually, or open reviewed general guidance. Deposit containers are handled separately.

Basic lookup needs no account. Optional history stays on the device, and camera frames are not uploaded while scanning a barcode.

## Required store work

- Replace legal drafts with approved hosted privacy notice/terms/support URLs.
- Produce phone/tablet screenshots in Finnish and English from signed binaries, including camera permission, resolved, missing, ambiguous and offline states.
- Complete Apple privacy nutrition labels/privacy manifest review and Google Play Data Safety from the actual production binary and vendors.
- Confirm content rating, accessibility declarations, export compliance, encryption, data deletion, support contact and reviewer notes.
- Verify icon/adaptive/monochrome rendering on store tooling and representative launchers.
