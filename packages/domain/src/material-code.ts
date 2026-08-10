import type { LocalizedText, MaterialFamily } from "./models";

export const MATERIAL_CODE_INPUT_MAX_LENGTH = 64;

export const MATERIAL_IDENTIFICATION_SCHEME = {
  id: "eu-packaging-material-97-129-ec",
  version: "97/129/EC",
  jurisdiction: "EU/EEA",
  sourceName: "European Commission — Decision 97/129/EC",
  sourceUrl: "https://eur-lex.europa.eu/eli/dec/1997/129/oj/eng",
  checkedAt: "2026-08-10",
} as const;

type MaterialCodeDefinition = {
  readonly number: number;
  readonly abbreviation: string;
  readonly materialFamily: MaterialFamily;
  readonly materialName: LocalizedText;
};

const definitions: readonly MaterialCodeDefinition[] = [
  {
    number: 1,
    abbreviation: "PET",
    materialFamily: "plastic",
    materialName: { fi: "PET-muovi", en: "PET plastic" },
  },
  {
    number: 2,
    abbreviation: "HDPE",
    materialFamily: "plastic",
    materialName: { fi: "HDPE-muovi", en: "HDPE plastic" },
  },
  {
    number: 3,
    abbreviation: "PVC",
    materialFamily: "plastic",
    materialName: { fi: "PVC-muovi", en: "PVC plastic" },
  },
  {
    number: 4,
    abbreviation: "LDPE",
    materialFamily: "plastic",
    materialName: { fi: "LDPE-muovi", en: "LDPE plastic" },
  },
  {
    number: 5,
    abbreviation: "PP",
    materialFamily: "plastic",
    materialName: { fi: "PP-muovi", en: "PP plastic" },
  },
  {
    number: 6,
    abbreviation: "PS",
    materialFamily: "plastic",
    materialName: { fi: "PS-muovi", en: "PS plastic" },
  },
  {
    number: 20,
    abbreviation: "PAP",
    materialFamily: "carton",
    materialName: { fi: "aaltopahvi", en: "corrugated fibreboard" },
  },
  {
    number: 21,
    abbreviation: "PAP",
    materialFamily: "carton",
    materialName: { fi: "muu kartonki", en: "non-corrugated fibreboard" },
  },
  {
    number: 22,
    abbreviation: "PAP",
    materialFamily: "paper",
    materialName: { fi: "paperi", en: "paper" },
  },
  {
    number: 40,
    abbreviation: "FE",
    materialFamily: "metal",
    materialName: { fi: "teräs", en: "steel" },
  },
  {
    number: 41,
    abbreviation: "ALU",
    materialFamily: "metal",
    materialName: { fi: "alumiini", en: "aluminium" },
  },
  {
    number: 50,
    abbreviation: "FOR",
    materialFamily: "wood",
    materialName: { fi: "puu", en: "wood" },
  },
  {
    number: 51,
    abbreviation: "FOR",
    materialFamily: "wood",
    materialName: { fi: "korkki", en: "cork" },
  },
  {
    number: 60,
    abbreviation: "COT",
    materialFamily: "other",
    materialName: { fi: "puuvilla", en: "cotton" },
  },
  {
    number: 61,
    abbreviation: "TEX",
    materialFamily: "other",
    materialName: { fi: "juutti", en: "jute" },
  },
  {
    number: 70,
    abbreviation: "GL",
    materialFamily: "glass",
    materialName: { fi: "väritön lasi", en: "colourless glass" },
  },
  {
    number: 71,
    abbreviation: "GL",
    materialFamily: "glass",
    materialName: { fi: "vihreä lasi", en: "green glass" },
  },
  {
    number: 72,
    abbreviation: "GL",
    materialFamily: "glass",
    materialName: { fi: "ruskea lasi", en: "brown glass" },
  },
] as const;

const definitionByNumber = new Map(
  definitions.map((definition) => [definition.number, definition]),
);
const knownAbbreviations = new Set(definitions.map((definition) => definition.abbreviation));
const abbreviationPattern = new RegExp(
  `\\b(${[...knownAbbreviations].sort((left, right) => right.length - left.length).join("|")})\\b`,
  "gu",
);

export type RecognizedMaterialCode = {
  readonly status: "recognized";
  readonly normalizedInput: string;
  readonly canonicalCode: string;
  readonly number?: number;
  readonly abbreviation: string;
  readonly materialFamily: MaterialFamily;
  readonly materialName: LocalizedText;
  readonly precision: "exact" | "group";
  readonly source: typeof MATERIAL_IDENTIFICATION_SCHEME;
};

export type MaterialCodeParseResult =
  | RecognizedMaterialCode
  | {
      readonly status: "ambiguous";
      readonly normalizedInput: string;
      readonly reason: "conflicting_markers" | "multiple_codes" | "number_missing";
      readonly candidateCodes: readonly string[];
    }
  | {
      readonly status: "unrecognized";
      readonly normalizedInput: string;
      readonly reason: "empty" | "too_long" | "unknown_code";
    };

export function parseMaterialIdentificationCode(input: string): MaterialCodeParseResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { status: "unrecognized", normalizedInput: "", reason: "empty" };
  }
  if (trimmed.length > MATERIAL_CODE_INPUT_MAX_LENGTH) {
    return {
      status: "unrecognized",
      normalizedInput: normalizeInput(trimmed.slice(0, MATERIAL_CODE_INPUT_MAX_LENGTH)),
      reason: "too_long",
    };
  }

  const normalizedInput = normalizeInput(trimmed);
  const allNumbers = [...normalizedInput.matchAll(/\d{1,2}/gu)].map((match) => Number(match[0]));
  const abbreviations = unique(
    [...normalizedInput.matchAll(abbreviationPattern)].map((match) => match[1]),
  );
  const letterTokens = [...normalizedInput.matchAll(/[A-Z]+/gu)].map((match) => match[0]);
  const composite = parseCompositeMarker(normalizedInput, allNumbers);
  if (composite) {
    if (letterTokens.some((token) => token !== "C" && !knownAbbreviations.has(token))) {
      return { status: "unrecognized", normalizedInput, reason: "unknown_code" };
    }
    return composite;
  }
  const containsUnknownToken = letterTokens.some((token) => !knownAbbreviations.has(token));
  if (containsUnknownToken) {
    return { status: "unrecognized", normalizedInput, reason: "unknown_code" };
  }

  const recognizedDefinitions = uniqueByNumber(
    allNumbers
      .map((number) => definitionByNumber.get(number))
      .filter((definition): definition is MaterialCodeDefinition => definition !== undefined),
  );

  if (recognizedDefinitions.length > 1) {
    return {
      status: "ambiguous",
      normalizedInput,
      reason: "multiple_codes",
      candidateCodes: recognizedDefinitions.map(canonicalCode),
    };
  }

  const definition = recognizedDefinitions[0];
  if (definition) {
    if (
      abbreviations.length > 0 &&
      (abbreviations.length > 1 || abbreviations[0] !== definition.abbreviation)
    ) {
      return {
        status: "ambiguous",
        normalizedInput,
        reason: "conflicting_markers",
        candidateCodes: unique([
          canonicalCode(definition),
          ...definitions
            .filter((candidate) => abbreviations.includes(candidate.abbreviation))
            .map(canonicalCode),
        ]),
      };
    }
    return recognized(definition, normalizedInput);
  }

  if (abbreviations.length > 0) {
    return {
      status: "ambiguous",
      normalizedInput,
      reason: "number_missing",
      candidateCodes: definitions
        .filter((candidate) => abbreviations.includes(candidate.abbreviation))
        .map(canonicalCode),
    };
  }

  return { status: "unrecognized", normalizedInput, reason: "unknown_code" };
}

function parseCompositeMarker(
  normalizedInput: string,
  allNumbers: readonly number[],
): RecognizedMaterialCode | Extract<MaterialCodeParseResult, { status: "ambiguous" }> | undefined {
  const match = normalizedInput.match(
    /(?:^|[^A-Z0-9])C\s*\/\s*([A-Z]{2,5}(?:\s*\/\s*[A-Z]{2,5})*)/u,
  );
  if (!match) return undefined;
  const compositeBody = match[1];
  if (!compositeBody) return undefined;

  const constituents = compositeBody.split(/\s*\/\s*/u);
  if (constituents.some((constituent) => !knownAbbreviations.has(constituent))) {
    return undefined;
  }

  const invalidNumbers = unique(allNumbers.filter((number) => number < 80 || number > 99));
  if (invalidNumbers.length > 0) {
    return {
      status: "ambiguous",
      normalizedInput,
      reason: "conflicting_markers",
      candidateCodes: invalidNumbers
        .map((number) => definitionByNumber.get(number))
        .filter((definition): definition is MaterialCodeDefinition => definition !== undefined)
        .map(canonicalCode),
    };
  }

  const number = unique(allNumbers.filter((candidate) => candidate >= 80 && candidate <= 99))[0];
  const abbreviation = `C/${constituents.join("/")}`;
  return {
    status: "recognized",
    normalizedInput,
    canonicalCode: `${abbreviation}${number === undefined ? "" : ` ${number}`}`,
    ...(number === undefined ? {} : { number }),
    abbreviation,
    materialFamily: "composite",
    materialName: { fi: "yhdistelmämateriaali", en: "composite material" },
    precision: "group",
    source: MATERIAL_IDENTIFICATION_SCHEME,
  };
}

function recognized(
  definition: MaterialCodeDefinition,
  normalizedInput: string,
): RecognizedMaterialCode {
  return {
    status: "recognized",
    normalizedInput,
    canonicalCode: canonicalCode(definition),
    number: definition.number,
    abbreviation: definition.abbreviation,
    materialFamily: definition.materialFamily,
    materialName: definition.materialName,
    precision: "exact",
    source: MATERIAL_IDENTIFICATION_SCHEME,
  };
}

function canonicalCode(definition: MaterialCodeDefinition) {
  return `${definition.abbreviation} ${definition.number}`;
}

function normalizeInput(input: string) {
  return input
    .normalize("NFKC")
    .toUpperCase()
    .replace(/[‐‑‒–—]/gu, "-")
    .replace(/\s+/gu, " ")
    .trim();
}

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

function uniqueByNumber(values: readonly MaterialCodeDefinition[]) {
  return [...new Map(values.map((value) => [value.number, value])).values()];
}
