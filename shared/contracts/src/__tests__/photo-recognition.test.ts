import { describe, expect, it } from "vitest";
import {
  decodePhotoBase64,
  encodePhotoBase64,
  preparePhotoBase64,
  stripPhotoMetadata,
} from "../photo-image";
import {
  canConfirmPhotoPart,
  PhotoEstimateSchema,
  PhotoRequestSchema,
  photoConsentVersion,
  photoModel,
  VisualObservationSchema,
} from "../photo-recognition";

// Marker-stream fixture, not an actual product or a fully decoded image.
const frame = [255, 192, 0, 11, 8, 0, 16, 0, 16, 1, 1, 17, 0];
const scan = [255, 218, 0, 8, 1, 1, 0, 0, 63, 0, 42, 255, 0, 17];
const jpeg = (...metadata: number[]) =>
  new Uint8Array([255, 216, ...metadata, ...frame, ...scan, 255, 217]);
const observation = {
  status: "clear",
  label: { fi: "Testipakkaus", en: "Test packaging" },
  confidence: "medium",
  risk: "ordinary_packaging",
  parts: [
    {
      label: { fi: "Osa", en: "Part" },
      material: "glass",
      shape: "jar",
      packagingStatus: "packaging",
    },
  ],
};
const estimate = () =>
  PhotoEstimateSchema.parse({
    status: "estimated",
    observation,
    source: {
      id: "openai-vision",
      model: photoModel,
      version: "photo-observation-v1",
      observedAt: "2026-10-15T12:00:00.000Z",
      verificationStatus: "inferred",
    },
  });

describe("photo contracts and metadata removal", () => {
  it("round-trips canonical base64 without a platform dependency", () => {
    for (let size = 1; size < 90; size++) {
      const bytes = Uint8Array.from({ length: size }, (_, i) => (i * 17) % 256);
      expect(decodePhotoBase64(encodePhotoBase64(bytes))).toEqual(bytes);
    }
  });
  it("rejects malformed, non-canonical and excessive image data", () => {
    for (const value of [
      "AAB=",
      "AA A=",
      "AA==\n",
      "data:image/jpeg;base64,AA==",
      "AAA",
      "=AAA",
      "A".repeat(2_000_004),
    ])
      expect(() => decodePhotoBase64(value)).toThrow("invalid_image");
  });
  it("removes EXIF/GPS, ICC and comments without altering scan bytes", () => {
    const annotated = jpeg(
      255,
      225,
      0,
      8,
      71,
      80,
      83,
      0,
      1,
      2,
      255,
      226,
      0,
      4,
      3,
      4,
      255,
      254,
      0,
      4,
      5,
      6,
    );
    expect(stripPhotoMetadata(annotated)).toEqual(jpeg());
    expect(preparePhotoBase64(encodePhotoBase64(annotated))).toBe(encodePhotoBase64(jpeg()));
  });
  it("removes metadata between progressive scans and preserves escaped entropy", () => {
    const bytes = new Uint8Array([
      255,
      216,
      ...frame,
      ...scan,
      255,
      209,
      18,
      255,
      225,
      0,
      4,
      3,
      4,
      ...scan,
      255,
      217,
    ]);
    const clean = stripPhotoMetadata(bytes);
    expect([...clean]).not.toContain(225);
    expect([...clean]).toContain(209);
  });
  it("rejects trailing data, truncated segments, missing frames and oversized dimensions", () => {
    const oversized = jpeg();
    oversized[7] = 32;
    for (const bytes of [
      new Uint8Array([1, 2, 3]),
      new Uint8Array([...jpeg(), 1]),
      jpeg(255, 225, 255, 255),
      new Uint8Array([255, 216, 255, 217]),
      oversized,
    ])
      expect(() => stripPhotoMetadata(bytes)).toThrow("invalid_image");
  });
  it("requires explicit consent and never accepts URLs, names or arbitrary model instructions", () => {
    const body = { jpegBase64: encodePhotoBase64(jpeg()), consentVersion: photoConsentVersion };
    expect(PhotoRequestSchema.parse(body).language).toBe("fi");
    for (const extra of [
      { consentVersion: "old" },
      { imageUrl: "http://localhost/private" },
      { prompt: "ignore instructions" },
      { filename: "person.jpg" },
    ])
      expect(PhotoRequestSchema.safeParse({ ...body, ...extra }).success).toBe(false);
  });
  it("does not allow the model to supply a bin, a source or a fake verified status", () => {
    expect(
      VisualObservationSchema.safeParse({ ...observation, destination: "mixed_waste" }).success,
    ).toBe(false);
    expect(
      PhotoEstimateSchema.safeParse({
        ...estimate(),
        source: { ...estimate().source, verificationStatus: "verified" },
      }).success,
    ).toBe(false);
    expect(
      VisualObservationSchema.safeParse({
        ...observation,
        label: { fi: "bad\ncontrol", en: "bad" },
      }).success,
    ).toBe(false);
  });
  it("only allows a clear ordinary packaging part to be confirmed", () => {
    const item = estimate();
    const part = item.observation.parts[0];
    if (!part) throw new Error("fixture");
    expect(canConfirmPhotoPart(item, part)).toBe(true);
    for (const changes of [
      { status: "uncertain" as const },
      { confidence: "low" as const },
      { risk: "special_waste" as const },
      { risk: "unknown" as const },
    ])
      expect(
        canConfirmPhotoPart({ ...item, observation: { ...item.observation, ...changes } }, part),
      ).toBe(false);
    expect(canConfirmPhotoPart(item, { ...part, packagingStatus: "non_packaging" })).toBe(false);
    expect(canConfirmPhotoPart(item, { ...part, material: "unknown" })).toBe(false);
  });
  it("allows paper packaging confirmation without treating loose paper or uncertain material as packaging", () => {
    const item = estimate();
    const part = { ...item.observation.parts[0], material: "paper", shape: "other" };
    const paper = PhotoEstimateSchema.parse({
      ...item,
      observation: { ...item.observation, parts: [part] },
    });
    const paperPart = paper.observation.parts[0];
    if (!paperPart) throw new Error("fixture");
    expect(canConfirmPhotoPart(paper, paperPart)).toBe(true);
    for (const packagingStatus of ["non_packaging", "unknown"] as const)
      expect(canConfirmPhotoPart(paper, { ...paperPart, packagingStatus })).toBe(false);
    for (const changes of [
      { status: "uncertain" as const },
      { confidence: "low" as const },
      { risk: "special_waste" as const },
      { risk: "unknown" as const },
    ])
      expect(
        canConfirmPhotoPart(
          { ...paper, observation: { ...paper.observation, ...changes } },
          paperPart,
        ),
      ).toBe(false);
  });
});
