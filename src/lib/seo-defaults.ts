import { AUTHOR_PUBLIC_PROFILE_URL, SITE_CANONICAL_HOME } from './site-canonical';

/** Textos SEO centralizados (meta, Open Graph, Schema). */
export const SEO_TITLE =
  'ATS CV Checker en Español Gratis | Analiza y Mejora tu CV con IA';

export const SEO_DESCRIPTION =
  'Herramienta gratis para analizar tu CV con IA. Detecta problemas ATS, mejora tu currículum y aumenta tus oportunidades laborales con un formato profesional.';

export const SEO_SITE_NAME = 'ATS CV Checker';

export const SEO_LOCALE = 'es_ES';

export const SEO_AUTHOR = {
  name: 'Rus Madrigal',
  url: AUTHOR_PUBLIC_PROFILE_URL,
} as const;

export const SEO_KEYWORDS = [
  'ATS',
  'CV',
  'currículum',
  'analizador CV',
  'IA',
  'inteligencia artificial',
  'optimizar CV',
  'compatibilidad ATS',
  'gratis',
  'Español',
  'empleo',
  'recursos humanos',
] as const;

/** Base para resolver rutas relativas de metadatos (OG image, etc.). */
export const SEO_METADATA_BASE = new URL(SITE_CANONICAL_HOME);
