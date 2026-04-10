import type { AnalysisSuggestion } from './analysis-types';

function isPlaceholderOriginal(original: string): boolean {
  const t = original.trim();
  return t.startsWith('[') && t.endsWith(']');
}

/**
 * Aplica sustituciones sugeridas sobre el texto extraído.
 * Los "originales" entre corchetes (p. ej. plantillas) se anteponen al documento.
 */
export function mergeImprovedText(rawText: string, suggestions: AnalysisSuggestion[]): string {
  const prepends: string[] = [];
  let body = rawText.trim();
  const sorted = [...suggestions].sort((a, b) => b.original.length - a.original.length);

  for (const { original, improved } of sorted) {
    const o = original.trim();
    const imp = improved.trim();
    if (!o || !imp) continue;
    if (isPlaceholderOriginal(o)) {
      prepends.push(imp);
      continue;
    }
    if (body.includes(o)) {
      body = body.replace(o, imp);
    }
  }

  if (prepends.length === 0) return body;
  return `${prepends.join('\n\n')}\n\n---\n\n${body}`;
}
