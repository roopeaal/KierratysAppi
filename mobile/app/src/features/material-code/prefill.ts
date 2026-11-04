import { parseLocalMaterialCodeCandidate } from "@kierratysappi/contracts/local-vision";

/** A route can only prefill the editable field; it never parses/confirms/sorts on entry. */
export function materialCodePrefill(value: unknown): string {
  if (typeof value !== "string") return "";
  return parseLocalMaterialCodeCandidate(value)?.status === "recognized" ? value : "";
}
