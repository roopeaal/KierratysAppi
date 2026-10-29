// Isolated QA-only API estimates and synthetic camera stream. Never runtime data.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const modulePath = process.env.PLAYWRIGHT_MODULE_PATH;
const executablePath = process.env.BROWSER_EXECUTABLE_PATH;
if (!modulePath || !executablePath) throw new Error("Set installed Playwright and browser paths.");
const { chromium } = require(modulePath);
const origin = process.env.APP_QA_URL ?? "http://127.0.0.1:8093";
const evidence = path.resolve(process.env.APP_QA_EVIDENCE_DIR ?? "work/photo-qa");
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
      capabilityChecks = 0,
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
      if (route.request().method() !== "OPTIONS") capabilityChecks++;
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
      if (mode === "nutella") {
        // Recorded public-fixture error, not a new inference. PHOTO_PRODUCT_EVALUATION.md.
        payload.observation.label = {
          fi: "Nutella-hasselpähkinälevite",
          en: "Nutella hazelnut spread",
        };
        payload.observation.parts = [
          {
            label: { fi: "muovipurkki", en: "plastic jar" },
            material: "plastic",
            shape: "jar",
            packagingStatus: "packaging",
          },
          {
            label: { fi: "muovikorkki", en: "plastic lid" },
            material: "plastic",
            shape: "lid",
            packagingStatus: "packaging",
          },
          {
            label: { fi: "etiketti", en: "label" },
            material: "paper",
            shape: "other",
            packagingStatus: "packaging",
          },
        ];
        payload.source.observedAt = "2026-10-15T15:19:46.428Z";
      }
      if (mode === "paper" || mode === "non-packaging-paper") {
        payload.observation.parts[0] = {
          label: { fi: "QA-paperipakkaus", en: "QA paper packaging" },
          material: "paper",
          shape: "other",
          packagingStatus: mode === "paper" ? "packaging" : "non_packaging",
        };
      }
      if (mode === "special") payload.observation.risk = "special_waste";
      if (mode === "unknown-material") payload.observation.parts[0].material = "unknown";
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
    await get(page, "home-identify-action").click();
    await get(page, "identify-screen").waitFor();
    assert.equal(posts, 0, "Opening the identification hub must not upload a photo");
    assert.equal(capabilityChecks, 0, "Opening the hub must not check photo capabilities");
    assert.equal(await get(page, "tab-identify").getAttribute("aria-selected"), "true");
    await get(page, "identify-photo-action").click();
    await get(page, "photo-open-camera").waitFor();
    assert.equal(posts, 0);
    assert.equal(capabilityChecks, 0, "The photo introduction waits for explicit camera action");
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
    const confirmPart = async (index, material) => {
      assert.equal(await get(page, `photo-confirm-${index}`).getAttribute("aria-disabled"), "true");
      await get(page, `photo-material-${index}-${material}`).click();
      assert.equal(
        await get(page, `photo-material-${index}-${material}`).getAttribute("aria-checked"),
        "true",
      );
      assert.equal(
        await get(page, `photo-conditions-${index}`).getAttribute("aria-checked"),
        "false",
      );
      assert.equal(await get(page, `photo-confirm-${index}`).getAttribute("aria-disabled"), "true");
      await get(page, `photo-conditions-${index}`).click();
      assert.equal(
        await get(page, `photo-conditions-${index}`).getAttribute("aria-checked"),
        "true",
      );
      assert.equal(await get(page, `photo-confirm-${index}`).isEnabled(), true);
      await get(page, `photo-confirm-${index}`).click();
    };
    await capture();
    assert.equal(posts, 0, "taking a photo must not upload it");
    await page.screenshot({ path: path.join(evidence, "fi-preview.png"), fullPage: true });
    await get(page, "photo-send").click();
    await get(page, "photo-product").waitFor();
    assert.equal(posts, 1);
    assert.equal(await get(page, "sorting-result-resolved").count(), 0);
    assert.equal(
      await page.locator('[data-testid^="photo-material-0-"][aria-checked="true"]').count(),
      0,
      "AI material must not be preselected",
    );
    await page.screenshot({
      path: path.join(evidence, "fi-material-unselected.png"),
      fullPage: true,
    });
    await confirmPart(0, "glass");
    await get(page, "sorting-result-resolved").waitFor();
    assert.ok((await get(page, "sorting-result-resolved").innerText()).includes("Lasipakkausten"));
    assert.ok((await page.locator("body").innerText()).includes("photo-observation-v1"));
    const beforeLocalChanges = posts;
    await get(page, "photo-material-0-glass").click();
    assert.equal(
      await get(page, "sorting-result-resolved").count(),
      1,
      "reselecting the same radio must not revoke review",
    );
    await get(page, "photo-material-0-plastic").click();
    assert.equal(
      await get(page, "sorting-result-resolved").count(),
      0,
      "a different known material must clear old guidance",
    );
    assert.equal(await get(page, "photo-conditions-0").getAttribute("aria-checked"), "false");
    await confirmPart(0, "glass");
    await get(page, "photo-conditions-0").click();
    assert.equal(
      await get(page, "sorting-result-resolved").count(),
      0,
      "unchecking safety must clear old guidance",
    );
    await get(page, "photo-material-0-unknown").focus();
    await page.keyboard.press("Enter");
    await get(page, "photo-material-unknown-0").waitFor();
    assert.equal(await get(page, "photo-confirm-0").count(), 0);
    assert.equal(await get(page, "photo-conditions-0").count(), 0);
    await get(page, "photo-check-marking-0").waitFor();
    assert.equal(posts, beforeLocalChanges, "review choices must not upload anything");
    await page.screenshot({ path: path.join(evidence, "fi-material-unknown.png"), fullPage: true });
    await get(page, "photo-material-0-glass").click();
    await confirmPart(0, "glass");
    await page.screenshot({ path: path.join(evidence, "fi-confirmed.png"), fullPage: true });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.screenshot({ path: path.join(evidence, "fi-confirmed-dark.png"), fullPage: true });
    await get(page, "sorting-result-resolved").scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(evidence, "fi-rule-dark.png"), fullPage: true });
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

    mode = "nutella";
    await capture();
    await get(page, "photo-send").click();
    await get(page, "photo-product").waitFor();
    assert.equal(await page.getByRole("radiogroup").count(), 3);
    assert.equal(
      await page
        .locator('[data-testid^="photo-material-"][role="radio"][aria-checked="true"]')
        .count(),
      0,
    );
    await confirmPart(0, "glass");
    await get(page, "sorting-result-resolved").waitFor();
    assert.ok((await get(page, "sorting-result-resolved").innerText()).includes("Lasipakkausten"));
    assert.ok((await get(page, "photo-part-0").innerText()).includes("Arvio: Muovi"));
    assert.ok((await page.locator("body").innerText()).includes("ei varmistettu tuote"));
    assert.equal(await get(page, "photo-confirm-1").getAttribute("aria-disabled"), "true");
    await confirmPart(1, "plastic");
    assert.equal(await get(page, "sorting-result-resolved").count(), 2);
    assert.ok((await get(page, "photo-part-1").innerText()).includes("Muovipakkausten"));
    await get(page, "photo-material-0-unknown").click();
    assert.equal(await get(page, "photo-part-0").getByTestId("sorting-result-resolved").count(), 0);
    assert.equal(await get(page, "photo-part-1").getByTestId("sorting-result-resolved").count(), 1);
    await get(page, "photo-material-0-glass").click();
    assert.equal(await get(page, "photo-conditions-0").getAttribute("aria-checked"), "false");
    await confirmPart(0, "glass");
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await get(page, "photo-part-0").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: path.join(evidence, "fi-nutella-corrected.png"),
      fullPage: true,
    });
    await page.setViewportSize({ width: 320, height: 844 });
    await page.evaluate(() => {
      // Snapshot all computed sizes first: relative percentages compound in nested RN Web text.
      const text = [...document.querySelectorAll('[data-testid="photo-screen"] [dir="auto"]')].map(
        (element) => ({
          element,
          size: Number.parseFloat(getComputedStyle(element).fontSize),
          line: Number.parseFloat(getComputedStyle(element).lineHeight),
        }),
      );
      for (const { element, size, line } of text) {
        element.style.setProperty("font-size", `${size * 1.3}px`, "important");
        element.style.setProperty("line-height", `${line * 1.3}px`, "important");
      }
    });
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    );
    await get(page, "photo-part-0").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: path.join(evidence, "fi-material-320-large.png"),
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await get(page, "photo-reset").click();

    for (const nextMode of [
      "paper",
      "non-packaging-paper",
      "special",
      "uncertain",
      "unknown-material",
    ]) {
      mode = nextMode;
      await capture();
      await get(page, "photo-send").click();
      await get(page, "photo-product").waitFor();
      assert.equal(await get(page, "sorting-result-resolved").count(), 0);
      if (nextMode === "paper") {
        await get(page, "photo-confirm-0").waitFor();
        await confirmPart(0, "paper");
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
      } else {
        assert.equal(await get(page, "photo-confirm-0").count(), 0);
        assert.equal(await page.getByRole("radiogroup").count(), 0);
      }
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
    await get(page, "home-identify-action").click();
    await get(page, "identify-screen").waitFor();
    await get(page, "identify-photo-action").click();
    await page.getByText("OpenAI may retain data", { exact: false }).waitFor();
    assert.ok((await page.locator("body").innerText()).includes("OpenAI may retain data"));
    await page.screenshot({ path: path.join(evidence, "en-intro.png"), fullPage: true });
    mode = "nutella";
    await capture();
    await get(page, "photo-send").click();
    await get(page, "photo-product").waitFor();
    await get(page, "photo-material-0-unknown").click();
    assert.ok(
      (await get(page, "photo-material-unknown-0").innerText()).includes("no sorting guidance"),
    );
    await get(page, "photo-material-unknown-0").scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(evidence, "en-material-unknown.png"), fullPage: true });
    await get(page, "photo-material-0-glass").click();
    await confirmPart(0, "glass");
    assert.ok((await get(page, "photo-part-0").innerText()).includes("Glass packaging collection"));
    await get(page, "photo-part-0").getByTestId("sorting-result-resolved").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: path.join(evidence, "en-material-corrected.png"),
      fullPage: true,
    });
    await get(page, "photo-material-0-unknown").click();
    await get(page, "photo-check-marking-0").click();
    await page.getByRole("textbox").waitFor();
    assert.equal(
      await get(page, "photo-product").count(),
      0,
      "leaving for markings must clear the estimate",
    );
    await context.close();
    console.log(
      "PASS: actual photo UI, isolated camera/API fixtures; independent unselected materials, explicit safety, Nutella plastic-to-glass correction, per-part isolation, stale-guidance clearing, unknown-to-marking recovery, sourced paper guidance, unsafe/uncertain refusal, consent, cancellation, hidden/offline/disabled/quota, FI/EN/dark/320-large/reduced-motion layout. No live provider requests.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
