import { GtinSchema } from "@kierratysappi/domain";
import { describe, expect, it } from "vitest";
import { parseLookupHttpResponse } from "../lookup-response";

const gtin = GtinSchema.parse("3017620422003");

describe("lookup HTTP response boundary", () => {
  it("keeps a valid not-found response distinct from offline", () => {
    expect(parseLookupHttpResponse(404, { status: "not_found", gtin }, gtin)).toEqual({
      status: "not_found",
      gtin,
    });
  });

  it("turns malformed, mismatched, or status-confused responses into source unavailability", () => {
    for (const [status, payload] of [
      [500, { error: "proxy failure" }],
      [200, { status: "not_found", gtin }],
      [404, { status: "not_found", gtin: "6410405196811" }],
    ] as const) {
      expect(parseLookupHttpResponse(status, payload, gtin)).toEqual({
        status: "provider_unavailable",
        gtin,
        retryable: true,
      });
    }
  });
});
