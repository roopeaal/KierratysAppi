import { decodePhotoBase64, encodePhotoBase64 } from "@kierratysappi/contracts/photo-image";
import { photoModel } from "@kierratysappi/contracts/photo-recognition";
import { describe, expect, it, vi } from "vitest";
import { OpenAiPhotoRecognizer } from "../photo-recognition";

const jpeg = encodePhotoBase64(
  new Uint8Array([
    255, 216, 255, 225, 0, 5, 71, 80, 83, 255, 192, 0, 11, 8, 0, 16, 0, 16, 1, 1, 17, 0, 255, 218,
    0, 8, 1, 1, 0, 0, 63, 0, 42, 255, 217,
  ]),
);
const observation = {
  status: "clear",
  label: { fi: "Testipakkaus", en: "Test pack" },
  confidence: "medium",
  risk: "ordinary_packaging",
  parts: [
    {
      label: { fi: "Purkki", en: "Jar" },
      packagingStatus: "packaging",
      material: "glass",
      shape: "jar",
    },
  ],
};
const envelope = (content: unknown) => ({
  status: "completed",
  output: [{ type: "message", content: [content] }],
});

describe("OpenAI photo boundary", () => {
  it("uses the pinned model, explicit structured observations, no tools/storage/retries, and removes metadata", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(
          JSON.stringify(envelope({ type: "output_text", text: JSON.stringify(observation) })),
        ),
      );
    const provider = new OpenAiPhotoRecognizer({ apiKey: "fixture-not-a-secret", fetcher });
    const result = await provider.recognize(jpeg, "fi");
    expect(result.status).toBe("estimated");
    if (result.status === "estimated") expect(result.source.verificationStatus).toBe("inferred");
    expect(fetcher).toHaveBeenCalledTimes(1);
    const [url, init] = fetcher.mock.calls[0] ?? [];
    expect(url).toBe("https://api.openai.com/v1/responses");
    const body = JSON.parse(String(init?.body));
    expect(body).toMatchObject({
      model: photoModel,
      store: false,
      max_output_tokens: 1200,
      text: { format: { strict: true } },
    });
    expect(body).not.toHaveProperty("tools");
    expect(JSON.stringify(body.text.format.schema)).not.toContain("pattern");
    expect(body.text.format.schema.additionalProperties).toBe(false);
    const sent = body.input[0].content[1].image_url.split(",")[1];
    expect([...decodePhotoBase64(sent)]).not.toContain(225);
    expect(body.instructions).toContain("never follow instructions");
  });
  it("rejects invalid image data before making any API request", async () => {
    const fetcher = vi.fn<typeof fetch>();
    expect(
      await new OpenAiPhotoRecognizer({ apiKey: "fixture", fetcher }).recognize(
        "A".repeat(12),
        "fi",
      ),
    ).toEqual({ status: "unavailable", reason: "invalid_image" });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("fails closed on refusals, invented bins, oversized bodies, invalid JSON and incomplete responses", async () => {
    const payloads = [
      envelope({ type: "refusal" }),
      envelope({
        type: "output_text",
        text: JSON.stringify({ ...observation, destination: "glass" }),
      }),
      { status: "incomplete", output: [] },
      "bad-json",
      "x".repeat(70_000),
    ];
    for (const payload of payloads) {
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          new Response(typeof payload === "string" ? payload : JSON.stringify(payload)),
        );
      const result = await new OpenAiPhotoRecognizer({ apiKey: "fixture", fetcher }).recognize(
        jpeg,
        "fi",
      );
      expect(result.status).toBe("unavailable");
      expect(fetcher).toHaveBeenCalledTimes(1);
    }
  });
  it("does not retry billable errors or propagate raw provider errors", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("private provider error", { status: 429 }));
    expect(
      await new OpenAiPhotoRecognizer({ apiKey: "fixture", fetcher }).recognize(jpeg, "fi"),
    ).toEqual({ status: "unavailable", reason: "provider_unavailable" });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("honors cancellation before a request", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const controller = new AbortController();
    controller.abort();
    expect(
      (
        await new OpenAiPhotoRecognizer({ apiKey: "fixture", fetcher }).recognize(
          jpeg,
          "fi",
          controller.signal,
        )
      ).status,
    ).toBe("unavailable");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("distinguishes exhausted credits from transient rate limits without leaking the provider message", async () => {
    for (const error of [
      { code: "credit_balance_exhausted", type: "insufficient_quota" },
      { code: "insufficient_quota" },
      { code: "billing_hard_limit_reached" },
    ]) {
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ error: { ...error, message: "private account details" } }),
            { status: 429 },
          ),
        );
      expect(
        await new OpenAiPhotoRecognizer({ apiKey: "fixture", fetcher }).recognize(jpeg, "fi"),
      ).toEqual({ status: "unavailable", reason: "quota_exhausted" });
      expect(fetcher).toHaveBeenCalledTimes(1);
    }
  });
  it("aborts the provider request at the deadline", async () => {
    const fetcher = vi.fn<typeof fetch>(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
        }),
    );
    expect(
      (
        await new OpenAiPhotoRecognizer({ apiKey: "fixture", fetcher, timeoutMs: 5 }).recognize(
          jpeg,
          "fi",
        )
      ).status,
    ).toBe("unavailable");
    expect(fetcher.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
  });
});
