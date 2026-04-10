import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AiRescoreError, rescoreResumeWithAi } from '@/src/lib/re-score-resume-ai';

export const runtime = 'nodejs';

const bodySchema = z.object({
  resumeText: z.string().min(20).max(28000),
  previousScore: z.number().int().min(0).max(100).optional(),
  sectionsOutline: z.string().max(4000).optional(),
});

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Cuerpo inválido: resumeText requerido (20–28000 caracteres).' },
        { status: 400 },
      );
    }

    const result = await rescoreResumeWithAi({
      resumeText: parsed.data.resumeText,
      previousScore: parsed.data.previousScore,
      sectionsOutline: parsed.data.sectionsOutline,
    });

    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof AiRescoreError) {
      return NextResponse.json({ error: e.message, code: 'AI_CONFIG' }, { status: 400 });
    }
    console.error('[re-score-resume]', e);
    return NextResponse.json(
      { error: 'No se pudo recalcular la puntuación. Inténtalo de nuevo.' },
      { status: 500 },
    );
  }
}
