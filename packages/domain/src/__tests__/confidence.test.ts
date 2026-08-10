import { describe, expect, it } from "vitest";
import { assessObservedFields, confidenceTier } from "../confidence";
import type { FieldProvenance, ObservedField, VerificationStatus } from "../models";

const baseProvenance: FieldProvenance = {
  sourceId: "test",
  sourceName: "Test source",
  sourceRecordId: "record-1",
  sourceUrl: "https://example.com/record-1",
  retrievedAt: "2026-08-10T00:00:00.000Z",
  confidence: 0.95,
  verificationStatus: "verified",
  license: {
    id: "test",
    name: "Test",
    attributionText: "Test",
    shareAlike: false,
  },
};

function field(confidence: number, verificationStatus: VerificationStatus): ObservedField<string> {
  return {
    value: "value",
    provenance: { ...baseProvenance, confidence, verificationStatus },
  };
}

describe("confidence assessment", () => {
  it("uses the least certain decisive field", () => {
    const result = assessObservedFields(
      [field(0.92, "verified"), field(0.55, "community")],
      ["Material came from community product data."],
    );

    expect(result).toEqual({
      score: 0.55,
      tier: "medium",
      reasons: ["Material came from community product data."],
    });
  });

  it("never labels high-confidence community data as verified", () => {
    expect(confidenceTier(0.98, ["community"])).toBe("high");
  });

  it("requires all decisive statuses to be verified-like", () => {
    expect(confidenceTier(0.94, ["verified", "manufacturer"])).toBe("verified");
    expect(confidenceTier(0.94, ["verified", "inferred"])).toBe("high");
  });

  it("returns unknown when no decisive field exists", () => {
    expect(assessObservedFields([], [])).toMatchObject({ score: 0, tier: "unknown" });
  });
});
