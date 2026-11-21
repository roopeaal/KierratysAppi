import {
  type ProductLookupResult,
  ProductLookupResultSchema,
} from "@kierratysappi/contracts/lookup-schema";
import type { Gtin, Language } from "@kierratysappi/domain";
import type { OfflineCatalogueRuntime } from "@kierratysappi/domain/offline-product";

/** Known bundled identities work without server/network. No material is inferred
 * from a product name and no new image-model work is performed here. */
export function bundledBarcodeLookup(
  catalogue: OfflineCatalogueRuntime | null,
  gtin: Gtin,
): ProductLookupResult | null {
  const found = catalogue?.lookup([gtin]);
  if (found?.status !== "catalogue_match") return null;
  const { product } = found;
  const checked = `${product.source.checkedOn}T00:00:00.000Z`;
  const provenance = {
    sourceId: "offline-open-food-facts",
    sourceName: product.source.publisher,
    sourceRecordId: product.id,
    sourceUrl: product.source.url,
    retrievedAt: checked,
    confidence: 0.6,
    verificationStatus: "community",
    license: {
      id: "odbl-1.0-dbcl-1.0",
      name: product.source.licence,
      url: "https://opendatacommons.org/licenses/odbl/1-0/",
      attributionText: product.source.publisher,
      shareAlike: true,
    },
  };
  return ProductLookupResultSchema.parse({
    status: "packaging_missing",
    gtin,
    product: {
      gtin,
      name: { value: product.name, provenance },
      brands: { value: [product.brands], provenance },
      packagingCompleteness: { value: "unknown", provenance },
      packagingComponents: [],
    },
    missingFields: ["packagingComponents"],
    provider: { id: "bundled-open-food-facts", name: "Open Food Facts · offline" },
    // Immutable source snapshot date, not a fabricated live retrieval/expiry.
    cache: { hit: true, storedAt: checked, expiresAt: checked },
  });
}

/** An identity-only snapshot must not prevent retrieving current packaging data. */
export async function lookupWithIdentityBackup(
  online: () => Promise<ProductLookupResult>,
  backup: ProductLookupResult | null,
  signal?: AbortSignal,
): Promise<ProductLookupResult> {
  if (signal?.aborted) throw Error("lookup_cancelled");
  try {
    const result = await online();
    if (signal?.aborted) throw Error("lookup_cancelled");
    return backup && (result.status === "provider_unavailable" || result.status === "not_found")
      ? backup
      : result;
  } catch (error) {
    if (backup && !signal?.aborted) return backup;
    throw error;
  }
}

export function shouldSaveOnlineLookup(
  result: ProductLookupResult,
  backup: ProductLookupResult | null,
): boolean {
  // A server cache hit is still a fresh network response for this device.
  return (
    result !== backup &&
    (result.status === "resolved" || result.status === "packaging_missing") &&
    result.provider.id !== "bundled-open-food-facts"
  );
}

export function createLocalFirstLookup(
  catalogue: OfflineCatalogueRuntime | null,
  online: (gtin: Gtin, language: Language, signal?: AbortSignal) => Promise<ProductLookupResult>,
  publicFallback?: (
    gtin: Gtin,
    language: Language,
    signal?: AbortSignal,
  ) => Promise<ProductLookupResult>,
) {
  return (gtin: Gtin, language: Language, signal?: AbortSignal) =>
    lookupWithIdentityBackup(
      async () => {
        try {
          return await (signal ? online(gtin, language, signal) : online(gtin, language));
        } catch (error) {
          if (signal?.aborted) throw error;
          if (publicFallback) {
            try {
              return await (signal
                ? publicFallback(gtin, language, signal)
                : publicFallback(gtin, language));
            } catch {
              /* Preserve original typed transport failure and pending recovery. */
            }
          }
          throw error;
        }
      },
      bundledBarcodeLookup(catalogue, gtin),
      signal,
    );
}
