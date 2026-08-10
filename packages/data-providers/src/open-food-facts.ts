import {
  GtinSchema,
  ProductObservationSchema,
  type FieldProvenance,
  type Gtin,
  type MaterialFamily,
  type ObservedField,
  type PackagingComponentObservation,
  type PackagingShape,
  type ProviderProductResult,
  type SourceLicense,
} from "@kierratysappi/domain";
import { z } from "zod";
import type { ProductDataProvider, ProviderRequestContext } from "./contracts";

const API_ORIGIN = "https://world.openfoodfacts.org";
const MAX_RESPONSE_BYTES = 1_000_000;
const DEFAULT_TIMEOUT_MS = 4_500;

const DATABASE_LICENSE: SourceLicense = {
  id: "odbl-1.0",
  name: "Open Database License 1.0",
  url: "https://opendatacommons.org/licenses/odbl/1-0/",
  attributionText: "Open Food Facts contributors",
  shareAlike: true,
};

const IMAGE_LICENSE: SourceLicense = {
  id: "cc-by-sa-3.0",
  name: "Creative Commons Attribution-ShareAlike 3.0",
  url: "https://creativecommons.org/licenses/by-sa/3.0/",
  attributionText: "Open Food Facts contributors",
  shareAlike: true,
};

const ResponseSchema = z.object({
  product: z.record(z.string(), z.unknown()),
});

type FetchLike = typeof fetch;

export type OpenFoodFactsProviderOptions = {
  readonly fetch?: FetchLike;
  readonly timeoutMs?: number;
  readonly now?: () => Date;
  readonly userAgent?: string;
};

export class OpenFoodFactsProvider implements ProductDataProvider {
  readonly id = "open-food-facts";
  readonly displayName = "Open Food Facts";

  readonly #fetch: FetchLike;
  readonly #timeoutMs: number;
  readonly #now: () => Date;
  readonly #userAgent: string;

  constructor(options: OpenFoodFactsProviderOptions = {}) {
    this.#fetch = options.fetch ?? globalThis.fetch;
    this.#timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.#now = options.now ?? (() => new Date());
    this.#userAgent = options.userAgent ?? "KierratysAppi/0.1 (contact: app-owner@example.invalid)";
  }

  async findByGtin(gtin: Gtin, context: ProviderRequestContext): Promise<ProviderProductResult> {
    const canonicalGtin = GtinSchema.parse(gtin);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.#timeoutMs);
    const abortFromCaller = () => controller.abort();
    context.signal?.addEventListener("abort", abortFromCaller, { once: true });

    try {
      const url = new URL(`/api/v3/product/${canonicalGtin}`, API_ORIGIN);
      url.searchParams.set(
        "fields",
        [
          "code",
          "product_name",
          "product_name_fi",
          "product_name_en",
          "brands",
          "packagings",
          "image_front_url",
        ].join(","),
      );
      url.searchParams.set("lc", context.language);
      url.searchParams.set("cc", "fi");
      url.searchParams.set("product_type", "all");

      const response = await this.#fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": this.#userAgent,
        },
        redirect: "manual",
        signal: controller.signal,
      });

      if (response.status === 404) {
        return { status: "not_found" };
      }
      if (response.status === 429) {
        return { status: "error", code: "rate_limited", retryable: true };
      }
      if (response.status >= 500) {
        return { status: "error", code: "unavailable", retryable: true };
      }
      if (response.status >= 300 || !response.ok) {
        return { status: "error", code: "invalid_response", retryable: false };
      }

      const payload = await readLimitedJson(response);
      const parsed = ResponseSchema.safeParse(payload);
      if (!parsed.success) {
        return { status: "error", code: "invalid_response", retryable: false };
      }

      const product = normalizeProduct(canonicalGtin, parsed.data.product, this.#now());
      return { status: "found", product };
    } catch (error) {
      if (isAbortError(error)) {
        return { status: "error", code: "unavailable", retryable: true };
      }
      return { status: "error", code: "invalid_response", retryable: false };
    } finally {
      clearTimeout(timeout);
      context.signal?.removeEventListener("abort", abortFromCaller);
    }
  }
}

async function readLimitedJson(response: Response): Promise<unknown> {
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_RESPONSE_BYTES) {
    throw new Error("Provider response is too large");
  }

  if (!response.body) {
    throw new Error("Provider response has no body");
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    received += value.byteLength;
    if (received > MAX_RESPONSE_BYTES) {
      await reader.cancel("Provider response is too large");
      throw new Error("Provider response is too large");
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
}

function normalizeProduct(gtin: Gtin, input: Record<string, unknown>, retrievedAt: Date) {
  const sourceUrl = `${API_ORIGIN}/product/${gtin}`;
  const provenance = (confidence: number, license = DATABASE_LICENSE): FieldProvenance => ({
    sourceId: "open-food-facts",
    sourceName: "Open Food Facts",
    sourceRecordId: gtin,
    sourceUrl,
    retrievedAt: retrievedAt.toISOString(),
    confidence,
    verificationStatus: "community",
    license,
  });

  const productName = firstString(input.product_name_fi, input.product_name, input.product_name_en);
  const brands = stringList(input.brands);
  const imageUrl = safeHttpsUrl(input.image_front_url);
  const components = normalizePackaging(input.packagings, provenance);

  return ProductObservationSchema.parse({
    gtin,
    ...(productName ? { name: observed(productName, provenance(0.65)) } : {}),
    ...(brands.length > 0 ? { brands: observed(brands, provenance(0.6)) } : {}),
    ...(imageUrl ? { imageUrl: observed(imageUrl, provenance(0.55, IMAGE_LICENSE)) } : {}),
    packagingCompleteness: observed(components.length > 0 ? "partial" : "unknown", provenance(0.5)),
    packagingComponents: components,
  });
}

function normalizePackaging(
  input: unknown,
  provenance: (confidence: number) => FieldProvenance,
): PackagingComponentObservation[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.flatMap((candidate, index) => {
    if (!isRecord(candidate)) {
      return [];
    }

    const rawMaterial = taxonomyValue(candidate.material);
    const rawShape = taxonomyValue(candidate.shape);
    const material = mapMaterial(rawMaterial);
    const shape = mapShape(rawShape);
    const displayName = taxonomyText(candidate.shape) ?? taxonomyText(candidate.material);

    return [
      {
        id: `off-component-${index + 1}`,
        ...(displayName ? { displayName: observed(displayName, provenance(0.55)) } : {}),
        packagingStatus: observed("packaging", provenance(0.6)),
        ...(material ? { materialFamily: observed(material, provenance(0.55)) } : {}),
        ...(rawMaterial ? { materialCode: observed(rawMaterial, provenance(0.55)) } : {}),
        ...(shape ? { shape: observed(shape, provenance(0.55)) } : {}),
        ...(shape === "bottle" || shape === "can"
          ? { depositReturnStatus: observed("unknown", provenance(0.2)) }
          : {}),
        conditions: {
          hazardousResidue: "unknown",
          pressurized: "unknown",
          emptied: "unknown",
        },
      },
    ];
  });
}

function observed<T>(value: T, provenance: FieldProvenance): ObservedField<T> {
  return { value, provenance };
}

function taxonomyValue(input: unknown): string | undefined {
  if (typeof input === "string") {
    return cleanString(input);
  }
  if (isRecord(input)) {
    return firstString(input.id, input.text);
  }
  return undefined;
}

function taxonomyText(input: unknown): string | undefined {
  if (isRecord(input)) {
    return firstString(input.text);
  }
  return undefined;
}

function mapMaterial(value: string | undefined): MaterialFamily | undefined {
  const normalized = value?.toLowerCase();
  if (!normalized) return undefined;
  if (normalized.includes("plastic")) return "plastic";
  if (
    normalized.includes("paperboard") ||
    normalized.includes("cardboard") ||
    normalized.includes("carton")
  )
    return "carton";
  if (normalized.includes("paper")) return "paper";
  if (normalized.includes("glass")) return "glass";
  if (
    normalized.includes("metal") ||
    normalized.includes("steel") ||
    normalized.includes("aluminium")
  )
    return "metal";
  if (normalized.includes("wood") || normalized.includes("cork")) return "wood";
  if (normalized.includes("composite")) return "composite";
  return undefined;
}

function mapShape(value: string | undefined): PackagingShape | undefined {
  const normalized = value?.toLowerCase();
  if (!normalized) return undefined;
  const mappings: ReadonlyArray<readonly [string, PackagingShape]> = [
    ["bottle", "bottle"],
    ["can", "can"],
    ["jar", "jar"],
    ["box", "box"],
    ["carton", "carton"],
    ["bag", "bag"],
    ["wrapper", "wrap"],
    ["wrap", "wrap"],
    ["tray", "tray"],
    ["cup", "cup"],
    ["cap", "cap"],
    ["lid", "lid"],
    ["pump", "pump"],
    ["tube", "tube"],
  ];
  return mappings.find(([needle]) => normalized.includes(needle))?.[1];
}

function stringList(input: unknown): string[] {
  if (typeof input !== "string") return [];
  return [
    ...new Set(
      input
        .split(",")
        .map(cleanString)
        .filter((value): value is string => Boolean(value)),
    ),
  ];
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string") {
      const cleaned = cleanString(value);
      if (cleaned) return cleaned;
    }
  }
  return undefined;
}

function cleanString(value: string): string | undefined {
  const cleaned = value.trim().replace(/\s+/g, " ");
  return cleaned.length > 0 && cleaned.length <= 500 ? cleaned : undefined;
}

function safeHttpsUrl(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined;
  try {
    const parsed = new URL(input);
    return parsed.protocol === "https:" ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
