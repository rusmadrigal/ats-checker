import type { AnalysisIssue } from './analysis-types';

export type AtsInsightMetrics = {
  readability: number;
  keywords: number;
  formatting: number;
  experienceClarity: number;
};

function clamp(n: number): number {
  return Math.max(36, Math.min(100, Math.round(n)));
}

/**
 * Métricas derivadas de forma determinista a partir del score global y los issues del análisis heurístico.
 * No sustituye un motor ATS real; sirve para visualización en dashboard.
 */
export function deriveAtsInsights(score: number, issues: AnalysisIssue[]): AtsInsightMetrics {
  let readability = score;
  let keywords = score;
  let formatting = score;
  let experienceClarity = score;

  for (const issue of issues) {
    const text = issue.text.toLowerCase();
    const pen = issue.type === 'error' ? 11 : 6;

    if (
      /palabra|keyword|métric|cuantif|cifra|clave/i.test(text)
    ) {
      keywords -= pen;
    }
    if (
      /formato|mayúscul|tabular|columna|pdf|docx|tabla/i.test(text)
    ) {
      formatting -= pen;
    }
    if (/línea|bloque|lectura|largo|líneas/i.test(text)) {
      readability -= pen * 0.85;
    }
    if (/email|encabezado|contacto|fecha|cabecera/i.test(text)) {
      experienceClarity -= pen;
    }
  }

  return {
    readability: clamp(readability),
    keywords: clamp(keywords),
    formatting: clamp(formatting),
    experienceClarity: clamp(experienceClarity),
  };
}
