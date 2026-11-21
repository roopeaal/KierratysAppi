// Exactly one public food-code GET, no account, owner data, retries or paid calls.
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = fs.realpathSync(process.cwd()),
  run = path.resolve(root, process.argv[2]);
assert(run.startsWith(`${root}/work/`) && fs.realpathSync(run) === run);
assert(!fs.existsSync(path.join(run, "public-smoke.json")), "no_automatic_repeat");
const require = createRequire(import.meta.url),
  { build } = createRequire(require.resolve("tsup"))("esbuild");
const out = path.join(run, "public-lookup.mjs");
await build({
  entryPoints: ["mobile/app/src/features/scan/public-identity-lookup.ts"],
  outfile: out,
  bundle: true,
  platform: "node",
  format: "esm",
});
const { createPublicIdentityLookup } = await import(pathToFileURL(out));
const calls = [];
const result = await createPublicIdentityLookup(async (url, init) => {
  assert.equal(calls.length, 0);
  const response = await fetch(url, init);
  calls.push({ status: response.status, contentType: response.headers.get("content-type") });
  return response;
})("6408430030309", "fi");
fs.writeFileSync(
  path.join(run, "public-smoke.json"),
  JSON.stringify(
    {
      calls,
      status: result.status,
      productName: result.product?.name?.value,
      community: result.product?.name?.provenance.verificationStatus,
      licence: result.product?.name?.provenance.license.id,
      packaging: result.components?.map(({ observation, sorting }) => ({
        material: observation.materialFamily?.value,
        shape: observation.shape?.value,
        destination: sorting.destination?.id,
      })),
    },
    null,
    2,
  ),
  { flag: "wx" },
);
assert.equal(result.status, "resolved", "public_packaging_not_resolved");
assert.equal(result.product.name?.provenance.verificationStatus, "community");
assert.ok(result.components.some(({ sorting }) => sorting.destination?.id === "plastic_packaging"));
console.log(
  "One public food code returned structured plastic film evidence and sourced sorting guidance.",
);
