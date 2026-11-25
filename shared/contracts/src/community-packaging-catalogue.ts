import { GtinSchema, WebUrlSchema } from "@kierratysappi/domain";
import { z } from "zod";

const plain = (limit: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(limit)
    .refine((s) => !/[<>\p{Cc}\p{Cf}]/u.test(s));

const role = z.enum([
  "tub",
  "seal",
  "sleeve",
  "label",
  "cover",
  "mould",
  "sheet",
  "clip",
  "bottle",
  "can",
  "jar",
  "box",
  "carton",
  "bag",
  "wrap",
  "tray",
  "cup",
  "cap",
  "lid",
  "inner-lid",
  "pump",
  "tube",
]);
export type CommunityPackageRole = z.infer<typeof role>;

const row = z
  .strictObject({
    gtin: GtinSchema.refine((s) => !/^0+$/u.test(s)),
    name: plain(160),
    jurisdiction: z.literal("FI"),
    checkedOn: z.iso.date(),
    coverage: z.literal("partial"),
    source: z.strictObject({
      kind: z.literal("community"),
      publisher: z.literal("Open Food Facts contributors"),
      url: WebUrlSchema,
      revision: plain(160),
      licence: z.literal("ODbL-1.0+DbCL-1.0"),
      rightsUrl: z.literal("https://world.openfoodfacts.org/data"),
    }),
    parts: z
      .array(
        z.strictObject({
          shape: role,
          material: z.enum(["plastic", "carton", "paper", "glass", "metal", "wood", "composite"]),
          evidence: plain(220),
        }),
      )
      .min(2)
      .max(24),
    coverageEvidence: plain(240).optional(),
  })
  .superRefine((value, ctx) => {
    const code = value.source.url.match(
      /^https:\/\/world\.openfoodfacts\.org\/product\/(\d{8}|\d{12,14})(?:\/[\w-]+)?\/?$/u,
    )?.[1];
    if (code?.padStart(14, "0") !== value.gtin.padStart(14, "0"))
      ctx.addIssue({ code: "custom", message: "source does not identify the exact GTIN" });
    if (new Set(value.parts.map((part) => part.evidence)).size !== value.parts.length)
      ctx.addIssue({ code: "custom", message: "duplicate source part" });
  });

export const CommunityPackagingCatalogueSchema = z
  .strictObject({
    schema: z.literal("fi-exact-package-observations-v1"),
    records: z.array(row).max(1000),
  })
  .superRefine(({ records }, ctx) => {
    const keys = records.map((record) => record.gtin.padStart(14, "0"));
    if (new Set(keys).size !== keys.length)
      ctx.addIssue({ code: "custom", message: "duplicate exact GTIN" });
  });
