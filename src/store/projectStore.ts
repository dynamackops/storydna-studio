import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ClarifyingQuestionValues,
  StoryAnalysisValues,
  StoryInputValues,
} from "../../shared/schemas";

export type WorkflowStatus = "idle" | "analyzing" | "questioning" | "ready" | "error";

export const blankStory: StoryInputValues = {
  title: "",
  sourceType: "poem",
  sourceText: "",
  visualVibe: "",
  characterDescription: "",
  aspectRatio: "16:9",
  targetRuntimeSeconds: 60,
  preferredTools: "",
};

export const demoStory: StoryInputValues = {
  title: "The House That Kept the Dawn",
  sourceType: "poem",
  sourceText:
    "Every morning the old house caught the dawn in its windows, but no one lived there to see it. I carried a rusted key through fields of silver grass. At the door, I heard my younger voice on the other side, naming all the things I had taught myself to forget. When I turned the key, the house opened into sky—and the light did not forgive me. It simply stayed.",
  visualVibe: "quiet magical realism, tactile 35mm, intimate and celestial",
  characterDescription:
    "A solitary woman in her early thirties, dark wavy hair, weathered charcoal coat, guarded posture that gradually softens.",
  aspectRatio: "16:9",
  targetRuntimeSeconds: 60,
  preferredTools: "Midjourney, Kling, CapCut",
};

interface OperationMeta {
  demoMode: boolean;
  model: string;
  generatedAt: string;
}

interface ProjectState {
  draft: StoryInputValues;
  analysis?: StoryAnalysisValues;
  questions: ClarifyingQuestionValues[];
  answers: Record<string, string>;
  userCorrection: string;
  extraContext: string;
  variationSeed: number;
  status: WorkflowStatus;
  statusMessage: string;
  error?: string;
  meta?: OperationMeta;
  updateDraft: <K extends keyof StoryInputValues>(key: K, value: StoryInputValues[K]) => void;
  loadDemoStory: () => void;
  beginAnalysis: () => void;
  setAnalysis: (analysis: StoryAnalysisValues, meta: OperationMeta) => void;
  beginQuestions: () => void;
  setQuestions: (questions: ClarifyingQuestionValues[], meta: OperationMeta) => void;
  setAnswer: (id: string, answer: string) => void;
  setUserCorrection: (value: string) => void;
  setExtraContext: (value: string) => void;
  nextVariation: () => number;
  fail: (message: string) => void;
  startOver: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      draft: blankStory,
      questions: [],
      answers: {},
      userCorrection: "",
      extraContext: "",
      variationSeed: 0,
      status: "idle",
      statusMessage: "",
      updateDraft: (key, value) =>
        set((state) => ({
          draft: { ...state.draft, [key]: value },
          analysis: undefined,
          questions: [],
          answers: {},
          status: "idle",
          error: undefined,
          meta: undefined,
        })),
      loadDemoStory: () =>
        set({
          draft: demoStory,
          analysis: undefined,
          questions: [],
          answers: {},
          status: "idle",
          error: undefined,
          meta: undefined,
        }),
      beginAnalysis: () =>
        set({
          analysis: undefined,
          questions: [],
          answers: {},
          status: "analyzing",
          statusMessage: "Reading for emotional truth, symbols, and the shape of change…",
          error: undefined,
        }),
      setAnalysis: (analysis, meta) => set({ analysis, meta }),
      beginQuestions: () =>
        set({
          status: "questioning",
          statusMessage: "Finding the three decisions that will change the film most…",
          error: undefined,
        }),
      setQuestions: (questions, meta) =>
        set({ questions, meta, status: "ready", statusMessage: "", error: undefined }),
      setAnswer: (id, answer) =>
        set((state) => ({ answers: { ...state.answers, [id]: answer } })),
      setUserCorrection: (userCorrection) => set({ userCorrection }),
      setExtraContext: (extraContext) => set({ extraContext }),
      nextVariation: () => {
        const value = get().variationSeed + 1;
        set({ variationSeed: value });
        return value;
      },
      fail: (error) => set({ status: "error", statusMessage: "", error }),
      startOver: () =>
        set({
          draft: blankStory,
          analysis: undefined,
          questions: [],
          answers: {},
          userCorrection: "",
          extraContext: "",
          variationSeed: 0,
          status: "idle",
          statusMessage: "",
          error: undefined,
          meta: undefined,
        }),
    }),
    {
      name: "storydna-active-project-v1",
      partialize: (state) => ({
        draft: state.draft,
        analysis: state.analysis,
        questions: state.questions,
        answers: state.answers,
        userCorrection: state.userCorrection,
        extraContext: state.extraContext,
        variationSeed: state.variationSeed,
        status: state.status === "analyzing" || state.status === "questioning" ? "idle" : state.status,
        meta: state.meta,
      }),
    },
  ),
);

