import { describe, expect, it } from "vitest";
import { GtinSchema, hasValidGtinChecksum, normalizeGtinInput, parseGtin } from "../gtin";

describe("GTIN validation", () => {
  it.each(["96385074", "036000291452", "4006381333931", "00012345600012"])(
    "accepts valid canonical GTIN %s",
    (value) => {
      expect(parseGtin(value)).toEqual({ ok: true, value });
      expect(GtinSchema.parse(value)).toBe(value);
    },
  );

  it("normalizes manual ASCII whitespace and separators before validation", () => {
    expect(normalizeGtinInput(" 4006 3813-3393 1 ")).toBe("4006381333931");
    expect(parseGtin(" 4006 3813-3393 1 ")).toEqual({
      ok: true,
      value: "4006381333931",
    });
  });

  it.each([
    ["", "empty"],
    ["4006381333932", "checksum"],
    ["1234567", "length"],
    ["40063813339O1", "characters"],
    ["４００６３８１３３３９３１", "characters"],
  ] as const)("rejects %j as %s", (value, reason) => {
    expect(parseGtin(value)).toMatchObject({ ok: false, reason });
  });

  it("does not accept non-canonical strings through the runtime schema", () => {
    expect(GtinSchema.safeParse("4006 3813 3393 1").success).toBe(false);
  });

  it("checks all supported GTIN lengths with the same GS1 weighting", () => {
    expect(hasValidGtinChecksum("96385074")).toBe(true);
    expect(hasValidGtinChecksum("036000291452")).toBe(true);
    expect(hasValidGtinChecksum("4006381333931")).toBe(true);
    expect(hasValidGtinChecksum("00012345600012")).toBe(true);
  });
});
