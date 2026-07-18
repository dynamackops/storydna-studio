import { describe, expect, it } from "vitest";
import { clarifyingQuestionsSchema, storyAnalysisSchema } from "../../shared/schemas";
import { demoAnalysis, demoQuestions } from "./demo";

const demoStory = {
  title: "The House That Kept the Dawn",
  sourceType: "poem" as const,
  sourceText: "Every morning the old house caught the dawn in its windows, but no one lived there to see it.",
  visualVibe: "quiet magical realism",
  characterDescription: "A solitary woman in a charcoal coat.",
  aspectRatio: "16:9" as const,
  targetRuntimeSeconds: 60,
  preferredTools: "Kling",
};

describe("guided demo director", () => {
  it("returns schema-valid StoryDNA", () => {
    expect(storyAnalysisSchema.parse(demoAnalysis(demoStory)).initialEstimatedSceneCount).toBeGreaterThan(1);
  });

  it("returns a distinct, valid set of exactly three questions", () => {
    const first = clarifyingQuestionsSchema.parse(demoQuestions(0));
    const second = clarifyingQuestionsSchema.parse(demoQuestions(1));
    expect(first.questions).toHaveLength(3);
    expect(second.questions).toHaveLength(3);
    expect(second.questions[0].id).not.toBe(first.questions[0].id);
  });
});
