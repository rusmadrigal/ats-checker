import { buildRootJsonLd } from '@/src/lib/seo-jsonld';

/** Schema.org JSON-LD para la home (inyectado en el documento). */
export function RootJsonLd() {
  const json = buildRootJsonLd();
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
