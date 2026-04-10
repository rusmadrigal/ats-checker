'use client';

import { motion } from 'motion/react';
import { BookOpen, Briefcase, Hash, LayoutList, Loader2 } from 'lucide-react';
import { ScoreCircle } from './ScoreCircle';
import type { AtsInsightMetrics } from '@/src/lib/ats-score-insights';
import { cn } from './ui/utils';

type ATSScoreCardProps = {
  score: number;
  metrics: AtsInsightMetrics;
  labels: {
    title: string;
    readability: string;
    keywords: string;
    formatting: string;
    experience: string;
  };
  /** Change vs previous AI score (e.g. +3 / -2). */
  scoreDelta?: number | null;
  isUpdating?: boolean;
  improvementHints?: string[];
  improvementHintsTitle?: string;
};

function MetricRow({
  icon: Icon,
  label,
  value,
  delay,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number;
  delay: number;
}) {
  const hue = value >= 75 ? 'bg-emerald-500' : value >= 55 ? 'bg-amber-500' : 'bg-orange-500';
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay }}
      className="border-border/50 bg-background/50 flex min-w-[140px] flex-1 flex-col gap-2 rounded-xl border px-3 py-3 sm:min-w-[160px]"
    >
      <div className="flex items-center gap-2">
        <span className="bg-muted/80 text-muted-foreground flex h-8 w-8 items-center justify-center rounded-lg">
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="text-foreground text-xs font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
          <motion.div
            className={cn('h-full rounded-full transition-all duration-500', hue)}
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.55, delay: delay + 0.05, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <span className="text-muted-foreground w-8 text-right text-xs font-semibold tabular-nums transition-all duration-500">
          {value}
        </span>
      </div>
    </motion.div>
  );
}

export function ATSScoreCard({
  score,
  metrics,
  labels,
  scoreDelta = null,
  isUpdating = false,
  improvementHints,
  improvementHintsTitle = 'Mejoras detectadas',
}: ATSScoreCardProps) {
  const showDelta = scoreDelta !== null && scoreDelta !== 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={cn(
        'border-border/60 from-card/80 to-muted/30 relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm ring-1 ring-black/[0.03] backdrop-blur-sm transition-all duration-500 sm:p-6 dark:ring-white/[0.06]',
        isUpdating && 'opacity-90',
      )}
    >
      <div className="bg-primary/[0.06] pointer-events-none absolute -top-20 -right-20 size-56 rounded-full blur-3xl" />
      {isUpdating ? (
        <div
          className="text-muted-foreground absolute top-4 right-4 flex items-center gap-1 text-[10px] font-medium"
          aria-live="polite"
        >
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
          <span className="sr-only">Actualizando puntuación</span>
        </div>
      ) : null}
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
        <div className="flex flex-col items-center gap-1 lg:items-start">
          <p className="text-muted-foreground text-center text-[11px] font-semibold tracking-widest uppercase lg:text-left">
            {labels.title}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            <ScoreCircle score={score} size="lg" />
            {showDelta ? (
              <span
                className={cn(
                  'text-sm font-semibold tabular-nums transition-all duration-500',
                  scoreDelta > 0 ? 'text-emerald-600' : 'text-red-600',
                )}
                aria-label={
                  scoreDelta > 0
                    ? `Sube ${scoreDelta} puntos`
                    : `Baja ${Math.abs(scoreDelta)} puntos`
                }
              >
                {scoreDelta > 0 ? `↑ +${scoreDelta}` : `↓ ${scoreDelta}`}
              </span>
            ) : null}
          </div>
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 lg:flex lg:flex-wrap lg:gap-3">
          <MetricRow
            icon={BookOpen}
            label={labels.readability}
            value={metrics.readability}
            delay={0.05}
          />
          <MetricRow icon={Hash} label={labels.keywords} value={metrics.keywords} delay={0.1} />
          <MetricRow
            icon={LayoutList}
            label={labels.formatting}
            value={metrics.formatting}
            delay={0.15}
          />
          <MetricRow
            icon={Briefcase}
            label={labels.experience}
            value={metrics.experienceClarity}
            delay={0.2}
          />
        </div>
      </div>
      {improvementHints && improvementHints.length > 0 ? (
        <div className="border-border/40 relative mt-4 border-t pt-4 transition-all duration-500">
          <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
            {improvementHintsTitle}
          </p>
          <ul className="mt-2 space-y-1.5">
            {improvementHints.slice(0, 6).map((s, i) => (
              <li
                key={`${i}-${s.slice(0, 24)}`}
                className="text-foreground/90 text-xs leading-snug"
              >
                <span className="mr-1.5 font-semibold text-emerald-600">+</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </motion.div>
  );
}
