import { z } from 'zod';
import {
  apiJsonError,
  internalErrorJson,
  methodNotAllowedJson,
  parseJsonBody,
} from '@/src/lib/api-route-json';
import { cvStructuredInputSchema } from '@/src/lib/cv-structured-types';
import { fixCvIssuesWithAi } from '@/src/lib/fix-cv-issues-ai';
import { AiImprovementError } from '@/src/lib/improve-text-ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const bodySchema = z.object({
  structured: cvStructuredInputSchema,
  issues: z.array(z.string()).min(1).max(40),
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
      return apiJsonError(400, 'Cuerpo inválido: structured e issues requeridos.');
    }

    const structured = await fixCvIssuesWithAi({
      structured: parsed.data.structured,
      issues: parsed.data.issues,
    });

    return Response.json({ structured });
  } catch (e) {
    console.error('[api/fix-cv-issues]', e);
    if (e instanceof AiImprovementError) {
      return Response.json({ error: e.message, code: 'AI_CONFIG' }, { status: 400 });
    }
    return internalErrorJson(e);
  }
}
