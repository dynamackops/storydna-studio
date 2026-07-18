import type { ClarifyingQuestionValues, StoryAnalysisValues, StoryInputValues } from "../../shared/schemas";

export function demoAnalysis(input: StoryInputValues): StoryAnalysisValues {
  const sceneCount = Math.max(3, Math.min(12, Math.round(input.targetRuntimeSeconds / 8)));

  return {
    coreEmotionalTruth: `A private inner change becomes visible when the creator stops resisting what the ${input.sourceType} already knows.`,
    intendedAudienceFeeling: "Recognized first, then quietly released—as if an unnamed feeling has finally found an image.",
    beginningEmotionalState: "Held breath, distance, and emotional containment.",
    endingEmotionalState: "Tender clarity with a trace of mystery still intact.",
    emotionalArc: "The film should move from compression and uncertainty through a charged symbolic encounter, then arrive at an earned visual exhale.",
    mainThemes: ["self-recognition", "transformation", "memory as landscape"],
    symbolsAndMotifs: [
      {
        symbol: "Thresholds and reflected surfaces",
        possibleMeaning: "The gap between the self that performs and the self that knows.",
        visualOpportunity: "Repeat doors, windows, water, or mirrors with a subtle change in each appearance.",
      },
      {
        symbol: "A single warm source of light",
        possibleMeaning: "An inner truth that is present before the character can name it.",
        visualOpportunity: "Let the warm source gradually move from background detail to the emotional center of frame.",
      },
    ],
    visualLanguage: `${input.visualVibe}. Favor composed, tactile images with negative space and visual echoes rather than literal illustration of every line.`,
    sensoryDirection: {
      color: "Near-black violets and mineral blues interrupted by restrained amber.",
      lighting: "Motivated pools of light, soft falloff, and one evolving practical source.",
      texture: "Film grain, weathered surfaces, atmospheric depth, and delicate imperfections.",
      atmosphere: "Intimate, suspended, and quietly celestial rather than grandiose.",
    },
    characterTransformation: input.characterDescription
      ? "The character moves from guarded observation to embodied acceptance; posture and gaze should carry more of the change than overt action."
      : "The implied protagonist moves from disconnection to presence; this can be expressed through point of view, environment, and rhythm if no character is shown.",
    interpretationRisks: [
      "Beautiful imagery could become decorative if the central emotional turn is not clearly staged.",
      "The ending could read as resolution or loss; the creator's intended after-feeling needs clarification.",
    ],
    initialEstimatedSceneCount: sceneCount,
  };
}

const questionSets: ClarifyingQuestionValues[][] = [
  [
    {
      id: "q-ending-feeling",
      decisionArea: "emotion",
      question: "In the final image, should the audience feel release, ache, or a deliberately unresolved mixture of both?",
      whyItMatters: "That choice changes whether the visual arc opens into warmth, holds on absence, or ends on an ambiguous threshold.",
      options: ["A clean emotional release", "A beautiful ache", "Both—keep it unresolved"],
    },
    {
      id: "q-symbol-mode",
      decisionArea: "symbolism",
      question: "Should the recurring threshold imagery exist literally in the world, symbolically through framing, or in both forms?",
      whyItMatters: "This determines whether the film feels like grounded magical realism or a more subjective visual poem.",
      options: ["Literal objects and locations", "Symbolic framing only", "A blend of both"],
    },
    {
      id: "q-world-safety",
      decisionArea: "world",
      question: "How should the world feel before the emotional turn: protective, quietly unsettling, or actively hostile?",
      whyItMatters: "The starting atmosphere controls the contrast and intensity of the character's transformation.",
      options: ["Protective but closed", "Quietly unsettling", "Actively hostile"],
    },
  ],
  [
    {
      id: "q-recognition",
      decisionArea: "character",
      question: "Does the protagonist consciously understand the change as it happens, or should the audience recognize it first?",
      whyItMatters: "This changes performance direction, gaze, and whether the camera behaves as witness or extension of the character.",
      options: ["The character understands", "The audience understands first", "Recognition arrives together"],
    },
    {
      id: "q-tempo",
      decisionArea: "pacing",
      question: "Should the central encounter feel like a suspended breath or a sudden rupture in the film's rhythm?",
      whyItMatters: "It determines shot length, motion intensity, and the shape of the transition into the ending.",
      options: ["A suspended breath", "A sudden rupture", "A rupture followed by stillness"],
    },
    {
      id: "q-polish",
      decisionArea: "visual-language",
      question: "How visible should imperfection be in the finished world: dreamlike polish, tactile human texture, or a controlled progression between them?",
      whyItMatters: "The answer sets a consistency rule for surfaces, generated artifacts, grain, and lighting across every scene.",
      options: ["Dreamlike polish", "Tactile human texture", "Move from polish to texture"],
    },
  ],
];

export function demoQuestions(seed: number): { questions: ClarifyingQuestionValues[] } {
  return { questions: questionSets[seed % questionSets.length] };
}

