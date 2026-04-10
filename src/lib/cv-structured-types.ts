import { z } from 'zod';

export const cvStructuredMetaSchema = z.object({
  layout: z.string().describe('Ej. two-column'),
  style: z.string().describe('Ej. modern, harvard'),
  font: z.string(),
  accentColor: z.string(),
});

export const cvHeaderSchema = z.object({
  name: z.string(),
  title: z.string(),
  location: z.string(),
  email: z.string(),
});

export const cvSummarySchema = z.object({
  original: z.string(),
  improved: z.string(),
  changes: z.array(z.string()),
});

export const cvExperienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string(),
  period: z.string(),
  original: z.array(z.string()),
  improved: z.array(z.string()),
  changes: z.array(z.string()),
});

export const cvSkillsSchema = z.object({
  original: z.array(z.string()),
  improved: z.array(z.string()),
  added: z.array(z.string()),
});

export const cvEducationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  period: z.string(),
});

export const cvAtsSchema = z.object({
  scoreBefore: z.number().int().min(0).max(100),
  scoreAfter: z.number().int().min(0).max(100),
  improvements: z.array(z.string()),
});

export const cvStructuredSchema = z.object({
  meta: cvStructuredMetaSchema,
  header: cvHeaderSchema,
  summary: cvSummarySchema,
  experience: z.array(cvExperienceSchema),
  skills: cvSkillsSchema,
  education: z.array(cvEducationSchema),
  languages: z.array(z.string()),
  ats: cvAtsSchema,
});

export type CvStructured = z.infer<typeof cvStructuredSchema>;

/** Cuerpo JSON opcional del cliente para export DOCX Harvard estructurado. */
export const structuredExportPayloadSchema = z.object({
  structured: cvStructuredSchema,
  approvals: z.record(z.string(), z.boolean()),
});

export type StructuredExportPayload = z.infer<typeof structuredExportPayloadSchema>;

export type CvExperienceEntry = CvStructured['experience'][number];
export type CvEducationEntry = CvStructured['education'][number];

export function createEmptyExperienceEntry(): CvExperienceEntry {
  return {
    title: '',
    company: '',
    location: '',
    period: '',
    original: [''],
    improved: [''],
    changes: [],
  };
}

export function createEmptyEducationEntry(): CvEducationEntry {
  return { degree: '', institution: '', period: '' };
}

export type CvApprovalMap = Record<string, boolean>;

export function defaultApprovalsForCv(cv: CvStructured): CvApprovalMap {
  const m: CvApprovalMap = {};
  m.summary = true;
  cv.experience.forEach((exp, i) => {
    const n = Math.max(exp.original.length, exp.improved.length);
    for (let j = 0; j < n; j++) {
      m[`exp-${i}-bullet-${j}`] = true;
    }
  });
  cv.skills.improved.forEach((_, i) => {
    m[`skill-${i}`] = true;
  });
  cv.skills.added.forEach((_, i) => {
    m[`skill-added-${i}`] = true;
  });
  return m;
}

const EXP_BULLET_KEY = /^exp-(\d+)-bullet-(\d+)$/;

/** Tras borrar un bloque de experiencia, reindexa claves `exp-i-bullet-j` en aprobaciones. */
export function remapApprovalsAfterExperienceDelete(
  approvals: CvApprovalMap,
  deletedIndex: number,
): CvApprovalMap {
  const next: CvApprovalMap = {};
  for (const [k, v] of Object.entries(approvals)) {
    const m = EXP_BULLET_KEY.exec(k);
    if (m) {
      const ei = Number(m[1]);
      const bi = Number(m[2]);
      if (ei === deletedIndex) continue;
      const newEi = ei > deletedIndex ? ei - 1 : ei;
      next[`exp-${newEi}-bullet-${bi}`] = v;
    } else {
      next[k] = v;
    }
  }
  return next;
}

/** Tras borrar una viñeta, reindexa las claves de ese bloque de experiencia. */
export function remapApprovalsAfterBulletDelete(
  approvals: CvApprovalMap,
  expIndex: number,
  deletedBulletIndex: number,
): CvApprovalMap {
  const next: CvApprovalMap = {};
  for (const [k, v] of Object.entries(approvals)) {
    const m = EXP_BULLET_KEY.exec(k);
    if (m) {
      const ei = Number(m[1]);
      const bi = Number(m[2]);
      if (ei !== expIndex) {
        next[k] = v;
        continue;
      }
      if (bi === deletedBulletIndex) continue;
      const newBi = bi > deletedBulletIndex ? bi - 1 : bi;
      next[`exp-${ei}-bullet-${newBi}`] = v;
    } else {
      next[k] = v;
    }
  }
  return next;
}

const SKILL_KEY = /^skill-(\d+)$/;

export function remapApprovalsAfterSkillRowDelete(
  approvals: CvApprovalMap,
  deletedIndex: number,
): CvApprovalMap {
  const next: CvApprovalMap = {};
  for (const [k, v] of Object.entries(approvals)) {
    const m = SKILL_KEY.exec(k);
    if (m) {
      const i = Number(m[1]);
      if (i === deletedIndex) continue;
      const newI = i > deletedIndex ? i - 1 : i;
      next[`skill-${newI}`] = v;
    } else {
      next[k] = v;
    }
  }
  return next;
}

const SKILL_ADDED_KEY = /^skill-added-(\d+)$/;

export function remapApprovalsAfterSkillAddedDelete(
  approvals: CvApprovalMap,
  deletedIndex: number,
): CvApprovalMap {
  const next: CvApprovalMap = {};
  for (const [k, v] of Object.entries(approvals)) {
    const m = SKILL_ADDED_KEY.exec(k);
    if (m) {
      const i = Number(m[1]);
      if (i === deletedIndex) continue;
      const newI = i > deletedIndex ? i - 1 : i;
      next[`skill-added-${newI}`] = v;
    } else {
      next[k] = v;
    }
  }
  return next;
}
