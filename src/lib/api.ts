import {
  analysisResponseSchema,
  questionsResponseSchema,
  type StoryAnalysisValues,
  type StoryInputValues,
} from "../../shared/schemas";

export interface ApiErrorShape {
  code: string;
  message: string;
  retryable: boolean;
}

async function post(path: string, body: unknown): Promise<unknown> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = payload as Partial<ApiErrorShape>;
    throw new Error(error.message || "The creative director could not complete that step.");
  }
  return payload;
}

export async function requestAnalysis(input: StoryInputValues) {
  return analysisResponseSchema.parse(await post("/api/story/analyze", input));
}

export async function requestQuestions(
  input: StoryInputValues,
  analysis: StoryAnalysisValues,
  userCorrection: string,
  extraContext: string,
  variationSeed: number,
) {
  return questionsResponseSchema.parse(
    await post("/api/story/questions", {
      input,
      analysis,
      userCorrection,
      extraContext,
      variationSeed,
    }),
  );
}

