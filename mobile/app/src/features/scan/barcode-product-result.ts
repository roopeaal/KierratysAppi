import {
  type ProductLookupResult,
  ProductLookupResultSchema,
} from "@kierratysappi/contracts/lookup-schema";
import type { Language, ProductObservation } from "@kierratysappi/domain";
import { sortPackagingComponent } from "@kierratysappi/recycling-engine";

export function barcodeProductResult(
  product: ProductObservation,
  provider: { id: string; name: string },
  cache: { hit: boolean; storedAt: string; expiresAt: string },
  language: Language,
  evaluatedAt: string,
): ProductLookupResult {
  const base = { gtin: product.gtin, product, provider, cache };
  return ProductLookupResultSchema.parse(
    product.packagingComponents.length
      ? {
          ...base,
          status: "resolved",
          components: product.packagingComponents.map((observation) => ({
            observation,
            sorting: sortPackagingComponent({
              component: observation,
              context: { country: "FI", language, evaluatedAt },
            }),
          })),
        }
      : { ...base, status: "packaging_missing", missingFields: ["packagingComponents"] },
  );
}
