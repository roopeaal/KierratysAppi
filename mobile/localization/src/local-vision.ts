export const localVisionFi = {
  localVisionTitle: "Tunnista kuva laitteessa",
  localVisionIntro:
    "Tuetussa iPhonessa kuva käsitellään laitteessa. Voit etsiä pakkauksen materiaalikoodia ja arviota esineen tyypistä.",
  localVisionLimit:
    "Tunnistus on rajattu ja voi jäädä epäselväksi. Kuva ei varmista tuotteen nimeä, materiaalia tai vaarattomuutta. Tarkista pakkauksen osat erikseen.",
  localVisionPrivacy:
    "Paikallinen tunnistus ei lähetä kuvaa tai kuvasta luettua tekstiä palvelimelle. Kuvaa ja tulosta ei lisätä historiaan. Näkymästä poistuminen tai sovelluksen siirtäminen taustalle tyhjentää tämän näkymän kuvan ja tuloksen.",
  localVisionUnavailable:
    "Paikallinen tunnistus tarvitsee sitä tukevan iPhone-asennuksen. Tässä versiossa voit käyttää viivakoodia tai materiaalimerkintää.",
  localVisionCamera: "Avaa kamera",
  localVisionOpening: "Avataan kameraa…",
  localVisionCapture: "Ota kuva",
  localVisionCameraLabel: "Paikallisen tunnistuksen kamera",
  localVisionPreview: "Tarkista kuva",
  localVisionRecognize: "Tunnista tässä laitteessa",
  localVisionWorking: "Tutkitaan kuvaa laitteessa…",
  localVisionCancel: "Peruuta",
  localVisionAgain: "Uusi kuva",
  localVisionError: "Kuvaa ei voitu käsitellä. Ota uusi kuva tai tarkista merkintä käsin.",
  localVisionBusy: "Edellisen kuvan käsittely on vielä kesken. Odota hetki ja yritä uudelleen.",
  localVisionTimeout:
    "Kuvan käsittely kesti liian pitkään. Voit yrittää uudelleen käsittelyn päätyttyä.",
  localVisionReady: "Paikallisen tunnistuksen tulos valmis",
  localVisionEstimate: "Arvio kuvasta",
  localVisionUnknown: "Esineen tyyppi jäi epäselväksi",
  localVisionBottle: "Kuvassa saattaa olla pullo",
  localVisionJar: "Kuvassa saattaa olla purkki",
  localVisionBox: "Kuvassa saattaa olla laatikko tai kartonkipakkaus",
  localVisionBag: "Kuvassa saattaa olla pussi",
  localVisionCup: "Kuvassa saattaa olla kuppi",
  localVisionMarkings: "Kuvasta luetut koodiehdotukset",
  localVisionMarkingHint:
    "Avaa ehdotus ja vertaa sitä pakkaukseen. Pelkkä tekstintunnistus ei varmista merkintää.",
  localVisionNoMarkings:
    "Yksiselitteistä materiaalikoodia ei löytynyt. Katso merkintä pakkauksesta tai tunnista osa käsin.",
  localVisionConflicting:
    "Kuvassa on useita tai ristiriitaisia merkintöjä. Tarkista yksi pakkauksen osa kerrallaan.",
  localVisionSource: "Arvion lähde: Apple Vision · laitteessa · ei varmennettu tuotetieto",
  localVisionSourceDetail: "Malliversio ja havainnon aika",
  localVisionCloud: "Erillinen OpenAI-kuvatunnistus",
  localVisionCloudHint: "Avaa verkkotunnistuksen tietojen lähetyksen hyväksyntä",
  localVisionCloudCost:
    "Erillinen OpenAI-polku käyttää maksullista rajapintaa. Sitä ei käytetä paikallisen tunnistuksen varapalveluna.",
};

export const localVisionEn: { readonly [Key in keyof typeof localVisionFi]: string } = {
  localVisionTitle: "Recognize an image on device",
  localVisionIntro:
    "On a supported iPhone, the image is processed on device. Look for a packaging material code and an estimate of the object type.",
  localVisionLimit:
    "Recognition is limited and may be inconclusive. An image does not verify the product name, material or safety. Check each packaging part separately.",
  localVisionPrivacy:
    "Local recognition does not send the image or recognized text to a server. The image and result are not added to history. Leaving this screen or putting the app in the background clears this screen's image and result.",
  localVisionUnavailable:
    "Local recognition needs an iPhone installation that supports it. In this version you can use a barcode or material marking.",
  localVisionCamera: "Open camera",
  localVisionOpening: "Opening camera…",
  localVisionCapture: "Take a picture",
  localVisionCameraLabel: "On-device recognition camera",
  localVisionPreview: "Review the image",
  localVisionRecognize: "Recognize on this device",
  localVisionWorking: "Processing the image on device…",
  localVisionCancel: "Cancel",
  localVisionAgain: "New picture",
  localVisionError:
    "The image could not be processed. Take a new picture or check the marking manually.",
  localVisionBusy: "The previous image is still being processed. Wait a moment and try again.",
  localVisionTimeout:
    "Processing took too long. You can retry when the previous operation finishes.",
  localVisionReady: "On-device recognition result ready",
  localVisionEstimate: "Image estimate",
  localVisionUnknown: "The object type is unclear",
  localVisionBottle: "The image may show a bottle",
  localVisionJar: "The image may show a jar",
  localVisionBox: "The image may show a box or carton",
  localVisionBag: "The image may show a bag",
  localVisionCup: "The image may show a cup",
  localVisionMarkings: "Code suggestions read from the image",
  localVisionMarkingHint:
    "Open a suggestion and compare it with the packaging. Text recognition alone does not verify a marking.",
  localVisionNoMarkings:
    "No unambiguous material code was found. Check the packaging marking or identify the part manually.",
  localVisionConflicting:
    "The image contains multiple or conflicting markings. Check one packaging part at a time.",
  localVisionSource: "Estimate source: Apple Vision · on device · not verified product data",
  localVisionSourceDetail: "Model revision and observation time",
  localVisionCloud: "Separate OpenAI image recognition",
  localVisionCloudHint: "Open the network recognition and image-sharing consent",
  localVisionCloudCost:
    "The separate OpenAI flow uses a paid API. It is not used as a fallback for local recognition.",
};
