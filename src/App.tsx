import { useMemo, useState, type FormEvent } from "react";
import { storyInputSchema, type StoryInputValues } from "../shared/schemas";
import { requestAnalysis, requestQuestions } from "./lib/api";
import { useProjectStore } from "./store/projectStore";

const stages = ["Story", "DNA", "Scenes", "Images", "Motion", "Review"];

function Mark() {
  return (
    <div className="mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

function Arrow({ direction = "right" }: { direction?: "right" | "down" }) {
  return <span className={`arrow arrow-${direction}`} aria-hidden="true">→</span>;
}

function Header({ hasAnalysis, onStartOver }: { hasAnalysis: boolean; onStartOver: () => void }) {
  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="StoryDNA Studio home">
          <Mark />
          <span>StoryDNA</span>
          <em>Studio</em>
        </a>
        <div className="header-actions">
          <span className="autosave"><i /> Saved locally</span>
          {hasAnalysis && <button className="text-button" onClick={onStartOver}>New project</button>}
        </div>
      </header>
      <nav className="stage-nav" aria-label="Production stages">
        {stages.map((stage, index) => {
          const active = hasAnalysis ? index === 1 : index === 0;
          const complete = hasAnalysis && index === 0;
          return (
            <div className={`stage ${active ? "active" : ""} ${complete ? "complete" : ""}`} key={stage}>
              <span>{complete ? "✓" : String(index + 1).padStart(2, "0")}</span>
              {stage}
            </div>
          );
        })}
      </nav>
    </>
  );
}

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  wide?: boolean;
}

function Field({ label, hint, error, children, wide }: FieldProps) {
  return (
    <label className={`field ${wide ? "field-wide" : ""}`}>
      <span className="field-label">{label}</span>
      {hint && <span className="field-hint">{hint}</span>}
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

function StoryIntake({ onAnalyze }: { onAnalyze: (input: StoryInputValues) => Promise<void> }) {
  const { draft, updateDraft, loadDemoStory, status, error } = useProjectStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const busy = status === "analyzing" || status === "questioning";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = storyInputSchema.safeParse(draft);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    await onAnalyze(parsed.data);
  };

  return (
    <main id="top" className="intake-shell">
      <section className="intake-intro">
        <p className="eyebrow"><span>01</span> Story intake</p>
        <h1>Your story already has a <em>visual language.</em></h1>
        <p className="lede">Before we plan a single shot, let’s understand what you’re really trying to make people feel.</p>
        <div className="promise">
          <span className="promise-line" />
          <p>Keep your voice.<br /><strong>Lose the production chaos.</strong></p>
        </div>
        <button type="button" className="sample-button" onClick={loadDemoStory} disabled={busy}>
          <span>✦</span> Load the demo poem
        </button>
        <aside className="director-note">
          <p>From the director’s notebook</p>
          <blockquote>“The first question isn’t what should we generate? It’s what must the audience carry home?”</blockquote>
        </aside>
      </section>

      <form className="story-form" onSubmit={submit} noValidate>
        <div className="form-heading">
          <div><span>New project</span><h2>Give me the raw material.</h2></div>
          <span className="step-pill">Step 1 of 6</span>
        </div>
        <div className="form-grid">
          <Field label="Project title" error={errors.title}>
            <input value={draft.title} onChange={(e) => updateDraft("title", e.target.value)} placeholder="The House That Kept the Dawn" />
          </Field>
          <Field label="Source type">
            <select value={draft.sourceType} onChange={(e) => updateDraft("sourceType", e.target.value as StoryInputValues["sourceType"])}>
              <option value="poem">Poem</option><option value="script">Script</option><option value="lyrics">Lyrics</option><option value="story">Story</option><option value="concept">Rough concept</option>
            </select>
          </Field>
          <Field label="Source material" hint={`${draft.sourceText.length.toLocaleString()} / 30,000`} error={errors.sourceText} wide>
            <textarea className="source-text" value={draft.sourceText} onChange={(e) => updateDraft("sourceText", e.target.value)} placeholder="Paste the poem, script, lyrics, story, or rough concept. Keep it unpolished—this is where we listen." />
          </Field>
          <Field label="Desired visual vibe" error={errors.visualVibe} wide>
            <input value={draft.visualVibe} onChange={(e) => updateDraft("visualVibe", e.target.value)} placeholder="e.g. intimate 35mm, celestial surrealism, quiet magical realism" />
          </Field>
          <Field label="Character direction" hint="Optional" wide>
            <textarea value={draft.characterDescription} onChange={(e) => updateDraft("characterDescription", e.target.value)} placeholder="Appearance, energy, wardrobe, or what must stay visually consistent…" />
          </Field>
          <Field label="Aspect ratio">
            <select value={draft.aspectRatio} onChange={(e) => updateDraft("aspectRatio", e.target.value as StoryInputValues["aspectRatio"])}>
              <option>16:9</option><option>9:16</option><option>1:1</option><option>4:5</option><option>2.39:1</option>
            </select>
          </Field>
          <Field label="Target runtime">
            <div className="runtime-input"><input type="number" min="10" max="600" value={draft.targetRuntimeSeconds} onChange={(e) => updateDraft("targetRuntimeSeconds", Number(e.target.value))} /><span>seconds</span></div>
          </Field>
          <Field label="Preferred tools" hint="Optional" wide>
            <input value={draft.preferredTools} onChange={(e) => updateDraft("preferredTools", e.target.value)} placeholder="Runway, Kling, Veo, Midjourney, CapCut…" />
          </Field>
        </div>
        {error && <div className="error-banner" role="alert"><strong>The reading paused.</strong> {error}</div>}
        <div className="form-footer">
          <p><span>✦</span> We’ll interpret first. No scenes will be generated yet.</p>
          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? "Reading your story…" : "Analyze my story"}<Arrow />
          </button>
        </div>
      </form>
    </main>
  );
}

function LoadingDirector({ message, phase }: { message: string; phase: string }) {
  return (
    <main className="loading-stage" aria-live="polite">
      <div className="orb"><span /><span /><span /></div>
      <p className="eyebrow">The creative director is listening</p>
      <h1>{phase}</h1>
      <p>{message}</p>
      <div className="loading-track"><i /></div>
      <small>Original language stays untouched. Interpretation remains yours to correct.</small>
    </main>
  );
}

function AnalysisHeader() {
  const { draft, meta } = useProjectStore();
  return (
    <div className="dna-title-row">
      <div>
        <p className="eyebrow"><span>02</span> StoryDNA reading</p>
        <h1>I think this story is really about <em>what remains.</em></h1>
        <p>Here’s my reading of <strong>{draft.title}</strong>. This is an interpretation—not a verdict.</p>
      </div>
      <div className="reading-meta">
        {meta?.demoMode && <span className="demo-badge">✦ Guided demo mode</span>}
        <span>{draft.sourceType} · {draft.targetRuntimeSeconds}s · {draft.aspectRatio}</span>
      </div>
    </div>
  );
}

function AnalysisView() {
  const { analysis } = useProjectStore();
  if (!analysis) return null;
  return (
    <section className="analysis-section" aria-labelledby="analysis-heading">
      <div className="section-kicker"><span>Our reading</span><i /></div>
      <div className="truth-card">
        <span>Core emotional truth</span>
        <h2 id="analysis-heading">{analysis.coreEmotionalTruth}</h2>
        <p><strong>What the audience should carry:</strong> {analysis.intendedAudienceFeeling}</p>
      </div>
      <div className="arc-card">
        <div className="arc-state"><span>Beginning</span><p>{analysis.beginningEmotionalState}</p></div>
        <div className="arc-line"><i /><b>Emotional arc</b><i /></div>
        <div className="arc-state"><span>Ending</span><p>{analysis.endingEmotionalState}</p></div>
        <blockquote>{analysis.emotionalArc}</blockquote>
      </div>
      <div className="analysis-grid">
        <article className="analysis-card themes">
          <span className="card-number">01</span><p className="card-label">Main themes</p>
          <div className="theme-list">{analysis.mainThemes.map((theme) => <span key={theme}>{theme}</span>)}</div>
        </article>
        <article className="analysis-card visual">
          <span className="card-number">02</span><p className="card-label">Visual language</p>
          <p>{analysis.visualLanguage}</p>
        </article>
        <article className="analysis-card sensory">
          <span className="card-number">03</span><p className="card-label">Sensory direction</p>
          {Object.entries(analysis.sensoryDirection).map(([key, value]) => <div key={key}><span>{key}</span><p>{value}</p></div>)}
        </article>
        <article className="analysis-card symbols">
          <span className="card-number">04</span><p className="card-label">Symbols & motifs</p>
          {analysis.symbolsAndMotifs.map((motif) => <div className="motif" key={motif.symbol}><h3>{motif.symbol}</h3><p>{motif.possibleMeaning}</p><small>{motif.visualOpportunity}</small></div>)}
        </article>
        <article className="analysis-card character">
          <span className="card-number">05</span><p className="card-label">Character transformation</p>
          <p>{analysis.characterTransformation}</p>
        </article>
        <article className="analysis-card risks">
          <span className="card-number">06</span><p className="card-label">Interpretation risks</p>
          <ul>{analysis.interpretationRisks.map((risk) => <li key={risk}>{risk}</li>)}</ul>
          <div className="scene-estimate"><strong>{String(analysis.initialEstimatedSceneCount).padStart(2, "0")}</strong><span>initial scenes<br />estimated</span></div>
        </article>
      </div>
    </section>
  );
}

function QuestionsView({ onRegenerate }: { onRegenerate: () => Promise<void> }) {
  const { questions, answers, setAnswer, userCorrection, setUserCorrection, extraContext, setExtraContext, status } = useProjectStore();
  const [showContext, setShowContext] = useState(false);
  const busy = status === "questioning";
  if (questions.length !== 3) return null;

  return (
    <section className="questions-section">
      <div className="questions-heading">
        <div><p className="eyebrow"><span>03</span> Before we direct</p><h2>Three choices will define the film.</h2><p>Your answers become protected creative decisions—not disposable chat.</p></div>
        <button className="secondary-button" disabled={busy} onClick={onRegenerate}>↻ Ask a different three</button>
      </div>
      <div className="question-list">
        {questions.map((question, index) => (
          <article className="question-card" key={question.id}>
            <div className="question-index">0{index + 1}</div>
            <div className="question-content">
              <span>{question.decisionArea}</span>
              <h3>{question.question}</h3>
              <p>{question.whyItMatters}</p>
              <div className="option-row">
                {question.options.map((option) => <button type="button" className={answers[question.id] === option ? "selected" : ""} onClick={() => setAnswer(question.id, option)} key={option}>{option}</button>)}
              </div>
              <textarea aria-label={`Your answer to question ${index + 1}`} value={answers[question.id] || ""} onChange={(e) => setAnswer(question.id, e.target.value)} placeholder="Or answer in your own words…" />
            </div>
          </article>
        ))}
      </div>
      <div className="context-panel">
        <button type="button" className="context-toggle" onClick={() => setShowContext(!showContext)} aria-expanded={showContext}>
          <span><b>Something in the reading feels off?</b><small>Correct the interpretation or add context before the creative brief.</small></span><Arrow direction="down" />
        </button>
        {showContext && <div className="context-fields">
          <Field label="Correction to the StoryDNA interpretation"><textarea value={userCorrection} onChange={(e) => setUserCorrection(e.target.value)} placeholder="The house isn't a memory—it represents the future she was afraid to choose…" /></Field>
          <Field label="Extra creative context"><textarea value={extraContext} onChange={(e) => setExtraContext(e.target.value)} placeholder="A personal reference, non-negotiable image, cultural context, or constraint…" /></Field>
        </div>}
      </div>
      <div className="next-stage-preview">
        <div><span>Next</span><h3>Confirm the creative brief</h3><p>Your answers will be distilled into an editable north star before any scenes are made.</p></div>
        <button className="primary-button" disabled title="Included in the next verified milestone">Build creative brief <Arrow /></button>
      </div>
    </section>
  );
}

function DNAWorkspace({ onRegenerate }: { onRegenerate: () => Promise<void> }) {
  return (
    <main className="dna-shell">
      <AnalysisHeader />
      <AnalysisView />
      <QuestionsView onRegenerate={onRegenerate} />
    </main>
  );
}

export default function App() {
  const store = useProjectStore();
  const hasAnalysis = Boolean(store.analysis);
  const loading = store.status === "analyzing" || store.status === "questioning";
  const loadingPhase = useMemo(() => store.status === "questioning" ? "Finding the creative forks." : "Reading beneath the words.", [store.status]);

  const runQuestions = async (input: StoryInputValues, analysis = store.analysis, seed = store.variationSeed) => {
    if (!analysis) return;
    store.beginQuestions();
    try {
      const result = await requestQuestions(input, analysis, store.userCorrection, store.extraContext, seed);
      store.setQuestions(result.data.questions, result.meta);
    } catch (error) {
      store.fail(error instanceof Error ? error.message : "Question generation failed.");
    }
  };

  const analyze = async (input: StoryInputValues) => {
    store.beginAnalysis();
    try {
      const result = await requestAnalysis(input);
      store.setAnalysis(result.data, result.meta);
      await runQuestions(input, result.data, 0);
    } catch (error) {
      store.fail(error instanceof Error ? error.message : "Story analysis failed.");
    }
  };

  const regenerate = async () => {
    const seed = store.nextVariation();
    await runQuestions(store.draft, store.analysis, seed);
  };

  return (
    <div className="app-frame">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <Header hasAnalysis={hasAnalysis} onStartOver={store.startOver} />
      {loading ? <LoadingDirector message={store.statusMessage} phase={loadingPhase} /> : hasAnalysis ? <DNAWorkspace onRegenerate={regenerate} /> : <StoryIntake onAnalyze={analyze} />}
      <footer><Mark /><p>StoryDNA Studio <span>·</span> An attentive creative director for AI filmmakers.</p><small>Built for OpenAI Build Week</small></footer>
    </div>
  );
}

