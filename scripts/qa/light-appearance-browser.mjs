// Real static export; browser preference changes without touching the OS.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect as baseExpect, chromium } from "@playwright/test";
import { isContainedPath } from "../lib/contained-path.mjs";

const base = new URL(process.env.SECURITY_WEB_URL ?? "http://localhost:8099");
assert(["127.0.0.1", "localhost"].includes(base.hostname));
const output = path.resolve(process.argv[2] ?? "work/light-appearance");
assert(isContainedPath(path.resolve("work"), output));
await mkdir(output, { recursive: true });
const expect = baseExpect.configure({ timeout: 12000 });
const canvas = "rgb(245, 252, 250)";
const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const [language, width, action, week] of [
    ["fi", 390, "Katso yhteenveto", "Viimeiset 7 päivää"],
    ["en", 320, "View summary", "Last 7 days"],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      colorScheme: "dark",
      reducedMotion: "reduce",
    });
    await context.route("**/*", (route) =>
      new URL(route.request().url()).origin === base.origin ? route.continue() : route.abort(),
    );
    await context.addInitScript((lang) => {
      localStorage.setItem("@kierratysappi/language/v1", lang);
    }, language);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const surface = page.locator("#app-screen-surface:visible");
    const get = (id) => page.getByTestId(id);
    const goto = (route) => page.goto(new URL(route, base).href);
    async function verifyAppearance() {
      await expect(surface).toHaveCSS("background-color", canvas);
      await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
      await expect(page.locator("body")).toHaveCSS("background-color", canvas);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    }

    await goto("/");
    await expect(get("home-overview-action")).toHaveAccessibleName(action);
    await expect(get("home-overview-section").getByText(week, { exact: true })).toHaveCount(0);
    assert.equal(
      await page.evaluate(() => matchMedia("(prefers-color-scheme: dark)").matches),
      true,
    );
    await verifyAppearance();
    const card = get("home-overview-action");
    const cardBackground = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
    await page.emulateMedia({ colorScheme: "light" });
    await verifyAppearance();
    await expect(card).toHaveCSS("background-color", cardBackground);
    await page.emulateMedia({ colorScheme: "dark" });
    await verifyAppearance();
    await page.screenshot({ path: path.join(output, `${language}-home.png`), fullPage: true });
    await card.press("Enter");
    await expect(get("overview-activity").getByRole("heading", { name: week })).toBeVisible();
    await verifyAppearance();
    await page.screenshot({ path: path.join(output, `${language}-overview.png`), fullPage: true });

    for (const [route, marker] of [
      ["/identify", "identify-screen"],
      ["/local-photo", "network-photo-screen"],
      ["/guide", "guide-screen"],
      ["/nearby", "nearby-screen"],
      ["/settings", "settings-screen"],
      ["/manual", "manual-entry-screen"],
    ]) {
      await goto(route);
      await expect(get(marker)).toBeVisible();
      await verifyAppearance();
    }
    await get("manual-gtin-input").fill("6415600502078");
    await get("manual-submit-action").click();
    await expect(get("sorting-result-resolved")).toBeVisible();
    await verifyAppearance();
    await page.screenshot({
      path: path.join(output, `${language}-barcode-result.png`),
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    await context.close();
    console.log(
      `PASS ${language}/${width}px: nine screens, light chrome under dark preference, keyboard navigation and sourced result`,
    );
  }
} finally {
  await browser.close();
}
