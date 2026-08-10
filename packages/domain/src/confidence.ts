import { z } from "zod";
import type { ObservedField, VerificationStatus } from "./models";

export const ConfidenceTierSchema = z.enum(["verified", "high", "medium", "low", "unknown"]);
export type ConfidenceTier = z.infer<typeof ConfidenceTierSchema>;

export const ConfidenceAssessmentSchema = z.object({
  score: z.number().min(0).max(1),
  tier: ConfidenceTierSchema,
  reasons: z.array(z.string().min(1)).min(1),
});
export type ConfidenceAssessment = z.infer<typeof ConfidenceAssessmentSchema>;

const VERIFIED_STATUSES = new Set<VerificationStatus>([
  "verified",
  "manufacturer",
  "user_confirmed",
]);

export function confidenceTier(
  score: number,
  verificationStatuses: readonly VerificationStatus[],
): ConfidenceTier {
  if (score <= 0 || verificationStatuses.includes("unknown")) {
    return "unknown";
  }

  if (score >= 0.9 && verificationStatuses.every((status) => VERIFIED_STATUSES.has(status))) {
    return "verified";
  }

  if (score >= 0.75) {
    return "high";
  }

  if (score >= 0.5) {
    return "medium";
  }

  return "low";
}

export function assessObservedFields(
  fields: readonly ObservedField<unknown>[],
  reasons: readonly string[],
): ConfidenceAssessment {
  if (fields.length === 0) {
    return {
      score: 0,
      tier: "unknown",
      reasons: reasons.length > 0 ? [...reasons] : ["No decisive observations were available."],
    };
  }

  const score = Math.min(...fields.map((field) => field.provenance.confidence));
  const statuses = fields.map((field) => field.provenance.verificationStatus);

  return {
    score,
    tier: confidenceTier(score, statuses),
    reasons: reasons.length > 0 ? [...reasons] : ["Based on the least certain decisive field."],
  };
}
