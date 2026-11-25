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
  it.each([
    ["6412000034840", ["plastic_packaging", "plastic_packaging", "carton_packaging"]],
    ["6412000030149", ["metal_collection", "carton_packaging"]],
    ["6412000030507", ["metal_collection", "carton_packaging"]],
  ] as const)(
    "keeps exact reviewed parts, licensing, and FI rules for %s",
    (code, destinations) => {
      for (const [lookupCode, language] of [
        [code, "fi"],
        ["0" + code, "en"],
      ] as const) {
        const result = reviewedBarcodeLookup(
          GtinSchema.parse(lookupCode),
          language,
          "2026-11-25T10:00:00.000Z",
        );
        expect(result).toMatchObject({
          gtin: lookupCode,
          status: "resolved",
          product: { packagingCompleteness: { value: "partial" } },
          cache: { hit: true },
        });
        if (result?.status !== "resolved") throw new Error("expected exact pack");
        expect(result.components).toHaveLength(destinations.length);
        expect(
          result.components.map(
            (part) => part.sorting.status === "resolved" && part.sorting.destination.id,
          ),
        ).toEqual(destinations);
        for (const part of result.components) {
          expect(part.observation.displayName?.value).toMatch(/\S/u);
          expect(part.observation.depositReturnStatus).toBeUndefined();
          expect(part.observation.materialFamily?.provenance).toMatchObject({
            sourceRecordId: code,
            sourceUrl: `https://world.openfoodfacts.org/product/${code}`,
            verificationStatus: "verified",
            license: { id: "odbl-1.0-dbcl-1.0", shareAlike: true },
          });
          expect(part.sorting).toMatchObject({
            rule: {
              jurisdiction: "FI",
              checkedAt: expect.any(String),
              version: expect.any(String),
            },
            explanation: { fi: expect.any(String), en: expect.any(String) },
          });
        }
      }
    },
  );
  it("does not match shipping cases, conflicting records or an observation before review", () => {
    const evaluated = "2026-11-25T10:00:00.000Z";
    for (const code of ["6412004034846", "6412001030148", "6412001030506", "6408430310876"]) {
      expect(reviewedBarcodeLookup(GtinSchema.parse(code), "fi", evaluated)).toBeNull();
    }
    expect(reviewedBarcodeLookup(GtinSchema.parse("6412000034840"), "fi", checked)).toBeNull();
  });
});
