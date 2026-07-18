import { z } from "zod";

export const sourceTypes = ["poem", "script", "lyrics", "story", "concept"] as const;
export const aspectRatios = ["16:9", "9:16", "1:1", "4:5", "2.39:1"] as const;

export const storyInputSchema = z.object({
  title: z.string().trim().min(2, "Give this project a title.").max(120),
  sourceType: z.enum(sourceTypes),
  sourceText: z
    .string()
    .trim()
    .min(40, "Share at least 40 characters so the director has enough to interpret.")
    .max(30_000),
  visualVibe: z.string().trim().min(3, "Describe the visual feeling you want.").max(500),
  characterDescription: z.string().trim().max(1_000).default(""),
  aspectRatio: z.enum(aspectRatios),
  targetRuntimeSeconds: z.number().int().min(10).max(600),
  preferredTools: z.string().trim().max(500).default(""),
});

export const storyAnalysisSchema = z.object({
  coreEmotionalTruth: z.string().min(1),
  intendedAudienceFeeling: z.string().min(1),
  beginningEmotionalState: z.string().min(1),
  endingEmotionalState: z.string().min(1),
  emotionalArc: z.string().min(1),
  mainThemes: z.array(z.string().min(1)).min(1).max(6),
  symbolsAndMotifs: z.array(
    z.object({
      symbol: z.string().min(1),
      possibleMeaning: z.string().min(1),
      visualOpportunity: z.string().min(1),
    }),
  ).min(1).max(6),
  visualLanguage: z.string().min(1),
  sensoryDirection: z.object({
    color: z.string().min(1),
    lighting: z.string().min(1),
    texture: z.string().min(1),
    atmosphere: z.string().min(1),
  }),
  characterTransformation: z.string().min(1),
  interpretationRisks: z.array(z.string().min(1)).min(1).max(5),
  initialEstimatedSceneCount: z.number().int().min(2).max(30),
});

export const clarifyingQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  whyItMatters: z.string().min(1),
  decisionArea: z.enum(["emotion", "symbolism", "world", "character", "pacing", "visual-language"]),
  options: z.array(z.string().min(1)).min(2).max(4),
});

export const clarifyingQuestionsSchema = z.object({
  questions: z.array(clarifyingQuestionSchema).length(3),
});

export const questionsRequestSchema = z.object({
  input: storyInputSchema,
  analysis: storyAnalysisSchema,
  userCorrection: z.string().trim().max(2_000).default(""),
  extraContext: z.string().trim().max(2_000).default(""),
  variationSeed: z.number().int().nonnegative().default(0),
});

export const operationMetaSchema = z.object({
  demoMode: z.boolean(),
  model: z.string(),
  generatedAt: z.string(),
});

export const analysisResponseSchema = z.object({
  data: storyAnalysisSchema,
  meta: operationMetaSchema,
});

export const questionsResponseSchema = z.object({
  data: clarifyingQuestionsSchema,
  meta: operationMetaSchema,
});

export type StoryInputValues = z.infer<typeof storyInputSchema>;
export type StoryAnalysisValues = z.infer<typeof storyAnalysisSchema>;
export type ClarifyingQuestionValues = z.infer<typeof clarifyingQuestionSchema>;

