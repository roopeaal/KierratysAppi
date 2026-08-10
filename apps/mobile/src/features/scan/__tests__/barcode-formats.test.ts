import { describe, expect, it } from "vitest";
import { SUPPORTED_BARCODE_TYPES } from "../barcode-formats";

describe("camera barcode formats", () => {
  it("does not treat compressed UPC-E payloads as GTIN-8", () => {
    expect(SUPPORTED_BARCODE_TYPES).toEqual(["ean13", "ean8", "upc_a"]);
    expect(SUPPORTED_BARCODE_TYPES).not.toContain("upc_e");
  });
});
