import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { NextConfig } from 'next';

const pkg = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
) as { version: string };

/** Cambia en cada deploy en Vercel (id de deployment o SHA); en local queda fijo. */
const deployStamp =
  process.env.VERCEL_DEPLOYMENT_ID?.replace(/^dpl_/, '').slice(-8) ??
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
  'local';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: `V.${pkg.version}-${deployStamp}`,
  },
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
