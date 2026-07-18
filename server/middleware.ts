import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import {
  questionsRequestSchema,
  storyInputSchema,
} from "../shared/schemas";
import { demoAnalysis, demoQuestions } from "./ai/demo";
import { analyzeStory, generateClarifyingQuestions } from "./ai/operations";

interface ApiConfig {
  apiKey?: string;
  model: string;
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 100_000) throw new Error("Request body is too large.");
  }
  return JSON.parse(body || "{}");
}

function send(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function meta(config: ApiConfig, demoMode: boolean) {
  return {
    demoMode,
    model: demoMode ? "StoryDNA demo director" : config.model,
    generatedAt: new Date().toISOString(),
  };
}

export function storyApiPlugin(config: ApiConfig): Plugin {
  return {
    name: "storydna-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/story/")) return next();
        if (req.method !== "POST") return send(res, 405, { code: "method_not_allowed", message: "Use POST.", retryable: false });
        if (!req.headers["content-type"]?.includes("application/json")) {
          return send(res, 415, { code: "invalid_content_type", message: "Send JSON.", retryable: false });
        }

        try {
          const body = await readJson(req);
          const demoMode = !config.apiKey;

          if (req.url === "/api/story/analyze") {
            const input = storyInputSchema.parse(body);
            const data = demoMode
              ? demoAnalysis(input)
              : await analyzeStory(input, config.apiKey!, config.model);
            return send(res, 200, { data, meta: meta(config, demoMode) });
          }

          if (req.url === "/api/story/questions") {
            const parsed = questionsRequestSchema.parse(body);
            const data = demoMode
              ? demoQuestions(parsed.variationSeed)
              : await generateClarifyingQuestions(
                  parsed.input,
                  parsed.analysis,
                  parsed.userCorrection,
                  parsed.extraContext,
                  parsed.variationSeed,
                  config.apiKey!,
                  config.model,
                );
            return send(res, 200, { data, meta: meta(config, demoMode) });
          }

          return send(res, 404, { code: "not_found", message: "Unknown operation.", retryable: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown server error.";
          const validation = error && typeof error === "object" && "issues" in error;
          return send(res, validation ? 400 : 500, {
            code: validation ? "invalid_request" : "generation_failed",
            message: validation ? "Some story details are invalid." : message,
            retryable: !validation,
          });
        }
      });
    },
  };
}

