/**
 * Respuestas JSON consistentes para rutas API (evita HTML de error de Next en producción).
 */

export function apiJsonError(
  status: number,
  message: string,
  extra?: Record<string, string | number | boolean | null | undefined>,
): Response {
  const body: Record<string, unknown> = { error: message };
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v !== undefined && v !== null) body[k] = v;
    }
  }
  return Response.json(body, { status });
}

/** Lee y parsea JSON del body; nunca lanza por JSON malformado. */
export async function parseJsonBody(request: Request): Promise<
  | { ok: true; data: unknown }
  | { ok: false; response: Response }
> {
  try {
    const text = await request.text();
    if (!text.trim()) {
      return { ok: false, response: apiJsonError(400, 'Cuerpo vacío: se esperaba JSON.') };
    }
    const data = JSON.parse(text) as unknown;
    return { ok: true, data };
  } catch {
    return { ok: false, response: apiJsonError(400, 'JSON inválido o mal formado.') };
  }
}

export function methodNotAllowedJson(): Response {
  return apiJsonError(405, 'Método no permitido. Usa POST.');
}

export function internalErrorJson(e: unknown): Response {
  const message =
    e instanceof Error ? e.message : 'Error interno del servidor. Inténtalo de nuevo.';
  return apiJsonError(500, message);
}
