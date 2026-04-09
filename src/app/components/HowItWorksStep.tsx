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
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ duration: 0.3 }}
        className="bg-primary/10 text-primary mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl"
      >
        {icon}
      </motion.div>

      <div className="mb-3">
        <span className="bg-accent text-primary mb-4 inline-block rounded-full px-3 py-1 text-sm font-semibold">
          {step}
        </span>
      </div>

      <h3 className="text-foreground mb-3 text-lg font-semibold md:text-xl">{title}</h3>

      <p className="text-muted-foreground text-sm leading-relaxed md:text-base">{description}</p>
    </motion.div>
  );
}
