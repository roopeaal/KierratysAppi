import type { MessageKey } from "@kierratysappi/localization";

export type LocalPhotoPhase = "intro" | "camera" | "preview" | "processing" | "result";
type CameraPermission = { granted: boolean; canAskAgain: boolean };

/** Keep one permission-recovery message, without hiding unrelated failures. */
export function localPhotoPresentation(input: {
  phase: LocalPhotoPhase;
  available: boolean;
  permission: CameraPermission | null;
  error: MessageKey | undefined;
}) {
  const permanentDenied =
    input.phase === "intro" &&
    input.available &&
    input.permission?.granted === false &&
    input.permission.canAskAgain === false;
  return {
    permanentDenied,
    inlineError: permanentDenied && input.error === "cameraDenied" ? undefined : input.error,
    showCaptureGuidance: ["intro", "camera", "preview"].includes(input.phase),
    showBarcodeRecovery: input.phase === "intro" || input.phase === "result",
  };
}
