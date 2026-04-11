'use client';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { createRoot } from 'react-dom/client';
import { HarvardPdfPages } from '@/src/app/components/HarvardPdfPages';
import type { CvApprovalMap, CvStructured } from '@/src/lib/cv-structured-types';

const PDF_PAGE_W_PX = 794;
const PDF_PAGE_H_PX = 1123;
const CAPTURE_SCALE = 2;

async function waitForRender(): Promise<void> {
  await new Promise<void>((r) => requestAnimationFrame(() => r()));
  await new Promise<void>((r) => setTimeout(r, 120));
}

/**
 * Une el lienzo capturado en franjas de altura ~una hoja A4 (px) para jsPDF.
 * No depende de secciones: solo de la altura total del DOM.
 */
function sliceCanvasToPdfPages(source: HTMLCanvasElement, cssTotalHeight: number): Blob {
  const pxPerCssY = source.height / Math.max(cssTotalHeight, 1);
  const sliceCanvasH = Math.ceil(PDF_PAGE_H_PX * pxPerCssY);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [PDF_PAGE_W_PX, PDF_PAGE_H_PX],
  });

  let yCanvas = 0;
  let pageIndex = 0;

  while (yCanvas < source.height) {
    const hRaw = Math.min(sliceCanvasH, source.height - yCanvas);
    const tile = document.createElement('canvas');
    tile.width = source.width;
    tile.height = sliceCanvasH;
    const ctx = tile.getContext('2d');
    if (!ctx) break;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tile.width, tile.height);
    ctx.drawImage(source, 0, yCanvas, source.width, hRaw, 0, 0, source.width, hRaw);

    const img = tile.toDataURL('image/png', 1.0);
    if (pageIndex > 0) {
      pdf.addPage([PDF_PAGE_W_PX, PDF_PAGE_H_PX], 'portrait');
    }
    pdf.addImage(img, 'PNG', 0, 0, PDF_PAGE_W_PX, PDF_PAGE_H_PX);
    yCanvas += hRaw;
    pageIndex += 1;
  }

  return pdf.output('blob');
}

/**
 * Export Harvard ATS PDF: un `#pdf-root`, un `.resume` continuo, una captura html2canvas,
 * varias páginas PDF solo por altura A4 (no por sección).
 */
export async function exportStructuredHarvardPdfToBlob(
  structured: CvStructured,
  approvals: CvApprovalMap,
): Promise<Blob> {
  document.getElementById('pdf-root')?.remove();

  const pdfRoot = document.createElement('div');
  pdfRoot.id = 'pdf-root';
  pdfRoot.setAttribute('aria-hidden', 'true');
  pdfRoot.style.cssText =
    'position:fixed;left:-9999px;top:0;width:794px;background:white;z-index:-1;';
  document.body.appendChild(pdfRoot);

  const root = createRoot(pdfRoot);
  root.render(<HarvardPdfPages data={structured} approvals={approvals} />);

  await document.fonts.ready.catch(() => undefined);
  await waitForRender();

  const resumeEl = pdfRoot.querySelector<HTMLElement>('.resume');
  if (!resumeEl) {
    root.unmount();
    pdfRoot.remove();
    throw new Error('No resume container found for PDF export.');
  }

  const cssW = resumeEl.offsetWidth;
  const cssH = Math.max(resumeEl.offsetHeight, resumeEl.scrollHeight);

  const canvas = await html2canvas(resumeEl, {
    scale: CAPTURE_SCALE,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: cssW,
    height: cssH,
    windowWidth: cssW,
    windowHeight: cssH,
  });

  const blob = sliceCanvasToPdfPages(canvas, Math.max(cssH, 1));
  root.unmount();
  pdfRoot.remove();
  return blob;
}
