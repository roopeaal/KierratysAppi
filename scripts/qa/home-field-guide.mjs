// Run against a local Expo web development server. No camera or real location.
import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const base = process.env.APP_QA_URL ?? "http://localhost:8098";
const dir =
  process.env.APP_QA_EVIDENCE_DIR ??
  (process.env.MATERIAL_ATLAS_QA ? "work/material-atlas/home" : "work/home-review");
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    locale: "fi-FI",
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    // The navigation check must not read the Mac's real location.
    navigator.geolocation.getCurrentPosition = (_success, error) => error?.({ code: 1 });
    navigator.geolocation.watchPosition = (_success, error) => {
      error?.({ code: 1 });
      return 0;
    };
  });
  const home = async () => {
    await page.goto(base);
    await page.getByTestId("home-search-input").waitFor();
    await page.evaluate(() => document.fonts.ready);
  };
  const shortcuts = ["nearby", "overview", "history"];
  const cardFrame = (card) =>
    card.evaluate((element) => {
      const style = getComputedStyle(element);
      return [style.borderTopLeftRadius, style.borderTopColor, style.borderTopWidth];
    });
  const checkOverview = async (title, label, detail) => {
    assert.equal(await page.getByTestId("home-manual-action").count(), 0);
    const section = page.getByTestId("home-overview-section");
    const heading = section.getByRole("heading", { name: title, exact: true });
    await heading.waitFor();
    const overview = section.getByRole("button", { name: label, exact: true });
    await overview.getByText(detail, { exact: true }).waitFor();
    const [tile, nearby, guide] = await Promise.all([
      overview.boundingBox(),
      page.getByTestId("home-nearby-action").boundingBox(),
      page.getByTestId("home-guide-action").boundingBox(),
    ]);
    assert.ok(tile && nearby && guide && tile.height >= 78);
    assert.ok(Math.abs(tile.x - nearby.x) < 1);
    assert.ok(Math.abs(tile.x + tile.width - (guide.x + guide.width)) < 1);
    if (guide.y > nearby.y + 1) {
      assert.ok(Math.abs(guide.width - nearby.width) < 1, "Stacked cards share the full width");
    }
    assert.deepEqual(
      await cardFrame(overview),
      await cardFrame(page.getByTestId("home-nearby-action")),
    );
    return overview;
  };
  const aboveTabs = async (includeQueries) => {
    const bar = await page.getByTestId("bottom-navigation").boundingBox();
    assert.ok(bar);
    for (const id of [
      "home-search-input",
      "home-identify-action",
      "home-guide-action",
      ...(includeQueries
        ? ["plastic", "carton", "battery", "electronics"].map((name) => `home-query-${name}`)
        : []),
    ]) {
      const box = await page.getByTestId(id).boundingBox();
      assert.ok(
        box && box.y >= 0 && box.y + box.height <= bar.y + 1,
        id + " visible without scrolling",
      );
      assert.ok(box.width >= 44 && box.height >= 44, id + " retains its touch target");
    }
  };
  await home();
  await page.getByRole("heading", { name: "Mitä haluat kierrättää tänään?" }).waitFor();
  await page.waitForFunction(() => Array.from(document.images).every((i) => i.complete));
  const hero = page.getByTestId("home-landscape");
  assert.equal(await hero.getAttribute("aria-hidden"), "true");
  assert.ok(await hero.locator("img").evaluate((img) => img.complete && img.naturalWidth > 0));
  const [landscape, canvas] = await Promise.all([
    hero.boundingBox(),
    page.getByTestId("home-canvas").boundingBox(),
  ]);
  assert.ok(landscape && canvas && Math.abs(landscape.width - canvas.width) < 1);
  await page.getByTestId("home-corner-motto").waitFor();
  await page.getByTestId("photo-card-backdrop").waitFor();
  await aboveTabs(true);
  await checkOverview("Yhteenveto", "Katso yhteenveto", "Kierrätysmerkinnät ja materiaalit");
  const guideTitle = await page
    .getByTestId("home-guide-action")
    .getByText("Lajitteluohjeet", { exact: true })
    .boundingBox();
  assert.ok(
    guideTitle && guideTitle.height <= 22,
    "Finnish guide title stays on one line at 390px",
  );
  const chipTint = (id) =>
    page.getByTestId(id).evaluate((element) => getComputedStyle(element).backgroundColor);
  await page.getByTestId("home-search-input").hover();
  assert.equal(await chipTint("home-query-plastic"), "rgb(250, 237, 197)");
  assert.equal(await chipTint("home-query-carton"), "rgb(225, 238, 249)");
  for (const [chip, icon] of [
    ["plastic", "plastic"],
    ["carton", "carton"],
    ["battery", "batteries"],
    ["electronics", "electronics"],
  ]) {
    const art = page.getByTestId(`home-query-${chip}`).getByTestId(`category-icon-${icon}`);
    assert.equal(await art.getAttribute("aria-hidden"), "true");
    await art.locator("img").evaluate((image) => image.decode());
  }
  await page
    .getByTestId("home-query-battery")
    .locator("..")
    .screenshot({ path: dir + "/home-categories.png" });
  const line = await page.getByTestId("home-query-plastic").boundingBox();
  const lastChip = await page.getByTestId("home-query-electronics").boundingBox();
  assert.ok(line && lastChip && Math.abs(line.y - lastChip.y) < 1, "390px FI fits one chip row");
  await page.screenshot({ path: dir + "/after.png" });
  await page.getByTestId("home-overview-section").screenshot({ path: `${dir}/overview-fi.png` });
  for (const [chip, query, result] of [
    ["plastic", "muovipullo", "guide-item-results"],
    ["battery", "paristot", "guide-item-results"],
    ["carton", "pahvi", "guide-section-carton"],
    ["electronics", "elektroniikka", "guide-item-results"],
  ]) {
    await page.getByTestId(`home-query-${chip}`).click();
    await page.getByTestId(result).first().waitFor();
    assert.equal(new URL(page.url()).searchParams.get("query"), query);
    await home();
  }
  await page.getByTestId("home-search-input").fill("kaukosäädin");
  await page.getByTestId("home-search-input").press("Enter");
  await page.getByText("Sähkölaitteiden keräys (SER)", { exact: true }).first().waitFor();
  const answer = page.getByTestId("object-sorting-flow");
  await answer
    .getByTestId("category-icon-electronics")
    .locator("img")
    .evaluate((image) => image.decode());
  await page.screenshot({ path: dir + "/object-category.png" });
  for (const [id, path] of [
    ["identify-action", "identify"],
    ["scan-action", "scan"],
    ["guide-action", "guide"],
  ]) {
    console.log("Checking", id);
    await home();
    await page.getByTestId("home-" + id).click();
    await page.waitForURL((url) => url.pathname === "/" + path);
  }
  await home();
  await page.route("**/*", async (route) => {
    if (new URL(route.request().url()).origin === new URL(base).origin) await route.continue();
    else await route.abort();
  });
  for (const name of shortcuts) {
    await home();
    await page.getByTestId(`home-${name}-action`).click();
    await page.waitForURL((url) => url.pathname === "/" + name);
  }
  await home();
  await page.getByTestId("tab-nearby").click();
  await page.getByTestId("nearby-screen").waitFor();
  await page.getByTestId("tab-identify").click();
  await page.getByTestId("identify-manual-action").click();
  await page.getByTestId("manual-gtin-input").waitFor();
  for (const [id, path] of [
    ["overview", "overview"],
    ["history", "history"],
    ["legal", "legal"],
  ]) {
    await home();
    await page.getByTestId("tab-settings").click();
    await page.getByTestId(`settings-${id}-action`).click();
    await page.waitForURL((url) => url.pathname === "/" + path);
  }
  await home();
  await page.getByTestId("tab-settings").click();
  await page.getByTestId("settings-language-en").click();
  await page.emulateMedia({ colorScheme: "dark" });
  await page.setViewportSize({ width: 320, height: 690 });
  await home();
  await page.getByRole("heading", { name: "What would you like to recycle today?" }).waitFor();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await aboveTabs(false);
  assert.equal(await page.getByTestId("home-corner-motto").count(), 0);
  await page.screenshot({ path: dir + "/narrow-en.png" });
  const overviewEn = await checkOverview(
    "Overview",
    "View summary",
    "Recycling entries and materials",
  );
  await page
    .getByTestId("home-overview-section")
    .screenshot({ path: `${dir}/overview-en-dark.png` });
  await overviewEn.press("Enter");
  await page.waitForURL((url) => url.pathname === "/overview");
  assert.deepEqual(errors, []);
  const directory = JSON.parse(
    await readFile(
      new URL("../../mobile/app/assets/data/finland-recycling.json", import.meta.url),
      "utf8",
    ),
  );
  const retrieved = new Date(directory.retrievedAt);
  const staleTime = new Date(retrieved.getTime() + 70 * 86_400_000);
  const checkHomeSource = async (homePage, detailsPattern) => {
    const section = homePage.getByTestId("home-nearby-section");
    const source = section.getByRole("link", { name: "© OpenStreetMap", exact: true });
    await source.waitFor();
    assert.equal(await source.textContent(), "© OpenStreetMap");
    const box = await source.boundingBox();
    assert.ok(box && box.width >= 44 && box.height >= 44);
    const action = await section.getByTestId("home-map-action").boundingBox();
    const firstPoint = section.getByTestId("home-nearby-result-0");
    const point = await firstPoint.boundingBox();
    assert.ok(
      action && point && Math.abs(box.y + box.height / 2 - (action.y + action.height / 2)) < 2,
    );
    assert.ok(box.y + box.height <= point.y + 1, "Attribution shares the header, not a result row");
    assert.deepEqual(
      await cardFrame(firstPoint),
      await cardFrame(homePage.getByTestId("home-overview-action")),
    );
    assert.doesNotMatch(await section.innerText(), detailsPattern);
    return source;
  };
  const checkLocationSource = async (locationPage, locale, dateLabel, staleText) => {
    const location = locationPage.getByTestId("nearby-screen");
    await location
      .getByText(`${dateLabel}: ${retrieved.toLocaleDateString(locale)}`, { exact: true })
      .waitFor();
    await location.getByText(staleText, { exact: true }).waitFor();
    await location.getByRole("link", { name: /OpenStreetMap contributors · ODbL 1\.0/ }).waitFor();
  };
  const realData = await browser.newContext({
    viewport: { width: 390, height: 920 },
    permissions: ["geolocation"],
    geolocation: { latitude: 60.1699, longitude: 24.9384, accuracy: 10 },
  });
  await realData.addInitScript(() => {
    window.qaLocationCalls = 0;
    window.qaLocationPrompts = 0;
    window.qaMapUrl = null;
    window.open = (url) => {
      window.qaMapUrl = url;
      return null;
    };
    const watch = navigator.geolocation.watchPosition.bind(navigator.geolocation);
    // Keep browser-provided fixture coordinates but timestamp them with the test clock.
    const timestamped = (receive) => (fix) =>
      receive({ coords: fix.coords, timestamp: Date.now() });
    navigator.geolocation.watchPosition = (receive, ...options) => {
      window.qaLocationCalls++;
      return watch(timestamped(receive), ...options);
    };
    const position = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
    navigator.geolocation.getCurrentPosition = (receive, ...options) => {
      window.qaLocationPrompts++;
      return position(timestamped(receive), ...options);
    };
    localStorage.setItem("@kierratysappi/history-enabled/v1", "true");
    localStorage.setItem(
      "@kierratysappi/history/v1",
      JSON.stringify([
        {
          gtin: "1234567890128",
          productName: "QA saved item",
          scannedAt: "2026-11-18T12:00:00Z",
          resultStatus: "packaging_missing",
        },
      ]),
    );
  });
  const withData = await realData.newPage();
  await withData.clock.setFixedTime(staleTime);
  await withData.goto(base);
  await withData.getByTestId("home-recent-1234567890128").waitFor();
  await withData.getByTestId("home-recent-art-neutral").waitFor();
  // UI fixtures only: update the opt-in history to exercise the reference pair.
  await withData.evaluate(() => {
    localStorage.setItem(
      "@kierratysappi/history/v1",
      JSON.stringify([
        {
          gtin: "1234567890128",
          productName: "Kahvipaketti",
          scannedAt: "2026-11-18T12:00:00Z",
          resultStatus: "resolved",
          artwork: "bag",
        },
        {
          gtin: "5449000000996",
          productName: "Juomapullo",
          scannedAt: "2026-11-18T11:00:00Z",
          resultStatus: "packaging_missing",
          artwork: "bottle",
        },
      ]),
    );
  });
  await withData.getByTestId("tab-settings").click();
  await withData.getByTestId("tab-home").click();
  const recent = withData.getByTestId("home-recent-section");
  for (const [name, art] of [
    ["Kahvipaketti", "bag"],
    ["Juomapullo", "bottle"],
  ]) {
    const tile = recent.getByRole("button", { name, exact: true });
    const image = tile.getByTestId(`home-recent-art-${art}`);
    await image.waitFor();
    assert.equal(await image.getAttribute("aria-hidden"), "true");
    await image.locator("img").evaluate((img) => img.decode());
    const bounds = await tile.boundingBox();
    assert.ok(bounds && bounds.height >= 44 && bounds.width >= 44);
  }
  await recent.screenshot({ path: `${dir}/recent-products.png` });
  await withData.setViewportSize({ width: 320, height: 700 });
  await withData.waitForFunction(() => {
    const bag = document.querySelector('[data-testid="home-recent-art-bag"]');
    const bottle = document.querySelector('[data-testid="home-recent-art-bottle"]');
    const a = bag?.getBoundingClientRect();
    const b = bottle?.getBoundingClientRect();
    return a && b && a.bottom < b.top && Math.abs(a.x - b.x) < 1;
  });
  await withData.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await recent.screenshot({ path: `${dir}/recent-products-dark.png` });
  await withData.emulateMedia({ colorScheme: "light" });
  await withData.setViewportSize({ width: 390, height: 920 });
  assert.equal(await withData.evaluate(() => window.qaLocationCalls), 0, "No automatic GPS");
  assert.equal(await withData.locator('[data-testid^="point-photo-"]').count(), 0);
  await withData.getByTestId("home-nearby-preview").click();
  const homeSource = await checkHomeSource(withData, /Aineisto haettu|yli 30 päivää|ODbL/);
  assert.equal(await withData.locator('[data-testid^="home-nearby-result-"]').count(), 2);
  assert.equal(await withData.evaluate(() => window.qaLocationCalls), 1);
  for (const row of await withData.locator('[data-testid^="home-nearby-result-"]').all()) {
    await row.getByText("Esimerkkikuva", { exact: true }).waitFor();
    const thumbnail = row.locator('[data-testid^="point-photo-"]');
    assert.equal(await thumbnail.getAttribute("aria-hidden"), "true");
    assert.ok(
      await thumbnail.locator("img").evaluate(async (img) => {
        await img.decode();
        return img.naturalWidth > 0;
      }),
    );
  }
  await withData.getByTestId("home-nearby-source").scrollIntoViewIfNeeded();
  await withData.screenshot({ path: dir + "/with-qa-data.png" });
  await withData.getByTestId("home-nearby-section").screenshot({ path: dir + "/point-images.png" });
  await homeSource.click();
  assert.equal(
    await withData.evaluate(() => window.qaMapUrl),
    "https://www.openstreetmap.org/copyright",
    "Home attribution opens the data licence, without location",
  );
  await withData.getByTestId("home-map-action").click();
  await withData.getByTestId("nearby-point-0").waitFor();
  await checkLocationSource(
    withData,
    "fi-FI",
    "Aineisto haettu",
    "Aineisto on yli 30 päivää vanha. Tarkista pisteen ajantasaiset tiedot ennen lähtöä.",
  );
  assert.equal(
    await withData.evaluate(() => window.qaLocationCalls),
    1,
    "Location reuses the Home fix",
  );
  await withData.getByTestId("tab-home").click();
  await withData.getByTestId("home-nearby-source").waitFor();
  assert.equal(await withData.evaluate(() => window.qaLocationCalls), 1, "Home reuses a fresh fix");
  assert.equal(
    await withData.evaluate(() => window.qaLocationPrompts),
    0,
    "Never ask again after a grant",
  );
  assert.equal(
    await withData.evaluate(() => localStorage.getItem("@kierratysappi/automatic-location/v1")),
    "true",
  );
  const searchRemote = async () => {
    const input = withData.getByTestId("home-search-input");
    await input.fill("kaukosäädin");
    await input.press("Enter");
    return withData.getByTestId("sorting-region-current");
  };
  await searchRemote();
  await withData
    .getByTestId("sorting-region-confirm")
    .getByText("Vahvista kunta: Helsinki")
    .waitFor();
  // Refresh at an independently verified in-municipality fixture, away from the coarse coastline.
  await realData.setGeolocation({ latitude: 60.24, longitude: 24.92, accuracy: 20 });
  await withData.getByTestId("tab-nearby").click();
  await withData.getByTestId("nearby-point-0").waitFor();
  await withData.getByTestId("nearby-find").click();
  await withData.waitForFunction(() => window.qaLocationCalls === 2);
  await withData.getByTestId("nearby-point-0").waitFor();
  await withData.getByTestId("tab-home").click();
  await withData.getByTestId("home-nearby-source").waitFor();
  await searchRemote();
  await withData.getByText("Helsinki · HSY", { exact: true }).waitFor();
  await withData.getByTestId("sorting-region-locate").click();
  await withData.getByText("Helsinki · HSY", { exact: true }).waitFor();
  assert.equal(
    await withData.evaluate(() => window.qaLocationCalls),
    2,
    "Region reuses the fix too",
  );
  await withData.getByTestId("sorting-region-manual").click();
  await withData.getByTestId("sorting-region-input").fill("Turku");
  await withData.getByTestId("sorting-region-853").click();
  await withData.getByTestId("tab-home").click();
  await withData.getByTestId("home-nearby-source").waitFor();
  const region = await searchRemote();
  assert.match(
    await region.innerText(),
    /Turku/,
    "Returning Home cannot overwrite a manual municipality",
  );
  const batteries = directory.points.find(
    (point) =>
      point.reportedMaterials.length === 1 &&
      point.reportedMaterials[0] === "batteries" &&
      directory.points.filter(
        (other) =>
          other.coordinates.latitude === point.coordinates.latitude &&
          other.coordinates.longitude === point.coordinates.longitude,
      ).length === 1,
  );
  assert.ok(batteries, "An isolated public battery-only point is needed for this test");
  const { latitude, longitude } = batteries.coordinates;
  await realData.setGeolocation({ latitude: latitude + 0.000001, longitude, accuracy: 10 });
  await withData.goto(base);
  const batteryPicture = withData
    .getByTestId("home-nearby-result-0")
    .getByTestId("point-photo-batteries");
  await batteryPicture.waitFor();
  await batteryPicture.locator("img").evaluate((img) => img.decode());
  await withData
    .getByTestId("home-nearby-section")
    .screenshot({ path: dir + "/battery-images.png" });
  await batteryPicture.click();
  assert.equal(
    await withData.evaluate(() => window.qaMapUrl),
    `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`,
    "Clicking the pictured row still opens the public point, without the user's location",
  );
  assert.equal(
    await withData.evaluate(() => window.qaLocationCalls),
    1,
    "Saved opt-in works after reload",
  );
  const visibility = (state) => {
    Object.defineProperty(document, "visibilityState", { configurable: true, value: state });
    document.dispatchEvent(new Event("visibilitychange"));
  };
  await withData.evaluate(visibility, "hidden");
  await withData.getByTestId("home-nearby-source").waitFor({ state: "hidden" });
  assert.equal(await withData.evaluate(() => window.qaLocationCalls), 1, "No background reads");
  await withData.evaluate(visibility, "visible");
  await withData.getByTestId("home-nearby-source").waitFor();
  assert.equal(
    await withData.evaluate(() => window.qaLocationCalls),
    2,
    "Foreground reacquires after clearing RAM",
  );
  await realData.clearPermissions();
  await withData.getByTestId("home-nearby-source").waitFor({ state: "hidden" });
  await withData.reload();
  await withData
    .getByText(
      "Sijaintilupaa ei annettu. Yritä uudelleen tai salli sijainti sovelluksen asetuksissa.",
      { exact: true },
    )
    .waitFor();
  assert.equal(
    await withData.evaluate(() => window.qaLocationCalls),
    0,
    "Revocation prevents reads",
  );
  assert.equal(
    await withData.evaluate(() => window.qaLocationPrompts),
    0,
    "Automatic mode never asks for a new grant",
  );
  await withData.getByTestId("tab-settings").click();
  await withData.getByTestId("settings-location-off").click();
  await withData.waitForFunction(
    () => localStorage.getItem("@kierratysappi/automatic-location/v1") === null,
  );
  await realData.grantPermissions(["geolocation"]);
  await withData.getByTestId("tab-home").click();
  await withData.getByTestId("home-nearby-preview").waitFor();
  assert.equal(await withData.locator('[data-testid^="home-nearby-result-"]').count(), 0);
  assert.equal(
    await withData.evaluate(() => window.qaLocationCalls),
    0,
    "Opt-out prevents new reads even with OS permission",
  );
  await withData.goto(base + "/guide?query=" + encodeURIComponent("Paistinpannu, kasari"));
  await withData.getByTestId("sorting-region-manual").click();
  await withData.getByTestId("sorting-region-input").fill("Vantaa");
  await withData.getByTestId("sorting-region-092").click();
  const source = withData.getByTestId("source-guide-result");
  const sourceArtwork = source.getByTestId("category-icon-metal");
  assert.equal(await sourceArtwork.getAttribute("aria-hidden"), "true");
  await sourceArtwork.locator("img").evaluate((image) => image.decode());
  await withData.screenshot({ path: dir + "/hsy-category.png" });
  await withData.getByTestId("tab-settings").click();
  await withData.getByTestId("settings-language-en").click();
  await withData.getByTestId("tab-home").click();
  await withData.setViewportSize({ width: 320, height: 740 });
  await withData.getByTestId("home-nearby-preview").click();
  await checkHomeSource(withData, /Directory retrieved|over 30 days old|ODbL/);
  await withData
    .getByTestId("home-nearby-section")
    .screenshot({ path: `${dir}/nearby-en-narrow.png` });
  await withData.getByTestId("home-map-action").click();
  await checkLocationSource(
    withData,
    "en-GB",
    "Directory retrieved",
    "This directory is over 30 days old. Check the point's current details before travelling.",
  );
  await realData.close();
  console.log(
    "Reference Home: FI/EN attribution link and Location date/warning, point photos, category artwork, location consent, shared fix, manual municipality override, background/return, reload, revoked permission and opt-out.",
  );
} finally {
  await browser.close();
}
