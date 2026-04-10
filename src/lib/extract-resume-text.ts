import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

const MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

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

export async function extractResumeText(buffer: Buffer, mime: string): Promise<string> {
  assertSize(buffer);
  assertAllowedMime(mime);

  if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const { value } = await mammoth.extractRawText({ buffer });
    return normalizeWhitespace(value);
  }

  const parser = new PDFParse({ data: buffer });
  try {
    const { text } = await parser.getText();
    return normalizeWhitespace(text);
  } finally {
    await parser.destroy();
  }
}
