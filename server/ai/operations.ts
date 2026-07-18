import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
  clarifyingQuestionsSchema,
  storyAnalysisSchema,
  type StoryAnalysisValues,
  type StoryInputValues,
} from "../../shared/schemas";

const CREATIVE_DIRECTOR = `You are the StoryDNA creative director for a solo AI filmmaker. Be attentive, specific, cinematic, and emotionally literate. Preserve ambiguity where it appears intentional. Distinguish evidence in the source from your interpretation. Never flatten the creator's voice into generic inspirational language.`;

function client(apiKey: string) {
  return new OpenAI({ apiKey });
}

export async function analyzeStory(
  input: StoryInputValues,
  apiKey: string,
  model: string,
): Promise<StoryAnalysisValues> {
  const response = await client(apiKey).responses.parse({
    model,
    input: [
      {
        role: "system",
        content: `${CREATIVE_DIRECTOR}\n\nAnalyze only. Do not propose a scene outline, shots, or final production plan. Ground claims in the source and call uncertainty an interpretation risk.`,
      },
      {
        role: "user",
        content: `ORIGINAL SOURCE MATERIAL (creator-authored; never rewrite it)\n${JSON.stringify(input, null, 2)}\n\nReturn the requested StoryDNA analysis.`,
      },
    ],
    text: { format: zodTextFormat(storyAnalysisSchema, "story_dna_analysis") },
  });

  if (!response.output_parsed) throw new Error("The model returned no parsed StoryDNA analysis.");
  return storyAnalysisSchema.parse(response.output_parsed);
}

export async function generateClarifyingQuestions(
  input: StoryInputValues,
  analysis: StoryAnalysisValues,
  userCorrection: string,
  extraContext: string,
  variationSeed: number,
  apiKey: string,
  model: string,
) {
  const response = await client(apiKey).responses.parse({
    model,
    input: [
      {
        role: "system",
        content: `${CREATIVE_DIRECTOR}\n\nAsk exactly three concise questions. Each must resolve a distinct ambiguity that would materially alter emotional direction, symbolism, world, character, pacing, or visual language. Do not repeat intake questions. Do not generate scenes. Offer 2–4 genuinely different directions while allowing a free-form answer. Stable unique ids must begin with q-.`,
      },
      {
        role: "user",
        content: `ORIGINAL SOURCE MATERIAL\n${JSON.stringify(input, null, 2)}\n\nAI INTERPRETATION (unapproved)\n${JSON.stringify(analysis, null, 2)}\n\nUSER CORRECTION\n${userCorrection || "None provided"}\n\nEXTRA CREATIVE CONTEXT\n${extraContext || "None provided"}\n\nVARIATION REQUEST\nSet ${variationSeed}. Produce a meaningfully different set when this number is above zero.`,
      },
    ],
    text: { format: zodTextFormat(clarifyingQuestionsSchema, "clarifying_questions") },
  });

  if (!response.output_parsed) throw new Error("The model returned no parsed clarification questions.");
  return clarifyingQuestionsSchema.parse(response.output_parsed);
}

