import { describe, expect, it } from "vitest";
import { materialCodePrefill } from "../prefill";

describe("editable material-code route prefill", () => {
  it("accepts a complete known code but never performs confirmation or sorting", () => {
    expect(materialCodePrefill("PET 1")).toBe("PET 1");
    expect(materialCodePrefill("05 PP")).toBe("05 PP");
  });
  it("rejects arrays, plain numbers, oversized/control/unknown/conflicting input", () => {
    for (const input of [
      undefined,
      null,
      ["PET 1"],
      ["PET 1", "GL 70"],
      "1",
      "2026-11-03",
      "A".repeat(65),
      "PET 1\nGL 70",
      "PET 5",
      "UNKNOWN 6",
      "PET 1 GL 70",
      "PP 05 999999",
      "PP5----",
    ])
      expect(materialCodePrefill(input)).toBe("");
  });
});
