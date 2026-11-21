import { CollectionMaterialSchema } from "@kierratysappi/contracts/collection-points";
import { DestinationIdSchema } from "@kierratysappi/recycling-engine";
import { describe, expect, it } from "vitest";
import { guideLibrary } from "../../guide/library";
import {
  destinationCategoryIcons,
  hsyCategoryIcon,
  objectDestinationIcon,
  pointCategoryIcons,
} from "../category-icons";

describe("recycling category artwork", () => {
  it("covers all point materials, packaging destinations and bundled FI/EN source types", () => {
    expect(Object.keys(pointCategoryIcons).sort()).toEqual(
      [...CollectionMaterialSchema.options].sort(),
    );
    expect(Object.keys(destinationCategoryIcons).sort()).toEqual(
      [...DestinationIdSchema.options].sort(),
    );
    if (!guideLibrary) throw new Error("Missing validated guide snapshot");
    const ids = new Set(
      guideLibrary.items.flatMap((item) =>
        [...item.fi.wasteTypes, ...item.en.wasteTypes].map(({ id }) => id),
      ),
    );
    for (const id of ids)
      expect(hsyCategoryIcon(id), `unmapped source waste type ${id}`).toBeDefined();
  });
  it("distinguishes lookalike categories and omits icons for unknown or conflicting rules", () => {
    expect(pointCategoryIcons.plastic).not.toBe(pointCategoryIcons.plasticPackaging);
    expect(pointCategoryIcons.batteries).not.toBe(pointCategoryIcons.carBatteries);
    expect(pointCategoryIcons.gardenWaste).not.toBe(pointCategoryIcons.foodWaste);
    expect(hsyCategoryIcon("unmapped-type")).toBeUndefined();
    expect(hsyCategoryIcon("__proto__")).toBeUndefined();
    expect(objectDestinationIcon([{ id: "unmapped-rule" }])).toBeUndefined();
    expect(
      objectDestinationIcon([{ id: "fi.object.phone" }, { id: "fi.object.battery" }]),
    ).toBeUndefined();
    expect(objectDestinationIcon([{ id: "hsy.object.textile" }], "worn")).toBe("textiles");
    expect(objectDestinationIcon([{ id: "hsy.object.textile" }], "reusable")).toBe("reuse");
    expect(objectDestinationIcon([{ id: "hsy.object.textile" }])).toBeUndefined();
  });
});
