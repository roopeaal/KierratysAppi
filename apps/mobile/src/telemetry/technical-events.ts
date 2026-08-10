export type TechnicalEventMap = {
  scan_decoded: { readonly source: "camera" | "manual" | "history" };
  lookup_completed: {
    readonly status: "resolved" | "packaging_missing" | "not_found" | "provider_unavailable";
    readonly providerId: string;
    readonly cacheHit: boolean;
  };
  offline_queued: { readonly source: "camera" | "manual" | "history" };
};

export type TechnicalEventName = keyof TechnicalEventMap;

export interface TechnicalEventSink {
  record<TName extends TechnicalEventName>(
    event: TName,
    properties: TechnicalEventMap[TName],
  ): void;
}

const forbiddenProperty = /barcode|gtin|product.?name|photo|image|location|free.?text|message/iu;
let sink: TechnicalEventSink = { record: () => undefined };

export function configureTechnicalEventSink(next: TechnicalEventSink): void {
  sink = next;
}

export function trackTechnicalEvent<TName extends TechnicalEventName>(
  event: TName,
  properties: TechnicalEventMap[TName],
): void {
  assertSafeTechnicalProperties(properties);
  sink.record(event, properties);
}

export function assertSafeTechnicalProperties(properties: object): void {
  const forbiddenKey = Object.keys(properties).find((key) => forbiddenProperty.test(key));
  if (forbiddenKey) throw new Error(`Forbidden telemetry property: ${forbiddenKey}`);
}
