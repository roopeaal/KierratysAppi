import type {
  FieldProvenance,
  PackagingComponentObservation,
  VerificationStatus,
} from "@kierratysappi/domain";
import { describe, expect, it } from "vitest";
import { sortPackagingComponent } from "../engine";

const baseProvenance: FieldProvenance = {
  sourceId: "open-food-facts",
  sourceName: "Open Food Facts",
  sourceRecordId: "3017620422003",
  sourceUrl: "https://world.openfoodfacts.org/product/3017620422003",
  retrievedAt: "2026-08-10T00:00:00.000Z",
  confidence: 0.65,
  verificationStatus: "community",
  license: {
    id: "odbl-1.0",
    name: "Open Database License 1.0",
    url: "https://opendatacommons.org/licenses/odbl/1-0/",
    attributionText: "Open Food Facts contributors",
    shareAlike: true,
  },
};

function observed<T>(
  value: T,
  confidence = 0.65,
  verificationStatus: VerificationStatus = "community",
) {
  return {
    value,
    provenance: { ...baseProvenance, confidence, verificationStatus },
  };
}

function component(
  overrides: Partial<PackagingComponentObservation> = {},
): PackagingComponentObservation {
  return {
    id: "component-1",
    packagingStatus: observed("packaging"),
    materialFamily: observed("plastic"),
    shape: observed("tray"),
    depositReturnStatus: observed("not_applicable"),
    conditions: { hazardousResidue: "unknown", pressurized: "unknown", emptied: "unknown" },
    ...overrides,
  };
}

const context = {
  country: "FI" as const,
  language: "fi" as const,
  evaluatedAt: "2026-08-10T12:00:00.000Z",
};

describe("Finnish sorting engine", () => {
  it("resolves plastic packaging with a verified Rinki rule but community-capped confidence", () => {
    const result = sortPackagingComponent({ component: component(), context });

    expect(result).toMatchObject({
      status: "resolved",
      destination: { id: "plastic_packaging" },
      rule: { id: "fi.packaging.plastic", verificationStatus: "verified" },
      confidence: { tier: "medium", score: 0.65 },
    });
  });

  it("gives known Finnish deposit return precedence over material collection", () => {
    const result = sortPackagingComponent({
      component: component({
        shape: observed("bottle"),
        depositReturnStatus: observed("yes", 0.95, "manufacturer"),
      }),
      context,
    });

    expect(result).toMatchObject({
      status: "resolved",
      destination: { id: "deposit_return" },
      rule: { id: "fi.deposit.palpa" },
    });
  });

  it("does not guess deposit status for bottles", () => {
    const result = sortPackagingComponent({
      component: component({
        shape: observed("bottle"),
        depositReturnStatus: observed("unknown", 0.2, "unknown"),
      }),
      context,
    });

    expect(result).toMatchObject({
      status: "ambiguous",
      reason: "deposit_status_unknown",
      candidateDestinations: ["deposit_return", "plastic_packaging"],
    });
  });

  it("requires a bottle or jar before resolving glass-packaging collection", () => {
    const result = sortPackagingComponent({
      component: component({
        materialFamily: observed("glass"),
        shape: observed("other"),
        depositReturnStatus: observed("not_applicable"),
      }),
      context,
    });

    expect(result).toMatchObject({ status: "ambiguous", reason: "glass_shape_unknown" });
  });

  it("routes hazardous or pressurized packages away from ordinary collection", () => {
    const result = sortPackagingComponent({
      component: component({
        conditions: { hazardousResidue: "yes", pressurized: "unknown", emptied: "unknown" },
      }),
      context,
    });

    expect(result).toMatchObject({ status: "unknown", reason: "hazardous_or_pressurized" });
  });

  it("keeps unsupported composites unknown", () => {
    const result = sortPackagingComponent({
      component: component({ materialFamily: observed("composite") }),
      context,
    });

    expect(result).toMatchObject({ status: "unknown", reason: "unsupported_material" });
  });

  it("does not apply packaging rules to known non-packaging items", () => {
    const result = sortPackagingComponent({
      component: component({ packagingStatus: observed("non_packaging") }),
      context,
    });

    expect(result).toMatchObject({ status: "unknown", reason: "not_packaging" });
  });
});
