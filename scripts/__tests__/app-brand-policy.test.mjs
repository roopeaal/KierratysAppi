import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const { expo } = readJson("apps/mobile/app.json");

// Configuration evidence only: installed launcher labels require a fresh native build.
test("KeepItGreen is the default and both localized native display names", () => {
  assert.equal(expo.name, "KeepItGreen");
  for (const language of ["fi", "en"]) {
    const locale = readJson(`apps/mobile/${expo.locales[language]}`);
    assert.equal(locale.ios.CFBundleDisplayName, expo.name);
    assert.equal(locale.android.app_name, expo.name);
  }
});

test("a display-name change preserves installed-app and deep-link identity", () => {
  assert.equal(expo.ios.bundleIdentifier, "fi.roopeaaltonen.kierratysappi");
  assert.equal(expo.android.package, expo.ios.bundleIdentifier);
  assert.equal(expo.slug, "kierratysappi");
  assert.equal(expo.scheme, "kierratysappi");
});

test("the visual wordmark and its accessible name share the localized app-name key", () => {
  const source = readFileSync("apps/mobile/src/components/ui.tsx", "utf8");
  assert.match(
    source,
    /<AppText variant=\{compact \? "heading" : "title"\}>\{t\("appName"\)\}<\/AppText>/,
  );
  assert.match(source, /accessibilityLabel=\{compact \? t\("appName"\)/);
  assert.doesNotMatch(source, /KierrätysAppi/);
});
