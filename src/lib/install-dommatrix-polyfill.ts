/**
 * pdf-parse (PDF.js) usa DOMMatrix en entornos sin DOM (p. ej. Vercel Node).
 * Debe ejecutarse antes de importar `pdf-parse` / `PDFParse`.
 */
import DOMMatrix from '@thednp/dommatrix';

const g = globalThis as typeof globalThis & { DOMMatrix?: typeof DOMMatrix };

if (typeof g.DOMMatrix === 'undefined') {
  g.DOMMatrix = DOMMatrix;
}
