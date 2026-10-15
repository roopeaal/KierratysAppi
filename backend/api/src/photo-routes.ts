import { preparePhotoBase64 } from "@kierratysappi/contracts/photo-image";
import {
  PhotoRequestSchema,
  PhotoResultSchema,
  photoCapabilitiesPath,
  photoConsentVersion,
  photoRecognitionPath,
} from "@kierratysappi/contracts/photo-recognition";
import type { PhotoRecognizer } from "@kierratysappi/data-providers";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

/** Development-only, bounded cost boundary. This is not production billing/auth. */
export function registerPhotoRoutes(app: FastifyInstance, recognizer?: PhotoRecognizer): void {
  let admitted = 0,
    active = 0;
  app.get(photoCapabilitiesPath, async (_request, reply) => {
    reply.header("Cache-Control", "no-store");
    return { enabled: Boolean(recognizer), consentVersion: photoConsentVersion };
  });
  app.post(
    photoRecognitionPath,
    {
      bodyLimit: 2_001_024,
      config: { rateLimit: { max: 3, timeWindow: "1 minute" } },
      schema: { body: z.toJSONSchema(PhotoRequestSchema, { target: "draft-7", io: "input" }) },
    },
    async (request, reply) => {
      reply.header("Cache-Control", "private, no-store");
      if (!recognizer) return reply.code(503).send({ status: "unavailable", reason: "disabled" });
      const parsed = PhotoRequestSchema.safeParse(request.body);
      if (!parsed.success)
        return reply.code(400).send({ status: "unavailable", reason: "invalid_image" });
      let clean: string;
      try {
        clean = preparePhotoBase64(parsed.data.jpegBase64);
      } catch {
        return reply.code(400).send({ status: "unavailable", reason: "invalid_image" });
      }
      if (active >= 2 || admitted >= 20)
        return reply.code(429).send({ status: "unavailable", reason: "rate_limited" });
      admitted++;
      active++;
      const controller = new AbortController();
      const abort = () => {
        if (!reply.raw.writableEnded) controller.abort();
      };
      request.raw.once("aborted", abort);
      reply.raw.once("close", abort);
      try {
        const result = PhotoResultSchema.parse(
          await recognizer.recognize(clean, parsed.data.language, controller.signal),
        );
        return reply.code(result.status === "estimated" ? 200 : 503).send(result);
      } catch {
        return reply.code(503).send({ status: "unavailable", reason: "provider_unavailable" });
      } finally {
        active--;
        request.raw.off("aborted", abort);
        reply.raw.off("close", abort);
      }
    },
  );
}
