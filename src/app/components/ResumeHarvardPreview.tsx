'use client';

import type { Ref } from 'react';
import { motion } from 'motion/react';
import { Plus, Sparkles, Trash2 } from 'lucide-react';
import type { CvApprovalMap, CvStructured } from '@/src/lib/cv-structured-types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { cn } from './ui/utils';
import { ResumePreviewToolbar } from './ResumePreviewToolbar';

export type ContactFieldHighlightFlags = {
  name?: boolean;
  email?: boolean;
  location?: boolean;
};

type Props = {
  data: CvStructured;
  approvals: CvApprovalMap;
  onApprovalChange: (key: string, accepted: boolean) => void;
  onStructuredChange: (next: CvStructured) => void;
  language: 'en' | 'es';
  readOnly: boolean;
  onReadOnlyChange: (readOnly: boolean) => void;
  baseline: CvStructured | null;
  onRevertAll: () => void;
  onRevertSummary: () => void;
  onRevertHeader: () => void;
  onRevertExperience: (index: number) => void;
  onRevertBullet: (expIndex: number, bulletIndex: number) => void;
  onRevertSkills: () => void;
  onRevertEducation: () => void;
  onDeleteExperience: (index: number) => void;
  onDeleteExpBullet: (expIndex: number, bulletIndex: number) => void;
  onDeleteSkillRow: (skillIndex: number) => void;
  onDeleteSkillAdded: (addedIndex: number) => void;
  onDeleteEducation: (index: number) => void;
  onAddExperience: () => void;
  onAddExpBullet: (expIndex: number) => void;
  onAddEducation: () => void;
  onAddSkillRow: () => void;
  onAddSkillAdded: () => void;
  /** Resalta campos de contacto que el usuario debe completar (color --user-action-highlight). */
  contactHighlight?: ContactFieldHighlightFlags;
  /** Nodo del CV (sin barra de herramientas) para exportar PDF fiel al diseño. */
  documentExportRef?: Ref<HTMLDivElement>;
};

function ApprovalSwitch({
  id,
  checked,
  onCheckedChange,
  label,
  disabled,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <div className={cn('flex items-center gap-2', disabled && 'opacity-50')}>
      <Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
      <Label
        htmlFor={id}
        className={cn(
          'text-muted-foreground text-xs font-normal',
          disabled ? 'cursor-default' : 'cursor-pointer',
        )}
      >
        {label}
      </Label>
    </div>
  );
}

const resumeInput =
  'border-stone-200/90 bg-white text-foreground shadow-none focus-visible:border-stone-400 focus-visible:ring-2 focus-visible:ring-stone-300/30';

const resumeTextarea =
  'min-h-[5rem] resize-y border-stone-200/90 bg-white text-[16px] leading-relaxed shadow-none focus-visible:border-stone-400 focus-visible:ring-2 focus-visible:ring-stone-300/30 md:text-[17px] md:leading-relaxed';

const readOnlyProse =
  'text-[16px] leading-[1.65] text-stone-900 whitespace-pre-wrap md:text-[17px] md:leading-[1.65]';

export function ResumeHarvardPreview({
  data,
  approvals,
  onApprovalChange,
  onStructuredChange,
  language,
  readOnly,
  onReadOnlyChange,
  baseline,
  onRevertAll,
  onRevertSummary,
  onRevertHeader,
  onRevertExperience,
  onRevertBullet,
  onRevertSkills,
  onRevertEducation,
  onDeleteExperience,
  onDeleteExpBullet,
  onDeleteSkillRow,
  onDeleteSkillAdded,
  onDeleteEducation,
  onAddExperience,
  onAddExpBullet,
  onAddEducation,
  onAddSkillRow,
  onAddSkillAdded,
  contactHighlight,
  documentExportRef,
}: Props) {
  const t =
    language === 'en'
      ? {
          legendTitle: 'Guide',
          useImproved: 'Use improved text',
          original: 'Original',
          proposed: 'Suggested',
          newSkill: 'Added',
          atsBefore: 'ATS (before)',
          atsAfter: 'ATS (after)',
          summary: 'Professional profile',
          experience: 'Experience',
          skills: 'Core skills',
          education: 'Education',
          languages: 'Languages',
          contact: 'Your name and contact',
          roleLine: 'Professional headline',
          readOnlyLabel: 'Clean view',
          editLabel: 'Edit resume',
          headlineReadOnly: 'Read-only: your resume without text boxes.',
          headlineEdit: 'Editing on: you can change text in the fields below.',
          subReadOnly: 'To type corrections or turn suggestions on/off, switch to “Edit resume”.',
          subEdit:
            'Use the boxes and toggles; that is exactly what Word and PDF will use when you download.',
          restoreAll: 'Reset to AI version',
          modeBannerReadOnly:
            'Tip: tap “Edit resume” when you want to change a line. The page will show input fields so it’s obvious you can type.',
          modeBannerEdit:
            'Tip: tap “Clean view” anytime for a calm read with no boxes. Your edits stay saved for download.',
          toastReadOnly: 'Clean view — read only, no typing fields.',
          toastEdit: 'Edit mode — you can now change the text in the boxes.',
          restoreBlock: 'Reset this part',
          restoreJob: 'Reset this job',
          deleteJob: 'Remove job',
          deleteBullet: 'Remove bullet',
          deleteSkill: 'Remove skill',
          deleteEducation: 'Remove education',
          addExperience: 'Add job',
          addBullet: 'Add bullet',
          addEducation: 'Add education',
          addSkill: 'Add skill',
          addSkillExtra: 'Add extra skill line',
        }
      : {
          legendTitle: 'Guía rápida',
          useImproved: 'Usar texto mejorado',
          original: 'Texto original',
          proposed: 'Sugerencia',
          newSkill: 'Añadida',
          atsBefore: 'ATS (antes)',
          atsAfter: 'ATS (después)',
          summary: 'Perfil profesional',
          experience: 'Experiencia',
          skills: 'Habilidades',
          education: 'Formación',
          languages: 'Idiomas',
          contact: 'Nombre y contacto',
          roleLine: 'Título profesional',
          readOnlyLabel: 'Vista Previa',
          editLabel: 'Editar currículum',
          headlineReadOnly: 'Solo lectura: ves el currículum sin recuadros para escribir.',
          headlineEdit: 'Modo edición: puedes cambiar el texto en los recuadros.',
          subReadOnly:
            'Para escribir correcciones o activar/desactivar sugerencias, elige «Editar currículum».',
          subEdit:
            'Lo que cambies aquí (y lo que apruebes) es lo mismo que se descargará en Word y PDF.',
          restoreAll: 'Volver al texto de la IA',
          modeBannerReadOnly:
            'Consejo: cuando quieras corregir algo, pulsa «Editar currículum». Entonces aparecerán recuadros y verás claro que puedes escribir.',
          modeBannerEdit:
            'Consejo: pulsa «Vista Previa» para leer tranquilo sin cajas. Tus cambios siguen guardados para la descarga.',
          toastReadOnly: 'Vista Previa: solo lectura, sin campos de texto.',
          toastEdit: 'Modo edición: ya puedes cambiar el texto en los recuadros.',
          restoreBlock: 'Restaurar esta parte',
          restoreJob: 'Restaurar este trabajo',
          deleteJob: 'Eliminar este trabajo',
          deleteBullet: 'Eliminar viñeta',
          deleteSkill: 'Eliminar competencia',
          deleteEducation: 'Eliminar formación',
          addExperience: 'Añadir experiencia',
          addBullet: 'Añadir viñeta',
          addEducation: 'Añadir formación',
          addSkill: 'Añadir competencia',
          addSkillExtra: 'Añadir línea extra de competencias',
        };

  const accent = data.meta.accentColor || '#1e3a5f';
  const showRevert = Boolean(baseline) && !readOnly;

  const patchHeader = (field: keyof CvStructured['header'], value: string) => {
    onStructuredChange({ ...data, header: { ...data.header, [field]: value } });
  };

  const patchExpMeta = (
    ei: number,
    field: 'company' | 'title' | 'location' | 'period',
    value: string,
  ) => {
    const experience = data.experience.map((e, idx) => (idx === ei ? { ...e, [field]: value } : e));
    onStructuredChange({ ...data, experience });
  };

  const patchExpBullet = (
    ei: number,
    bi: number,
    field: 'original' | 'improved',
    value: string,
  ) => {
    const experience = data.experience.map((e, idx) => {
      if (idx !== ei) return e;
      const next = [...e[field]];
      next[bi] = value;
      return { ...e, [field]: next };
    });
    onStructuredChange({ ...data, experience });
  };

  const patchSkillImproved = (i: number, value: string) => {
    const improved = [...data.skills.improved];
    while (improved.length <= i) improved.push('');
    improved[i] = value;
    onStructuredChange({ ...data, skills: { ...data.skills, improved } });
  };

  const patchSkillAdded = (i: number, value: string) => {
    const added = [...data.skills.added];
    while (added.length <= i) added.push('');
    added[i] = value;
    onStructuredChange({ ...data, skills: { ...data.skills, added } });
  };

  const patchEducation = (i: number, field: 'degree' | 'institution' | 'period', value: string) => {
    const education = data.education.map((ed, idx) => (idx === i ? { ...ed, [field]: value } : ed));
    onStructuredChange({ ...data, education });
  };

  const patchSummary = (field: 'original' | 'improved', value: string) => {
    onStructuredChange({ ...data, summary: { ...data.summary, [field]: value } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      <ResumePreviewToolbar
        hasBaseline={Boolean(baseline)}
        readOnly={readOnly}
        onReadOnlyChange={onReadOnlyChange}
        onRevertAll={onRevertAll}
        copy={{
          readOnlyLabel: t.readOnlyLabel,
          editLabel: t.editLabel,
          headlineReadOnly: t.headlineReadOnly,
          headlineEdit: t.headlineEdit,
          subReadOnly: t.subReadOnly,
          subEdit: t.subEdit,
          restoreAll: t.restoreAll,
          modeBannerReadOnly: t.modeBannerReadOnly,
          modeBannerEdit: t.modeBannerEdit,
          toastReadOnly: t.toastReadOnly,
          toastEdit: t.toastEdit,
        }}
      />

      {!readOnly ? (
        <div className="text-muted-foreground flex flex-wrap gap-x-5 gap-y-2 border-y border-stone-200/80 py-3 font-sans text-xs">
          <span className="text-foreground font-semibold">{t.legendTitle}</span>
          <span className="border-l-4 border-emerald-600 pl-2">{t.proposed}</span>
          <span className="border-l-4 border-amber-500 pl-2">{t.original}</span>
          <span className="border-l-4 border-sky-600 pl-2">{t.newSkill}</span>
        </div>
      ) : null}

      <motion.div
        ref={documentExportRef}
        key={readOnly ? 'readonly' : 'editing'}
        initial={{ opacity: 0.88, scale: 0.995 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative w-full overflow-visible transition-all duration-300 print:shadow-none"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        <div
          className="absolute top-0 right-0 left-0 h-1 rounded-t-sm"
          style={{ backgroundColor: accent }}
          aria-hidden
        />

        <div className="pt-2 pb-4 sm:pt-3 sm:pb-6">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label className="font-sans text-[11px] font-semibold tracking-wide text-stone-500 uppercase">
                  {t.contact}
                </Label>
                {showRevert ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 px-2 font-sans text-xs font-medium text-stone-600"
                    onClick={onRevertHeader}
                  >
                    {t.restoreBlock}
                  </Button>
                ) : null}
              </div>
              {readOnly ? (
                <>
                  <h1 className="text-[26px] leading-tight font-normal tracking-wide text-stone-900 uppercase sm:text-[32px]">
                    {data.header.name}
                  </h1>
                  {data.header.title ? (
                    <p className="text-[17px] leading-snug text-stone-800 sm:text-[18px]">
                      {data.header.title}
                    </p>
                  ) : null}
                  <p className="font-sans text-[14px] text-stone-600 sm:text-[15px]">
                    {[data.header.location, data.header.email].filter(Boolean).join(' · ')}
                  </p>
                </>
              ) : (
                <>
                  <Input
                    value={data.header.name}
                    onChange={(e) => patchHeader('name', e.target.value)}
                    className={cn(
                      resumeInput,
                      'h-auto rounded-none border-x-0 border-t-0 border-b border-stone-200 px-0 py-1 text-[22px] font-normal tracking-wide text-stone-900 uppercase sm:text-[26px]',
                      contactHighlight?.name && 'contact-field-user-action',
                    )}
                    aria-label="Name"
                  />
                  <p className="font-sans text-[11px] font-semibold tracking-wide text-stone-500 uppercase">
                    {t.roleLine}
                  </p>
                  <Input
                    value={data.header.title}
                    onChange={(e) => patchHeader('title', e.target.value)}
                    className={cn(
                      resumeInput,
                      'h-auto rounded-lg border px-3 py-2 text-[15px] font-normal',
                    )}
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      value={data.header.location}
                      onChange={(e) => patchHeader('location', e.target.value)}
                      className={cn(
                        resumeInput,
                        'font-sans text-sm',
                        contactHighlight?.location && 'contact-field-user-action',
                      )}
                    />
                    <Input
                      value={data.header.email}
                      onChange={(e) => patchHeader('email', e.target.value)}
                      type="email"
                      className={cn(
                        resumeInput,
                        'font-sans text-sm',
                        contactHighlight?.email && 'contact-field-user-action',
                      )}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="text-foreground/85 flex shrink-0 flex-col gap-1 text-right font-sans text-[11px] tracking-wide">
              <div>
                <span className="text-muted-foreground">{t.atsBefore}:</span>{' '}
                <span className="font-semibold text-stone-800">{data.ats.scoreBefore}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t.atsAfter}:</span>{' '}
                <span className="font-semibold text-emerald-700">{data.ats.scoreAfter}</span>
              </div>
            </div>
          </div>

          {(data.summary.original.trim() || data.summary.improved.trim() || !readOnly) && (
            <section className="mt-8">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-stone-900 pb-2">
                <h2 className="text-[12px] font-bold tracking-[0.18em] text-stone-900 uppercase">
                  {t.summary}
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  {showRevert ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 px-2 font-sans text-xs font-medium"
                      onClick={onRevertSummary}
                    >
                      {t.restoreBlock}
                    </Button>
                  ) : null}
                  {!readOnly ? (
                    <ApprovalSwitch
                      id="summary-approval"
                      checked={approvals.summary !== false}
                      onCheckedChange={(v) => onApprovalChange('summary', v)}
                      label={t.useImproved}
                    />
                  ) : null}
                </div>
              </div>
              {readOnly ? (
                <p
                  className={cn(
                    readOnlyProse,
                    'border-l-4 border-emerald-700/80 pl-4',
                    approvals.summary === false && 'border-amber-600',
                  )}
                >
                  {approvals.summary === false && data.summary.original.trim()
                    ? data.summary.original
                    : data.summary.improved || data.summary.original}
                </p>
              ) : approvals.summary === false && data.summary.original.trim() ? (
                <Textarea
                  value={data.summary.original}
                  onChange={(e) => patchSummary('original', e.target.value)}
                  className={cn(resumeTextarea, 'rounded-lg border-l-4 border-amber-500 pl-3')}
                />
              ) : (
                <Textarea
                  value={data.summary.improved || data.summary.original}
                  onChange={(e) => patchSummary('improved', e.target.value)}
                  className={cn(resumeTextarea, 'rounded-lg border-l-4 border-emerald-600 pl-3')}
                />
              )}
              {!readOnly && approvals.summary !== false && data.summary.original.trim() ? (
                <p className="text-muted-foreground mt-3 border-l-2 border-stone-200 pl-3 font-sans text-xs leading-relaxed italic">
                  <span className="font-semibold not-italic">{t.original}: </span>
                  {data.summary.original}
                </p>
              ) : null}
            </section>
          )}

          {(data.experience.length > 0 || !readOnly) && (
            <section className="mt-8">
              <h2 className="text-foreground mb-5 border-b border-stone-900 pb-2 text-[12px] font-bold tracking-[0.18em] uppercase">
                {t.experience}
              </h2>
              <div className="space-y-10">
                {data.experience.map((exp, i) => (
                  <div key={`experience-${i}`} className="space-y-3">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {showRevert ? (
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-8 px-2 font-sans text-xs font-medium"
                          onClick={() => onRevertExperience(i)}
                        >
                          {t.restoreJob}
                        </Button>
                      ) : null}
                      {!readOnly ? (
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5 px-2 font-sans text-xs font-medium"
                          onClick={() => onDeleteExperience(i)}
                        >
                          <Trash2 className="size-3.5 shrink-0" aria-hidden />
                          {t.deleteJob}
                        </Button>
                      ) : null}
                    </div>
                    {readOnly ? (
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <p className="text-[17px] font-bold text-stone-900">{exp.company}</p>
                          <p className="mt-0.5 text-[15px] text-stone-800 sm:text-[16px]">
                            {exp.title}
                          </p>
                          {exp.location ? (
                            <p className="mt-0.5 font-sans text-[12px] text-stone-600">
                              {exp.location}
                            </p>
                          ) : null}
                        </div>
                        <p className="font-sans text-[12px] tracking-wide whitespace-nowrap text-stone-600">
                          {exp.period}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Input
                            value={exp.company}
                            onChange={(e) => patchExpMeta(i, 'company', e.target.value)}
                            className={cn(resumeInput, 'text-[15px] font-bold')}
                          />
                          <Input
                            value={exp.period}
                            onChange={(e) => patchExpMeta(i, 'period', e.target.value)}
                            className={cn(resumeInput, 'font-sans text-sm')}
                          />
                        </div>
                        <Input
                          value={exp.title}
                          onChange={(e) => patchExpMeta(i, 'title', e.target.value)}
                          className={cn(resumeInput, 'text-[14px]')}
                        />
                        <Input
                          value={exp.location}
                          onChange={(e) => patchExpMeta(i, 'location', e.target.value)}
                          className={cn(resumeInput, 'text-[13px] text-stone-600')}
                        />
                      </>
                    )}
                    <ul className="mt-4 list-none space-y-4 pl-0">
                      {Array.from({
                        length: Math.max(exp.original.length, exp.improved.length),
                      }).map((_, j) => {
                        const key = `exp-${i}-bullet-${j}`;
                        const useImp = approvals[key] !== false;
                        const orig = exp.original[j] ?? '';
                        const imp = exp.improved[j] ?? '';
                        const changed = orig.trim() !== imp.trim() && orig.trim().length > 0;
                        const displayText =
                          changed && !useImp ? orig || imp : useImp ? imp || orig : orig || imp;
                        return (
                          <li
                            key={key}
                            className={cn(
                              'rounded-xl border p-4',
                              readOnly
                                ? 'border-stone-100 bg-stone-50/30'
                                : 'border-stone-200/60 bg-stone-50/50',
                            )}
                          >
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                              {changed && !readOnly ? (
                                <span className="text-muted-foreground flex items-center gap-1 font-sans text-[10px] font-semibold tracking-wide uppercase">
                                  <Sparkles className="size-3" aria-hidden />
                                  {t.proposed}
                                </span>
                              ) : (
                                <span />
                              )}
                              <div className="flex flex-wrap items-center gap-2">
                                {showRevert && changed ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-8 px-2 font-sans text-xs font-medium"
                                    onClick={() => onRevertBullet(i, j)}
                                  >
                                    {t.restoreBlock}
                                  </Button>
                                ) : null}
                                {!readOnly ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1 px-2 font-sans text-xs font-medium"
                                    onClick={() => onDeleteExpBullet(i, j)}
                                    aria-label={t.deleteBullet}
                                  >
                                    <Trash2 className="size-3.5 shrink-0" aria-hidden />
                                    <span className="max-sm:sr-only">{t.deleteBullet}</span>
                                  </Button>
                                ) : null}
                                {!readOnly && changed ? (
                                  <ApprovalSwitch
                                    id={`approval-${key}`}
                                    checked={useImp}
                                    onCheckedChange={(v) => onApprovalChange(key, v)}
                                    label={t.useImproved}
                                  />
                                ) : null}
                              </div>
                            </div>
                            {readOnly ? (
                              <p
                                className={cn(
                                  readOnlyProse,
                                  'border-l-4 pl-3',
                                  changed && useImp
                                    ? 'border-emerald-700/80'
                                    : changed
                                      ? 'border-amber-600'
                                      : 'border-stone-300',
                                )}
                              >
                                {displayText}
                              </p>
                            ) : changed && !useImp ? (
                              <Textarea
                                value={orig}
                                onChange={(e) => patchExpBullet(i, j, 'original', e.target.value)}
                                className={cn(
                                  resumeTextarea,
                                  'rounded-lg border-l-4 border-amber-500 pl-3',
                                )}
                              />
                            ) : (
                              <Textarea
                                value={useImp ? imp || orig : orig || imp}
                                onChange={(e) =>
                                  useImp
                                    ? patchExpBullet(i, j, 'improved', e.target.value)
                                    : patchExpBullet(i, j, 'original', e.target.value)
                                }
                                className={cn(
                                  resumeTextarea,
                                  'rounded-lg pl-3',
                                  changed
                                    ? 'border-l-4 border-emerald-600'
                                    : 'border-l-4 border-stone-300',
                                )}
                              />
                            )}
                            {!readOnly && changed && useImp && orig.trim() ? (
                              <p className="text-muted-foreground mt-3 border-l-2 border-stone-200 pl-3 font-sans text-xs leading-relaxed italic">
                                <span className="font-semibold not-italic">{t.original}: </span>
                                {orig}
                              </p>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                    {!readOnly ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2 h-9 w-full max-w-md gap-1.5 border-dashed font-sans text-xs font-medium"
                        onClick={() => onAddExpBullet(i)}
                      >
                        <Plus className="size-3.5 shrink-0" aria-hidden />
                        {t.addBullet}
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
              {!readOnly ? (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-6 h-10 w-full gap-2 border-dashed font-sans text-sm font-medium"
                  onClick={onAddExperience}
                >
                  <Plus className="size-4 shrink-0" aria-hidden />
                  {t.addExperience}
                </Button>
              ) : null}
            </section>
          )}

          {(data.skills.improved.length > 0 ||
            data.skills.original.length > 0 ||
            data.skills.added.length > 0 ||
            !readOnly) && (
            <section className="mt-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-stone-900 pb-2">
                <h2 className="text-[12px] font-bold tracking-[0.18em] text-stone-900 uppercase">
                  {t.skills}
                </h2>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {showRevert ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 px-2 font-sans text-xs font-medium"
                      onClick={onRevertSkills}
                    >
                      {t.restoreBlock}
                    </Button>
                  ) : null}
                  {!readOnly ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 gap-1.5 border-dashed px-2.5 font-sans text-xs font-medium"
                        onClick={onAddSkillRow}
                      >
                        <Plus className="size-3.5 shrink-0" aria-hidden />
                        {t.addSkill}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 gap-1.5 border-dashed px-2.5 font-sans text-xs font-medium"
                        onClick={onAddSkillAdded}
                      >
                        <Plus className="size-3.5 shrink-0" aria-hidden />
                        {t.addSkillExtra}
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
              <ul className="space-y-2">
                {Array.from({
                  length: Math.max(data.skills.original.length, data.skills.improved.length),
                }).map((_, i) => {
                  const o = data.skills.original[i] ?? '';
                  const im = data.skills.improved[i] ?? '';
                  const useImp = approvals[`skill-${i}`] !== false;
                  const showVal = useImp ? im || o : o || im;
                  if (readOnly && !showVal.trim() && !o && !im) return null;
                  const changed = Boolean(o.trim() && im.trim() && o !== im);
                  return (
                    <li
                      key={`skill-${i}`}
                      className={cn(
                        'rounded-xl border p-3 font-sans',
                        changed ? 'border-emerald-200/80 bg-emerald-50/20' : 'border-stone-200/80',
                      )}
                    >
                      {readOnly ? (
                        <p className={readOnlyProse}>{showVal}</p>
                      ) : (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <Textarea
                            value={showVal}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (useImp) patchSkillImproved(i, v);
                              else {
                                const original = [...data.skills.original];
                                while (original.length <= i) original.push('');
                                original[i] = v;
                                onStructuredChange({
                                  ...data,
                                  skills: { ...data.skills, original },
                                });
                              }
                            }}
                            className={cn(resumeTextarea, 'min-h-[3rem] flex-1 rounded-lg')}
                          />
                          <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-stretch">
                            <Button
                              type="button"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 shrink-0 gap-1.5 px-2 font-sans text-xs font-medium"
                              onClick={() => onDeleteSkillRow(i)}
                            >
                              <Trash2 className="size-3.5 shrink-0" aria-hidden />
                              {t.deleteSkill}
                            </Button>
                            {changed ? (
                              <ApprovalSwitch
                                id={`skill-${i}`}
                                checked={useImp}
                                onCheckedChange={(v) => onApprovalChange(`skill-${i}`, v)}
                                label={t.useImproved}
                              />
                            ) : null}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
                {data.skills.added.map((s, i) => {
                  const key = `skill-added-${i}`;
                  const on = approvals[key] !== false;
                  return (
                    <li
                      key={key}
                      className="rounded-xl border border-sky-200/90 bg-sky-50/40 p-3 font-sans"
                    >
                      {readOnly ? (
                        on ? (
                          <p className={readOnlyProse}>
                            {s}
                            <span className="ml-2 text-[10px] font-semibold tracking-wide text-sky-900 uppercase">
                              ({t.newSkill})
                            </span>
                          </p>
                        ) : null
                      ) : (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <Textarea
                              value={s}
                              onChange={(e) => patchSkillAdded(i, e.target.value)}
                              className={cn(resumeTextarea, 'min-h-[3rem] rounded-lg')}
                            />
                            <span className="mt-1 inline-block text-[10px] font-semibold tracking-wide text-sky-900 uppercase">
                              ({t.newSkill})
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-stretch">
                            <Button
                              type="button"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 shrink-0 gap-1.5 px-2 font-sans text-xs font-medium"
                              onClick={() => onDeleteSkillAdded(i)}
                            >
                              <Trash2 className="size-3.5 shrink-0" aria-hidden />
                              {t.deleteSkill}
                            </Button>
                            <ApprovalSwitch
                              id={key}
                              checked={on}
                              onCheckedChange={(v) => onApprovalChange(key, v)}
                              label={language === 'en' ? 'Include' : 'Incluir'}
                            />
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {(data.education.length > 0 || !readOnly) && (
            <section className="mt-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-stone-900 pb-2">
                <h2 className="text-[12px] font-bold tracking-[0.18em] text-stone-900 uppercase">
                  {t.education}
                </h2>
                {showRevert ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 px-2 font-sans text-xs font-medium"
                    onClick={onRevertEducation}
                  >
                    {t.restoreBlock}
                  </Button>
                ) : null}
              </div>
              <ul className="space-y-4">
                {data.education.map((ed, i) => (
                  <li key={`education-${i}`}>
                    {readOnly ? (
                      <p className={readOnlyProse}>
                        <span className="font-semibold">{ed.degree}</span>
                        {ed.institution ? (
                          <span className="text-stone-800">, {ed.institution}</span>
                        ) : null}
                        {ed.period ? <span className="text-stone-600"> · {ed.period}</span> : null}
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                        <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-3">
                          <Input
                            value={ed.degree}
                            onChange={(e) => patchEducation(i, 'degree', e.target.value)}
                            className={cn(resumeInput, 'text-[14px] font-semibold')}
                          />
                          <Input
                            value={ed.institution}
                            onChange={(e) => patchEducation(i, 'institution', e.target.value)}
                            className={cn(resumeInput, 'text-[14px]')}
                          />
                          <Input
                            value={ed.period}
                            onChange={(e) => patchEducation(i, 'period', e.target.value)}
                            className={cn(resumeInput, 'font-sans text-sm')}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 shrink-0 gap-1.5 self-end px-2 font-sans text-xs font-medium sm:self-start"
                          onClick={() => onDeleteEducation(i)}
                        >
                          <Trash2 className="size-3.5 shrink-0" aria-hidden />
                          {t.deleteEducation}
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              {!readOnly ? (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 h-9 w-full max-w-md gap-1.5 border-dashed font-sans text-xs font-medium"
                  onClick={onAddEducation}
                >
                  <Plus className="size-3.5 shrink-0" aria-hidden />
                  {t.addEducation}
                </Button>
              ) : null}
            </section>
          )}

          {(data.languages.length > 0 || !readOnly) && (
            <section className="mt-8">
              <h2 className="text-foreground mb-3 border-b border-stone-900 pb-2 text-[12px] font-bold tracking-[0.18em] uppercase">
                {t.languages}
              </h2>
              {readOnly ? (
                <p className={readOnlyProse}>{data.languages.join(' · ')}</p>
              ) : (
                <Textarea
                  value={data.languages.join('\n')}
                  onChange={(e) => {
                    const langs = e.target.value
                      .split('\n')
                      .map((s) => s.trim())
                      .filter(Boolean);
                    onStructuredChange({ ...data, languages: langs });
                  }}
                  className={cn(resumeTextarea, 'min-h-[3.5rem] rounded-lg')}
                  placeholder={language === 'en' ? 'One per line' : 'Un idioma por línea'}
                />
              )}
            </section>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
