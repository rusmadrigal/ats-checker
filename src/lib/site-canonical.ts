/** Origen público del dominio (canonicals y enlaces absolutos SEO). */
export const SITE_PUBLIC_ORIGIN = 'https://www.rusmadrigal.com' as const;

/** Canonical de la home en español, según configuración SEO. */
export const SITE_CANONICAL_HOME_ES = `${SITE_PUBLIC_ORIGIN}/es` as const;

export function siteCanonicalPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_PUBLIC_ORIGIN}${normalized}`;
}
