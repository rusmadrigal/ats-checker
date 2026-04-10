import { motion } from 'motion/react';
import { ArrowRight, Copy } from 'lucide-react';
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

export function SuggestionCard({ suggestions, title, language }: SuggestionCardProps) {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(language === 'en' ? 'Copied to clipboard!' : '¡Copiado al portapapeles!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="border-border/80 bg-card/40 rounded-xl border px-5 py-6 shadow-none sm:px-6 sm:py-7"
    >
      <h3 className="text-foreground mb-5 text-lg font-semibold md:text-xl">{title}</h3>

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
                    {language === 'en' ? 'Before' : 'Antes'}
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
                    {language === 'en' ? 'Suggestion' : 'Sugerencia'}
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
                  aria-label="Copy"
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
