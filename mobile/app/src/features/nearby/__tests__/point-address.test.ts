import type { CollectionPoint } from "@kierratysappi/contracts/collection-points";
import { afterEach, expect, it, vi } from "vitest";
import {
  createPointAddressLookup,
  normalizePointAddress,
  resolvePointAddress,
} from "../point-address";

const point: CollectionPoint = {
  id: "node/1",
  coordinates: { latitude: 60, longitude: 25 },
  name: null,
  operator: null,
  address: null,
  kind: "unknown",
  access: "unknown",
  reportedMaterials: [],
  reportedExclusions: [],
};
afterEach(() => vi.useRealTimers());
it("normalizes bounded street/locality without mistaking POI names for point identity", () => {
  expect(
    normalizePointAddress({
      street: " Example ",
      streetNumber: "2",
      postalCode: "00100",
      city: "Town",
      name: "Shop",
    }),
  ).toBe("Example 2, 00100 Town");
  expect(normalizePointAddress({ name: "Shop" })).toBeNull();
  expect(normalizePointAddress({ street: "x".repeat(161) })).toBeNull();
  expect(normalizePointAddress({ streetNumber: "4", postalCode: "00100", city: "Town" })).toBe(
    "00100 Town",
  );
  expect(normalizePointAddress({ postalCode: "00100" })).toBe("00100");
  expect(normalizePointAddress({ subregion: "Subregion" })).toBe("Subregion");
});
it("sends only the public point coordinates and handles absent/provider failures", async () => {
  const lookup = vi.fn(async () => [{ city: "Town" }]);
  expect(await resolvePointAddress(point, lookup, new AbortController().signal)).toBe("Town");
  expect(lookup).toHaveBeenCalledWith({ latitude: 60, longitude: 25 }, expect.any(AbortSignal));
  expect(await resolvePointAddress(point, async () => [], new AbortController().signal)).toBeNull();
  expect(
    await resolvePointAddress(
      point,
      async () => {
        throw new Error("offline");
      },
      new AbortController().signal,
    ),
  ).toBeNull();
});
it("bounds a stalled lookup and ignores a late result", async () => {
  vi.useFakeTimers();
  const result = resolvePointAddress(
    point,
    () => new Promise(() => {}),
    new AbortController().signal,
  );
  await vi.advanceTimersByTimeAsync(5000);
  expect(await result).toBeNull();
});

it("keeps published addresses and estimates unaddressed points in order", async () => {
  const done = Promise.withResolvers<unknown>();
  const native = vi
    .fn()
    .mockReturnValueOnce(done.promise)
    .mockResolvedValue([{ city: "Second" }]);
  const read = createPointAddressLookup(native);
  const { signal } = new AbortController();
  expect(await read({ ...point, address: "Published address" }, signal)).toBeNull();
  const first = read(point, signal);
  const coordinates = { latitude: 61, longitude: 24 };
  const second = read({ ...point, id: "node/2", coordinates }, signal);
  await Promise.resolve();
  expect(native).toHaveBeenCalledTimes(1);
  done.resolve([{ city: "First" }]);
  expect(await first).toBe("First");
  expect(await second).toBe("Second");
  expect(native).toHaveBeenLastCalledWith(coordinates, expect.any(AbortSignal));
});

it("does not dispatch queued work after cancel or timeout, or overlap a slow OS request", async () => {
  vi.useFakeTimers();
  const done = Promise.withResolvers<unknown>();
  const native = vi
    .fn()
    .mockReturnValueOnce(done.promise)
    .mockResolvedValue([{ city: "Fresh" }]);
  const read = createPointAddressLookup(native);
  const first = read(point, new AbortController().signal);
  const cancelled = new AbortController();
  const queued = read(point, cancelled.signal);
  const expires = read(point, new AbortController().signal);
  await Promise.resolve();
  cancelled.abort();
  expect(await queued).toBeNull();
  await vi.advanceTimersByTimeAsync(5000);
  expect(await first).toBeNull();
  expect(await expires).toBeNull();
  expect(native).toHaveBeenCalledTimes(1);
  done.resolve([{ city: "Late" }]);
  expect(await read(point, new AbortController().signal)).toBe("Fresh");
  expect(native).toHaveBeenCalledTimes(2);
});
it("does not look up an aborted request and cancels outstanding work", async () => {
  const controller = new AbortController();
  controller.abort();
  const lookup = vi.fn(async () => []);
  expect(await resolvePointAddress(point, lookup, controller.signal)).toBeNull();
  expect(lookup).not.toHaveBeenCalled();
  const next = new AbortController();
  const result = resolvePointAddress(point, () => new Promise(() => {}), next.signal);
  next.abort();
  expect(await result).toBeNull();
});
