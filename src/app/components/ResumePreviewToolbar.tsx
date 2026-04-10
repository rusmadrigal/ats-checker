'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Eye, Pencil, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { cn } from './ui/utils';

type Copy = {
  readOnlyLabel: string;
  editLabel: string;
  headlineReadOnly: string;
  headlineEdit: string;
  subReadOnly: string;
  subEdit: string;
  restoreAll: string;
  modeBannerReadOnly: string;
  modeBannerEdit: string;
  toastReadOnly: string;
  toastEdit: string;
};

type Props = {
  hasBaseline: boolean;
  readOnly: boolean;
  onReadOnlyChange: (readOnly: boolean) => void;
  onRevertAll: () => void;
  copy: Copy;
  className?: string;
};

export function ResumePreviewToolbar({
  hasBaseline,
  readOnly,
  onReadOnlyChange,
  onRevertAll,
  copy,
  className,
}: Props) {
  const setMode = (nextReadOnly: boolean) => {
    if (nextReadOnly === readOnly) return;
    onReadOnlyChange(nextReadOnly);
    window.setTimeout(() => {
      toast(nextReadOnly ? copy.toastReadOnly : copy.toastEdit, { duration: 3500 });
    }, 150);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div
        className={cn(
          'border-border/80 bg-card/80 flex flex-col gap-4 rounded-2xl border px-4 py-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-5',
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-2">
          <p className="text-foreground text-sm leading-snug font-semibold">
            {readOnly ? copy.headlineReadOnly : copy.headlineEdit}
          </p>
          <div
            className="bg-muted/60 flex w-full max-w-md rounded-xl border border-stone-200/80 p-1 sm:w-auto"
            role="group"
            aria-label={readOnly ? copy.readOnlyLabel : copy.editLabel}
          >
            <button
              type="button"
              aria-pressed={readOnly}
              onClick={() => setMode(true)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 sm:flex-initial sm:px-5',
                readOnly
                  ? 'bg-card text-foreground shadow-sm ring-1 ring-stone-200/90'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Eye className="size-4 shrink-0" aria-hidden />
              {copy.readOnlyLabel}
            </button>
            <button
              type="button"
              aria-pressed={!readOnly}
              onClick={() => setMode(false)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 sm:flex-initial sm:px-5',
                !readOnly
                  ? 'bg-card text-foreground shadow-sm ring-1 ring-stone-200/90'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Pencil className="size-4 shrink-0" aria-hidden />
              {copy.editLabel}
            </button>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed sm:text-[13px]">
            {readOnly ? copy.subReadOnly : copy.subEdit}
          </p>
        </div>
        {hasBaseline ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="border-border min-h-12 shrink-0 gap-2 px-5 text-base font-semibold"
            onClick={onRevertAll}
          >
            <RotateCcw className="size-4" aria-hidden />
            {copy.restoreAll}
          </Button>
        ) : null}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={readOnly ? 'readonly' : 'edit'}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={cn(
            'border-primary/25 rounded-xl border px-4 py-3 text-sm leading-relaxed font-medium shadow-sm',
            readOnly ? 'bg-sky-50/90 text-sky-950' : 'bg-amber-50/90 text-amber-950',
          )}
        >
          {readOnly ? copy.modeBannerReadOnly : copy.modeBannerEdit}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
