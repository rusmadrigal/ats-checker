import type { Metadata, Viewport } from 'next';
import '@/src/styles/index.css';
import { CookieConsent } from '@/src/app/components/CookieConsent';

export const metadata: Metadata = {
  title: 'ATS Resume Checker',
  description: 'Análisis de CV con IA para compatibilidad ATS y mejoras accionables.',
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
      <body className="overflow-x-hidden antialiased">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
