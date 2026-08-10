import {
  ProductLookupResultSchema,
  type ProductLookupResult,
} from "@kierratysappi/application/lookup-schema";
import type { Gtin } from "@kierratysappi/domain";

export function parseLookupHttpResponse(
  statusCode: number,
  payload: unknown,
  requestedGtin: Gtin,
): ProductLookupResult {
  const parsed = ProductLookupResultSchema.safeParse(payload);
  if (!parsed.success || parsed.data.gtin !== requestedGtin) return unavailable(requestedGtin);

  const expectedStatus =
    parsed.data.status === "not_found"
      ? 404
      : parsed.data.status === "provider_unavailable"
        ? 503
        : 200;
  return statusCode === expectedStatus ? parsed.data : unavailable(requestedGtin);
}

function unavailable(gtin: Gtin): ProductLookupResult {
  return { status: "provider_unavailable", gtin, retryable: true };
}
