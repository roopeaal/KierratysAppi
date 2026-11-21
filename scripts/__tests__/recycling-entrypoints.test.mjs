import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (file) => fs.readFileSync(`mobile/app/src/${file}`, "utf8");

test("all guidance families expose explicit recording without background saves", () => {
  for (const file of ["app/result.tsx", "app/component.tsx", "app/material-code.tsx"])
    assert.match(read(file), /<RecycleAction/);
  for (const file of [
    "app/guide.tsx",
    "components/source-guide-result.tsx",
    "components/object-sorting-flow.tsx",
    "components/offline-product-result.tsx",
    "components/nearby-point-card.tsx",
  ])
    assert.match(read(file), /<RecyclingRecordAction/);
  for (const file of [
    "app/guide.tsx",
    "app/result.tsx",
    "app/local-photo.tsx",
    "app/material-code.tsx",
    "components/source-guide-result.tsx",
    "components/object-sorting-flow.tsx",
    "components/offline-product-result.tsx",
    "components/nearby-point-card.tsx",
  ])
    assert.doesNotMatch(read(file), /recordRecycling\(/);
  assert.match(read("app/local-photo.tsx"), /<ObjectCandidateResultView/u);
  assert.match(read("components/network-photo-screen.web.tsx"), /<ObjectCandidateResultView/u);
  assert.match(read("components/object-candidate-result.tsx"), /<ObjectSortingFlowView/u);
});
test("unknown material selection cannot silently default or bypass confirmation", () => {
  const action = read("components/recycle-action.tsx");
  assert.match(action, /useState<OverviewMaterial>\(\)/);
  assert.match(action, /!confirming \|\| state !== "ready" \|\| !chosenMaterial/);
  assert.match(action, /disabled=\{saving \|\| !chosenMaterial\}/);
  assert.match(action, /pending\.current \?\?=/);
  assert.match(action, /material: chosenMaterial/);
  assert.doesNotMatch(action, /material:.*\?\?.*"other"/);
});
test("the material stamp is based on a persisted record and never blocks save or text feedback", () => {
  const action = read("components/recycle-action.tsx");
  const commit = action.indexOf("await recordRecycling(intended)");
  assert.ok(commit > 0);
  assert.match(action.slice(commit), /setSavedMaterial\(saved\?\.material\)/);
  assert.match(action.slice(commit), /saveView === loadVersion\.current/);
  assert.match(action.slice(commit), /saved\?\.recycledAt === intended\.recycledAt/);
  assert.match(action, /motionAllowed && isPointerActivation\(event\.nativeEvent/);
  assert.match(action, /<RecyclingStamp material=\{savedMaterial\} play=\{animateStamp\}/);
  assert.match(action, /accessibilityLiveRegion="polite" testID="recycle-saved"/);
  assert.match(action, /t\("recyclingAlreadySaved"\)/);
  assert.match(action, /setAnimateStamp\(false\)/);
});
test("the one-shot receipt honours motion changes and stays decorative", () => {
  const stamp = read("components/recycling-stamp.tsx");
  assert.match(stamp, /if \(!play \|\| played\.current\) return;/);
  assert.match(stamp, /if \(!motionAllowed\) return;/);
  assert.match(stamp, /animation\.stop\(\)/);
  assert.match(stamp, /drop\?\.cancel\(\)/);
  assert.match(stamp, /pointerEvents="none"/);
  assert.match(stamp, /importantForAccessibility="no-hide-descendants"/);
  assert.doesNotMatch(stamp, /setTimeout|setInterval|Animated\.loop|duration: 0/);
});
test("a point's recycling record does not retain the point name, address or coordinates", () => {
  const card = read("components/nearby-point-card.tsx");
  const action = card.match(/<RecyclingRecordAction[\s\S]*?\/>/)?.[0];
  assert.ok(action);
  assert.match(action, /label=\{t\("nearbyGeneric"\)\}/);
  assert.doesNotMatch(action, /label=\{point\.|coordinates|address/);
});
test("failed photo identities do not display a success-like recording action", () => {
  assert.match(
    read("components/offline-product-result.tsx"),
    /result.status === "catalogue_match" \|\| result.status === "confirmation_required"\) && \([\s\S]*<RecyclingRecordAction/,
  );
});
