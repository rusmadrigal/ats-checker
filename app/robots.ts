import type { MetadataRoute } from 'next';
import { SITE_PUBLIC_ORIGIN } from '@/src/lib/site-canonical';

export default function robots(): MetadataRoute.Robots {
  const base = SITE_PUBLIC_ORIGIN;
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: new URL(base).host,
  };
}
