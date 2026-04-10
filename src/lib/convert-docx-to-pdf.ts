import { execFile } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export type PdfConversionSource = 'gotenberg' | 'libreoffice' | 'none';

export async function convertDocxBufferToPdf(docx: Buffer): Promise<{
  pdf: Buffer;
  source: PdfConversionSource;
}> {
  const gotenbergUrl = process.env.GOTENBERG_URL?.trim();
  if (gotenbergUrl) {
    try {
      const pdf = await convertWithGotenberg(docx, gotenbergUrl);
      return { pdf, source: 'gotenberg' };
    } catch (e) {
      console.warn('[convert-docx-to-pdf] Gotenberg failed', e);
    }
  }

  const soffice = process.env.LIBREOFFICE_PATH?.trim() || 'soffice';
  try {
    const pdf = await convertWithLibreOffice(docx, soffice);
    return { pdf, source: 'libreoffice' };
  } catch (e) {
    console.warn('[convert-docx-to-pdf] LibreOffice failed', e);
    return { pdf: Buffer.alloc(0), source: 'none' };
  }
}

async function convertWithGotenberg(docx: Buffer, baseUrl: string): Promise<Buffer> {
  const url = `${baseUrl.replace(/\/$/, '')}/forms/libreoffice/convert`;
  const form = new FormData();
  const blob = new Blob([new Uint8Array(docx)], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  form.append('files', blob, 'document.docx');

  const res = await fetch(url, { method: 'POST', body: form });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Gotenberg ${res.status}: ${errText.slice(0, 200)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function convertWithLibreOffice(docx: Buffer, sofficePath: string): Promise<Buffer> {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'ats-cv-'));
  const inputPath = path.join(tmp, 'document.docx');
  await fs.writeFile(inputPath, docx);

  try {
    await execFileAsync(sofficePath, [
      '--headless',
      '--nologo',
      '--nofirststartwizard',
      '--convert-to',
      'pdf',
      '--outdir',
      tmp,
      inputPath,
    ]);
  } catch (e) {
    await fs.rm(tmp, { recursive: true, force: true });
    throw e;
  }

  const pdfPath = path.join(tmp, 'document.pdf');
  try {
    const pdf = await fs.readFile(pdfPath);
    return pdf;
  } finally {
    await fs.rm(tmp, { recursive: true, force: true });
  }
}
