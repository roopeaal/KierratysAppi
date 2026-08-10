import type { ProductLookupResult } from "@kierratysappi/application/lookup-schema";
import type { Gtin, Language } from "@kierratysappi/domain";
import { Platform } from "react-native";
import { resolveApiBaseUrl } from "./api-config";
import { parseLookupHttpResponse } from "./lookup-response";

const API_URL = resolveApiBaseUrl({
  platform: Platform.OS,
  appEnvironment: process.env.EXPO_PUBLIC_APP_ENV,
  configuredUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
});
const LOOKUP_TIMEOUT_MS = 8_000;

export class LookupNetworkError extends Error {
  constructor() {
    super("lookup_network_error");
    this.name = "LookupNetworkError";
  }
}

export async function requestProductLookup(
  gtin: Gtin,
  language: Language,
): Promise<ProductLookupResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
  try {
    let response: Response;
    try {
      response = await fetch(`${API_URL}/v1/recycling/lookup`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ gtin, language }),
        signal: controller.signal,
      });
    } catch {
      throw new LookupNetworkError();
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      return { status: "provider_unavailable", gtin, retryable: true };
    }
    return parseLookupHttpResponse(response.status, payload, gtin);
  } catch (error) {
    if (error instanceof LookupNetworkError) throw error;
    throw new LookupNetworkError();
  } finally {
    clearTimeout(timeout);
  }
}
