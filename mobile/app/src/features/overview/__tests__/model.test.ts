import { describe, expect, it } from "vitest";
import {
  emptyRecyclingSummary,
  materialBreakdown,
  overviewMaterials,
  totalRecycled,
} from "../model";

describe("recycling material totals", () => {
  it("starts empty without a fabricated percentage or material", () => {
    const summary = emptyRecyclingSummary();
    expect(totalRecycled(summary)).toBe(0);
    expect(materialBreakdown(summary)).toEqual(
      overviewMaterials.map((material) => ({ material, count: 0, percentage: 0 })),
    );
  });

  it("allocates rounded percentages to exactly 100 in stable material order", () => {
    const summary = emptyRecyclingSummary();
    summary.counts.plastic = 1;
    summary.counts.glass = 1;
    summary.counts.metal = 1;
    const rows = materialBreakdown(summary);
    expect(rows.filter((row) => row.count > 0)).toEqual([
      { material: "plastic", count: 1, percentage: 34 },
      { material: "glass", count: 1, percentage: 33 },
      { material: "metal", count: 1, percentage: 33 },
    ]);
    expect(rows.reduce((sum, row) => sum + row.percentage, 0)).toBe(100);
    expect(rows.filter((row) => row.count === 0).every((row) => row.percentage === 0)).toBe(true);
  });

  it("uses the number of recorded packaging parts for the division", () => {
    const summary = emptyRecyclingSummary();
    summary.counts.plastic = 7;
    summary.counts.paper = 2;
    summary.counts.carton = 1;
    expect(totalRecycled(summary)).toBe(10);
    expect(materialBreakdown(summary).find((row) => row.material === "plastic")?.percentage).toBe(
      70,
    );
    expect(materialBreakdown(summary).find((row) => row.material === "paper")?.percentage).toBe(20);
    expect(materialBreakdown(summary).find((row) => row.material === "carton")?.percentage).toBe(
      10,
    );
  });

  it("keeps the sum exact for small shares and large lifetime counters", () => {
    const summary = emptyRecyclingSummary();
    overviewMaterials.forEach((material, index) => {
      summary.counts[material] = index === 0 ? 1_000_000_000 : index + 1;
    });
    const before = JSON.stringify(summary);
    expect(materialBreakdown(summary).reduce((sum, row) => sum + row.percentage, 0)).toBe(100);
    expect(JSON.stringify(summary)).toBe(before);
  });

  it("keeps separate empty summaries independent", () => {
    const first = emptyRecyclingSummary();
    first.counts.plastic = 1;
    first.recent.push({
      id: "one",
      material: "plastic",
      quantity: 1,
      recycledAt: "2026-10-30T12:00:00.000Z",
    });
    expect(emptyRecyclingSummary().counts.plastic).toBe(0);
    expect(emptyRecyclingSummary().recent).toEqual([]);
  });
});
