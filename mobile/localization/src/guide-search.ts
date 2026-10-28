export const guideSearchFi = {
  guideSearchLabel: "Hae materiaalin ohjetta",
  guideSearchPlaceholder: "Esim. muovipullo tai pahvi",
  guideSearchHint: "Haku rajaa tämän oppaan neljää pakkausmateriaalia. Se ei tunnista tuotetta.",
  guideSearchAll: "Kaikki materiaalit",
  guideSearchFilters: "Oppaan materiaalit",
  guideSearchReset: "Näytä kaikki ohjeet",
  guideSearchEmpty: "Tälle haulle ei löytynyt ohjetta.",
  guideSearchEmptyBody: "Kokeile materiaalin nimeä tai avaa kaikki ohjeet.",
  guideSearchInvalid: "Hakua ei voitu avata. Kirjoita enintään 80 merkkiä tai näytä kaikki ohjeet.",
  guideSearchResultCount: "Materiaaliohjeita: {count}",
};

export const guideSearchEn: { readonly [Key in keyof typeof guideSearchFi]: string } = {
  guideSearchLabel: "Search material guidance",
  guideSearchPlaceholder: "E.g. plastic bottle or cardboard",
  guideSearchHint:
    "Search filters the four packaging materials in this guide. It does not identify a product.",
  guideSearchAll: "All materials",
  guideSearchFilters: "Guide materials",
  guideSearchReset: "Show all guidance",
  guideSearchEmpty: "No guidance matched this search.",
  guideSearchEmptyBody: "Try a material name or open all guidance.",
  guideSearchInvalid:
    "This search could not be opened. Enter up to 80 characters or show all guidance.",
  guideSearchResultCount: "Material guides: {count}",
};
