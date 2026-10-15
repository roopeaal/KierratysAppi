export const photoFi = {
  photoUpdateRequired:
    "Kuvatunnistus tarvitsee puhelimeen uuden kehitysversion, jossa kameran käyttötarkoitus on päivitetty. Viivakoodin lukeminen toimii nykyisellä versiolla.",
  photoQuota:
    "Tekoälypalvelun käyttökiintiö tai saldo ei riitä. Käytä toistaiseksi viivakoodia tai materiaalin käsintunnistusta.",
  photoConfidenceLow: "Tunnistuksen varmuus: matala",
  photoConfidenceMedium: "Tunnistuksen varmuus: suuntaa antava",
  photoTitle: "Tunnista kuvasta",
  photoHome: "Arvio tuotteesta ja pakkauksen osista",
  photoIntro:
    "Kuvaa yksi tuote kerrallaan niin, että pakkaus ja sen merkinnät näkyvät. Kuvasta ei aina voi päätellä tarkkaa tuotetta tai materiaalia.",
  photoPrivacy:
    "Kuva lähetetään vain hyväksynnälläsi tämän sovelluksen palvelimen kautta OpenAI:lle. Emme tallenna kuvaa tai tunnistusta historiaan. OpenAI voi säilyttää tietoja väärinkäytösten valvontaan yleensä enintään 30 päivää ja poikkeustapauksissa pidempään. Älä kuvaa ihmisiä tai henkilötietoja.",
  photoPrivacyLink: "OpenAI:n tietojen käsittely",
  photoOpenCamera: "Ota tuotekuva",
  photoOpening: "Avataan kameraa…",
  photoCapture: "Ota kuva",
  photoCameraLabel: "Tuotekuvan kamera",
  photoReview: "Tarkista kuva ennen lähettämistä",
  photoSend: "Lähetä kuva OpenAI:lle",
  photoRetake: "Ota uusi kuva",
  photoSending: "Tunnistetaan kuvan sisältöä…",
  photoCancel: "Peruuta ja poista kuva",
  photoReady: "Tunnistusarvio valmis. Tarkista tiedot pakkauksesta.",
  photoEstimate: "Tekoälyn arvio — ei varmistettu tuote",
  photoEstimateBody:
    "Tarkka tuote ja pakkauksen tiedot eivät varmistu pelkästä kuvasta. Vahvista jokainen osa erikseen; myös näkymättömiä osia voi olla.",
  photoPart: "Kuvassa näkyvä pakkausosa",
  photoConfirmBody:
    "Tarkista, että osan materiaali ja muoto vastaavat pakkausta. Vahvista vain tyhjä, vaarattoman aineen pakkausosa. Painepakkaukset eivät kuulu tähän ohjeeseen. Pantti tarkistetaan erikseen.",
  photoConfirm: "Tiedot täsmäävät — näytä ohje",
  photoUncertain:
    "Tunnistus jäi epävarmaksi. Älä valitse keräystä kuvan perusteella. Tarkista merkinnät tai käytä paikallista jäteopasta.",
  photoSpecial:
    "Kuvassa saattaa olla erityiskäsittelyä vaativa esine. Tavallisen pakkauskeräyksen ohjetta ei anneta. Tarkista paikallisen jätehuollon ohje.",
  photoUnavailable:
    "Kuvatunnistus ei ole käytettävissä. Voit skannata viivakoodin tai tunnistaa materiaalin käsin.",
  photoRateLimited:
    "Kuvatunnistuksen käyttöraja tuli vastaan. Käytä viivakoodia tai materiaalin käsintunnistusta.",
  photoInvalid: "Kuvan käsittely ei onnistunut. Ota uusi kuva lähempää tuotetta.",
  photoNetwork:
    "Kuvatunnistus ei vastaa tai verkkoyhteys puuttuu. Kuvaa ei tallenneta myöhempää lähetystä varten.",
  photoSource: "Tunnistuksen lähde: OpenAI · tekoälypäätelmä, ei tuotetietokanta",
};

export const photoEn: Record<keyof typeof photoFi, string> = {
  photoUpdateRequired:
    "Photo identification needs a new development build with the updated camera purpose. Barcode scanning still works in the current build.",
  photoQuota:
    "The AI service has no remaining quota or credit. Use a barcode or manual material identification for now.",
  photoConfidenceLow: "Identification confidence: low",
  photoConfidenceMedium: "Identification confidence: indicative only",
  photoTitle: "Identify from a photo",
  photoHome: "An estimate of the product and packaging parts",
  photoIntro:
    "Photograph one item at a time, with the packaging and markings visible. A photo cannot always establish the exact product or material.",
  photoPrivacy:
    "Only after your approval, the image is sent through this app's server to OpenAI. We do not save the image or estimate to history. OpenAI may retain data for abuse monitoring, generally for up to 30 days and longer in exceptional cases. Do not photograph people or personal information.",
  photoPrivacyLink: "OpenAI data handling",
  photoOpenCamera: "Take a product photo",
  photoOpening: "Opening camera…",
  photoCapture: "Take photo",
  photoCameraLabel: "Product photo camera",
  photoReview: "Check the photo before sending",
  photoSend: "Send photo to OpenAI",
  photoRetake: "Take another photo",
  photoSending: "Identifying the image…",
  photoCancel: "Cancel and remove photo",
  photoReady: "Photo estimate ready. Check the packaging details.",
  photoEstimate: "AI estimate — not a verified product",
  photoEstimateBody:
    "A photo does not verify the exact product or packaging. Confirm each part separately; there may also be parts that are not visible.",
  photoPart: "Visible packaging part",
  photoConfirmBody:
    "Check that the material and shape match the packaging. Only confirm an empty packaging part that held a non-hazardous substance. This guidance is not for pressurized containers. Deposit status is checked separately.",
  photoConfirm: "Details match — show guidance",
  photoUncertain:
    "Identification is uncertain. Do not choose a collection stream from the image. Check the markings or your local waste guide.",
  photoSpecial:
    "The image may show an item requiring special handling. No ordinary packaging-collection advice is given. Check your local waste service's guidance.",
  photoUnavailable:
    "Photo identification is unavailable. Scan a barcode or identify the material manually.",
  photoRateLimited:
    "The photo-identification usage limit was reached. Use a barcode or manual material identification.",
  photoInvalid: "The image could not be processed. Take another photo closer to the product.",
  photoNetwork:
    "Photo identification is not responding or you are offline. The image is not saved for a later upload.",
  photoSource: "Identification source: OpenAI · AI inference, not a product database",
};
