import {
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TextRun,
  sectionMarginDefaults,
  sectionPageSizeDefaults,
} from 'docx';
import type { CvApprovalMap, CvStructured } from './cv-structured-types';

function bulletLine(text: string): string {
  const t = text.trim();
  if (!t) return '';
  return t.startsWith('•') || t.startsWith('-') ? t : `• ${t}`;
}

/** Tamaños en medios puntos (Word): cuerpo ~13pt, sección ~16pt, nombre ~28pt */
const SZ_NAME = 56;
const SZ_SECTION = 32;
const SZ_BODY = 26;

function pBody(text: string, opts?: { bold?: boolean; keepNext?: boolean }): Paragraph {
  return new Paragraph({
    spacing: { after: 48, line: 312 },
    keepNext: opts?.keepNext,
    children: [
      new TextRun({
        text: text.length > 0 ? text : ' ',
        size: SZ_BODY,
        bold: opts?.bold,
        font: 'Calibri',
      }),
    ],
  });
}

function pSectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 220, after: 100 },
    keepNext: true,
    keepLines: true,
    border: {
      bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
    },
    children: [
      new TextRun({
        text,
        bold: true,
        size: SZ_SECTION,
        font: 'Calibri',
      }),
    ],
  });
}

/**
 * DOCX Harvard de una columna, sin tablas, alineado con la vista previa ATS.
 */
export async function buildHarvardDocxFromStructured(
  cv: CvStructured,
  approvals: CvApprovalMap,
): Promise<Buffer> {
  const children: Paragraph[] = [];

  if (cv.header.name.trim()) {
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: cv.header.name.trim(),
            bold: true,
            size: SZ_NAME,
            font: 'Calibri',
          }),
        ],
      }),
    );
  }

  if (cv.header.title.trim()) {
    children.push(pBody(cv.header.title.trim()));
  }

  const contact = [cv.header.location.trim(), cv.header.email.trim()].filter(Boolean).join(' | ');
  if (contact) {
    children.push(pBody(contact));
  }

  children.push(
    new Paragraph({
      spacing: { after: 120 },
      border: {
        bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
      },
      children: [new TextRun({ text: ' ', size: SZ_BODY })],
    }),
  );

  const summaryOn = approvals.summary !== false;
  const summaryBody = summaryOn ? cv.summary.improved : cv.summary.original;
  if (summaryBody.trim()) {
    children.push(pSectionHeading('SUMMARY'));
    children.push(pBody(summaryBody.trim()));
  }

  if (cv.experience.length > 0) {
    children.push(pSectionHeading('EXPERIENCE'));
    cv.experience.forEach((exp, i) => {
      const head = [exp.company.trim(), exp.period.trim()].filter(Boolean).join(' — ');
      if (head) {
        children.push(
          new Paragraph({
            spacing: { after: 48 },
            keepNext: true,
            keepLines: true,
            children: [
              new TextRun({
                text: head,
                bold: true,
                size: SZ_BODY,
                font: 'Calibri',
              }),
            ],
          }),
        );
      }
      if (exp.title.trim()) {
        children.push(
          new Paragraph({
            spacing: { after: 28 },
            keepNext: Boolean(exp.location.trim()),
            children: [
              new TextRun({ text: exp.title.trim(), size: SZ_BODY, font: 'Calibri' }),
            ],
          }),
        );
      }
      if (exp.location.trim()) {
        children.push(
          new Paragraph({
            spacing: { after: 72 },
            children: [
              new TextRun({
                text: exp.location.trim(),
                size: SZ_BODY,
                font: 'Calibri',
                italics: true,
              }),
            ],
          }),
        );
      }

      const n = Math.max(exp.original.length, exp.improved.length);
      for (let j = 0; j < n; j++) {
        const key = `exp-${i}-bullet-${j}`;
        const useImp = approvals[key] !== false;
        const raw = useImp
          ? (exp.improved[j] ?? exp.original[j] ?? '')
          : (exp.original[j] ?? exp.improved[j] ?? '');
        const line = bulletLine(raw);
        if (line) {
          children.push(
            new Paragraph({
              spacing: { after: 28 },
              indent: { left: 400, hanging: 400 },
              children: [
                new TextRun({ text: line, size: SZ_BODY, font: 'Calibri' }),
              ],
            }),
          );
        }
      }
      children.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun(' ')] }));
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
    children.push(pSectionHeading('SKILLS'));
    skillParts.forEach((line) => {
      children.push(
        new Paragraph({
          spacing: { after: 48 },
          indent: { left: 400, hanging: 400 },
          children: [new TextRun({ text: bulletLine(line), size: SZ_BODY, font: 'Calibri' })],
        }),
      );
    });
  }

  if (cv.education.length > 0) {
    children.push(pSectionHeading('EDUCATION'));
    cv.education.forEach((ed) => {
      const row = [ed.degree.trim(), ed.institution.trim(), ed.period.trim()]
        .filter(Boolean)
        .join(' · ');
      if (row) {
        children.push(
          new Paragraph({
            spacing: { after: 80 },
            keepLines: true,
            children: [
              new TextRun({
                text: row,
                size: SZ_BODY,
                bold: true,
                font: 'Calibri',
              }),
            ],
          }),
        );
      }
    });
  }

  if (cv.languages.length > 0) {
    const langs = cv.languages.map((l) => l.trim()).filter(Boolean);
    if (langs.length > 0) {
      children.push(pSectionHeading('LANGUAGES'));
      children.push(pBody(langs.join(' · ')));
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: sectionPageSizeDefaults.WIDTH,
              height: sectionPageSizeDefaults.HEIGHT,
              orientation: sectionPageSizeDefaults.ORIENTATION,
            },
            margin: {
              top: sectionMarginDefaults.TOP,
              right: sectionMarginDefaults.RIGHT,
              bottom: sectionMarginDefaults.BOTTOM,
              left: sectionMarginDefaults.LEFT,
              header: sectionMarginDefaults.HEADER,
              footer: sectionMarginDefaults.FOOTER,
              gutter: sectionMarginDefaults.GUTTER,
            },
          },
        },
        children,
      },
    ],
  });

  const buf = await Packer.toBuffer(doc);
  return Buffer.from(buf);
}
