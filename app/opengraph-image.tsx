import { ImageResponse } from 'next/og';
import { SEO_DESCRIPTION, SEO_SITE_NAME } from '@/src/lib/seo-defaults';

export const runtime = 'edge';

export const alt = `${SEO_SITE_NAME} — analiza y mejora tu CV con IA`;

export const size = { width: 1200, height: 630 };

export const contentType = 'image/png';

export default function OpenGraphImage() {
  const subtitle =
    SEO_DESCRIPTION.length > 160 ? `${SEO_DESCRIPTION.slice(0, 157)}…` : SEO_DESCRIPTION;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 64,
          background: 'linear-gradient(145deg, #0f172a 0%, #1e3a5f 45%, #0f172a 100%)',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 700,
              color: '#e2e8f0',
            }}
          >
            CV
          </div>
          <span
            style={{
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'rgba(226,232,240,0.85)',
            }}
          >
            Gratis · Español · IA
          </span>
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 1.08,
            color: '#f8fafc',
            letterSpacing: '-0.03em',
            maxWidth: 1000,
          }}
        >
          {SEO_SITE_NAME}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            fontWeight: 500,
            lineHeight: 1.35,
            color: 'rgba(226,232,240,0.92)',
            maxWidth: 980,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 40,
            fontSize: 20,
            color: 'rgba(148,163,184,0.95)',
            fontWeight: 500,
          }}
        >
          rusmadrigal.com
        </div>
      </div>
    ),
    { ...size },
  );
}
