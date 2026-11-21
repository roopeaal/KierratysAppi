import { afterEach, describe, expect, it, vi } from "vitest";
import { createForegroundFix } from "../foreground-fix";
import { type LocationFix, LocationIssue } from "../location-session";

const signal = () => new AbortController().signal;
const sample = (now: number): LocationFix => ({
  coords: { latitude: 60.2, longitude: 25.1, accuracy: 25 },
  timestamp: now,
});
afterEach(() => vi.useRealTimers());

describe("shared foreground location", () => {
  it("uses one fix for multiple screens, expires it, and supports deliberate refresh", async () => {
    vi.useFakeTimers();
    const permission = vi.fn(async () => true);
    const acquire = vi.fn(async () => sample(Date.now()));
    const session = createForegroundFix(permission, acquire);
    const [home, nearby] = await Promise.all([session.read(signal()), session.read(signal())]);
    expect(home).toBe(nearby);
    expect(await session.read(signal())).toBe(home);
    expect(acquire).toHaveBeenCalledTimes(1);
    expect(permission.mock.calls).toHaveLength(3);
    await vi.advanceTimersByTimeAsync(60_001);
    expect(await session.read(signal())).not.toBe(home);
    await session.read(signal(), { refresh: true });
    expect(acquire).toHaveBeenCalledTimes(3);
    session.clear();
  });

  it("cannot reuse a cached result after permission is revoked", async () => {
    vi.useFakeTimers();
    const permission = vi.fn(async (_prompt: boolean) => true);
    const acquire = vi.fn(async () => sample(Date.now()));
    const session = createForegroundFix(permission, acquire);
    await session.read(signal(), { prompt: true });
    permission.mockResolvedValue(false);
    await expect(session.read(signal())).rejects.toMatchObject({ reason: "permission" });
    expect(permission.mock.calls).toEqual([[true], [false]]);
    expect(acquire).toHaveBeenCalledTimes(1);
  });

  it("a cancelled view does not cancel another consumer, but background clears the session", async () => {
    vi.useFakeTimers();
    const acquired = vi.fn((_signal: AbortSignal) => {});
    let finish!: (fix: LocationFix) => void;
    const acquire = (abort: AbortSignal) =>
      new Promise<LocationFix>((resolve, reject) => {
        finish = resolve;
        acquired(abort);
        abort.addEventListener("abort", () => reject(new LocationIssue("cancelled")), {
          once: true,
        });
      });
    const session = createForegroundFix(async () => true, acquire);
    const first = new AbortController();
    const a = expect(session.read(first.signal)).rejects.toMatchObject({ reason: "cancelled" });
    const b = session.read(signal());
    await vi.advanceTimersByTimeAsync(0);
    first.abort();
    await a;
    expect(acquired.mock.calls[0]?.[0].aborted).toBe(false);
    finish(sample(Date.now()));
    await b;
    const refresh = expect(session.read(signal(), { refresh: true })).rejects.toMatchObject({
      reason: "cancelled",
    });
    await vi.advanceTimersByTimeAsync(0);
    session.clear();
    await refresh;
    expect(acquired.mock.calls[1]?.[0].aborted).toBe(true);
  });

  it("cannot start acquisition if hidden while permission is pending", async () => {
    let allow!: (granted: boolean) => void;
    const acquire = vi.fn(async () => sample(Date.now()));
    const session = createForegroundFix(
      () =>
        new Promise((resolve) => {
          allow = resolve;
        }),
      acquire,
    );
    const pending = expect(session.read(signal(), { prompt: true })).rejects.toMatchObject({
      reason: "cancelled",
    });
    session.clear();
    allow(true);
    await pending;
    expect(acquire).not.toHaveBeenCalled();
  });
});
