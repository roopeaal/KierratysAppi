// Deterministic UI/transport fixtures, NOT model accuracy evidence. Uses the real app.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { expect as baseExpect, chromium } from "@playwright/test";
import { isContainedPath } from "../lib/contained-path.mjs";

const expect = baseExpect.configure({ timeout: 20000 });
const root = fs.realpathSync(process.cwd());
const run = path.resolve(process.argv[2] ?? "work/object-confirmation-browser");
assert(isContainedPath(path.join(root, "work"), run));
fs.mkdirSync(run, { recursive: true });
assert.equal(fs.realpathSync(run), run);
const base = process.env.WEB_AI_URL ?? "http://localhost:8098";
const fixture = path.join(
  root,
  "mobile/app/modules/local-vision/android/src/androidTest/assets/parity/commons-2-clean.jpg",
);
const browser = await chromium.launch({
  headless: true,
  channel: process.env.WEB_AI_CHANNEL ?? "chrome",
});
const evidence = { fixtureOnly: true, cases: [], errors: [] };
try {
  for (const language of ["fi", "en"]) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
      permissions: ["geolocation"],
      geolocation: { latitude: 60.24, longitude: 24.92, accuracy: 20 },
    });
    await context.addInitScript(
      (lang) => localStorage.setItem("@kierratysappi/language/v1", lang),
      language,
    );
    await context.addInitScript(() => {
      const geolocation = navigator.geolocation;
      const watch = geolocation.watchPosition.bind(geolocation);
      const position = geolocation.getCurrentPosition.bind(geolocation);
      window.qaWatched = 0;
      window.qaPromptPath = 0;
      geolocation.watchPosition = (...args) => {
        window.qaWatched++;
        return watch(...args);
      };
      geolocation.getCurrentPosition = (...args) => {
        window.qaPromptPath++;
        return position(...args);
      };
    });
    let presentation = "confirm",
      focus = "single",
      candidates = ["spoon", "fork", "knife", "cup"],
      requests = 0,
      offline = false;
    await context.route("**/v1/recycling/object-image", async (route) => {
      if (route.request().method() === "OPTIONS") {
        await route.fulfill({
          status: 204,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "POST,OPTIONS",
            "access-control-allow-headers": "content-type,accept",
          },
        });
        return;
      }
      requests++;
      assert.equal(
        route.request().headers().accept,
        "application/vnd.kierratysappi.object-suggestions.v2+json",
      );
      assert.equal(route.request().postDataJSON().consentVersion, "self-hosted-image-v1");
      if (offline) return route.abort("internetdisconnected");
      await route.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        json: {
          status: "observed",
          observation: {
            focus,
            presentation,
            candidates: focus === "single" ? candidates : [],
            source: {
              modelId: "siglip2-server-onnx-weight-int8-v1",
              revision: "75de2d55ec2d0b4efc50b3e9ad70dba96a7b2fa2",
              preprocessing: "siglip2-server-pillow13-rgb-bilinear224-v1",
              checkedOn: "2026-11-16",
              observedAt: "2026-11-18T12:00:00.000Z",
              verification: "unverified",
              confidence: "uncalibrated",
              scope: "object_form_only",
              execution: "server",
            },
          },
        },
      });
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => evidence.errors.push(error.message));
    async function recognize({ entry = false, error = false } = {}) {
      const before = requests;
      await page.goto(`${base}/${entry ? "identify" : "local-photo"}`);
      if (entry) await page.getByTestId("identify-photo-action").click();
      await page.getByTestId("web-image-input").setInputFiles(fixture);
      assert.equal(requests, before, "preview does not upload");
      await page.getByTestId("local-photo-recognize").click();
      assert.equal(requests, before, "opening consent does not upload");
      await page.getByTestId("network-photo-send").click();
      await expect(
        page.getByTestId(error ? "network-photo-error" : "object-candidate-title"),
      ).toBeVisible();
      assert.equal(requests, before + 1);
    }
    await recognize({ entry: true });
    await expect(page.getByTestId("object-candidate-title")).toHaveText(
      language === "fi" ? "Lusikka" : "Spoon",
    );
    await expect(page.getByTestId("object-confirm-yes")).toHaveText(
      language === "fi" ? "Kyllä, jatka" : "Yes, continue",
    );
    await expect(page.getByTestId("object-alternatives")).toHaveCount(0);
    await expect(page.getByTestId("object-sorting-flow")).toHaveCount(0);
    await page.screenshot({ path: path.join(run, `${language}-primary.png`), fullPage: true });
    await page.getByTestId("object-confirm-no").focus();
    await page.keyboard.press("Enter");
    assert.equal(requests, 1, "rejecting a suggestion does not upload or invoke a model again");
    await expect(page.getByTestId("object-alternatives")).toBeFocused();
    await expect(page.getByTestId("object-confirm-yes")).toHaveCount(0);
    await expect(page.getByTestId("object-choice-spoon")).toHaveCount(0);
    for (const kind of ["fork", "knife", "cup"])
      await expect(page.getByTestId(`object-choice-${kind}`)).toBeVisible();
    await expect(page.getByTestId("object-choice-none")).toBeVisible();
    await page.screenshot({ path: path.join(run, `${language}-alternatives.png`), fullPage: true });
    await page.getByTestId("object-choice-fork").click();
    await page.getByTestId("object-answer-material-metal").click();
    await expect(page.getByTestId("object-sorting-source").first()).toBeVisible();
    await page.getByTestId("recycle-mark-action").click();
    await page.getByTestId("recycle-confirm-action").click();
    await expect(
      page.getByText(language === "fi" ? /Tallennettu yhteenvetoon/ : /Saved to Overview/),
    ).toBeVisible();
    await page.screenshot({
      path: path.join(run, `${language}-guidance-saved.png`),
      fullPage: true,
    });
    await page.getByTestId("object-sorting-change").click();
    await expect(page.getByTestId("object-alternatives")).toBeFocused();
    await page.getByTestId("object-choice-none").click();
    await expect(page).toHaveURL(/\/guide$/u);
    evidence.cases.push(
      `${language}: single → keyboard No → next three → material/source → change → none/guide`,
    );
    await recognize();
    await expect(page.getByTestId("object-confirm-yes")).toBeVisible();
    await page.getByTestId("object-confirm-yes").click();
    await expect(page.getByTestId("object-answer-material-metal")).toBeVisible();
    await page.getByTestId("object-sorting-back").click();
    await expect(page.getByTestId("object-confirm-yes")).toBeVisible();
    evidence.cases.push(
      `${language}: new image resets rejection; Yes requires material; change returns to confirmation`,
    );
    presentation = "alternatives";
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
    await page.setViewportSize({ width: 320, height: 700 });
    await recognize();
    await expect(page.getByTestId("object-confirm-yes")).toHaveCount(0);
    for (const kind of ["spoon", "fork", "knife"])
      await expect(page.getByTestId(`object-choice-${kind}`)).toBeVisible();
    await expect(page.getByTestId("object-choice-cup")).toHaveCount(0);
    await expect(page.getByTestId("object-choice-none")).toBeVisible();
    await page.screenshot({ path: path.join(run, `${language}-unclear-dark.png`), fullPage: true });
    evidence.cases.push(
      `${language}: unclear immediately shows three choices + none; dark/narrow/reduced motion`,
    );
    for (const next of ["multiple", "unknown"]) {
      focus = next;
      await recognize();
      await expect(page.getByTestId("object-confirm-yes")).toHaveCount(0);
      await expect(page.getByTestId("object-alternatives")).toHaveCount(0);
      await expect(page.getByTestId("object-candidate-guide")).toBeVisible();
    }
    evidence.cases.push(`${language}: unknown/multiple never force an object or sorting answer`);
    focus = "single";
    presentation = "confirm";
    candidates = ["cup"];
    async function chooseCeramic() {
      await recognize();
      await page.getByTestId("object-confirm-yes").click();
      await page.getByTestId("object-answer-material-ceramic").click();
      for (const id of ["sorting-region-locate", "sorting-region-manual"]) {
        await expect(page.getByTestId(id)).toHaveCount(0);
      }
    }
    await chooseCeramic();
    assert.equal(await page.evaluate(() => window.qaWatched), 0, "No location before opting in");
    await expect(page.getByTestId("object-answer-region-elsewhere")).toBeVisible();
    await page.evaluate(() => localStorage.setItem("@kierratysappi/automatic-location/v1", "true"));
    await chooseCeramic();
    await expect(page.getByTestId("object-sorting-heading")).toHaveText(
      language === "fi" ? "Sekajäte · HSY" : "Mixed waste · HSY",
    );
    await expect(page.getByTestId("object-sorting-source").first()).toContainText("FI-HSY");
    await expect(page.getByTestId("object-answer-region-elsewhere")).toHaveCount(0);
    assert.equal(await page.evaluate(() => window.qaWatched), 1, "One automatic location fix");
    assert.equal(await page.evaluate(() => window.qaPromptPath), 0, "No extra permission prompt");
    evidence.cases.push(
      `${language}: image sorting uses opt-in location, with safe region fallback`,
    );
    await page.screenshot({
      path: path.join(run, `${language}-automatic-region.png`),
      fullPage: true,
    });
    offline = true;
    await recognize({ error: true });
    await expect(page.getByTestId("recycle-mark-action")).toHaveCount(0);
    evidence.cases.push(
      `${language}: saved material and offline photo request never creates guidance`,
    );
    await context.close();
  }
  assert.deepEqual(evidence.errors, []);
} finally {
  await browser.close();
  fs.writeFileSync(path.join(run, "evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`);
}
console.log(JSON.stringify(evidence, null, 2));
