import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const inputFiles = [
  "app/index.tsx",
  "app/manual.tsx",
  "app/material-code.tsx",
  "app/feedback.tsx",
  "app/guide.tsx",
  "app/overview.tsx",
  "app/nearby.tsx",
  "components/recognition-presentation.tsx",
  "components/sorting-region-picker.tsx",
];

test("every mobile text input has an explicit cross-platform accessible name", () => {
  for (const screen of inputFiles) {
    const source = readFileSync(join("mobile/app/src", screen), "utf8");
    const inputs = [...source.matchAll(/<AppInput\b[\s\S]*?\/>/g)];

    assert.ok(inputs.length > 0, `${screen} must contain an AppInput covered by this policy`);
    assert.doesNotMatch(source, /<TextInput\b/);

    for (const [index, input] of inputs.entries()) {
      assert.match(
        input[0],
        /\baccessibilityLabel=/,
        `${screen} TextInput ${index + 1} needs accessibilityLabel; ` +
          "accessibilityLabelledBy alone did not name the field in physical iOS VoiceOver testing",
      );
    }
  }
});

test("important iOS announcements are high priority and cannot be interrupted", () => {
  const helper = readFileSync(
    join("mobile/app/src/features/accessibility", "announcements.ts"),
    "utf8",
  );
  const manual = readFileSync(join("mobile/app/src/app", "manual.tsx"), "utf8");

  assert.match(helper, /Platform\.OS !== "ios"/);
  assert.match(helper, /priority === "high" \? \{ priority \}/);
  assert.match(manual, /announceAccessibility\(t\("invalidGtin"\), "high"\)/);
});

test("every dynamic mobile alert has an explicit iOS announcement path", () => {
  for (const screen of [
    "manual.tsx",
    "material-code.tsx",
    "component.tsx",
    "feedback.tsx",
    "legal.tsx",
    "result.tsx",
  ]) {
    const source = readFileSync(join("mobile/app/src/app", screen), "utf8");
    assert.match(source, /announceAccessibility\(/, `${screen} needs an iOS announcement path`);
  }
});

test("critical mobile journeys expose stable semantic automation identifiers", () => {
  const requiredIdentifiers = {
    "index.tsx": ["home-screen", "home-scan-action", "home-guide-action"],
    "scan.tsx": [
      "scanner-permission-screen",
      "scanner-permission-action",
      "scanner-camera-screen",
      "scanner-torch-action",
      "scanner-camera-manual-action",
    ],
    "manual.tsx": ["manual-entry-screen", "manual-gtin-input", "manual-submit-action"],
    "result.tsx": [
      "result-loading-screen",
      "result-not-found-screen",
      "result-provider-unavailable-screen",
      "product-result-screen",
      "result-scan-another-action",
    ],
  };

  for (const [screen, identifiers] of Object.entries(requiredIdentifiers)) {
    const source = readFileSync(join("mobile/app/src/app", screen), "utf8");
    for (const identifier of identifiers) {
      assert.match(
        source,
        new RegExp(`testID=["']${identifier}["']`),
        `${screen} needs ${identifier}`,
      );
    }
  }
});

test("shared text does not cap operating-system font scaling", () => {
  const source = readFileSync(join("mobile/app/src/components", "ui.tsx"), "utf8");
  assert.doesNotMatch(source, /maxFontSizeMultiplier=/);
});
