import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const {
  assessLabels,
  checkCases,
  checkLiveArgs,
  requestBody,
} = require("../qa/photo-product-eval.cjs");
const { cases } = require("../qa/photo-product-cases.json");

test("live product evaluation requires explicit opt-in and disallows implicit retry flags", () => {
  assert.doesNotThrow(() => checkLiveArgs(["--live"]));
  for (const args of [[], ["--retry"], ["--live", "--retry"]])
    assert.throws(() => checkLiveArgs(args));
});

test("product evaluation is at most eight unique pinned public front photos", () => {
  assert.doesNotThrow(() => checkCases(cases));
  assert.throws(() => checkCases([...cases, cases[0]]));
  assert.throws(() => checkCases([cases[0], cases[0]]));
  assert.throws(() => checkCases([{ ...cases[0], imageUrl: "http://localhost/private.jpg" }]));
});

test("evaluation sends only JPEG, language and consent, never the answer or source barcode", () => {
  const bytes = Buffer.from([255, 216, 42, 42, 255, 217]);
  const body = requestBody(bytes);
  assert.deepEqual(Object.keys(body).sort(), ["consentVersion", "jpegBase64", "language"]);
  assert.deepEqual(Buffer.from(body.jpegBase64, "base64"), bytes);
  assert.throws(() => requestBody(Buffer.from("not a photo")));
  assert.throws(() => requestBody(Buffer.alloc(1_500_001)));
});

const estimate = (fi, en) => ({
  status: "estimated",
  source: { verificationStatus: "inferred", model: "gpt-4.1-mini-2025-04-14" },
  observation: { label: { fi, en } },
});

test("the rubric distinguishes generic product type from named product family", () => {
  const nutella = cases[0];
  assert.deepEqual(assessLabels(nutella, estimate("Suklaalevite", "Hazelnut spread")), {
    productFamilyMentioned: false,
    categoryMentioned: true,
  });
  assert.deepEqual(assessLabels(nutella, estimate("Nutella-suklaalevite", "Nutella spread")), {
    productFamilyMentioned: true,
    categoryMentioned: true,
  });
});

test("a shared brand alone is not a correct specific product family", () => {
  const biscuits = cases.find((item) => item.id === "nutella-biscuits");
  assert.equal(
    assessLabels(biscuits, estimate("Nutella", "Nutella spread")).productFamilyMentioned,
    false,
  );
  assert.equal(
    assessLabels(biscuits, estimate("Nutella-keksit", "Nutella biscuits")).productFamilyMentioned,
    true,
  );
});

test("unavailable or fake-verified results cannot become recognition passes", () => {
  assert.deepEqual(assessLabels(cases[0], { status: "unavailable" }), {
    productFamilyMentioned: false,
    categoryMentioned: false,
  });
  const fake = estimate("Nutella", "Nutella spread");
  fake.source.verificationStatus = "verified";
  assert.throws(() => assessLabels(cases[0], fake));
});

test("broad keyword presence is not a bilingual semantic correctness verdict", () => {
  const quaker = cases.find((item) => item.id === "quaker");
  const result = assessLabels(quaker, estimate("aamiaispuuropakkaus", "breakfast cereal box"));
  assert.equal(result.categoryMentioned, true);
  assert.equal(result.productFamilyMentioned, false);
  // The English keyword matches, but the Finnish porridge label still needs manual review.
});
