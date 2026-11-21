import type { CollectionMaterial } from "@kierratysappi/contracts/collection-points";
import type { DestinationId } from "@kierratysappi/recycling-engine";
import type { MaterialStudyKind } from "@/components/material-study";

/** Presentation only. Sharing a pictogram never equates materials or destinations. */
export const pointCategoryIcons = {
  glass: "glass",
  glassBottles: "glass",
  plastic: "plastic-object",
  plasticPackaging: "plastic",
  plasticBottles: "plastic",
  paper: "paper",
  paperPackaging: "carton",
  cardboard: "carton",
  cartons: "carton",
  beverageCartons: "carton",
  metal: "metal",
  metalPackaging: "metal",
  smallMetal: "small-metal",
  scrapMetal: "scrap-metal",
  cans: "metal",
  aluminium: "metal",
  batteries: "batteries",
  carBatteries: "vehicle-battery",
  electricalAppliances: "electronics",
  smallElectricalAppliances: "electronics",
  clothes: "textiles",
  textiles: "textiles",
  shoes: "shoes",
  wood: "wood",
  gardenWaste: "garden",
  foodWaste: "food",
  hazardousWaste: "hazardous",
  fluorescentTubes: "fluorescent",
  lightBulbs: "bulb",
  tyres: "tyres",
} as const satisfies Record<CollectionMaterial, MaterialStudyKind>;

export const destinationCategoryIcons = {
  deposit_return: "deposit",
  plastic_packaging: "plastic",
  carton_packaging: "carton",
  glass_packaging: "glass",
  metal_collection: "small-metal",
} as const satisfies Record<DestinationId, MaterialStudyKind>;

// Stable IDs from the packaged HSY taxonomy, not guesses based on titles or search terms.
const hsyIcons: ReadonlyMap<string, MaterialStudyKind> = new Map([
  ["181", "food"],
  ["184", "metal"],
  ["186", "plastic-object"],
  ["188", "hazardous"],
  ["192", "paper"],
  ["194", "wood"],
  ["196", "garden"],
  ["198", "construction"],
  ["200", "tyres"],
  ["202", "branches"],
  ["206", "vehicles"],
  ["209", "mixed"],
  ["212", "electronics"],
  ["214", "textiles"],
  ["216", "plaster"],
  ["222", "plastic"],
  ["225", "vehicle-battery"],
  ["228", "medicine"],
  ["231", "special-waste"],
  ["233", "mineral-waste"],
  ["236", "bulky"],
  ["238", "carton"],
  ["240", "mineral-waste"],
  ["242", "reuse"],
  ["244", "glass"],
  ["246", "soil"],
  ["18321", "insulation"],
  ["21143", "asbestos"],
  ["21276", "treated-wood"],
  ["21287", "small-metal"],
  ["26711", "private-paper"],
  ["28203", "other"],
  ["28420", "mixed"],
] as const);

export function hsyCategoryIcon(wasteTypeId: string) {
  return hsyIcons.get(wasteTypeId);
}

const objectRules = {
  "fi.deposit.palpa": "deposit",
  "fi.packaging.plastic": "plastic",
  "fi.packaging.carton": "carton",
  "fi.packaging.glass": "glass",
  "fi.packaging.metal": "small-metal",
  "fi.object.small-metal": "small-metal",
  "fi.object.battery": "batteries",
  "fi.object.phone": "electronics",
} as const satisfies Record<string, MaterialStudyKind>;

/** For a resolved single-rule answer only; unmapped paths keep their original text. */
export function objectDestinationIcon(sources: readonly { id: string }[], lastAnswer?: string) {
  const key = sources.length === 1 ? sources[0]?.id : undefined;
  if (key === "hsy.object.textile")
    return lastAnswer === "reusable" ? "reuse" : lastAnswer === "worn" ? "textiles" : undefined;
  return key && Object.hasOwn(objectRules, key)
    ? objectRules[key as keyof typeof objectRules]
    : undefined;
}
