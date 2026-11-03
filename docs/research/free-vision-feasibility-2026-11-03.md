# Maksuton oma kuvatunnistus — toteutettavuusarvio

Päivä: 3.11.2026, Europe/Helsinki. Tarkastettu lähdekoodi: `8003ca0`.
Tämä on tutkimus ja ehdotus, ei toteutettu tai laadultaan hyväksytty uusi malli.
Ei mallilatauksia, kuvankeruuta, koulutusta, tunnistusajoja, maksullisia kutsuja,
avainten lukemista, asennuksia, puhelintoimia tai GitHub-kirjoituksia.

## Johtopäätös

**Ilman tunnistuskohtaista API-maksua toimiva toteutus on mahdollinen.**
Realistisin ensimmäinen oma malli on rajattu näkyvien esinetyyppien luokitin,
joka hyödyntää valmista, käyttötarkoitukseen lisensoitua piirre-erotinta.
Tämä on eri asia kuin yleisen kuvakielimallin kouluttaminen tyhjästä tai
minkä tahansa tuotteen ja todellisen pakkausmateriaalin varmistaminen kuvasta.

GPT-6.1 Sol voi auttaa suunnittelussa, ohjelmoinnissa, datan käsittelyssä,
koulutusputkessa, automaattisessa arvioinnissa ja integraatiossa. Virallinen
mallisivu tukee sen käyttöä vaativaan ohjelmointiin; se ei lupaa tämän
käyttökohteen autonomista onnistumista tai tiettyä tunnistustarkkuutta.
Valmiin tunnistimen ei tarvitse kutsua Solia tai OpenAI:ta lainkaan.
[GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol).

Luotettavuutta ei saa hyväksyä saman agentin omalla ilmoituksella tai sen
itse keksimillä oikeilla vastauksilla. Oikein merkityt riippumattomat kuvat,
ennalta sovitut mittarit ja oikeiden puhelinkameroiden kokeet ovat tarpeen.

## Mitä maksuttomuus tässä tarkoittaa

- Puhelimeen pakattu pieni malli voi tehdä kuvakohtaisen päättelyn ilman
  pilvipalvelun laskua tai kuvien siirtoa palvelimelle.
- Kehitystyö, mahdollinen Codex-tilaus/käyttö, sähkö, levytila, ylläpito ja
  erilliset jakelu-/julkaisuehdot eivät muutu nollakustannuksiksi.
- Oman Macin palvelimella ajettu avoin malli poistaa API-laskun, mutta pitää
  koneen, palvelimen saatavuuden ja verkkoyhteyden osana toteutusta.
- Muut nykyiset verkko- ja backend-toiminnot eivät muutu automaattisesti
  offline-toiminnoiksi pelkän kuvantunnistimen vaihdolla.
- Pelkkä palveluntarjoajan ilmaiskiintiö ei ole sama asia kuin oma, ilman
  ulkopuolista tunnistuspalvelua toimiva toteutus.

Laitteesta luettiin vain tekniset resurssit: Apple M1, 8 GiB muistia,
noin15 GiB vapaata projektin levyllä. Tämä tukee pienen kokeilun selvittämistä,
ei todista tietyn mallin koulutusnopeutta tai riittävyyttä. Suuria aineistoja
ei ladattu eikä levytilaa vapautettu.

## Vaihtoehdot

| Vaihtoehto | Käyttö tässä projektissa | Rajoitus |
| --- | --- | --- |
| Oma opetusputki ja esikoulutettu pieni luokitin | Ensisijainen tutkittava vaihtoehto rajatuille näkyville esinetyypeille; offline-malli appiin | Ei yleinen tuote- tai materiaalitietokanta; painojen ja datan lisenssit erikseen |
| Create ML → Core ML | iPhone-painotteinen paikallinen koulutus ja päättely | Applen käyttämää piirre-erotinta ei oleteta sellaisenaan Androidiin siirrettäväksi |
| Siirrettävä malli → ONNX Runtime tai LiteRT | Mahdollinen yhteinen iOS/Android-malliperusta | Native-silta, operaattorit, kvantisointi, kuvankäsittely ja suorituskyky testattava kummassakin |
| Avoin pieni kuvakielimalli omalla koneella | Maksuton per kutsu -vertailuehdokas, jos tarvitaan vapaampaa kuvailua | Ei kokonaan itse luotu malli, ei automaattisesti nykyistä tarkempi tai puhelimessa kevyt |
| Kaikki satunnaisista painoista alkaen | Kapea opetuskokeilu mahdollinen | Laaja yleiskyky kasvattaa data-/laskenta-/tutkimustarvetta; ei perusteltu nollabudjetin lähtökohta |

[Applen opas](https://developer.apple.com/documentation/createml/creating-an-image-classifier-model)
kattaa luokittimen koulutuksen, erillisen arvioinnin ja ohjelmallisen automatisoinnin.
Sen pieni tutoriaalin kuvamäärä ei ole tuotantoluotettavuuden vähimmäistakuu.

[ONNX Runtimella on React Native -rajapinta](https://onnxruntime.ai/docs/get-started/with-javascript/react-native.html)
ja [MIT-lisenssi](https://github.com/microsoft/onnxruntime/blob/main/LICENSE).
Tämä ei todista yhteensopivuutta tämän Expo58/RN0.88-sovelluksen kanssa.
[LiteRT-ohje](https://developers.google.com/edge/litert/overview)
kattaa paikallisen päättelyn, mutta nykyinen uuden Swift-jakelun esijulkaisutila
on erillinen iOS-valintariski; dokumentaation koodiesimerkki ei ole koontinäyttö.

Esimerkiksi julkaisijan [SmolVLM-256M-mallikortti](https://huggingface.co/HuggingFaceTB/SmolVLM-256M-Instruct)
ilmoittaa Apache-2.0-painot ja paikalliset ajotavat. Sen yleiset tulokset eivät
ole KierrätysAppin pakkaus-, suomenkieli- tai lajittelutarkkuuden näyttöä.
Mallia ei ladattu tai ajettu tässä tutkimuksessa.

[ML Kit](https://developers.google.com/ml-kit/guides) on myös maksuton
on-device-SDK. Sen [tietosuojaohje](https://developers.google.com/ml-kit/terms)
kuitenkin kuvaa päivitysyhteydet ja SDK-mittarit: kuvan paikallinen käsittely
ei yksin tarkoita, ettei SDK:lla olisi muuta verkkoliikennettä.

## Nykyiseen appiin yhdistäminen ei ole yhden funktion vaihto

Lähdekoodista varmennetut kohdat:

- `backend/data-providers/src/photo-recognition.ts`: nykyinen palvelinpuolen
  OpenAI Responses -sovitin; havaintoja, ei suoraan lajitteluohjeita.
- `shared/contracts/src/photo-recognition.ts`: nykyinen lähde/malli/versio
  on sidottu `openai-vision` / `gpt-4.1-mini-2025-04-14` / `photo-observation-v1`.
- `mobile/app/src/app/photo.tsx`: palvelimen kyvykkyyskysely edeltää kameraa.
  Tähän polkuun vain liitetty paikallinen malli ei vielä mahdollista offlinea.
- `mobile/app/package.json`: ei nykyistä Core ML/LiteRT/ONNX/OCR-ajomoottoria.
- `mobile/app/src/features/photo/sorting.ts`: osakohtainen materiaalin valinta,
  erilliset olosuhdevarmistukset ja olemassa oleva lähteistetty sääntöpolku.

Uudessa toteutuksessa tarvittaisiin paikallinen native-rajapinta ja malli,
oma saatavuus-/virhepolku, rehellinen versionoitu lähdemetadata sekä FI/EN
käyttöliittymä- ja tietosuojatekstit. Vanhaa OpenAI-vastausta ei saa teeskennellä.
Offline-valinta ei saa hiljaisesti lähettää epäonnistunutta kuvaa maksulliseen
pilvitunnistukseen. Uudet native-moduulit edellyttävät uusia yhteensopivia
koonteja/asennuksia; nykyinen build4 ei saa niitä pelkällä JS-päivityksellä.

Kamera/preview, kuvakoon ja JPEG-rajojen käsittely, metatietojen poisto, väliaikaistiedoston
poisto, keskeytys/taustallemeno, epävarmuus, materiaalikorjaus ja sääntömoottori
ovat uudelleenkäytettävää työtä. Kapea luokitin ei kuitenkaan saa täyttää
nykyistä sopimusta keksityllä tuotenimellä, piilossa olevilla osilla, materiaalilla,
turvallisuusluokalla tai kalibroiduksi väitetyllä varmuudella.

Nykyinenkin maksullinen tunnistin erehtyi tunnetun Nutella-esimerkin purkin
materiaalista. `docs/final/PHOTO_PRODUCT_EVALUATION.md` kuvaa kahdeksan
valitun nettikuvan kokeen ja nimen/merkin maininnan4/8 vastauksessa; tämä ei
ole edustava tarkkuusluku. Vihreät ohjelmistotestit eivät mittaa mallin laatua.
PHOTO-003/PHOTO-004 ja tuotannon NO-GO eivät sulkeudu tällä tutkimuksella.

## Nettikuvat: kyllä testaukseen, ei yksin hyväksyntään

Agentti voi rakentaa toistettavan kuvakohtaisen testiajon ja virheraportin.
Valittu testikuva tai sen oikea vastaus ei saa päätyä opetukseen, kehotteeseen
tai tiedostonimestä tunnistuksen syötteeksi. Raja-arvot valitaan validointidatalla,
lopullista testijoukkoa ei käytetä niiden toistuvaan hienosäätöön.

Tarvittava arviointisuunnitelma ennen koulutusta:

1. Erota tehtävät: näkyvä esinetyyppi, tarkka tuotetunniste, materiaali ja
   sääntöpäätös ovat eri mittareita. Aloitusehdotus on5–8 näkyvää esinetyyppiä,
   esimerkiksi pullo/tölkki/purkki/laatikko, ei väite materiaalista.
2. Tallenna kuvien lähde, oikeusperusta, muokkaus, hash ja ihmisen tai muun
   luotettavan viitteen tarkistama vastaus. Mallin oma vastaus ei riitä totuudeksi.
3. Esinetyyppiluokittimessa jaa opetus/validointi/testi tuotteen, fyysisen
   näytteen ja kuvaussarjan mukaan; saman tuotteen rajaukset/lähesduplikaatit
   eivät saa nostaa näennäistulosta. Tarkassa suljetun katalogin haussa
   arvioi erikseen rekisteröidyn tuotteen uudet kuvat ja tuntemattoman tuotteen
   hylkääminen: tuntemattomalle GTIN:lle ei keksitä nimeä.
4. Sisällytä kuvaerot: eri valot/taustat/kulmat, heijastukset, rypistyminen,
   peittynyt tai puuttuva etiketti, useat esineet, tyhjä/sumea kuva, kuvan
   ulkopuolella olevat osat ja tuoteversiot. Augmentointi ei korvaa uusia esineitä.
5. Testaa erilliset tuntemattomat, ei-pakkaukset ja vaaralliset esimerkit.
   Suljetun luokittimen suurin pistemäärä ei todista, että kuva kuuluu luokkiin.
   Mittaa väärät hyväksynnät ja hylkäysten osuus, ei vain oikeita helppoja kuvia.
6. Raportoi luokkakohtainen precision/recall, sekaannukset, otoskoot,
   epävarmuus ja hyväksyttyjen vastausten kattavuus. Mallin score ei ole
   automaattisesti oikeellisuuden todennäköisyys. Vähäinen virhemäärä pienessä
   aineistossa ei todista nollariskiä.
7. Tarkista oikeilla iPhone-/Android-kameroilla, että esikäsittely ja malli
   vastaavat työpöytätestiä; mittaa kylmä/lämmin käynnistys, viive, muistihuippu,
   OOM/taustallemeno, akun kulutus ja tuettu laitejoukko.
8. Säilytä mahdollisuus olla vastaamatta ja käyttäjän materiaalitarkistus.
   Yksi RGB-kuva ei varmista piilopinnoitteita, polymeeriä, monikerrosrakennetta,
   jokaista osaa, tyhjyyttä, vaarattomuutta tai Suomen vastaanottosääntöä.

[Apple kuvaa aineistojen erojen ja ylisovittumisen vaikutuksia](https://developer.apple.com/documentation/createml/improving-your-model-s-accuracy).
[OpenAI-arviointiohje](https://developers.openai.com/api/docs/guides/evaluation-best-practices)
korostaa etukäteen määritettyjä tavoitteita, erillistä aineistoa ja asiantuntevia
ihmismerkitsijöitä; tämän ei tarvitse tarkoittaa maksullisen Evals-palvelun käyttöä.

Ilmaisia lähteitä on, mutta internetin saatavuus ei ole käyttölupa.
[OFF:n kuva-aineisto](https://openfoodfacts.github.io/openfoodfacts-server/api/aws-images-dataset/)
on tuotteiden kuvia/OCR:ää, ei sellaisenaan varmennettu materiaaliluokittimen
opetusaineisto. [OFF-lisenssiohje](https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/tutorials/license-be-on-the-legal-side/)
erottaa tietokannan ODbL:n ja kuvien CC BY-SA:n sekä muut mahdolliset kuvaoikeudet.
[TACO](https://github.com/pedropro/TACO) on ulkoilmaroskien kuva-/segmentointiaineisto;
sen luokkajakauma, kuvat ja merkinnät eivät suoraan vastaa Suomessa kädessä
olevia kaupan pakkauksia. Työkalun lisenssi ei yksin ratkaise kaikkien kuvien oikeuksia.
Käyttäjien nykyisiä kuvia ei tallenneta; niitä ei voi ottaa opetusaineistoksi
ilman erillistä tarkoitusta, valintaa, suostumusta ja säilytysmenettelyä.

## Työmäärä — tekninen arvio, ei lupaus

Oletukset: rajattu esinetyyppitehtävä, käyttökelpoinen lisensoitu pohjamalli,
pieni laadukas aineisto saatavissa, nykyinen laitteisto ja iteratiivinen
agenttiavusteinen työ. Ajat eivät ole mitattuja malliajoja tai yhtä agenttivuoroa.

| Vaihe | Karkea suuruusluokka |
| --- | --- |
| Macissa ajettava rajattu vertailukoe | 2–5 työpäivää, jos aineisto ja pohja ovat valmiina |
| Ensimmäinen käyttökelpoinen rajattu iPhone-pilotti | 2–4 viikkoa, sisältää aineisto-/native-/virhepolkutyötä |
| Android+iOS, laajempi aineisto ja riippumattomat kenttätestit | 1–3 kuukautta tai enemmän |
| Laaja perusmalli alusta tai “kaikki tuotteet + oikea materiaali” | Ei uskottavaa nollabudjetin valmistumislupausta; eri mittakaavan tutkimustyö |

Aineiston puutteet, merkintöjen tarkistus ja fyysiset kokeet voivat hallita
kalenteria, vaikka koulutusskripti syntyisi nopeasti. Suunnittelu/koodaus/
automaattitestit ovat vahvasti automatisoitavissa; aineiston oikeellisuudelle,
käyttöoikeuksille ja reaalimaailman hyväksynnälle tarvitaan riippumatonta näyttöä.
Sol ei saa jälkikäteen helpottaa hyväksyntää vain saadakseen vihreän tuloksen.

## Suositeltu seuraava askel (ei vielä toteutettu)

Kirjoita rajatun offline-vertailukokeen luokka-/lisenssi-/aineisto-/mittarimääritys
ennen koulutusta tai nykyiseen sovellukseen koskemista. Valitse vasta sen jälkeen
pieni siirrettävä pohja tai iOS-koe ja tarkista aineiston toteutettavuus.
Koulutuksen ensimmäinen tulos voi olla myös NO-GO. Nykyinen tunnistus/säännöt
säilyvät, eikä maksullista varapolkua lisätä salaa.

Kaikki yllä linkitetyt ulkoiset lähteet haettu/luettu3.11.2026. Applen artikkelit
luettu myös virallisista `.md`-vastineista JavaScript-sivun sijaan.
