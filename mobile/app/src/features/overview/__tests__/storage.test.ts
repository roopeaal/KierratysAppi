import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearAllLocalData, clearHistory } from "../../history/storage";
import { emptyRecyclingSummary, totalRecycled, type RecyclingEntry } from "../model";
import {
  clearRecyclingSummary,
  OverviewStorageError,
  readRecyclingSummary,
  recordRecycling,
  RECYCLING_OVERVIEW_KEY,
  removeRecyclingEntry,
  withRecyclingStorageLock,
} from "../storage";

const storage = vi.hoisted(() => {
  const values = new Map<string, string>();
  return {
    values,
    getItem: vi.fn(async (key: string) => values.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      values.set(key, value);
    }),
    removeItem: vi.fn(async (key: string) => {
      values.delete(key);
    }),
    getAllKeys: vi.fn(async () => [...values.keys()]),
    multiRemove: vi.fn(async (keys: readonly string[]) => {
      for (const key of keys) values.delete(key);
    }),
  };
});

vi.mock("@react-native-async-storage/async-storage", () => ({ default: storage }));

const entry = (id: string, overrides: Partial<RecyclingEntry> = {}): RecyclingEntry => ({
  id,
  material: "plastic",
  quantity: 1,
  recycledAt: "2026-10-30T12:00:00.000Z",
  ...overrides,
});

beforeEach(async () => {
  await withRecyclingStorageLock(async () => undefined);
  storage.values.clear();
  storage.getItem.mockReset().mockImplementation(async (key) => storage.values.get(key) ?? null);
  storage.setItem.mockReset().mockImplementation(async (key, value) => {
    storage.values.set(key, value);
  });
  storage.removeItem.mockReset().mockImplementation(async (key) => {
    storage.values.delete(key);
  });
  storage.getAllKeys.mockReset().mockImplementation(async () => [...storage.values.keys()]);
  storage.multiRemove.mockReset().mockImplementation(async (keys) => {
    for (const key of keys) storage.values.delete(key);
  });
});

describe("persistent recycling records", () => {
  it("returns an empty summary only for a missing key and does not write on read", async () => {
    expect(await readRecyclingSummary()).toEqual(emptyRecyclingSummary());
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  it("persists confirmed quantities and reloads them in a new module instance", async () => {
    await recordRecycling(entry("one", { quantity: 3, label: "Bottle" }));
    await recordRecycling(entry("two", { material: "glass", quantity: 2 }));
    vi.resetModules();
    const reloaded = await import("../storage");
    const summary = await reloaded.readRecyclingSummary();
    expect(summary.counts.plastic).toBe(3);
    expect(summary.counts.glass).toBe(2);
    expect(summary.recent.map((item) => item.id)).toEqual(["two", "one"]);
    expect(totalRecycled(summary)).toBe(5);
  });

  it("serializes concurrent mutations and reads after pending writes", async () => {
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    storage.setItem.mockImplementationOnce(async (key, value) => {
      await gate;
      storage.values.set(key, value);
    });
    const first = recordRecycling(entry("one", { quantity: 2 }));
    await vi.waitFor(() => expect(storage.setItem).toHaveBeenCalledTimes(1));
    const second = recordRecycling(entry("two", { material: "metal", quantity: 4 }));
    const reading = readRecyclingSummary();
    expect(storage.getItem).toHaveBeenCalledTimes(1);
    release();
    await Promise.all([first, second]);
    expect(totalRecycled(await reading)).toBe(6);
    expect((await reading).recent.map((item) => item.id)).toEqual(["two", "one"]);
  });

  it("deduplicates repeated or concurrent submissions while their intent is retained", async () => {
    await Promise.all([
      recordRecycling(entry("same", { quantity: 3 })),
      recordRecycling(entry("same", { quantity: 3 })),
    ]);
    expect(
      totalRecycled(await recordRecycling(entry("same", { material: "glass", quantity: 9 }))),
    ).toBe(3);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });

  it("keeps lifetime totals when old recent entries roll out", async () => {
    for (let i = 0; i < 105; i += 1) await recordRecycling(entry(`part-${i}`));
    const summary = await readRecyclingSummary();
    expect(summary.recent).toHaveLength(100);
    expect(summary.counts.plastic).toBe(105);
    expect(summary.recent.at(-1)?.id).toBe("part-5");
    expect((await removeRecyclingEntry("part-0")).counts.plastic).toBe(105);
    expect((await removeRecyclingEntry("part-104")).counts.plastic).toBe(104);
  });

  it("removes the retained record's exact quantity once without affecting other materials", async () => {
    await recordRecycling(entry("one", { quantity: 4 }));
    await recordRecycling(entry("two", { material: "paper", quantity: 7 }));
    const summary = await removeRecyclingEntry("one");
    expect(summary.counts.plastic).toBe(0);
    expect(summary.counts.paper).toBe(7);
    expect(summary.recent.map((item) => item.id)).toEqual(["two"]);
    expect(await removeRecyclingEntry("one")).toEqual(summary);
  });

  it("clears after an in-flight write and before a subsequent read", async () => {
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    storage.setItem.mockImplementationOnce(async (key, value) => {
      await gate;
      storage.values.set(key, value);
    });
    const adding = recordRecycling(entry("pending"));
    await vi.waitFor(() => expect(storage.setItem).toHaveBeenCalledTimes(1));
    const clearing = clearRecyclingSummary();
    const reading = readRecyclingSummary();
    release();
    await Promise.all([adding, clearing]);
    expect(await reading).toEqual(emptyRecyclingSummary());
    expect(storage.values.has(RECYCLING_OVERVIEW_KEY)).toBe(false);
  });

  it("lets app-wide data deletion share the lock without re-creating old records", async () => {
    const adding = recordRecycling(entry("pending"));
    const deleting = withRecyclingStorageLock(async () => {
      storage.values.clear();
    });
    const reading = readRecyclingSummary();
    await Promise.all([adding, deleting]);
    expect(await reading).toEqual(emptyRecyclingSummary());
  });

  it("does not erase other app data when clearing Overview", async () => {
    storage.values.set("@kierratysappi/history/v1", "history");
    storage.values.set("@another-app/data", "other");
    await recordRecycling(entry("one"));
    await clearRecyclingSummary();
    expect(storage.values.get("@kierratysappi/history/v1")).toBe("history");
    expect(storage.values.get("@another-app/data")).toBe("other");
  });

  it("keeps recycling totals when only lookup history is cleared", async () => {
    storage.values.set("@kierratysappi/history/v1", "history");
    await recordRecycling(entry("recycled", { quantity: 4 }));
    await clearHistory();
    expect(totalRecycled(await readRecyclingSummary())).toBe(4);
    expect(storage.values.has("@kierratysappi/history/v1")).toBe(false);
  });

  it("deletes Overview and other app keys after pending writes while preserving another app", async () => {
    storage.values.set("@kierratysappi/history/v1", "history");
    storage.values.set("@another-app/data", "preserved");
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    storage.setItem.mockImplementationOnce(async (key, value) => {
      await gate;
      storage.values.set(key, value);
    });
    const adding = recordRecycling(entry("pending"));
    await vi.waitFor(() => expect(storage.setItem).toHaveBeenCalledTimes(1));
    const deleting = clearAllLocalData();
    release();
    await Promise.all([adding, deleting]);
    expect(await readRecyclingSummary()).toEqual(emptyRecyclingSummary());
    expect(storage.values.get("@another-app/data")).toBe("preserved");
    expect([...storage.values.keys()]).toEqual(["@another-app/data"]);
  });

  it("keeps returned snapshots separate from persisted data", async () => {
    const summary = await recordRecycling(entry("one"));
    summary.counts.plastic = 99;
    summary.recent.length = 0;
    expect((await readRecyclingSummary()).counts.plastic).toBe(1);
    expect((await readRecyclingSummary()).recent).toHaveLength(1);
  });
});

describe("storage failures and invalid data", () => {
  it.each(["{broken", "null", "[]", JSON.stringify({ ...emptyRecyclingSummary(), version: 2 })])(
    "surfaces corrupt or unknown-version data without replacing it: %s",
    async (value) => {
      storage.values.set(RECYCLING_OVERVIEW_KEY, value);
      await expect(readRecyclingSummary()).rejects.toMatchObject({ reason: "invalid-data" });
      await expect(recordRecycling(entry("one"))).rejects.toBeInstanceOf(OverviewStorageError);
      expect(storage.values.get(RECYCLING_OVERVIEW_KEY)).toBe(value);
      expect(storage.setItem).not.toHaveBeenCalled();
      expect(storage.removeItem).not.toHaveBeenCalled();
    },
  );

  it("rejects invalid counts, duplicate IDs and inconsistent retained quantities", async () => {
    const invalid = [
      { ...emptyRecyclingSummary(), counts: { ...emptyRecyclingSummary().counts, plastic: -1 } },
      { ...emptyRecyclingSummary(), counts: { ...emptyRecyclingSummary().counts, plastic: 1.5 } },
      { ...emptyRecyclingSummary(), recent: [entry("one")] },
      {
        ...emptyRecyclingSummary(),
        counts: { ...emptyRecyclingSummary().counts, plastic: 3 },
        recent: [entry("one"), entry("one")],
      },
      { ...emptyRecyclingSummary(), counts: { ...emptyRecyclingSummary().counts, unexpected: 0 } },
      { ...emptyRecyclingSummary(), counts: { plastic: 0 } },
    ];
    for (const value of invalid) {
      storage.values.set(RECYCLING_OVERVIEW_KEY, JSON.stringify(value));
      await expect(readRecyclingSummary()).rejects.toMatchObject({ reason: "invalid-data" });
    }
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  it("rejects oversized payloads and recent arrays without silently truncating them", async () => {
    storage.values.set(RECYCLING_OVERVIEW_KEY, " ".repeat(100_001));
    await expect(readRecyclingSummary()).rejects.toMatchObject({ reason: "invalid-data" });
    storage.values.set(
      RECYCLING_OVERVIEW_KEY,
      JSON.stringify({
        ...emptyRecyclingSummary(),
        counts: { ...emptyRecyclingSummary().counts, plastic: 101 },
        recent: Array.from({ length: 101 }, (_, index) => entry(`part-${index}`)),
      }),
    );
    await expect(readRecyclingSummary()).rejects.toMatchObject({ reason: "invalid-data" });
  });

  it.each([
    { quantity: 0 },
    { quantity: 100 },
    { quantity: 1.5 },
    { recycledAt: "2026-02-31T00:00:00.000Z" },
    { recycledAt: "not-a-date" },
    { label: "x".repeat(121) },
    { label: " label " },
    { label: "line\nfeed" },
    { id: " " },
  ])("rejects malformed new records without changing totals: %j", async (overrides) => {
    await recordRecycling(entry("saved"));
    const before = storage.values.get(RECYCLING_OVERVIEW_KEY);
    await expect(recordRecycling(entry("invalid", overrides))).rejects.toMatchObject({
      reason: "invalid-data",
    });
    expect(storage.values.get(RECYCLING_OVERVIEW_KEY)).toBe(before);
  });

  it("rejects an unknown material in persisted entries", async () => {
    storage.values.set(
      RECYCLING_OVERVIEW_KEY,
      JSON.stringify({
        ...emptyRecyclingSummary(),
        recent: [{ ...entry("unknown"), material: "not-a-material" }],
      }),
    );
    await expect(readRecyclingSummary()).rejects.toMatchObject({ reason: "invalid-data" });
  });

  it("preserves data on read, write and clear failures, and recovers its mutation queue", async () => {
    await recordRecycling(entry("saved"));
    const before = storage.values.get(RECYCLING_OVERVIEW_KEY);
    storage.getItem.mockRejectedValueOnce(new Error("unavailable"));
    await expect(readRecyclingSummary()).rejects.toMatchObject({ reason: "unavailable" });
    storage.setItem.mockRejectedValueOnce(new Error("full"));
    await expect(recordRecycling(entry("retry"))).rejects.toMatchObject({ reason: "unavailable" });
    expect(storage.values.get(RECYCLING_OVERVIEW_KEY)).toBe(before);
    expect(totalRecycled(await recordRecycling(entry("retry")))).toBe(2);
    storage.removeItem.mockRejectedValueOnce(new Error("unavailable"));
    await expect(clearRecyclingSummary()).rejects.toMatchObject({ reason: "unavailable" });
    expect(totalRecycled(await readRecyclingSummary())).toBe(2);
    await clearRecyclingSummary();
    expect(totalRecycled(await recordRecycling(entry("new")))).toBe(1);
  });

  it("deduplicates retry after a write committed but its acknowledgement failed", async () => {
    storage.setItem.mockImplementationOnce(async (key, value) => {
      storage.values.set(key, value);
      throw new Error("acknowledgement failed");
    });
    await expect(recordRecycling(entry("one", { quantity: 4 }))).rejects.toMatchObject({
      reason: "unavailable",
    });
    expect(totalRecycled(await recordRecycling(entry("one", { quantity: 4 })))).toBe(4);
  });

  it("rejects counter overflow and accepts new legitimate records after clock changes", async () => {
    storage.values.set(
      RECYCLING_OVERVIEW_KEY,
      JSON.stringify({
        ...emptyRecyclingSummary(),
        counts: { ...emptyRecyclingSummary().counts, plastic: 1_000_000_000 },
      }),
    );
    await expect(recordRecycling(entry("overflow"))).rejects.toMatchObject({ reason: "limit" });
    await clearRecyclingSummary();
    await recordRecycling(entry("later"));
    expect(
      totalRecycled(
        await recordRecycling(entry("earlier", { recycledAt: "2025-01-01T00:00:00.000Z" })),
      ),
    ).toBe(2);
  });
});
