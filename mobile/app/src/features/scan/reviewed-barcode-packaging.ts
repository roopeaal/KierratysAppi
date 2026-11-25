import type {
  FieldProvenance,
  Gtin,
  Language,
  MaterialFamily,
  ObservedField,
  PackagingShape,
} from "@kierratysappi/domain";
import { barcodeProductResult } from "./barcode-product-result";

type ReviewedPart = {
  id: string;
  shape: PackagingShape;
  material: MaterialFamily;
  deposit?: "yes";
  label?: Record<Language, string>;
};
type ReviewedPack = {
  gtin: string;
  name: Record<Language, string>;
  checkedAt: string;
  sourceUrl: string;
  source: "retail-observation" | "off-corroborated";
  parts: readonly ReviewedPart[];
};

const foilTrayAndLid = [
  {
    id: "reviewed-tray",
    shape: "tray",
    material: "metal",
    label: { fi: "Alumiinivuoka", en: "Aluminium tray" },
  },
  {
    id: "reviewed-lid",
    shape: "lid",
    material: "carton",
    label: { fi: "Kartonkikansi", en: "Cardboard lid" },
  },
] as const satisfies readonly ReviewedPart[];

// Only listed parts of exact Finnish consumer GTINs, not a full packaging inventory.
// Saarioinen rows are the source-licensed OFF observations corroborated by the
// matching maker EAN pages linked in docs/data-and-licenses.md, not a site import.
const reviewedPacks: readonly ReviewedPack[] = [
  {
    gtin: "6415600502078",
    name: { fi: "Coca-Cola Zero Sugar 1,5 l", en: "Coca-Cola Zero Sugar 1.5 L" },
    source: "retail-observation",
    sourceUrl:
      "https://www.s-kaupat.fi/tuote/coca-cola-zero-sugar-virvoitusjuoma-muovipullo-1-5-l/6415600502078",
    checkedAt: "2026-11-19T00:00:00.000Z",
    parts: [
      { id: "reviewed-deposit-bottle", shape: "bottle", material: "plastic", deposit: "yes" },
    ],
  },
  {
    gtin: "6412000034840",
    name: { fi: "Saarioinen laktoositon riisipuuro", en: "Saarioinen lactose-free rice porridge" },
    source: "off-corroborated",
    sourceUrl: "https://world.openfoodfacts.org/product/6412000034840",
    checkedAt: "2026-11-25T00:00:00.000Z",
    parts: [
      {
        id: "reviewed-tray",
        shape: "tray",
        material: "plastic",
        label: { fi: "Muovirasia", en: "Plastic tray" },
      },
      {
        id: "reviewed-film",
        shape: "wrap",
        material: "plastic",
        label: { fi: "Muovikalvo", en: "Plastic film" },
      },
      {
        id: "reviewed-sleeve",
        shape: "box",
        material: "carton",
        label: { fi: "Kartonkiholkki", en: "Cardboard sleeve" },
      },
    ],
  },
  {
    gtin: "6412000030149",
    name: { fi: "Saarioinen lihakaalilaatikko", en: "Saarioinen meat and cabbage casserole" },
    source: "off-corroborated",
    sourceUrl: "https://world.openfoodfacts.org/product/6412000030149",
    checkedAt: "2026-11-25T00:00:00.000Z",
    parts: foilTrayAndLid,
  },
  {
    gtin: "6412000030507",
    name: { fi: "Saarioinen broilermakaronilaatikko", en: "Saarioinen chicken macaroni casserole" },
    source: "off-corroborated",
    sourceUrl: "https://world.openfoodfacts.org/product/6412000030507",
    checkedAt: "2026-11-25T00:00:00.000Z",
    parts: foilTrayAndLid,
  },
];
const records = new Map(reviewedPacks.map((row) => [row.gtin.padStart(14, "0"), row]));

export function reviewedBarcodeLookup(
  gtin: Gtin,
  language: Language,
  evaluatedAt = new Date().toISOString(),
) {
  const row = records.get(gtin.padStart(14, "0"));
  if (!row || evaluatedAt < row.checkedAt) return null;
  const off = row.source === "off-corroborated";
  const provenance: FieldProvenance = {
    sourceId: off ? "reviewed-off-fi-packaging" : "reviewed-fi-packaging",
    sourceName: off ? "Open Food Facts contributors" : "S-kaupat",
    sourceRecordId: row.gtin,
    sourceUrl: row.sourceUrl,
    retrievedAt: row.checkedAt,
    lastConfirmedAt: row.checkedAt,
    confidence: 0.88,
    verificationStatus: "verified",
    license: off
      ? {
          id: "odbl-1.0-dbcl-1.0",
          name: "ODbL-1.0 database / DbCL-1.0 contents",
          url: "https://opendatacommons.org/licenses/odbl/1-0/",
          attributionText: "Open Food Facts contributors",
          shareAlike: true,
        }
      : {
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
      name: observed(row.name[language]),
      packagingCompleteness: observed("partial"),
      packagingComponents: row.parts.map((part) => ({
        id: part.id,
        packagingStatus: observed("packaging"),
        shape: observed(part.shape),
        materialFamily: observed(part.material),
        ...(part.label ? { displayName: observed(part.label[language]) } : {}),
        ...(part.deposit ? { depositReturnStatus: observed(part.deposit) } : {}),
        conditions: {
          hazardousResidue: "unknown" as const,
          pressurized: "unknown" as const,
          emptied: "unknown" as const,
        },
      })),
    },
    { id: provenance.sourceId, name: provenance.sourceName },
    { hit: true, storedAt: row.checkedAt, expiresAt: row.checkedAt },
    language,
    evaluatedAt,
  );
}
