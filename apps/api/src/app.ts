import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import {
  ProductLookupResultSchema,
  type ProductLookupInput,
  type ProductLookupResult,
} from "@kierratysappi/application";
import { parseGtin } from "@kierratysappi/domain";
import Fastify, {
  type FastifyError,
  type FastifyInstance,
  type FastifyLoggerOptions,
  LogController,
} from "fastify";
import { z } from "zod";

const LookupBodySchema = z.object({
  gtin: z.string().min(1).max(32),
  language: z.enum(["fi", "en"]).default("fi"),
});

export interface LookupService {
  lookup(input: ProductLookupInput, signal?: AbortSignal): Promise<ProductLookupResult>;
}

export type BuildAppOptions = {
  readonly lookupService: LookupService;
  readonly logger?: false | FastifyLoggerOptions;
  readonly allowedWebOrigins?: readonly string[];
};

export async function buildApp(options: BuildAppOptions): Promise<FastifyInstance> {
  const app = Fastify({
    bodyLimit: 2_048,
    logController: new LogController({ disableRequestLogging: true }),
    logger: options.logger ?? false,
    trustProxy: false,
    ajv: {
      customOptions: {
        allErrors: false,
        removeAdditional: true,
      },
    },
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });
  if (options.allowedWebOrigins && options.allowedWebOrigins.length > 0) {
    await app.register(cors, {
      origin: [...options.allowedWebOrigins],
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Accept"],
      credentials: false,
      maxAge: 600,
    });
  }
  await app.register(rateLimit, {
    global: true,
    max: 60,
    timeWindow: "1 minute",
    errorResponseBuilder: () => ({
      error: { code: "rate_limited", message: "Too many requests. Try again shortly." },
    }),
  });
  await app.register(swagger, {
    openapi: {
      info: {
        title: "KierrätysAppi API",
        version: "0.1.0",
        description: "Privacy-conscious product and Finnish packaging-sorting resolution.",
      },
      servers: [{ url: "/" }],
    },
  });

  app.get(
    "/v1/health",
    {
      schema: {
        description: "Liveness check with no external dependency access.",
        response: {
          200: {
            type: "object",
            additionalProperties: false,
            required: ["status", "version"],
            properties: {
              status: { const: "ok" },
              version: { type: "string" },
            },
          },
        },
      },
    },
    async () => ({ status: "ok" as const, version: "0.1.0" }),
  );

  app.get(
    "/v1/openapi.json",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
      schema: { hide: true },
    },
    async (_request, reply) => reply.send(app.swagger()),
  );

  app.post(
    "/v1/recycling/lookup",
    {
      config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
      schema: {
        description:
          "Resolve one canonical or manually formatted GTIN without logging it in the URL.",
        body: {
          type: "object",
          additionalProperties: false,
          required: ["gtin"],
          properties: {
            gtin: { type: "string", minLength: 1, maxLength: 32 },
            language: { type: "string", enum: ["fi", "en"], default: "fi" },
          },
        },
        response: {
          200: {
            type: "object",
            additionalProperties: true,
            required: ["status", "gtin"],
            properties: {
              status: { type: "string", enum: ["resolved", "packaging_missing"] },
              gtin: { type: "string" },
            },
          },
          400: errorResponseSchema("invalid_request"),
          404: statusResponseSchema("not_found"),
          503: statusResponseSchema("provider_unavailable"),
        },
      },
    },
    async (request, reply) => {
      const body = LookupBodySchema.safeParse(request.body);
      if (!body.success) {
        return reply.code(400).send({
          error: { code: "invalid_request", message: "Request body is invalid." },
        });
      }

      const parsedGtin = parseGtin(body.data.gtin);
      if (!parsedGtin.ok) {
        return reply.code(400).send({
          error: { code: "invalid_gtin", message: "Barcode is not a valid GTIN." },
        });
      }

      const controller = new AbortController();
      const abort = () => controller.abort();
      request.raw.once("aborted", abort);
      try {
        const result = ProductLookupResultSchema.parse(
          await options.lookupService.lookup(
            {
              gtin: parsedGtin.value,
              country: "FI",
              language: body.data.language,
            },
            controller.signal,
          ),
        );

        reply.header("Cache-Control", "private, no-store");
        if (result.status === "not_found") {
          return reply.code(404).send(result);
        }
        if (result.status === "provider_unavailable") {
          return reply.code(503).send(result);
        }
        return reply.code(200).send(result);
      } finally {
        request.raw.off("aborted", abort);
      }
    },
  );

  app.setNotFoundHandler(async (_request, reply) =>
    reply.code(404).send({
      error: { code: "route_not_found", message: "Route not found." },
    }),
  );

  app.setErrorHandler(async (error: FastifyError, request, reply) => {
    request.log.error({ err: error }, "Unhandled request error");
    return reply.code(error.statusCode && error.statusCode < 500 ? error.statusCode : 500).send({
      error: {
        code: error.statusCode === 413 ? "payload_too_large" : "internal_error",
        message:
          error.statusCode && error.statusCode < 500 ? error.message : "Unexpected server error.",
      },
    });
  });

  await app.ready();
  return app;
}

function errorResponseSchema(code: string) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["error"],
    properties: {
      error: {
        type: "object",
        additionalProperties: false,
        required: ["code", "message"],
        properties: {
          code: { type: "string", examples: [code] },
          message: { type: "string" },
        },
      },
    },
  } as const;
}

function statusResponseSchema(status: "not_found" | "provider_unavailable") {
  return {
    type: "object",
    required: ["status", "gtin"],
    properties: {
      status: { const: status },
      gtin: { type: "string" },
      retryable: { type: "boolean" },
    },
  } as const;
}
