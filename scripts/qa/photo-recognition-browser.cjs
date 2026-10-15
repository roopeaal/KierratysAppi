// Isolated QA-only API estimates and synthetic camera stream. Never runtime data.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const modulePath = process.env.PLAYWRIGHT_MODULE_PATH;
const executablePath = process.env.BROWSER_EXECUTABLE_PATH;
if (!modulePath || !executablePath) throw new Error("Set installed Playwright and browser paths.");
const { chromium } = require(modulePath);
const origin = process.env.APP_QA_URL ?? "http://127.0.0.1:8093";
const evidence = path.resolve("work/photo-qa");
fs.mkdirSync(evidence, { recursive: true });
const estimate = {
  status: "estimated",
  observation: {
    status: "clear",
    label: { fi: "QA-esimerkkipurkki", en: "QA example jar" },
    confidence: "medium",
    risk: "ordinary_packaging",
    parts: [
      {
        label: { fi: "QA-lasipurkki", en: "QA glass jar" },
        material: "glass",
        shape: "jar",
        packagingStatus: "packaging",
      },
    ],
  },
  source: {
    id: "openai-vision",
    model: "gpt-4.1-mini-2025-04-14",
    version: "photo-observation-v1",
    observedAt: "2026-10-15T12:00:00.000Z",
    verificationStatus: "inferred",
  },
};
const get = (page, id) => page.getByTestId(id);

(async () => {
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"],
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      permissions: ["camera"],
    });
    const page = await context.newPage();
    let posts = 0,
      mode = "clear",
      release,
      releaseOpening,
      openingRequested;
    const openingRequest = new Promise((resolve) => {
      openingRequested = resolve;
    });
    const cors = {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type",
    };
    await page.route("**/v1/recycling/photo-capabilities", async (route) => {
      if (mode === "opening")
        await new Promise((resolve) => {
          releaseOpening = resolve;
          openingRequested();
        });
      return route.fulfill({
        headers: cors,
        json: { enabled: mode !== "disabled", consentVersion: "photo-ai-v1" },
      });
    });
    await page.route("**/v1/recycling/photo", async (route) => {
      if (route.request().method() === "OPTIONS")
        return route.fulfill({ status: 204, headers: cors });
      posts++;
      const body = route.request().postDataJSON();
      assert.deepEqual(Object.keys(body).sort(), ["consentVersion", "jpegBase64", "language"]);
      assert.equal(body.consentVersion, "photo-ai-v1");
      const bytes = Buffer.from(body.jpegBase64, "base64");
      assert.equal(bytes[0], 255);
      assert.equal(bytes[1], 216);
      assert.ok(bytes.length < 1_500_000);
      assert.ok(!bytes.includes(Buffer.from("Exif")));
      if (mode === "offline") return route.abort("internetdisconnected");
      if (mode === "quota")
        return route.fulfill({
          status: 503,
          headers: cors,
          json: { status: "unavailable", reason: "quota_exhausted" },
        });
      if (mode === "pending")
        await new Promise((resolve) => {
          release = resolve;
        });
      const payload = structuredClone(estimate);
      if (mode === "paper" || mode === "non-packaging-paper") {
        payload.observation.parts[0] = {
          label: { fi: "QA-paperipakkaus", en: "QA paper packaging" },
          material: "paper",
          shape: "other",
          packagingStatus: mode === "paper" ? "packaging" : "non_packaging",
        };
      }
      if (mode === "special") payload.observation.risk = "special_waste";
      if (mode === "uncertain") {
        payload.observation.status = "uncertain";
        payload.observation.confidence = "low";
      }
      try {
        await route.fulfill({ headers: cors, json: payload });
      } catch {
        /* Explicitly cancelled request. */
      }
    });
    await page.goto(origin, { waitUntil: "networkidle" });
    await get(page, "home-photo-action").click();
    await get(page, "photo-open-camera").waitFor();
    assert.equal(posts, 0);
    await page.screenshot({ path: path.join(evidence, "fi-intro.png"), fullPage: true });

    // The local availability check must not look like an unresponsive button.
    mode = "opening";
    await get(page, "photo-open-camera").click();
    await openingRequest;
    assert.equal(await get(page, "photo-open-camera").getAttribute("aria-busy"), "true");
    assert.equal(await get(page, "photo-open-camera").getAttribute("aria-disabled"), "true");
    assert.equal(
      await get(page, "photo-open-camera").getAttribute("aria-label"),
      "Avataan kameraa…",
    );
    assert.equal(posts, 0);
    await page.screenshot({ path: path.join(evidence, "fi-opening.png"), fullPage: true });
    mode = "clear";
    releaseOpening();
    await get(page, "photo-capture").waitFor();
    await get(page, "photo-cancel").click();

    const capture = async () => {
      await get(page, "photo-open-camera").click();
      await get(page, "photo-capture").waitFor();
      await page.waitForFunction(() =>
        [...document.querySelectorAll("video")].some(
          (video) => video.readyState >= 2 && video.videoWidth > 0,
        ),
      );
      await get(page, "photo-capture").click();
      await get(page, "photo-send").waitFor();
    };
    await capture();
    assert.equal(posts, 0, "taking a photo must not upload it");
    await page.screenshot({ path: path.join(evidence, "fi-preview.png"), fullPage: true });
    await get(page, "photo-send").click();
    await get(page, "photo-product").waitFor();
    assert.equal(posts, 1);
    assert.equal(await get(page, "sorting-result-resolved").count(), 0);
    await get(page, "photo-confirm-0").click();
    await get(page, "sorting-result-resolved").waitFor();
    assert.ok((await get(page, "sorting-result-resolved").innerText()).includes("Lasipakkausten"));
    assert.ok((await page.locator("body").innerText()).includes("photo-observation-v1"));
    await page.screenshot({ path: path.join(evidence, "fi-confirmed.png"), fullPage: true });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.screenshot({ path: path.join(evidence, "fi-confirmed-dark.png"), fullPage: true });
    await get(page, "sorting-result-resolved").scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(evidence, "fi-rule-dark.png"), fullPage: true });
    await page.addStyleTag({ content: "[data-testid=photo-screen] { font-size:130%; }" });
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    );

    // Simulate leaving the app without retaining a photo, estimate or result.
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
      document.dispatchEvent(new Event("visibilitychange"));
      Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await get(page, "photo-open-camera").waitFor();
    assert.equal(await get(page, "photo-product").count(), 0);

    for (const nextMode of ["paper", "non-packaging-paper", "special", "uncertain"]) {
      mode = nextMode;
      await capture();
      await get(page, "photo-send").click();
      await get(page, "photo-product").waitFor();
      assert.equal(await get(page, "sorting-result-resolved").count(), 0);
      if (nextMode === "paper") {
        await get(page, "photo-confirm-0").waitFor();
        await get(page, "photo-confirm-0").click();
        await get(page, "sorting-result-resolved").waitFor();
        const text = await get(page, "sorting-result-resolved").innerText();
        assert.ok(text.includes("Kartonkipakkausten keräys"));
        assert.ok(text.includes("RINKI"));
        await page.screenshot({
          path: path.join(evidence, "fi-paper-confirmed.png"),
          fullPage: true,
        });
        await get(page, "sorting-result-resolved").scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(evidence, "fi-paper-rule.png"), fullPage: true });
      } else assert.equal(await get(page, "photo-confirm-0").count(), 0);
      await get(page, "photo-reset").click();
    }
    mode = "pending";
    await capture();
    await get(page, "photo-send").click();
    await get(page, "photo-loading").waitFor();
    await get(page, "photo-cancel").click();
    release?.();
    await get(page, "photo-open-camera").waitFor();
    assert.equal(await get(page, "photo-product").count(), 0);
    mode = "offline";
    await capture();
    await get(page, "photo-send").click();
    await get(page, "photo-error").waitFor();
    assert.equal(await get(page, "photo-send").count(), 0);
    mode = "disabled";
    await get(page, "photo-open-camera").click();
    await page.getByText("Kuvatunnistus ei ole käytettävissä.", { exact: false }).waitFor();
    assert.equal(await get(page, "photo-camera").count(), 0);
    mode = "quota";
    await capture();
    await get(page, "photo-send").click();
    await get(page, "photo-error").waitFor();
    assert.ok((await get(page, "photo-error").innerText()).includes("saldo"));

    await page.goto(origin, { waitUntil: "networkidle" });
    await get(page, "language-en").click();
    await get(page, "home-photo-action").click();
    assert.ok((await page.locator("body").innerText()).includes("OpenAI may retain data"));
    await page.screenshot({ path: path.join(evidence, "en-intro.png"), fullPage: true });
    await context.close();
    console.log(
      "PASS: actual photo UI, isolated camera/API fixtures; opening feedback, explicit upload and confirmation, sourced paper-packaging guidance, loose-paper/unsafe/uncertain refusal, metadata, cancellation, hidden/offline/disabled/quota, FI/EN and layout.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
