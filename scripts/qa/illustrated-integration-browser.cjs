// Isolated browser acceptance. Synthetic location only, no live product/photo requests.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
if (!process.env.PLAYWRIGHT_MODULE_PATH || !process.env.BROWSER_EXECUTABLE_PATH)
  throw new Error("Use the installed Playwright module and browser.");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH);
const base = process.env.APP_QA_URL ?? "http://127.0.0.1:8093";
const evidence = path.resolve(
  process.env.APP_QA_EVIDENCE_DIR ?? "work/illustrated-integration-qa/navigation",
);
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

async function inspectIdentify(page, language, name, checkProminence = false) {
  const labels =
    language === "fi"
      ? ["Skannaa viivakoodi", "Syötä viivakoodi käsin", "Tunnista tuote tekoälyllä"]
      : ["Scan a barcode", "Enter a barcode manually", "Identify an item with AI"];
  const ids = ["scan", "manual", "photo"].map((action) => `identify-${action}-action`);
  assert.deepEqual(
    await page
      .getByTestId("identify-screen")
      .locator('[data-testid^="identify-"][data-testid$="-action"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute("data-testid"))),
    ids,
    "Identification actions must follow barcode, manual, AI reading and keyboard order",
  );
  await page.evaluate(() => document.fonts.ready);
  if (page.viewportSize().width < 360) {
    // React's responsive branch commits asynchronously after a viewport resize.
    await page
      .getByTestId("identify-manual-action")
      .getByTestId("action-icon-manual")
      .waitFor({ state: "detached" });
    await page
      .getByTestId("identify-photo-action")
      .getByTestId("reference-symbol-camera")
      .waitFor({ state: "detached" });
  }
  // One browser evaluation prevents comparing boxes from different layout frames.
  const measurements = await page
    .getByTestId("identify-screen")
    .locator('[data-testid^="identify-"][data-testid$="-action"]')
    .evaluateAll(
      (els, expectedLabels) =>
        els.map((el, index) => {
          const box = el.getBoundingClientRect();
          const title = [...el.querySelectorAll("*")].find(
            (node) => node.childElementCount === 0 && node.textContent === expectedLabels[index],
          );
          if (!title) throw new Error("Missing exact identification action title");
          return {
            label: el.getAttribute("aria-label"),
            y: box.top,
            bottom: box.bottom,
            height: box.height,
            titleSize: parseFloat(getComputedStyle(title).fontSize),
            titleWidth: title.getBoundingClientRect().width,
          };
        }),
      labels,
    );
  assert.deepEqual(
    measurements.map((item) => item.label),
    labels,
  );
  const boxes = measurements;
  const sizes = measurements.map((item) => item.titleSize);
  assert.ok(boxes[1].y >= boxes[0].bottom, "Manual follows barcode visually");
  assert.ok(boxes[2].y >= boxes[1].bottom, "AI follows manual visually");
  if (checkProminence) {
    assert.ok(
      boxes[0].height > Math.max(boxes[1].height, boxes[2].height),
      "Barcode scanning has the largest action",
    );
    assert.ok(sizes[0] > Math.max(sizes[1], sizes[2]), "Barcode title has visual priority");
    assert.notEqual(
      await page.getByTestId(ids[0]).evaluate((el) => getComputedStyle(el).backgroundColor),
      await page.getByTestId(ids[1]).evaluate((el) => getComputedStyle(el).backgroundColor),
      "The primary barcode action must be visually distinguished",
    );
  }
  if (page.viewportSize().width < 360) {
    assert.equal(
      await page.getByTestId("identify-manual-action").getByTestId("action-icon-manual").count(),
      0,
      "Narrow manual action gives its text the decorative icon column",
    );
    assert.equal(
      await page
        .getByTestId("identify-photo-action")
        .getByTestId("reference-symbol-camera")
        .count(),
      0,
      "Narrow AI action gives its text the decorative icon column",
    );
    for (const index of [1, 2])
      assert.ok(
        measurements[index].titleWidth >= 150,
        "Narrow secondary labels retain usable reading width",
      );
  }
  assert.equal(await page.getByTestId("tab-identify").getAttribute("aria-selected"), "true");
  assert.equal(await page.evaluate(() => window.qaLocationCalls), 0);
  assert.equal(await page.evaluate(() => window.qaCameraCalls), 0);
  await inspect(page, name);
}

async function scaleText(page) {
  // Synthetic CSS scaling, not physical Dynamic Type evidence.
  await page.evaluate(() => {
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
      window.qaCameraCalls = 0;
      const media = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia = (...args) => {
        window.qaCameraCalls++;
        return media(...args);
      };
      const locate = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
      navigator.geolocation.getCurrentPosition = (...args) => {
        window.qaLocationCalls++;
        return locate(...args);
      };
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

    await page.getByTestId("home-identify-action").click();
    await page.getByTestId("identify-screen").waitFor();
    assert.equal(new URL(page.url()).pathname, "/identify");
    await inspectIdentify(page, "fi", "fi-identify", true);
    assert.deepEqual(failures, [], "Opening Home's identification action must not call any API");
    await page.getByTestId("identify-scan-action").click();
    await page.getByTestId("scanner-permission-screen").waitFor();
    assert.equal(await page.getByTestId("bottom-navigation").count(), 0);
    assert.equal(await page.evaluate(() => window.qaCameraCalls), 0);
    await page.getByTestId("scanner-close-action").click();
    await page.getByTestId("identify-screen").waitFor();
    await page.getByTestId("identify-manual-action").click();
    await page.getByTestId("manual-entry-screen").waitFor();
    assert.equal(await page.getByTestId("bottom-navigation").count(), 0);
    await page.getByTestId("manual-gtin-input").fill("123");
    await page.getByTestId("manual-submit-action").click();
    await page.getByText("Tarkista koodin numerot ja tarkistusnumero.", { exact: true }).waitFor();
    await page.getByTestId("manual-close-action").click();
    await page.getByTestId("identify-screen").waitFor();
    await page.getByTestId("identify-photo-action").click();
    await page.getByTestId("photo-open-camera").waitFor();
    assert.equal(await page.getByTestId("bottom-navigation").count(), 0);
    assert.equal(await page.evaluate(() => window.qaCameraCalls), 0);
    await page.getByRole("button", { name: "Takaisin", exact: true }).click();
    await page.getByTestId("identify-screen").waitFor();
    await inspectIdentify(page, "fi", "fi-identify-return", true);
    assert.deepEqual(failures, [], "Choosing an entry and returning must not perform recognition");

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
    await page.getByTestId("home-identify-action").click();
    await page.getByTestId("identify-screen").waitFor();
    await inspectIdentify(page, "en", "en-identify", true);
    for (const [action, screen, close] of [
      ["scan", "scanner-permission-screen", "scanner-close-action"],
      ["manual", "manual-entry-screen", "manual-close-action"],
      ["photo", "photo-screen", null],
    ]) {
      await page.getByTestId(`identify-${action}-action`).click();
      await page.getByTestId(screen).waitFor();
      assert.equal(await page.getByTestId("bottom-navigation").count(), 0);
      if (close) await page.getByTestId(close).click();
      else await page.getByRole("button", { name: "Back", exact: true }).click();
      await page.getByTestId("identify-screen").waitFor();
    }
    await page.emulateMedia({ colorScheme: "dark" });
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector('[data-testid="identify-screen"]'))
          .backgroundColor === "rgb(20, 34, 27)",
    );
    await inspectIdentify(page, "en", "en-identify-dark");
    await page.setViewportSize({ width: 320, height: 844 });
    await inspectIdentify(page, "en", "en-identify-320-dark");
    await scaleText(page);
    await inspectIdentify(page, "en", "en-identify-320-dark-large");
    await page.emulateMedia({ colorScheme: "light" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByTestId("tab-home").click();
    await page.getByTestId("home-screen").waitFor();
    await page.getByTestId("language-fi").click();
    await page.getByTestId("tab-identify").click();
    await page.getByTestId("identify-screen").waitFor();
    await inspectIdentify(page, "fi", "fi-identify-tab", true);
    await page.goto(base + "/identify");
    await page.getByTestId("identify-screen").waitFor();
    await inspectIdentify(page, "fi", "fi-identify-direct");
    await page.emulateMedia({ colorScheme: "dark" });
    await page.setViewportSize({ width: 320, height: 844 });
    await inspectIdentify(page, "fi", "fi-identify-320-dark");
    await scaleText(page);
    await inspectIdentify(page, "fi", "fi-identify-320-dark-large");
    assert.deepEqual(
      failures,
      [],
      "Hub renders and entry/back must not call capabilities or lookup",
    );
    await page.emulateMedia({ colorScheme: "light" });
    await page.setViewportSize({ width: 390, height: 844 });

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
    await scaleText(page);
    await inspect(page, "fi-home-320-large");
    assert.deepEqual(failures, []);
    await context.close();
    console.log(
      "PASS: Home-to-Identify selected tab, barcode-first hierarchy and reading order, all three entry/back routes in FI/EN, no implicit camera/GPS/capabilities/lookup, dark/320/130% synthetic hub layout, four real tabs, keyboard activation, invalid-no-request, language persistence, direct-URL no GPS, explicit one-shot Points tab, five sourced points, local artwork, 44pt controls and 320/390/1280 Home layout. No live product/photo request or user location.",
    );
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
