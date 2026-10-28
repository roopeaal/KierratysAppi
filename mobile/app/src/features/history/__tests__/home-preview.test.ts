import { describe, expect, it } from "vitest";
import { homeHistoryPreview } from "../home-preview";

const item = {
  gtin: "3017620422003",
  productName: "Saved product",
  resultStatus: "resolved",
  scannedAt: "2026-10-28T12:00:00Z",
};
describe("Home history preview", () => {
  it("is empty for disabled, empty and malformed storage", () => {
    for (const value of [
      null,
      {},
      "no",
      [],
      [
        null,
        {},
        { ...item, gtin: "123" },
        { ...item, scannedAt: "invalid" },
        { ...item, resultStatus: "verified" },
      ],
    ])
      expect(homeHistoryPreview(value, true)).toEqual([]);
    expect(homeHistoryPreview([item], false)).toEqual([]);
  });
  it("keeps only two distinct real records and does not invent material or destination", () => {
    const second = {
      ...item,
      gtin: "4006381333931",
      resultStatus: "packaging_missing",
      productName: undefined,
    };
    const third = { ...item, gtin: "5449000000996" };
    expect(homeHistoryPreview([item, item, second, third], true)).toEqual([item, second]);
    expect(Object.keys(homeHistoryPreview([item], true)[0] ?? {})).not.toContain("destination");
  });
  it("bounds names and falls back to GTIN without a fake name", () => {
    expect(
      homeHistoryPreview([{ ...item, productName: " x ".repeat(200) }], true)[0]?.productName
        ?.length,
    ).toBe(160);
    expect(homeHistoryPreview([{ ...item, productName: 7 }], true)[0]?.productName).toBeUndefined();
  });
});
