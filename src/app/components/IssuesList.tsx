import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, AlertTriangle, Loader2, Sparkles } from 'lucide-react';

interface Issue {
  type: 'error' | 'warning';
  text: string;
}

interface IssuesListProps {
  issues: Issue[];
  title: string;
  /** Botón opcional bajo la lista (p. ej. corregir con IA). */
  footer?: ReactNode;
}

export function IssuesList({ issues, title, footer }: IssuesListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="border-border/80 bg-card/50 rounded-xl border px-5 py-5 shadow-none"
    >
      <h3 className="text-foreground mb-4 text-sm font-semibold">{title}</h3>

      <div className="space-y-4">
        {issues.map((issue, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
            className="flex items-start gap-3"
          >
            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                issue.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
              }`}
            >
              {issue.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
            </div>
            <p className="text-foreground flex-1 pt-1 text-sm leading-relaxed md:text-base">
              {issue.text}
            </p>
          </motion.div>
        ))}
      </div>
      {footer ? <div className="border-border/50 mt-4 border-t pt-4">{footer}</div> : null}
    </motion.div>
  );
}

type IssuesListFixWithAiButtonProps = {
  label: string;
  loadingLabel: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function IssuesListFixWithAiButton({
  label,
  loadingLabel,
  onClick,
  disabled = false,
  loading = false,
}: IssuesListFixWithAiButtonProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.99 }}
      onClick={onClick}
      disabled={disabled || loading}
      className="bg-primary text-primary-foreground focus-visible:ring-primary inline-flex w-full min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-55"
    >
      {loading ? (
        <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
      ) : (
        <Sparkles className="size-4 shrink-0" aria-hidden />
      )}
      {loading ? loadingLabel : label}
    </motion.button>
  );
}
