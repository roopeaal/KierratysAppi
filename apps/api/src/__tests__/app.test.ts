import { ProductResolutionService } from "@kierratysappi/application";
import type { ProductDataProvider } from "@kierratysappi/data-providers";
import { ProductObservationSchema, type FieldProvenance } from "@kierratysappi/domain";
import type { FastifyInstance } from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildApp } from "../app";

const apps: FastifyInstance[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

async function testApp(
  result: "found" | "not_found" | "error",
  allowedWebOrigins?: readonly string[],
) {
  const provenance: FieldProvenance = {
    sourceId: "fixture",
    sourceName: "Fixture",
    sourceRecordId: "3017620422003",
    sourceUrl: "https://example.test/product/3017620422003",
    retrievedAt: "2026-08-10T12:00:00.000Z",
    confidence: 0.8,
    verificationStatus: "manufacturer",
    license: {
      id: "fixture",
      name: "Fixture",
      attributionText: "Test fixture",
      shareAlike: false,
    },
  };
  const provider: ProductDataProvider = {
    id: "fixture",
    displayName: "Fixture",
    findByGtin: vi.fn(async (gtin) => {
      if (result === "not_found") return { status: "not_found" as const };
      if (result === "error") {
        return { status: "error" as const, code: "unavailable" as const, retryable: true };
      }
      return {
        status: "found" as const,
        product: ProductObservationSchema.parse({
          gtin,
          name: { value: "Testituote", provenance },
          packagingCompleteness: { value: "partial", provenance },
          packagingComponents: [
            {
              id: "jar",
              packagingStatus: { value: "packaging", provenance },
              materialFamily: { value: "glass", provenance },
              shape: { value: "jar", provenance },
              depositReturnStatus: { value: "no", provenance },
              conditions: { hazardousResidue: "no", pressurized: "no", emptied: "yes" },
            },
          ],
        }),
      };
    }),
  };
  const app = await buildApp({
    ...(allowedWebOrigins ? { allowedWebOrigins } : {}),
    lookupService: new ProductResolutionService({
      providers: [provider],
      now: () => new Date("2026-08-10T12:00:00.000Z"),
    }),
  });
  apps.push(app);
  return { app, provider };
}

describe("API", () => {
  it("serves liveness and generated OpenAPI documentation", async () => {
    const { app } = await testApp("found");
    const health = await app.inject({ method: "GET", url: "/v1/health" });
    const specification = await app.inject({ method: "GET", url: "/v1/openapi.json" });

    expect(health.statusCode).toBe(200);
    expect(health.json()).toEqual({ status: "ok", version: "0.1.0" });
    expect(specification.statusCode).toBe(200);
    expect(specification.json().paths).toHaveProperty("/v1/recycling/lookup");
  });

  it("normalizes manual separators and returns source-backed component guidance", async () => {
    const { app, provider } = await testApp("found");
    const response = await app.inject({
      method: "POST",
      url: "/v1/recycling/lookup",
      payload: { gtin: "3017 6204-22003", language: "fi" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["cache-control"]).toBe("private, no-store");
    expect(response.json()).toMatchObject({
      status: "resolved",
      gtin: "3017620422003",
      provider: { id: "fixture" },
      components: [{ sorting: { status: "resolved", destination: { id: "glass_packaging" } } }],
    });
    expect(provider.findByGtin).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid input before reaching a provider", async () => {
    const { app, provider } = await testApp("found");
    const invalidChecksum = await app.inject({
      method: "POST",
      url: "/v1/recycling/lookup",
      payload: { gtin: "3017620422004" },
    });
    const unexpectedField = await app.inject({
      method: "POST",
      url: "/v1/recycling/lookup",
      payload: { gtin: "3017620422003", secret: "must-not-be-accepted" },
    });

    expect(invalidChecksum.statusCode).toBe(400);
    expect(invalidChecksum.json()).toMatchObject({ error: { code: "invalid_gtin" } });
    expect(unexpectedField.statusCode).toBe(200);
    expect(unexpectedField.json()).not.toHaveProperty("secret");
    expect(provider.findByGtin).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["not_found", 404, "not_found"],
    ["error", 503, "provider_unavailable"],
  ] as const)("maps %s without leaking upstream detail", async (result, statusCode, status) => {
    const { app } = await testApp(result);
    const response = await app.inject({
      method: "POST",
      url: "/v1/recycling/lookup",
      payload: { gtin: "3017620422003", language: "en" },
    });

    expect(response.statusCode).toBe(statusCode);
    expect(response.json()).toMatchObject({ status, gtin: "3017620422003" });
  });

  it("limits request bodies and returns generic unknown routes", async () => {
    const { app } = await testApp("found");
    const oversized = await app.inject({
      method: "POST",
      url: "/v1/recycling/lookup",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ gtin: "3".repeat(3_000) }),
    });
    const missing = await app.inject({ method: "GET", url: "/not-a-route" });

    expect(oversized.statusCode).toBe(413);
    expect(oversized.json()).toMatchObject({ error: { code: "payload_too_large" } });
    expect(missing.statusCode).toBe(404);
    expect(missing.json()).toEqual({
      error: { code: "route_not_found", message: "Route not found." },
    });
  });

  it("allows only configured web origins", async () => {
    const { app } = await testApp("found", ["https://preview.example.com"]);
    const allowed = await app.inject({
      method: "OPTIONS",
      url: "/v1/recycling/lookup",
      headers: {
        origin: "https://preview.example.com",
        "access-control-request-method": "POST",
      },
    });
    const denied = await app.inject({
      method: "OPTIONS",
      url: "/v1/recycling/lookup",
      headers: {
        origin: "https://attacker.example",
        "access-control-request-method": "POST",
      },
    });

    expect(allowed.headers["access-control-allow-origin"]).toBe("https://preview.example.com");
    expect(denied.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
