import type { Metadata, Viewport } from 'next';
import '@/src/styles/index.css';
import { CookieConsent } from '@/src/app/components/CookieConsent';
import {
  SEO_AUTHOR,
  SEO_DESCRIPTION,
  SEO_KEYWORDS,
  SEO_LOCALE,
  SEO_METADATA_BASE,
  SEO_SITE_NAME,
  SEO_TITLE,
} from '@/src/lib/seo-defaults';
import { SITE_CANONICAL_HOME } from '@/src/lib/site-canonical';

export const metadata: Metadata = {
  metadataBase: SEO_METADATA_BASE,
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  applicationName: SEO_SITE_NAME,
  authors: [{ name: SEO_AUTHOR.name, url: SEO_AUTHOR.url }],
  creator: SEO_AUTHOR.name,
  publisher: SEO_AUTHOR.name,
  keywords: [...SEO_KEYWORDS],
  category: 'technology',
  alternates: {
    canonical: SITE_CANONICAL_HOME,
    languages: {
      'es-ES': SITE_CANONICAL_HOME,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: SEO_LOCALE,
    url: SITE_CANONICAL_HOME,
    siteName: SEO_SITE_NAME,
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    title: SEO_SITE_NAME,
    capable: true,
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="overflow-x-clip antialiased">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
