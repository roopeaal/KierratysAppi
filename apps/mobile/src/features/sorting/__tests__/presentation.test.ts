import { describe, expect, it } from "vitest";
import { destinationMessageKey, unknownReasonMessageKey } from "../presentation";

describe("sorting-result presentation", () => {
  it.each([
    ["deposit_return", "destinationDepositReturn"],
    ["plastic_packaging", "destinationPlasticPackaging"],
    ["carton_packaging", "destinationCartonPackaging"],
    ["glass_packaging", "destinationGlassPackaging"],
    ["metal_collection", "destinationMetalCollection"],
  ] as const)("localizes destination %s", (destination, key) => {
    expect(destinationMessageKey(destination)).toBe(key);
  });

  it.each([
    ["not_packaging", "unknownReasonNotPackaging"],
    ["packaging_status_unknown", "unknownReasonPackagingStatusUnknown"],
    ["material_missing", "unknownReasonMaterialMissing"],
    ["unsupported_material", "unknownReasonUnsupportedMaterial"],
    ["hazardous_or_pressurized", "unknownReasonHazardousOrPressurized"],
    ["no_effective_rule", "unknownReasonNoEffectiveRule"],
  ] as const)("localizes unknown reason %s", (reason, key) => {
    expect(unknownReasonMessageKey(reason)).toBe(key);
  });
});
