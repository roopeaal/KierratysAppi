import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
test("manual address lookup is explicit, OS-only, ephemeral and never presented as GPS accuracy", () => {
  const screen = read("mobile/app/src/app/nearby.tsx");
  const adapter = read("mobile/app/src/features/nearby/device-location.ts");
  const helper = read("mobile/app/src/features/nearby/manual-location.ts");
  assert.match(screen, /nearbyLocationHint/u);
  assert.match(screen, /onPress=\{\(\) => void findByLocation\(\)\}/u);
  assert.match(screen, /setLocationInput\(""\)/u);
  assert.match(screen, /accuracy: null,\s*origin: "address"/u);
  assert.match(screen, /nearbyManualEstimate/u);
  assert.match(adapter, /Location\.geocodeAsync\(address\)/u);
  assert.match(adapter, /Platform\.OS === "web"/u);
  assert.doesNotMatch(
    screen + adapter + helper,
    /nominatim|fetch\(|AsyncStorage|console\.|trackEvent/u,
  );
  assert.match(read("mobile/app/src/app/legal.tsx"), /t\("nearbyLocationHint"\)/u);
});
test("nearest result identifies the source point without inventing missing names or types", () => {
  const screen = read("mobile/app/src/components/nearby-point-card.tsx");
  assert.match(screen, /point\.name \?\? point\.operator \?\? t\("nearbyGeneric"\)/u);
  for (const key of [
    "nearbyPointType",
    "nearbyCentre",
    "nearbyContainer",
    "nearbyTypeUnknown",
    "nearbyPointId",
  ])
    assert.ok(screen.includes(key));
  assert.match(screen, /point\.id/u);
  assert.match(screen, /point\.address/u);
  for (const text of [
    "Pisteen nimeä ei ole aineistossa",
    "Point name is not available in the directory",
  ])
    assert.ok(read("mobile/localization/src/nearby.ts").includes(text));
});
test("location native configuration is foreground-only with localised purpose", () => {
  const config = JSON.parse(read("mobile/app/app.json")).expo;
  const plugin = config.plugins.find((p) => Array.isArray(p) && p[0] === "expo-location")[1];
  for (const field of [
    "isIosBackgroundLocationEnabled",
    "isAndroidBackgroundLocationEnabled",
    "isAndroidForegroundServiceEnabled",
    "locationAlwaysPermission",
    "locationAlwaysAndWhenInUsePermission",
    "motionUsagePermission",
  ]) {
    assert.equal(plugin[field], false);
  }
  for (const language of ["fi", "en"])
    assert.ok(
      JSON.parse(read(`mobile/app/locales/${language}.json`)).ios
        .NSLocationWhenInUseUsageDescription,
    );
  assert.ok(
    config.android.blockedPermissions.includes("android.permission.ACCESS_BACKGROUND_LOCATION"),
  );
});
test("nearby makes map primary, keeps uncertainty visible and progressively discloses metadata", () => {
  const screen = read("mobile/app/src/app/nearby.tsx");
  const card = read("mobile/app/src/components/nearby-point-card.tsx");
  const map = card.slice(
    card.indexOf('label={t("nearbyShowMap")}'),
    card.indexOf("testID={`nearby-map-${index}`}"),
  );
  assert.ok(map.length > 0);
  assert.match(map, /accessibilityHint/u);
  assert.match(card, /expanded=\{detailsOpen\}/u);
  assert.match(card, /detailsOpen &&/u);
  assert.match(screen, /nearbyQuickCaution/u);
  assert.match(screen, /nearbyUnverified/u);
  assert.ok(card.indexOf("testID={`nearby-map-${index}`}") < card.indexOf('t("nearbyPointId")'));
  assert.match(
    read("mobile/app/src/components/ui.tsx"),
    /accessibilityState=\{expanded === undefined \? undefined : \{ expanded \}\}/u,
  );
  assert.match(read("mobile/app/src/components/ui.tsx"), /aria-expanded=\{expanded\}/u);
});
test("automatic address estimates are foreground-only, sourced and use only public point coordinates", () => {
  const card = read("mobile/app/src/components/nearby-point-card.tsx");
  assert.match(card, /!foreground \|\| point\.address \|\| Platform\.OS === "web"/u);
  assert.match(card, /useFocusEffect\(/u);
  assert.match(card, /readPointAddress\(point, controller\.signal\)/u);
  assert.match(card, /return \(\) => controller\.abort\(\)/u);
  assert.match(card, /nearbyAddressLabel/u);
  assert.match(card, /nearbyAddressSource/u);
  assert.match(card, /nearbyLocationOnMap/u);
  assert.doesNotMatch(card, /nearbyCompleteAddress/u);
  const adapter = read("mobile/app/src/features/nearby/device-location.ts")
    .split("export const readPointAddress")[1]
    .split("const watchWeb")[0];
  assert.match(adapter, /foregroundPermission\(false\)/u);
  assert.match(adapter, /Location\.reverseGeocodeAsync\(coordinates\)/u);
  assert.doesNotMatch(adapter, /fetch\(|readDeviceLocation|requestForegroundPermissions/u);
  assert.match(read("mobile/app/src/app/nearby.tsx"), /setPrivacyOpen\(false\)/u);
});
test("all surfaces share one fixed light theme without a system appearance listener", () => {
  const tokens = read("mobile/app/src/theme/tokens.ts");
  const layout = read("mobile/app/src/app/_layout.tsx");
  assert.match(tokens, /AppThemeProvider/u);
  assert.match(tokens, /useContext\(AppThemeContext\)/u);
  assert.match(tokens, /palette: lightPalette/u);
  assert.doesNotMatch(tokens, /useSyncExternalStore|Appearance|colorSchemeStore/u);
  assert.match(layout, /<AppThemeProvider>/u);
  assert.match(read("mobile/app/src/components/ui.tsx"), /aria-busy=\{busy\}/u);
});
test("nearby has consent-gated foreground acquisition, cleanup and no coordinate network/storage channel", () => {
  const screen = read("mobile/app/src/app/nearby.tsx");
  const device = read("mobile/app/src/features/nearby/device-location.ts");
  const session = read("mobile/app/src/features/nearby/location-session.ts");
  const cache = read("mobile/app/src/features/nearby/foreground-fix.ts");
  const provider = read("mobile/app/src/features/nearby/foreground-context.tsx");
  assert.match(screen, /onPress=\{\(\) => void find\(\{ prompt: true, enable: !enabled \}\)\}/u);
  assert.match(provider, /if \(state === "background"\) session\.clear\(\)/u);
  assert.match(provider, /AsyncStorage\.setItem\(autoLocationKey, "true"\)/u);
  assert.doesNotMatch(provider, /coords|JSON\.stringify|fetch\(|trackEvent/u);
  assert.match(screen, /useFocusEffect/u);
  assert.match(screen, /announceAccessibility/u);
  assert.match(screen, /nearbyCaution/u);
  assert.match(screen, /nearbySource/u);
  assert.equal(
    (
      screen.match(
        /setLinkError\(true\);\s*announceAccessibility\(t\("nearbyLinkError"\), "high"\)/gu,
      ) ?? []
    ).length,
    2,
  );
  assert.doesNotMatch(
    screen + device + session + cache,
    /fetch\(|AsyncStorage|console\.|trackEvent|requestBackgroundPermissions|startLocationUpdates/u,
  );
});
test("nearby uses existing components and bundled real data, without replacing the old Home", () => {
  const home = read("mobile/app/src/app/index.tsx");
  assert.match(home, /home-nearby-action/u);
  assert.doesNotMatch(home, /readDeviceLocation|requestForegroundPermissionsAsync/u);
  assert.match(home, /home-scan-action/u);
  assert.match(
    read("mobile/app/src/features/navigation/routes.ts"),
    /id: "nearby", path: "\/nearby"/u,
  );
  assert.match(read("mobile/app/src/app/nearby.tsx"), /finland-recycling\.json/u);
  assert.match(read("mobile/app/assets/data/README.md"), /Open Database License 1\.0/u);
});

test("a nearby launch can only prompt on an explicit action; automatic lookup is opt-in and silent", () => {
  const tabs = read("mobile/app/src/components/bottom-navigation.tsx");
  const screen = read("mobile/app/src/app/nearby.tsx");
  const intent = read("mobile/app/src/features/nearby/search-intent.ts");
  assert.match(
    tabs,
    /if \(action.requestLocation\) requestSearch\(\);\s*router.dismissTo\(action.path\)/u,
  );
  assert.match(screen, /const explicit = consumeSearchRequest\(\)/u);
  assert.match(
    screen,
    /if \(enabled \|\| explicit\) void find\(\{ prompt: explicit && !enabled \}\)/u,
  );
  assert.match(
    read("mobile/app/src/components/home-nearby-preview.tsx"),
    /if \(enabled && foreground\) void find\(false\)/u,
  );
  assert.match(intent, /requestedAt = null/u);
  assert.doesNotMatch(screen + intent, /useLocalSearchParams|searchParams|AsyncStorage|fetch\(/u);
  assert.match(read("mobile/app/src/app/_layout.tsx"), /<NearbySearchProvider>/u);
});

test("nearby lists real distance-ranked points and explicit material reports, not guessed acceptance", () => {
  const screen = read("mobile/app/src/app/nearby.tsx");
  const card = read("mobile/app/src/components/nearby-point-card.tsx");
  assert.match(screen, /buildNearbyResults\(directory\.data\.points, fix\.coords\)/u);
  assert.match(screen, /state\.results\.reported/u);
  assert.match(screen, /missingOpen/u);
  assert.match(screen, /state\.results\.materials\[filter\]/u);
  for (const required of [
    "reportedMaterials",
    "reportedExclusions",
    "nearbyMaterialsUnknown",
    "collectionMaterialLabels",
  ])
    assert.ok(card.includes(required));
  assert.ok(card.indexOf('t("nearbyMaterials")') < card.indexOf("detailsOpen &&"));
  assert.ok(screen.includes('t("nearbyRetrieved")'));
});
