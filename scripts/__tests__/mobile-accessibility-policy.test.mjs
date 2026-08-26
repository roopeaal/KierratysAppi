import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const mobileScreens = ["manual.tsx", "material-code.tsx", "feedback.tsx"];

test("every mobile text input has an explicit cross-platform accessible name", () => {
  for (const screen of mobileScreens) {
    const source = readFileSync(join("apps/mobile/src/app", screen), "utf8");
    const inputs = [...source.matchAll(/<TextInput\b[\s\S]*?\/>/g)];

    assert.ok(inputs.length > 0, `${screen} must contain a TextInput covered by this policy`);

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
    join("apps/mobile/src/features/accessibility", "announcements.ts"),
    "utf8",
  );
  const manual = readFileSync(join("apps/mobile/src/app", "manual.tsx"), "utf8");

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
    const source = readFileSync(join("apps/mobile/src/app", screen), "utf8");
    assert.match(source, /announceAccessibility\(/, `${screen} needs an iOS announcement path`);
  }
});
