import {
  apiJsonError,
  internalErrorJson,
  methodNotAllowedJson,
} from '@/src/lib/api-route-json';
import { improveCvStructuredWithAi } from '@/src/lib/cv-structured-improve';
import { AnalysisHttpError, extractResumeText } from '@/src/lib/extract-resume-text';
import { AiImprovementError } from '@/src/lib/improve-text-ai';

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

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractResumeText(buffer, file.type);
    const structured = await improveCvStructuredWithAi({ extractedText: text });

    return Response.json({ structured });
  } catch (e) {
    console.error('[api/improve-preview]', e);
    if (e instanceof AnalysisHttpError) {
      return Response.json({ error: e.message, code: e.code }, { status: e.status });
    }
    if (e instanceof AiImprovementError) {
      return Response.json({ error: e.message, code: 'AI_CONFIG' }, { status: 400 });
    }
    return internalErrorJson(e);
  }
}
