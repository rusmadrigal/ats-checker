import { ImageResponse } from 'next/og';
import { SEO_SITE_NAME } from '@/src/lib/seo-defaults';

export const runtime = 'edge';

export const size = { width: 180, height: 180 };

export const contentType = 'image/png';

/** Icono para “Añadir a pantalla de inicio” / Apple. */
export default function AppleIcon() {
  const line =
    SEO_SITE_NAME.length > 18 ? `${SEO_SITE_NAME.slice(0, 16)}…` : SEO_SITE_NAME;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          background: 'linear-gradient(160deg, #1e3a5f 0%, #0f172a 55%, #172554 100%)',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 22,
            background: 'rgba(255,255,255,0.14)',
            border: '2px solid rgba(255,255,255,0.28)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            fontWeight: 800,
            color: '#f8fafc',
            letterSpacing: '-0.05em',
          }}
        >
          CV
        </div>
        <span
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#e2e8f0',
            textAlign: 'center',
            padding: '0 16px',
            lineHeight: 1.2,
          }}
        >
          {line}
        </span>
      </div>
    ),
    { ...size },
  );
}
