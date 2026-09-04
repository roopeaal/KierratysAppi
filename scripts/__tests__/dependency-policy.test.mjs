import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { assessAdvisories, parseAuditReport } from "../audit-policy.mjs";

const workspaceUrl = new URL("../../pnpm-workspace.yaml", import.meta.url);

test("dependency resolution enforces the release-age gate without exclusions", async () => {
  const workspace = await readFile(workspaceUrl, "utf8");

  assert.match(workspace, /^minimumReleaseAge: 1440$/m);
  assert.match(workspace, /^minimumReleaseAgeStrict: true$/m);
  assert.doesNotMatch(workspace, /^minimumReleaseAgeExclude:/m);
});

test("locked fast-uri versions retain their patched security floors", async () => {
  const lockfile = await readFile(new URL("../../pnpm-lock.yaml", import.meta.url), "utf8");
  const versions = [...lockfile.matchAll(/^ {2}fast-uri@(\d+)\.(\d+)\.(\d+):/gm)];

  assert.ok(versions.length > 0, "expected the API fast-uri dependency in the lockfile");
  for (const [, majorText, minorText, patchText] of versions) {
    const [major, minor, patch] = [majorText, minorText, patchText].map(Number);
    const patched =
      major > 4 ||
      (major === 4 && (minor > 1 || (minor === 1 && patch >= 3))) ||
      (major === 3 && (minor > 1 || (minor === 1 && patch >= 6)));
    assert.ok(patched, `fast-uri ${major}.${minor}.${patch} is below the patched floor`);
  }
});

test("every high and critical advisory fails, including formerly excepted image-size IDs", () => {
  const ids = ["GHSA-w3rx-r6r6-pgpr", "GHSA-5p2g-fcmc-qvqq", "GHSA-new-advisory"];
  const advisories = ids.flatMap((github_advisory_id) =>
    ["high", "critical"].map((severity) => ({
      github_advisory_id,
      severity,
      title: "Security regression fixture",
    })),
  );

  const result = assessAdvisories(advisories);

  assert.equal(result.failures.length, advisories.length);
  assert.deepEqual(result.monitored, []);
});

test("lower-severity advisories remain visible without failing the high/critical gate", () => {
  const advisories = ["low", "moderate"].map((severity) => ({
    github_advisory_id: `GHSA-${severity}-fixture`,
    severity,
    title: "Monitored regression fixture",
  }));

  const result = assessAdvisories(advisories);

  assert.deepEqual(result.failures, []);
  assert.equal(result.monitored.length, advisories.length);
  assert.match(result.monitored[0], /^low: GHSA-low-fixture:/);
  assert.match(result.monitored[1], /^moderate: GHSA-moderate-fixture:/);
});

const emptyAuditReport = {
  advisories: {},
  metadata: { vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0 } },
};

test("valid registry reports are parsed without losing high-severity findings", () => {
  assert.deepEqual(parseAuditReport(JSON.stringify(emptyAuditReport), 0), []);
  const advisory = {
    github_advisory_id: "GHSA-high-fixture",
    severity: "high",
    title: "Security regression fixture",
  };
  const report = {
    advisories: { fixture: advisory },
    metadata: { vulnerabilities: { ...emptyAuditReport.metadata.vulnerabilities, high: 1 } },
  };

  assert.deepEqual(parseAuditReport(JSON.stringify(report), 1), [advisory]);
});

test("failed, malformed, incomplete and inconsistent registry reports fail closed", () => {
  const invalidReports = [
    "not json",
    "null",
    "[]",
    "{}",
    JSON.stringify({ error: { code: "REGISTRY_UNAVAILABLE" } }),
    JSON.stringify({ ...emptyAuditReport, error: { code: "REGISTRY_UNAVAILABLE" } }),
    JSON.stringify({ advisories: {} }),
    JSON.stringify({ ...emptyAuditReport, advisories: [] }),
    JSON.stringify({ ...emptyAuditReport, advisories: { fixture: null } }),
    JSON.stringify({
      ...emptyAuditReport,
      metadata: { vulnerabilities: { ...emptyAuditReport.metadata.vulnerabilities, high: 1 } },
    }),
    JSON.stringify({
      advisories: {
        fixture: { severity: "unknown", github_advisory_id: "GHSA-fixture", title: "Fixture" },
      },
      metadata: emptyAuditReport.metadata,
    }),
  ];
  for (const report of invalidReports) assert.throws(() => parseAuditReport(report, 0));
  for (const status of [null, 1, 2]) {
    assert.throws(() => parseAuditReport(JSON.stringify(emptyAuditReport), status));
  }
});
