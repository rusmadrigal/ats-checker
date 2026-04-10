'use client';

import { motion } from 'motion/react';
import { ImprovementCard, type ImprovementItem } from './ImprovementCard';
import type { AnalysisSuggestion } from '@/src/lib/analysis-types';

function inferTitle(original: string, improved: string, index: number): string {
  const o = original.toLowerCase();
  if (o.includes('email') || o.includes('encabezado') || o.includes('[encabezado')) {
    return 'Contacto y presentación';
  }
  if (improved.length > original.length * 1.2 && original.length < 120) {
    return 'Refuerzo de logros';
  }
  if (o.includes('responsable') || o.includes('área')) {
    return 'Impacto y resultados';
  }
  return `Mejora ${index + 1}`;
}

function buildItems(suggestions: AnalysisSuggestion[]): ImprovementItem[] {
  return suggestions.map((s, i) => ({
    id: `s-${i}`,
    title: inferTitle(s.original, s.improved, i),
    description:
      'Propuesta de redacción más clara para parsers ATS y reclutadores. Revisa y adapta cifras y contexto a tu caso.',
    before: s.original,
    after: s.improved,
  }));
}

type AISuggestionsPanelProps = {
  suggestions: AnalysisSuggestion[];
  title: string;
  labels: {
    before: string;
    after: string;
    apply: string;
    applied: string;
  };
  onApplyCopy: (text: string) => void;
  /** Consejos breves de la IA según la vista previa actual (ATS en vivo). */
  liveAiTips?: string[];
  liveAiTitle?: string;
};

export function AISuggestionsPanel({
  suggestions,
  title,
  labels,
  onApplyCopy,
  liveAiTips = [],
  liveAiTitle = 'Actualización en vivo (ATS)',
}: AISuggestionsPanelProps) {
  const items = buildItems(suggestions);
  const tips = liveAiTips.map((s) => s.trim()).filter(Boolean);
  if (items.length === 0 && tips.length === 0) return null;

  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2"
      >
        <span className="bg-primary/12 text-primary rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
          AI
        </span>
        <h3 className="text-foreground text-sm font-semibold tracking-tight">{title}</h3>
      </motion.div>
      {items.length > 0 ? (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <ImprovementCard
              key={item.id}
              item={item}
              labels={labels}
              onApply={() => onApplyCopy(item.after)}
            />
          ))}
        </div>
      ) : null}
      {tips.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="border-border/70 bg-muted/20 rounded-xl border px-4 py-3"
        >
          <p className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-wide uppercase">
            {liveAiTitle}
          </p>
          <ul className="space-y-2">
            {tips.map((line, i) => (
              <li
                key={`${i}-${line.slice(0, 48)}`}
                className="text-foreground flex gap-2 text-xs leading-relaxed"
              >
                <span className="text-emerald-600 mt-0.5 shrink-0 font-bold" aria-hidden>
                  •
                </span>
                <span className="min-w-0 flex-1">{line}</span>
                <button
                  type="button"
                  onClick={() => onApplyCopy(line)}
                  className="text-primary hover:text-primary/80 shrink-0 text-[10px] font-semibold underline-offset-2 hover:underline"
                >
                  {labels.apply}
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
      ) : null}
    </div>
  );
}
