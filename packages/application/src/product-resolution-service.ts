import type { ProductDataProvider } from "@kierratysappi/data-providers";
import type { ProviderProductResult } from "@kierratysappi/domain";
import { sortPackagingComponent } from "@kierratysappi/recycling-engine";
import {
  ProductLookupInputSchema,
  ProductLookupResultSchema,
  type ProductLookupInput,
  type ProductLookupResult,
} from "./lookup-schema";

const FOUND_TTL_MS = 6 * 60 * 60 * 1_000;
const NOT_FOUND_TTL_MS = 15 * 60 * 1_000;

type CacheRecord = {
  readonly provider: { readonly id: string; readonly name: string } | undefined;
  readonly result: ProviderProductResult;
  readonly storedAt: number;
  readonly expiresAt: number;
};

export type ProductResolutionServiceOptions = {
  readonly providers: readonly ProductDataProvider[];
  readonly now?: () => Date;
  readonly cache?: Map<string, CacheRecord>;
};

export class ProductResolutionService {
  readonly #providers: readonly ProductDataProvider[];
  readonly #now: () => Date;
  readonly #cache: Map<string, CacheRecord>;

  constructor(options: ProductResolutionServiceOptions) {
    if (options.providers.length === 0) {
      throw new Error("At least one product data provider is required");
    }
    this.#providers = options.providers;
    this.#now = options.now ?? (() => new Date());
    this.#cache = options.cache ?? new Map();
  }

  async lookup(input: ProductLookupInput, signal?: AbortSignal): Promise<ProductLookupResult> {
    const request = ProductLookupInputSchema.parse(input);
    const cacheKey = `${request.gtin}:${request.country}:${request.language}`;
    const now = this.#now();
    const cached = this.#cache.get(cacheKey);

    if (cached && cached.expiresAt > now.getTime()) {
      return this.#toLookupResult(request, cached, true);
    }
    if (cached) {
      this.#cache.delete(cacheKey);
    }

    let sawProviderError = false;
    let retryable = false;

    for (const provider of this.#providers) {
      let result: ProviderProductResult;
      try {
        result = await provider.findByGtin(request.gtin, {
          country: request.country,
          language: request.language,
          ...(signal ? { signal } : {}),
        });
      } catch {
        sawProviderError = true;
        retryable = true;
        continue;
      }

      if (result.status === "error") {
        sawProviderError = true;
        retryable ||= result.retryable;
        continue;
      }

      if (result.status === "found") {
        const record = this.#store(cacheKey, result, provider, FOUND_TTL_MS, now);
        return this.#toLookupResult(request, record, false);
      }
    }

    if (sawProviderError) {
      return ProductLookupResultSchema.parse({
        status: "provider_unavailable",
        gtin: request.gtin,
        retryable,
      });
    }

    const notFound: ProviderProductResult = { status: "not_found" };
    const record = this.#store(cacheKey, notFound, undefined, NOT_FOUND_TTL_MS, now);
    return this.#toLookupResult(request, record, false);
  }

  #store(
    key: string,
    result: ProviderProductResult,
    provider: ProductDataProvider | undefined,
    ttlMs: number,
    now: Date,
  ): CacheRecord {
    const record: CacheRecord = {
      provider: provider ? { id: provider.id, name: provider.displayName } : undefined,
      result,
      storedAt: now.getTime(),
      expiresAt: now.getTime() + ttlMs,
    };
    this.#cache.set(key, record);
    return record;
  }

  #toLookupResult(
    request: ProductLookupInput,
    record: CacheRecord,
    cacheHit: boolean,
  ): ProductLookupResult {
    if (record.result.status === "not_found") {
      return ProductLookupResultSchema.parse({ status: "not_found", gtin: request.gtin });
    }
    if (record.result.status === "error" || !record.provider) {
      return ProductLookupResultSchema.parse({
        status: "provider_unavailable",
        gtin: request.gtin,
        retryable: record.result.status === "error" ? record.result.retryable : true,
      });
    }

    const cache = {
      hit: cacheHit,
      storedAt: new Date(record.storedAt).toISOString(),
      expiresAt: new Date(record.expiresAt).toISOString(),
    };
    const product = record.result.product;

    if (product.packagingComponents.length === 0) {
      return ProductLookupResultSchema.parse({
        status: "packaging_missing",
        gtin: request.gtin,
        product,
        provider: record.provider,
        cache,
        missingFields: ["packagingComponents"],
      });
    }

    const evaluatedAt = this.#now().toISOString();
    return ProductLookupResultSchema.parse({
      status: "resolved",
      gtin: request.gtin,
      product,
      provider: record.provider,
      cache,
      components: product.packagingComponents.map((observation) => ({
        observation,
        sorting: sortPackagingComponent({
          component: observation,
          context: {
            country: request.country,
            language: request.language,
            evaluatedAt,
          },
        }),
      })),
    });
  }
}
