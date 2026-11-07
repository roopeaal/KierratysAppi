import { describe, expect, it } from "vitest";
import {
  decidePackagingScores,
  packagingScoreGroups,
  PackagingScoresSchema,
} from "../packaging-classifier";

const scores = (updates: Partial<Record<(typeof packagingScoreGroups)[number], number>> = {}) =>
  packagingScoreGroups.map((group) => ({ group, cosine: updates[group] ?? 0 }));

describe("preregistered visible-form similarity rejection", () => {
  it("accepts only an inferred visible kind, not product/material/safety/bin truth", () => {
    const decision = decidePackagingScores(scores({ jar: 0.6, bottle: 0.4 }), "strict");
    expect(decision).toEqual({
      status: "estimated",
      kind: "jar",
      cosine: 0.6,
      runnerUpCosine: 0.4,
      policy: "strict",
      scoreMeaning: "cosine_similarity_not_probability",
    });
  });
  for (const group of packagingScoreGroups.filter((id) => id.startsWith("other-"))) {
    it(`refuses outside-kind winner ${group}`, () => {
      expect(decidePackagingScores(scores({ [group]: 0.9, bottle: 0.7 }), "loose")).toEqual({
        status: "unknown",
        reason: "unsupported_kind",
      });
    });
  }
  it("refuses weak similarity rather than forcing one of five classes", () => {
    expect(decidePackagingScores(scores({ bag: 0.19 }), "loose")).toEqual({
      status: "unknown",
      reason: "weak_similarity",
    });
  });
  it("refuses a close competing visible kind", () => {
    expect(decidePackagingScores(scores({ jar: 0.5, bottle: 0.49 }), "strict")).toEqual({
      status: "unknown",
      reason: "ambiguous_similarity",
    });
  });
  it("compares the runner-up against outside-kind groups too", () => {
    expect(
      decidePackagingScores(scores({ bottle: 0.5, "other-aerosol": 0.49 }), "strict"),
    ).toMatchObject({ status: "unknown", reason: "ambiguous_similarity" });
  });
  it("rejects ties independently of raw response order", () => {
    const tied = scores({ bottle: 0.6, jar: 0.6 });
    expect(decidePackagingScores(tied, "loose").status).toBe("unknown");
    expect(decidePackagingScores(tied.reverse(), "loose").status).toBe("unknown");
  });
  it("does not treat negative cosine scores as probabilities", () => {
    expect(PackagingScoresSchema.safeParse(scores({ jar: -0.7 })).success).toBe(true);
    expect(decidePackagingScores(scores({ jar: -0.7 }), "loose").status).toBe("unknown");
  });
  for (const [name, value] of [
    ["missing negative group", scores().slice(1)],
    ["duplicated group", [...scores().slice(1), scores()[1]]],
    ["unexpected group", [...scores().slice(1), { group: "verified-glass", cosine: 0.9 }]],
    ["NaN", scores().map((entry, i) => (i === 0 ? { ...entry, cosine: Number.NaN } : entry))],
    ["Infinity", scores().map((entry, i) => (i === 0 ? { ...entry, cosine: Infinity } : entry))],
    ["out of range", scores().map((entry, i) => (i === 0 ? { ...entry, cosine: 1.1 } : entry))],
    ["extra factual claim", scores().map((entry) => ({ ...entry, material: "glass" }))],
  ]) {
    it(`rejects ${name}`, () => {
      expect(decidePackagingScores(value, "strict")).toEqual({
        status: "unknown",
        reason: "invalid_scores",
      });
    });
  }
  it("does not accept an unregistered threshold policy", () => {
    expect(decidePackagingScores(scores({ bottle: 0.9 }), { minimumCosine: 0 })).toEqual({
      status: "unknown",
      reason: "invalid_policy",
    });
  });
});
