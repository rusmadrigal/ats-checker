import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface HowItWorksStepProps {
  icon: ReactNode;
  step: string;
  title: string;
  description: string;
  delay: number;
}

export function HowItWorksStep({ icon, step, title, description, delay }: HowItWorksStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="text-center"
    >
      <div className="bg-primary/8 text-primary mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl md:h-16 md:w-16">
        {icon}
      </div>

      <div className="mb-3">
        <span className="bg-secondary text-foreground mb-3 inline-block rounded-full px-3 py-1.5 text-xs font-bold tracking-wide">
          {step}
        </span>
      </div>

      <h3 className="text-foreground mb-3 text-lg font-semibold md:text-xl">{title}</h3>

      <p className="text-muted-foreground mx-auto max-w-xs text-sm leading-relaxed md:text-base">
        {description}
      </p>
    </motion.div>
  );
}
