import {
  LanguageSchema,
  MaterialFamilySchema,
  PackagingShapeSchema,
  PackagingStatusSchema,
} from "@kierratysappi/domain";
import { z } from "zod";

export const photoRecognitionPath = "/v1/recycling/photo";
export const photoCapabilitiesPath = "/v1/recycling/photo-capabilities";
export const photoConsentVersion = "photo-ai-v1";
export const photoModel = "gpt-4.1-mini-2025-04-14";
export const maxPhotoBytes = 1_500_000;
export const maxPhotoBase64Length = 2_000_000;

const PlainTextSchema = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(/^[^\p{Cc}\p{Cf}]*$/u);
const LabelSchema = z.object({ fi: PlainTextSchema, en: PlainTextSchema }).strict();
export const PhotoPartSchema = z
  .object({
    label: LabelSchema,
    packagingStatus: PackagingStatusSchema,
    material: MaterialFamilySchema,
    shape: PackagingShapeSchema,
  })
  .strict();
export type PhotoPart = z.infer<typeof PhotoPartSchema>;

/** Observations only: a model can never supply a destination or a sorting rule. */
export const VisualObservationSchema = z
  .object({
    status: z.enum(["clear", "uncertain", "not_item"]),
    label: LabelSchema,
    confidence: z.enum(["low", "medium"]),
    risk: z.enum(["ordinary_packaging", "special_waste", "unknown"]),
    parts: z.array(PhotoPartSchema).max(4),
  })
  .strict();
export type VisualObservation = z.infer<typeof VisualObservationSchema>;

export const PhotoRequestSchema = z
  .object({
    jpegBase64: z.string().min(8).max(maxPhotoBase64Length),
    consentVersion: z.literal(photoConsentVersion),
    language: LanguageSchema.default("fi"),
  })
  .strict();
export type PhotoRequest = z.infer<typeof PhotoRequestSchema>;

export const PhotoEstimateSchema = z
  .object({
    status: z.literal("estimated"),
    observation: VisualObservationSchema,
    source: z
      .object({
        id: z.literal("openai-vision"),
        model: z.literal(photoModel),
        version: z.literal("photo-observation-v1"),
        observedAt: z.iso.datetime(),
        verificationStatus: z.literal("inferred"),
      })
      .strict(),
  })
  .strict();
export type PhotoEstimate = z.infer<typeof PhotoEstimateSchema>;
export const PhotoFailureSchema = z
  .object({
    status: z.literal("unavailable"),
    reason: z.enum([
      "disabled",
      "rate_limited",
      "quota_exhausted",
      "invalid_image",
      "invalid_response",
      "provider_unavailable",
    ]),
  })
  .strict();
export const PhotoResultSchema = z.discriminatedUnion("status", [
  PhotoEstimateSchema,
  PhotoFailureSchema,
]);
export type PhotoResult = z.infer<typeof PhotoResultSchema>;
export const PhotoCapabilitiesSchema = z
  .object({ enabled: z.boolean(), consentVersion: z.literal(photoConsentVersion) })
  .strict();

export function canConfirmPhotoPart(estimate: PhotoEstimate, part: PhotoPart): boolean {
  return (
    estimate.observation.status === "clear" &&
    estimate.observation.confidence === "medium" &&
    estimate.observation.risk === "ordinary_packaging" &&
    part.packagingStatus === "packaging" &&
    ["plastic", "carton", "paper", "glass", "metal"].includes(part.material)
  );
}
