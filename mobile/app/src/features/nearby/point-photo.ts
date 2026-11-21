import type {
  CollectionMaterial,
  CollectionPoint,
} from "@kierratysappi/contracts/collection-points";
import { nearbyMaterialGroups } from "./results";

type Report = Pick<CollectionPoint, "kind" | "reportedMaterials">;
const packagingGroups: readonly (readonly CollectionMaterial[])[] = [
  ["plasticPackaging", "plasticBottles"],
  ["glass", "glassBottles"],
  ["metalPackaging", "smallMetal", "cans", "scrapMetal", "metal", "aluminium"],
  nearbyMaterialGroups.cardboard,
  nearbyMaterialGroups.paper,
];

/** Selects a fictional example, not an inference about actual acceptance or site appearance. */
export function collectionPointPhoto({ kind, reportedMaterials: materials }: Report) {
  if (materials.length === 0) return null;
  if (kind === "centre") return "station";
  const only = (values: readonly CollectionMaterial[]) =>
    materials.every((material) => values.includes(material));
  if (only(["batteries"])) return "batteries";
  if (only(nearbyMaterialGroups.textiles)) return "textiles";
  if (only(nearbyMaterialGroups.paper)) return "paper";
  if (only(nearbyMaterialGroups.electronics)) return "electronics";
  if (only(nearbyMaterialGroups.cardboard)) return "cardboard";
  if (only(["glassBottles"])) return "glass";
  if (only(["plasticPackaging", "plasticBottles"])) return "plastic";
  if (only(["metalPackaging", "smallMetal", "cans", "aluminium"])) return "metal";
  const groups = packagingGroups.filter((group) =>
    materials.some((material) => group.includes(material)),
  );
  if (groups.length >= 2 && only(packagingGroups.flat())) return "packaging";
  return "collection";
}
