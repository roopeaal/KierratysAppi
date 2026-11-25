import {
  type CommunityPackageRole,
  CommunityPackagingCatalogueSchema,
} from "@kierratysappi/contracts/community-packaging-catalogue";
import type { FieldProvenance, Gtin, Language, PackagingShape } from "@kierratysappi/domain";
import { barcodeProductResult } from "./barcode-product-result";

const roles: Record<CommunityPackageRole, readonly [string, string, PackagingShape?]> = {
  tub: ["Rasia", "Tub or box"],
  seal: ["Sinetti", "Seal"],
  sleeve: ["Pakkausvyöte", "Sleeve"],
  label: ["Etiketti", "Label"],
  cover: ["Suojus", "Protective cover"],
  mould: ["Pakkausvuoka", "Packaging mould"],
  sheet: ["Pakkausarkki", "Packaging sheet"],
  clip: ["Pussinsulkija", "Bag clip"],
  bottle: ["Pullo", "Bottle", "bottle"],
  can: ["Tölkki", "Can", "can"],
  jar: ["Purkki", "Jar", "jar"],
  box: ["Laatikko", "Box", "box"],
  carton: ["Kartonkipakkaus", "Carton", "carton"],
  bag: ["Pussi", "Bag", "bag"],
  wrap: ["Kääre", "Wrapper", "wrap"],
  tray: ["Alusta", "Tray", "tray"],
  cup: ["Pikari tai kuppi", "Cup or pot", "cup"],
  cap: ["Korkki", "Cap", "cap"],
  lid: ["Kansi", "Lid", "lid"],
  "inner-lid": ["Välikansi", "Inner lid", "lid"],
  pump: ["Pumppu", "Pump", "pump"],
  tube: ["Tuubi", "Tube", "tube"],
};

export function createCommunityPackagingLookup(raw: unknown) {
  const parsed = CommunityPackagingCatalogueSchema.safeParse(raw);
  const byCode = new Map(
    (parsed.success ? parsed.data.records : []).map((r) => [r.gtin.padStart(14, "0"), r]),
  );
  return (gtin: Gtin, language: Language, evaluatedAt = new Date().toISOString()) => {
    const row = byCode.get(gtin.padStart(14, "0"));
    if (!row) return null;
    const checked = `${row.checkedOn}T00:00:00.000Z`;
    const age = Date.parse(evaluatedAt) - Date.parse(checked);
    if (!Number.isFinite(age) || age < 0 || age > 365 * 86_400_000) return null;

    const provenance: FieldProvenance = {
      sourceId: "bundled-community-packaging",
      sourceName: row.source.publisher,
      sourceRecordId: `${row.gtin}@${row.source.revision}`,
      sourceUrl: row.source.url,
      retrievedAt: checked,
      confidence: 0.55,
      verificationStatus: "community",
      license: {
        id: row.source.licence,
        name: row.source.licence,
        url: row.source.rightsUrl,
        attributionText: row.source.publisher,
        shareAlike: true,
      },
    };
    const observed = <T>(value: T, source = provenance) => ({ value, provenance: source });
    return barcodeProductResult(
      {
        gtin,
        name: observed(row.name),
        packagingCompleteness: observed("partial"),
        packagingComponents: row.parts.map((part, index) => {
          const [fi, en, shape] = roles[part.shape];
          const source = {
            ...provenance,
            sourceRecordId: `${provenance.sourceRecordId}#${part.evidence}`,
          };
          return {
            id: `fi-community-${index + 1}`,
            displayName: observed(language === "fi" ? fi : en, source),
            packagingStatus: observed("packaging" as const, source),
            ...(shape ? { shape: observed(shape, source) } : {}),
            materialFamily: observed(part.material, source),
            conditions: {
              hazardousResidue: "unknown" as const,
              pressurized: "unknown" as const,
              emptied: "unknown" as const,
            },
          };
        }),
      },
      { id: provenance.sourceId, name: provenance.sourceName },
      { hit: true, storedAt: checked, expiresAt: checked },
      language,
      evaluatedAt,
    );
  };
}
