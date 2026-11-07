// Actual web UI, explicit unsupported-native path. No fake inference, camera image,
// user location, live product request or paid recognition call.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
if (!process.env.PLAYWRIGHT_MODULE_PATH || !process.env.BROWSER_EXECUTABLE_PATH)
  throw new Error("Set installed Playwright and browser paths.");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH);
const base = process.env.APP_QA_URL ?? "http://127.0.0.1:8095";
const evidence = path.resolve(
  process.env.APP_QA_EVIDENCE_DIR ?? "work/local-vision-browser-2026-11-03",
);
fs.mkdirSync(evidence, { recursive: true });

async function inspect(page, name) {
  await page.evaluate(() => document.fonts.ready);
  const issues = await page.evaluate(() => {
    const result = [];
    if (document.documentElement.scrollWidth > innerWidth) result.push("Page overflow");
    for (const el of document.querySelectorAll('[role="button"], [role="link"], input')) {
      if (el.closest('[aria-hidden="true"]')) continue;
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height) continue;
      if (b.width < 44 || b.height < 44)
        result.push(`Small control: ${el.getAttribute("aria-label")}`);
      if (b.left < -1 || b.right > innerWidth + 1)
        result.push(`Overflow: ${el.getAttribute("aria-label")}`);
    }
    return result;
  });
  await page.screenshot({ path: path.join(evidence, `${name}.png`), fullPage: true });
  assert.deepEqual(issues, [], name);
}

async function scaleText(page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("div, span, input")) {
      if (
        ![...el.childNodes].some(
          (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
        )
      )
        continue;
      const style = getComputedStyle(el);
      el.style.fontSize = `${Number.parseFloat(style.fontSize) * 1.3}px`;
      if (style.lineHeight !== "normal")
        el.style.lineHeight = `${Number.parseFloat(style.lineHeight) * 1.3}px`;
    }
  });
}

async function main() {
  const browser = await chromium.launch({
    executablePath: process.env.BROWSER_EXECUTABLE_PATH,
    headless: true,
  });
  try {
    for (const language of ["fi", "en"]) {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        reducedMotion: "reduce",
      });
      const requests = [];
      const errors = [];
      await context.addInitScript((language) => {
        localStorage.setItem("@kierratysappi/language/v1", language);
        localStorage.setItem("@kierratysappi/history-enabled/v1", "false");
        window.qaCameraCalls = 0;
        window.qaGpsCalls = 0;
        if (navigator.mediaDevices) {
          navigator.mediaDevices.getUserMedia = () => {
            window.qaCameraCalls++;
            return Promise.reject(new Error("Unexpected camera request"));
          };
        }
        navigator.geolocation.getCurrentPosition = () => {
          window.qaGpsCalls++;
          throw new Error("Unexpected GPS request");
        };
        navigator.geolocation.watchPosition = () => {
          window.qaGpsCalls++;
          throw new Error("Unexpected GPS request");
        };
      }, language);
      await context.route("**/v1/**", (route) => {
        requests.push(new URL(route.request().url()).pathname);
        return route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ status: "unavailable" }),
        });
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(base);
      await page.getByTestId("home-screen").waitFor();
      await page.getByTestId(`language-${language}`).click();
      await page.getByTestId("home-identify-action").click();
      await page.getByTestId("identify-screen").waitFor();
      await page.getByTestId("identify-photo-action").focus();
      await page.getByTestId("identify-photo-action").press("Enter");
      await page.getByTestId("local-photo-screen").waitFor();
      assert.equal(new URL(page.url()).pathname, "/local-photo");
      assert.equal(await page.getByTestId("bottom-navigation").count(), 0);
      await page
        .getByRole("heading", {
          name: language === "fi" ? "Tunnista kuva laitteessa" : "Recognize an image on device",
          exact: true,
        })
        .waitFor();
      await page.getByTestId("local-photo-unavailable").waitFor();
      await page.getByTestId("local-photo-capture-guidance").waitFor();
      assert.equal(
        await page.getByTestId("local-photo-capture-guidance").innerText(),
        language === "fi"
          ? "Kuvaa yksi pakkaus kerrallaan. Materiaalikoodia varten ota lähikuva koko numero–kirjainparista, esimerkiksi 05 PP. Pidä teksti suorassa ja vältä heijastuksia."
          : "Photograph one package at a time. For a material code, take a close-up of the full number–letter pair, such as 05 PP. Keep the text straight and avoid reflections.",
        "The current localized capture instructions must render; stale bundles cannot pass",
      );
      for (const text of language === "fi"
        ? [
            "Tuetussa iPhonessa kuva käsitellään laitteessa. Voit etsiä pakkauksen materiaalikoodia ja arviota esineen tyypistä.",
            "Tunnistus on rajattu ja voi jäädä epäselväksi. Kuva ei varmista tuotteen nimeä, materiaalia tai vaarattomuutta. Tarkista pakkauksen osat erikseen.",
            "Erillinen OpenAI-polku käyttää maksullista rajapintaa. Sitä ei käytetä paikallisen tunnistuksen varapalveluna.",
          ]
        : [
            "On a supported iPhone, the image is processed on device. Look for a packaging material code and an estimate of the object type.",
            "Recognition is limited and may be inconclusive. An image does not verify the product name, material or safety. Check each packaging part separately.",
            "The separate OpenAI flow uses a paid API. It is not used as a fallback for local recognition.",
          ]) {
        assert.equal(
          await page.getByText(text, { exact: true }).count(),
          1,
          `${language} must render the final supported-device, limitation and paid-cloud disclosures; stale bundles cannot pass`,
        );
      }
      assert.equal(await page.getByTestId("local-photo-open-camera").count(), 0);
      assert.equal(await page.getByTestId("local-photo-recognize").count(), 0);
      assert.equal(await page.getByTestId("local-photo-object").count(), 0);
      assert.equal(await page.getByTestId("local-photo-retake").count(), 0);
      assert.equal(await page.getByTestId("local-photo-reset").count(), 0);
      await page.getByTestId("local-photo-cloud-action").filter({ hasText: "OpenAI" }).waitFor();
      const assertPassive = async () => {
        assert.deepEqual(requests, [], "Local entry/recovery must not request an API");
        assert.equal(await page.evaluate(() => window.qaCameraCalls), 0);
        assert.equal(await page.evaluate(() => window.qaGpsCalls), 0);
      };
      await assertPassive();
      // Unavailable or inconclusive local recognition has a useful barcode
      // recovery. Opening its permission explanation is not permission/capture.
      const barcodeRecovery = page.getByTestId("local-photo-barcode-action");
      await barcodeRecovery.focus();
      assert.notEqual(
        await barcodeRecovery.evaluate((el) => getComputedStyle(el).boxShadow),
        "none",
        "Barcode recovery keeps a visible keyboard-focus ring",
      );
      await barcodeRecovery.press("Enter");
      await page.getByTestId("scanner-permission-screen").waitFor();
      assert.equal(new URL(page.url()).pathname, "/scan");
      assert.equal(await page.getByTestId("scanner-camera").count(), 0);
      await assertPassive();
      await page.getByTestId("scanner-close-action").click();
      await page.getByTestId("local-photo-screen").waitFor();
      await page.getByTestId("local-photo-capture-guidance").waitFor();
      await page.getByTestId("local-photo-marking-action").focus();
      assert.notEqual(
        await page
          .getByTestId("local-photo-marking-action")
          .evaluate((el) => getComputedStyle(el).boxShadow),
        "none",
        "Manual recovery keeps a visible keyboard-focus ring",
      );
      await page.getByTestId("local-photo-marking-action").press("Enter");
      await page
        .getByRole("heading", {
          name: language === "fi" ? "Pakkauksen materiaalikoodi" : "Package material code",
          exact: true,
        })
        .waitFor();
      assert.equal(await page.locator('[data-testid^="sorting-result-"]').count(), 0);
      await page
        .getByRole("button", { name: language === "fi" ? "Takaisin" : "Back", exact: true })
        .click();
      await page.getByTestId("local-photo-screen").waitFor();

      // An explicit, named cloud entry opens its consent screen, not the camera
      // or a capability/upload request. Do not press its camera/send controls.
      await page.getByTestId("local-photo-cloud-action").click();
      await page.getByTestId("photo-screen").waitFor();
      await page.getByTestId("photo-open-camera").waitFor();
      await assertPassive();
      await page
        .getByRole("button", { name: language === "fi" ? "Takaisin" : "Back", exact: true })
        .click();
      await page.getByTestId("local-photo-screen").waitFor();

      for (const scheme of ["light", "dark"]) {
        await page.emulateMedia({ colorScheme: scheme });
        await page.waitForFunction(
          (dark) =>
            getComputedStyle(document.querySelector('[data-testid="local-photo-screen"]'))
              .backgroundColor === (dark ? "rgb(20, 34, 27)" : "rgb(245, 252, 250)"),
          scheme === "dark",
        );
        for (const width of [320, 390, 1280]) {
          await page.setViewportSize({ width, height: 844 });
          await inspect(page, `${language}-${scheme}-${width}`);
        }
        await page.setViewportSize({ width: 320, height: 844 });
        await scaleText(page);
        await inspect(page, `${language}-${scheme}-320-large`);
        // Reload resets synthetic font modifications without pretending native Dynamic Type.
        await page.reload();
        await page.getByTestId("local-photo-screen").waitFor();
      }
      await assertPassive();
      // This is a public-code navigation fixture, not OCR/inference evidence.
      // A suggested code only prefills: checking and comparison remain explicit.
      await page.goto(`${base}/material-code?code=05%20PP`);
      const codeField = page.getByRole("textbox", {
        name: language === "fi" ? "Pakkauksessa näkyvä koodi" : "Code visible on the package",
        exact: true,
      });
      await codeField.waitFor();
      assert.equal(await codeField.inputValue(), "05 PP");
      const confirm = page.getByRole("button", {
        name:
          language === "fi" ? "Näen tämän koodin pakkauksessa" : "I see this code on the package",
        exact: true,
      });
      assert.equal(await confirm.count(), 0);
      assert.equal(await page.locator('[data-testid^="sorting-result-"]').count(), 0);
      await page
        .getByRole("button", {
          name: language === "fi" ? "Tarkista koodi" : "Check code",
          exact: true,
        })
        .click();
      await confirm.waitFor();
      assert.equal(await page.locator('[data-testid^="sorting-result-"]').count(), 0);
      await confirm.click();
      await page.locator('[data-testid^="sorting-result-"]').waitFor();
      await page.goto(`${base}/material-code?code=05%20PP&code=01%20PET`);
      await codeField.waitFor();
      assert.equal(await codeField.inputValue(), "");
      assert.equal(await confirm.count(), 0);
      assert.equal(await page.locator('[data-testid^="sorting-result-"]').count(), 0);
      await assertPassive();
      await page.goto(`${base}/legal`);
      await page
        .getByRole("heading", {
          name: language === "fi" ? "Tunnista kuva laitteessa" : "Recognize an image on device",
          exact: true,
        })
        .waitFor();
      await page
        .getByRole("heading", {
          name:
            language === "fi"
              ? "Erillinen OpenAI-kuvatunnistus"
              : "Separate OpenAI image recognition",
          exact: true,
        })
        .waitFor();
      const localPrivacy =
        language === "fi"
          ? "Paikallinen tunnistus ei lähetä kuvaa tai kuvasta luettua tekstiä palvelimelle. Kuvaa ja tulosta ei lisätä historiaan. Näkymästä poistuminen tai sovelluksen siirtäminen taustalle tyhjentää tämän näkymän kuvan ja tuloksen."
          : "Local recognition does not send the image or recognized text to a server. The image and result are not added to history. Leaving this screen or putting the app in the background clears this screen's image and result.";
      assert.equal(await page.getByText(localPrivacy, { exact: true }).count(), 1);
      const modelAttribution = page.getByText(
        language === "fi"
          ? "Täydentävä esinetyyppiarvio käyttää Applen MobileCLIP-S0-mallia (2024). Malli ja lisenssihuomautukset sisältyvät sitä tukevaan iPhone-asennukseen. Tämä ei tarkoita Applen hyväksyntää sovellukselle. Tulos ei varmista materiaalia tai tuotetta."
          : "The supplemental object-type estimate uses Apple's MobileCLIP-S0 model (2024). The model and licence notices are included in supporting iPhone installations. This does not imply Apple's endorsement of the app. The estimate does not verify material or product identity.",
        { exact: true },
      );
      assert.equal(await modelAttribution.count(), 1);
      await modelAttribution.scrollIntoViewIfNeeded();
      await inspect(page, `${language}-privacy-model-attribution`);
      const cloudPrivacy = page.getByText(
        language === "fi"
          ? /^Kuva lähetetään vain hyväksynnälläsi tämän sovelluksen palvelimen kautta OpenAI:lle\./u
          : /^Only after your approval, the image is sent through this app's server to OpenAI\./u,
      );
      assert.equal(await cloudPrivacy.count(), 1);
      assert.match(await cloudPrivacy.innerText(), /30/u);
      await inspect(page, `${language}-privacy-local-and-cloud`);
      await assertPassive();
      assert.deepEqual(errors, []);
      await context.close();
    }
    console.log(
      "PASS: actual FI/EN web final supported-iPhone/limited-recognition/paid-cloud copy and capture guidance, explicit unsupported-native state (no fake estimate/retake), zero implicit API/camera/GPS, keyboard barcode permission-explanation/back and manual-marking recovery, separate named cloud consent entry/back without capture/send, 44pt controls, dark/light 320/390/1280 and 130% synthetic text; public-code prefill requires explicit check and confirmation, duplicate route values are rejected; Privacy distinctly describes local no-upload/clearing, conditional MobileCLIP-S0/2024 attribution with no endorsement/material-certainty claim, and separately consented OpenAI retention. Native capture/retake, image inference and accuracy remain unverified.",
    );
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
