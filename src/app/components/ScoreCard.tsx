import { motion } from 'motion/react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface ScoreCardProps {
  score: number;
  language: 'en' | 'es';
}

export function ScoreCard({ score, language }: ScoreCardProps) {
  const isGood = score >= 70;

  const text = {
    en: {
      score: 'ATS Score',
      good: 'Good',
      needsImprovement: 'Needs Improvement',
      outOf: 'out of 100',
    },
    es: {
      score: 'Puntuación ATS',
      good: 'Bueno',
      needsImprovement: 'Necesita Mejoras',
      outOf: 'de 100',
    },
  };

  const t = text[language];

  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-card border-border rounded-2xl border p-8 shadow-sm"
    >
      <h3 className="text-foreground mb-8 text-lg font-semibold md:text-xl">{t.score}</h3>

      <div className="flex flex-col items-center gap-6">
        {/* Circular Progress */}
        <div className="relative h-40 w-40 sm:h-48 sm:w-48">
          <svg className="h-40 w-40 -rotate-90 transform sm:h-48 sm:w-48">
            <circle
              cx="80"
              cy="80"
              r="60"
              className="text-muted/20 sm:hidden"
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="60"
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              className={`sm:hidden ${isGood ? 'text-green-500' : 'text-amber-500'}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 60 - (score / 100) * 2 * Math.PI * 60 }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
              style={{
                strokeDasharray: 2 * Math.PI * 60,
              }}
            />
            <circle
              cx="96"
              cy="96"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-muted/20 hidden sm:block"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              className={`hidden sm:block ${isGood ? 'text-green-500' : 'text-amber-500'}`}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
              style={{
                strokeDasharray: circumference,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center"
            >
              <div className="text-foreground text-4xl leading-none font-bold sm:text-5xl">
                {score}
              </div>
              <div className="text-muted-foreground mt-1 text-xs sm:text-sm">{t.outOf}</div>
            </motion.div>
          </div>
        </div>

        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1 }}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${
            isGood
              ? 'border border-green-200 bg-green-50 text-green-700'
              : 'border border-amber-200 bg-amber-50 text-amber-700'
          }`}
        >
          {isGood ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <span className="text-sm font-medium">{isGood ? t.good : t.needsImprovement}</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
