import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    'pdf-parse',
    'pdfjs-dist',
    'mammoth',
    'docxtemplater',
    'pizzip',
    'pdf-lib',
  ],
};

export default nextConfig;
