import * as fs from 'node:fs';
import * as path from 'node:path';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { buildImprovedDocxBuffer } from './build-improved-docx';
import type { SectorId } from './sector-meta';

function resolveTemplatePath(sector: SectorId): string {
  const root = process.cwd();
  const sectorFile = path.join(root, 'templates', `cv-sector-${sector}.docx`);
  if (sector !== 'default' && fs.existsSync(sectorFile)) {
    return sectorFile;
  }
  return path.join(root, 'templates', 'cv-template.docx');
}

export type TemplateRenderInput = {
  docTitle: string;
  docNote: string;
  sectorHint: string;
  bodyLines: string[];
};

export async function renderCvTemplateDocx(
  input: TemplateRenderInput,
  sector: SectorId,
): Promise<Buffer> {
  const templatePath = resolveTemplatePath(sector);
  if (!fs.existsSync(templatePath)) {
    const body = [input.docTitle, '', input.docNote, '', input.sectorHint, '', ...input.bodyLines]
      .join('\n')
      .replace(/\u00a0/g, '')
      .trim();
    return buildImprovedDocxBuffer(body);
  }

  const content = fs.readFileSync(templatePath);
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  const lines = input.bodyLines.map((line) => ({
    text: line.length > 0 ? line : ' ',
  }));

  doc.setData({
    docTitle: input.docTitle,
    docNote: input.docNote,
    sectorHint: input.sectorHint.trim() || '\u00a0',
    lines,
  });
  doc.render();

  return doc.getZip().generate({ type: 'nodebuffer' }) as Buffer;
}
