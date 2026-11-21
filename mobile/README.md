# 1. Mobile — puhelinsovellus

Tämä osa vastaa siitä, mitä käyttäjä näkee ja tekee. Sovellus on `app/`,
FI/EN-käännökset `localization/`. Kamera, sijainti, saavutettavuus, navigointi,
paikallinen historia/luonnokset ja ulkoisten vastausten turvallinen esitys ovat
tämän osan vastuulla. Sovelluksen nimi/tekniset tunnisteet säilyvät ennallaan.

Root-kansiosta:

```sh
pnpm dev:mobile
pnpm validate:mobile
```

Tarkistus käsittelee mobilea ja sen ilmoitettuja shared-riippuvuuksia. Se ei
rakenna tai testaa backendin toteutusta. Web-vienti ja puretut UI-tilatestit eivät
korvaa iPhonen/Androidin fyysisiä kamera-, sijainti- tai saavutettavuuskokeita.

Mobile saa käyttää oman osansa paketteja ja shared-pakettien julkisia exportteja.
Tuotehaun palvelimeen otetaan yhteys `POST /v1/recycling/lookup` -rajapinnalla;
palvelimen koodia, tietokantaa, tunnuksia tai provider-vastausmuotoja ei tuoda
sovellukseen. HTTP-sopimus on `shared/contracts`, ei `backend/application`.
`EXPO_PUBLIC_*`-muuttujat ovat julkisia: niihin ei laiteta salaisuuksia.

Esimerkiksi painikkeen ulkoasu tai käännös voidaan muuttaa täällä ilman backendin
tiedostojen muokkaamista. Shared-sopimuksen muutos on erillinen koordinoitu työ.
Koko integraatio: `pnpm validate`. Ohje: `../docs/architecture.md`.

## Materiaalikartasto · visuaaliset ratkaisut 19.11.2026

Tavoite: ihminen tunnistaa kädessään olevan esineen, löytää ohjeen ja erottaa
mallin arvauksen tarkistetusta lajitteluohjeesta. Tunnistettava ulkoasu syntyy
samojen materiaalikuvien toistumisesta oikeissa kohdissa, ei siitä, että jokainen
näkymä kilpailee huomiosta. Tämä on suunnitteluhypoteesi, ei mitattu käyttäjätulos.

| Kysymys | Ratkaisu tässä sovelluksessa |
| --- | --- |
| Mistä aloitan? | Haku ja kuvitettu tunnistuspainike ovat ensimmäisinä. Viivakoodin luku erottuu valokuvasta omalla viivastollaan. |
| Löydänkö oikean materiaalin? | Neljä omaa piirrosta: pullo, harjakattoinen kartonki, lasipurkki ja uurrettu tölkki. Sama siluetti toistuu etusivulla, oppaassa ja tunnetun pakkausmateriaalin yhteydessä. Ne ovat materiaaliesimerkkejä, eivät virallisia astiatunnuksia tai tuotekuvia. |
| Entä epävarma tulos? | Tuntematon materiaali ei saa kartongin kuvaa. Kuvitus ei muuta ohjeen lähdettä, aluetta tai mallin varmuutta. Käyttäjän valinnan näkee myös valintamerkistä. |
| Mikä sivulla on tärkeää? | Alasivun otsikko on avoimella pohjalla; korostettu väripinta jää vastaukselle. Etusivun sijainti- ja opaskorteissa teksti saa oman rivinsä. |
| Miltä onnistuminen tuntuu? | Vain uuden tallennuksen teksti asettuu kevyesti (180 ms). Tulos näkyy heti, eikä aiemmin tallennetun merkinnän avaaminen toista palautetta. Ei ääntä, jatkuvaa liikettä tai tunnistuksen onnistumista jäljittelevää konfettia. |
| Kestääkö toteutus käytön? | Sama vaalea ilme ja staattinen kuvitus molemmille kielille; nimet ovat skaalautuvaa tekstiä. Ei uusia fonttilatauksia, natiivikirjastoja tai verkkopyyntöjä kuville. |

### Miksi nämä työkalut?

- [KIVOn suomalainen kuvaketutkimus](https://www.kivo.fi/uutiset/yli-tuhannen-roskiksen-aaresta-arvio-jatekuvakkeiden-sopivuudesta-suomessa-kaytantoon)
  puoltaa paikallisten mielleyhtymien testaamista. Se ei validoi omia kuviamme.
  [W3C: värin käyttö](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html):
  siksi muoto, nimi ja valintamerkki kantavat viestin myös ilman väriä.
- [Apple: palaute](https://developer.apple.com/design/human-interface-guidelines/feedback)
  ja [W3C: vuorovaikutuksen liike](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html):
  liike sidotaan käyttäjän suorittamaan tekoon, ja tekstipalaute toimii myös ilman sitä.
- Muokattavat SVG-originaalit ja pienet, paikalliset PNG:t kulkevat Gitissä.
  Figma olisi hyödyllinen rinnakkaisten luonnosten kommentointiin; tässä
  toteutuksessa tärkeämpi on kokeilla oikeita suomenkielisiä tekstejä ja todellisia
  tiloja. Rive/Skia ei tuo näihin neljään staattiseen kuvaan lisäarvoa.
  [Expo Gon natiivirajaus](https://docs.expo.dev/develop/development-builds/introduction/)
  ja [React Nativen suorituskykyohje](https://reactnative.dev/docs/performance)
  puoltavat yksinkertaista toteutusta; nopeutta ei ole päätelty kuvakaappauksista.
- [Playwrightin kuvavertailu](https://playwright.dev/docs/test-snapshots) sopii
  toistettaviin kokotarkistuksiin samassa selaimessa. Seuraava laadullinen koe:
  anna ensikäyttäjälle metallilusikka ja tuntematon pakkaus ilman käyttöohjetta.
  Tarkkaile löytääkö hän ohjeen ja erottaako hän ehdotuksen vahvistetusta tiedosta.
