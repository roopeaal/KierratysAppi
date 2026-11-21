import { parseGtin } from "@kierratysappi/domain";
import { HistoryArtworkSchema } from "./product-artwork";
import type { HistoryEntry } from "./storage";

/** Storage is untrusted. Accept only decorative artwork IDs, never external images. */
export function homeHistoryPreview(value: unknown, enabled: boolean): HistoryEntry[] {
  if (!enabled || !Array.isArray(value)) return [];
  const entries: HistoryEntry[] = [];
  const seen = new Set<string>();
  for (const item of value.slice(0, 20)) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const row = item as Record<string, unknown>;
    if (typeof row.gtin !== "string" || !parseGtin(row.gtin).ok || seen.has(row.gtin)) continue;
    if (
      row.resultStatus !== "resolved" &&
      row.resultStatus !== "packaging_missing" &&
      row.resultStatus !== "not_found"
    )
      continue;
    if (typeof row.scannedAt !== "string" || !Number.isFinite(Date.parse(row.scannedAt))) continue;
    const productName =
      typeof row.productName === "string"
        ? row.productName.trim().slice(0, 160) || undefined
        : undefined;
    const artwork = HistoryArtworkSchema.safeParse(row.artwork);
    entries.push({
      gtin: row.gtin,
      productName,
      resultStatus: row.resultStatus,
      ...(artwork.success && row.resultStatus !== "not_found" ? { artwork: artwork.data } : {}),
      scannedAt: row.scannedAt,
    });
    seen.add(row.gtin);
    if (entries.length === 2) break;
  }
  return entries;
}
