import { z } from 'zod';
import {
  apiJsonError,
  internalErrorJson,
  methodNotAllowedJson,
  parseJsonBody,
} from '@/src/lib/api-route-json';
import { AiRescoreError, rescoreResumeWithAi } from '@/src/lib/re-score-resume-ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const bodySchema = z.object({
  resumeText: z.string().min(8).max(28000),
  previousScore: z.number().int().min(0).max(100).optional(),
  sectionsOutline: z.string().max(4000).optional(),
});

export function GET() {
  return methodNotAllowedJson();
}

export async function POST(request: Request) {
  try {
    const parsedBody = await parseJsonBody(request);
    if (!parsedBody.ok) {
      return parsedBody.response;
    }

    const parsed = bodySchema.safeParse(parsedBody.data);
    if (!parsed.success) {
      return apiJsonError(400, 'Cuerpo inválido: resumeText requerido (8–28000 caracteres).');
    }

    const result = await rescoreResumeWithAi({
      resumeText: parsed.data.resumeText,
      previousScore: parsed.data.previousScore,
      sectionsOutline: parsed.data.sectionsOutline,
    });

    return Response.json(result);
  } catch (e) {
    console.error('[api/re-score-resume]', e);
    if (e instanceof AiRescoreError) {
      return Response.json({ error: e.message, code: 'AI_CONFIG' }, { status: 400 });
    }
    return internalErrorJson(e);
  }
}
