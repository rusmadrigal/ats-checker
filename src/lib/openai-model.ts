/**
 * Modelo OpenAI por defecto: equilibrio entre latencia y precisión para CV/ATS.
 * Sobrescribe con OPENAI_MODEL en .env (p. ej. gpt-4o-mini para ahorrar, gpt-4.1 para más calidad).
 *
 * Debe ser un id que exista en la API de OpenAI para tu cuenta (p. ej. gpt-4o, gpt-4o-mini, gpt-4.1).
 * Valores inventados (p. ej. gpt-5.3) devuelven error de la API, no fallo de clave.
 */
export function resolveOpenAiModelId(): string {
  const fromEnv = process.env.OPENAI_MODEL?.trim();
  if (fromEnv) return fromEnv;
  return 'gpt-4o';
}

function stringifyUnknownError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as { message: unknown }).message);
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

/**
 * Mensaje legible cuando falla generateObject / chat (modelo inválido, clave, rate limit, etc.).
 */
export function openAiFailureUserMessage(err: unknown, modelId: string): string {
  const raw = stringifyUnknownError(err);
  const lower = raw.toLowerCase();

  if (
    lower.includes('incorrect api key') ||
    lower.includes('invalid_api_key') ||
    lower.includes('invalid api key') ||
    (lower.includes('401') && lower.includes('unauthorized'))
  ) {
    return 'OpenAI rechazó OPENAI_API_KEY (incorrecta, revocada o sin permisos). Revisa .env.local.';
  }

  if (
    lower.includes('does not exist') ||
    lower.includes('model_not_found') ||
    lower.includes('invalid model') ||
    lower.includes('unknown model') ||
    (lower.includes('model') &&
      (lower.includes('not found') || lower.includes('does not') || lower.includes('invalid')))
  ) {
    return `El modelo "${modelId}" no es válido o tu cuenta no tiene acceso. Corrige OPENAI_MODEL en .env.local (por ejemplo gpt-4o o gpt-4o-mini). Detalle: ${raw.slice(0, 380)}`;
  }

  if (
    lower.includes('rate limit') ||
    lower.includes('429') ||
    lower.includes('too many requests')
  ) {
    return `Límite de uso de OpenAI (rate limit). Prueba más tarde. ${raw.slice(0, 220)}`;
  }

  if (lower.includes('insufficient_quota') || lower.includes('billing')) {
    return `Cuota o facturación de OpenAI: revisa el panel de uso y facturación. ${raw.slice(0, 220)}`;
  }

  return `Error al llamar a OpenAI con el modelo "${modelId}". ${raw.slice(0, 420)}`;
}
