import { motion } from 'motion/react';
import { ArrowRight, Copy, Info } from 'lucide-react';
import { toast } from 'sonner';

interface Suggestion {
  original: string;
  improved: string;
}

interface SuggestionCardProps {
  suggestions: Suggestion[];
  title: string;
  language: 'en' | 'es';
}

const strings = {
  en: {
    intro:
      'These are style examples, not final wording. Replace anything in brackets […] and adjust numbers to match your real results before using it in your CV.',
    before: 'Before',
    exampleLabel: 'Example rewrite',
    copyAria: 'Copy example text',
    copiedTitle: 'Copied',
    copiedDescription:
      'Review placeholders and sample figures — tailor the sentence to your experience.',
  },
  es: {
    intro:
      'Son ejemplos de estilo y estructura, no un texto para pegar tal cual. Sustituye lo que va entre corchetes […], revisa las cifras de muestra y adáptalo a tu experiencia real.',
    before: 'Antes',
    exampleLabel: 'Ejemplo de redacción',
    copyAria: 'Copiar texto de ejemplo',
    copiedTitle: 'Copiado',
    copiedDescription:
      'Revisa corchetes y cifras de ejemplo; ajusta la frase a tu trayectoria antes de usarla en el CV.',
  },
} as const;

export function SuggestionCard({ suggestions, title, language }: SuggestionCardProps) {
  const t = strings[language];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t.copiedTitle, { description: t.copiedDescription, duration: 4500 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="border-border/80 bg-card/40 rounded-xl border px-5 py-6 shadow-none sm:px-6 sm:py-7"
    >
      <h3 className="text-foreground mb-3 text-lg font-semibold md:text-xl">{title}</h3>
      <p className="text-muted-foreground mb-6 flex gap-2.5 text-sm leading-relaxed">
        <Info className="text-primary mt-0.5 size-4 shrink-0 opacity-90" aria-hidden />
        <span>{t.intro}</span>
      </p>

      <div className="space-y-6">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
            className="space-y-4"
          >
            {/* Original */}
            <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4 md:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                    {t.before}
                  </p>
                  <p className="text-foreground/85 text-sm leading-relaxed md:text-base">
                    {suggestion.original}
                  </p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="bg-primary/8 flex h-9 w-9 items-center justify-center rounded-full">
                <ArrowRight className="text-primary size-4" aria-hidden />
              </div>
            </div>

            {/* Improved */}
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4 md:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="mb-2 text-xs font-semibold tracking-wide text-emerald-800 uppercase">
                    {t.exampleLabel}
                  </p>
                  <p className="text-foreground text-sm leading-relaxed md:text-base">
                    {suggestion.improved}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleCopy(suggestion.improved)}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-green-300 bg-white transition-colors hover:bg-green-100"
                  aria-label={t.copyAria}
                >
                  <Copy className="h-4 w-4 text-green-700" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
