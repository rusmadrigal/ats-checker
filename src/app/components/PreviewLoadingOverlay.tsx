'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Sparkles } from 'lucide-react';

const TIPS_ES = [
  '¿Sabías que muchos ATS convierten tu CV a texto plano? Por eso importa la estructura clara y títulos reconocibles.',
  '¿Sabías que las tablas complejas o columnas raras a veces se leen en orden incorrecto? Un diseño simple suele funcionar mejor.',
  '¿Sabías que repetir palabras clave de la oferta (con naturalidad) puede mejorar el emparejamiento automático?',
  '¿Sabías que las métricas concretas (%, plazos, tamaño de equipo) suelen destacar más que frases genéricas?',
  '¿Sabías que archivos PDF con texto seleccionable suelen parsearse mejor que escaneos o imágenes?',
  '¿Sabías que el nombre del puesto y fechas bien visibles ayudan a los parsers a entender tu experiencia?',
  '¿Sabías que algunos sistemas puntúan según secciones detectadas? Encabezados como «Experiencia» o «Educación» ayudan.',
  '¿Sabías que un solo archivo bien alineado con la oferta a menudo supera un CV «bonito» pero ambiguo para el ATS?',
] as const;

interface PreviewLoadingOverlayProps {
  open: boolean;
  title: string;
}

export function PreviewLoadingOverlay({ open, title }: PreviewLoadingOverlayProps) {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS_ES.length);
    }, 4800);
    return () => window.clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="preview-loading-overlay"
          role="dialog"
          aria-modal="true"
          aria-busy="true"
          aria-label={title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] flex items-end justify-center p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:items-center sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-background/75 absolute inset-0 backdrop-blur-md"
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="border-border/80 bg-card/95 relative w-full max-w-md rounded-2xl border px-5 py-6 shadow-2xl sm:px-7 sm:py-8"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="bg-primary/12 flex h-12 w-12 items-center justify-center rounded-2xl">
                <Loader2 className="text-primary size-6 animate-spin" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="text-primary size-4 shrink-0" aria-hidden />
                  {title}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">Un momento…</p>
              </div>
            </div>
            <div className="bg-muted/50 border-border/60 relative min-h-[5.5rem] overflow-hidden rounded-xl border px-4 py-3.5">
              <AnimatePresence mode="wait">
                <motion.p
                  key={tipIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className="text-foreground text-sm leading-relaxed"
                >
                  {TIPS_ES[tipIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="text-muted-foreground mt-4 flex justify-center gap-1">
              {TIPS_ES.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === tipIndex ? 'bg-primary w-5' : 'bg-muted-foreground/25 w-1.5'
                  }`}
                  aria-hidden
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
