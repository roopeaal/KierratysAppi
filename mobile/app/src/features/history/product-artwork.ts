import type {
  MaterialFamily,
  PackagingComponentObservation,
  PackagingShape,
} from "@kierratysappi/domain";
import { z } from "zod";

const shapeArtwork = {
  bottle: "bottle",
  can: "can",
  jar: "jar",
  box: "box",
  carton: "carton",
  bag: "bag",
  wrap: "wrap",
  tray: "tray",
  cup: "cup",
  tube: "tube",
  cap: undefined,
  lid: undefined,
  pump: undefined,
  other: undefined,
  unknown: undefined,
} as const satisfies Record<PackagingShape, string | undefined>;

const materialArtwork = {
  plastic: "plastic-material",
  carton: "carton-material",
  paper: "paper-material",
  glass: "glass-material",
  metal: "metal-material",
  wood: "wood-material",
  composite: "composite-material",
  other: undefined,
  unknown: undefined,
} as const satisfies Record<MaterialFamily, string | undefined>;

export const HistoryArtworkSchema = z.enum([
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
  "plastic-material",
  "carton-material",
  "paper-material",
  "glass-material",
  "metal-material",
  "wood-material",
  "composite-material",
]);
export type HistoryArtwork = z.infer<typeof HistoryArtworkSchema>;

/** Only a decorative icon ID, never a material or sorting decision. */
export function historyArtworkFor(
  components: readonly PackagingComponentObservation[],
): HistoryArtwork | undefined {
  const packaging = components.filter(
    ({ packagingStatus, shape }) =>
      packagingStatus.value === "packaging" &&
      shape?.value !== "cap" &&
      shape?.value !== "lid" &&
      shape?.value !== "pump",
  );
  const shapes = new Set(packaging.map(({ shape }) => shapeArtwork[shape?.value ?? "unknown"]));
  if (shapes.size === 1) {
    const [shape] = shapes;
    if (shape) return shape;
  }
  const materials = new Set(
    packaging.map(({ materialFamily }) => materialArtwork[materialFamily?.value ?? "unknown"]),
  );
  if (materials.size === 1) return [...materials][0];
  return undefined;
}
