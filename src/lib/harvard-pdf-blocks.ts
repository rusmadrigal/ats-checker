import type { CvApprovalMap, CvStructured } from './cv-structured-types';

export type HarvardPdfHeader = {
  name: string;
  title: string;
  contactLine: string;
};

export type HarvardPdfBlock =
  | { kind: 'summary'; text: string }
  | {
      kind: 'job';
      expIndex: number;
      headLine: string;
      title: string;
      location: string;
      bullets: string[];
    }
  | { kind: 'skills'; lines: string[] }
  | {
      kind: 'education';
      rows: { degree: string; institution: string; period: string }[];
    }
  | { kind: 'languages'; text: string }
  | { kind: 'extra'; title: string; content: string };

export function buildHarvardPdfExportModel(
  data: CvStructured,
  approvals: CvApprovalMap,
): { header: HarvardPdfHeader; blocks: HarvardPdfBlock[] } {
  const contactLine = [data.header.location, data.header.email].filter(Boolean).join(' | ');
  const header: HarvardPdfHeader = {
    name: data.header.name.trim(),
    title: data.header.title.trim(),
    contactLine,
  };

  const summaryText =
    approvals.summary === false && data.summary.original.trim()
      ? data.summary.original
      : data.summary.improved || data.summary.original;

  const blocks: HarvardPdfBlock[] = [];

  if (summaryText.trim()) {
    blocks.push({ kind: 'summary', text: summaryText.trim() });
  }

  data.experience.forEach((exp, i) => {
    const headLine = [exp.company.trim(), exp.period.trim()].filter(Boolean).join(' — ');
    const bullets: string[] = [];
    const n = Math.max(exp.original.length, exp.improved.length);
    for (let j = 0; j < n; j++) {
      const key = `exp-${i}-bullet-${j}`;
      const useImp = approvals[key] !== false;
      const orig = exp.original[j] ?? '';
      const imp = exp.improved[j] ?? '';
      const changed = orig.trim() !== imp.trim() && orig.trim().length > 0;
      const displayText =
        changed && !useImp ? orig || imp : useImp ? imp || orig : orig || imp;
      if (displayText.trim()) bullets.push(displayText.trim());
    }
    blocks.push({
      kind: 'job',
      expIndex: i,
      headLine,
      title: exp.title.trim(),
      location: exp.location.trim(),
      bullets,
    });
  });

  const skillLines: string[] = [];
  data.skills.improved.forEach((s, i) => {
    const useImp = approvals[`skill-${i}`] !== false;
    const raw = useImp ? s : (data.skills.original[i] ?? s);
    if (raw.trim()) skillLines.push(raw.trim());
  });
  data.skills.added.forEach((s, i) => {
    if (approvals[`skill-added-${i}`] !== false && s.trim()) skillLines.push(s.trim());
  });
  if (skillLines.length > 0) {
    blocks.push({ kind: 'skills', lines: skillLines });
  }

  if (data.education.length > 0) {
    blocks.push({
      kind: 'education',
      rows: data.education.map((ed) => ({
        degree: ed.degree.trim(),
        institution: ed.institution.trim(),
        period: ed.period.trim(),
      })),
    });
  }

  const langText = data.languages.filter(Boolean).join(' · ');
  if (langText) {
    blocks.push({ kind: 'languages', text: langText });
  }

  for (const sec of data.extraSections ?? []) {
    const t = sec.title.trim();
    const c = sec.content.trim();
    if (!t && !c) continue;
    blocks.push({ kind: 'extra', title: t, content: c });
  }

  return { header, blocks };
}
