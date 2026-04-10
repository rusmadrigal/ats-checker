/**
 * Genera `templates/cv-template.docx` con marcadores docxtemplater.
 * Ejecutar: pnpm run gen:templates (también corre en `pnpm run build`).
 *
 * Plantillas por sector (opcional): coloca `templates/cv-sector-tech.docx` (o health, etc.)
 * y el servidor la usará en lugar de `cv-template.docx` para ese sector.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';

const outDir = path.join(process.cwd(), 'templates');
const outFile = path.join(outDir, 'cv-template.docx');

const doc = new Document({
  sections: [
    {
      properties: {},
      children: [
        new Paragraph({
          heading: HeadingLevel.TITLE,
          children: [new TextRun({ text: '{docTitle}', bold: true })],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: '{docNote}',
              italics: true,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: '{sectorHint}',
              italics: true,
              color: '2F5496',
            }),
          ],
        }),
        new Paragraph({ children: [new TextRun(' ')] }),
        new Paragraph({ children: [new TextRun('{#lines}')] }),
        new Paragraph({ children: [new TextRun('{text}')] }),
        new Paragraph({ children: [new TextRun('{/lines}')] }),
      ],
    },
  ],
});

const buf = await Packer.toBuffer(doc);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, buf);
console.log('Wrote', outFile);
