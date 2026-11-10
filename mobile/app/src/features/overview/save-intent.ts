import type { RecyclingEntry, RecyclingSummary } from "./model";
import { readRecyclingSummary, recordRecycling } from "./storage";

type SaveStore = {
  readonly record: (entry: RecyclingEntry) => Promise<RecyclingSummary>;
  readonly read: () => Promise<RecyclingSummary>;
};

export type RecyclingSaveOutcome =
  | { readonly status: "saved"; readonly summary: RecyclingSummary }
  | { readonly status: "unconfirmed" };

/** An ID alone must not certify another payload as this confirmed intent. */
export function recyclingIntentIsSaved(summary: RecyclingSummary, entry: RecyclingEntry): boolean {
  const stored = summary.recent.find((item) => item.id === entry.id);
  return Boolean(
    stored &&
      stored.material === entry.material &&
      stored.quantity === entry.quantity &&
      stored.label === entry.label &&
      stored.recycledAt === entry.recycledAt,
  );
}

/** One explicit write attempt. A rejected acknowledgement is not proof of no write.
 * Reconcile the same intent by read only; never automatically write a replacement.
 * Absence is not certified failure: recent history is bounded and may roll over.
 */
export async function saveRecyclingIntent(
  entry: RecyclingEntry,
  store: SaveStore = { record: recordRecycling, read: readRecyclingSummary },
): Promise<RecyclingSaveOutcome> {
  try {
    const summary = await store.record(entry);
    return recyclingIntentIsSaved(summary, entry)
      ? { status: "saved", summary }
      : { status: "unconfirmed" };
  } catch {
    try {
      const summary = await store.read();
      if (recyclingIntentIsSaved(summary, entry)) return { status: "saved", summary };
    } catch {
      // Unavailable/corrupt reads cannot prove that the attempted write did not commit.
    }
    return { status: "unconfirmed" };
  }
}
