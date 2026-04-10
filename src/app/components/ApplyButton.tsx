'use client';

import { motion } from 'motion/react';
import { Check, Sparkles } from 'lucide-react';
import { cn } from './ui/utils';

type ApplyButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  applied?: boolean;
  disabled?: boolean;
  className?: string;
};

export function ApplyButton({
  children,
  onClick,
  applied = false,
  disabled = false,
  className,
}: ApplyButtonProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold transition-colors',
        applied
          ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
          : 'bg-primary text-primary-foreground hover:opacity-95',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
    >
      {applied ? <Check className="size-3.5" aria-hidden /> : <Sparkles className="size-3.5" aria-hidden />}
      {children}
    </motion.button>
  );
}
