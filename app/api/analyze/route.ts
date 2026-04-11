import '@/src/lib/install-dommatrix-polyfill';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { analyzeResumeText } from '@/src/lib/analyze-resume-heuristics';
import { methodNotAllowedJson } from '@/src/lib/api-route-json';
import { AnalysisHttpError, extractResumeText } from '@/src/lib/extract-resume-text';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function assertPathString(label: string, value: unknown): asserts value is string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new AnalysisHttpError(
      400,
      'RUTA_INVALIDA',
      `${label} debe ser una cadena de texto no vacía (tipo recibido: ${typeof value}).`,
    );
  }
}

export function GET() {
  return methodNotAllowedJson();
}

export async function POST(req: Request) {
  let tempPath: string | undefined;
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return Response.json({ error: 'Falta archivo' }, { status: 400 });
    }

    const originalName =
      typeof file.name === 'string' && file.name.trim() ? file.name : 'upload.pdf';
    assertPathString('Nombre de archivo', originalName);

    const ext = path.extname(originalName) || '.pdf';

    const tmpBase = os.tmpdir();
    assertPathString('Directorio temporal', tmpBase);

    tempPath = path.join(tmpBase, `${crypto.randomUUID()}${ext}`);
    assertPathString('Ruta temporal completa', tempPath);

    console.log('[api/analyze] debug', {
      fileName: file?.name,
      fileNameType: typeof file?.name,
      fileSize: file?.size,
      fileSizeType: typeof file?.size,
      tempPath,
      tempPathType: typeof tempPath,
    });

    const bytes = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(tempPath, bytes);

    const mime = typeof file.type === 'string' && file.type.trim() ? file.type : 'application/octet-stream';
    const text = await extractResumeText(bytes, mime);
    const result = analyzeResumeText(text);

    return Response.json(result);
  } catch (error) {
    console.error('[api/analyze]', error);
    if (error instanceof AnalysisHttpError) {
      return Response.json({ error: error.message, code: error.code }, { status: error.status });
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (tempPath !== undefined) {
      assertPathString('Ruta temporal (cleanup)', tempPath);
      await fs.unlink(tempPath).catch(() => {});
    }
  }
}
