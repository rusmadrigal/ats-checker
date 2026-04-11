/**
 * Origen del ATS CV Checker (sin barra final), p. ej. https://ats.rusmadrigal.com
 * Override: `NEXT_PUBLIC_SITE_URL` en Vercel (sin barra final).
 */
export const SITE_PUBLIC_ORIGIN = (
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL?.trim()
    ? process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/$/, '')
    : 'https://ats.rusmadrigal.com'
) as string;

/**
 * URL canónica de la home con barra final (preferencia SEO explícita).
 * @see https://ats.rusmadrigal.com/
 */
export const SITE_CANONICAL_HOME = `${SITE_PUBLIC_ORIGIN}/`;

/** Alias histórico (mismo valor que SITE_CANONICAL_HOME). */
export const SITE_CANONICAL_HOME_ES = SITE_CANONICAL_HOME;

/** Perfil del autor (fuera del subdominio de la herramienta). */
export const AUTHOR_PUBLIC_PROFILE_URL = 'https://www.rusmadrigal.com/es' as const;

export function siteCanonicalPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_PUBLIC_ORIGIN}${normalized}`;
}
