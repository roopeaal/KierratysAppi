import { describe, expect, it } from "vitest";
import {
  LocalVisionReadinessSchema,
  localVisionReadinessSchemaVersion,
  NativeLocalVisionReadinessSchema,
  normalizeLocalVisionReadiness,
} from "../local-vision-readiness";
import {
  packagingImageWeightSha256,
  packagingModelId,
  packagingModelRevision,
  packagingPromptsSha256,
  packagingPrototypesSha256,
} from "../packaging-classifier";

const full = {
  schemaVersion: localVisionReadinessSchemaVersion,
  status: "full",
  evidence: "integrity_and_interface_only",
  modelId: packagingModelId,
  modelRevision: packagingModelRevision,
  imageWeightSha256: packagingImageWeightSha256,
  prototypesSha256: packagingPrototypesSha256,
  promptsSha256: packagingPromptsSha256,
  promptPolicy: "packaging-visible-form-v1",
  preprocessing: "center-square-256-srgb-v1",
  computeUnits: "cpuOnly",
} as const;
const invalid = {
  schemaVersion: localVisionReadinessSchemaVersion,
  status: "unavailable",
  reason: "invalid_response",
};

describe("no-image local recognition readiness boundary", () => {
  it("accepts only the complete pinned integrity/interface snapshot, not accuracy evidence", () => {
    expect(normalizeLocalVisionReadiness(full)).toEqual(full);
    expect(LocalVisionReadinessSchema.safeParse(full).success).toBe(true);
  });

  for (const reason of ["unsupported_model_platform", "model_unavailable"]) {
    it(`preserves an explicitly partial native installation: ${reason}`, () => {
      const value = {
        schemaVersion: localVisionReadinessSchemaVersion,
        status: "primary_only",
        reason,
        evidence: "integrity_and_interface_only",
      };
      expect(normalizeLocalVisionReadiness(value)).toEqual(value);
    });
  }

  for (const reason of ["primary_unavailable", "busy", "timeout", "processing_failed"]) {
    it(`preserves native unavailability: ${reason}`, () => {
      const value = {
        schemaVersion: localVisionReadinessSchemaVersion,
        status: "unavailable",
        reason,
      };
      expect(normalizeLocalVisionReadiness(value)).toEqual(value);
    });
  }

  it("lets the client represent a legacy bridge without trusting a native legacy self-report", () => {
    const legacy = {
      schemaVersion: localVisionReadinessSchemaVersion,
      status: "primary_only",
      reason: "legacy_not_reported",
      evidence: "not_reported",
    };
    expect(LocalVisionReadinessSchema.safeParse(legacy).success).toBe(true);
    expect(NativeLocalVisionReadinessSchema.safeParse(legacy).success).toBe(false);
    expect(normalizeLocalVisionReadiness(legacy)).toEqual(invalid);
    expect(
      LocalVisionReadinessSchema.safeParse({ ...legacy, evidence: "integrity_and_interface_only" })
        .success,
    ).toBe(false);
  });

  for (const reason of [
    "unsupported_platform",
    "native_unavailable",
    "cancelled",
    "invalid_response",
  ]) {
    it(`keeps synthetic client failure ${reason} outside the native wire contract`, () => {
      const value = {
        schemaVersion: localVisionReadinessSchemaVersion,
        status: "unavailable",
        reason,
      };
      expect(LocalVisionReadinessSchema.safeParse(value).success).toBe(true);
      expect(NativeLocalVisionReadinessSchema.safeParse(value).success).toBe(false);
      expect(normalizeLocalVisionReadiness(value)).toEqual(invalid);
    });
  }

  for (const field of [
    "modelId",
    "modelRevision",
    "imageWeightSha256",
    "prototypesSha256",
    "promptsSha256",
    "promptPolicy",
    "preprocessing",
    "computeUnits",
    "schemaVersion",
    "evidence",
  ] as const) {
    it(`rejects omitted or changed pinned ${field}`, () => {
      const omitted: Record<string, unknown> = { ...full };
      delete omitted[field];
      expect(normalizeLocalVisionReadiness(omitted)).toEqual(invalid);
      expect(normalizeLocalVisionReadiness({ ...full, [field]: "unreviewed-version" })).toEqual(
        invalid,
      );
    });
  }

  for (const claim of [
    { verified: true },
    { accuracy: 1 },
    { scores: [] },
    { image: "private" },
    { resourceURL: "file:///private/model" },
    { downloadURL: "https://example.invalid/model" },
    { reason: "primary_match" },
    { observedAt: "2026-11-07" },
  ]) {
    it(`rejects extra claims/data: ${Object.keys(claim)[0]}`, () => {
      expect(normalizeLocalVisionReadiness({ ...full, ...claim })).toEqual(invalid);
    });
  }

  for (const value of [
    null,
    undefined,
    [],
    true,
    "full",
    {},
    { status: "full" },
    { schemaVersion: localVisionReadinessSchemaVersion, status: "unavailable", reason: "failed" },
    {
      schemaVersion: localVisionReadinessSchemaVersion,
      status: "primary_only",
      reason: "model_unavailable",
    },
    {
      schemaVersion: localVisionReadinessSchemaVersion,
      status: "unavailable",
      reason: "busy",
      detail: "private",
    },
  ]) {
    it(`fails closed for malformed native readiness ${JSON.stringify(value)}`, () => {
      expect(normalizeLocalVisionReadiness(value)).toEqual(invalid);
    });
  }
});
