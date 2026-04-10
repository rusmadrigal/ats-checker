'use client';

import { motion } from 'motion/react';
import { Sparkles, CheckCircle } from 'lucide-react';
import { UploadDropzone } from './UploadDropzone';

type HeroAIAnalysisProps = {
  badge: string;
  title: string;
  subtitle: string;
  onFileSelect: (file: File) => void;
  isAnalyzing: boolean;
  language: 'en' | 'es';
  fileLabel?: string | null;
  sessionHint?: string | null;
};

export function HeroAIAnalysis({
  badge,
  title,
  subtitle,
  onFileSelect,
  isAnalyzing,
  language,
  fileLabel,
  sessionHint,
}: HeroAIAnalysisProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-30%,hsl(var(--primary)/0.14),transparent)]" />
      <div className="relative mx-auto max-w-2xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 md:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08, duration: 0.4 }}
            className="border-border/50 bg-background/55 text-primary mb-8 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-md"
          >
            <Sparkles className="size-3.5" aria-hidden />
            {badge}
          </motion.div>

          <h1 className="font-display text-foreground text-[1.65rem] font-bold leading-[1.12] tracking-tight sm:text-4xl md:text-[2.65rem]">
            {title}
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-md text-base leading-relaxed sm:text-lg">
            {subtitle}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="border-border/40 bg-background/40 mt-10 rounded-2xl border p-1 shadow-[0_8px_40px_-20px_rgba(0,0,0,0.2)] backdrop-blur-xl"
          >
            <div className="rounded-[14px] bg-background/80 p-3 sm:p-4">
              <UploadDropzone
                onFileSelect={onFileSelect}
                isAnalyzing={isAnalyzing}
                language={language}
              />
            </div>
          </motion.div>

          {fileLabel ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted-foreground mt-6 flex items-center justify-center gap-2 text-sm"
            >
              <CheckCircle className="size-4 shrink-0 text-emerald-600" aria-hidden />
              <span className="truncate">{fileLabel}</span>
            </motion.p>
          ) : null}
          {sessionHint ? (
            <p className="text-amber-900/90 mt-2 max-w-md mx-auto text-center text-xs leading-relaxed">
              {sessionHint}
            </p>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
