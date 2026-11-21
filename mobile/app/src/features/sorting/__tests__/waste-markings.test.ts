import { expect, it } from "vitest";
import { pointWasteMarking, wasteMarkings } from "../waste-markings";

it("keeps example label colors tied to the reported stream", () => {
  expect(pointWasteMarking("paper")?.id).toBe("paper");
  expect(pointWasteMarking("paperPackaging")?.id).toBe("carton");
  expect(pointWasteMarking("plasticPackaging")?.id).toBe("plastic");
  expect(pointWasteMarking("metalPackaging")?.id).toBe("metal");
  expect(pointWasteMarking("smallMetal")?.id).toBe("metal");
  expect(pointWasteMarking("glassBottles")).toEqual({ id: "glass", ...wasteMarkings.glass });
  expect(pointWasteMarking("foodWaste")?.id).toBe("food");
  expect(pointWasteMarking("hazardousWaste")?.id).toBe("hazardous");
  expect(new Set(Object.values(wasteMarkings).map(({ color }) => color)).size).toBe(7);
});

it("does not suggest packaging, deposit return or a universal specialty-bin color", () => {
  for (const material of [
    "plastic",
    "glass",
    "metal",
    "scrapMetal",
    "batteries",
    "carBatteries",
    "textiles",
    "clothes",
    "electricalAppliances",
  ] as const)
    expect(pointWasteMarking(material)).toBeUndefined();
});
