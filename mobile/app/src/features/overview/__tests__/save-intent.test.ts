import { describe, expect, it, vi } from "vitest";
import { emptyRecyclingSummary, type RecyclingEntry, type RecyclingSummary } from "../model";
import { recyclingIntentIsSaved, saveRecyclingIntent } from "../save-intent";

vi.mock("@react-native-async-storage/async-storage", () => ({ default: {} }));

const entry: RecyclingEntry = {
  id: "same-explicit-intent",
  material: "plastic",
  quantity: 2,
  label: "QA packaging",
  recycledAt: "2026-11-09T12:00:00.000Z",
};
function saved(value: RecyclingEntry = entry): RecyclingSummary {
  return {
    version: 1,
    counts: { ...emptyRecyclingSummary().counts, [value.material]: value.quantity },
    recent: [{ ...value }],
  };
}

describe("reconciling an explicit recycling save", () => {
  it("accepts a confirmed save without a second read or write", async () => {
    const summary = saved();
    const store = { record: vi.fn(async () => summary), read: vi.fn() };
    expect(await saveRecyclingIntent(entry, store)).toEqual({ status: "saved", summary });
    expect(store.record).toHaveBeenCalledExactlyOnceWith(entry);
    expect(store.read).not.toHaveBeenCalled();
  });

  it("reconciles commit-then-reject without generating or writing another intent", async () => {
    let persisted = emptyRecyclingSummary();
    const store = {
      record: vi.fn(async (value: RecyclingEntry) => {
        persisted = saved(value);
        throw new Error("write committed but acknowledgement lost");
      }),
      read: vi.fn(async () => persisted),
    };
    expect(await saveRecyclingIntent(entry, store)).toEqual({ status: "saved", summary: saved() });
    expect(store.record).toHaveBeenCalledExactlyOnceWith(entry);
    expect(store.read).toHaveBeenCalledTimes(1);
    expect(persisted.counts.plastic).toBe(2);
  });

  it("keeps an unknown acknowledgement pending when the reconciliation read also fails", async () => {
    let persisted = emptyRecyclingSummary();
    const store = {
      record: vi.fn(async (value: RecyclingEntry) => {
        if (persisted.recent.some((item) => item.id === value.id)) return persisted;
        persisted = saved(value);
        throw new Error("acknowledgement lost");
      }),
      read: vi.fn(async (): Promise<RecyclingSummary> => {
        throw new Error("read unavailable");
      }),
    };
    expect(await saveRecyclingIntent(entry, store)).toEqual({ status: "unconfirmed" });
    expect(store.record).toHaveBeenCalledTimes(1);
    expect(persisted.counts.plastic).toBe(2);
    expect(await saveRecyclingIntent(entry, store)).toEqual({ status: "saved", summary: saved() });
    expect(store.record).toHaveBeenNthCalledWith(2, entry);
    expect(persisted.counts.plastic).toBe(2);
    expect(persisted.recent).toHaveLength(1);
  });

  it("does not certify an absent or rolled-out intent as definitely unwritten", async () => {
    const store = {
      record: vi.fn(async (): Promise<RecyclingSummary> => {
        throw new Error("unavailable");
      }),
      read: vi.fn(async () => ({ ...emptyRecyclingSummary(), counts: saved().counts })),
    };
    expect(await saveRecyclingIntent(entry, store)).toEqual({ status: "unconfirmed" });
    expect(store.record).toHaveBeenCalledTimes(1);
  });

  it.each([
    { material: "glass" as const },
    { quantity: 1 },
    { label: "another payload" },
    { recycledAt: "2026-11-08T12:00:00.000Z" },
    { id: "another-id" },
  ])("does not certify the wrong persisted payload: %j", async (difference) => {
    const summary = saved({ ...entry, ...difference });
    expect(recyclingIntentIsSaved(summary, entry)).toBe(false);
    const store = { record: vi.fn(async () => summary), read: vi.fn() };
    expect(await saveRecyclingIntent(entry, store)).toEqual({ status: "unconfirmed" });
    expect(store.record).toHaveBeenCalledTimes(1);
    expect(store.read).not.toHaveBeenCalled();
  });

  it("preserves the caller's stable entry and optional-label distinction", async () => {
    const input = Object.freeze({ ...entry });
    const before = JSON.stringify(input);
    expect(recyclingIntentIsSaved(saved({ ...entry, label: undefined }), entry)).toBe(false);
    await saveRecyclingIntent(input, {
      record: vi.fn(async () => saved()),
      read: vi.fn(),
    });
    expect(JSON.stringify(input)).toBe(before);
  });
});
