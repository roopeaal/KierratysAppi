import { CommunityPackagingCatalogueSchema } from "@kierratysappi/contracts/community-packaging-catalogue";
import { GtinSchema } from "@kierratysappi/domain";
import { describe, expect, it } from "vitest";
import data from "../../../../assets/data/fi-package-observations.json";
import { createCommunityPackagingLookup } from "../community-packaging-lookup";
import { reviewedBarcodeLookup } from "../reviewed-barcode-packaging";

const at = "2026-11-25T12:00:00.000Z";
const lookup = createCommunityPackagingLookup(data);

describe("assessment offline catalogue", () => {
  it.each(["fi", "en"] as const)(
    "replays every exact code without any provider in %s",
    (language) => {
      const rows = CommunityPackagingCatalogueSchema.parse(data).records;
      expect(rows).toHaveLength(93);
      const counts = {
        routable: 0,
        allListed: 0,
        resolved: 0,
        unresolved: 0,
        verifiedOverrides: 0,
      };
      for (const row of rows) {
        const community = lookup(row.gtin, language, at);
        const checked = reviewedBarcodeLookup(row.gtin, language, at);
        const result = checked ?? community;
        expect(community?.status).toBe("resolved");
        if (result?.status !== "resolved") throw Error(`missing exact code ${row.gtin}`);
        counts.verifiedOverrides += Number(Boolean(checked));
        expect(result.product.packagingCompleteness.value).toBe("partial");
        expect(result.components).toHaveLength(row.parts.length);
        const resolved = result.components.filter((p) => p.sorting.status === "resolved");
        counts.routable += Number(resolved.length > 0);
        counts.allListed += Number(resolved.length === row.parts.length);
        counts.resolved += resolved.length;
        counts.unresolved += row.parts.length - resolved.length;
        for (const part of result.components) {
          expect(part.observation.depositReturnStatus).toBeUndefined();
          if (part.sorting.status === "resolved") {
            expect(part.sorting.destination.id).not.toBe("deposit_return");
            expect(part.sorting.rule).toMatchObject({
              jurisdiction: "FI",
              sourceUrl: expect.stringMatching(/^https:/u),
              version: expect.any(String),
            });
          }
          if (!checked) {
            expect(part.observation.materialFamily?.provenance).toMatchObject({
              verificationStatus: "community",
              sourceUrl: row.source.url,
              license: { shareAlike: true },
            });
          }
        }
      }
      expect(counts).toEqual({
        routable: 92,
        allListed: 86,
        resolved: 215,
        unresolved: 8,
        verifiedOverrides: 3,
      });
    },
  );

  it("matches GTIN padding but rejects distinct, expired and future observations", () => {
    const first = data.records[0];
    if (!first) throw Error("missing pack");
    expect(lookup(GtinSchema.parse("0" + first.gtin), "en", at)).not.toBeNull();
    expect(lookup(GtinSchema.parse(first.gtin), "fi", "2027-11-24T00:00:00.000Z")).toBeNull();
    expect(lookup(GtinSchema.parse(first.gtin), "fi", "2026-11-22T00:00:00.000Z")).toBeNull();
    expect(lookup(GtinSchema.parse("6415600502078"), "fi", at)).toBeNull();
    expect(lookup(GtinSchema.parse("6408430310876"), "fi", at)).toBeNull();
  });

  it.each(["gtin", "coverage", "duplicate", "source"] as const)("rejects malformed %s", (fault) => {
    const copy = structuredClone(data);
    const first = copy.records[0];
    if (!first) throw Error("missing pack");
    if (fault === "gtin")
      first.source.url = "https://world.openfoodfacts.org/product/6415600502078";
    if (fault === "coverage") first.coverage = "all-separable-parts";
    if (fault === "duplicate") copy.records.push({ ...first, gtin: "0" + first.gtin });
    if (fault === "source") first.source.url = "not a URL";
    expect(createCommunityPackagingLookup(copy)(GtinSchema.parse(first.gtin), "fi", at)).toBeNull();
  });
});
