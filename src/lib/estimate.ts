import {
  productionEstimateSchema,
  type EstimateConfigValues,
  type MotionPlanValues,
  type ProductionEstimateValues,
  type SceneValues,
} from "../../shared/schemas";

const complexVisualTerms = [
  "impossible", "fall away", "drift", "reflection", "reflected", "younger self",
  "transformation", "crowd", "water", "fire", "sky", "floating", "multiple",
];

export function assessShotDifficulty(scene: SceneValues, motion?: MotionPlanValues) {
  const combined = `${scene.visualDescription} ${scene.shotType} ${motion?.subjectMovement || ""} ${motion?.cameraMovement || ""}`.toLowerCase();
  let score = 0;
  const reasons: string[] = [];

  const matchedTerms = complexVisualTerms.filter((term) => combined.includes(term));
  if (matchedTerms.length) {
    score += Math.min(2, matchedTerms.length);
    reasons.push(`complex visual element${matchedTerms.length > 1 ? "s" : ""}: ${matchedTerms.slice(0, 2).join(", ")}`);
  }
  if (/close-up|macro|face|hand|finger/.test(combined)) {
    score += 1;
    reasons.push("continuity-sensitive anatomy or facial detail");
  }
  if (motion?.imageToVideoPrompt) {
    score += 1;
    reasons.push("coordinated camera and subject motion");
  }
  if ((motion?.durationSeconds || scene.durationSeconds) > 8) {
    score += 1;
    reasons.push("longer generated clip");
  }

  const difficulty = score >= 4 ? "high" : score >= 2 ? "medium" : "low";
  return {
    difficulty,
    difficultyReason: reasons.length ? reasons.join("; ") : "simple composition with restrained motion",
  } as const;
}

export function calculateProductionEstimate(
  scenes: SceneValues[],
  motionPlans: MotionPlanValues[],
  config: EstimateConfigValues,
): ProductionEstimateValues {
  const shots = scenes.map((scene) => {
    const motion = motionPlans.find((plan) => plan.sceneId === scene.id);
    const { difficulty, difficultyReason } = assessShotDifficulty(scene, motion);
    const modifier = difficulty === "high" ? 2 : difficulty === "medium" ? 0 : -1;
    const expectedGenerations = Math.max(1, config.attemptsPerScene + modifier);
    const highRetryGenerations = expectedGenerations + (difficulty === "high" ? 4 : difficulty === "medium" ? 2 : 1);
    return {
      sceneId: scene.id,
      difficulty,
      difficultyReason,
      minimumGenerations: 1,
      expectedGenerations,
      highRetryGenerations,
    };
  });

  const minimumLikelyGenerations = shots.reduce((sum, shot) => sum + shot.minimumGenerations, 0);
  const expectedGenerations = shots.reduce((sum, shot) => sum + shot.expectedGenerations, 0);
  const highRetryEstimate = shots.reduce((sum, shot) => sum + shot.highRetryGenerations, 0);
  const rate = config.sampleCreditsPerGeneration;

  return productionEstimateSchema.parse({
    platformLabel: config.platformLabel,
    finishedRuntimeSeconds: scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0),
    minimumLikelyGenerations,
    expectedGenerations,
    highRetryEstimate,
    estimatedCredits: rate === undefined ? undefined : {
      minimum: minimumLikelyGenerations * rate,
      expected: expectedGenerations * rate,
      highRetry: highRetryEstimate * rate,
      configurationLabel: config.creditConfigurationLabel,
    },
    difficultSceneIds: shots.filter((shot) => shot.difficulty === "high").map((shot) => shot.sceneId),
    shots,
    disclaimer: "Planning estimate only. Actual attempts, credits, render time, and output quality vary by platform, model, settings, source image, and creative standards. No current provider pricing is implied.",
    generatedAt: new Date().toISOString(),
  });
}
