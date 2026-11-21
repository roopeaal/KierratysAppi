import { ProductLookupResultSchema } from "@kierratysappi/contracts/lookup-schema";
import { GtinSchema } from "@kierratysappi/domain";
import { describe, expect, it, vi } from "vitest";
import { offlineCatalogue } from "../../local-vision/catalogue";
import {
  bundledBarcodeLookup,
  createLocalFirstLookup,
  lookupWithIdentityBackup,
  shouldSaveOnlineLookup,
} from "../local-first-lookup";
import { normalizePublicIdentity } from "../public-identity-lookup";

const gtin = GtinSchema.parse("3017620422003"),
  missing = GtinSchema.parse("6410405196811");
describe("local-first standalone barcode flow", () => {
  it("cancellation never dispatches a subsequent public fallback request", async () => {
    const controller = new AbortController();
    const online = vi.fn(async () => {
      controller.abort();
      throw Error("cancelled");
    });
    const fallback = vi.fn(async () => ({ status: "not_found" as const, gtin: missing }));
    await expect(
      createLocalFirstLookup(null, online, fallback)(missing, "fi", controller.signal),
    ).rejects.toThrow();
    expect(fallback).not.toHaveBeenCalled();
    online.mockClear();
    await expect(
      createLocalFirstLookup(null, online, fallback)(missing, "fi", controller.signal),
    ).rejects.toThrow();
    expect(online).not.toHaveBeenCalled();
  });
  it("falls back to a bundled identity when the network is unavailable", async () => {
    const online = vi.fn(async () => {
      throw Error("offline");
    });
    const result = await createLocalFirstLookup(offlineCatalogue, online)(gtin, "fi");
    expect(online).toHaveBeenCalledOnce();
    expect(result.status).toBe("packaging_missing");
    expect(ProductLookupResultSchema.safeParse(result).success).toBe(true);
    if (result.status !== "packaging_missing") throw Error("result");
    expect(result.product.name?.value).toBe("Nutella");
    expect(result.product.packagingComponents).toEqual([]);
    expect(result.product.name?.provenance.verificationStatus).toBe("community");
  });
  it("upgrades a bundled identity to packaging guidance instead of masking the network", async () => {
    const online = vi.fn(async () =>
      normalizePublicIdentity(
        {
          product: {
            code: gtin,
            packagings: [{ shape: { id: "en:jar" }, material: { id: "en:glass" } }],
          },
        },
        gtin,
        "en",
        "2026-11-19T23:00:00Z",
      ),
    );
    const backup = bundledBarcodeLookup(offlineCatalogue, gtin);
    const result = await lookupWithIdentityBackup(online, backup);
    expect(result).toMatchObject({
      status: "resolved",
      components: [{ sorting: { status: "resolved" } }],
    });
    if (result.status !== "resolved" || !backup) throw Error("result");
    expect(
      shouldSaveOnlineLookup({ ...result, cache: { ...result.cache, hit: true } }, backup),
    ).toBe(true);
    expect(shouldSaveOnlineLookup(backup, backup)).toBe(false);
    expect(shouldSaveOnlineLookup(backup, null)).toBe(false);
    expect(
      await lookupWithIdentityBackup(async () => ({ status: "not_found", gtin }), backup),
    ).toBe(backup);
    expect(
      await lookupWithIdentityBackup(
        async () => ({ status: "provider_unavailable", gtin, retryable: true }),
        backup,
      ),
    ).toBe(backup);
    const controller = new AbortController();
    await expect(
      lookupWithIdentityBackup(
        async () => {
          controller.abort();
          return { status: "not_found", gtin };
        },
        backup,
        controller.signal,
      ),
    ).rejects.toThrow("lookup_cancelled");
  });
  it("preserves canonical aliases and does not invent an absent code", () => {
    expect(bundledBarcodeLookup(offlineCatalogue, GtinSchema.parse("03017620422003"))?.status).toBe(
      "packaging_missing",
    );
    expect(bundledBarcodeLookup(offlineCatalogue, missing)).toBeNull();
    expect(bundledBarcodeLookup(null, gtin)).toBeNull();
  });
  it("calls online for an absent code and keeps its genuine404", async () => {
    const online = vi.fn(async () => ({ status: "not_found" as const, gtin: missing }));
    const fallback = vi.fn();
    expect(
      await createLocalFirstLookup(offlineCatalogue, online, fallback)(missing, "en"),
    ).toMatchObject({ status: "not_found" });
    expect(online).toHaveBeenCalledWith(missing, "en");
    expect(fallback).not.toHaveBeenCalled();
  });
  it("tries the public reader only for transport failure and preserves pending recovery if both fail", async () => {
    const error = new Error("controlled_transport");
    const online = vi.fn(async () => {
      throw error;
    });
    const fallback = vi.fn(async () => ({ status: "not_found" as const, gtin: missing }));
    expect(
      await createLocalFirstLookup(offlineCatalogue, online, fallback)(missing, "fi"),
    ).toMatchObject({ status: "not_found" });
    expect(fallback).toHaveBeenCalledOnce();
    await expect(
      createLocalFirstLookup(null, online, async () => {
        throw Error("offline");
      })(missing, "fi"),
    ).rejects.toBe(error);
  });
});
