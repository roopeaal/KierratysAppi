import type { Gtin, Language, ProviderProductResult } from "@kierratysappi/domain";

export type ProviderRequestContext = {
  readonly country: "FI";
  readonly language: Language;
  readonly signal?: AbortSignal;
};

export interface ProductDataProvider {
  readonly id: string;
  readonly displayName: string;

  findByGtin(gtin: Gtin, context: ProviderRequestContext): Promise<ProviderProductResult>;
}
