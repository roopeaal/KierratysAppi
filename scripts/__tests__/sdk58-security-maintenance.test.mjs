import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);

function stableVersion(value) {
  assert.equal(typeof value, "string");
  const match = /^[~^]?(\d+)\.(\d+)\.(\d+)$/u.exec(value);
  assert.ok(match, `Expected a stable version, received ${value}`);
  return match.slice(1).map(Number);
}

function atLeast(version, floor) {
  const actual = stableVersion(version);
  const minimum = stableVersion(floor);
  for (let index = 0; index < 3; index++) {
    if (actual[index] !== minimum[index]) return actual[index] > minimum[index];
  }
  return true;
}

function lockedVersions(lockfile, packageName) {
  const packages = lockfile.split("\npackages:\n")[1]?.split("\nsnapshots:\n")[0];
  assert.ok(packages, "Expected a pnpm packages section, not an empty or malformed lockfile");
  const escaped = packageName.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const key = new RegExp(`^ {2}(?:'${escaped}@([^']+)'|${escaped}@([^:\\r\\n]+)):$`, "gmu");
  return [...packages.matchAll(key)].map((match) => {
    const version = match[1] ?? match[2];
    assert.match(
      version,
      /^\d+\.\d+\.\d+$/u,
      `Expected an exact stable lock entry for ${packageName}`,
    );
    stableVersion(version);
    return version;
  });
}

test("security floors inspect every locked package version without counting peer snapshots", () => {
  const fixture = [
    "lockfileVersion: '9.0'",
    "packages:",
    "  example@1.2.3:",
    "    resolution: {}",
    "  example@2.0.0:",
    "    resolution: {}",
    "  '@scope/example@3.0.1':",
    "    resolution: {}",
    "snapshots:",
    "  example@1.2.3(peer@1.0.0): {}",
    "  example@2.0.0: {}",
  ].join("\n");
  assert.deepEqual(lockedVersions(fixture, "example"), ["1.2.3", "2.0.0"]);
  assert.deepEqual(lockedVersions(fixture, "@scope/example"), ["3.0.1"]);
  assert.deepEqual(lockedVersions(fixture, "removed-dependency"), []);
  assert.equal(atLeast("1.12.0", "1.11.0"), true);
  assert.equal(atLeast("1.2.10", "1.2.11"), false);
});

test("security floors never silently skip malformed or prerelease package versions", () => {
  assert.throws(() => lockedVersions("packages: {}", "example"));
  for (const version of ["1.2.3-beta.1", "latest", "1.2", "1.2.3+unknown", "~1.2.3", "^1.2.3"]) {
    assert.throws(() =>
      lockedVersions(`\npackages:\n  example@${version}:\nsnapshots:\n`, "example"),
    );
  }
});

test("SDK maintenance retains the audited Expo 58 and React Native 0.88 generation", async () => {
  const mobile = JSON.parse(await readFile(new URL("mobile/app/package.json", root), "utf8"));
  const dependencies = mobile.dependencies;
  assert.equal(stableVersion(dependencies.expo)[0], 58);
  assert.deepEqual(stableVersion(dependencies["react-native"]).slice(0, 2), [0, 88]);
  assert.deepEqual(stableVersion(dependencies.react).slice(0, 2), [19, 3]);
  assert.deepEqual(stableVersion(dependencies["react-dom"]).slice(0, 2), [19, 3]);
  assert.ok(atLeast(dependencies.expo, "58.0.21"), "retain the repaired SDK 58 patch floor");
  assert.ok(atLeast(dependencies["react-native"], "0.88.1"), "retain the compatible RN patch");
});

// Minimum patched versions from the October 29 primary-advisory review. These
// are security floors, not exact dependency pins: removal and later releases are
// allowed. The live no-exceptions audit still detects future advisories.
const securityFloors = [
  ["fastify", "5.12.2"],
  ["source-map-js", "1.2.2"],
  ["compression", "1.8.2"],
  ["shell-quote", "1.11.0"],
  ["launch-editor", "2.14.2"],
  ["node-forge", "1.4.2"],
  ["zod", "4.6.6"],
];

for (const [name, floor] of securityFloors) {
  test(`locked ${name} versions retain the ${floor} security floor`, async () => {
    const lockfile = await readFile(new URL("pnpm-lock.yaml", root), "utf8");
    for (const version of lockedVersions(lockfile, name)) {
      assert.ok(atLeast(version, floor), `${name}@${version} is below the patched ${floor} floor`);
    }
  });
}

test("brace-expansion keeps the security floor for each supported major", async () => {
  const lockfile = await readFile(new URL("pnpm-lock.yaml", root), "utf8");
  const floors = new Map([
    [1, "1.1.20"],
    [2, "2.1.6"],
    [3, "3.0.8"],
    [5, "5.0.11"],
  ]);
  for (const version of lockedVersions(lockfile, "brace-expansion")) {
    const [major] = stableVersion(version);
    assert.ok(
      major > 5 || (floors.has(major) && atLeast(version, floors.get(major))),
      `brace-expansion@${version} is below its supported patched floor`,
    );
  }
});

test("Vite keeps its bundled launch-editor repair on each maintained release line", async () => {
  const lockfile = await readFile(new URL("pnpm-lock.yaml", root), "utf8");
  for (const version of lockedVersions(lockfile, "vite")) {
    const [major, minor] = stableVersion(version);
    const patched =
      major > 8 ||
      (major === 8 &&
        (minor >= 3
          ? atLeast(version, "8.3.3")
          : minor === 2
            ? atLeast(version, "8.2.4")
            : minor === 1 && atLeast(version, "8.1.6"))) ||
      (major === 7 && atLeast(version, "7.3.7")) ||
      (major === 6 && atLeast(version, "6.4.4"));
    assert.ok(patched, `vite@${version} predates its bundled launch-editor security repair`);
  }
});
