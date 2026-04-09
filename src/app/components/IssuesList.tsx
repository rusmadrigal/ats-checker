import { motion } from 'motion/react';
import { AlertCircle, AlertTriangle } from 'lucide-react';

interface Issue {
  type: 'error' | 'warning';
  text: string;
}

interface IssuesListProps {
  issues: Issue[];
  title: string;
}

export function IssuesList({ issues, title }: IssuesListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-card border-border rounded-2xl border p-8 shadow-sm"
    >
      <h3 className="text-foreground mb-6 text-lg font-semibold md:text-xl">{title}</h3>

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
    </motion.div>
  );
}
