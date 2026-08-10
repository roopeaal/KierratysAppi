import { spawnSync } from "node:child_process";

const approvedTemporaryExceptions = new Map([
  [
    "GHSA-w3rx-r6r6-pgpr",
    {
      expires: "2026-09-10",
      reason:
        "Transitive Metro build-tool parser; repository-controlled assets only. Patched image-size 2.0.3 is not published yet.",
    },
  ],
  [
    "GHSA-5p2g-fcmc-qvqq",
    {
      expires: "2026-09-10",
      reason:
        "Transitive Metro build-tool parser; repository-controlled assets only. Patched image-size 2.0.3 is not published yet.",
    },
  ],
]);

const audit = spawnSync("pnpm", ["audit", "--json"], {
  encoding: "utf8",
  maxBuffer: 20 * 1024 * 1024,
});

let report;
try {
  report = JSON.parse(audit.stdout);
} catch {
  console.error("Dependency audit did not return valid JSON.");
  if (audit.stderr) console.error(audit.stderr.trim());
  process.exitCode = 1;
}

if (report) {
  const rank = { low: 1, moderate: 2, high: 3, critical: 4 };
  const advisories = Object.values(report.advisories ?? {});
  const failures = [];

  for (const advisory of advisories) {
    if ((rank[advisory.severity] ?? 0) < rank.high) continue;
    const exception = approvedTemporaryExceptions.get(advisory.github_advisory_id);
    if (!exception) {
      failures.push(`${advisory.github_advisory_id}: ${advisory.title}`);
      continue;
    }
    const expiresAt = new Date(`${exception.expires}T23:59:59.999Z`);
    if (Date.now() > expiresAt.getTime()) {
      failures.push(
        `${advisory.github_advisory_id}: temporary exception expired ${exception.expires}`,
      );
      continue;
    }
    console.warn(
      `Temporarily accepted ${advisory.github_advisory_id} until ${exception.expires}: ${exception.reason}`,
    );
  }

  if (failures.length > 0) {
    console.error("Unaccepted high/critical dependency advisories:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log(`Audit policy passed (${advisories.length} total advisories reviewed).`);
  }
}
