import { type NativeModule, requireOptionalNativeModule } from "expo";
import { Platform } from "react-native";
import { createLocalRecognizer, type LocalVisionNativeReader } from "./recognizer";
import { createLocalReadinessInspector } from "./readiness";

function reader(): LocalVisionNativeReader | undefined {
  if (Platform.OS !== "ios") return undefined;
  try {
    const module = requireOptionalNativeModule<NativeModule & LocalVisionNativeReader>(
      "KierratysLocalVision",
    );
    return module && typeof module.recognize === "function" ? module : undefined;
  } catch {
    return undefined;
  }
}

export const isLocalVisionAvailable = () => reader() !== undefined;
export const recognizeLocalPhoto = createLocalRecognizer(reader);
export const inspectLocalVisionReadiness = createLocalReadinessInspector(reader);
