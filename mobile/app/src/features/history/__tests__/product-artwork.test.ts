import type { MaterialFamily, PackagingShape, PackagingStatus } from "@kierratysappi/domain";
import { PackagingComponentObservationSchema } from "@kierratysappi/domain";
import { describe, expect, it } from "vitest";
import { historyArtworkFor } from "../product-artwork";

const provenance = {
  sourceId: "test",
  sourceName: "Test",
  sourceRecordId: "test",
  sourceUrl: "https://example.invalid/product",
  retrievedAt: "2026-11-19T12:00:00Z",
  confidence: 0.7,
  verificationStatus: "community",
  license: { id: "test", name: "Test", attributionText: "Test", shareAlike: false },
};
const component = (
  shape?: PackagingShape,
  material?: MaterialFamily,
  status: PackagingStatus = "packaging",
) =>
  PackagingComponentObservationSchema.parse({
    id: "fixture",
    packagingStatus: { value: status, provenance },
    ...(shape ? { shape: { value: shape, provenance } } : {}),
    ...(material ? { materialFamily: { value: material, provenance } } : {}),
  });

describe("history miniatures", () => {
  it("covers every supported packaging silhouette", () => {
    for (const shape of [
      "bottle",
      "can",
      "jar",
      "box",
      "carton",
      "bag",
      "wrap",
      "tray",
      "cup",
      "tube",
    ] as const) {
      expect(historyArtworkFor([component(shape)])).toBe(shape);
    }
  });
  it("uses reported material when no single silhouette is known", () => {
    for (const material of [
      "plastic",
      "carton",
      "paper",
      "glass",
      "metal",
      "wood",
      "composite",
    ] as const) {
      expect(historyArtworkFor([component(undefined, material)])).toBe(`${material}-material`);
    }
    expect(historyArtworkFor([component("bag", "plastic"), component("tray", "plastic")])).toBe(
      "plastic-material",
    );
  });
  it("ignores closures and does not guess when packaging is missing or conflicting", () => {
    expect(historyArtworkFor([component("bottle"), component("cap", "metal")])).toBe("bottle");
    for (const shape of ["cap", "lid", "pump", "other", "unknown"] as const) {
      expect(historyArtworkFor([component(shape)])).toBeUndefined();
    }
    expect(historyArtworkFor([])).toBeUndefined();
    expect(historyArtworkFor([component("bottle", "plastic", "non_packaging")])).toBeUndefined();
    expect(
      historyArtworkFor([component("bottle", "plastic"), component("box", "carton")]),
    ).toBeUndefined();
  });
});
