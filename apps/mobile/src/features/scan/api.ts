import {
  ProductLookupResultSchema,
  type ProductLookupResult,
} from "@kierratysappi/application/lookup-schema";
import type { Gtin, Language } from "@kierratysappi/domain";
import { Platform } from "react-native";

const DEFAULT_API_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://127.0.0.1:3000";
const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_URL;
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
    const response = await fetch(`${API_URL}/v1/recycling/lookup`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ gtin, language }),
      signal: controller.signal,
    });
    const payload: unknown = await response.json();
    return ProductLookupResultSchema.parse(payload);
  } catch (error) {
    if (error instanceof LookupNetworkError) throw error;
    throw new LookupNetworkError();
  } finally {
    clearTimeout(timeout);
  }
}
