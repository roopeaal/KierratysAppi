import { describe, expect, it, vi } from "vitest";
import {
  assertSafeTechnicalProperties,
  configureTechnicalEventSink,
  trackTechnicalEvent,
} from "../technical-events";

describe("technical telemetry boundary", () => {
  it("records only the typed aggregate properties", () => {
    const record = vi.fn();
    configureTechnicalEventSink({ record });
    trackTechnicalEvent("lookup_completed", {
      status: "resolved",
      providerId: "open-food-facts",
      cacheHit: false,
    });
    expect(record).toHaveBeenCalledWith("lookup_completed", {
      status: "resolved",
      providerId: "open-food-facts",
      cacheHit: false,
    });
  });

  it.each(["gtin", "barcode_value", "productName", "photoUri", "freeText"])(
    "rejects prohibited property %s",
    (key) => {
      expect(() => assertSafeTechnicalProperties({ [key]: "sensitive" })).toThrow(
        "Forbidden telemetry property",
      );
    },
  );
});
