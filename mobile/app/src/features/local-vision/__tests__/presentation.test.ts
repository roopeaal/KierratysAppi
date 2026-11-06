import { describe, expect, it } from "vitest";
import { type LocalPhotoPhase, localPhotoPresentation } from "../presentation";

const denied = { granted: false, canAskAgain: false };
const input = {
  phase: "intro" as LocalPhotoPhase,
  available: true,
  permission: denied,
  error: "cameraDenied" as const,
};

describe("local photo recovery presentation", () => {
  it("has one permanent-denial message rather than a duplicate alert", () => {
    expect(localPhotoPresentation(input)).toMatchObject({
      permanentDenied: true,
      inlineError: undefined,
    });
  });
  it("does not hide an unrelated camera failure", () => {
    expect(localPhotoPresentation({ ...input, error: "localVisionError" }).inlineError).toBe(
      "localVisionError",
    );
  });
  it("keeps first-denial errors when another permission request is allowed", () => {
    expect(
      localPhotoPresentation({
        ...input,
        permission: { granted: false, canAskAgain: true },
      }),
    ).toMatchObject({ permanentDenied: false, inlineError: "cameraDenied" });
  });
  it("prioritizes native-unavailable recovery rather than settings on web/old clients", () => {
    expect(localPhotoPresentation({ ...input, available: false }).permanentDenied).toBe(false);
  });
  it("does not infer permanent denial from an unresolved permission", () => {
    expect(localPhotoPresentation({ ...input, permission: null }).permanentDenied).toBe(false);
  });
  it("does not offer settings for a granted permission", () => {
    expect(
      localPhotoPresentation({ ...input, permission: { granted: true, canAskAgain: false } })
        .permanentDenied,
    ).toBe(false);
  });
  for (const phase of ["intro", "camera", "preview", "processing", "result"] as const) {
    it(`keeps appropriate recovery and capture guidance in ${phase}`, () => {
      const view = localPhotoPresentation({ ...input, phase, error: undefined });
      expect(view.showCaptureGuidance).toBe(["intro", "camera", "preview"].includes(phase));
      expect(view.showBarcodeRecovery).toBe(phase === "intro" || phase === "result");
      expect(view.permanentDenied).toBe(phase === "intro");
    });
  }
});
