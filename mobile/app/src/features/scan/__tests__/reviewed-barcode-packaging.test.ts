import { GtinSchema } from "@kierratysappi/domain";
import { describe, expect, it } from "vitest";
import { reviewedBarcodeLookup } from "../reviewed-barcode-packaging";

const checked = "2026-11-19T12:00:00.000Z";

describe("reviewed local barcode observations", () => {
  it.each([
    ["6415600502078", "fi", "Coca-Cola Zero Sugar 1,5 l"],
    ["06415600502078", "en", "Coca-Cola Zero Sugar 1.5 L"],
  ] as const)(
    "uses exact or zero-padded GTIN %s, the original source and the Finnish rule",
    (code, language, name) => {
      const result = reviewedBarcodeLookup(GtinSchema.parse(code), language, checked);
      expect(result).toMatchObject({
        status: "resolved",
        cache: { hit: true, storedAt: "2026-11-19T00:00:00.000Z" },
        product: { name: { value: name }, packagingCompleteness: { value: "partial" } },
        components: [
          {
            observation: {
              shape: { value: "bottle" },
              materialFamily: { value: "plastic" },
              depositReturnStatus: {
                value: "yes",
                provenance: {
                  sourceName: "S-kaupat",
                  sourceRecordId: "6415600502078",
                  lastConfirmedAt: "2026-11-19T00:00:00.000Z",
                },
              },
            },
            sorting: {
              status: "resolved",
              destination: { id: "deposit_return" },
              confidence: { tier: "high" },
            },
          },
        ],
      });
    },
  );
  it("does not borrow packaging from other valid codes or before the recorded observation", () => {
    expect(reviewedBarcodeLookup(GtinSchema.parse("5449000000996"), "fi", checked)).toBeNull();
    expect(
      reviewedBarcodeLookup(GtinSchema.parse("6415600502078"), "fi", "2026-11-18T10:00:00.000Z"),
    ).toBeNull();
  });
});
