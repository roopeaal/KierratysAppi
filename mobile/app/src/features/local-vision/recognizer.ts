import { preparePhotoBase64 } from "@kierratysappi/contracts/photo-image";
import {
  type LocalVisionObservation,
  normalizeLocalVisionResult,
} from "@kierratysappi/contracts/local-vision";

export type LocalVisionNativeReader = {
  recognize(jpegBase64: string): Promise<unknown>;
};
export type LocalPhotoResponse =
  | { readonly status: "observed"; readonly observation: LocalVisionObservation }
  | {
      readonly status: "unavailable";
      readonly reason:
        | "unsupported"
        | "invalid_image"
        | "busy"
        | "failed"
        | "timeout"
        | "cancelled";
    };

/** A cancelled UI request never releases the single-flight gate before native work settles. */
export function createLocalRecognizer(
  getReader: () => LocalVisionNativeReader | undefined,
  deadlineMs = 15_000,
) {
  let running = false;
  return async (jpeg: string, signal: AbortSignal): Promise<LocalPhotoResponse> => {
    const failure = (reason: Extract<LocalPhotoResponse, { status: "unavailable" }>["reason"]) =>
      ({ status: "unavailable", reason }) as const;
    if (signal.aborted) return failure("cancelled");
    if (running) return failure("busy");
    let reader: LocalVisionNativeReader | undefined;
    try {
      reader = getReader();
    } catch {
      return failure("unsupported");
    }
    if (!reader) return failure("unsupported");
    let prepared: string;
    try {
      prepared = preparePhotoBase64(jpeg);
    } catch {
      return failure("invalid_image");
    }
    running = true;
    const operation = Promise.resolve()
      .then(async (): Promise<LocalPhotoResponse> => {
        if (signal.aborted) return failure("cancelled");
        const raw = await reader.recognize(prepared);
        if (signal.aborted) return failure("cancelled");
        const result = normalizeLocalVisionResult(raw);
        return result.status === "observed"
          ? { status: "observed", observation: result }
          : failure("failed");
      })
      .catch((error: unknown): LocalPhotoResponse => {
        const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
        return failure(
          code === "ERR_LOCAL_VISION_BUSY"
            ? "busy"
            : code === "ERR_LOCAL_VISION_INVALID_IMAGE"
              ? "invalid_image"
              : code === "ERR_LOCAL_VISION_UNAVAILABLE"
                ? "unsupported"
                : "failed",
        );
      })
      .finally(() => {
        running = false;
      });
    let abort = () => {};
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cancelled = new Promise<LocalPhotoResponse>((resolve) => {
      abort = () => resolve(failure("cancelled"));
      signal.addEventListener("abort", abort, { once: true });
      if (signal.aborted) abort();
      timer = setTimeout(() => resolve(failure("timeout")), deadlineMs);
    });
    try {
      return await Promise.race([operation, cancelled]);
    } finally {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
    }
  };
}

export function isLocalCaptureUri(uri: string, cacheUri: string): boolean {
  try {
    const image = new URL(uri);
    const cache = new URL(cacheUri);
    return (
      image.protocol === "file:" &&
      cache.protocol === "file:" &&
      image.host === cache.host &&
      !image.search &&
      !image.hash &&
      !/[\p{Cc}\p{Cf}\\]/u.test(uri) &&
      !/%(?:00|25|2e|2f|5c)/iu.test(uri) &&
      image.pathname.startsWith(`${cache.pathname.replace(/\/$/u, "")}/`) &&
      /\.jpe?g$/iu.test(image.pathname)
    );
  } catch {
    return false;
  }
}
