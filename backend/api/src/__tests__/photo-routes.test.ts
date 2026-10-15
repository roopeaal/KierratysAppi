import { encodePhotoBase64 } from "@kierratysappi/contracts/photo-image";
import {
  PhotoEstimateSchema,
  photoConsentVersion,
  photoModel,
  photoRecognitionPath,
} from "@kierratysappi/contracts/photo-recognition";
import type { PhotoRecognizer } from "@kierratysappi/data-providers";
import type { FastifyInstance } from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildApp } from "../app";
import { allowPhotoRecognition, parseEnvironment } from "../config";

const apps: FastifyInstance[] = [];
afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});
const jpeg = encodePhotoBase64(
  new Uint8Array([
    255, 216, 255, 192, 0, 11, 8, 0, 16, 0, 16, 1, 1, 17, 0, 255, 218, 0, 8, 1, 1, 0, 0, 63, 0, 42,
    255, 217,
  ]),
);
const payload = { jpegBase64: jpeg, consentVersion: photoConsentVersion, language: "fi" };
const estimated = PhotoEstimateSchema.parse({
  status: "estimated",
  observation: {
    status: "uncertain",
    confidence: "low",
    risk: "unknown",
    label: { fi: "Testiesine", en: "Test item" },
    parts: [],
  },
  source: {
    id: "openai-vision",
    model: photoModel,
    version: "photo-observation-v1",
    observedAt: "2026-10-15T12:00:00.000Z",
    verificationStatus: "inferred",
  },
});
async function makeApp(recognizer?: PhotoRecognizer) {
  const app = await buildApp({
    lookupService: { lookup: async (input) => ({ status: "not_found", gtin: input.gtin }) },
    ...(recognizer ? { photoRecognizer: recognizer } : {}),
  });
  apps.push(app);
  return app;
}

describe("photo API safety", () => {
  it("is disabled by default and can never be enabled in production", async () => {
    const app = await makeApp();
    expect((await app.inject({ url: "/v1/recycling/photo-capabilities" })).json()).toEqual({
      enabled: false,
      consentVersion: photoConsentVersion,
    });
    expect(
      (await app.inject({ method: "POST", url: photoRecognitionPath, payload })).statusCode,
    ).toBe(503);
    const dev = parseEnvironment({ NODE_ENV: "development", PHOTO_AI_ENABLED: "true" });
    expect(allowPhotoRecognition(dev, true)).toBe(true);
    expect(allowPhotoRecognition({ ...dev, NODE_ENV: "production" }, true)).toBe(false);
    expect(allowPhotoRecognition(dev, false)).toBe(false);
    expect(allowPhotoRecognition(parseEnvironment({}), true)).toBe(false);
  });
  it("rejects missing consent, extra inputs, URLs and malformed images before provider calls", async () => {
    const recognize = vi.fn<PhotoRecognizer["recognize"]>().mockResolvedValue(estimated);
    const app = await makeApp({ recognize });
    for (const [index, body] of [
      { ...payload, consentVersion: undefined },
      { ...payload, imageUrl: "http://localhost/private" },
      { ...payload, jpegBase64: "not a jpeg" },
    ].entries()) {
      expect(
        (
          await app.inject({
            method: "POST",
            url: photoRecognitionPath,
            payload: body,
            remoteAddress: `192.0.2.${index + 1}`,
          })
        ).statusCode,
      ).toBe(400);
    }
    expect(recognize).not.toHaveBeenCalled();
  });
  it("bounds photo requests independently without weakening the barcode body limit", async () => {
    const app = await makeApp();
    expect(
      (
        await app.inject({
          method: "POST",
          url: photoRecognitionPath,
          payload: { ...payload, jpegBase64: "A".repeat(2_001_025) },
        })
      ).statusCode,
    ).toBe(413);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/v1/recycling/lookup",
          payload: { gtin: "A".repeat(3000) },
        })
      ).statusCode,
    ).toBe(413);
  });
  it("returns inference-only data with no-store and no shared scan-history side effect", async () => {
    const recognize = vi.fn<PhotoRecognizer["recognize"]>().mockResolvedValue(estimated);
    const app = await makeApp({ recognize });
    const result = await app.inject({ method: "POST", url: photoRecognitionPath, payload });
    expect(result.statusCode).toBe(200);
    expect(result.json()).toEqual(estimated);
    expect(result.headers["cache-control"]).toBe("private, no-store");
    expect(recognize).toHaveBeenCalledTimes(1);
  });
  it("limits requests per client", async () => {
    const recognize = vi.fn<PhotoRecognizer["recognize"]>().mockResolvedValue(estimated);
    const app = await makeApp({ recognize });
    for (let i = 0; i < 3; i++)
      await app.inject({ method: "POST", url: photoRecognitionPath, payload });
    expect(
      (await app.inject({ method: "POST", url: photoRecognitionPath, payload })).statusCode,
    ).toBe(429);
    expect(recognize).toHaveBeenCalledTimes(3);
  });
  it("caps the entire development process even if client addresses vary", async () => {
    const recognize = vi.fn<PhotoRecognizer["recognize"]>().mockResolvedValue(estimated);
    const app = await makeApp({ recognize });
    for (let i = 0; i < 20; i++)
      expect(
        (
          await app.inject({
            method: "POST",
            url: photoRecognitionPath,
            payload,
            remoteAddress: `192.0.2.${i + 1}`,
          })
        ).statusCode,
      ).toBe(200);
    expect(
      (
        await app.inject({
          method: "POST",
          url: photoRecognitionPath,
          payload,
          remoteAddress: "192.0.2.99",
        })
      ).statusCode,
    ).toBe(429);
    expect(recognize).toHaveBeenCalledTimes(20);
  });
  it("redacts errors instead of logging or returning provider contents", async () => {
    const app = await makeApp({
      recognize: async () => {
        throw new Error("private image response");
      },
    });
    const result = await app.inject({ method: "POST", url: photoRecognitionPath, payload });
    expect(result.statusCode).toBe(503);
    expect(result.body).not.toContain("private image");
  });
  it("allows at most two concurrent billable calls", async () => {
    const releases: Array<(value: typeof estimated) => void> = [];
    const app = await makeApp({
      recognize: () =>
        new Promise((resolve) => {
          releases.push(resolve);
        }),
    });
    const first = app
      .inject({ method: "POST", url: photoRecognitionPath, payload })
      .then((result) => result.statusCode);
    const second = app
      .inject({ method: "POST", url: photoRecognitionPath, payload })
      .then((result) => result.statusCode);
    await vi.waitFor(() => expect(releases).toHaveLength(2));
    expect(
      (await app.inject({ method: "POST", url: photoRecognitionPath, payload })).statusCode,
    ).toBe(429);
    for (const release of releases) release(estimated);
    expect(await Promise.all([first, second])).toEqual([200, 200]);
  });
});
