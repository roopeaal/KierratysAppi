import {
  packagingImageWeightSha256,
  packagingModelId,
  packagingModelRevision,
  packagingPromptsSha256,
  packagingPrototypesSha256,
} from "@kierratysappi/contracts/packaging-classifier";
import { messages } from "@kierratysappi/localization";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createLocalReadinessInspector, localReadinessMessage } from "../readiness";

const schemaVersion = "local-vision-readiness-v1" as const;
const full = () => ({
  schemaVersion,
  status: "full" as const,
  evidence: "integrity_and_interface_only" as const,
  modelId: packagingModelId,
  modelRevision: packagingModelRevision,
  imageWeightSha256: packagingImageWeightSha256,
  prototypesSha256: packagingPrototypesSha256,
  promptsSha256: packagingPromptsSha256,
  promptPolicy: "packaging-visible-form-v1" as const,
  preprocessing: "center-square-256-srgb-v1" as const,
  computeUnits: "cpuOnly" as const,
});
const signal = () => new AbortController().signal;
const deferred = () => {
  let resolve!: (value: unknown) => void;
  const promise = new Promise<unknown>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};
afterEach(() => vi.useRealTimers());

describe("no-image local readiness client", () => {
  it("only calls the no-argument integrity entry and retains actual pinned metadata", async () => {
    const recognize = vi.fn();
    const inspectReadiness = vi.fn(async () => full());
    const result = await createLocalReadinessInspector(() => ({ recognize, inspectReadiness }))(
      signal(),
    );
    expect(result).toEqual(full());
    expect(inspectReadiness).toHaveBeenCalledExactlyOnceWith();
    expect(recognize).not.toHaveBeenCalled();
    expect(result).not.toHaveProperty("accuracy");
    expect(result).not.toHaveProperty("image");
  });
  it("does not invent a full or absent-model claim for legacy recognize-only binaries", async () => {
    const recognize = vi.fn();
    expect(await createLocalReadinessInspector(() => ({ recognize }))(signal())).toEqual({
      schemaVersion,
      status: "primary_only",
      reason: "legacy_not_reported",
      evidence: "not_reported",
    });
    expect(recognize).not.toHaveBeenCalled();
  });
  it("contains absent modules and loader exceptions without any fallback", async () => {
    for (const getReader of [
      () => undefined,
      () => {
        throw new Error("must not escape");
      },
    ])
      expect(await createLocalReadinessInspector(getReader)(signal())).toMatchObject({
        reason: "native_unavailable",
      });
  });
  it("contains a throwing SDK method accessor without requesting recognition", async () => {
    const recognize = vi.fn();
    const result = await createLocalReadinessInspector(() => ({
      recognize,
      get inspectReadiness(): () => Promise<unknown> {
        throw new Error("SDK accessor");
      },
    }))(signal());
    expect(result).toMatchObject({ reason: "native_unavailable" });
    expect(recognize).not.toHaveBeenCalled();
  });
  it("contains a throwing error-code accessor as a typed preparation failure", async () => {
    const result = await createLocalReadinessInspector(() => ({
      recognize: vi.fn(),
      inspectReadiness: async () => {
        throw {
          get code(): string {
            throw new Error("error accessor");
          },
        };
      },
    }))(signal());
    expect(result).toEqual({ schemaVersion, status: "unavailable", reason: "processing_failed" });
  });
  for (const reason of ["unsupported_model_platform", "model_unavailable"] as const) {
    it(`retains honest ${reason} primary-only readiness`, async () => {
      const result = {
        schemaVersion,
        status: "primary_only",
        reason,
        evidence: "integrity_and_interface_only",
      };
      expect(
        await createLocalReadinessInspector(() => ({
          recognize: vi.fn(),
          inspectReadiness: async () => result,
        }))(signal()),
      ).toEqual(result);
    });
  }
  it("rejects forged full pins, quality claims, extra fields and native-synthetic legacy statuses", async () => {
    for (const raw of [
      { ...full(), modelRevision: "different" },
      { ...full(), accuracy: 1 },
      { ...full(), evidence: "recognition_tested" },
      {
        schemaVersion,
        status: "primary_only",
        reason: "legacy_not_reported",
        evidence: "not_reported",
      },
      { schemaVersion, status: "unavailable", reason: "cancelled" },
      null,
    ]) {
      expect(
        await createLocalReadinessInspector(() => ({
          recognize: vi.fn(),
          inspectReadiness: async () => raw,
        }))(signal()),
      ).toMatchObject({ reason: "invalid_response" });
    }
  });
  it("bounds unexpected rejections and preserves typed native busy", async () => {
    for (const [code, reason] of [
      ["ERR_LOCAL_VISION_BUSY", "busy"],
      ["other", "processing_failed"],
    ]) {
      const inspect = createLocalReadinessInspector(() => ({
        recognize: vi.fn(),
        inspectReadiness: async () => {
          throw { code, message: "private" };
        },
      }));
      expect(await inspect(signal())).toEqual({ schemaVersion, status: "unavailable", reason });
    }
  });
  it("does no native work for an already-cancelled request or queued cancellation", async () => {
    const inspectReadiness = vi.fn(async () => full());
    const inspect = createLocalReadinessInspector(() => ({ recognize: vi.fn(), inspectReadiness }));
    const cancelled = new AbortController();
    cancelled.abort();
    expect(await inspect(cancelled.signal)).toMatchObject({ reason: "cancelled" });
    const queued = new AbortController();
    const result = inspect(queued.signal);
    queued.abort();
    expect(await result).toMatchObject({ reason: "cancelled" });
    expect(inspectReadiness).not.toHaveBeenCalled();
  });
  it("keeps single-flight after blur/abort and suppresses late results until actual settle", async () => {
    const native = deferred();
    const inspectReadiness = vi.fn(() => native.promise);
    const inspect = createLocalReadinessInspector(() => ({ recognize: vi.fn(), inspectReadiness }));
    const controller = new AbortController();
    const first = inspect(controller.signal);
    await Promise.resolve();
    controller.abort();
    expect(await first).toMatchObject({ reason: "cancelled" });
    expect(await inspect(signal())).toMatchObject({ reason: "busy" });
    native.resolve(full());
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    expect(await inspect(signal())).toEqual(full());
  });
  it("keeps single-flight through UI timeout, then allows a fresh integrity check", async () => {
    vi.useFakeTimers();
    const native = deferred();
    const inspect = createLocalReadinessInspector(
      () => ({ recognize: vi.fn(), inspectReadiness: () => native.promise }),
      30,
    );
    const first = inspect(signal());
    await vi.advanceTimersByTimeAsync(31);
    expect(await first).toMatchObject({ reason: "timeout" });
    expect(await inspect(signal())).toMatchObject({ reason: "busy" });
    native.resolve(full());
    await vi.advanceTimersByTimeAsync(0);
    expect(await inspect(signal())).toEqual(full());
    expect(vi.getTimerCount()).toBe(0);
  });
  it("gives every recovery state a truthful localized message, not a success/accuracy badge", () => {
    expect(localReadinessMessage(full())).toBeUndefined();
    expect(
      localReadinessMessage({ schemaVersion, status: "unavailable", reason: "cancelled" }),
    ).toBeUndefined();
    for (const reason of [
      "legacy_not_reported",
      "unsupported_model_platform",
      "model_unavailable",
    ] as const) {
      const key =
        reason === "legacy_not_reported"
          ? localReadinessMessage({
              schemaVersion,
              status: "primary_only",
              reason,
              evidence: "not_reported",
            })
          : localReadinessMessage({
              schemaVersion,
              status: "primary_only",
              reason,
              evidence: "integrity_and_interface_only",
            });
      expect(key).toBeTruthy();
      if (key) {
        expect(messages.fi[key].length).toBeGreaterThan(20);
        expect(messages.en[key].length).toBeGreaterThan(20);
      }
    }
    for (const reason of [
      "unsupported_platform",
      "native_unavailable",
      "primary_unavailable",
      "busy",
      "timeout",
      "invalid_response",
      "processing_failed",
    ] as const)
      expect(localReadinessMessage({ schemaVersion, status: "unavailable", reason })).toBeTruthy();
  });
});
