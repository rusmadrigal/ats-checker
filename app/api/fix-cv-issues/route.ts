import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cvStructuredSchema } from '@/src/lib/cv-structured-types';
import { fixCvIssuesWithAi } from '@/src/lib/fix-cv-issues-ai';
import { AiImprovementError } from '@/src/lib/improve-text-ai';

export const runtime = 'nodejs';

const bodySchema = z.object({
  structured: cvStructuredSchema,
  issues: z.array(z.string()).min(1).max(40),
});

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Cuerpo inválido: structured e issues requeridos.' },
        { status: 400 },
      );
    }

    const structured = await fixCvIssuesWithAi({
      structured: parsed.data.structured,
      issues: parsed.data.issues,
    });

    return NextResponse.json({ structured });
  } catch (e) {
    if (e instanceof AiImprovementError) {
      return NextResponse.json({ error: e.message, code: 'AI_CONFIG' }, { status: 400 });
    }
    console.error('[fix-cv-issues]', e);
    return NextResponse.json(
      { error: 'No se pudo corregir el CV con IA. Inténtalo de nuevo.' },
      { status: 500 },
    );
  }
}
