'use client';

import { motion } from 'motion/react';
import { BookOpen, Hash, LayoutList, Briefcase } from 'lucide-react';
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
      className="flex min-w-[140px] flex-1 flex-col gap-2 rounded-xl border border-border/50 bg-background/50 px-3 py-3 sm:min-w-[160px]"
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
            className={cn('h-full rounded-full', hue)}
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.9, delay: delay + 0.1, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <span className="text-muted-foreground w-8 text-right text-xs tabular-nums font-semibold">
          {value}
        </span>
      </div>
    </motion.div>
  );
}

export function ATSScoreCard({ score, metrics, labels }: ATSScoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="border-border/60 from-card/80 relative overflow-hidden rounded-2xl border bg-gradient-to-br to-muted/30 p-5 shadow-sm ring-1 ring-black/[0.03] backdrop-blur-sm dark:ring-white/[0.06] sm:p-6"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-primary/[0.06] blur-3xl" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
        <div className="flex flex-col items-center gap-1 lg:items-start">
          <p className="text-muted-foreground text-center text-[11px] font-semibold tracking-widest uppercase lg:text-left">
            {labels.title}
          </p>
          <ScoreCircle score={score} size="lg" />
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 lg:flex lg:flex-wrap lg:gap-3">
          <MetricRow
            icon={BookOpen}
            label={labels.readability}
            value={metrics.readability}
            delay={0.05}
          />
          <MetricRow
            icon={Hash}
            label={labels.keywords}
            value={metrics.keywords}
            delay={0.1}
          />
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
    </motion.div>
  );
}
