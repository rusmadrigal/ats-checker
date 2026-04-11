import type { MetadataRoute } from 'next';
import { SITE_CANONICAL_HOME_ES, siteCanonicalPath } from '@/src/lib/site-canonical';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: SITE_CANONICAL_HOME_ES,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: siteCanonicalPath('/privacidad'),
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.35,
    },
    {
      url: siteCanonicalPath('/cookies'),
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.35,
    },
    {
      url: siteCanonicalPath('/aviso-legal'),
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.35,
    },
  ];
}
