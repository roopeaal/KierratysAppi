export const GUIDE_SEARCH_MAX_LENGTH = 80;

export const guideMaterials = ["plastic", "carton", "glass", "metal"] as const;
export type GuideMaterial = (typeof guideMaterials)[number];

type GuideSearchParams = {
  readonly query?: unknown;
  readonly material?: unknown;
};

export type ParsedGuideSearch = {
  readonly query: string;
  readonly material: GuideMaterial | null;
  readonly invalid: boolean;
};

const aliases: Readonly<Record<GuideMaterial, readonly string[]>> = {
  plastic: [
    "muovi",
    "muovipakkaus",
    "muovipullo",
    "muovirasia",
    "plastic",
    "plastic packaging",
    "plastic bottle",
    "plastic container",
  ],
  carton: [
    "kartonki",
    "kartonkipakkaus",
    "kartonkitölkki",
    "pahvi",
    "pahvilaatikko",
    "carton",
    "paperboard",
    "cardboard",
    "cardboard box",
  ],
  glass: ["lasi", "lasipakkaus", "lasipullo", "lasipurkki", "glass", "glass bottle", "glass jar"],
  metal: [
    "metalli",
    "metallipakkaus",
    "säilyketölkki",
    "alumiinitölkki",
    "metal",
    "metal packaging",
    "tin can",
    "aluminium can",
    "aluminum can",
  ],
};

function singleParameter(value: unknown): string | null {
  if (value === undefined) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.length === 1 && typeof value[0] === "string") return value[0];
  return null;
}

function boundedQuery(value: string): string | null {
  if (
    value.length > GUIDE_SEARCH_MAX_LENGTH ||
    [...value].some((character) => {
      const code = character.charCodeAt(0);
      return (
        code < 32 ||
        (code >= 127 && code <= 159) ||
        (code >= 8234 && code <= 8238) ||
        (code >= 8294 && code <= 8297)
      );
    })
  )
    return null;
  const normalized = value.normalize("NFKC").trim().replace(/\s+/gu, " ");
  return normalized.length <= GUIDE_SEARCH_MAX_LENGTH ? normalized : null;
}

/** URL input selects existing editorial guidance; it never identifies a product or material. */
export function parseGuideSearchParams(params: GuideSearchParams): ParsedGuideSearch {
  const queryParameter = singleParameter(params.query);
  const materialParameter = singleParameter(params.material);
  const query = queryParameter === null ? null : boundedQuery(queryParameter);
  const material =
    materialParameter === "" ? null : guideMaterials.find((value) => value === materialParameter);
  return {
    query: query ?? "",
    material: material ?? null,
    invalid: query === null || materialParameter === null || material === undefined,
  };
}

function comparable(value: string): string {
  return value.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase("fi-FI");
}

/** Unknown input gives no fabricated match. Ambiguous words can retain several guide sections. */
export function filterGuideMaterials(
  query: string,
  material: GuideMaterial | null = null,
): readonly GuideMaterial[] {
  const bounded = boundedQuery(query);
  if (bounded === null) return [];
  const search = comparable(bounded);
  return guideMaterials.filter(
    (candidate) =>
      (material === null || candidate === material) &&
      (search.length === 0 ||
        aliases[candidate].some((alias) => comparable(alias).includes(search))),
  );
}
