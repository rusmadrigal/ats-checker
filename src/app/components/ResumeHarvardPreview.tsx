'use client';

import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import type { CvApprovalMap, CvStructured } from '@/src/lib/cv-structured-types';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { cn } from './ui/utils';

type Props = {
  data: CvStructured;
  approvals: CvApprovalMap;
  onApprovalChange: (key: string, accepted: boolean) => void;
  language: 'en' | 'es';
};

function ApprovalSwitch({
  id,
  checked,
  onCheckedChange,
  label,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <Label htmlFor={id} className="text-muted-foreground cursor-pointer text-xs font-normal">
        {label}
      </Label>
    </div>
  );
}

export function ResumeHarvardPreview({ data, approvals, onApprovalChange, language }: Props) {
  const t =
    language === 'en'
      ? {
          legendTitle: 'Highlights',
          useImproved: 'Use improved text',
          original: 'Original',
          proposed: 'Proposed',
          newSkill: 'Added keyword',
          atsBefore: 'ATS (before)',
          atsAfter: 'ATS (after)',
          summary: 'Professional profile',
          experience: 'Experience',
          skills: 'Core competencies',
          education: 'Education',
          languages: 'Languages',
        }
      : {
          legendTitle: 'Leyenda',
          useImproved: 'Usar texto mejorado',
          original: 'Original',
          proposed: 'Propuesta',
          newSkill: 'Keyword añadida',
          atsBefore: 'ATS (antes)',
          atsAfter: 'ATS (después)',
          summary: 'Perfil profesional',
          experience: 'Experiencia',
          skills: 'Competencias',
          education: 'Formación',
          languages: 'Idiomas',
        };

  const accent = data.meta.accentColor || '#1e3a5f';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-6"
    >
      <div className="bg-muted/40 border-border flex flex-wrap items-center gap-4 rounded-xl border px-4 py-3 text-xs">
        <span className="text-foreground font-semibold">{t.legendTitle}</span>
        <span className="border-l-4 border-emerald-600 pl-2 text-muted-foreground">
          {t.proposed}
        </span>
        <span className="border-l-4 border-amber-500 pl-2 text-muted-foreground">
          {t.original}
        </span>
        <span className="border-l-4 border-sky-600 pl-2 text-muted-foreground">{t.newSkill}</span>
      </div>

      <div
        className="relative mx-auto max-w-[720px] overflow-hidden rounded-sm border border-stone-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)]"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        <div
          className="absolute top-0 right-0 left-0 h-1"
          style={{ backgroundColor: accent }}
          aria-hidden
        />

        <div className="px-10 pt-10 pb-12 md:px-14 md:pt-12">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-foreground text-[26px] leading-tight font-normal tracking-[0.02em] uppercase">
                {data.header.name}
              </h1>
              {data.header.title ? (
                <p className="text-foreground/85 mt-2 text-[15px] leading-snug font-normal">
                  {data.header.title}
                </p>
              ) : null}
              <p className="text-foreground/70 mt-2 text-[13px] leading-relaxed">
                {[data.header.location, data.header.email].filter(Boolean).join(' · ')}
              </p>
            </div>
            <div className="text-foreground/80 flex shrink-0 flex-col gap-0.5 text-right text-[11px] tracking-wide">
              <div>
                <span className="text-muted-foreground font-sans">{t.atsBefore}:</span>{' '}
                <span className="font-sans font-semibold">{data.ats.scoreBefore}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-sans">{t.atsAfter}:</span>{' '}
                <span className="font-sans font-semibold text-emerald-700">{data.ats.scoreAfter}</span>
              </div>
            </div>
          </div>

          {(data.summary.original.trim() || data.summary.improved.trim()) && (
            <section className="mt-10">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-stone-900 pb-1.5">
                <h2 className="text-foreground text-[11px] font-bold tracking-[0.22em] uppercase">
                  {t.summary}
                </h2>
                <ApprovalSwitch
                  id="summary-approval"
                  checked={approvals.summary !== false}
                  onCheckedChange={(v) => onApprovalChange('summary', v)}
                  label={t.useImproved}
                />
              </div>
              <div className="relative">
                {approvals.summary === false && data.summary.original.trim() ? (
                  <p className="text-foreground/80 border-l-4 border-amber-500 pl-4 text-[13.5px] leading-[1.65]">
                    {data.summary.original}
                  </p>
                ) : (
                  <p className="text-foreground border-l-4 border-emerald-600 pl-4 text-[13.5px] leading-[1.65]">
                    {data.summary.improved || data.summary.original}
                  </p>
                )}
              </div>
            </section>
          )}

          {data.experience.length > 0 && (
            <section className="mt-10">
              <h2 className="text-foreground mb-4 border-b border-stone-900 pb-1.5 text-[11px] font-bold tracking-[0.22em] uppercase">
                {t.experience}
              </h2>
              <div className="space-y-8">
                {data.experience.map((exp, i) => (
                  <div key={`${exp.company}-${i}`}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div>
                        <p className="text-foreground text-[14px] font-bold">{exp.company}</p>
                        <p className="text-foreground/90 mt-0.5 text-[13px]">{exp.title}</p>
                        {exp.location ? (
                          <p className="text-foreground/65 mt-0.5 text-[12px]">{exp.location}</p>
                        ) : null}
                      </div>
                      <p className="text-foreground/70 text-[12px] tracking-wide whitespace-nowrap">
                        {exp.period}
                      </p>
                    </div>
                    <ul className="mt-4 list-none space-y-4 pl-0">
                      {Array.from({
                        length: Math.max(exp.original.length, exp.improved.length),
                      }).map((_, j) => {
                        const key = `exp-${i}-bullet-${j}`;
                        const useImp = approvals[key] !== false;
                        const orig = (exp.original[j] ?? '').trim();
                        const imp = (exp.improved[j] ?? '').trim();
                        const changed = orig !== imp && orig.length > 0;
                        return (
                          <li key={key} className="border-border/60 rounded-lg border bg-stone-50/50 p-3">
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                              {changed ? (
                                <span className="text-muted-foreground font-sans flex items-center gap-1 text-[10px] font-medium tracking-wide uppercase">
                                  <Sparkles className="size-3" aria-hidden />
                                  {t.proposed}
                                </span>
                              ) : (
                                <span />
                              )}
                              {changed ? (
                                <ApprovalSwitch
                                  id={`approval-${key}`}
                                  checked={useImp}
                                  onCheckedChange={(v) => onApprovalChange(key, v)}
                                  label={t.useImproved}
                                />
                              ) : null}
                            </div>
                            {changed && !useImp ? (
                              <p className="text-foreground/80 border-l-4 border-amber-500 pl-3 text-[13px] leading-[1.6]">
                                {orig || imp}
                              </p>
                            ) : (
                              <p
                                className={cn(
                                  'pl-3 text-[13px] leading-[1.6]',
                                  changed
                                    ? 'text-foreground border-l-4 border-emerald-600'
                                    : 'text-foreground/90 border-l-4 border-stone-300',
                                )}
                              >
                                {useImp ? imp || orig : orig || imp}
                              </p>
                            )}
                            {changed && useImp && orig ? (
                              <p className="text-muted-foreground mt-2 border-l-2 border-stone-200 pl-3 font-sans text-[11px] leading-relaxed italic">
                                <span className="font-semibold not-italic">{t.original}: </span>
                                {orig}
                              </p>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(data.skills.improved.length > 0 ||
            data.skills.original.length > 0 ||
            data.skills.added.length > 0) && (
            <section className="mt-10">
              <h2 className="text-foreground mb-4 border-b border-stone-900 pb-1.5 text-[11px] font-bold tracking-[0.22em] uppercase">
                {t.skills}
              </h2>
              <ul className="space-y-2">
                {Array.from({
                  length: Math.max(data.skills.original.length, data.skills.improved.length),
                }).map((_, i) => {
                  const o = (data.skills.original[i] ?? '').trim();
                  const im = (data.skills.improved[i] ?? '').trim();
                  const useImp = approvals[`skill-${i}`] !== false;
                  const show = useImp ? (im || o) : (o || im);
                  if (!show) return null;
                  const changed = Boolean(o && im && o !== im);
                  return (
                    <li
                      key={`skill-${i}`}
                      className={cn(
                        'flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 font-sans text-[12px]',
                        changed ? 'border-emerald-200 bg-emerald-50/40' : 'border-stone-200 bg-white',
                      )}
                    >
                      <span className="text-foreground/90">{show}</span>
                      {changed ? (
                        <ApprovalSwitch
                          id={`skill-${i}`}
                          checked={useImp}
                          onCheckedChange={(v) => onApprovalChange(`skill-${i}`, v)}
                          label={t.useImproved}
                        />
                      ) : null}
                    </li>
                  );
                })}
                {data.skills.added.map((s, i) => {
                  if (!s.trim()) return null;
                  const key = `skill-added-${i}`;
                  const on = approvals[key] !== false;
                  return (
                    <li
                      key={key}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-sky-200 bg-sky-50/80 px-3 py-2 font-sans text-[12px]"
                    >
                      <span className="text-foreground/90">
                        {s}
                        <span className="text-sky-800 ml-2 text-[10px] font-medium tracking-wide uppercase">
                          ({t.newSkill})
                        </span>
                      </span>
                      <ApprovalSwitch
                        id={key}
                        checked={on}
                        onCheckedChange={(v) => onApprovalChange(key, v)}
                        label={language === 'en' ? 'Include' : 'Incluir'}
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {data.education.length > 0 && (
            <section className="mt-10">
              <h2 className="text-foreground mb-4 border-b border-stone-900 pb-1.5 text-[11px] font-bold tracking-[0.22em] uppercase">
                {t.education}
              </h2>
              <ul className="space-y-3">
                {data.education.map((ed, i) => (
                  <li key={`${ed.institution}-${i}`} className="text-[13px] leading-snug">
                    <span className="text-foreground font-semibold">{ed.degree}</span>
                    {ed.institution ? (
                      <span className="text-foreground/85">, {ed.institution}</span>
                    ) : null}
                    {ed.period ? (
                      <span className="text-foreground/65"> · {ed.period}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.languages.length > 0 && (
            <section className="mt-10">
              <h2 className="text-foreground mb-3 border-b border-stone-900 pb-1.5 text-[11px] font-bold tracking-[0.22em] uppercase">
                {t.languages}
              </h2>
              <p className="text-foreground/85 text-[13px] leading-relaxed">
                {data.languages.join(' · ')}
              </p>
            </section>
          )}
        </div>
      </div>
    </motion.div>
  );
}
