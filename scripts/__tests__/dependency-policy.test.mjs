import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workspaceUrl = new URL("../../pnpm-workspace.yaml", import.meta.url);

test("dependency resolution enforces the release-age gate without exclusions", async () => {
  const workspace = await readFile(workspaceUrl, "utf8");

  assert.match(workspace, /^minimumReleaseAge: 1440$/m);
  assert.match(workspace, /^minimumReleaseAgeStrict: true$/m);
  assert.doesNotMatch(workspace, /^minimumReleaseAgeExclude:/m);
});
