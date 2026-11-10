import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  emptyRecyclingSummary,
  overviewMaterials,
  type OverviewMaterial,
  type RecyclingEntry,
  type RecyclingSummary,
} from "./model";

export const RECYCLING_OVERVIEW_KEY = "@kierratysappi/recycling-overview/v1";
const MAX_RECENT_ENTRIES = 100;
const MAX_MATERIAL_COUNT = 1_000_000_000;
const MAX_STORED_LENGTH = 100_000;

export class OverviewStorageError extends Error {
  constructor(readonly reason: "invalid-data" | "unavailable" | "limit") {
    super(`Recycling overview: ${reason}`);
    this.name = "OverviewStorageError";
  }
}

let pending: Promise<void> = Promise.resolve();

export function withRecyclingStorageLock<T>(work: () => Promise<T>): Promise<T> {
  const next = pending.then(work);
  pending = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

export function readRecyclingSummary(): Promise<RecyclingSummary> {
  return withRecyclingStorageLock(readStoredSummary);
}

export async function recordRecycling(entry: RecyclingEntry): Promise<RecyclingSummary> {
  const checked = parseEntry(entry);
  return withRecyclingStorageLock(async () => {
    const current = await readStoredSummary();
    if (current.recent.some((item) => item.id === checked.id)) return current;
    const count = current.counts[checked.material] + checked.quantity;
    if (count > MAX_MATERIAL_COUNT) throw new OverviewStorageError("limit");
    const next: RecyclingSummary = {
      version: 1,
      counts: { ...current.counts, [checked.material]: count },
      recent: [checked, ...current.recent].slice(0, MAX_RECENT_ENTRIES),
    };
    await saveSummary(next);
    return next;
  });
}

export async function removeRecyclingEntry(id: string): Promise<RecyclingSummary> {
  if (!validId(id)) throw new OverviewStorageError("invalid-data");
  return withRecyclingStorageLock(async () => {
    const current = await readStoredSummary();
    const entry = current.recent.find((item) => item.id === id);
    if (!entry) return current;
    const next: RecyclingSummary = {
      version: 1,
      counts: {
        ...current.counts,
        [entry.material]: current.counts[entry.material] - entry.quantity,
      },
      recent: current.recent.filter((item) => item.id !== id),
    };
    await saveSummary(next);
    return next;
  });
}

export function clearRecyclingSummary(): Promise<void> {
  return withRecyclingStorageLock(async () => {
    try {
      await AsyncStorage.removeItem(RECYCLING_OVERVIEW_KEY);
    } catch {
      throw new OverviewStorageError("unavailable");
    }
  });
}

async function readStoredSummary(): Promise<RecyclingSummary> {
  let stored: string | null;
  try {
    stored = await AsyncStorage.getItem(RECYCLING_OVERVIEW_KEY);
  } catch {
    throw new OverviewStorageError("unavailable");
  }
  if (stored === null) return emptyRecyclingSummary();
  if (stored.length > MAX_STORED_LENGTH) throw new OverviewStorageError("invalid-data");
  let value: unknown;
  try {
    value = JSON.parse(stored);
  } catch {
    throw new OverviewStorageError("invalid-data");
  }
  return parseSummary(value);
}

async function saveSummary(summary: RecyclingSummary): Promise<void> {
  try {
    await AsyncStorage.setItem(RECYCLING_OVERVIEW_KEY, JSON.stringify(summary));
  } catch {
    throw new OverviewStorageError("unavailable");
  }
}

function parseSummary(value: unknown): RecyclingSummary {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !isRecord(value.counts) ||
    Object.keys(value.counts).length !== overviewMaterials.length ||
    !Array.isArray(value.recent) ||
    value.recent.length > MAX_RECENT_ENTRIES
  )
    throw new OverviewStorageError("invalid-data");

  const counts = emptyRecyclingSummary().counts;
  for (const material of overviewMaterials) {
    const count = value.counts[material];
    if (!Number.isSafeInteger(count) || typeof count !== "number" || count < 0)
      throw new OverviewStorageError("invalid-data");
    if (count > MAX_MATERIAL_COUNT) throw new OverviewStorageError("invalid-data");
    counts[material] = count;
  }
  const recent = value.recent.map(parseEntry);
  if (new Set(recent.map((entry) => entry.id)).size !== recent.length)
    throw new OverviewStorageError("invalid-data");
  for (const material of overviewMaterials) {
    const retainedCount = recent.reduce(
      (sum, entry) => sum + (entry.material === material ? entry.quantity : 0),
      0,
    );
    if (retainedCount > counts[material]) throw new OverviewStorageError("invalid-data");
  }
  return { version: 1, counts, recent };
}

function parseEntry(value: unknown): RecyclingEntry {
  if (
    !isRecord(value) ||
    !validId(value.id) ||
    !isOverviewMaterial(value.material) ||
    typeof value.quantity !== "number" ||
    !Number.isSafeInteger(value.quantity) ||
    value.quantity < 1 ||
    value.quantity > 99 ||
    !validDate(value.recycledAt) ||
    (value.label !== undefined &&
      (typeof value.label !== "string" ||
        value.label.length > 120 ||
        value.label.length === 0 ||
        value.label.trim() !== value.label ||
        /\p{Cc}/u.test(value.label)))
  )
    throw new OverviewStorageError("invalid-data");
  return {
    id: value.id,
    material: value.material,
    quantity: value.quantity,
    recycledAt: value.recycledAt,
    ...(typeof value.label === "string" ? { label: value.label } : {}),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/u.test(value);
}

function isOverviewMaterial(value: unknown): value is OverviewMaterial {
  return overviewMaterials.some((material) => material === value);
}

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || value.length !== 24) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString() === value;
}
