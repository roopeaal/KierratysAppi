import {
  ProductObservationSchema,
  type FieldProvenance,
  type Gtin,
  type ProviderProductResult,
} from "@kierratysappi/domain";
import type { ProductDataProvider, ProviderRequestContext } from "./contracts";

const DEMO_GTIN = "6410405196811";

export class MockGs1DataProvider implements ProductDataProvider {
  readonly id = "mock-gs1-synkka";
  readonly displayName = "GS1 Synkka (synthetic demo)";

  async findByGtin(gtin: Gtin, _context: ProviderRequestContext): Promise<ProviderProductResult> {
    if (gtin !== DEMO_GTIN) {
      return { status: "not_found" };
    }

    const provenance: FieldProvenance = {
      sourceId: this.id,
      sourceName: this.displayName,
      sourceRecordId: gtin,
      sourceUrl: "https://gs1.fi/fi/palvelumme/synkka",
      retrievedAt: new Date(0).toISOString(),
      confidence: 0.25,
      verificationStatus: "mock",
      license: {
        id: "synthetic-demo-only",
        name: "Synthetic demo data — not licensed GS1 data",
        attributionText: "KeepItGreen synthetic fixture",
        shareAlike: false,
      },
    };

    return {
      status: "found",
      product: ProductObservationSchema.parse({
        gtin,
        name: { value: "Synteettinen kaurahiutalepakkaus", provenance },
        packagingCompleteness: { value: "partial", provenance },
        packagingComponents: [
          {
            id: "mock-component-1",
            displayName: { value: "Kartonkipakkaus", provenance },
            packagingStatus: { value: "packaging", provenance },
            materialFamily: { value: "carton", provenance },
            shape: { value: "box", provenance },
            conditions: {
              hazardousResidue: "no",
              pressurized: "no",
              emptied: "unknown",
            },
          },
        ],
      }),
    };
  }
}
