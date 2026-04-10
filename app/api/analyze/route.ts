import { NextResponse } from 'next/server';
import { analyzeResumeText } from '@/src/lib/analyze-resume-heuristics';
import { AnalysisHttpError, extractResumeText } from '@/src/lib/extract-resume-text';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Falta el archivo en el campo "file".' }, { status: 400 });
    }

    const mime = file.type;
    const buffer = Buffer.from(await file.arrayBuffer());

    const text = await extractResumeText(buffer, mime);
    const result = analyzeResumeText(text);

    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof AnalysisHttpError) {
      return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
    }
    console.error('[analyze]', e);
    return NextResponse.json(
      { error: 'No se pudo analizar el archivo. Prueba con otro PDF o DOCX.' },
      { status: 500 },
    );
  }
}
