import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const easUrl = new URL("../../mobile/app/eas.json", import.meta.url);
const packageUrl = new URL("../../mobile/app/package.json", import.meta.url);

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
  const stableVersion = /^[~^]?(\d+)\.\d+\.\d+$/u;
  const expoMajor = stableVersion.exec(mobilePackage.dependencies?.expo ?? "")?.[1];
  const developmentClientMajor = stableVersion.exec(
    mobilePackage.dependencies?.["expo-dev-client"] ?? "",
  )?.[1];

  assert.ok(expoMajor, "expo must specify a stable SDK version");
  assert.ok(developmentClientMajor, "expo-dev-client must specify a stable runtime version");
  assert.equal(
    developmentClientMajor,
    expoMajor,
    `${developmentClientProfiles.join(", ")} requires an Expo SDK ${expoMajor}-compatible expo-dev-client dependency`,
  );
});
