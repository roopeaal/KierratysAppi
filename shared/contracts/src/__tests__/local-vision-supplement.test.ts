import { describe, expect, it } from "vitest";
import {
  LocalVisionResultSchema,
  localVisionSupportedIdentifiers,
  normalizeLocalVisionResult,
} from "../local-vision";
import {
  packagingImageWeightSha256,
  packagingModelId,
  packagingModelRevision,
  packagingPromptsSha256,
  packagingPrototypesSha256,
  packagingScoreGroups,
} from "../packaging-classifier";

const source = {
  modelId: packagingModelId,
  modelRevision: packagingModelRevision,
  imageWeightSha256: packagingImageWeightSha256,
  prototypesSha256: packagingPrototypesSha256,
  promptsSha256: packagingPromptsSha256,
  promptPolicy: "packaging-visible-form-v1",
  preprocessing: "center-square-256-srgb-v1",
  computeUnits: "cpuOnly",
};
const scores = (updates: Record<string, number> = { bag: 0.35 }) =>
  packagingScoreGroups.map((group) => ({ group, cosine: updates[group] ?? 0.05 }));
function raw(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: "local-vision-v4",
    engine: "apple-vision",
    classificationPolicy: "apple-class-operating-point-v1",
    minimumPrecision: 0.9,
    minimumRecall: 0.01,
    classificationRevision: 2,
    ocrRevision: 3,
    ocrPolicy: "material-code-lexicon-v1",
    ocrLanguages: ["en-US"],
    osVersion: "26.7.0",
    observedAt: "2026-11-07T00:00:00.000Z",
    durationMs: 500,
    classifications: localVisionSupportedIdentifiers.map((identifier) => ({
      identifier,
      score: 0,
      hasPrecisionRecallCurve: false,
      passesOperatingPoint: false,
    })),
    textLines: ["PET 1"],
    supplement: { status: "observed", ...source, scores: scores() },
    ...overrides,
  };
}
const result = (overrides: Record<string, unknown> = {}) => {
  const value = normalizeLocalVisionResult(raw(overrides));
  if (value.status !== "observed") throw new Error("expected observation");
  return value;
};
const systemClasses = (ids: string[]) =>
  localVisionSupportedIdentifiers.map((identifier) => ({
    identifier,
    score: ids.includes(identifier) ? 0.9 : 0,
    hasPrecisionRecallCurve: ids.includes(identifier),
    passesOperatingPoint: ids.includes(identifier),
  }));

describe("local V4 supplemental object evidence", () => {
  it("uses an explicit model/cosine source without claiming material or product truth", () => {
    const value = result();
    expect(value.object).toMatchObject({
      status: "estimated",
      kind: "bag",
      method: "mobileclip-s0",
      policy: "loose",
      scoreMeaning: "cosine_similarity_not_probability",
    });
    expect(value.source.supplement).toMatchObject({
      status: "observed",
      ...source,
      gateVersion: "mobileclip-s0-forms-v1",
    });
    expect(value.source.verificationStatus).toBe("inferred");
    expect(value.source.minimumPrecision).toBe(0.9); // Primary class policy only.
    expect(value.source.supplement).not.toHaveProperty("scores");
    for (const field of ["material", "destination", "risk", "brand", "gtin", "parts"])
      expect(value).not.toHaveProperty(field);
    expect(value.markings.status).toBe("candidates"); // Still unconfirmed, no sort.
  });
  it("keeps a valid primary estimate without claiming the supplemental model ran", () => {
    const value = result({
      classifications: systemClasses(["bottle"]),
      supplement: { status: "skipped", reason: "primary_match" },
    });
    expect(value.object).toMatchObject({ status: "estimated", kind: "bottle" });
    expect(value.object).not.toHaveProperty("method");
    expect(value.source.supplement.status).toBe("skipped");
  });
  it("keeps conflicting primary kinds uncertain and skips the supplement", () => {
    expect(
      result({
        classifications: systemClasses(["bottle", "jar"]),
        supplement: { status: "skipped", reason: "primary_conflict" },
      }).object,
    ).toEqual({ status: "unknown", reason: "conflicting_kinds" });
  });
  for (const reason of ["model_unavailable", "processing_failed"]) {
    it(`preserves OCR and honest uncertainty on ${reason}`, () => {
      const value = result({ supplement: { status: "unavailable", reason } });
      expect(value.object.status).toBe("unknown");
      expect(value.markings.status).toBe("candidates");
      expect(value.source.supplement).toEqual({ status: "unavailable", reason });
    });
  }
  for (const [name, values] of [
    ["weak", scores({ bag: 0.19 })],
    ["ambiguous", scores({ bag: 0.25, box: 0.24 })],
    ["outside-kind", scores({ "other-battery": 0.7, bottle: 0.3 })],
  ] as const) {
    it(`refuses ${name} image similarity without discarding OCR`, () => {
      const value = result({ supplement: { status: "observed", ...source, scores: values } });
      expect(value.object.status).toBe("unknown");
      expect(value.markings.status).toBe("candidates");
      expect(value.source.supplement.status).toBe("observed");
    });
  }
  for (const [name, extra] of [
    ["wrong model", { ...source, modelId: "verified-product-model" }],
    ["wrong weights", { ...source, imageWeightSha256: "0".repeat(64) }],
    ["wrong prototypes", { ...source, prototypesSha256: "0".repeat(64) }],
    ["wrong prompts", { ...source, promptsSha256: "0".repeat(64) }],
    ["unversioned preprocessing", { ...source, preprocessing: "stretch-anything" }],
    ["unvalidated compute", { ...source, computeUnits: "all" }],
    ["factual extras", { ...source, material: "glass" }],
  ] as const) {
    it(`rejects ${name}`, () =>
      expect(
        normalizeLocalVisionResult(
          raw({ supplement: { status: "observed", ...extra, scores: scores() } }),
        ),
      ).toEqual({ status: "unavailable", reason: "invalid_response" }));
  }
  it("rejects missing and duplicate score groups", () => {
    for (const values of [scores().slice(1), [...scores().slice(1), scores()[1]]])
      expect(
        normalizeLocalVisionResult(
          raw({ supplement: { status: "observed", ...source, scores: values } }),
        ).status,
      ).toBe("unavailable");
  });
  it("does not silently supplement a primary match or conflict", () => {
    for (const ids of [["bottle"], ["bottle", "jar"]])
      expect(normalizeLocalVisionResult(raw({ classifications: systemClasses(ids) })).status).toBe(
        "unavailable",
      );
  });
  it("rejects a false skip without a matching primary decision", () => {
    for (const reason of ["primary_match", "primary_conflict"])
      expect(
        normalizeLocalVisionResult(raw({ supplement: { status: "skipped", reason } })).status,
      ).toBe("unavailable");
  });
  it("rejects a forged normalized model result lacking its source evidence", () => {
    const value = result();
    expect(
      LocalVisionResultSchema.safeParse({
        ...value,
        source: {
          ...value.source,
          supplement: { status: "unavailable", reason: "model_unavailable" },
        },
      }).success,
    ).toBe(false);
  });
  it("rejects silently promoting a legacy binary into the new model", () => {
    const value = result();
    expect(
      LocalVisionResultSchema.safeParse({
        ...value,
        source: { ...value.source, nativeSchemaVersion: "local-vision-v3" },
      }).success,
    ).toBe(false);
  });
});
