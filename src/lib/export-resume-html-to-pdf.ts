/**
 * Client-side PDF from rendered resume HTML (matches on-screen preview layout).
 * Uses html2canvas + jsPDF with A4 multi-page slicing.
 */

function stripInteractiveChrome(root: HTMLElement) {
  root.querySelectorAll('button').forEach((b) => b.remove());
}

/** Replace form controls with plain text in the cloned DOM so capture matches visible content. */
function flattenFormFieldsInClone(root: HTMLElement) {
  const doc = root.ownerDocument;
  if (!doc) return;

  root.querySelectorAll('textarea').forEach((el) => {
    const ta = el as HTMLTextAreaElement;
    const div = doc.createElement('div');
    div.textContent = ta.value;
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordBreak = 'break-word';
    const cs = doc.defaultView?.getComputedStyle(ta);
    if (cs) {
      div.style.fontSize = cs.fontSize;
      div.style.fontFamily = cs.fontFamily;
      div.style.lineHeight = cs.lineHeight;
      div.style.color = cs.color;
    }
    ta.parentNode?.replaceChild(div, ta);
  });

  root.querySelectorAll('input').forEach((el) => {
    const input = el as HTMLInputElement;
    const span = doc.createElement('span');
    if (input.type === 'checkbox' || input.type === 'radio') {
      span.textContent = input.checked ? '·' : '';
    } else {
      span.textContent = input.value;
    }
    const cs = doc.defaultView?.getComputedStyle(input);
    if (cs) {
      span.style.fontSize = cs.fontSize;
      span.style.fontFamily = cs.fontFamily;
      span.style.color = cs.color;
    }
    input.parentNode?.replaceChild(span, input);
  });
}

export async function exportResumeHtmlToPdf(element: HTMLElement, filename: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    scrollX: 0,
    scrollY: 0,
    onclone: (_doc, cloned) => {
      const node = cloned as HTMLElement;
      node.style.transform = 'none';
      node.style.boxShadow = 'none';
      flattenFormFieldsInClone(node);
      stripInteractiveChrome(node);
    },
  });

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  const imgW = pageW;
  const pxPerMm = canvas.width / imgW;
  const pageH_px = pageH * pxPerMm;

  let yPx = 0;
  let firstPage = true;

  while (yPx < canvas.height) {
    if (!firstPage) pdf.addPage();
    firstPage = false;

    const sliceH = Math.min(pageH_px, canvas.height - yPx);
    const slice = document.createElement('canvas');
    slice.width = canvas.width;
    slice.height = sliceH;
    const ctx = slice.getContext('2d');
    if (!ctx) throw new Error('No se pudo crear el contexto 2D para el PDF.');
    ctx.drawImage(canvas, 0, yPx, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

    const imgData = slice.toDataURL('image/png');
    const sliceMmH = sliceH / pxPerMm;
    pdf.addImage(imgData, 'PNG', 0, 0, imgW, sliceMmH);
    yPx += sliceH;
  }

  pdf.save(filename);
}
