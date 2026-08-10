import { describe, expect, it } from "vitest";
import { MATERIAL_CODE_INPUT_MAX_LENGTH, parseMaterialIdentificationCode } from "../material-code";

describe("parseMaterialIdentificationCode", () => {
  it.each([
    ["01 PET", "PET 1", "plastic", "PET plastic"],
    ["HDPE 2", "HDPE 2", "plastic", "HDPE plastic"],
    ["3 PVC", "PVC 3", "plastic", "PVC plastic"],
    ["04 LDPE", "LDPE 4", "plastic", "LDPE plastic"],
    ["♻ 05 PP", "PP 5", "plastic", "PP plastic"],
    ["PS-6", "PS 6", "plastic", "PS plastic"],
    ["PAP 20", "PAP 20", "carton", "corrugated fibreboard"],
    ["21 PAP", "PAP 21", "carton", "non-corrugated fibreboard"],
    ["PAP/22", "PAP 22", "paper", "paper"],
    ["FE 40", "FE 40", "metal", "steel"],
    ["41 ALU", "ALU 41", "metal", "aluminium"],
    ["FOR 50", "FOR 50", "wood", "wood"],
    ["51 FOR", "FOR 51", "wood", "cork"],
    ["COT 60", "COT 60", "other", "cotton"],
    ["61 TEX", "TEX 61", "other", "jute"],
    ["GL 70", "GL 70", "glass", "colourless glass"],
    ["71 GL", "GL 71", "glass", "green glass"],
    ["GL-72", "GL 72", "glass", "brown glass"],
  ] as const)("recognizes %s", (input, canonicalCode, materialFamily, englishName) => {
    const result = parseMaterialIdentificationCode(input);
    expect(result).toMatchObject({
      status: "recognized",
      canonicalCode,
      materialFamily,
      precision: "exact",
      materialName: { en: englishName },
    });
  });

  it("recognizes an explicit composite marker only as a group", () => {
    expect(parseMaterialIdentificationCode("C/PAP 84")).toMatchObject({
      status: "recognized",
      canonicalCode: "C/PAP 84",
      materialFamily: "composite",
      precision: "group",
    });
  });

  it("accepts a known number without an abbreviation", () => {
    expect(parseMaterialIdentificationCode("41")).toMatchObject({
      status: "recognized",
      canonicalCode: "ALU 41",
      materialFamily: "metal",
    });
  });

  it("requires the number when only an abbreviation is entered", () => {
    expect(parseMaterialIdentificationCode("PAP")).toEqual({
      status: "ambiguous",
      normalizedInput: "PAP",
      reason: "number_missing",
      candidateCodes: ["PAP 20", "PAP 21", "PAP 22"],
    });
  });

  it("rejects conflicting number and abbreviation markers", () => {
    expect(parseMaterialIdentificationCode("PET 41")).toMatchObject({
      status: "ambiguous",
      reason: "conflicting_markers",
      candidateCodes: ["ALU 41", "PET 1"],
    });
  });

  it("does not combine two visible codes into one material", () => {
    expect(parseMaterialIdentificationCode("PP 5 PAP 21")).toMatchObject({
      status: "ambiguous",
      reason: "multiple_codes",
      candidateCodes: ["PP 5", "PAP 21"],
    });
  });

  it.each(["", "7", "OTHER 7", "84", "puppet label", "C PP 5", "C/PAP 84 LABEL"])(
    "does not invent a mapping for %j",
    (input) => {
      expect(parseMaterialIdentificationCode(input).status).toBe("unrecognized");
    },
  );

  it("rejects an unknown abbreviation even when its number is otherwise defined", () => {
    expect(parseMaterialIdentificationCode("XYZ 5")).toEqual({
      status: "unrecognized",
      normalizedInput: "XYZ 5",
      reason: "unknown_code",
    });
  });

  it("bounds untrusted input before parsing", () => {
    const result = parseMaterialIdentificationCode("A".repeat(MATERIAL_CODE_INPUT_MAX_LENGTH + 1));
    expect(result).toMatchObject({ status: "unrecognized", reason: "too_long" });
  });
});
