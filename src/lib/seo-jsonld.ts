import { SEO_AUTHOR, SEO_DESCRIPTION, SEO_SITE_NAME, SEO_TITLE } from './seo-defaults';
import { SITE_CANONICAL_HOME_ES, SITE_PUBLIC_ORIGIN } from './site-canonical';

const organizationId = `${SITE_PUBLIC_ORIGIN}/#organization`;
const webAppId = `${SITE_CANONICAL_HOME_ES}#webapplication`;
const webpageId = `${SITE_CANONICAL_HOME_ES}#webpage`;

/** JSON-LD principal (Schema.org) para la home. */
export function buildRootJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: SEO_AUTHOR.name,
        url: SITE_CANONICAL_HOME_ES,
      },
      {
        '@type': 'WebApplication',
        '@id': webAppId,
        name: SEO_SITE_NAME,
        alternateName: SEO_TITLE,
        description: SEO_DESCRIPTION,
        url: SITE_CANONICAL_HOME_ES,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requiere JavaScript. Navegador moderno.',
        inLanguage: 'es',
        isAccessibleForFree: true,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        author: {
          '@type': 'Person',
          name: SEO_AUTHOR.name,
          url: SEO_AUTHOR.url,
        },
        publisher: { '@id': organizationId },
      },
      {
        '@type': 'WebPage',
        '@id': webpageId,
        url: SITE_CANONICAL_HOME_ES,
        name: SEO_TITLE,
        description: SEO_DESCRIPTION,
        inLanguage: 'es',
        isPartOf: { '@id': webAppId },
        about: { '@id': webAppId },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: `${SITE_PUBLIC_ORIGIN}/opengraph-image`,
        },
      },
    ],
  };
}
