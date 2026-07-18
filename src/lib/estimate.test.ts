import { describe, expect, it } from "vitest";
import { calculateProductionEstimate } from "./estimate";

const scenes = [
  {
    id: "scene-01", position: 1, storyBeat: "A quiet room", sourceReference: "Opening",
    narrativePurpose: "Establish stillness", emotionalIntention: "Calm", visualDescription: "A still chair in an empty room.",
    shotType: "Wide shot", durationSeconds: 5, transitionIdea: "Cut on stillness",
  },
  {
    id: "scene-02", position: 2, storyBeat: "The impossible reflection", sourceReference: "Turn",
    narrativePurpose: "Reveal change", emotionalIntention: "Awe", visualDescription: "A reflected younger self floats as the walls fall away into sky.",
    shotType: "Macro close-up of a hand and face", durationSeconds: 12, transitionIdea: "Light bloom",
  },
];

describe("production estimate calculator", () => {
  it("produces ordered generation ranges and flags difficult shots", () => {
    const estimate = calculateProductionEstimate(scenes, [], {
      platformLabel: "Sample image-to-video platform",
      attemptsPerScene: 3,
      sampleCreditsPerGeneration: 10,
      creditConfigurationLabel: "Demo rate",
    });
    expect(estimate.finishedRuntimeSeconds).toBe(17);
    expect(estimate.minimumLikelyGenerations).toBe(2);
    expect(estimate.minimumLikelyGenerations).toBeLessThan(estimate.expectedGenerations);
    expect(estimate.expectedGenerations).toBeLessThan(estimate.highRetryEstimate);
    expect(estimate.difficultSceneIds).toContain("scene-02");
    expect(estimate.estimatedCredits?.expected).toBe(estimate.expectedGenerations * 10);
  });

  it("omits credit claims until a sample rate is configured", () => {
    const estimate = calculateProductionEstimate(scenes, [], {
      platformLabel: "Not selected",
      attemptsPerScene: 2,
      creditConfigurationLabel: "Sample configuration",
    });
    expect(estimate.estimatedCredits).toBeUndefined();
    expect(estimate.disclaimer).toContain("No current provider pricing");
  });
});
