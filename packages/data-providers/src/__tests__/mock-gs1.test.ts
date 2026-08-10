import { GtinSchema } from "@kierratysappi/domain";
import { describe, expect, it } from "vitest";
import { MockGs1DataProvider } from "../mock-gs1";

describe("MockGs1DataProvider", () => {
  it("labels synthetic fixture data as mock and never implies GS1 verification", async () => {
    const provider = new MockGs1DataProvider();
    const result = await provider.findByGtin(GtinSchema.parse("6410405196811"), {
      country: "FI",
      language: "fi",
    });

    expect(result.status).toBe("found");
    if (result.status !== "found") return;
    expect(result.product.name?.provenance.verificationStatus).toBe("mock");
    expect(result.product.name?.provenance.license.id).toBe("synthetic-demo-only");
  });

  it("does not fabricate records for arbitrary GTINs", async () => {
    const provider = new MockGs1DataProvider();
    await expect(
      provider.findByGtin(GtinSchema.parse("3017620422003"), {
        country: "FI",
        language: "en",
      }),
    ).resolves.toEqual({ status: "not_found" });
  });
});
