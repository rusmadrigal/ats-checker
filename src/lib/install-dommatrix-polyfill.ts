/**
 * pdfjs-dist usa DOMMatrix en entornos sin DOM (p. ej. Vercel Node).
 * Debe ejecutarse antes de importar el stack PDF (`pdfjs-dist`).
 */
import DOMMatrix from '@thednp/dommatrix';

const g = globalThis as any;

if (typeof g.DOMMatrix === 'undefined') {
  g.DOMMatrix = DOMMatrix as any;
}

export {};
