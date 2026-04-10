import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const PDF_PAGE_WIDTH = 595.28;
const PDF_PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const FONT_SIZE = 12;
const LINE_HEIGHT = 16;

/**
 * PDF de texto continuo (sin reproducción del diseño del CV original).
 */
export async function buildImprovedPdfBuffer(fullText: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const wrapParagraph = (paragraph: string): string[] => {
    if (!paragraph.trim()) return [''];
    const words = paragraph.split(/\s+/);
    const linesOut: string[] = [];
    let line = '';
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      const width = font.widthOfTextAtSize(test, FONT_SIZE);
      if (width > PDF_PAGE_WIDTH - 2 * MARGIN && line) {
        linesOut.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) linesOut.push(line);
    return linesOut;
  };

  const allLines = fullText.split('\n').flatMap((p) => wrapParagraph(p));

  let page = pdfDoc.addPage([PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT]);
  let y = PDF_PAGE_HEIGHT - MARGIN;

  for (const line of allLines) {
    if (y < MARGIN + LINE_HEIGHT) {
      page = pdfDoc.addPage([PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT]);
      y = PDF_PAGE_HEIGHT - MARGIN;
    }
    if (line.trim()) {
      page.drawText(line, {
        x: MARGIN,
        y,
        size: FONT_SIZE,
        font,
        color: rgb(0.1, 0.1, 0.12),
      });
    }
    y -= LINE_HEIGHT;
  }

  return pdfDoc.save();
}
