import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = { width: 32, height: 32 };

export const contentType = 'image/png';

/** Favicon generado (pestaña del navegador, marcadores). */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #1e3a5f 0%, #0f172a 100%)',
          borderRadius: 6,
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: '#f8fafc',
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          CV
        </span>
      </div>
    ),
    { ...size },
  );
}
