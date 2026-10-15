# Photo recognition evidence — 2026-10-15

Official OpenAI documentation was searched and fetched on 2026-10-15 before
implementation, after secure credential approval. Sources:

- [Image inputs and limitations](https://developers.openai.com/api/docs/guides/images-vision):
  Responses accepts base64 image data. Descriptions can be wrong; an image is not
  verified product identity, material composition, deposit eligibility or safety.
- [Structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs):
  use a strict supported JSON-Schema subset; handle refusals/incomplete replies.
  Structure does not establish factual correctness. Full application validation
  still bounds strings/arrays and rejects unexpected fields/control characters.
- [GPT-4.1 mini](https://developers.openai.com/api/docs/models/gpt-4.1-mini):
  image input, Responses and structured outputs supported. Pin the documented
  `gpt-4.1-mini-2025-04-14` snapshot; do not assume newest/cheapest/best accuracy.
- [API data controls](https://developers.openai.com/api/docs/guides/your-data):
  `store:false` does not establish zero retention. Default abuse-monitoring
  retention is generally up to 30 days, with stated exceptions allowing longer
  retention. No approved ZDR or EU-only processing is asserted for this project.

Decision: OpenAI provides tentative visual observations only. The image cannot
provide a bin, a source citation or a verified status. User confirmation of an
ordinary empty/non-hazardous packaging part precedes the unchanged Finnish rule
engine. Bottles/cans retain unknown deposit status; hazardous/non-packaging/
uncertain cases do not get ordinary collection instructions from the photo.

Real diagnostics: model metadata access returned 200. A Responses attempt
returned 400 `invalid_json_schema`; the adapter now sends a conservative wire
schema while retaining the full runtime checks. The later provider diagnostic
reached 429 `credit_balance_exhausted`, type `insufficient_quota`. Those initial
attempts produced no real estimate. Later on October 15, after the owner reported
funding, exactly one authorized synthetic-image recheck returned HTTP 200 and a
runtime-validated `estimated` from the same adapter/model. This establishes one
live schema/adapter success, not remaining balance, real-product accuracy, OCR
quality, the application HTTP/mobile flow or a physical camera pass. No automatic
retry or further live request in the next build-only unit.

The account owner can review [billing](https://platform.openai.com/settings/organization/billing)
and [limits](https://platform.openai.com/settings/organization/limits). Funds are
not added by the agent. A starter model such as `gpt-6-luna` is a separate option
for simple experiments, not a solution to exhausted credit and not a silent
replacement for this pinned vision configuration; evaluate support/cost before
any model change. No prices, credit amounts or account identifiers are recorded.
