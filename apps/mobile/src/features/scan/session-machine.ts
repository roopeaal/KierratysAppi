import type { ProductLookupResult } from "@kierratysappi/application/lookup-schema";
import type { Gtin } from "@kierratysappi/domain";

export type ScanSource = "camera" | "manual" | "history";

export type SessionState =
  | { readonly status: "idle" }
  | { readonly status: "loading"; readonly gtin: Gtin; readonly source: ScanSource }
  | { readonly status: "complete"; readonly gtin: Gtin; readonly result: ProductLookupResult }
  | { readonly status: "invalid"; readonly input: string }
  | { readonly status: "offline"; readonly gtin: Gtin };

export type SessionAction =
  | { readonly type: "reset" }
  | { readonly type: "invalid"; readonly input: string }
  | { readonly type: "started"; readonly gtin: Gtin; readonly source: ScanSource }
  | { readonly type: "completed"; readonly gtin: Gtin; readonly result: ProductLookupResult }
  | { readonly type: "offline"; readonly gtin: Gtin };

export function sessionReducer(_state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "reset":
      return { status: "idle" };
    case "invalid":
      return { status: "invalid", input: action.input };
    case "started":
      return { status: "loading", gtin: action.gtin, source: action.source };
    case "completed":
      return { status: "complete", gtin: action.gtin, result: action.result };
    case "offline":
      return { status: "offline", gtin: action.gtin };
  }
}

export function isDuplicateScan(
  previous: { readonly gtin: Gtin; readonly at: number } | undefined,
  nextGtin: Gtin,
  now: number,
  windowMs = 2_500,
): boolean {
  return previous !== undefined && previous.gtin === nextGtin && now - previous.at < windowMs;
}
