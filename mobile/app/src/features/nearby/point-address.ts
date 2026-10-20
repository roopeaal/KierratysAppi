import type { CollectionPoint } from "@kierratysappi/contracts/collection-points";
import { CollectionPointSchema } from "@kierratysappi/contracts/collection-points";

// Reverse geocoding describes the surrounding area, not a verified point address/name.
export function normalizePointAddress(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const a = value as Record<string, unknown>;
  const fields = [
    "street",
    "streetNumber",
    "postalCode",
    "city",
    "district",
    "subregion",
    "region",
  ] as const;
  for (const key of fields) {
    const part = a[key];
    if (part != null && (typeof part !== "string" || part.trim().length > 160)) return null;
  }
  const read = (key: (typeof fields)[number]) =>
    typeof a[key] === "string" ? a[key].trim() || null : null;
  const streetName = read("street");
  const street = [streetName, streetName ? read("streetNumber") : null].filter(Boolean).join(" ");
  const locality = read("city") ?? read("district") ?? read("subregion") ?? read("region");
  const postalLocality = [read("postalCode"), locality].filter(Boolean).join(" ");
  return [street, postalLocality].filter(Boolean).join(", ") || null;
}

export async function resolvePointAddress(
  point: CollectionPoint,
  lookup: (position: { latitude: number; longitude: number }) => Promise<unknown>,
  signal: AbortSignal,
): Promise<string | null> {
  const { coordinates } = CollectionPointSchema.parse(point);
  if (signal.aborted) return null;
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: string | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal.removeEventListener("abort", cancel);
      resolve(value);
    };
    const cancel = () => finish(null);
    const timer = setTimeout(cancel, 5000);
    signal.addEventListener("abort", cancel, { once: true });
    void Promise.resolve()
      .then(() =>
        signal.aborted
          ? []
          : lookup({ latitude: coordinates.latitude, longitude: coordinates.longitude }),
      )
      .then((value) => finish(Array.isArray(value) ? normalizePointAddress(value[0]) : null))
      .catch(cancel);
  });
}
