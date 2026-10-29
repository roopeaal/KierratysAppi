import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// Source-policy coverage complements actual browser inspection; it is not a native render test.
test("every native radio also exposes its checked state in the web renderer", () => {
  for (const screen of ["index.tsx", "component.tsx", "feedback.tsx", "guide.tsx"]) {
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

test("reference Home keeps labelled barcode, primary Identify, utility, history and manual recovery actions", () => {
  const home = readFileSync("mobile/app/src/app/index.tsx", "utf8");
  const ids = [
    "home-scan-action",
    "home-identify-action",
    "home-nearby-action",
    "home-guide-action",
    "home-history-action",
    "home-manual-action",
  ];
  const positions = ids.map((id) => home.indexOf(`testID="${id}"`));
  assert.ok(positions.every((position) => position >= 0));
  assert.match(home, /aria-checked=\{language === item\}/);
  assert.deepEqual(
    positions,
    [...positions].sort((a, b) => a - b),
  );
  const kinds = [
    "Pressable",
    "Pressable",
    "HomeTile",
    "HomeTile",
    "HomeSectionHeading",
    "InlineLink",
  ];
  for (const [index, id] of ids.entries()) {
    const position = home.indexOf(`testID="${id}"`);
    const kind = kinds[index];
    const start = home.lastIndexOf(`<${kind}`, position);
    assert.ok(start >= 0, `${id} uses ${kind}`);
    const control = home.slice(start, home.indexOf(">", position) + 1);
    assert.match(control, /onPress=/);
    if (kind === "Pressable") {
      assert.match(control, /accessibilityRole="button"/);
      assert.match(control, /accessibilityLabel=\{t\(/);
      assert.match(control, /accessibilityHint=\{t\(/);
    } else if (kind === "HomeSectionHeading") {
      assert.match(control, /title=\{t\(/);
      assert.match(control, /action=\{t\(/);
    } else {
      assert.match(control, /label=\{t\(/);
      if (kind === "InlineLink") assert.match(control, /role="button"/);
    }
  }

  const elements = readFileSync("mobile/app/src/components/home-elements.tsx", "utf8");
  const tile = elements.slice(
    elements.indexOf("export function HomeTile"),
    elements.indexOf("export function HomeSectionHeading"),
  );
  assert.match(tile, /accessibilityRole="button"/);
  assert.match(tile, /accessibilityLabel=\{label\}/);
  assert.match(tile, /accessibilityHint=\{detail\}/);
  assert.match(tile, /testID=\{testID\}/);
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
  assert.match(source, /!material \|\| material === "unknown"/);
  assert.doesNotMatch(source, /setInterval|withRepeat|requestAnimationFrame/);
});

test("privacy purpose stays at the relevant action, not as blanket Home/history reassurance", () => {
  for (const screen of ["index", "history"]) {
    assert.doesNotMatch(readFileSync(`mobile/app/src/app/${screen}.tsx`, "utf8"), /privacySummary/);
  }
  const home = readFileSync("mobile/app/src/app/index.tsx", "utf8");
  assert.match(home, /testID="home-legal-action"/);
  assert.doesNotMatch(home, /scanActionDetail|cameraPurpose/);
  assert.match(readFileSync("mobile/app/src/app/scan.tsx", "utf8"), /t\("cameraPurpose"\)/);
  const nearby = readFileSync("mobile/app/src/app/nearby.tsx", "utf8");
  assert.match(nearby, /t\("nearbyIntro"\)/);
  assert.match(
    readFileSync("mobile/app/src/components/nearby-point-card.tsx", "utf8"),
    /t\("nearbyAddressConsent"\)/,
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
  assert.doesNotMatch(result, /loadingDetail|eyebrow=/);
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

test("compact Home tiles retain labelled destinations, wrapping, focus and scalable text", () => {
  const home = readFileSync("mobile/app/src/app/index.tsx", "utf8");
  assert.equal((home.match(/<HomeTile\b/g) ?? []).length, 2);
  assert.match(home, /<ScanIllustration\s*\/>/);
  assert.match(home, /!expandedText && \(\s*<View style=\{\[styles.identifyChevron/);
  const elements = readFileSync("mobile/app/src/components/home-elements.tsx", "utf8");
  assert.match(elements, /fontScale >= 1\.5 \? "100%" : fontScale > 1\.2/);
  assert.match(elements, /fontWeight: "500", flexShrink: 1/);
  assert.match(home, /homeIdentifyDetail/);
  for (const kind of ["manual", "history"]) assert.ok(home.includes(`<ActionIcon kind="${kind}"`));
  assert.match(home, /<ReferenceSymbol\s+name="location"/);
  for (const kind of ["nearby", "guide"])
    assert.match(home, new RegExp(`<HomeTile\\b[^>]*?kind="${kind}"`));
  assert.match(home, /flexWrap: "wrap"/);
  assert.match(home, /canvasWidth < 360 \|\| expandedText/);
  assert.match(home, /stacked && \{ flexDirection: "column" \}/);
  const tile = elements.slice(
    elements.indexOf("export function HomeTile"),
    elements.indexOf("export function HomeSectionHeading"),
  );
  assert.match(tile, /accessibilityLabel=\{label\}/);
  assert.match(tile, /accessibilityHint=\{detail\}/);
  assert.match(tile, /<IconDisc kind=\{kind\}/);
  assert.match(tile, /onFocus=\{\(\) => setFocused\(true\)\}/);
  assert.match(tile, /focused \? palette.actionLink/);
  assert.match(elements, /minHeight: 86/);
  assert.match(elements, /minWidth: 44/);
  assert.match(elements, /minHeight: 44/);
  for (const source of [home, elements])
    assert.doesNotMatch(
      source,
      /numberOfLines=|adjustsFontSizeToFit|maxFontSizeMultiplier=|allowFontScaling=\{false\}/,
    );
});
