# StoryDNA Studio — Build Notes

Running log for product decisions, scope cuts, bugs, verification, and submission-ready Codex contributions.

## 2026-07-18 — Kickoff and repository audit

### Decisions made

- Treat the workspace as greenfield: it contained no files, package metadata, Git repository, or local agent instructions.
- Use one React/Vite/TypeScript repository with a thin server-only API boundary.
- Keep `OPENAI_MODEL` configurable and document `gpt-5.6` as the example after confirming the official model listing.
- Use the Responses API with Structured Outputs and shared Zod validation.
- Keep the OpenAI API key server-only.
- Provide a clearly labeled deterministic demo mode when no key is configured, so the hackathon walkthrough remains reliable.
- Use Zustand local persistence for one active project.
- Use hand-authored design tokens/CSS in the initial slice to avoid introducing a utility layer before components stabilize.

### Features cut or deferred

- Authentication, Supabase, uploads, motion, estimates, Director's Commentary, exports, and deployment are deferred until the day-one creation loop works.
- The first implementation stops after StoryDNA analysis and exactly three clarification questions.

### Bugs encountered

- The official OpenAI Docs MCP connector was not installed. It was installed successfully, but newly installed MCP tools require a new Codex session; current model guidance was therefore checked through the skill's official-domain web fallback.
- The direct latest-model Markdown fetch returned an upstream fetch error; the official model catalog search result supplied the current model ID and capability confirmation.

### Verification results

- Repository audit: complete; empty workspace confirmed.
- Official model documentation: `gpt-5.6` alias and Responses API/Structured Outputs support confirmed on 2026-07-18.
- TypeScript typecheck: passed.
- Focused unit/contract tests: 4 passed across 2 test files.
- Production Vite build: passed (102 modules transformed).
- Live API smoke: analysis schema valid; exactly 3 questions; invalid input returns HTTP 400; guided-demo mode confirmed.
- Interactive browser: full intake → analysis → questions workflow passed.
- Question regeneration: replaced only the three-question set while preserving the existing analysis.
- Local persistence: selected answer restored after reload and all three question cards remained present.
- Responsive check: 390×844 viewport had no horizontal body overflow; analysis collapsed to one column; question cards used the intended compact two-column layout; stage navigation remained horizontally scrollable.
- Browser console: no warnings or errors.

### Codex contributions useful for Devpost

- Converted an expansive product vision into a staged, testable scope with explicit release gates.
- Designed a provenance-aware AI architecture that keeps source, interpretation, corrections, and approved decisions separate.
- Added a demo-resilient architecture that protects API credentials and still supports reliable judging without production infrastructure.
- Delivered a polished cinematic interface and complete first vertical slice with observable AI-operation state, correction affordances, and protected creator decisions.

### Bugs encountered during implementation

- Initial local server startup was blocked by the managed sandbox's socket policy; starting the same scoped `npm run dev` command with approval resolved it.
- TypeScript initially lacked Vite's CSS side-effect import declarations. Adding `src/vite-env.d.ts` fixed both typecheck and build.
- The browser's screenshot command timed out, so responsive verification used live DOM/accessibility inspection and computed layout measurements instead. Functional browser verification was unaffected.

