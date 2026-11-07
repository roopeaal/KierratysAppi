import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (file) => readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");

// Source-level regressions, not a native supplementary-model execution claim.
test("result source wording follows actual supplemental-engine availability", () => {
  const screen = source("mobile/app/src/app/local-photo.tsx");
  assert.match(
    screen,
    /observation\.source\.supplement\.status === "observed"\s*\? "localVisionSourceMobileClip"\s*: "localVisionSource"/u,
  );
  assert.match(screen, /testID="local-photo-supplement-unavailable"/u);
  assert.match(screen, /observation\.source\.supplement\.modelRevision/u);
  assert.match(screen, /observation\.source\.supplement\.gateVersion/u);
});

test("privacy names the supporting-installation model and disclaims endorsement/material certainty in both locales", () => {
  assert.match(source("mobile/app/src/app/legal.tsx"), /t\("localVisionModelAttribution"\)/u);
  const messages = source("mobile/localization/src/local-vision.ts");
  for (const phrase of [
    "MobileCLIP-S0-mallia (2024)",
    "sitä tukevaan iPhone-asennukseen",
    "ei tarkoita Applen hyväksyntää",
    "ei varmista materiaalia tai tuotetta",
    "MobileCLIP-S0 model (2024)",
    "supporting iPhone installations",
    "does not imply Apple's endorsement",
    "does not verify material or product identity",
  ])
    assert.ok(messages.includes(phrase), phrase);
});
