import type { FieldProvenance, Gtin, Language, ObservedField } from "@kierratysappi/domain";
import { barcodeProductResult } from "./barcode-product-result";

// Manually checked packaging facts, not an import from a retailer's database.
// Scope is the exact Finnish GTIN; no claims about the cap, label, or other sizes.
const records = new Map([
  [
    "06415600502078",
    {
      name: "Coca-Cola Zero Sugar 1,5 l",
      nameEn: "Coca-Cola Zero Sugar 1.5 L",
      sourceUrl:
        "https://www.s-kaupat.fi/tuote/coca-cola-zero-sugar-virvoitusjuoma-muovipullo-1-5-l/6415600502078",
      checkedAt: "2026-11-19T00:00:00.000Z",
      sourceRecordId: "6415600502078",
    },
  ],
]);

export function reviewedBarcodeLookup(
  gtin: Gtin,
  language: Language,
  evaluatedAt = new Date().toISOString(),
) {
  const row = records.get(gtin.padStart(14, "0"));
  if (!row || evaluatedAt < row.checkedAt) return null;
  const provenance: FieldProvenance = {
    sourceId: "reviewed-fi-packaging",
    sourceName: "S-kaupat",
    sourceRecordId: row.sourceRecordId,
    sourceUrl: row.sourceUrl,
    retrievedAt: row.checkedAt,
    lastConfirmedAt: row.checkedAt,
    confidence: 0.88,
    verificationStatus: "verified",
    license: {
      id: "manual-factual-observation",
      name: "Original observations from a public product listing",
      attributionText: "S-kaupat",
      shareAlike: false,
    },
  };
  const observed = <T>(value: T): ObservedField<T> => ({ value, provenance });
  return barcodeProductResult(
    {
      gtin,
      name: observed(language === "fi" ? row.name : row.nameEn),
      packagingCompleteness: observed("partial"),
      packagingComponents: [
        {
          id: "reviewed-deposit-bottle",
          packagingStatus: observed("packaging"),
          shape: observed("bottle"),
          materialFamily: observed("plastic"),
          depositReturnStatus: observed("yes"),
          conditions: { hazardousResidue: "unknown", pressurized: "unknown", emptied: "unknown" },
        },
      ],
    },
    { id: provenance.sourceId, name: provenance.sourceName },
    { hit: true, storedAt: row.checkedAt, expiresAt: row.checkedAt },
    language,
    evaluatedAt,
  );
}
