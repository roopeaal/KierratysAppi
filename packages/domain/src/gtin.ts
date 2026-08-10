import { z } from "zod";

const GTIN_LENGTHS = new Set([8, 12, 13, 14]);
const MANUAL_SEPARATORS = /[\s-]/gu;
const ASCII_DIGITS = /^\d+$/u;

export type Gtin = string & { readonly __brand: "Gtin" };

export type ParseGtinResult =
  | { readonly ok: true; readonly value: Gtin }
  | {
      readonly ok: false;
      readonly reason: "empty" | "characters" | "length" | "checksum";
      readonly normalized: string;
    };

export function normalizeGtinInput(input: string): string {
  return input.trim().replace(MANUAL_SEPARATORS, "");
}

export function hasValidGtinChecksum(value: string): boolean {
  if (!GTIN_LENGTHS.has(value.length) || !ASCII_DIGITS.test(value)) {
    return false;
  }

  const digits = [...value].map(Number);
  const suppliedCheckDigit = digits.pop();

  if (suppliedCheckDigit === undefined) {
    return false;
  }

  const sum = digits
    .reverse()
    .reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0);
  const expectedCheckDigit = (10 - (sum % 10)) % 10;

  return suppliedCheckDigit === expectedCheckDigit;
}

export function parseGtin(input: string): ParseGtinResult {
  const normalized = normalizeGtinInput(input);

  if (normalized.length === 0) {
    return { ok: false, reason: "empty", normalized };
  }

  if (!ASCII_DIGITS.test(normalized)) {
    return { ok: false, reason: "characters", normalized };
  }

  if (!GTIN_LENGTHS.has(normalized.length)) {
    return { ok: false, reason: "length", normalized };
  }

  if (!hasValidGtinChecksum(normalized)) {
    return { ok: false, reason: "checksum", normalized };
  }

  return { ok: true, value: normalized as Gtin };
}

export const GtinSchema = z
  .string()
  .superRefine((value, context) => {
    const parsed = parseGtin(value);
    if (!parsed.ok) {
      context.addIssue({
        code: "custom",
        message: `Invalid GTIN: ${parsed.reason}`,
      });
      return;
    }

    if (parsed.value !== value) {
      context.addIssue({ code: "custom", message: "GTIN must be canonical" });
    }
  })
  .transform((value) => value as Gtin);
