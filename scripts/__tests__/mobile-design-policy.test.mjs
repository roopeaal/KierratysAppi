import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// Source-policy coverage complements actual browser inspection; it is not a native render test.
test("every native radio also exposes its checked state in the web renderer", () => {
  for (const screen of ["index.tsx", "component.tsx", "feedback.tsx"]) {
    const source = readFileSync(`apps/mobile/src/app/${screen}`, "utf8");
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

test("redesigned Home retains accessible primary, fallback and utility actions in task order", () => {
  const home = readFileSync("apps/mobile/src/app/index.tsx", "utf8");
  const ids = [
    "home-scan-action",
    "home-manual-action",
    "home-guide-action",
    "home-history-action",
  ];
  const positions = ids.map((id) => home.indexOf(`testID="${id}"`));
  assert.ok(positions.every((position) => position >= 0));
  assert.match(home, /aria-checked=\{language === item\}/);
  assert.deepEqual(
    positions,
    [...positions].sort((a, b) => a - b),
  );
  for (const id of ids) {
    const control = [...home.matchAll(/<Pressable\b[\s\S]*?(?=>)/g)].find(([source]) =>
      source.includes(`testID="${id}"`),
    );
    assert.ok(control, `missing ${id}`);
    assert.match(control[0], /accessibilityRole="button"/);
    assert.match(control[0], /accessibilityLabel=/);
  }
});

test("embedded sorting presentation retains uncertainty, preparation and all provenance fields", () => {
  const source = readFileSync("apps/mobile/src/components/sorting-result.tsx", "utf8");
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
  const source = readFileSync("apps/mobile/src/components/packaging-mark.tsx", "utf8");
  assert.equal((source.match(/importantForAccessibility="no-hide-descendants"/g) ?? []).length, 2);
  assert.equal((source.match(/accessibilityElementsHidden/g) ?? []).length, 2);
  assert.equal((source.match(/aria-hidden/g) ?? []).length, 2);
  assert.match(source, /!material \|\| material === "unknown"/);
  assert.doesNotMatch(source, /setInterval|withRepeat|requestAnimationFrame/);
});
