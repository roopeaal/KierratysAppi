// Actual exported application. Synthetic API fixture is isolated to this QA only.
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";

const root = fs.realpathSync(process.cwd()),
  run = path.resolve(root, process.argv[2]);
const barcodeOnly = process.argv.includes("--barcode-only");
assert(run.startsWith(`${root}/work/`) && fs.realpathSync(run) === run);
const require = createRequire(import.meta.url),
  { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH);
const out = fs.realpathSync("mobile/app/dist");
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
  let file = path.resolve(out, `.${pathname === "/" ? "/index" : pathname}`);
  if (!path.extname(file)) file += ".html";
  if (
    !file.startsWith(`${out}/`) ||
    !fs.existsSync(file) ||
    !fs.lstatSync(file).isFile() ||
    fs.realpathSync(file) !== file
  ) {
    res.statusCode = 404;
    return res.end();
  }
  const mime = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".ttf": "font/ttf",
    ".woff2": "font/woff2",
    ".wav": "audio/wav",
  };
  res.setHeader("Content-Type", mime[path.extname(file)] ?? "application/octet-stream");
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  executablePath: process.env.BROWSER_EXECUTABLE_PATH,
  headless: true,
});
const evidence = [],
  errors = [];
try {
  for (const [language, colorScheme, width] of [
    ["fi", "light", 390],
    ["en", "light", 390],
    ["fi", "dark", 320],
    ["en", "dark", 320],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      colorScheme,
      reducedMotion: "reduce",
    });
    await context.addInitScript((language) => {
      if (!localStorage.getItem("@kierratysappi/language/v1"))
        localStorage.setItem("@kierratysappi/language/v1", language);
    }, language);
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    page.on("pageerror", (e) => errors.push(e.message));
    let fixture = false,
      remoteRequests = 0;
    await context.route("**/*", async (route) => {
      if (route.request().url().startsWith(base)) return route.continue();
      remoteRequests++;
      if (
        route
          .request()
          .url()
          .startsWith("https://world.openfoodfacts.org/api/v3/product/2000000000008?")
      ) {
        return route.fulfill({ status: 404, body: "" });
      }
      if (
        fixture &&
        route.request().url().includes("world.openfoodfacts.org/api/v3/product/6410405196811")
      ) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            product: {
              code: "6410405196811",
              product_name_en: "QA synthetic identity",
              product_name_fi: "QA synteettinen tuote",
              ...(fixture === "packaging"
                ? {
                    packagings: [
                      { shape: { id: "en:film" }, material: { id: "en:pp-5-polypropylene" } },
                    ],
                  }
                : {}),
            },
          }),
        });
      }
      return route.abort();
    });
    const get = (id) => page.getByTestId(id);
    async function recordUnknownMaterial(expected) {
      await get("recycle-mark-action").click();
      assert.equal(await get("recycle-confirm-action").isEnabled(), false);
      await get("recycle-material-metal").click();
      await get("recycle-confirm-action").click();
      await page.waitForFunction(
        (expected) =>
          JSON.parse(localStorage.getItem("@kierratysappi/recycling-overview/v1") ?? "null")?.recent
            .length === expected,
        expected,
      );
    }
    async function inspect(stage) {
      await page.evaluate(() => document.fonts.ready);
      const issues = await page.evaluate(() => {
        const found = [];
        if (document.documentElement.scrollWidth > innerWidth + 1) found.push("page-overflow");
        document
          .querySelectorAll(
            '[role="button"],[role="link"],[role="tab"],[role="radio"],[role="switch"]',
          )
          .forEach((el) => {
            if (el.closest('[aria-hidden="true"]')) return;
            const r = el.getBoundingClientRect();
            if (!r.width || !r.height) return;
            if (r.width < 43.9 || r.height < 43.9)
              found.push(`small:${el.getAttribute("aria-label")}`);
            if (r.left < -1 || r.right > innerWidth + 1) found.push("control-overflow");
          });
        return found;
      });
      assert.deepEqual(issues, [], `${language}/${colorScheme}/${stage}`);
      await page.screenshot({
        path: path.join(run, `${language}-${colorScheme}-${stage}.png`),
        fullPage: true,
      });
      evidence.push({ language, colorScheme, width, stage, layout: true });
    }
    if (!barcodeOnly) {
      for (const [route, marker] of [
        ["/", "home-screen"],
        ["/identify", "identify-screen"],
        ["/settings", "settings-screen"],
        ["/manual", "manual-entry-screen"],
        ["/scan", "scanner-permission-screen"],
        ["/local-photo", "network-photo-screen"],
        ["/guide", "guide-screen"],
        ["/nearby", "nearby-screen"],
        ["/overview", "overview-screen"],
        ["/result", "result-empty-screen"],
        ["/component", null],
        ["/material-code", null],
        ["/history", null],
        ["/legal", null],
        ["/feedback", null],
        ["/photo", null],
      ]) {
        await page.goto(base + route);
        if (marker) await get(marker).waitFor();
        else await page.getByRole("heading").first().waitFor();
        assert.equal(await page.evaluate(() => document.documentElement.lang), language);
        await inspect(route === "/" ? "home" : route.slice(1));
      }
      // Camera's manual entry must share the expanded barcode lookup as well.
      await page.goto(base + "/local-photo");
      await get("offline-product-manual-input").fill("6408430030309");
      await get("offline-product-manual-submit").click();
      await get("packaging-missing-result").waitFor();
      assert.match(await get("product-result-screen").innerText(), /Oivariini/);
      await inspect("camera-shared-barcode");
      await recordUnknownMaterial(1);
      // A source-backed HSY query must require a matching municipality, not guess.
      await page.goto(
        base +
          "/guide?query=" +
          encodeURIComponent(language === "fi" ? "Paistinpannu, kasari" : "Frying pan, saucepan"),
      );
      await get("sorting-region-manual").click();
      await get("sorting-region-input").fill("Vantaa");
      await get("sorting-region-092").click();
      await get("source-guide-result").waitFor();
      assert.match(
        await get("source-guide-title").innerText(),
        language === "fi" ? /Paistinpannu/ : /Frying pan/,
      );
      await page.waitForFunction(() => {
        const r = document
          .querySelector('[data-testid="source-guide-title"]')
          ?.getBoundingClientRect();
        return r && r.top >= 0 && r.bottom < innerHeight - 160;
      });
      await inspect("hsy-offline-source");
      await recordUnknownMaterial(2);
      await page.goto(base + "/guide?material=plastic");
      await get("recycle-mark-action").click();
      assert.equal(
        await get("recycle-material-plastic").count(),
        0,
        "Explicit general material needs no second picker",
      );
      await get("recycle-confirm-action").click();
      await page.waitForFunction(
        () =>
          JSON.parse(localStorage.getItem("@kierratysappi/recycling-overview/v1") ?? "null")?.counts
            .plastic === 1,
      );
      await page.goto(
        base +
          "/guide?query=" +
          encodeURIComponent(language === "fi" ? "Paistinpannu, kasari" : "Frying pan, saucepan"),
      );
      await page.reload();
      // Region intentionally transient across full relaunch; language is not.
      await get("sorting-region-manual").waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.lang), language);
    }
    await page.goto(base + "/");
    await get("home-identify-action").click();
    await get("identify-manual-action").click();
    await get("manual-gtin-input").fill("123");
    await get("manual-submit-action").click();
    assert.equal(await get("manual-entry-screen").count(), 1);
    const before = remoteRequests;
    // All external requests are aborted; keep the loopback server available for
    // web-only lazy chunks. Native assets are packaged, unlike this web host.
    await get("manual-gtin-input").fill("6415600502078");
    await get("manual-submit-action").click();
    await get("sorting-result-resolved").waitFor();
    assert.match(await get("product-result-screen").innerText(), /Coca-Cola Zero Sugar/);
    await get("product-result-screen")
      .getByText(language === "fi" ? "Muovipullo" : "Plastic bottle", { exact: true })
      .waitFor();
    assert.match(
      await get("sorting-result-resolved").innerText(),
      language === "fi" ? /Kaupan palautusautomaatti/ : /Retail return point/,
    );
    await get("product-result-screen").getByRole("link", { name: "S-kaupat" }).waitFor();
    assert.equal(remoteRequests, before, "reviewed packaging must not make network requests");
    await inspect("reviewed-deposit-offline");
    for (const [code, expected] of [
      ["6412000034840", ["plastic", "plastic", "carton"]],
      ["6412000030149", ["metal", "carton"]],
      ["6412000030507", ["metal", "carton"]],
    ]) {
      const labels =
        language === "fi"
          ? {
              plastic: "Muovipakkausten keräys",
              carton: "Kartonkipakkausten keräys",
              metal: "Metallinkeräys",
            }
          : {
              plastic: "Plastic packaging collection",
              carton: "Carton packaging collection",
              metal: "Metal collection",
            };
      const beforeReviewed = remoteRequests;
      await page.goto(base + "/manual");
      await get("manual-gtin-input").fill(code);
      await get("manual-submit-action").click();
      const parts = get("sorting-result-resolved");
      await parts.first().waitFor();
      assert.equal(await parts.count(), expected.length);
      for (const [index, material] of expected.entries()) {
        assert.match(await parts.nth(index).innerText(), new RegExp(labels[material], "u"));
      }
      assert.match(
        await get("reviewed-packaging-partial").innerText(),
        language === "fi" ? /vain tässä/u : /only the parts/u,
      );
      await get("product-result-screen")
        .getByRole("link", { name: "Open Food Facts contributors" })
        .waitFor();
      assert.equal(remoteRequests, beforeReviewed, "reviewed parts resolve without a provider");
      await inspect(`reviewed-pack-${code}`);
    }
    for (const [code, resolved, unknown] of [
      ["3046920029759", 2, 0],
      ["6408430342099", 2, 1],
      ["3267031070731", 0, 2],
    ]) {
      const beforeCommunity = remoteRequests;
      await page.goto(base + "/manual");
      await get("manual-gtin-input").fill(code);
      await get("manual-submit-action").click();
      const notice = get("community-packaging-partial");
      await notice.waitFor();
      assert.match(
        await notice.innerText(),
        language === "fi"
          ? /Yhteisön|yhteisön.*ei.*varmennettu/u
          : /community-contributed and unverified/u,
      );
      assert.equal(await get("reviewed-packaging-partial").count(), 0);
      assert.equal(await get("sorting-result-resolved").count(), resolved);
      assert.equal(await get("sorting-result-unknown").count(), unknown);
      if (unknown) await get("result-manual-component-action").waitFor();
      await get("product-result-screen")
        .getByRole("link", { name: "Open Food Facts contributors" })
        .waitFor();
      assert.equal(remoteRequests, beforeCommunity, "bundled data makes no provider request");
      await inspect(`community-pack-${code}`);
    }
    await page.goto(base + "/manual");
    await get("manual-gtin-input").fill("2000000000008");
    await get("manual-submit-action").click();
    await get("result-not-found-screen").waitFor();
    assert.equal(await get("sorting-result-resolved").count(), 0);
    await get("result-secondary-action").click();
    await get("guide-screen").waitFor();
    await inspect("unrecognized-code-manual-guide");
    await page.goto(base + "/manual");
    await get("manual-gtin-input").fill("0643435694897");
    await get("manual-submit-action").click();
    await get("packaging-missing-result").waitFor();
    assert.match(await get("product-result-screen").innerText(), /Pavé gourmand/);
    await inspect("bundled-barcode-offline");
    await page.goto(base + "/manual");
    fixture = "identity";
    await get("manual-gtin-input").fill("6410405196811");
    await get("manual-submit-action").click();
    await get("packaging-missing-result").waitFor();
    assert.match(
      await get("product-result-screen").innerText(),
      /QA (synthetic identity|synteettinen tuote)/,
    );
    await page.waitForFunction(
      () =>
        JSON.parse(localStorage.getItem("@kierratysappi/offline-lookup-cache/v1") ?? "[]").length >
        0,
    );
    fixture = false;
    await page.goto(base + "/manual");
    await get("manual-gtin-input").fill("6410405196811");
    await get("manual-submit-action").click();
    await get("packaging-missing-result").waitFor();
    await inspect("cached-fixture-offline");
    fixture = "packaging";
    await page.goto(base + "/manual");
    await get("manual-gtin-input").fill("6410405196811");
    await get("manual-submit-action").click();
    await get("sorting-result-resolved").waitFor();
    await inspect("cached-identity-upgraded");
    await page.waitForFunction(() =>
      JSON.parse(localStorage.getItem("@kierratysappi/offline-lookup-cache/v1") ?? "[]").some(
        (e) => e.result.status === "resolved",
      ),
    );
    fixture = false;
    await page.goto(base + "/manual");
    await get("manual-gtin-input").fill("6410405196811");
    await get("manual-submit-action").click();
    await get("sorting-result-resolved").waitFor();
    await inspect("cached-packaging-offline");
    if (barcodeOnly) {
      await context.close();
      console.log(
        `PASS ${language}/${colorScheme}: offline deposit, unknown code → manual guide, identity upgrade fixture, saved guidance`,
      );
      continue;
    }
    await page.goto(base + "/overview");
    await get("overview-material-metal").click();
    await get("overview-quantity-input").fill("2");
    await get("overview-add-action").click();
    await page.waitForFunction(
      () => document.querySelector('[data-testid="overview-total"]')?.textContent === "5",
    );
    await inspect("overview-saved");
    await page.goto(base + "/settings");
    const next = language === "fi" ? "en" : "fi";
    await get(`settings-language-${next}`).click();
    await page.waitForFunction(
      (next) => localStorage.getItem("@kierratysappi/language/v1") === next,
      next,
    );
    await page.reload();
    await get("settings-screen").waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.lang), next);
    await page.goto(base + "/legal");
    await get("privacy-delete-action").click();
    await get("privacy-delete-confirm-action").click();
    await get("privacy-delete-confirm-panel").waitFor({ state: "detached" });
    await page.waitForFunction(
      (next) => localStorage.getItem("@kierratysappi/language/v1") === next,
      next,
    );
    assert.equal(
      await page.evaluate(() => localStorage.getItem("@kierratysappi/offline-lookup-cache/v1")),
      null,
    );
    await page.reload();
    await get("privacy-delete-action").waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.lang), next);
    evidence.push({
      language,
      colorScheme,
      localeSurvivesRelaunchAndDeletion: true,
      cacheDeleted: true,
      syntheticFixtureOnly: true,
    });
    await context.close();
    console.log(
      `PASS ${language}/${colorScheme}: routes, source guide, offline barcode/cache, save, persistent language/delete`,
    );
  }
  assert.deepEqual(errors, []);
} finally {
  fs.writeFileSync(
    path.join(run, "browser-evidence.json"),
    JSON.stringify({ evidence, errors }, null, 2),
  );
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
