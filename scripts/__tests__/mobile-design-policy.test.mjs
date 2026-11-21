import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// Source-policy coverage complements actual browser inspection; it is not a native render test.
test("every native radio also exposes its checked state in the web renderer", () => {
  for (const screen of ["settings.tsx", "component.tsx", "feedback.tsx", "guide.tsx"]) {
    const source = readFileSync(`mobile/app/src/app/${screen}`, "utf8");
    const radios = [...source.matchAll(/<Pressable\b[\s\S]*?(?=>)/g)].filter(([control]) =>
      control.includes('accessibilityRole="radio"'),
    );
    assert.ok(radios.length > 0);
    for (const [radio] of radios) {
      assert.match(radio, /accessibilityState=\{\{ checked:/);
      assert.match(radio, /aria-checked=\{/);
    }
  }
});

test("compact Home keeps labelled search, direct scan and Identify, then a guide fallback", () => {
  const home = readFileSync("mobile/app/src/app/index.tsx", "utf8");
  const ids = [
    "home-search-submit",
    "home-scan-action",
    "home-identify-action",
    "home-guide-action",
  ];
  assert.deepEqual(
    [
      ...home.matchAll(
        /testID="(home-(?:search-submit|scan-action|identify-action|guide-action))"/g,
      ),
    ].map((match) => match[1]),
    ids,
  );
  for (const id of ids.slice(0, 3)) {
    const position = home.indexOf(`testID="${id}"`);
    const start = home.lastIndexOf("<Pressable", position);
    const control = home.slice(start, home.indexOf("\n              >", position));
    assert.match(control, /onPress=/);
    assert.match(control, /accessibilityRole="button"/);
    assert.match(control, /accessibilityLabel=\{t\(/);
  }
  assert.match(
    home,
    /<HomeSectionHeading[\s\S]*?onPress=\{\(\) => router\.push\("\/guide"\)\}[\s\S]*?testID="home-guide-all"/,
  );
  const elements = readFileSync("mobile/app/src/components/home-elements.tsx", "utf8");
  const heading = elements.slice(
    elements.indexOf("export function HomeSectionHeading"),
    elements.indexOf("export function MaterialChip"),
  );
  assert.match(heading, /accessibilityRole="header"/);
  assert.match(heading, /accessibilityRole="button"/);
  assert.match(heading, /accessibilityLabel=\{`\$\{title\}: \$\{action\}`\}/);
  assert.match(heading, /testID=\{testID\}/);
  const ui = readFileSync("mobile/app/src/components/ui.tsx", "utf8");
  const link = ui.slice(
    ui.indexOf("export function InlineLink"),
    ui.indexOf("export const sharedStyles"),
  );
  assert.match(link, /accessibilityRole=\{role\}/);
  assert.match(link, /accessibilityLabel=\{label\}/);
  assert.match(link, /minHeight: controls.minimumTouchTarget/);
});

test("all subpages use the same labelled navigation without repeated brand cards", () => {
  for (const screen of [
    "manual",
    "scan",
    "result",
    "guide",
    "material-code",
    "component",
    "nearby",
    "history",
    "feedback",
    "legal",
  ]) {
    const source = readFileSync(`mobile/app/src/app/${screen}.tsx`, "utf8");
    assert.match(source, /<PageHeader\b/);
    assert.doesNotMatch(source, /BrandLockup/);
  }
  const ui = readFileSync("mobile/app/src/components/ui.tsx", "utf8");
  const header = ui.slice(
    ui.indexOf("export function PageHeader"),
    ui.indexOf("export function PageIntro"),
  );
  assert.match(header, /accessibilityLabel=\{backLabel\}/);
  assert.match(ui, /minHeight: controls.minimumTouchTarget/);
});

test("forms preserve readable scalable text and strong focus boundaries", () => {
  for (const screen of ["manual", "material-code", "feedback", "guide"]) {
    const source = readFileSync(`mobile/app/src/app/${screen}.tsx`, "utf8");
    assert.match(source, /palette.borderStrong/);
    assert.match(source, /onFocus=|onFocus =/);
    assert.match(source, /onBlur=|onBlur =/);
    assert.doesNotMatch(source, /maxFontSizeMultiplier=|adjustsFontSizeToFit|numberOfLines=/);
  }
});

test("guide and legal are reading sections and history never prints an internal enum", () => {
  for (const screen of ["guide", "legal"])
    assert.match(readFileSync(`mobile/app/src/app/${screen}.tsx`, "utf8"), /<DocumentSection/);
  const history = readFileSync("mobile/app/src/app/history.tsx", "utf8");
  assert.match(history, /t\(historyStatusMessageKey\(entry.resultStatus\)\)/);
  assert.doesNotMatch(history, /\{entry.resultStatus\}/);
  const legal = readFileSync("mobile/app/src/app/legal.tsx", "utf8");
  assert.match(legal, /t\("privacyInformation"\)/);
  assert.doesNotMatch(legal, /legalReview|termsDraft|privacyDraft|StatusPill/);
});

test("embedded sorting presentation retains uncertainty, preparation and all provenance fields", () => {
  const source = readFileSync("mobile/app/src/components/sorting-result.tsx", "utf8");
  for (const expression of [
    "result.destination.label",
    "result.preparation",
    "result.explanation",
    "result.exceptions",
    "result.nextAction",
    "result.candidateDestinations",
    "result.confidence.score",
    "source.sourceName",
    "source.sourceUrl",
    "source.jurisdiction",
    "source.checkedAt",
    "source.version",
    't("ruleVerificationLabel")',
    't("noApplicableRuleSource")',
  ]) {
    assert.ok(source.includes(expression), `${expression} must remain displayed`);
  }
  assert.match(source, /<RuleReferences sources=\{\[result\.rule\]\}/);
  assert.match(source, /<RuleReferences sources=\{result\.sources\}/);
  assert.doesNotMatch(source, /numberOfLines=|maxFontSizeMultiplier=|overflow: "hidden"/);
});

test("original decorative package marks do not claim an unknown material or enter screen-reader order", () => {
  const source = readFileSync("mobile/app/src/components/packaging-mark.tsx", "utf8");
  assert.equal((source.match(/importantForAccessibility="no-hide-descendants"/g) ?? []).length, 2);
  assert.equal((source.match(/accessibilityElementsHidden/g) ?? []).length, 2);
  assert.equal((source.match(/aria-hidden/g) ?? []).length, 2);
  for (const material of ["plastic", "carton", "glass", "metal"]) {
    assert.ok(source.includes(`material === "${material}"`));
    const png = readFileSync(`mobile/app/assets/material-studies/${material}.png`);
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [192, 192]);
  }
  assert.match(source, /known \? \(\s*<MaterialStudy/);
  assert.doesNotMatch(source, /setInterval|withRepeat|requestAnimationFrame/);
});

test("category icons are small, transparent, statically bundled and decorative", () => {
  const component = readFileSync("mobile/app/src/components/material-study.tsx", "utf8");
  const assets = [
    ...component.matchAll(/require\("\.\.\/\.\.\/assets\/material-studies\/([a-z-]+\.png)"\)/g),
  ];
  assert.equal(new Set(assets.map(([, path]) => path)).size, 38);
  for (const [, path] of assets) {
    const png = readFileSync(`mobile/app/assets/material-studies/${path}`);
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20), png[25]], [192, 192, 6], path);
    assert.ok(png.length < 12_000, path);
  }
  assert.match(
    component,
    /accessible=\{false\}[\s\S]*accessibilityElementsHidden[\s\S]*aria-hidden/,
  );
});

test("recent product miniatures are complete, local, lightweight and decorative", () => {
  const component = readFileSync("mobile/app/src/components/recent-product-artwork.tsx", "utf8");
  const files = [
    ...component.matchAll(/require\("\.\.\/\.\.\/assets\/recent-packaging\/([a-z]+\.png)"\)/g),
  ].map(([, file]) => file);
  assert.equal(new Set(files).size, 11);
  let bytes = 0;
  for (const file of files) {
    const png = readFileSync(`mobile/app/assets/recent-packaging/${file}`);
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20), png[25]], [144, 144, 6], file);
    bytes += png.length;
  }
  assert.ok(bytes < 48_000);
  assert.match(
    component,
    /accessible=\{false\}[\s\S]*accessibilityElementsHidden[\s\S]*aria-hidden/,
  );
  assert.doesNotMatch(component, /https?:|uri:|setInterval|withRepeat/);
});

test("privacy purpose stays at the relevant action, not as blanket Home/history reassurance", () => {
  for (const screen of ["index", "history"]) {
    assert.doesNotMatch(readFileSync(`mobile/app/src/app/${screen}.tsx`, "utf8"), /privacySummary/);
  }
  const home = readFileSync("mobile/app/src/app/index.tsx", "utf8");
  assert.doesNotMatch(home, /testID="home-legal-action"/);
  assert.match(
    readFileSync("mobile/app/src/app/settings.tsx", "utf8"),
    /testID="settings-legal-action"/,
  );
  assert.doesNotMatch(home, /scanActionDetail|cameraPurpose/);
  assert.match(readFileSync("mobile/app/src/app/scan.tsx", "utf8"), /t\("cameraPurpose"\)/);
  const nearby = readFileSync("mobile/app/src/app/nearby.tsx", "utf8");
  assert.match(nearby, /t\("nearbyIntro"\)/);
  assert.match(
    readFileSync("mobile/app/src/components/nearby-point-card.tsx", "utf8"),
    /t\("nearbyAddressLabel"\)/,
  );
  const legal = readFileSync("mobile/app/src/app/legal.tsx", "utf8");
  for (const key of [
    "privacyInformation",
    "nearbyPrivacy",
    "nearbyAddressDisclosure",
    "sortingInformation",
  ])
    assert.ok(legal.includes(`t("${key}")`));
});

test("loading and error states explain the task once without asserting a fresh rule review", () => {
  const result = readFileSync("mobile/app/src/app/result.tsx", "utf8");
  const [states, productAndState] = result.split("function ProductResult");
  assert.doesNotMatch(states, /loadingDetail|eyebrow=/);
  assert.doesNotMatch(productAndState.split("function StateScreen")[1], /loadingDetail|eyebrow=/);
  assert.match(productAndState, /eyebrow=\{t\("productDetailsTitle"\)\}/);
  assert.match(result, /t\("loading"\)/);
  assert.match(result, /t\("offlineBody"\)/);
  assert.match(result, /testID="result-primary-action"/);
  assert.match(result, /testID="result-secondary-action"/);
  assert.match(readFileSync("mobile/app/src/app/feedback.tsx", "utf8"), /t\("draftNotSent"\)/);
});

test("recognition icons reuse original decorative symbols and native linework without motion or emoji", () => {
  const icons = readFileSync("mobile/app/src/components/action-icon.tsx", "utf8");
  for (const kind of ["nearby", "guide", "history", "manual"])
    assert.ok(icons.includes(`"${kind}"`));
  assert.equal((icons.match(/importantForAccessibility="no-hide-descendants"/g) ?? []).length, 2);
  assert.equal((icons.match(/accessibilityElementsHidden/g) ?? []).length, 2);
  assert.equal((icons.match(/aria-hidden/g) ?? []).length, 2);
  assert.equal((icons.match(/pointerEvents="none"/g) ?? []).length, 2);
  assert.match(icons, /const strokeWidth = 1\.8/);
  assert.doesNotMatch(
    icons,
    /\p{Extended_Pictographic}|setInterval|withRepeat|Animated|\.png|react-native-svg/u,
  );
});

test("compact Home materials retain labelled destinations, wrapping, focus and scalable text", () => {
  const home = readFileSync("mobile/app/src/app/index.tsx", "utf8");
  assert.doesNotMatch(home, /home-legal-action/);
  for (const shortcut of ["nearby", "guide", "overview"]) {
    assert.ok(home.includes(`testID="home-${shortcut}-action"`));
  }
  assert.match(home, /<HomeTile\s+kind="overview"[\s\S]*?testID="home-overview-action"/);
  assert.match(home, /<HomeSectionHeading title=\{t\("overviewTitle"\)\} \/>/);
  assert.doesNotMatch(home, /home-manual-action|HomeShortcut/);
  assert.match(home, /<ScanIllustration scale=\{scanArtScale\} \/>/);
  assert.match(home, /<PhotoCardBackdrop/);
  assert.match(home, /<HomeNearbyPreview \/>/);
  assert.match(home, /<HomeRecent \/>/);
  assert.match(home, /!expandedText && \(\s*<View style=\{\[styles.identifyChevron/);
  assert.match(home, /homeIdentifyDetail/);
  assert.match(home, /flexWrap: "wrap"/);
  const elements = readFileSync("mobile/app/src/components/home-elements.tsx", "utf8");
  const chip = readFileSync("mobile/app/src/components/home-reference-elements.tsx", "utf8");
  assert.match(chip, /chipLabel: \{[^}]*flexShrink: 1/);
  assert.match(chip, /accessibilityRole="button"/);
  assert.match(chip, /accessibilityLabel=\{label\}/);
  assert.equal((chip.match(/<MaterialStudy\b/g) ?? []).length, 1);
  assert.match(chip, /<MaterialStudy material=\{icon === "battery" \? "batteries" : icon\}/);
  assert.match(chip, /onFocus=\{\(\) => setFocused\(true\)\}/);
  assert.match(chip, /focused \? focusRing\(palette\)/);
  assert.match(elements, /minWidth: 44/);
  assert.match(elements, /minHeight: 44/);
  for (const source of [home, elements])
    assert.doesNotMatch(
      source,
      /numberOfLines=|adjustsFontSizeToFit|maxFontSizeMultiplier=|allowFontScaling=\{false\}/,
    );
});
