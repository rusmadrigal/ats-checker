import type { Metadata } from 'next';
import '@/src/styles/index.css';

export const metadata: Metadata = {
  title: 'ATS Resume Checker',
  description: 'Análisis de CV con IA para compatibilidad ATS y mejoras accionables.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
