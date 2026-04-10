/** Patrones alineados con el análisis heurístico del CV (contacto visible). */

export const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
export const PHONE_RE =
  /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{2,6}/;
export const LINKEDIN_RE = /linkedin\.com(\/in\/[\w-]+)?/i;
export const URL_RE = /https?:\/\/[^\s]+/i;

/** Teléfono, LinkedIn o URL explícita en un fragmento (p. ej. ubicación + email). */
export function hasSecondaryContactChannel(snippet: string): boolean {
  const s = snippet.trim();
  if (!s) return false;
  return PHONE_RE.test(s) || LINKEDIN_RE.test(s) || URL_RE.test(s);
}
