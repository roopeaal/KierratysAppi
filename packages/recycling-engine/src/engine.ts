import {
  assessObservedFields,
  type ObservedField,
  type PackagingComponentObservation,
} from "@kierratysappi/domain";
import { MATERIAL_RULES, PALPA_RULE } from "./rules";
import {
  SortingRequestSchema,
  SortingResultSchema,
  type SortingRequest,
  type SortingResult,
} from "./types";

const depositCandidateShapes = new Set(["bottle", "can"]);

function unknownConfidence(reason: string) {
  return assessObservedFields([], [reason]);
}

function safeUnknown(
  component: PackagingComponentObservation,
  reason: Extract<SortingResult, { status: "unknown" }>["reason"],
  nextAction: { fi: string; en: string },
  decisiveFields: string[],
): SortingResult {
  return SortingResultSchema.parse({
    status: "unknown",
    componentId: component.id,
    reason,
    nextAction,
    sources: [],
    confidence: unknownConfidence(nextAction.en),
    trace: {
      evaluatedBranches: ["packaging", "hazard", "deposit", "material"],
      decisiveFields,
    },
  });
}

export function sortPackagingComponent(input: SortingRequest): SortingResult {
  const { component } = SortingRequestSchema.parse(input);
  const packaging = component.packagingStatus;

  if (packaging.value === "non_packaging") {
    return safeUnknown(
      component,
      "not_packaging",
      {
        fi: "Tämä sääntökokoelma koskee pakkauksia. Hae esine materiaalin tai paikallisen jäteoppaan avulla.",
        en: "This rule set covers packaging. Search for the item by material or use your local waste guide.",
      },
      ["packagingStatus"],
    );
  }

  if (packaging.value === "unknown") {
    return safeUnknown(
      component,
      "packaging_status_unknown",
      {
        fi: "Tarkista ensin, onko osa tuotteen pakkaus vai itse tuote.",
        en: "First check whether this part is product packaging or the product itself.",
      },
      ["packagingStatus"],
    );
  }

  if (
    component.conditions.hazardousResidue === "yes" ||
    component.conditions.pressurized === "yes"
  ) {
    return safeUnknown(
      component,
      "hazardous_or_pressurized",
      {
        fi: "Vie pakkaus paikalliseen vaarallisen jätteen vastaanottoon. Älä laita sitä tavalliseen pakkauskeräykseen.",
        en: "Take the package to the local hazardous-waste reception point. Do not put it in ordinary packaging collection.",
      },
      ["conditions.hazardousResidue", "conditions.pressurized"],
    );
  }

  const shape = component.shape;
  const depositStatus = component.depositReturnStatus;
  const couldHaveDeposit = shape !== undefined && depositCandidateShapes.has(shape.value);

  if (depositStatus?.value === "yes") {
    const confidence = assessObservedFields(
      [packaging, depositStatus],
      ["Destination depends on verified packaging and deposit observations."],
    );

    return SortingResultSchema.parse({
      status: "resolved",
      componentId: component.id,
      destination: {
        id: "deposit_return",
        label: { fi: "Kaupan palautusautomaatti", en: "Retail return point" },
      },
      preparation: {
        fi: "Palauta pakkaus tyhjänä ja ehjänä, alkuperäisessä muodossa ja etiketti paikallaan.",
        en: "Return the container empty and intact, in its original shape, with the label in place.",
      },
      explanation: {
        fi: "Pakkaus on tunnistettu Suomen palautusjärjestelmään kuuluvaksi pantilliseksi juomapakkaukseksi.",
        en: "The container is identified as a deposit beverage container in a Finnish return system.",
      },
      exceptions: [],
      rule: PALPA_RULE,
      confidence,
      trace: {
        evaluatedBranches: ["packaging", "hazard", "deposit"],
        matchedBranch: "deposit=yes",
        decisiveFields: ["packagingStatus", "depositReturnStatus"],
      },
    });
  }

  if (couldHaveDeposit && (depositStatus === undefined || depositStatus.value === "unknown")) {
    const fields: ObservedField<unknown>[] = [packaging, shape];
    const alternativeMaterialDestination = materialDestination(component.materialFamily?.value);
    if (depositStatus) {
      fields.push(depositStatus);
    }

    return SortingResultSchema.parse({
      status: "ambiguous",
      componentId: component.id,
      reason: "deposit_status_unknown",
      question: {
        fi: "Näkyykö pakkauksessa suomalainen panttimerkki? Tarkista myös kuitti tai Palpan panttihaku.",
        en: "Does the container show a Finnish deposit mark? You can also check the receipt or Palpa's deposit lookup.",
      },
      candidateDestinations: [
        "deposit_return",
        ...(alternativeMaterialDestination ? [alternativeMaterialDestination] : []),
      ],
      sources: [PALPA_RULE],
      confidence: assessObservedFields(fields, [
        "Deposit status is not known for this bottle or can.",
      ]),
      trace: {
        evaluatedBranches: ["packaging", "hazard", "deposit"],
        matchedBranch: "deposit=unknown",
        decisiveFields: ["packagingStatus", "shape", "depositReturnStatus"],
      },
    });
  }

  const material = component.materialFamily;
  if (!material) {
    return safeUnknown(
      component,
      "material_missing",
      {
        fi: "Etsi pakkauksesta materiaalimerkintä tai valitse materiaali käsin.",
        en: "Look for a material marking on the package or choose the material manually.",
      },
      ["materialFamily"],
    );
  }

  if (material.value === "glass" && (!shape || !new Set(["bottle", "jar"]).has(shape.value))) {
    return SortingResultSchema.parse({
      status: "ambiguous",
      componentId: component.id,
      reason: "glass_shape_unknown",
      question: {
        fi: "Onko osa lasipullo tai -purkki? Muu lasi ei kuulu lasipakkausten keräykseen.",
        en: "Is the part a glass bottle or jar? Other glass does not belong in glass-packaging collection.",
      },
      candidateDestinations: ["glass_packaging"],
      sources: [MATERIAL_RULES.find((rule) => rule.id === "fi.packaging.glass")?.reference].filter(
        (reference): reference is NonNullable<typeof reference> => reference !== undefined,
      ),
      confidence: assessObservedFields(
        shape ? [packaging, material, shape] : [packaging, material],
        ["Glass-packaging collection accepts bottles and jars; the shape is not confirmed."],
      ),
      trace: {
        evaluatedBranches: ["packaging", "hazard", "deposit", "material", "glass-shape"],
        matchedBranch: "glass-shape=unknown",
        decisiveFields: ["packagingStatus", "materialFamily", "shape"],
      },
    });
  }

  const rule = MATERIAL_RULES.find((candidate) => candidate.materials.includes(material.value));
  if (!rule) {
    return safeUnknown(
      component,
      "unsupported_material",
      {
        fi: "Tälle materiaalille ei ole vielä tarkistettua sääntöä. Käytä paikallista jäteopasta.",
        en: "There is no reviewed rule for this material yet. Use your local waste guide.",
      },
      ["materialFamily"],
    );
  }

  const decisiveFields: ObservedField<unknown>[] = [packaging, material];
  if (shape) {
    decisiveFields.push(shape);
  }

  return SortingResultSchema.parse({
    status: "resolved",
    componentId: component.id,
    destination: { id: rule.destination, label: rule.label },
    preparation: rule.preparation,
    explanation: rule.explanation,
    exceptions: rule.exceptions,
    rule: rule.reference,
    confidence: assessObservedFields(decisiveFields, [
      "Confidence is capped by the least certain product observation used by the verified rule.",
    ]),
    trace: {
      evaluatedBranches: ["packaging", "hazard", "deposit", "material"],
      matchedBranch: rule.id,
      decisiveFields: ["packagingStatus", "materialFamily", ...(shape ? ["shape"] : [])],
    },
  });
}

function materialDestination(material: string | undefined) {
  return MATERIAL_RULES.find((rule) => rule.materials.some((candidate) => candidate === material))
    ?.destination;
}
