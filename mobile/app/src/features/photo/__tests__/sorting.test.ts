import { PhotoEstimateSchema, photoModel } from "@kierratysappi/contracts/photo-recognition";
import { describe, expect, it } from "vitest";
import { canUsePhotoCapture, choosePhotoSize, sortConfirmedPhotoPart } from "../sorting";

function example(shape = "jar") {
  return PhotoEstimateSchema.parse({
    status: "estimated",
    observation: {
      status: "clear",
      confidence: "medium",
      risk: "ordinary_packaging",
      label: { fi: "Esimerkkipurkki", en: "Example jar" },
      parts: [
        {
          label: { fi: "Purkki", en: "Jar" },
          packagingStatus: "packaging",
          material: "glass",
          shape,
        },
      ],
    },
    source: {
      id: "openai-vision",
      model: photoModel,
      version: "photo-observation-v1",
      observedAt: "2026-10-15T12:00:00.000Z",
      verificationStatus: "inferred",
    },
  });
}
describe("photo confirmation", () => {
  it("requires a new purpose-matched native build but not a web/native simulator claim", () => {
    expect(canUsePhotoCapture("web", null, "storeClient")).toBe(true);
    expect(canUsePhotoCapture("ios", "1", "bare")).toBe(false);
    expect(canUsePhotoCapture("ios", null, "bare")).toBe(false);
    expect(canUsePhotoCapture("ios", "2", "bare")).toBe(true);
    expect(canUsePhotoCapture("android", "2", "bare")).toBe(true);
    expect(canUsePhotoCapture("ios", "200", "storeClient")).toBe(false);
  });
  it("does not issue guidance from an unconfirmed or unrelated part", () => {
    const estimate = example();
    const part = estimate.observation.parts[0];
    if (!part) throw new Error("fixture");
    expect(
      sortConfirmedPhotoPart(estimate, part, false, "fi", estimate.source.observedAt),
    ).toBeUndefined();
    expect(
      sortConfirmedPhotoPart(estimate, { ...part }, true, "fi", estimate.source.observedAt),
    ).toBeUndefined();
  });
  it("uses the versioned rule engine after an explicit local confirmation and retains provenance", () => {
    const estimate = example();
    const part = estimate.observation.parts[0];
    if (!part) throw new Error("fixture");
    const result = sortConfirmedPhotoPart(estimate, part, true, "fi", estimate.source.observedAt);
    expect(result?.status).toBe("resolved");
    if (result?.status === "resolved") {
      expect(result.destination.id).toBe("glass_packaging");
      expect(result.rule).toMatchObject({ jurisdiction: "FI", verificationStatus: "verified" });
      expect(result.rule.version).toBeTruthy();
      expect(result.rule.checkedAt).toBeTruthy();
      expect(result.confidence.tier).not.toBe("verified");
    }
  });
  it("never infers deposit eligibility for bottles", () => {
    const estimate = example("bottle");
    const part = estimate.observation.parts[0];
    if (!part) throw new Error("fixture");
    expect(
      sortConfirmedPhotoPart(estimate, part, true, "en", estimate.source.observedAt)?.status,
    ).toBe("ambiguous");
  });
  it("does not provide ordinary collection guidance for risky or uncertain estimates", () => {
    const estimate = example();
    const part = estimate.observation.parts[0];
    if (!part) throw new Error("fixture");
    for (const changes of [
      { risk: "special_waste" as const },
      { risk: "unknown" as const },
      { confidence: "low" as const },
      { status: "uncertain" as const },
    ])
      expect(
        sortConfirmedPhotoPart(
          { ...estimate, observation: { ...estimate.observation, ...changes } },
          part,
          true,
          "fi",
          estimate.source.observedAt,
        ),
      ).toBeUndefined();
  });
  it("chooses a bounded camera size and ignores malformed or excessive sizes", () => {
    expect(choosePhotoSize(["invalid", "4000x3000", "1920x1080", "1280x960", "640x480"])).toBe(
      "1280x960",
    );
    expect(choosePhotoSize(["0x0", "huge", "10000x10000"])).toBeUndefined();
  });
});
