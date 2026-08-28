import type { MessageKey } from "@kierratysappi/localization";
import type { DestinationId, SortingResult } from "@kierratysappi/recycling-engine";

type UnknownReason = Extract<SortingResult, { status: "unknown" }>["reason"];

const destinationKeys = {
  deposit_return: "destinationDepositReturn",
  plastic_packaging: "destinationPlasticPackaging",
  carton_packaging: "destinationCartonPackaging",
  glass_packaging: "destinationGlassPackaging",
  metal_collection: "destinationMetalCollection",
} as const satisfies Record<DestinationId, MessageKey>;

const unknownReasonKeys = {
  not_packaging: "unknownReasonNotPackaging",
  packaging_status_unknown: "unknownReasonPackagingStatusUnknown",
  material_missing: "unknownReasonMaterialMissing",
  unsupported_material: "unknownReasonUnsupportedMaterial",
  hazardous_or_pressurized: "unknownReasonHazardousOrPressurized",
  no_effective_rule: "unknownReasonNoEffectiveRule",
} as const satisfies Record<UnknownReason, MessageKey>;

export function destinationMessageKey(destination: DestinationId): MessageKey {
  return destinationKeys[destination];
}

export function unknownReasonMessageKey(reason: UnknownReason): MessageKey {
  return unknownReasonKeys[reason];
}
