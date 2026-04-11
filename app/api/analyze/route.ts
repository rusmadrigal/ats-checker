import '@/src/lib/install-dommatrix-polyfill';
import { analyzeResumeText } from '@/src/lib/analyze-resume-heuristics';
import { methodNotAllowedJson } from '@/src/lib/api-route-json';
import { AnalysisHttpError, extractResumeText } from '@/src/lib/extract-resume-text';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export function GET() {
  return methodNotAllowedJson();
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return Response.json({ error: 'Falta archivo' }, { status: 400 });
    }

    const mime = file.type;
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractResumeText(buffer, mime);
    const result = analyzeResumeText(text);

    return Response.json(result);
  } catch (error) {
    console.error('[api/analyze]', error);
    if (error instanceof AnalysisHttpError) {
      return Response.json({ error: error.message, code: error.code }, { status: error.status });
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
