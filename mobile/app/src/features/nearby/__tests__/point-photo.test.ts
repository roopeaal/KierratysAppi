import type { CollectionMaterial } from "@kierratysappi/contracts/collection-points";
import { expect, it } from "vitest";
import { collectionPointPhoto } from "../point-photo";

it("chooses a representative image only from reported materials and type", () => {
  const photo = (...reportedMaterials: CollectionMaterial[]) =>
    collectionPointPhoto({ kind: "unknown", reportedMaterials });
  expect(photo()).toBeNull();
  expect(photo("batteries")).toBe("batteries");
  expect(photo("batteries", "carBatteries")).toBe("collection");
  expect(photo("carBatteries")).toBe("collection");
  expect(photo("clothes", "shoes")).toBe("textiles");
  expect(photo("paper")).toBe("paper");
  expect(photo("electricalAppliances")).toBe("electronics");
  expect(photo("cartons", "cardboard")).toBe("cardboard");
  expect(photo("glassBottles")).toBe("glass");
  expect(photo("glass")).toBe("collection");
  expect(photo("plasticPackaging")).toBe("plastic");
  expect(photo("smallMetal", "metalPackaging")).toBe("metal");
  expect(photo("scrapMetal")).toBe("collection");
  expect(photo("hazardousWaste", "smallMetal")).toBe("collection");
  expect(photo("plasticPackaging", "glassBottles", "paper")).toBe("packaging");
  expect(photo("plastic", "glassBottles")).toBe("collection");
  expect(collectionPointPhoto({ kind: "centre", reportedMaterials: ["scrapMetal"] })).toBe(
    "station",
  );
  expect(collectionPointPhoto({ kind: "centre", reportedMaterials: [] })).toBeNull();
});
