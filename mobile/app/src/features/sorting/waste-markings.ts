import type { CollectionMaterial } from "@kierratysappi/contracts/collection-points";

// Familiar Rinki/HSY-style examples, not a universal bin or label standard.
// Never use these colors to infer accepted materials or sorting destinations.
export const wasteMarkings = {
  plastic: { color: "#E4B400", tint: "#FAEDC5" },
  carton: { color: "#2465A6", tint: "#E1EEF9" },
  glass: { color: "#FFFFFF", tint: "#F2F5F6" },
  metal: { color: "#25282C", tint: "#E9ECEF" },
  paper: { color: "#3D7946", tint: "#E8F3E6" },
  food: { color: "#795136", tint: "#F3E9DF" },
  hazardous: { color: "#BB3633", tint: "#F9E8E7" },
} as const;

type WasteMarking = keyof typeof wasteMarkings;
const pointMarking: Partial<Record<CollectionMaterial, WasteMarking>> = {
  plasticPackaging: "plastic",
  plasticBottles: "plastic",
  paperPackaging: "carton",
  cardboard: "carton",
  cartons: "carton",
  beverageCartons: "carton",
  glassBottles: "glass",
  metalPackaging: "metal",
  smallMetal: "metal",
  cans: "metal",
  paper: "paper",
  foodWaste: "food",
  hazardousWaste: "hazardous",
};

export function pointWasteMarking(material: CollectionMaterial) {
  const id = pointMarking[material];
  return id ? { id, ...wasteMarkings[id] } : undefined;
}
