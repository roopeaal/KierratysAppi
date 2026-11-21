import { type LocationFix, LocationIssue } from "./location-session";

export type FixOptions = { readonly prompt?: boolean; readonly refresh?: boolean };
type PermissionCheck = (prompt: boolean) => Promise<boolean>;
type ReadFix = (signal: AbortSignal) => Promise<LocationFix>;
const maxFixAge = 60_000;

/** One active acquisition; keep a fresh fix only in RAM and only while in the foreground. */
export function createForegroundFix(permission: PermissionCheck, acquire: ReadFix, now = Date.now) {
  type Flight = { controller: AbortController; promise: Promise<LocationFix>; readers: number };
  let cached: LocationFix | undefined;
  let expiry: ReturnType<typeof setTimeout> | undefined;
  let flight: Flight | undefined;
  let generation = 0;
  const clearCache = () => {
    cached = undefined;
    clearTimeout(expiry);
    expiry = undefined;
  };
  const clear = () => {
    generation++;
    clearCache();
    flight?.controller.abort();
    flight = undefined;
  };
  const read = async (signal: AbortSignal, options: FixOptions = {}) => {
    const current = generation;
    const check = () => {
      if (signal.aborted || current !== generation) throw new LocationIssue("cancelled");
    };
    check();
    const granted = await permission(options.prompt === true);
    check();
    if (!granted) {
      clearCache();
      throw new LocationIssue("permission");
    }
    if (!options.refresh && cached && now() - cached.timestamp <= maxFixAge) return cached;
    if (!flight) {
      const controller = new AbortController();
      const promise = Promise.resolve()
        .then(() => acquire(controller.signal))
        .then((fix) => {
          if (controller.signal.aborted || current !== generation)
            throw new LocationIssue("cancelled");
          clearCache();
          cached = fix;
          expiry = setTimeout(clearCache, Math.max(0, maxFixAge - (now() - fix.timestamp)));
          return fix;
        })
        .finally(() => {
          if (flight?.controller === controller) flight = undefined;
        });
      flight = { controller, promise, readers: 0 };
    }
    const pending = flight;
    pending.readers++;
    return new Promise<LocationFix>((resolve, reject) => {
      const abort = () => finish(undefined, new LocationIssue("cancelled"));
      let complete = false;
      function finish(fix?: LocationFix, error?: unknown) {
        if (complete) return;
        complete = true;
        signal.removeEventListener("abort", abort);
        if (--pending.readers === 0 && flight === pending) {
          flight = undefined;
          pending.controller.abort();
        }
        if (fix) {
          try {
            check();
            resolve(fix);
          } catch (cancelled) {
            reject(cancelled);
          }
        } else reject(error);
      }
      signal.addEventListener("abort", abort, { once: true });
      void pending.promise.then(
        (fix) => finish(fix),
        (error) => finish(undefined, error),
      );
      if (signal.aborted) abort();
    });
  };
  return { clear, read };
}
