'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from './ui/utils';

type ResumePreviewProps = {
  title: string;
  subtitle?: string;
  /** Botones alineados a la derecha del encabezado (PDF, DOCX, Aplicar todas, etc.) */
  headerActions?: ReactNode;
  highlightPulse?: boolean;
  /** Controles y mensajes encima del lienzo del documento (no dentro del “papel”) */
  meta?: ReactNode;
  /** Contenido dentro del documento blanco (CV, skeleton, estado vacío) */
  children: ReactNode;
};

export function ResumePreview({
  title,
  subtitle,
  headerActions,
  highlightPulse = false,
  meta,
  children,
}: ResumePreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-0 min-w-0 flex-col gap-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-foreground text-lg font-semibold tracking-tight sm:text-xl">
              {title}
            </h2>
            {highlightPulse ? (
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-35" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            ) : null}
          </div>
          {subtitle ? (
            <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-relaxed">
              {subtitle}
            </p>
          ) : null}
        </div>
        {headerActions ? (
          <div className="flex flex-shrink-0 flex-wrap items-center justify-start gap-2 sm:justify-end">
            {headerActions}
          </div>
        ) : null}
      </div>

      {meta ? <div className="space-y-3">{meta}</div> : null}

      <div className="rounded-xl bg-stone-200/45 p-4 sm:p-5 dark:bg-stone-900/35">
        <div
          className={cn(
            'mx-auto min-h-[1100px] w-full max-w-[800px] rounded-xl border border-stone-300/90 bg-white p-12 font-serif leading-relaxed shadow-xl print:bg-white print:shadow-none',
            'transition-all duration-300',
            highlightPulse && 'ring-primary/50 shadow-primary/5 ring-2 print:ring-0',
          )}
        >
          {children}
        </div>
      </div>
    </motion.div>
  );
}
