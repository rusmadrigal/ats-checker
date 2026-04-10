import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { resolveOpenAiModelId } from './openai-model';

export class AiRescoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiRescoreError';
  }
}

const score0to100 = z.coerce
  .number()
  .transform((n) => Math.round(Math.min(100, Math.max(0, Number.isFinite(n) ? n : 0))));

export const aiRescoreResultSchema = z.object({
  score: score0to100.describe('ATS overall score 0-100'),
  delta: z.coerce
    .number()
    .transform((n) => Math.round(Number.isFinite(n) ? n : 0))
    .describe('Change vs previous score; positive if improved, negative if worse'),
  readability: score0to100,
  keywords: score0to100,
  formatting: score0to100,
  experience: score0to100.describe('Experience clarity score'),
  issues: z
    .array(z.string())
    .describe(
      'Problemas concretos del CV; cada string en español latinoamericano (es-419), breve y accionable',
    ),
  warnings: z
    .array(z.string())
    .describe(
      'Advertencias ATS (menos graves que issues pero visibles); es-419, breves',
    )
    .default([]),
  strengths: z
    .array(z.string())
    .describe('Fortalezas detectadas en esta versión; es-419, breves')
    .default([]),
  improvements: z
    .array(z.string())
    .describe(
      'Mejoras o fortalezas vs la versión anterior; cada string en español latinoamericano (es-419), breve',
    ),
});

export type AiRescoreResult = z.infer<typeof aiRescoreResultSchema>;

const SYSTEM = `You are an ATS resume scoring engine. Be extremely sensitive: tiny omissions must move the score and must appear in issues[], warnings[], or sub-scores.

Analyze the resume and return structured scores and lists.

Sensitivity guide (apply proportionally; use Spanish text in lists):
- Candidate name missing or placeholder → large penalty (on the order of ~15–25 points vs a complete CV) and a clear issue.
- Contact incomplete (no usable email, no phone/LinkedIn when the profile is not junior) → strong penalty (~10–20 points) and issues; never invent contact data for the user.
- Experience section empty, a role removed, or company/title stripped → strong penalty (~15–30 points) and issues.
- Bullets removed or reduced to vague one-liners → moderate penalty (~5–15 points) and issues/warnings.
- Skills gutted or irrelevant → moderate penalty.
- Summary/profile missing, too short, or generic → moderate penalty (~3–10 points).
- Missing measurable metrics where the role would expect them → warnings and lower "experience" sub-score.
- Missing role keywords vs stated target → lower "keywords" sub-score.

Rules:
- Every edit the user could make (name, title, summary, bullets, skills, education, contact) must be reflected in score and/or issues/warnings when it hurts ATS readiness.
- Small edits should nudge the overall score; removing critical blocks must drop it sharply.
- Removing important info lowers the score; adding relevant keywords usually raises it.
- Missing contact lowers the score. In issues[], say the user must add their own real contact data; never imply a phone/URL will be auto-generated.
- Weak or missing summary/profile lowers the score when the rest of the resume is long.
- Strong, quantified achievements (metrics, %) increase the score.
- Sub-scores (readability, keywords, formatting, experience) must move with edits and stay consistent with the overall score (can differ by a few points).

DETAIL AND QA (strict — flag real problems in issues[], in Latin American Spanish):
- Name / header: missing name, only placeholders ("Tu nombre", "John Doe" template), obvious spelling mistakes in how the person wrote their own name, inconsistent name vs signature elsewhere, ALL-CAPS name abuse.
- Contact: invalid or incomplete email, missing @, fake domains, missing phone/LinkedIn when the profile is senior/long. Wording example style: "Falta un canal de contacto directo (teléfono, LinkedIn o web): agrégalo tú en el CV; no se inventan datos personales."
- Title / headline: empty with long experience, grammar errors, meaningless buzzwords only.
- Summary: empty, too short, no value proposition, wrong language mix.
- Experience: unclear dates, bullet points without outcomes, tense inconsistency, duplicate roles, gaps you can infer from text.
- Skills: empty for technical roles, keyword stuffing, no alignment with stated roles.
- Education / languages: missing where expected, inconsistent with experience level.
- Formatting signals in plain text: huge walls of text, broken section headers, lists that look pasted wrong.
Each issue string = one concrete problem, actionable, max ~120 characters when reasonable.

- LANGUAGE (mandatory): Every entry in the issues array and every entry in the improvements array MUST be written in Latin American Spanish (es-419): clear, professional HR tone for the region. Never use English for those list items, even if the resume body is in English. You may still evaluate resumes in any language.
- improvements: brief notes on what improved in this version vs the implied previous state (same language rule: es-419 only).
- warnings: softer ATS risks (e.g. few metrics, thin keywords) in es-419.
- strengths: what still works well in es-419 (can be empty if the CV is very weak).
- delta: change from previousScore when provided (negative if worse, positive if better); magnitude should match how sensitive the engine is.

Return only data that matches the schema.`;

export async function rescoreResumeWithAi(input: {
  resumeText: string;
  previousScore?: number;
  sectionsOutline?: string;
}): Promise<AiRescoreResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new AiRescoreError(
      'OPENAI_API_KEY no está configurada en el servidor. La puntuación en vivo usará el análisis local.',
    );
  }

  const openai = createOpenAI({ apiKey });
  const modelId = resolveOpenAiModelId();

  const prev =
    typeof input.previousScore === 'number' && Number.isFinite(input.previousScore)
      ? `Previous ATS score (reference): ${Math.round(input.previousScore)}`
      : 'No previous score; estimate delta vs a typical mid-quality resume.';

  const outline = input.sectionsOutline?.trim()
    ? `Section outline (reference):\n${input.sectionsOutline.slice(0, 1800)}`
    : '';

  const { object } = await generateObject({
    model: openai(modelId),
    schema: aiRescoreResultSchema,
    system: SYSTEM,
    prompt: `Full resume text (plain):
---
${input.resumeText.slice(0, 26000)}
---

${prev}

${outline}

Recuerda: "issues" e "improvements" solo en español latinoamericano (es-419), nunca en inglés.

Produce scores, issues, improvements, and delta.`,
  });

  return {
    score: Math.round(Math.min(100, Math.max(0, object.score))),
    delta: object.delta,
    readability: Math.round(Math.min(100, Math.max(0, object.readability))),
    keywords: Math.round(Math.min(100, Math.max(0, object.keywords))),
    formatting: Math.round(Math.min(100, Math.max(0, object.formatting))),
    experience: Math.round(Math.min(100, Math.max(0, object.experience))),
    issues: object.issues.map((s) => s.trim()).filter(Boolean),
    warnings: (object.warnings ?? []).map((s) => s.trim()).filter(Boolean),
    strengths: (object.strengths ?? []).map((s) => s.trim()).filter(Boolean),
    improvements: object.improvements.map((s) => s.trim()).filter(Boolean),
  };
}
