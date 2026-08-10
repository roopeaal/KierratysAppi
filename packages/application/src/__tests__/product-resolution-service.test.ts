import type { ProductDataProvider, ProviderRequestContext } from "@kierratysappi/data-providers";
import {
  GtinSchema,
  ProductObservationSchema,
  type FieldProvenance,
  type Gtin,
  type ProviderProductResult,
} from "@kierratysappi/domain";
import { describe, expect, it, vi } from "vitest";
import { ProductResolutionService } from "../product-resolution-service";

const gtin = GtinSchema.parse("3017620422003");

const provenance: FieldProvenance = {
  sourceId: "test-provider",
  sourceName: "Test provider",
  sourceRecordId: gtin,
  sourceUrl: `https://example.test/product/${gtin}`,
  retrievedAt: "2026-08-10T10:00:00.000Z",
  confidence: 0.8,
  verificationStatus: "manufacturer",
  license: {
    id: "test",
    name: "Test data",
    attributionText: "Test fixture",
    shareAlike: false,
  },
};

function product(withPackaging: boolean) {
  return ProductObservationSchema.parse({
    gtin,
    name: { value: "Testituote", provenance },
    packagingCompleteness: { value: withPackaging ? "complete" : "unknown", provenance },
    packagingComponents: withPackaging
      ? [
          {
            id: "jar",
            displayName: { value: "Lasipurkki", provenance },
            packagingStatus: { value: "packaging", provenance },
            materialFamily: { value: "glass", provenance },
            shape: { value: "jar", provenance },
            depositReturnStatus: { value: "no", provenance },
            conditions: { hazardousResidue: "no", pressurized: "no", emptied: "yes" },
          },
        ]
      : [],
  });
}

function provider(
  id: string,
  resolver: (gtin: Gtin, context: ProviderRequestContext) => Promise<ProviderProductResult>,
): ProductDataProvider {
  return { id, displayName: `Provider ${id}`, findByGtin: resolver };
}

describe("ProductResolutionService", () => {
  it("resolves every packaging component through the policy engine", async () => {
    const service = new ProductResolutionService({
      providers: [provider("primary", async () => ({ status: "found", product: product(true) }))],
      now: () => new Date("2026-08-10T12:00:00.000Z"),
    });

    const result = await service.lookup({ gtin, country: "FI", language: "fi" });
    expect(result.status).toBe("resolved");
    if (result.status !== "resolved") return;
    expect(result.provider.id).toBe("primary");
    expect(result.cache.hit).toBe(false);
    expect(result.components[0]?.sorting).toMatchObject({
      status: "resolved",
      destination: { id: "glass_packaging" },
    });
  });

  it("keeps missing packaging distinct from an unknown product", async () => {
    const service = new ProductResolutionService({
      providers: [provider("primary", async () => ({ status: "found", product: product(false) }))],
    });

    await expect(service.lookup({ gtin, country: "FI", language: "en" })).resolves.toMatchObject({
      status: "packaging_missing",
      missingFields: ["packagingComponents"],
    });
  });

  it("falls back after provider failure and does not expose the upstream error", async () => {
    const service = new ProductResolutionService({
      providers: [
        provider("first", async () => ({ status: "error", code: "unavailable", retryable: true })),
        provider("second", async () => ({ status: "found", product: product(true) })),
      ],
    });

    const result = await service.lookup({ gtin, country: "FI", language: "fi" });
    expect(result.status).toBe("resolved");
    if (result.status === "resolved") {
      expect(result.provider.id).toBe("second");
    }
  });

  it("caches found results by locale and exposes freshness", async () => {
    const findByGtin = vi.fn(async () => ({ status: "found" as const, product: product(true) }));
    const service = new ProductResolutionService({
      providers: [provider("primary", findByGtin)],
      now: () => new Date("2026-08-10T12:00:00.000Z"),
    });

    await service.lookup({ gtin, country: "FI", language: "fi" });
    const cached = await service.lookup({ gtin, country: "FI", language: "fi" });
    await service.lookup({ gtin, country: "FI", language: "en" });

    expect(findByGtin).toHaveBeenCalledTimes(2);
    expect(cached.status).toBe("resolved");
    if (cached.status === "resolved") {
      expect(cached.cache.hit).toBe(true);
      expect(cached.cache.expiresAt).toBe("2026-08-10T18:00:00.000Z");
    }
  });

  it("returns not-found only when every provider completed successfully", async () => {
    const notFoundService = new ProductResolutionService({
      providers: [provider("primary", async () => ({ status: "not_found" }))],
    });
    const unavailableService = new ProductResolutionService({
      providers: [
        provider("primary", async () => ({
          status: "error",
          code: "rate_limited",
          retryable: true,
        })),
      ],
    });

    await expect(notFoundService.lookup({ gtin, country: "FI", language: "fi" })).resolves.toEqual({
      status: "not_found",
      gtin,
    });
    await expect(
      unavailableService.lookup({ gtin, country: "FI", language: "fi" }),
    ).resolves.toEqual({
      status: "provider_unavailable",
      gtin,
      retryable: true,
    });
  });

  it("rejects construction without a provider", () => {
    expect(() => new ProductResolutionService({ providers: [] })).toThrow(
      "At least one product data provider is required",
    );
  });
});
