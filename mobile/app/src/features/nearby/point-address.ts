import type { CollectionPoint } from "@kierratysappi/contracts/collection-points";
import { CollectionPointSchema } from "@kierratysappi/contracts/collection-points";

type ReverseLookup = (
  position: CollectionPoint["coordinates"],
  signal: AbortSignal,
) => Promise<unknown>;

// The OS cannot cancel a lookup already in progress. Keep at most one native
// request in flight; abort/timeout removes queued work before it can reach the OS.
export function createPointAddressLookup(lookup: ReverseLookup) {
  let nativePending = false;
  const waiters = new Set<() => void>();
  const serialLookup: ReverseLookup = async (coordinates, signal) => {
    while (nativePending && !signal.aborted) {
      await new Promise<void>((resolve) => {
        const wake = () => {
          waiters.delete(wake);
          signal.removeEventListener("abort", wake);
          resolve();
        };
        waiters.add(wake);
        signal.addEventListener("abort", wake, { once: true });
      });
    }
    if (signal.aborted) return [];
    nativePending = true;
    try {
      return await lookup(coordinates, signal);
    } finally {
      nativePending = false;
      for (const wake of waiters) wake();
    }
  };
  return (point: CollectionPoint, signal: AbortSignal) =>
    resolvePointAddress(point, serialLookup, signal);
}

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
  lookup: ReverseLookup,
  signal: AbortSignal,
): Promise<string | null> {
  if (signal.aborted || point.address) return null;
  const parsed = CollectionPointSchema.safeParse(point);
  if (!parsed.success) return null;
  const { latitude, longitude } = parsed.data.coordinates;
  return new Promise((resolve) => {
    const request = new AbortController();
    let settled = false;
    const finish = (value: string | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal.removeEventListener("abort", cancel);
      request.abort();
      resolve(value);
    };
    const cancel = () => finish(null);
    const timer = setTimeout(cancel, 5000);
    signal.addEventListener("abort", cancel, { once: true });
    void Promise.resolve()
      .then(() => (request.signal.aborted ? [] : lookup({ latitude, longitude }, request.signal)))
      .then((value) => finish(Array.isArray(value) ? normalizePointAddress(value[0]) : null))
      .catch(cancel);
  });
}
