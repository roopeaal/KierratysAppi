import { parseMaterialIdentificationCode } from "@kierratysappi/domain";
import { describe, expect, it } from "vitest";
import { sortRecognizedMaterialCode } from "../sorting";

const observedAt = "2026-08-10T12:00:00.000Z";

function recognize(input: string) {
  const result = parseMaterialIdentificationCode(input);
  if (result.status !== "recognized") {
    throw new Error(`Expected ${input} to be recognized`);
  }
  return result;
}

describe("sortRecognizedMaterialCode", () => {
  it("uses a confirmed PP code as a high-confidence inferred plastic observation", () => {
    const result = sortRecognizedMaterialCode({
      recognition: recognize("PP 5"),
      language: "en",
      observedAt,
    });

    expect(result).toMatchObject({
      status: "resolved",
      destination: { id: "plastic_packaging" },
      confidence: { score: 0.82, tier: "high" },
      trace: { decisiveFields: ["packagingStatus", "materialFamily"] },
    });
  });

  it("keeps glass ambiguous until the user confirms bottle or jar shape", () => {
    const result = sortRecognizedMaterialCode({
      recognition: recognize("GL 70"),
      language: "fi",
      observedAt,
    });

    expect(result).toMatchObject({
      status: "ambiguous",
      reason: "glass_shape_unknown",
      candidateDestinations: ["glass_packaging"],
    });
  });

  it("does not invent nationwide guidance for a composite group", () => {
    const result = sortRecognizedMaterialCode({
      recognition: recognize("C/PAP 84"),
      language: "en",
      observedAt,
    });

    expect(result).toMatchObject({
      status: "unknown",
      reason: "unsupported_material",
      confidence: { tier: "unknown" },
    });
  });
});
