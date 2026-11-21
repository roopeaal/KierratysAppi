// Exercise press feedback on the actual Expo web bundle using a local preview.
// Uses only fake geolocation and an isolated browser context, never user data.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";

const base = new URL(process.env.APP_QA_URL ?? "http://127.0.0.1:8128");
assert.ok(["http:", "https:"].includes(base.protocol));
assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(base.hostname));
const out = resolve(process.env.APP_QA_EVIDENCE_DIR ?? "work/interaction-polish");
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const results = {};

try {
  for (const theme of [
    { name: "light", colorScheme: "light", reducedMotion: "no-preference", width: 390 },
    { name: "dark-reduced", colorScheme: "dark", reducedMotion: "reduce", width: 320 },
  ]) {
    const { name, colorScheme, reducedMotion, width } = theme;
    const reduced = reducedMotion === "reduce";
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      colorScheme,
      reducedMotion,
      hasTouch: true,
      deviceScaleFactor: 1,
      isMobile: true,
      locale: "fi-FI",
      geolocation: { latitude: 60.1699, longitude: 24.9384, accuracy: 25 },
      permissions: ["geolocation"],
    });
    await context.route("**/*", (route) => {
      return new URL(route.request().url()).origin === base.origin
        ? route.continue()
        : route.abort();
    });
    await context.addInitScript(() => {
      window.qaStampAnimations = [];
      const animate = Element.prototype.animate;
      Element.prototype.animate = function (...args) {
        const id = this.getAttribute("data-testid");
        if (id?.startsWith("recycle-stamp-")) {
          window.qaStampAnimations.push({
            id,
            duration: typeof args[1] === "number" ? args[1] : args[1]?.duration,
          });
        }
        return animate.apply(this, args);
      };
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    const errors = [];
    const heldControls = [];
    page.on("pageerror", (error) => errors.push(error.message));

    const route = async (routePath, readyId) => {
      await page.goto(new URL(routePath, base).href);
      await expect(page.getByTestId(readyId)).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
    };
    const getScale = (control) => {
      return control.evaluate((node) => {
        const transform = getComputedStyle(node).transform;
        return transform === "none" ? 1 : new DOMMatrixReadOnly(transform).a;
      });
    };
    const noScaleInFrames = async (control, description) => {
      const unchanged = await control.evaluate(async (node) => {
        for (let i = 0; i < 12; i++) {
          await new Promise(requestAnimationFrame);
          const transform = getComputedStyle(node).transform;
          if (transform !== "none" && !new DOMMatrixReadOnly(transform).isIdentity) return false;
        }
        return true;
      });
      assert.ok(unchanged, description);
    };
    const touch = async (id, ending = "touchCancel", shouldReduce = reduced) => {
      const control = page.getByTestId(id);
      await control.scrollIntoViewIfNeeded();
      const bounds = await control.boundingBox();
      assert.ok(bounds && bounds.width >= 44 && bounds.height >= 44, `${id}: usable hit target`);
      const { x, y, width: w, height } = bounds;
      const pathname = new URL(page.url()).pathname;
      const pages = context.pages().length;
      assert.equal(await getScale(control), 1, `${id}: at rest`);
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: x + w / 2, y: y + height / 2 }],
      });
      try {
        if (shouldReduce) {
          await noScaleInFrames(control, `${id}: reduced motion stays at identity`);
        } else {
          await expect
            .poll(() => getScale(control), {
              timeout: 1000,
              message: `${id}: touch gives feedback`,
            })
            .toBeLessThan(0.995);
          const scale = await getScale(control);
          assert.ok(scale >= 0.95, `${id}: press feedback stays subtle, got ${scale}`);
        }
        assert.equal(new URL(page.url()).pathname, pathname, `${id}: no action on touch-down`);
      } finally {
        await cdp.send("Input.dispatchTouchEvent", { type: ending, touchPoints: [] });
      }
      if (ending === "touchCancel") {
        await expect
          .poll(() => getScale(control), { timeout: 1500, message: `${id}: restored after cancel` })
          .toBe(1);
        assert.equal(new URL(page.url()).pathname, pathname, `${id}: cancelled touch must not act`);
        assert.equal(context.pages().length, pages, `${id}: cancelled touch must not open a tab`);
      }
      heldControls.push(id);
    };

    await route("/", "home-search-input");
    await touch("home-identify-action");
    await touch("home-query-carton");
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${out}/${name}-home.png` });
    await touch("tab-identify", "touchEnd");
    await expect(page.getByTestId("identify-screen")).toBeVisible();
    await touch("identify-manual-action");
    await page.screenshot({ path: `${out}/${name}-identify.png` });

    await route("/nearby", "nearby-screen");
    await touch("nearby-find");
    const privacy = page.getByTestId("nearby-privacy-toggle");
    await expect(privacy).toHaveAttribute("aria-expanded", "false");
    await privacy.focus();
    await expect(privacy).toBeFocused();
    await page.keyboard.down("Enter");
    try {
      await noScaleInFrames(privacy, "Keyboard activation does not scale");
    } finally {
      await page.keyboard.up("Enter");
    }
    await expect(privacy).toHaveAttribute("aria-expanded", "true");
    await touch("nearby-find", "touchEnd");
    await expect(page.getByTestId("nearby-result")).toBeVisible();
    await touch("nearby-filter-metal");
    await touch("nearby-map-0");

    const save = async (cardIndex, byKeyboard) => {
      await page.getByTestId(`nearby-details-toggle-${cardIndex}`).tap();
      const details = page.getByTestId(`nearby-details-${cardIndex}`);
      const mark = details.getByTestId("recycle-mark-action");
      await expect(mark).toBeEnabled();
      await mark.tap();
      await expect(details.getByTestId("recycle-confirm-action")).toBeDisabled();
      await details.getByTestId("recycle-material-metal").tap();
      const confirm = details.getByTestId("recycle-confirm-action");
      const previousAnimations = await page.evaluate(() => window.qaStampAnimations.length);
      if (byKeyboard) await confirm.press("Enter");
      else await confirm.tap();
      const stamp = details.getByTestId("recycle-saved-stamp");
      await expect(stamp).toBeVisible();
      await expect(stamp).toHaveAttribute("aria-hidden", "true");
      await expect(stamp.getByTestId("category-icon-metal")).toBeVisible();
      await expect(details.getByText("Tallennettu yhteenvetoon · Metalli")).toBeVisible();
      const created = await page.evaluate(
        (before) => window.qaStampAnimations.slice(before),
        previousAnimations,
      );
      if (reduced || byKeyboard) {
        assert.deepEqual(created, [], "Reduced-motion and keyboard saves are static");
      } else {
        assert.ok(created.some(({ id }) => id === "recycle-stamp-material"));
        assert.ok(created.every(({ duration }) => duration > 0 && duration <= 300));
        await stamp.evaluate((node) =>
          Promise.all(
            node
              .getAnimations({ subtree: true })
              .map((animation) => animation.finished.catch(() => {})),
          ),
        );
      }
      return created;
    };
    const saveMotion = await save(0, false);
    await page.getByTestId("recycle-saved").screenshot({ path: `${out}/${name}-receipt.png` });
    if (!reduced) await save(1, true);
    const records = reduced ? 1 : 2;
    await page.waitForFunction(
      (expected) =>
        JSON.parse(localStorage.getItem("@kierratysappi/recycling-overview/v1") ?? "null")?.counts
          .metal === expected,
      records,
    );
    await route("/overview", "overview-activity");
    await expect(page.getByTestId("overview-activity-total")).toContainText(String(records));
    await page.getByTestId("overview-activity").screenshot({ path: `${out}/${name}-activity.png` });

    await route("/settings", "settings-screen");
    await touch("settings-language-en", "touchEnd");
    await expect(page.getByTestId("settings-language-en")).toHaveAttribute("aria-checked", "true");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await touch("settings-history-action");
    if (!reduced) {
      const transform = () =>
        page
          .getByTestId("settings-history-action")
          .evaluate((node) => getComputedStyle(node).transform);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect.poll(transform).toBe("none");
      await touch("settings-history-action", "touchCancel", true);
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await expect.poll(transform).not.toBe("none");
      await touch("settings-history-action");
    }
    assert.deepEqual(errors, []);
    results[name] = { heldControls, keyboardDisclosed: true, saveMotion, pageErrors: errors };
    await context.close();
  }
  await writeFile(`${out}/results.json`, `${JSON.stringify(results, null, 2)}\n`);
  console.log("Interaction polish browser QA:", JSON.stringify(results));
} finally {
  await browser.close();
}
