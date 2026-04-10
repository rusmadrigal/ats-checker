import type { CvApprovalMap, CvStructured } from './cv-structured-types';

function bulletLine(text: string): string {
  const t = text.trim();
  if (!t) return '';
  return t.startsWith('•') || t.startsWith('-') ? t : `• ${t}`;
}

/**
 * Construye texto plano coherente con la plantilla DOCX (bloques y viñetas).
 */
export function buildPlaintextFromStructured(cv: CvStructured, approvals: CvApprovalMap): string {
  const lines: string[] = [];

  if (cv.header.name.trim()) lines.push(cv.header.name.trim());
  if (cv.header.title.trim()) lines.push(cv.header.title.trim());
  const contact = [cv.header.location.trim(), cv.header.email.trim()].filter(Boolean).join(' · ');
  if (contact) lines.push(contact);
  lines.push('');

  lines.push('PERFIL PROFESIONAL');
  const summaryOn = approvals.summary !== false;
  const summaryBody = summaryOn ? cv.summary.improved : cv.summary.original;
  if (summaryBody.trim()) lines.push(summaryBody.trim());
  lines.push('');

  if (cv.experience.length > 0) {
    lines.push('EXPERIENCIA PROFESIONAL');
    cv.experience.forEach((exp, i) => {
      const head = [exp.company.trim(), exp.period.trim()].filter(Boolean).join(' — ');
      if (head) lines.push(head);
      if (exp.title.trim()) lines.push(exp.title.trim());
      if (exp.location.trim()) lines.push(exp.location.trim());

      const n = Math.max(exp.original.length, exp.improved.length);
      for (let j = 0; j < n; j++) {
        const key = `exp-${i}-bullet-${j}`;
        const useImp = approvals[key] !== false;
        const raw = useImp
          ? (exp.improved[j] ?? exp.original[j] ?? '')
          : (exp.original[j] ?? exp.improved[j] ?? '');
        const bl = bulletLine(raw);
        if (bl) lines.push(bl);
      }
      lines.push('');
    });
  }

  const skillParts: string[] = [];
  cv.skills.improved.forEach((s, i) => {
    const useImp = approvals[`skill-${i}`] !== false;
    const raw = useImp ? s : (cv.skills.original[i] ?? s);
    if (raw.trim()) skillParts.push(raw.trim());
  });
  cv.skills.added.forEach((s, i) => {
    if (approvals[`skill-added-${i}`] !== false && s.trim()) skillParts.push(s.trim());
  });
  if (skillParts.length > 0) {
    lines.push('COMPETENCIAS');
    lines.push(skillParts.join(', '));
    lines.push('');
  }

  if (cv.education.length > 0) {
    lines.push('FORMACIÓN');
    cv.education.forEach((ed) => {
      const row = [ed.degree.trim(), ed.institution.trim(), ed.period.trim()]
        .filter(Boolean)
        .join(' · ');
      if (row) lines.push(bulletLine(row));
    });
    lines.push('');
  }

  if (cv.languages.length > 0) {
    lines.push('IDIOMAS');
    cv.languages.forEach((lang) => {
      if (lang.trim()) lines.push(bulletLine(lang.trim()));
    });
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
