import {
  PhotoCapabilitiesSchema,
  type PhotoResult,
  PhotoResultSchema,
  photoCapabilitiesPath,
  photoConsentVersion,
  photoRecognitionPath,
} from "@kierratysappi/contracts/photo-recognition";
import type { Language } from "@kierratysappi/domain";
import { Platform } from "react-native";
import { resolveApiBaseUrl } from "../scan/api-config";

const origin = resolveApiBaseUrl({
  platform: Platform.OS,
  appEnvironment: process.env.EXPO_PUBLIC_APP_ENV,
  configuredUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
});

export async function photoAvailable(signal: AbortSignal): Promise<boolean> {
  const response = await fetch(`${origin}${photoCapabilitiesPath}`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return false;
  return PhotoCapabilitiesSchema.parse(await response.json()).enabled;
}

export async function requestPhoto(
  jpegBase64: string,
  language: Language,
  signal: AbortSignal,
): Promise<PhotoResult> {
  const response = await fetch(`${origin}${photoRecognitionPath}`, {
    method: "POST",
    signal,
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ jpegBase64, language, consentVersion: photoConsentVersion }),
  });
  if (response.status === 429) return { status: "unavailable", reason: "rate_limited" };
  const result = PhotoResultSchema.safeParse(await response.json());
  if (!result.success || (result.data.status === "estimated" && response.status !== 200))
    return { status: "unavailable", reason: "invalid_response" };
  return result.data;
}
