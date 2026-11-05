import type { SortingResult } from "@kierratysappi/recycling-engine";
import { overviewMaterials, type OverviewMaterial } from "./model";

const intents = new WeakMap<object, Map<string, string>>();

export function recordableMaterial(
  sorting: SortingResult,
  material: unknown,
): OverviewMaterial | undefined {
  if (sorting.status !== "resolved") return undefined;
  return overviewMaterials.find((candidate) => candidate === material);
}

export function recyclingIntent(scope: object, part: string): string {
  let parts = intents.get(scope);
  if (!parts) {
    parts = new Map();
    intents.set(scope, parts);
  }
  let id = parts.get(part);
  if (!id) {
    id = `recycled-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
    parts.set(part, id);
  }
  return id;
}
