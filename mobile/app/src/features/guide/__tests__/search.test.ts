import { describe, expect, it } from "vitest";
import {
  filterGuideMaterials,
  GUIDE_SEARCH_MAX_LENGTH,
  guideMaterials,
  parseGuideSearchParams,
} from "../search";

describe("local editorial guide search", () => {
  it("finds existing Finnish and English material aliases, including partial and accentless input", () => {
    for (const query of ["muovipullo", "MUOVI", "plastic bottle", "muov"])
      expect(filterGuideMaterials(query)).toEqual(["plastic"]);
    for (const query of ["pahvi", "cardboard", "kartonkitölkki", "kartonkitolkki"])
      expect(filterGuideMaterials(query)).toEqual(["carton"]);
    expect(filterGuideMaterials("glass jar")).toEqual(["glass"]);
    expect(filterGuideMaterials("säilyketölkki")).toEqual(["metal"]);
    expect(filterGuideMaterials("aluminum can")).toEqual(["metal"]);
  });

  it("returns no fabricated match for unknown products or unsupported item guides", () => {
    for (const query of ["Nutella", "paristot", "electronics", "not a plastic bottle", "<script>"])
      expect(filterGuideMaterials(query)).toEqual([]);
    expect(filterGuideMaterials("pullo")).toEqual(["plastic", "glass"]);
    expect(filterGuideMaterials("bottle")).toEqual(["plastic", "glass"]);
  });

  it("keeps the all-material reset and explicit material filters within the four existing guides", () => {
    expect(filterGuideMaterials("")).toEqual(guideMaterials);
    for (const material of guideMaterials)
      expect(filterGuideMaterials("", material)).toEqual([material]);
    expect(filterGuideMaterials("glass", "plastic")).toEqual([]);
  });

  it("normalizes bounded route strings and accepts only single-valued route arrays", () => {
    expect(parseGuideSearchParams({ query: "  PLASTIC   bottle  " })).toEqual({
      query: "PLASTIC bottle",
      material: null,
      invalid: false,
    });
    expect(parseGuideSearchParams({ query: ["pahvi"], material: ["carton"] })).toEqual({
      query: "pahvi",
      material: "carton",
      invalid: false,
    });
    expect(parseGuideSearchParams({})).toEqual({ query: "", material: null, invalid: false });
    expect(parseGuideSearchParams({ query: "", material: "" }).invalid).toBe(false);
  });

  it("rejects malformed, duplicate, controlled and overlong route values without truncation", () => {
    for (const params of [
      { query: ["plastic", "glass"] },
      { query: [] },
      { query: 123 },
      { query: {} },
      { query: null },
      { query: "glass\u0000" },
      { query: "glass\u202E" },
      { query: "p".repeat(GUIDE_SEARCH_MAX_LENGTH + 1) },
      { material: ["plastic", "glass"] },
      { material: 5 },
      { material: "electronics" },
    ])
      expect(parseGuideSearchParams(params).invalid).toBe(true);
    expect(filterGuideMaterials(`plastic${" ".repeat(GUIDE_SEARCH_MAX_LENGTH)}`)).toEqual([]);
    expect(filterGuideMaterials("glass\u0000")).toEqual([]);
  });
});
