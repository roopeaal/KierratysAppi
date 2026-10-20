import { type Coordinates, CoordinatesSchema } from "@kierratysappi/domain";

export class AddressLookupIssue extends Error {
  constructor(
    readonly reason: "invalid" | "ambiguous" | "unavailable" | "timeout" | "busy" | "cancelled",
  ) {
    super(reason);
  }
}

// One native request at a time, including after UI cancellation/timeout: OS geocoding
// cannot be forcibly cancelled. Never retain the query in a cache, history or log.
export function createManualLocationLookup(
  lookup: (address: string, signal: AbortSignal) => Promise<unknown>,
) {
  let pending = false;
  return async (input: unknown, signal: AbortSignal): Promise<Coordinates> => {
    if (typeof input !== "string" || input.length > 160 || /\p{C}/u.test(input))
      throw new AddressLookupIssue("invalid");
    const query = input.trim().replace(/\s+/gu, " ");
    if (!query) throw new AddressLookupIssue("invalid");
    if (signal.aborted) throw new AddressLookupIssue("cancelled");
    if (pending) throw new AddressLookupIssue("busy");
    pending = true;
    const requestController = new AbortController();
    const request = Promise.resolve()
      .then(() => {
        if (signal.aborted || requestController.signal.aborted)
          throw new AddressLookupIssue("cancelled");
        return lookup(`${query}, Finland`, requestController.signal);
      })
      .finally(() => {
        pending = false;
      });
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (
        coordinates: Coordinates | null,
        reason: AddressLookupIssue["reason"] = "unavailable",
      ) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        signal.removeEventListener("abort", cancel);
        if (!coordinates) requestController.abort();
        if (coordinates) resolve(coordinates);
        else reject(new AddressLookupIssue(reason));
      };
      const cancel = () => finish(null, "cancelled");
      const timer = setTimeout(() => finish(null, "timeout"), 5000);
      signal.addEventListener("abort", cancel, { once: true });
      request
        .then((value) => {
          if (signal.aborted) return cancel();
          if (!Array.isArray(value) || value.length === 0 || value.length > 20) return finish(null);
          // A postcode/address is an estimated origin, never a GPS fix or verified place.
          if (value.length !== 1) return finish(null, "ambiguous");
          const coordinates = CoordinatesSchema.safeParse(value[0]);
          if (!coordinates.success) return finish(null);
          const { latitude, longitude } = coordinates.data;
          if (latitude < 59 || latitude > 71.5 || longitude < 19 || longitude > 32)
            return finish(null);
          finish({ latitude, longitude });
        })
        .catch(() => finish(null));
    });
  };
}
