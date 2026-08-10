import type {
  FieldProvenance,
  Language,
  ObservedField,
  RecognizedMaterialCode,
} from "@kierratysappi/domain";
import { sortPackagingComponent, type SortingResult } from "@kierratysappi/recycling-engine";

type SortRecognizedMaterialCodeInput = {
  readonly recognition: RecognizedMaterialCode;
  readonly language: Language;
  readonly observedAt: string;
  readonly componentId?: string;
};

export function sortRecognizedMaterialCode({
  recognition,
  language,
  observedAt,
  componentId = "local-material-code",
}: SortRecognizedMaterialCodeInput): SortingResult {
  const localProvenance: FieldProvenance = {
    sourceId: "local-user-observation",
    sourceName: "User-confirmed package marking",
    sourceRecordId: `${componentId}:${recognition.canonicalCode}`,
    sourceUrl: "https://kierratysappi.local/material-code-observation",
    retrievedAt: observedAt,
    lastConfirmedAt: observedAt,
    confidence: 0.9,
    verificationStatus: "user_confirmed",
    license: {
      id: "private-local-observation",
      name: "Private local observation",
      attributionText: "User-confirmed information on this device",
      shareAlike: false,
    },
  };
  const schemeProvenance: FieldProvenance = {
    sourceId: recognition.source.id,
    sourceName: recognition.source.sourceName,
    sourceRecordId: recognition.canonicalCode,
    sourceUrl: recognition.source.sourceUrl,
    retrievedAt: observedAt,
    lastConfirmedAt: `${recognition.source.checkedAt}T00:00:00.000Z`,
    confidence: recognition.precision === "exact" ? 0.82 : 0.65,
    verificationStatus: "inferred",
    license: {
      id: "source-reference-only",
      name: "Source reference only",
      url: recognition.source.sourceUrl,
      attributionText: `Source reference: ${recognition.source.sourceName}`,
      shareAlike: false,
    },
  };
  const observed = <T>(value: T, provenance: FieldProvenance): ObservedField<T> => ({
    value,
    provenance,
  });

  return sortPackagingComponent({
    component: {
      id: componentId,
      packagingStatus: observed("packaging", localProvenance),
      materialCode: observed(recognition.canonicalCode, localProvenance),
      materialFamily: observed(recognition.materialFamily, schemeProvenance),
      conditions: { hazardousResidue: "unknown", pressurized: "unknown", emptied: "unknown" },
    },
    context: { country: "FI", language, evaluatedAt: observedAt },
  });
}
