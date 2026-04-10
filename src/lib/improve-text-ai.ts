import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { AnalysisIssue, AnalysisSuggestion } from './analysis-types';

const improvedSchema = z.object({
  improvedText: z
    .string()
    .min(40)
    .describe('Currículum completo en texto plano, español, con saltos de línea entre bloques.'),
});

export class AiImprovementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiImprovementError';
  }
}

function resolveModelId(): string {
  return process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';
}

export async function improveCvTextWithAi(input: {
  extractedText: string;
  issues: AnalysisIssue[];
  suggestions: AnalysisSuggestion[];
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new AiImprovementError(
      'OPENAI_API_KEY no está configurada en el servidor. Desactiva la opción de IA o añade la variable de entorno.',
    );
  }

  const openai = createOpenAI({ apiKey });
  const modelId = resolveModelId();

  const { object } = await generateObject({
    model: openai(modelId),
    schema: improvedSchema,
    system: `Eres un redactor experto en currículums compatibles con sistemas ATS (Applicant Tracking Systems).
Devuelves solo el campo improvedText: el CV entero en texto plano, en español, listo para pegar en Word.
Mantén un orden lógico: contacto, resumen o perfil (si encaja), experiencia, educación, habilidades.
Usa viñetas con guiones donde ayude. Incluye cifras y verbos de acción cuando sea razonable.
No inventes empleos ni titulaciones que no puedan inferirse del texto de entrada; puedes reformular y clarificar.`,
    prompt: `Texto extraído del CV del usuario:
---
${input.extractedText.slice(0, 24000)}
---

Problemas detectados (referencia):
${JSON.stringify(input.issues, null, 2)}

Sugerencias puntuales (referencia):
${JSON.stringify(input.suggestions, null, 2)}

Reescribe el CV completo aplicando las mejoras. Conserva datos reales del texto original.`,
  });

  return object.improvedText.trim();
}
