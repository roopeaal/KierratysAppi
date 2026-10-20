import { afterEach, expect, it, vi } from "vitest";
import { createManualLocationLookup } from "../manual-location";

const fix = { latitude: 60.17, longitude: 24.94 };
afterEach(() => vi.useRealTimers());

it("sends one bounded Finland query and returns coordinates only, not GPS accuracy or provider identity", async () => {
  const lookup = vi.fn(async () => [{ ...fix, accuracy: 20, name: "Not a verified point" }]);
  const signal = new AbortController().signal;
  await expect(
    createManualLocationLookup(lookup)("  Museokatu   5 Helsinki ", signal),
  ).resolves.toEqual(fix);
  expect(lookup).toHaveBeenCalledExactlyOnceWith(
    "Museokatu 5 Helsinki, Finland",
    expect.any(AbortSignal),
  );
});

it("rejects empty, overlong, control-character and non-string input before dispatch", async () => {
  const lookup = vi.fn(async () => [fix]);
  const run = createManualLocationLookup(lookup);
  for (const input of [" ", "x".repeat(161), "address\nprivate", null, 12345])
    await expect(run(input, new AbortController().signal)).rejects.toMatchObject({
      reason: "invalid",
    });
  expect(lookup).not.toHaveBeenCalled();
});

it("refuses missing, malformed, non-Finland-bounded or oversized provider results", async () => {
  for (const value of [
    null,
    [],
    [{}],
    [{ latitude: "60", longitude: 25 }],
    [{ latitude: 0, longitude: 0 }],
    Array.from({ length: 21 }, () => fix),
  ]) {
    await expect(
      createManualLocationLookup(async () => value)("00110", new AbortController().signal),
    ).rejects.toMatchObject({ reason: "unavailable" });
  }
});

it("does not pick an arbitrary match for an ambiguous address", async () => {
  await expect(
    createManualLocationLookup(async () => [fix, { latitude: 61, longitude: 25 }])(
      "Museokatu",
      new AbortController().signal,
    ),
  ).rejects.toMatchObject({ reason: "ambiguous" });
});

it("does not dispatch when already cancelled and ignores a late native result after cancellation", async () => {
  const controller = new AbortController();
  controller.abort();
  const lookup = vi.fn(async () => [fix]);
  await expect(
    createManualLocationLookup(lookup)("00110", controller.signal),
  ).rejects.toMatchObject({ reason: "cancelled" });
  expect(lookup).not.toHaveBeenCalled();
  let complete: (value: unknown) => void = () => {};
  const run = createManualLocationLookup(
    () =>
      new Promise((resolve) => {
        complete = resolve;
      }),
  );
  const next = new AbortController();
  const pending = run("00110", next.signal);
  const rejected = expect(pending).rejects.toMatchObject({ reason: "cancelled" });
  await Promise.resolve();
  next.abort();
  await rejected;
  complete([fix]);
  await Promise.resolve();
});

it("times out without retrying and keeps uncancellable native work single-flight until it settles", async () => {
  vi.useFakeTimers();
  let complete: (value: unknown) => void = () => {};
  const lookup = vi.fn(
    () =>
      new Promise((resolve) => {
        complete = resolve;
      }),
  );
  const run = createManualLocationLookup(lookup);
  const pending = run("00110", new AbortController().signal);
  const rejected = expect(pending).rejects.toMatchObject({ reason: "timeout" });
  await vi.advanceTimersByTimeAsync(5000);
  await rejected;
  await expect(run("00120", new AbortController().signal)).rejects.toMatchObject({
    reason: "busy",
  });
  expect(lookup).toHaveBeenCalledTimes(1);
  complete([fix]);
  await vi.advanceTimersByTimeAsync(0);
  lookup.mockResolvedValueOnce([fix]);
  await expect(run("00120", new AbortController().signal)).resolves.toEqual(fix);
});

it("turns provider rejection into a safe failure and permits an explicit later attempt", async () => {
  const lookup = vi
    .fn()
    .mockRejectedValueOnce(new Error("private provider diagnostic"))
    .mockResolvedValueOnce([fix]);
  const run = createManualLocationLookup(lookup);
  await expect(run("00110", new AbortController().signal)).rejects.toMatchObject({
    reason: "unavailable",
    message: "unavailable",
  });
  await expect(run("00110", new AbortController().signal)).resolves.toEqual(fix);
  expect(lookup).toHaveBeenCalledTimes(2);
});

it("aborts the adapter deadline so a late permission approval cannot start geocoding", async () => {
  vi.useFakeTimers();
  let approve: () => void = () => {};
  const permission = new Promise<void>((resolve) => {
    approve = resolve;
  });
  const geocode = vi.fn(async (_address: string) => [fix]);
  const run = createManualLocationLookup(async (address, signal) => {
    await permission;
    if (signal.aborted) throw new Error("cancelled before native dispatch");
    return geocode(address);
  });
  const rejected = expect(run("00110", new AbortController().signal)).rejects.toMatchObject({
    reason: "timeout",
  });
  await vi.advanceTimersByTimeAsync(5000);
  await rejected;
  approve();
  await vi.advanceTimersByTimeAsync(0);
  expect(geocode).not.toHaveBeenCalled();
});
