import { spawnSync } from "node:child_process";

const severities = ["info", "low", "moderate", "high", "critical"];

export function parseAuditReport(stdout, status) {
  if (status !== 0 && status !== 1) throw new Error("Dependency audit command failed.");
  const report = JSON.parse(stdout);
  if (
    !report ||
    typeof report !== "object" ||
    Array.isArray(report) ||
    report.error ||
    !report.advisories ||
    typeof report.advisories !== "object" ||
    Array.isArray(report.advisories)
  ) {
    throw new Error("Dependency audit report is missing its advisory map.");
  }

  const counts = report.metadata?.vulnerabilities;
  if (
    !counts ||
    severities.some((severity) => !Number.isInteger(counts[severity]) || counts[severity] < 0)
  ) {
    throw new Error("Dependency audit report is missing valid vulnerability counts.");
  }

  const advisories = Object.values(report.advisories);
  if (
    advisories.some(
      (advisory) =>
        !advisory ||
        typeof advisory !== "object" ||
        !severities.includes(advisory.severity) ||
        typeof advisory.github_advisory_id !== "string" ||
        !advisory.github_advisory_id ||
        typeof advisory.title !== "string" ||
        !advisory.title,
    ) ||
    severities.some(
      (severity) =>
        advisories.filter((advisory) => advisory.severity === severity).length !== counts[severity],
    ) ||
    (status === 1 && advisories.length === 0)
  ) {
    throw new Error("Dependency audit advisory details and counts are inconsistent.");
  }

  return advisories;
}

export function assessAdvisories(advisories) {
  const failures = [];
  const monitored = [];

  for (const advisory of advisories) {
    const finding = `${advisory.github_advisory_id}: ${advisory.title}`;
    if (advisory.severity === "high" || advisory.severity === "critical") {
      failures.push(finding);
    } else {
      monitored.push(`${advisory.severity}: ${finding}`);
    }
  }

  return { failures, monitored };
}

function runAudit() {
  const packageManagerPath = process.env.npm_execpath;
  const audit = spawnSync(
    packageManagerPath ? process.execPath : "pnpm",
    packageManagerPath ? [packageManagerPath, "audit", "--json"] : ["audit", "--json"],
    {
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
      timeout: 60_000,
    },
  );

  let advisories;
  try {
    if (audit.error || audit.signal) throw new Error("Dependency audit command did not finish.");
    advisories = parseAuditReport(audit.stdout, audit.status);
  } catch {
    console.error("Dependency audit failed or returned an invalid report.");
    process.exitCode = 1;
    return;
  }

  const { failures, monitored } = assessAdvisories(advisories);
  for (const finding of monitored) console.warn(`Monitored ${finding}`);

  if (failures.length > 0) {
    console.error("High/critical dependency advisories (no exceptions):");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Audit policy passed (${advisories.length} total advisories reviewed).`);
}

if (import.meta.main) runAudit();
