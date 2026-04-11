/**
 * URL absoluta para llamar a las rutas API desde el navegador.
 *
 * Si la web pública está en un dominio (p. ej. rusmadrigal.com) pero Next+Vercel
 * vive en otro, `fetch('/api/...')` pega al dominio equivocado y devuelve HTML
 * (404 / página principal) → `Unexpected token '<'`.
 *
 * Producción: la app vive en https://ats.rusmadrigal.com/ y las rutas `/api/*` son el mismo origen.
 * Solo necesitas esta variable si sirves el front en un dominio distinto al de la API, p. ej.
 * `NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app`
 */
export function clientApiUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? '').trim().replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (!base) return normalized;
  return `${base}${normalized}`;
}
