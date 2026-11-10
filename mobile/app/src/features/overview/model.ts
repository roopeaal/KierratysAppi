import type { MaterialFamily } from "@kierratysappi/domain";

export const overviewMaterials = [
  "plastic",
  "carton",
  "glass",
  "metal",
  "paper",
  "wood",
  "composite",
  "other",
] as const satisfies readonly Exclude<MaterialFamily, "unknown">[];

export type OverviewMaterial = Exclude<MaterialFamily, "unknown">;

export type RecyclingEntry = {
  readonly id: string;
  readonly material: OverviewMaterial;
  readonly quantity: number;
  readonly label?: string;
  readonly recycledAt: string;
};

export type RecyclingSummary = {
  readonly version: 1;
  readonly counts: Record<OverviewMaterial, number>;
  readonly recent: RecyclingEntry[];
};

export function emptyRecyclingSummary(): RecyclingSummary {
  return {
    version: 1,
    counts: {
      plastic: 0,
      carton: 0,
      glass: 0,
      metal: 0,
      paper: 0,
      wood: 0,
      composite: 0,
      other: 0,
    },
    recent: [],
  };
}

export function totalRecycled(summary: RecyclingSummary): number {
  return overviewMaterials.reduce((total, material) => total + summary.counts[material], 0);
}

export function materialBreakdown(summary: RecyclingSummary) {
  const total = totalRecycled(summary);
  const rows = overviewMaterials.map((material) => {
    const count = summary.counts[material];
    const exact = total > 0 ? (count * 100) / total : 0;
    return { material, count, percentage: Math.floor(exact), remainder: exact % 1 };
  });
  const remaining = total > 0 ? 100 - rows.reduce((sum, row) => sum + row.percentage, 0) : 0;
  const ranked = [...rows].sort((left, right) => right.remainder - left.remainder);
  for (const row of ranked.slice(0, remaining)) row.percentage += 1;
  return rows.map(({ material, count, percentage }) => ({ material, count, percentage }));
}
