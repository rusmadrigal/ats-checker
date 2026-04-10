import { NextResponse } from 'next/server';
import { analyzeResumeText } from '@/src/lib/analyze-resume-heuristics';
import { buildImprovedPdfBuffer } from '@/src/lib/build-improved-pdf';
import { convertDocxBufferToPdf } from '@/src/lib/convert-docx-to-pdf';
import { renderCvTemplateDocx } from '@/src/lib/docx-template-render';
import { AnalysisHttpError, extractResumeText } from '@/src/lib/extract-resume-text';
import { AiImprovementError, improveCvTextWithAi } from '@/src/lib/improve-text-ai';
import { mergeImprovedText } from '@/src/lib/merge-improved-text';
import { getSectorPresentation, parseSector } from '@/src/lib/sector-meta';

export const runtime = 'nodejs';

function safeFilenameBase(name: string): string {
  const withoutExt = name.replace(/\.[^/.]+$/, '');
  const ascii = withoutExt
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\w\-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return ascii.slice(0, 80) || 'cv';
}

function truthyForm(value: FormDataEntryValue | null): boolean {
  return value === 'true' || value === '1' || value === 'on';
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get('file');
    const formatRaw = form.get('format');
    const format = formatRaw === 'pdf' ? 'pdf' : 'docx';
    const useAi = truthyForm(form.get('useAi'));
    const sector = parseSector(form.get('sector'));

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Falta el archivo en el campo "file".' },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractResumeText(buffer, file.type);
    const analysis = analyzeResumeText(text);

    const improvedTextOverride = form.get('improvedText');
    let improved: string;
    if (typeof improvedTextOverride === 'string' && improvedTextOverride.trim().length > 40) {
      improved = improvedTextOverride.trim();
    } else if (useAi) {
      improved = await improveCvTextWithAi({
        extractedText: text,
        issues: analysis.issues,
        suggestions: analysis.suggestions,
      });
    } else {
      improved = mergeImprovedText(text, analysis.suggestions);
    }

    const presentation = getSectorPresentation(sector);
    const bodyLines = improved.split('\n');

    const docxBuffer = await renderCvTemplateDocx(
      {
        docTitle: presentation.docTitle,
        docNote: presentation.docNote,
        sectorHint: presentation.sectorHint,
        bodyLines,
      },
      sector,
    );

    const base = safeFilenameBase(file.name);

    if (format === 'docx') {
      return new NextResponse(new Uint8Array(docxBuffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${base}_mejorado.docx"`,
        },
      });
    }

    const { pdf, source } = await convertDocxBufferToPdf(docxBuffer);
    if (source !== 'none' && pdf.length > 0) {
      return new NextResponse(new Uint8Array(pdf), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${base}_mejorado.pdf"`,
          'X-Ats-Pdf-Source': source,
        },
      });
    }

    const fallbackPdf = await buildImprovedPdfBuffer(improved);
    return new NextResponse(Buffer.from(fallbackPdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${base}_mejorado.pdf"`,
        'X-Ats-Pdf-Source': 'plaintext-fallback',
      },
    });
  } catch (e) {
    if (e instanceof AnalysisHttpError) {
      return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
    }
    if (e instanceof AiImprovementError) {
      return NextResponse.json({ error: e.message, code: 'AI_CONFIG' }, { status: 400 });
    }
    console.error('[export-improved]', e);
    return NextResponse.json(
      { error: 'No se pudo generar el archivo. Prueba con otro PDF o DOCX.' },
      { status: 500 },
    );
  }
}
