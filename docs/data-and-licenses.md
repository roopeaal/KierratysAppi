# Aineistot ja lisenssit

- **Open Food Facts ja muut Open Facts -tuotetietokannat:** yhteisön tuotetietoa,
  ODbL 1.0 -tietokanta ja DbCL-sisältö. Tuote ja pakkausosat voivat puuttua.
  Lähde ja lisenssi säilytetään kenttien provenienssissa. Mahdollisten
  tuotekuvien oikeudet käsitellään erikseen; kuvien oikeuksia ei johdeta tietokannasta.
  [Offline-pakkaushavainnot](../mobile/app/assets/data/fi-package-observations.json)
  ovat erillinen, [ODbL 1.0 / DbCL -lisensoitu](https://world.openfoodfacts.org/data)
  aineisto: © Open Food Facts contributors, 93 Suomen markkinoiden kuluttajakoodia,
  223 osaa, tarkistuspäivä 23.11.2026. Kukin havainto sisältää lähde-URL:n, revision
  ja osan tunnisteen. Aineisto ei takaa osien oikeellisuutta eikä täydellistä kattavuutta.
- **Tarkistetut pakkaushavainnot:** `6415600502078`, Coca-Cola Zero Sugar,
  1,5 l pantillinen muovipullo, tarkistettu 2026-11-19
  [S-kauppojen tuotetiedosta](https://www.s-kaupat.fi/tuote/coca-cola-zero-sugar-virvoitusjuoma-muovipullo-1-5-l/6415600502078).
  Tämä on yksittäinen, omin sanoin kirjattu havainto, ei kaupan tuotetietokanta.
  Mukana ei ole tuotekuvaa, kuvaustekstiä eikä tietoja korkista tai etiketistä.
  Havainto on erillään OFF-aineistosta; Palpa on palautusohjeen lähde.
  Lisäksi kolme suomalaisen vähittäispakkauksen OFF-havaintoa on rajattu
  valmistajan sivulta ristiintarkistettuihin osiin (25.11.2026):
  [riisipuuro 6412000034840](https://www.saarioinen.fi/tuotteet/laktoositon-riisipuuro-270-g/),
  [lihakaalilaatikko 6412000030149](https://www.saarioinen.fi/tuotteet/lihakaalilaatikko-380-g/) ja
  [broilermakaronilaatikko 6412000030507](https://www.saarioinen.fi/tuotteet/broilermakaronilaatikko-400-g/).
  ODbL/DbCL-attribuutio säilyy; valmistajan tekstiä, kuvia tai tuoteluetteloa
  ei tuoda. Nämä eivät ole väitteitä kaikkien osien kattavuudesta.
- **OpenStreetMap:** erillinen Suomen kierrätyspisteaineisto, ODbL 1.0,
  © OpenStreetMap contributors. Täysi aineisto, muunnin ja
  [tarkat oikeus-/päivitystiedot](../mobile/app/assets/data/README.md) ovat mukana.
  Etäisyys lasketaan laitteessa; GPS:ää ei liitetä aineistoon eikä lähetetä.
- **HSY:** mukana oleva kaksikielinen opasaineisto on aluerajattu HSY-kuntiin.
  Tietueiden lähde-, lisenssi-, kieli- ja hakuaikatietoja ei poisteta.
  Hankintatyökalut ovat scripts/data-kansiossa; API-tunnukset jäävät palvelimelle.
- **Rinki ja Palpa:** lähteistettyjä, omin sanoin kirjoitettuja pakkaus-/pantti-
  ohjeita. Soveltamisalue, tarkistuspäivä ja sääntöversio näkyvät vastauksessa.
- **Kuvamallit:** Google SigLIP2 sekä säilytetyn natiiviputken MobileCLIP.
  Mallit ovat valmiita malleja, eivät itse tyhjästä opetettu yleis-AI.
  Oma koodi tekee esikäsittelyn, vertailun, epävarmuuden hallinnan ja ohjevalinnan.
  Mallien, JPEG-käsittelyn, tokenizerien ja muiden mukana jaettavien osien
  lisenssit/notices säilyvät natiiviresursseissa ja palvelimen mallipaketissa.
- **Rakennustyökalujen glob-moottori:** Minimatch 11 ja
  @isaacs/nonrecursive-glob-match ovat BlueOak-1.0.0-lisensoituja.
  https://blueoakcouncil.org/license/1.0.0.
  Riippuvuuksien alkuperäiset LICENSE-tiedostot säilyvät. Oma sovitin ei sisällä
  picomatchin koodia; kahdeksan MIT-työkalun sovitukset ovat patches-kansiossa.

Lähteiden lisenssit eivät muutu tämän projektin lähdekoodilisenssiksi.
Puuttuvaa tietoa, vastaanottopaikkaa tai tuotteen materiaalia ei keksitä.
GS1:n tuotantointegraatio ei ole käytössä; testien mock ei ole oikea tietolähde.

Tietojen ja mallien hankinta-/tarkistusskriptit sekä toistettavien testien
lähdeaineistot säilyvät scripts-kansiossa. Lisenssien ja jaettavan aineiston
rajauksia ei voi ohittaa siivoamalla dokumentteja.
