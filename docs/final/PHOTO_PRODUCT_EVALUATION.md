# Oikeiden tuotekuvien tunnistustesti

Päivä: 2026-10-15, noin 18.19–18.23 Europe/Helsinki.
Sovellusversio testissä: lähdekoodin `6b190f7` muuttumaton kuvatunnistuspolku.

## Johtopäätös

**Neljä kahdeksasta vastauksesta mainitsi tuotteen tai merkin nimen.** Muut
jättivät nimen pois, vaikka se näkyi kuvassa. Seitsemässä suomenkielinen
tuotetyyppi oli asianmukainen; Quakerin nimike jäi epätarkaksi ja FI/EN-nimikkeet
erosivat. Tämä ei ole edustava tarkkuusprosentti: jokaisesta kahdeksasta
valitusta etukuvasta tehtiin vain yksi pyyntö.

**Pakkausmateriaalia ei pidä hyväksyä pelkän tekoälyarvion perusteella.**
Nutellan nimi tunnistui, mutta purkki arvioitiin muoviksi. Kyseisen eurooppalaisen
400 g tuotteen Open Food Facts -viite kertoo lasista; myös valmistajan
[pakkauskuvaus](https://www.nutella.com/int/en/inside-nutella/recycle-the-jar)
erottelee lasipurkin ja muovikannen. Tämä ei tarkoita, että kaikki maailman
Nutella-pakkausversiot olisivat samaa materiaalia. Valmistajan ulkomaisia
lajitteluohjeita ei tuotu Suomen sääntöihin.

## Kuvakohtaiset tulokset

Alla ovat palvelun oikeasti palauttamat FI-nimikkeet, eivät odotetut vastaukset
tai testimokit. Kaikki vastaukset olivat `estimated`, havainnon tila `clear`,
varmuus `medium`, lähteen varmennus `inferred` ja riskiluokka
`ordinary_packaging`. Nämä mallin omat luokitukset eivät todista oikeellisuutta.

| Kuvan tunnettu tuote | Palautettu FI-nimike | Nimi/tuoteperhe vastauksessa | Materiaalihavainnot, eivät varmennettuja faktoja |
| --- | --- | --- | --- |
| Nutella 400 g | Nutella-hasselpähkinälevite | Kyllä | Purkki muovia, kansi muovia, etiketti paperia. **Purkin materiaali ristiriidassa viitteen kanssa** |
| Coca-Cola Original, tölkki | Coca-Cola tölkki | Kyllä; Original-versiota ei yksilöity | Tölkki metallia |
| Barilla Spaghetti No. 5 | spagetti | Ei Barillaa tai No. 5:tä | Pakkaus kartonkia |
| LU Prince -suklaakeksit | Prince suklaakeksipaketti | Kyllä | Muovikelmu ja kartonkipakkaus; sisäosien täydellisyyttä ei varmennettu |
| Nutella Biscuits | nutella keksit | Kyllä | Pussi muovia |
| Heinz-tomaattiketsuppi | ketsuppipullo | Ei Heinziä | Pullo ja korkki muovia, etiketti paperia |
| Badoit-kivennäisvesi | kivennäisvesipullo | Ei Badoit'ta | Pullo ja korkki muovia, etiketti paperia |
| Quaker Cruesli, pähkinägranola | aamiaispuuropakkauksen pahvilaatikko | Ei Quakeria tai Crueslia | Laatikko kartonkia; sisältö tunnistettiin erikseen ei-pakkaukseksi. FI-nimike puurosta on epätarkka; EN oli yleinen “breakfast cereal cardboard box” |

Tuoteperheen maininta ei ole oikean GTIN:n, koon, reseptin tai tuoteversion
varmistus. Seitsemän muun kuvan materiaalikoostumusta, kalvoja, pinnoitteita tai
kaikkia sisäosia ei tarkastettu fyysisesti; niille ei lasketa materiaalitarkkuutta.
Quakerin aineistossa ei ollut pakkausmateriaalitietoa.

## Menetelmä ja rajat

- Roope hyväksyi nykyisen avaimen käytön enintään kahdeksaan maksulliseen pyyntöön.
  Käytettiin jo käynnissä olevaa kehityspalvelinta ja samaa palvelinavainta;
  avainta ei luettu tulosteeseen, kopioitu tai vaihdettu. Ei maksu-/tilimuutoksia.
- Kahdeksan oikeaa julkista, 400-pikseliversion tuote-etukuvaa valittiin ja
  katsottiin ennen tunnistusta. Ei piirrettyjä tuotteita, henkilötietoja tai
  käyttäjän puhelinkuvia. Kuvia ei muokattu tätä testiä varten.
- Ennakkoon kirjattu kuvajoukko, odotetut nimet ja karkea avainsanarubriikki:
  `scripts/qa/photo-product-cases.json`. Lähdeaineisto on yhteisötietoa; näkyvä
  tuoteteksti tarkastettiin, mutta materiaali ei muutu varmennetuksi sen perusteella.
- Jokainen kuva lähetettiin kerran sovelluksen `POST /v1/recycling/photo`
  -reitille versionoidulla hyväksynnällä. Mallille päätyy sovittimen kautta
  vain kuva ja olemassa oleva yleinen ohje; odotettu nimi, lähteen GTIN,
  tiedostonimi, kuvan URL tai vertailuvastaus eivät sisälly tunnistuspyyntöön.
- Sama `gpt-4.1-mini-2025-04-14`, sama kehotus, korkea kuvadetalji, 1 200
  vastaustokenin raja, `store:false` sekä olemassa olevat validointi-, metatiedon
  poisto- ja palvelukiintiöt. Ei toista mallia, hienosäätöä, kehotuksen muutosta,
  uudelleenyrityksiä, parhaiden vastausten valikointia tai palvelimen kiintiön
  nollausta. Pyyntöjen välissä vähintään 25 sekuntia; yhteensä tasan 8 yritystä.
- Kahdeksan HTTP 200 / sopimuskelpoista arviota kertoo vain pyynnön ja
  vastauksen onnistumisesta. Automaattinen yleinen tyyppiavainsana osui 8/8,
  mutta käsin tehty FI/EN-tarkastus havaitsi Quakerin epätarkan nimikkeen.
  Siksi avainsanaosumaa ei raportoida semanttisen tunnistuksen hyväksyntänä.
- Pyynnön vastausaika oli 1,380–3,380 s, mediaani 2,106 s. Tahalliset välit
  eivät sisälly näihin aikoihin. Tämä ei ole SLA, kuormitus-, kamera- tai
  puhelimen suorituskykytesti. Tarkkaa euromääräistä laskua ei tarkastettu.
- Valittuja, selkeitä etukuvia ei pidä yleistää heijastuksiin, huonoon valoon,
  vinouteen, epäselviin tai usean esineen kuviin, lääkkeisiin/akkuihin,
  ei-elintarvikkeisiin tai oikean käyttäjän skannaustarkkuuteen.
- Mallin nimeä tai materiaalia ei muuteta varmennetuksi tuotetietokantatiedoksi.
  Lajitteluohje tarvitsee edelleen käyttäjän todellisen osakohtaisen
  tarkistuksen ja versionoidun Suomen säännön. Testi ei hyväksy tuotantojulkaisua.

Arvioinnin ennakkokriteerit ja eri mittareiden erottaminen pohjautuvat
[viralliseen OpenAI-arviointiohjeeseen](https://developers.openai.com/api/docs/guides/evaluation-best-practices).
Ei erillistä maksullista arvioijamallia tai Evals-palveluun julkaisemista.

## Lähteet, attribuutio ja toistettavuus

Kuvat: Open Food Facts ja alla mainitut lataajat,
[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/), ei muutoksia.
Lisenssiperusta: [Open Food Factsin ohje](https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/tutorials/license-be-on-the-legal-side/).
Kahdeksan kuvan peräkkäinen haku noudatti
[pienen kuvajoukon latausohjetta](https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/how-to-download-images/).
Kuvat ovat vain erillistä paikallista QA-aineistoa, eivät sovelluksen esimerkkidataa
tai Gitissä jaettavia uusia kuvaresursseja. Logot ja muut erilliset oikeudet eivät
muutu omiksemme. Tämä ei korvaa tulevan julkisen OFF-uudelleenkäytön tarkastusta.
Kaikki lähteet avattu 2026-10-15.

| Kuvan tunniste | Kuvalähde / lataaja | Alkuperäiset tavut | SHA-256 |
| --- | --- | --- | --- |
| nutella | [OFF 3017620422003](https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.879.400.jpg), org-ferrero-france-commerciale | 33108 | `56d48570eeac647c4eef1bf4497c926df7e9984a729b58ae01f7ed04cc47f28e` |
| coca-cola | [OFF 5449000000996](https://images.openfoodfacts.org/images/products/544/900/000/0996/front_en.1129.400.jpg), zeynepozturk11 | 11732 | `ac29a4e84a2373f638e5dc623d4d24fe2dc717a68aae4b53e8cba5c6a0d029b0` |
| barilla | [OFF 8076800195057](https://images.openfoodfacts.org/images/products/807/680/019/5057/front_en.3881.400.jpg), knuffelcookie | 11468 | `92f7102fceecbe14b840e1cd4e70fcad7cc48107346aad2180383980552873ff` |
| prince | [OFF 7622210449283](https://images.openfoodfacts.org/images/products/762/221/044/9283/front_en.605.400.jpg), thaialagata | 29961 | `27bc772faef3a1b1ae6341393ccdea2c459abd94b76d428cbf4687f8888991ce` |
| nutella-biscuits | [OFF 8000500310427](https://images.openfoodfacts.org/images/products/800/050/031/0427/front_fr.586.400.jpg), org-ferrero-france-commerciale | 37045 | `129ccffa2f027f447f7a1ce6dcbc19a88c1606a427aa59cd271de0ada519f929` |
| heinz | [OFF 8715700110622](https://images.openfoodfacts.org/images/products/871/570/011/0622/front_fr.34.400.jpg), moon-rabbit | 15818 | `6f29967b2a243aebc5134705edaddea3cd6ddb41df344e3987fdd69da58a3293` |
| badoit | [OFF 3068320114453](https://images.openfoodfacts.org/images/products/306/832/011/4453/front_de.106.400.jpg), dalix | 8445 | `77e955757628796367c6fb30e878c484154a352005a4c5952765aabac4cb482b` |
| quaker | [OFF 3168930010883](https://images.openfoodfacts.org/images/products/316/893/001/0883/front_fr.4.400.jpg), kiliweb | 29311 | `88cb731a5f974c3685d3bb401ed330088bf10d6a5209e305f494414182faf867` |

Syötteet, yritysmerkinnät ja sovelluksen vastaukset ovat vain ohitetussa
`work/photo-products-2026-10-15.KstrPe/`-hakemistossa. Sovelluksen nykyistä
käyttäjäkuvien/historian lokitusta tai säilytystä ei muutettu.

Testiajo:

```sh
node scripts/qa/photo-product-eval.cjs prepare work/photo-products-2026-10-15.KstrPe
node scripts/qa/photo-product-eval.cjs run work/photo-products-2026-10-15.KstrPe --live
```

**Älä aja uudelleen ilman uutta rajattua maksullisten pyyntöjen hyväksyntää.**
Työkalu hyväksyy vain oman `work/photo-products-2026-10-15.*`-testihakemiston,
kiinnitetyt julkiset lähteet, kuvan tarkistussumman ja eksplisiittisen `--live`-lipun.
Aloitusmerkintä luodaan `wx`-tilassa: osittaista tai valmista ajoa ei automaattisesti
jatketa tai uusita. API-virhe keskeyttää ajon ilman uusintaa. Tavallinen CI ei tee
maksullisia kutsuja.

Sovellussovittimen muuttumaton SHA-256 testissä:
`efbf56f5106e11b7899702bc965181b51324a4cdcf85a9f702ecaa6277aeef46`.
Malli, kehote, palvelureitti, säännöt ja mobiilin toiminta jätettiin ennalleen.
Seitsemän uutta maksutonta testityökalun regressiota läpäistiin. Koko
`pnpm validate`: **351 testiä (69 policy + 282 application)** sekä kaikki
muotoilu-, lint-, tyyppi-, koodiraja- ja build-tarkistukset, 14 web-reittiä.
Vihreät ohjelmistotestit eivät poista yllä havaittuja tunnistusvirheitä.

Testin jälkeen toteutettu paikallinen parannus: materiaalin erillinen valinta,
ehtojen vahvistus ja “en tiedä” -palautuminen ennen lajitteluohjetta. Tallennettu
muovipurkkiarvio voidaan nyt korjata lasiksi muuttamatta alkuperäistä arviota;
354 ohjelmistotestiä ja erilliset selainkokeet läpäisty (TEST_EVIDENCE.md).
Tämä ei muuta yllä olevan tunnistustestin tuloksia eikä korjaa mallin
materiaalitarkkuutta. Uuden mallin tai kehotteen kokeilu tarvitsee
myöhemmin oman ennalta sovitun vertailun ja uudet hyväksytyt palvelupyynnöt.
