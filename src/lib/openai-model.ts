/**
 * Modelo OpenAI por defecto: equilibrio entre latencia y precisión para CV/ATS.
 * Sobrescribe con OPENAI_MODEL en .env (p. ej. gpt-4o-mini para ahorrar, gpt-4.1 para más calidad).
 */
export function resolveOpenAiModelId(): string {
  const fromEnv = process.env.OPENAI_MODEL?.trim();
  if (fromEnv) return fromEnv;
  return 'gpt-4o';
}
