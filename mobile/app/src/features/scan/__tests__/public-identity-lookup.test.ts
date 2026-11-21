import { GtinSchema } from "@kierratysappi/domain";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createPublicIdentityLookup, normalizePublicIdentity } from "../public-identity-lookup";

const gtin = GtinSchema.parse("3017620422003"),
  now = "2026-11-16T20:00:00Z";
const payload = {
  product: {
    code: gtin,
    product_type: "food",
    product_name: "Public sample",
    brands: "Sample brand",
  },
};
const json = (body: unknown) =>
  new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } });
afterEach(() => vi.useRealTimers());
describe("free public identity fallback boundary", () => {
  it("normalizes identity with source/licence, never a bin from the name", () => {
    const result = normalizePublicIdentity(payload, gtin, "fi", now);
    expect(result).toMatchObject({
      status: "packaging_missing",
      product: { name: { value: "Public sample" }, packagingComponents: [] },
      cache: { hit: false },
    });
    if (result.status !== "packaging_missing") throw Error("result");
    expect(result.product.name?.provenance).toMatchObject({
      verificationStatus: "community",
      sourceName: "Open Food Facts contributors",
      license: { shareAlike: true },
    });
  });
  it.each([
    null,
    {},
    { product: { code: "6410405196811" } },
    { product: { code: gtin, product_type: "beauty" } },
  ])("rejects malformed/mismatched/sister payload %#", (input) => {
    expect(normalizePublicIdentity(input, gtin, "fi", now).status).toBe("provider_unavailable");
  });
  it("drops oversized/controlled product strings instead of displaying them", () => {
    const result = normalizePublicIdentity(
      { product: { code: gtin, product_name: "x".repeat(1000), brands: "bad\u202E" } },
      gtin,
      "fi",
      now,
    );
    if (result.status !== "packaging_missing") throw Error("result");
    expect(result.product.name).toBeUndefined();
    expect(result.product.brands).toBeUndefined();
  });
  it("uses one fixed HTTPS endpoint with an allowlist, no redirects/secrets/images/location", async () => {
    const fetcher = vi.fn(async (_url: string, _init: RequestInit) => json(payload));
    await createPublicIdentityLookup(fetcher)(gtin, "en");
    expect(fetcher).toHaveBeenCalledOnce();
    const [raw, init] = fetcher.mock.calls[0] ?? [];
    const url = new URL(raw ?? "");
    expect(url.origin).toBe("https://world.openfoodfacts.org");
    expect(url.searchParams.get("fields")).toBe(
      "code,product_type,product_name,product_name_fi,product_name_en,brands,packagings",
    );
    expect(init).toMatchObject({ redirect: "error", credentials: "omit" });
  });
  it("resolves a recognized film and PP material, with community provenance and a sourced Finnish rule", () => {
    const gtin = GtinSchema.parse("6408430030309");
    const result = normalizePublicIdentity(
      {
        product: {
          code: gtin,
          packagings: [{ shape: { id: "en:film" }, material: { id: "en:pp-5-polypropylene" } }],
        },
      },
      gtin,
      "en",
      now,
    );
    expect(result).toMatchObject({
      status: "resolved",
      components: [
        {
          observation: {
            materialFamily: { value: "plastic", provenance: { verificationStatus: "community" } },
          },
          sorting: {
            status: "resolved",
            destination: { id: "plastic_packaging" },
            rule: { version: expect.any(String) },
          },
        },
      ],
    });
  });
  it("reads the exact Coke payload but does not guess material or Finnish deposit from bottle shape", () => {
    const gtin = GtinSchema.parse("6415600502078");
    const result = normalizePublicIdentity(
      { product: { code: gtin, packagings: [{ shape: { id: "en:bottle" }, food_contact: 1 }] } },
      gtin,
      "fi",
      now,
    );
    expect(result).toMatchObject({
      status: "resolved",
      product: {
        packagingCompleteness: { value: "partial" },
      },
      components: [
        {
          observation: { depositReturnStatus: { value: "unknown" } },
          sorting: { status: "ambiguous", reason: "deposit_status_unknown" },
        },
      ],
    });
    if (result.status !== "resolved") throw Error("result");
    expect(result.components[0]?.observation.materialFamily).toBeUndefined();
  });
  it("ignores untrusted shape text, material without shape, and limits output to32parts", () => {
    const packagings = [
      {},
      { shape: { id: "en:container", text: "bottle" }, material: "en:plastic" },
      { material: { id: "en:plastic" } },
      { shape: { id: "en:box" }, material: { text: "plastic" } },
    ];
    expect(
      normalizePublicIdentity({ product: { code: gtin, packagings } }, gtin, "fi", now).status,
    ).toBe("packaging_missing");
    const result = normalizePublicIdentity(
      {
        product: {
          code: gtin,
          packagings: Array.from({ length: 80 }, () => ({
            shape: "en:drink-can",
            material: "en:aluminium",
          })),
        },
      },
      gtin,
      "fi",
      now,
    );
    if (result.status !== "resolved") throw Error("result");
    expect(result.components).toHaveLength(32);
    expect(result.components.every(({ sorting }) => sorting.status === "ambiguous")).toBe(true);
  });
  it("respects four calls per minute without retrying429or pretending it is not found", async () => {
    const fetcher = vi.fn(async () => new Response(null, { status: 429 }));
    const lookup = createPublicIdentityLookup(fetcher, () => Date.parse(now));
    for (let i = 0; i < 6; i++)
      expect((await lookup(gtin, "fi")).status).toBe("provider_unavailable");
    expect(fetcher).toHaveBeenCalledTimes(4);
  });
  it("keeps404distinct from503or malformedJSON", async () => {
    expect(
      await createPublicIdentityLookup(async () => new Response(null, { status: 404 }))(gtin, "fi"),
    ).toEqual({ status: "not_found", gtin });
    expect(
      (
        await createPublicIdentityLookup(async () => new Response(null, { status: 503 }))(
          gtin,
          "fi",
        )
      ).status,
    ).toBe("provider_unavailable");
    expect(
      (
        await createPublicIdentityLookup(
          async () => new Response("{", { headers: { "content-type": "application/json" } }),
        )(gtin, "fi")
      ).status,
    ).toBe("provider_unavailable");
  });
  it("bounds declared and streamed response bytes", async () => {
    for (const response of [
      new Response("x", {
        headers: { "content-type": "application/json", "content-length": "65537" },
      }),
      json({ excess: "x".repeat(65537) }),
    ]) {
      expect((await createPublicIdentityLookup(async () => response)(gtin, "fi")).status).toBe(
        "provider_unavailable",
      );
    }
  });
  it("preserves a typed transport recovery rather than asserting phone connectivity", async () => {
    await expect(
      createPublicIdentityLookup(async () => {
        throw Error("controlled_network");
      })(gtin, "fi"),
    ).rejects.toThrow("public_product_transport_unavailable");
  });
  it("aborts one hanging public request at six seconds without retry", async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => reject(Error("aborted")), { once: true });
        }),
    );
    const result = createPublicIdentityLookup(fetcher)(gtin, "fi");
    const rejected = expect(result).rejects.toThrow("public_product_transport_unavailable");
    await vi.advanceTimersByTimeAsync(6000);
    await rejected;
    expect(fetcher).toHaveBeenCalledOnce();
  });
});
