import { analyzeResumeText } from '@/src/lib/analyze-resume-heuristics';
import {
  apiJsonError,
  internalErrorJson,
  methodNotAllowedJson,
} from '@/src/lib/api-route-json';
import { AnalysisHttpError, extractResumeText } from '@/src/lib/extract-resume-text';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export function GET() {
  return methodNotAllowedJson();
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get('file');

    if (!file || !(file instanceof File)) {
      return apiJsonError(400, 'Falta el archivo en el campo "file".');
    }

    const mime = file.type;
    const buffer = Buffer.from(await file.arrayBuffer());

    const text = await extractResumeText(buffer, mime);
    const result = analyzeResumeText(text);

    return Response.json(result);
  } catch (e) {
    console.error('[api/analyze]', e);
    if (e instanceof AnalysisHttpError) {
      return Response.json({ error: e.message, code: e.code }, { status: e.status });
    }
    return internalErrorJson(e);
  }
}
