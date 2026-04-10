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
