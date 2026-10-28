import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("illustrated Home keeps every current real action, without the old Helsinki default or reassurance", () => {
  const home = readFileSync("mobile/app/src/app/index.tsx", "utf8");
  for (const action of ["scan", "manual", "photo", "nearby", "guide", "history", "legal"])
    assert.ok(home.includes(`testID="home-${action}-action"`));
  assert.match(home, /requestSearch\(\)/);
  assert.match(home, /<ScanIllustration/);
  assert.match(home, /expandedText/);
  assert.doesNotMatch(
    home,
    /useCollectionPoints|Helsinki|privacySummary|activityPoints|setInterval/,
  );
});

test("bottom navigation is mounted inside the current providers and does not acquire location on render", () => {
  const layout = readFileSync("mobile/app/src/app/_layout.tsx", "utf8");
  assert.match(layout, /<AppThemeProvider>/);
  assert.match(layout, /<NearbySearchProvider>/);
  assert.match(layout, /<BottomNavigation\s*\/>/);
  const nav = readFileSync("mobile/app/src/components/bottom-navigation.tsx", "utf8");
  assert.match(nav, /accessibilityRole="tab"/);
  assert.match(nav, /aria-selected=\{selected === tab.id\}/);
  assert.match(nav, /router.dismissTo\(action.path\)/);
  assert.doesNotMatch(nav, /router.navigate\(|router.push\(/);
  assert.match(nav, /onPress=\{\(\) => \{[\s\S]*?if \(action.requestLocation\) requestSearch\(\)/);
  assert.doesNotMatch(nav, /readDeviceLocation|requestForegroundPermissionsAsync|setInterval/);
  assert.match(
    readFileSync("mobile/app/src/components/ui.tsx", "utf8"),
    /edges=\{activeTab\(path\)/,
  );
});

test("new root pages lead to current camera/privacy/history routes, not old account or points fixtures", () => {
  for (const page of ["identify", "settings"]) {
    const source = readFileSync(`mobile/app/src/app/${page}.tsx`, "utf8");
    assert.match(source, /<PageHeader/);
    assert.match(source, /router.canGoBack\(\)/);
    assert.doesNotMatch(source, /fetch\(|activitySummary|activityPoints|\/profile|\/map/);
  }
  const identify = readFileSync("mobile/app/src/app/identify.tsx", "utf8");
  for (const path of ["scan", "manual", "photo"])
    assert.ok(identify.includes(`router.push("/${path}")`));
  const settings = readFileSync("mobile/app/src/app/settings.tsx", "utf8");
  assert.match(settings, /isHistoryEnabled/);
  assert.match(settings, /aria-checked=\{language === item\}/);
  assert.match(settings, /settingsReadError/);
});

test("selected local artwork is decorative and has an explicit source without altering the rule engine", () => {
  for (const name of ["home-background", "welcome-background", "scan-illustration"])
    assert.ok(existsSync(`mobile/app/assets/backgrounds/${name}.png`));
  const attribution = readFileSync("mobile/app/assets/backgrounds/README.md", "utf8");
  assert.match(attribution, /0142bb0371d0794ffe8d30df5037b40329efb512/);
  const artwork = readFileSync("mobile/app/src/components/reference-artwork.tsx", "utf8");
  assert.equal((artwork.match(/importantForAccessibility="no-hide-descendants"/g) ?? []).length, 2);
  assert.doesNotMatch(artwork, /fetch\(|setInterval|withRepeat|https?:/);
});
