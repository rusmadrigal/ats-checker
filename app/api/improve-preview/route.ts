import { NextResponse } from 'next/server';
import { improveCvStructuredWithAi } from '@/src/lib/cv-structured-improve';
import { AnalysisHttpError, extractResumeText } from '@/src/lib/extract-resume-text';
import { AiImprovementError } from '@/src/lib/improve-text-ai';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Falta el archivo en el campo "file".' },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractResumeText(buffer, file.type);
    const structured = await improveCvStructuredWithAi({ extractedText: text });

    return NextResponse.json({ structured });
  } catch (e) {
    if (e instanceof AnalysisHttpError) {
      return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
    }
    if (e instanceof AiImprovementError) {
      return NextResponse.json({ error: e.message, code: 'AI_CONFIG' }, { status: 400 });
    }
    console.error('[improve-preview]', e);
    return NextResponse.json(
      { error: 'No se pudo generar la vista previa. Prueba de nuevo o revisa la clave de OpenAI.' },
      { status: 500 },
    );
  }
}
