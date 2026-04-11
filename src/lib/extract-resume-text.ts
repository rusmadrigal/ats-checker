import '@/src/lib/install-dommatrix-polyfill';
import mammoth from 'mammoth';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const nodeRequire = createRequire(import.meta.url);
let pdfWorkerSrcInitialized = false;

/**
 * Fake worker path uses `import(workerSrc)`. In the Vercel bundle, the default
 * `pdf.worker.js` path does not exist; point at the installed `.mjs` worker instead.
 */
function ensurePdfWorkerSrc(): void {
  if (pdfWorkerSrcInitialized) return;
  const workerPath = nodeRequire.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs');
  pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;
  pdfWorkerSrcInitialized = true;
}

export function assertAllowedMime(mime: string): void {
  if (!ALLOWED.has(mime)) {
    throw new AnalysisHttpError(400, 'FORMATO_NO_SOPORTADO', 'Solo se admiten PDF o DOCX.');
  }
}

export function assertSize(buffer: Buffer): void {
  if (buffer.length > MAX_BYTES) {
    throw new AnalysisHttpError(
      413,
      'ARCHIVO_DEMASIADO_GRANDE',
      'El archivo supera el límite de 10 MB.',
    );
  }
}

export class AnalysisHttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AnalysisHttpError';
  }
}

function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[\t\f\v]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  ensurePdfWorkerSrc();

  const pdf = await pdfjsLib
    .getDocument({
      data: new Uint8Array(buffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    })
    .promise;

  let text = '';
  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text +=
        content.items.map((item) => ('str' in item ? item.str : '')).join(' ') + '\n';
    }
  } finally {
    await pdf.destroy();
  }

  return text;
}

export async function extractResumeText(buffer: Buffer, mime: string): Promise<string> {
  assertSize(buffer);
  assertAllowedMime(mime);

  if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const { value } = await mammoth.extractRawText({ buffer });
    return normalizeWhitespace(value);
  }

  const raw = await extractPdfText(buffer);
  return normalizeWhitespace(raw);
}
