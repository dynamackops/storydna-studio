const base = "http://127.0.0.1:4173";
const input = {
  title: "The House That Kept the Dawn",
  sourceType: "poem",
  sourceText: "Every morning the old house caught the dawn in its windows, but no one lived there to see it. I carried a rusted key through fields of silver grass.",
  visualVibe: "quiet magical realism, tactile 35mm",
  characterDescription: "A solitary woman in a charcoal coat.",
  aspectRatio: "16:9",
  targetRuntimeSeconds: 60,
  preferredTools: "Kling",
};

async function post(path, body) {
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(`${path}: ${response.status} ${JSON.stringify(json)}`);
  return json;
}

const analysis = await post("/api/story/analyze", input);
if (!analysis.data.coreEmotionalTruth || analysis.meta.demoMode !== true) {
  throw new Error("Analysis response did not include expected demo data.");
}

const questions = await post("/api/story/questions", {
  input,
  analysis: analysis.data,
  userCorrection: "",
  extraContext: "",
  variationSeed: 0,
});
if (questions.data.questions.length !== 3) {
  throw new Error(`Expected exactly 3 questions, received ${questions.data.questions.length}.`);
}

const invalid = await fetch(`${base}/api/story/analyze`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ title: "x" }),
});
if (invalid.status !== 400) throw new Error(`Expected invalid input to return 400, received ${invalid.status}.`);

console.log(JSON.stringify({
  analysis: "valid",
  questions: questions.data.questions.length,
  invalidInputStatus: invalid.status,
  mode: analysis.meta.demoMode ? "guided-demo" : "openai",
}, null, 2));

