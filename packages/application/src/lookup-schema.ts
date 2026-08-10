import { GtinSchema, LanguageSchema, ProductObservationSchema } from "@kierratysappi/domain";
import { SortingResultSchema } from "@kierratysappi/recycling-engine";
import { z } from "zod";

export const ProductLookupInputSchema = z.object({
  gtin: GtinSchema,
  country: z.literal("FI").default("FI"),
  language: LanguageSchema.default("fi"),
});
export type ProductLookupInput = z.infer<typeof ProductLookupInputSchema>;

const ProviderSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

const CacheMetadataSchema = z.object({
  hit: z.boolean(),
  storedAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
});

const ProductResultBaseSchema = z.object({
  gtin: GtinSchema,
  product: ProductObservationSchema,
  provider: ProviderSummarySchema,
  cache: CacheMetadataSchema,
});

export const ResolvedLookupSchema = ProductResultBaseSchema.extend({
  status: z.literal("resolved"),
  components: z
    .array(
      z.object({
        observation: ProductObservationSchema.shape.packagingComponents.element,
        sorting: SortingResultSchema,
      }),
    )
    .min(1),
});

export const PackagingMissingLookupSchema = ProductResultBaseSchema.extend({
  status: z.literal("packaging_missing"),
  missingFields: z.array(z.literal("packagingComponents")).min(1),
});

export const NotFoundLookupSchema = z.object({
  status: z.literal("not_found"),
  gtin: GtinSchema,
});

export const ProviderUnavailableLookupSchema = z.object({
  status: z.literal("provider_unavailable"),
  gtin: GtinSchema,
  retryable: z.boolean(),
});

export const ProductLookupResultSchema = z.discriminatedUnion("status", [
  ResolvedLookupSchema,
  PackagingMissingLookupSchema,
  NotFoundLookupSchema,
  ProviderUnavailableLookupSchema,
]);
export type ProductLookupResult = z.infer<typeof ProductLookupResultSchema>;
