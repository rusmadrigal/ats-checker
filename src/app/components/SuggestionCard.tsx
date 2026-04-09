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
      className="bg-card border-border rounded-2xl border p-8 shadow-sm"
    >
      <h3 className="text-foreground mb-6 text-lg font-semibold md:text-xl">{title}</h3>

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
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="mb-2 text-xs font-medium tracking-wide text-red-600 uppercase">
                    {language === 'en' ? 'Original' : 'Original'}
                  </p>
                  <p className="text-foreground/70 text-sm leading-relaxed md:text-base">
                    {suggestion.original}
                  </p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                <ArrowRight className="text-primary h-4 w-4" />
              </div>
            </div>

            {/* Improved */}
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="mb-2 text-xs font-medium tracking-wide text-green-600 uppercase">
                    {language === 'en' ? 'Improved' : 'Mejorado'}
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
