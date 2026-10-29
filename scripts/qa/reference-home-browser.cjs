// Local, isolated fixtures only. No live product, photo, address or location request.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
if (!process.env.PLAYWRIGHT_MODULE_PATH || !process.env.BROWSER_EXECUTABLE_PATH)
  throw new Error("Set installed Playwright and browser paths.");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH);
const base = process.env.APP_QA_URL ?? "http://127.0.0.1:8093";
const evidence = path.resolve(
  process.env.APP_QA_EVIDENCE_DIR ?? "work/reference-home-2026-10-28/browser",
);
fs.mkdirSync(evidence, { recursive: true });
const gtin = "3017620422003";

async function shot(page, name) {
  await page.evaluate(() => document.fonts.ready);
  const issues = await page.evaluate(() => {
    const result = [];
    if (document.documentElement.scrollWidth > innerWidth) result.push("Page overflow");
    for (const el of document.querySelectorAll(
      '[role="button"], [role="tab"], [role="radio"], input',
    )) {
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
  await page.screenshot({ path: path.join(evidence, `${name}.png`) });
  assert.deepEqual(issues, [], name);
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
      const errors = [];
      const calls = [];
      await context.addInitScript(
        ({ language, gtin }) => {
          localStorage.setItem("@kierratysappi/language/v1", language);
          // Stale entries must not leak into an opted-out Home.
          localStorage.setItem("@kierratysappi/history-enabled/v1", "false");
          localStorage.setItem(
            "@kierratysappi/history/v1",
            JSON.stringify([
              {
                gtin,
                productName: "QA saved item",
                resultStatus: "packaging_missing",
                scannedAt: "2026-10-28T12:00:00Z",
              },
            ]),
          );
          window.qaGpsCalls = 0;
          navigator.geolocation.getCurrentPosition = () => {
            window.qaGpsCalls++;
            throw new Error("Unexpected GPS");
          };
          navigator.geolocation.watchPosition = () => {
            window.qaGpsCalls++;
            throw new Error("Unexpected GPS");
          };
        },
        { language, gtin },
      );
      await context.route("**/v1/**", async (route) => {
        if (route.request().method() === "OPTIONS")
          return route.fulfill({
            status: 204,
            headers: {
              "access-control-allow-origin": "*",
              "access-control-allow-methods": "POST, GET, OPTIONS",
              "access-control-allow-headers": "Content-Type, Accept",
            },
          });
        calls.push({
          path: new URL(route.request().url()).pathname,
          body: route.request().postDataJSON(),
        });
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          headers: { "access-control-allow-origin": "*" },
          body: JSON.stringify({ status: "not_found", gtin }),
        });
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(base);
      await page.getByTestId("home-screen").waitFor();
      // Language is also switched through the actual control, not inferred from storage internals.
      await page.getByTestId(`language-${language}`).click();
      await page
        .getByRole("heading", {
          name: language === "fi" ? "Suositut haut" : "Popular searches",
          exact: true,
        })
        .waitFor();
      await page
        .getByTestId("home-history-empty")
        .filter({ hasText: language === "fi" ? "Historia ei ole käytössä" : "History is off" })
        .waitFor();
      assert.equal(await page.getByTestId(`home-recent-${gtin}`).count(), 0);
      assert.equal(await page.evaluate(() => window.qaGpsCalls), 0);
      assert.equal(calls.length, 0);
      await page
        .getByTestId("home-identify-action")
        .getByText(
          language === "fi"
            ? "Lue viivakoodi tai käytä tekoälytunnistusta"
            : "Read a barcode or use AI recognition",
          { exact: true },
        )
        .waitFor();
      await page.getByTestId("home-identify-action").focus();
      await page.getByTestId("home-identify-action").press("Enter");
      await page.getByTestId("identify-screen").waitFor();
      assert.equal(new URL(page.url()).pathname, "/identify");
      assert.equal(await page.getByTestId("tab-identify").getAttribute("aria-selected"), "true");
      assert.equal(calls.length, 0, "Opening the hub must not request capabilities or recognition");
      assert.equal(await page.evaluate(() => window.qaGpsCalls), 0);
      await page.getByTestId("tab-home").click();
      await page.getByTestId("home-screen").waitFor();
      await page.getByTestId("home-canvas").evaluate((el) => el.scrollIntoView({ block: "start" }));
      await shot(page, `${language}-home-top`);
      await page.getByTestId("home-history-action").scrollIntoViewIfNeeded();
      await shot(page, `${language}-home-history-off`);

      await page
        .getByTestId("home-search-input")
        .fill(language === "fi" ? "muovipullo" : "plastic bottle");
      await page.getByTestId("home-search-input").press("Enter");
      await page.getByTestId("guide-section-plastic").waitFor();
      assert.equal(await page.locator('[data-testid^="guide-section-"]').count(), 1);
      await shot(page, `${language}-search-result`);
      await page.getByTestId("guide-search-input").fill("unknown brand not in guide");
      await page.getByTestId("guide-search-empty").waitFor();
      assert.equal(await page.locator('[data-testid^="guide-section-"]').count(), 0);
      await page.getByTestId("guide-search-reset").click();
      assert.equal(await page.locator('[data-testid^="guide-section-"]').count(), 4);
      for (const material of ["plastic", "carton", "glass", "metal"]) {
        await page.goto(base);
        await page.getByTestId("home-screen").waitFor();
        await page.getByTestId(`home-material-${material}`).click();
        await page.getByTestId(`guide-section-${material}`).waitFor();
        assert.equal(await page.locator('[data-testid^="guide-section-"]').count(), 1);
      }
      await page.goto(`${base}/guide?query=plastic&query=glass`);
      await page.getByTestId("guide-search-empty").waitFor();
      assert.equal(await page.locator('[data-testid^="guide-section-"]').count(), 0);
      await page.getByTestId("guide-search-reset").click();
      assert.equal(await page.locator('[data-testid^="guide-section-"]').count(), 4);
      assert.equal(calls.length, 0, "Guide search never calls a product provider");
      assert.equal(await page.evaluate(() => window.qaGpsCalls), 0);

      // Do not reload: addInitScript intentionally starts every new document opted out.
      await page.evaluate(() => localStorage.setItem("@kierratysappi/history-enabled/v1", "true"));
      await page.getByTestId("tab-home").click();
      await page.getByTestId(`home-recent-${gtin}`).waitFor();
      assert.equal(calls.length, 0, "Reading saved history never re-queries automatically");
      await page.getByTestId(`home-recent-${gtin}`).scrollIntoViewIfNeeded();
      await shot(page, `${language}-home-real-history`);
      await page.getByTestId(`home-recent-${gtin}`).click();
      await page.getByTestId("result-not-found-screen").waitFor();
      assert.equal(calls.length, 1);
      assert.equal(calls[0].body.gtin, gtin);
      assert.equal(await page.getByTestId("sorting-result-resolved").count(), 0);
      assert.deepEqual(errors, []);
      await context.close();
    }
    console.log(
      "PASS: FI/EN Popular searches heading, reference Home and keyboard-activated combined Identify entry, selected tab and no implicit capabilities/recognition/GPS, opt-out stale-history protection, real saved preview and explicit reopen, four real material chips, bounded local-guide search/unknown/reset/duplicate-parameter recovery, 44pt controls and zero implicit GPS/provider calls. Fixtures only; no paid image request.",
    );
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
