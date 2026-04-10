'use client';

import { motion } from 'motion/react';
import { cn } from './ui/utils';

type ScoreCircleProps = {
  score: number;
  max?: number;
  size?: 'md' | 'lg';
  className?: string;
  /** Classes for the numeric score (e.g. transition). */
  scoreNumberClassName?: string;
};

export function ScoreCircle({
  score,
  max = 100,
  size = 'lg',
  className,
  scoreNumberClassName,
}: ScoreCircleProps) {
  const r = size === 'lg' ? 52 : 42;
  const stroke = size === 'lg' ? 8 : 7;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, score / max));
  const offset = c - pct * c;
  const good = score >= 70;

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <svg width={(r + stroke) * 2} height={(r + stroke) * 2} className="-rotate-90" aria-hidden>
        <circle
          cx={r + stroke}
          cy={r + stroke}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="text-muted/25"
          stroke="currentColor"
        />
        <motion.circle
          cx={r + stroke}
          cy={r + stroke}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="currentColor"
          className={cn(
            good ? 'text-emerald-500' : 'text-amber-500',
            'transition-all duration-500',
          )}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          style={{ strokeDasharray: c }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            'text-foreground text-3xl font-semibold tracking-tight tabular-nums transition-all duration-500 sm:text-4xl',
            scoreNumberClassName,
          )}
        >
          {score}
        </span>
        <span className="text-muted-foreground mt-0.5 text-[10px] font-medium tracking-wider uppercase sm:text-xs">
          / {max}
        </span>
      </div>
    </div>
  );
}
