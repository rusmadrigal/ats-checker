import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { AnalysisIssue, AnalysisSuggestion } from './analysis-types';
import { openAiFailureUserMessage, resolveOpenAiModelId } from './openai-model';

const improvedSchema = z.object({
  improvedText: z
    .string()
    .min(40)
    .describe(
      'Currículum completo en texto plano, en el MISMO idioma que el CV de entrada (sin traducir), con saltos de línea entre bloques.',
    ),
});

export class AiImprovementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiImprovementError';
  }
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
  const modelId = resolveOpenAiModelId();

  try {
    const { object } = await generateObject({
      model: openai(modelId),
      schema: improvedSchema,
      system: `Eres un redactor experto en currículums compatibles con sistemas ATS (Applicant Tracking Systems).
Devuelves solo improvedText: el CV entero en texto plano, listo para pegar en Word.
IDIOMA (obligatorio): el resultado debe estar en el mismo idioma que el CV de entrada. Si el CV está en inglés, escribe en inglés; si está en español, en español; si es mixto, mantén cada bloque en el idioma en que esté redactado el original, sin traducir de un idioma a otro.
Mantén un orden lógico: contacto, resumen o perfil (si encaja), experiencia, educación, habilidades.
Usa viñetas con guiones donde ayude. Incluye cifras y verbos de acción cuando sea razonable.
No inventes empleos ni titulaciones que no puedan inferirse del texto de entrada; puedes reformular y clarificar.
Atención al detalle: si el nombre u otros datos de contacto están vacíos, con marcadores tipo "Tu nombre" o con errores ortográficos evidentes en nombres propios, corrige solo lo que sea claramente un error tipográfico sin cambiar la identidad de la persona; si falta el nombre por completo, no inventes uno.`,
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
  } catch (e) {
    throw new AiImprovementError(openAiFailureUserMessage(e, modelId));
  }
}
