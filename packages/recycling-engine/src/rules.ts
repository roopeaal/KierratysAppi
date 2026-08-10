import type { LocalizedText, MaterialFamily } from "@kierratysappi/domain";
import type { DestinationId, SortingRuleReference } from "./types";

export type MaterialRule = {
  readonly id: string;
  readonly materials: readonly MaterialFamily[];
  readonly destination: DestinationId;
  readonly label: LocalizedText;
  readonly preparation: LocalizedText;
  readonly explanation: LocalizedText;
  readonly exceptions: readonly LocalizedText[];
  readonly reference: SortingRuleReference;
};

const RULE_VERSION = "fi-rinki-2026-08-10.1";

export const PALPA_RULE: SortingRuleReference = {
  id: "fi.deposit.palpa",
  version: "fi-palpa-2026-08-10.1",
  jurisdiction: "FI",
  sourceName: "Suomen Palautuspakkaus Oy (Palpa)",
  sourceUrl: "https://www.palpa.fi/for-consumers/faq/",
  checkedAt: "2026-08-10",
  verificationStatus: "verified",
};

const hazardousException: LocalizedText = {
  fi: "Jos pakkauksessa on vaarallisen aineen jäämiä tai painetta, vie se paikalliseen vaarallisen jätteen vastaanottoon.",
  en: "If the package contains hazardous residue or pressure, take it to the local hazardous-waste reception point.",
};

export const MATERIAL_RULES: readonly MaterialRule[] = [
  {
    id: "fi.packaging.plastic",
    materials: ["plastic"],
    destination: "plastic_packaging",
    label: { fi: "Muovipakkausten keräys", en: "Plastic packaging collection" },
    preparation: {
      fi: "Tyhjennä pakkaus. Irrota helposti käsin irtoavat korkit, kannet ja pumput erilleen.",
      en: "Empty the package. Separate caps, lids, and pumps that come off easily by hand.",
    },
    explanation: {
      fi: "Tämä on kotitalouden muovipakkaus, joten siihen sovelletaan valtakunnallista pakkauskeräyksen ohjetta.",
      en: "This is household plastic packaging, so the nationwide packaging-collection rule applies.",
    },
    exceptions: [hazardousException],
    reference: {
      id: "fi.packaging.plastic",
      version: RULE_VERSION,
      jurisdiction: "FI",
      sourceName: "Suomen Pakkauskierrätys RINKI Oy",
      sourceUrl:
        "https://rinkiin.fi/lajittelu-kotona/lajitteluohjeet/muovipakkausten-lajitteluohjeet/",
      checkedAt: "2026-08-10",
      verificationStatus: "verified",
    },
  },
  {
    id: "fi.packaging.carton",
    materials: ["carton", "paper"],
    destination: "carton_packaging",
    label: { fi: "Kartonkipakkausten keräys", en: "Carton packaging collection" },
    preparation: {
      fi: "Tyhjennä ja litistä pakkaus.",
      en: "Empty and flatten the package.",
    },
    explanation: {
      fi: "Tämä on kotitalouden kartonki- tai paperipakkaus, joten siihen sovelletaan valtakunnallista pakkauskeräyksen ohjetta.",
      en: "This is household carton or paper packaging, so the nationwide packaging-collection rule applies.",
    },
    exceptions: [],
    reference: {
      id: "fi.packaging.carton",
      version: RULE_VERSION,
      jurisdiction: "FI",
      sourceName: "Suomen Pakkauskierrätys RINKI Oy",
      sourceUrl:
        "https://rinkiin.fi/lajittelu-kotona/lajitteluohjeet/kartonkipakkausten-lajitteluohjeet/",
      checkedAt: "2026-08-10",
      verificationStatus: "verified",
    },
  },
  {
    id: "fi.packaging.glass",
    materials: ["glass"],
    destination: "glass_packaging",
    label: { fi: "Lasipakkausten keräys", en: "Glass packaging collection" },
    preparation: {
      fi: "Tyhjennä pakkaus ja poista korkki tai kansi. Etiketti saa jäädä.",
      en: "Empty the package and remove the cap or lid. The label may remain.",
    },
    explanation: {
      fi: "Tämä on lasipullo tai -purkki, joten siihen sovelletaan valtakunnallista lasipakkausten ohjetta.",
      en: "This is a glass bottle or jar, so the nationwide glass-packaging rule applies.",
    },
    exceptions: [
      hazardousException,
      {
        fi: "Juomalasi, posliini, keramiikka, kristalli, ikkuna- ja peililasi eivät kuulu lasipakkausten keräykseen.",
        en: "Drinking glass, porcelain, ceramics, crystal, window glass, and mirror glass do not belong in glass-packaging collection.",
      },
    ],
    reference: {
      id: "fi.packaging.glass",
      version: RULE_VERSION,
      jurisdiction: "FI",
      sourceName: "Suomen Pakkauskierrätys RINKI Oy",
      sourceUrl:
        "https://rinkiin.fi/lajittelu-kotona/lajitteluohjeet/lasipakkausten-lajitteluohjeet/",
      checkedAt: "2026-08-10",
      verificationStatus: "verified",
    },
  },
  {
    id: "fi.packaging.metal",
    materials: ["metal"],
    destination: "metal_collection",
    label: { fi: "Metallinkeräys", en: "Metal collection" },
    preparation: {
      fi: "Tyhjennä pakkaus. Vie keräysastian aukkoa suuremmat metalliesineet kunnan ohjeistamaan paikkaan.",
      en: "Empty the package. Take metal items larger than the collection opening to the place specified by your municipality.",
    },
    explanation: {
      fi: "Tämä on kotitalouden metallipakkaus tai pienmetalli, joten siihen sovelletaan valtakunnallista metallinkeräyksen ohjetta.",
      en: "This is household metal packaging or small metal, so the nationwide metal-collection rule applies.",
    },
    exceptions: [hazardousException],
    reference: {
      id: "fi.packaging.metal",
      version: RULE_VERSION,
      jurisdiction: "FI",
      sourceName: "Suomen Pakkauskierrätys RINKI Oy",
      sourceUrl: "https://rinkiin.fi/lajittelu-kotona/lajitteluohjeet/metallin-lajitteluohjeet/",
      checkedAt: "2026-08-10",
      verificationStatus: "verified",
    },
  },
];
