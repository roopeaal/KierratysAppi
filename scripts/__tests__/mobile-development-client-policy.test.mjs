import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const easUrl = new URL("../../apps/mobile/eas.json", import.meta.url);
const packageUrl = new URL("../../apps/mobile/package.json", import.meta.url);

test("every EAS development-client profile includes the native runtime dependency", async () => {
  const [eas, mobilePackage] = await Promise.all([
    readFile(easUrl, "utf8").then(JSON.parse),
    readFile(packageUrl, "utf8").then(JSON.parse),
  ]);
  const developmentClientProfiles = Object.entries(eas.build ?? {})
    .filter(([, profile]) => profile?.developmentClient === true)
    .map(([name]) => name);

  assert.ok(
    developmentClientProfiles.length > 0,
    "eas.json must retain at least one development-client profile",
  );
  assert.match(
    mobilePackage.dependencies?.["expo-dev-client"] ?? "",
    /^~?57\./,
    `${developmentClientProfiles.join(", ")} requires an Expo SDK 57-compatible expo-dev-client dependency`,
  );
});
