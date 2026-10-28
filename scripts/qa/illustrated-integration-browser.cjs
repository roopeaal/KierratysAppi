// Isolated browser acceptance. Synthetic location only, no live product/photo requests.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
if (!process.env.PLAYWRIGHT_MODULE_PATH || !process.env.BROWSER_EXECUTABLE_PATH)
  throw new Error("Use the installed Playwright module and browser.");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH);
const base = process.env.APP_QA_URL ?? "http://127.0.0.1:8093";
const evidence = path.resolve("work/illustrated-integration-qa/navigation");
fs.mkdirSync(evidence, { recursive: true });

async function inspect(page, name) {
  await page.evaluate(() => document.fonts.ready);
  const problems = await page.evaluate(() => {
    const results = [];
    if (document.documentElement.scrollWidth > innerWidth) results.push("Page overflows");
    for (const el of document.querySelectorAll('[role="button"], [role="tab"], [role="radio"]')) {
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height || el.closest('[aria-hidden="true"]')) continue;
      if (b.left < -1 || b.right > innerWidth + 1)
        results.push("Control overflows: " + el.getAttribute("aria-label"));
      if (b.width < 44 || b.height < 44)
        results.push("Small control: " + el.getAttribute("aria-label"));
    }
    return results;
  });
  await page.screenshot({ path: path.join(evidence, name + ".png"), fullPage: true });
  assert.deepEqual(problems, [], name);
}

async function main() {
  const browser = await chromium.launch({
    executablePath: process.env.BROWSER_EXECUTABLE_PATH,
    headless: true,
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
      permissions: ["geolocation"],
      geolocation: { latitude: 60.1699, longitude: 24.9384, accuracy: 10 },
    });
    const failures = [];
    await context.route("**/v1/**", async (route) => {
      failures.push("Unexpected network call: " + new URL(route.request().url()).pathname);
      await route.abort();
    });
    await context.addInitScript(() => {
      window.qaLocationCalls = 0;
      const watch = navigator.geolocation.watchPosition.bind(navigator.geolocation);
      navigator.geolocation.watchPosition = (...args) => {
        window.qaLocationCalls++;
        return watch(...args);
      };
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => failures.push(error.message));
    await page.goto(base);
    await page.getByTestId("home-screen").waitFor();
    assert.equal(await page.getByRole("tab").count(), 4);
    assert.equal(await page.getByTestId("tab-home").getAttribute("aria-selected"), "true");
    await page.waitForFunction(() =>
      [...document.images].every((img) => img.complete && img.naturalWidth > 0),
    );
    assert.equal(await page.evaluate(() => window.qaLocationCalls), 0);
    await inspect(page, "fi-home");

    await page.getByTestId("tab-identify").click();
    await page.getByTestId("identify-screen").waitFor();
    assert.equal(await page.getByTestId("tab-identify").getAttribute("aria-selected"), "true");
    for (const action of ["scan", "manual", "photo"])
      assert.equal(await page.getByTestId(`identify-${action}-action`).count(), 1);
    await inspect(page, "fi-identify");
    await page.getByTestId("identify-manual-action").click();
    await page.getByTestId("manual-entry-screen").waitFor();
    assert.equal(await page.getByTestId("bottom-navigation").count(), 0);
    await page.getByTestId("manual-gtin-input").fill("123");
    await page.getByTestId("manual-submit-action").click();
    await page.getByText("Tarkista koodin numerot ja tarkistusnumero.", { exact: true }).waitFor();
    await page.getByTestId("manual-close-action").click();
    await page.getByTestId("identify-screen").waitFor();

    await page.getByTestId("tab-settings").focus();
    await page.getByTestId("tab-settings").press("Enter");
    await page.getByTestId("settings-screen").waitFor();
    await page
      .getByTestId("settings-history-action")
      .getByText("Tallennus pois päältä", { exact: true })
      .waitFor();
    await inspect(page, "fi-settings");
    await page.getByTestId("settings-language-en").click();
    await page.getByRole("heading", { name: "Settings", exact: true }).waitFor();
    assert.equal(await page.getByTestId("tab-settings").getAttribute("aria-label"), "Settings");
    await inspect(page, "en-settings");
    await page.getByTestId("tab-home").click();
    await page.getByTestId("home-screen").waitFor();
    assert.equal(
      await page.getByTestId("home-screen").count(),
      1,
      "Tab return must not create duplicate Home routes",
    );
    assert.equal(await page.getByTestId("tab-identify").getAttribute("aria-label"), "Identify");
    await inspect(page, "en-home");
    await page.getByTestId("language-fi").click();

    // A direct URL does not imply consent. A later explicit Points tab press does.
    await page.goto(base + "/nearby");
    await page.getByTestId("nearby-screen").waitFor();
    assert.equal(await page.evaluate(() => window.qaLocationCalls), 0);
    assert.equal(await page.getByTestId("nearby-result").count(), 0);
    await page.getByTestId("tab-home").click();
    await page.getByTestId("home-screen").waitFor();
    await page.getByTestId("tab-nearby").click();
    await page.getByTestId("nearby-result").waitFor();
    assert.equal(await page.evaluate(() => window.qaLocationCalls), 1);
    assert.equal(await page.locator('[data-testid^="nearby-point-"]').count(), 5);
    await inspect(page, "fi-nearby-synthetic");
    await page.getByTestId("tab-nearby").click();
    assert.equal(await page.evaluate(() => window.qaLocationCalls), 1);
    await page.getByTestId("tab-home").click();
    await page.getByTestId("home-screen").waitFor();
    await page.emulateMedia({ colorScheme: "dark" });
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector('[data-testid="home-screen"]')).backgroundColor ===
        "rgb(20, 34, 27)",
    );
    await inspect(page, "fi-home-dark");
    await page.emulateMedia({ colorScheme: "light" });

    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      await page.waitForFunction(
        () =>
          Math.abs(
            document.querySelector('[data-testid="home-canvas"]').getBoundingClientRect().width -
              Math.min(innerWidth, 560),
          ) < 1,
      );
      await inspect(page, `fi-home-${width}`);
    }
    await page.setViewportSize({ width: 320, height: 844 });
    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid="home-canvas"]').getBoundingClientRect().width === 320,
    );
    await page.evaluate(() => {
      // Synthetic CSS scaling, not physical Dynamic Type evidence.
      const nodes = new Set();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode())
        if (walker.currentNode.textContent.trim()) nodes.add(walker.currentNode.parentElement);
      const sizes = [...nodes].map((node) => [
        node,
        parseFloat(getComputedStyle(node).fontSize),
        parseFloat(getComputedStyle(node).lineHeight),
      ]);
      for (const [node, font, line] of sizes) {
        node.style.fontSize = font * 1.3 + "px";
        node.style.lineHeight = (Number.isFinite(line) ? line : font * 1.4) * 1.3 + "px";
      }
    });
    await inspect(page, "fi-home-320-large");
    assert.deepEqual(failures, []);
    await context.close();
    console.log(
      "PASS: four real tabs, keyboard activation, scoped capture navigation, invalid-no-request, language persistence across routes, direct-URL no GPS, explicit one-shot Points tab, five sourced points, live dark theme, local artwork, 44pt controls and 320/390/1280/130% synthetic layout. No live product/photo request or user location.",
    );
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
