import { z } from "zod";

export const packagingModelId = "apple-mobileclip-s0-coreml-2024" as const;
export const packagingModelRevision = "55c8098c12ba8f928e37e26b2e1dd097777c3f98" as const;
export const packagingImageWeightSha256 =
  "87d8f63997bbd2f38ba7defeaaa2c571928bdece56aa9629542198b3ce906ed6" as const;
export const packagingPrototypesSha256 =
  "0dfe73569d1b2177629d95c4bc21c1392be9228aff6809cab0ed1c3358893c81" as const;
export const packagingPromptsSha256 =
  "aa726197e10fc1911b88bb6d6da099220339133c6e39e500f112b9077316e610" as const;
export const packagingDeployedGate = "loose" as const;
export const packagingGateVersion = "mobileclip-s0-forms-v1" as const;

/** Fixed prompt groups; these are visible forms, never materials or verified products. */
export const packagingPositiveGroups = ["bottle", "jar", "box", "bag", "cup"] as const;
export const packagingNegativeGroups = [
  "other-battery",
  "other-phone",
  "other-book",
  "other-food",
  "other-person",
  "other-animal",
  "other-leaf",
  "other-clothes",
  "other-electronics",
  "other-tools",
  "other-plate",
  "other-aerosol",
  "other-drink-can",
] as const;
export const packagingScoreGroups = [...packagingPositiveGroups, ...packagingNegativeGroups];
export type PackagingKind = (typeof packagingPositiveGroups)[number];
export const PackagingGatePolicySchema = z.enum(["strict", "medium", "loose"]);
export type PackagingGatePolicy = z.infer<typeof PackagingGatePolicySchema>;
/** Preregistered engineering gates, not calibrated factual-confidence percentages. */
export const packagingGatePolicies = {
  strict: { minimumCosine: 0.3, minimumLead: 0.03 },
  medium: { minimumCosine: 0.25, minimumLead: 0.025 },
  loose: { minimumCosine: 0.2, minimumLead: 0.02 },
} as const;

const GroupSchema = z.enum(packagingScoreGroups);
export const PackagingScoresSchema = z
  .array(z.object({ group: GroupSchema, cosine: z.number().finite().min(-1).max(1) }).strict())
  .length(packagingScoreGroups.length)
  .refine((scores) => new Set(scores.map((score) => score.group)).size === scores.length);
export type PackagingScores = z.infer<typeof PackagingScoresSchema>;
export const PackagingModelSourceSchema = z
  .object({
    modelId: z.literal(packagingModelId),
    modelRevision: z.literal(packagingModelRevision),
    imageWeightSha256: z.literal(packagingImageWeightSha256),
    prototypesSha256: z.literal(packagingPrototypesSha256),
    promptsSha256: z.literal(packagingPromptsSha256),
    promptPolicy: z.literal("packaging-visible-form-v1"),
    preprocessing: z.literal("center-square-256-srgb-v1"),
    computeUnits: z.literal("cpuOnly"),
  })
  .strict();
export const NativePackagingSupplementSchema = z.discriminatedUnion("status", [
  PackagingModelSourceSchema.extend({
    status: z.literal("observed"),
    scores: PackagingScoresSchema,
  }),
  z
    .object({ status: z.literal("skipped"), reason: z.enum(["primary_match", "primary_conflict"]) })
    .strict(),
  z
    .object({
      status: z.literal("unavailable"),
      reason: z.enum(["model_unavailable", "processing_failed"]),
    })
    .strict(),
]);
export type NativePackagingSupplement = z.infer<typeof NativePackagingSupplementSchema>;
export type PackagingDecision =
  | {
      readonly status: "estimated";
      readonly kind: PackagingKind;
      readonly cosine: number;
      readonly runnerUpCosine: number;
      readonly policy: PackagingGatePolicy;
      readonly scoreMeaning: "cosine_similarity_not_probability";
    }
  | {
      readonly status: "unknown";
      readonly reason:
        | "invalid_scores"
        | "invalid_policy"
        | "unsupported_kind"
        | "weak_similarity"
        | "ambiguous_similarity";
    };

export function decidePackagingScores(input: unknown, policy: unknown): PackagingDecision {
  const selectedPolicy = PackagingGatePolicySchema.safeParse(policy);
  if (!selectedPolicy.success) return { status: "unknown", reason: "invalid_policy" };
  if (!Array.isArray(input) || input.length !== packagingScoreGroups.length)
    return { status: "unknown", reason: "invalid_scores" };
  const parsed = PackagingScoresSchema.safeParse(input);
  if (!parsed.success) return { status: "unknown", reason: "invalid_scores" };
  const ordered = [...parsed.data].sort((left, right) => right.cosine - left.cosine);
  const first = ordered[0];
  const second = ordered[1];
  if (!first || !second) return { status: "unknown", reason: "invalid_scores" };
  const kind = packagingPositiveGroups.find((supported) => supported === first.group);
  if (!kind) return { status: "unknown", reason: "unsupported_kind" };
  const gate = packagingGatePolicies[selectedPolicy.data];
  if (first.cosine < gate.minimumCosine) return { status: "unknown", reason: "weak_similarity" };
  if (first.cosine - second.cosine < gate.minimumLead)
    return { status: "unknown", reason: "ambiguous_similarity" };
  return {
    status: "estimated",
    kind,
    cosine: first.cosine,
    runnerUpCosine: second.cosine,
    policy: selectedPolicy.data,
    scoreMeaning: "cosine_similarity_not_probability",
  };
}
