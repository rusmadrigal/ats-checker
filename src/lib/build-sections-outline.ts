import type { CvStructured } from './cv-structured-types';

/** Compact outline for AI re-scoring (not shown in UI). */
export function buildSectionsOutline(cv: CvStructured): string {
  try {
    return JSON.stringify({
      style: cv.meta.style,
      header: {
        name: cv.header.name.trim().length > 0,
        title: cv.header.title.trim().length > 0,
        location: cv.header.location.trim().length > 0,
        email: cv.header.email.trim().length > 0,
      },
      summaryChars: cv.summary.improved.length,
      experience: cv.experience.map((e) => ({
        company: e.company.trim().slice(0, 80),
        title: e.title.trim().slice(0, 80),
        bullets: Math.max(e.improved.length, e.original.length),
      })),
      skillsCount: cv.skills.improved.length + cv.skills.added.length,
      educationCount: cv.education.length,
      languagesCount: cv.languages.filter((l) => l.trim()).length,
    });
  } catch {
    return '';
  }
}
