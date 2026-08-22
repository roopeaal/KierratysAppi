import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const configUrl = new URL("../../biome.json", import.meta.url);

test("generated native projects stay outside repository formatting and linting", async () => {
  const config = JSON.parse(await readFile(configUrl, "utf8"));
  const includes = config.files?.includes;

  assert.ok(Array.isArray(includes), "biome files.includes must be configured");
  assert.ok(includes.includes("!apps/mobile/android"));
  assert.ok(includes.includes("!apps/mobile/ios"));
  assert.ok(includes.includes("!apps/mobile/expo-env.d.ts"));
});
