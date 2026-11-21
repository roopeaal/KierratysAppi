import { describe, expect, it } from "vitest";
import {
  emptyRecyclingSummary,
  materialBreakdown,
  overviewMaterials,
  recentRecyclingActivity,
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

describe("recent recycling activity", () => {
  it("uses seven local calendar dates, excluding old and future records", () => {
    const now = new Date(2026, 2, 31, 18);
    const entry = (id: string, day: number, hour: number, quantity: number) => ({
      id,
      material: "glass" as const,
      quantity,
      recycledAt: new Date(2026, 2, day, hour).toISOString(),
    });
    const latest = entry("latest", 31, 12, 4);
    const activity = recentRecyclingActivity(
      [
        entry("start", 25, 0, 1),
        entry("on-sunday", 29, 22, 2),
        latest,
        entry("old", 24, 23, 15),
        entry("sunday-earlier", 29, 10, 3),
        entry("future-same-day", 31, 19, 40),
        entry("tomorrow", 32, 10, 40),
      ],
      now,
    );
    expect(activity.days.map((day) => day.date.getDate())).toEqual([25, 26, 27, 28, 29, 30, 31]);
    expect(activity.days.map((day) => day.count)).toEqual([1, 0, 0, 0, 5, 0, 4]);
    expect(activity.total).toBe(10);
    expect(activity.latest).toEqual(latest);
  });

  it("does not invent recent activity from undated lifetime totals", () => {
    const summary = emptyRecyclingSummary();
    summary.counts.plastic = 500;
    const activity = recentRecyclingActivity(summary.recent, new Date(2026, 0, 3, 12));
    expect(activity.days.map((day) => day.date.getDate())).toEqual([28, 29, 30, 31, 1, 2, 3]);
    expect(activity.total).toBe(0);
    expect(activity.latest).toBeUndefined();
  });
});
