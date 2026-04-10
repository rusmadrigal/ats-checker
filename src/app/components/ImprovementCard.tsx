'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { ApplyButton } from './ApplyButton';
import { cn } from './ui/utils';

export type ImprovementItem = {
  id: string;
  title: string;
  description: string;
  before: string;
  after: string;
};

type ImprovementCardProps = {
  item: ImprovementItem;
  labels: {
    before: string;
    after: string;
    apply: string;
    applied: string;
  };
  onApply: () => void;
  defaultApplied?: boolean;
};

export function ImprovementCard({
  item,
  labels,
  onApply,
  defaultApplied = false,
}: ImprovementCardProps) {
  const [mode, setMode] = useState<'before' | 'after'>('after');
  const [applied, setApplied] = useState(defaultApplied);

  const handleApply = () => {
    onApply();
    setApplied(true);
    window.setTimeout(() => setApplied(false), 2200);
  };

  const body = mode === 'before' ? item.before : item.after;

  return (
    <motion.article
      layout
      className="border-border/55 bg-card/60 group rounded-xl border p-4 shadow-sm ring-1 ring-black/[0.02] backdrop-blur-sm dark:ring-white/[0.04]"
    >
      <div className="flex gap-3">
        <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
          <Sparkles className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-foreground text-sm font-semibold tracking-tight">{item.title}</h4>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{item.description}</p>
        </div>
      </div>

      <div className="mt-3 inline-flex rounded-lg border border-border/60 bg-muted/30 p-0.5">
        <button
          type="button"
          onClick={() => setMode('before')}
          className={cn(
            'rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors',
            mode === 'before'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {labels.before}
        </button>
        <button
          type="button"
          onClick={() => setMode('after')}
          className={cn(
            'rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors',
            mode === 'after'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {labels.after}
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${item.id}-${mode}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'mt-3 rounded-lg border px-3 py-2.5 text-xs leading-relaxed',
            mode === 'after'
              ? 'border-emerald-500/25 bg-emerald-500/[0.06] text-foreground'
              : 'border-border/60 bg-muted/20 text-muted-foreground',
          )}
        >
          {body}
        </motion.div>
      </AnimatePresence>

      <div className="mt-3 flex justify-end">
        <ApplyButton onClick={handleApply} applied={applied}>
          {applied ? labels.applied : labels.apply}
        </ApplyButton>
      </div>
    </motion.article>
  );
}
