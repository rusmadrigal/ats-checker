/**
 * Parsea JSON de una Response; si el cuerpo es HTML (error de proxy o 404), lanza error claro.
 */
export async function readJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    throw new Error(`Respuesta vacía del servidor (HTTP ${res.status}).`);
  }
  const ct = res.headers.get('content-type');
  const trimmed = text.trimStart();
  const looksJson =
    Boolean(ct?.includes('application/json')) || trimmed.startsWith('{') || trimmed.startsWith('[');
  if (!looksJson && trimmed.startsWith('<')) {
    const hint =
      'El servidor devolvió HTML en lugar de JSON. Suele indicar que /api no llega a este proyecto Next. ' +
      'En producción la app está en https://ats.rusmadrigal.com/ (mismo origen que /api). ' +
      'Si usas otro dominio para el front, define NEXT_PUBLIC_APP_URL con la URL del despliegue Next.';
    throw new Error(`${hint} (HTTP ${res.status})`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Respuesta no válida como JSON (HTTP ${res.status}). ${text.slice(0, 160).replace(/\s+/g, ' ')}`,
    );
  }
}
