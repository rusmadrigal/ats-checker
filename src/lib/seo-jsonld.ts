import { SEO_AUTHOR, SEO_DESCRIPTION, SEO_SITE_NAME, SEO_TITLE } from './seo-defaults';
import { SITE_CANONICAL_HOME } from './site-canonical';

const organizationId = new URL('#organization', SITE_CANONICAL_HOME).href;
const webAppId = new URL('#webapplication', SITE_CANONICAL_HOME).href;
const webpageId = new URL('#webpage', SITE_CANONICAL_HOME).href;
const ogImageUrl = new URL('opengraph-image', SITE_CANONICAL_HOME).href;

/** JSON-LD principal (Schema.org) para la home. */
export function buildRootJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: SEO_AUTHOR.name,
        url: SITE_CANONICAL_HOME,
      },
      {
        '@type': 'WebApplication',
        '@id': webAppId,
        name: SEO_SITE_NAME,
        alternateName: SEO_TITLE,
        description: SEO_DESCRIPTION,
        url: SITE_CANONICAL_HOME,
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
        url: SITE_CANONICAL_HOME,
        name: SEO_TITLE,
        description: SEO_DESCRIPTION,
        inLanguage: 'es',
        isPartOf: { '@id': webAppId },
        about: { '@id': webAppId },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: ogImageUrl,
        },
      },
    ],
  };
}
